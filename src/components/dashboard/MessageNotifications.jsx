import { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, Clock, MessageSquare, X, ArrowRight } from 'lucide-react';
import { chatApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

const AGENDA_GROUPS = {
  MINHA: 'Minha Agenda',
  ATENDIMENTOS: 'Atendimentos',
  REUNIOES: 'Reuniões',
};

function formatAgendaDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((d - today) / (1000 * 60 * 60 * 24));
  const label = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  if (diff === 0) return 'Hoje, ' + label;
  if (diff === 1) return 'Amanhã, ' + label;
  return label;
}

function formatAgendaTime(startTime, endTime) {
  const s = startTime ? String(startTime).slice(0, 5) : null;
  const e = endTime ? String(endTime).slice(0, 5) : null;
  if (s && e) return `${s} às ${e}`;
  if (s) return s;
  return 'Horário a definir';
}

function formatMsgText(msg) {
  if (!msg) return '';

  const text = msg.messageText;

  if (text) return text;

  const type = msg.messageType || '';

  if (type === 'imageMessage') return 'Foto';
  if (type === 'videoMessage') return 'Vídeo';
  if (type === 'audioMessage') return 'Áudio';
  if (type === 'documentMessage') return 'Documento';
  if (type === 'stickerMessage') return 'Figurinha';
  if (type === 'locationMessage') return 'Localização';
  if (type === 'contactMessage') return 'Contato';

  return 'Nova mensagem';
}

let notifId = 0;

export default function MessageNotifications({
  activeView,
  onNavigate,
}) {
  const [notifications, setNotifications] = useState([]);

  const sseRef = useRef(null);
  const activeViewRef = useRef(activeView);

  const { user } = useAuth();
  const instanceName = user?.instanceName;

  useEffect(() => {
    activeViewRef.current = activeView;
  }, [activeView]);

  const dismiss = useCallback((id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  useEffect(() => {
    if (!instanceName) return;

    if (sseRef.current) {
      sseRef.current.close();
    }

    const es = chatApi.connectSSE(instanceName, (event, data) => {
      if (event === 'agenda.created') {
        const ev = data?.event;
        if (!ev) return;

        const id = ++notifId;

        setNotifications((prev) => [
          ...prev,
          {
            id,
            kind: 'agenda',
            title: ev.title || 'Novo compromisso',
            date: ev.date,
            startTime: ev.startTime,
            endTime: ev.endTime,
            group: ev.group,
            clientName: ev.clientName,
            timestamp: Date.now(),
          },
        ]);

        window.dispatchEvent(new Event('zelt:agenda-changed'));

        setTimeout(() => {
          setNotifications((prev) =>
            prev.filter((notification) => notification.id !== id)
          );
        }, 8000);
        return;
      }

      if (event !== 'message.upsert') return;

      const msg = data.message;

      if (!msg || msg.fromMe) return;

      if (activeViewRef.current === 'atendimentos/chat') {
        return;
      }

      const id = ++notifId;

      const senderName =
        msg.pushName ||
        data.contact?.pushName ||
        'Cliente';

      const contactName =
        data.contact?.customName ||
        senderName;

      const body = formatMsgText(msg);

      const profilePic =
        data.contact?.profilePicUrl || null;

      setNotifications((prev) => [
        ...prev,
        {
          id,
          kind: 'message',
          senderName: contactName,
          body,
          remoteJid: msg.remoteJid,
          profilePic,
          timestamp: Date.now(),
        },
      ]);

      setTimeout(() => {
        setNotifications((prev) =>
          prev.filter((notification) => notification.id !== id)
        );
      }, 7000);
    });

    sseRef.current = es;

    return () => {
      es.close();
    };
  }, [instanceName]);

  const goToChat = (id) => {
    dismiss(id);
    onNavigate?.('atendimentos/chat');
  };

  const goToAgenda = (id) => {
    dismiss(id);
    onNavigate?.('operacoes/agenda');
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <>
      <div
        className="
          fixed
          top-20
          right-5
          sm:right-6
          z-50
          flex
          flex-col
          gap-2.5
          pointer-events-none
          w-[calc(100vw-40px)]
          sm:w-[380px]
        "
      >
        {notifications.map((notification) => {
          const initials = (
            notification.senderName || '?'
          )
            .split(' ')
            .map((word) => word[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();

          if (notification.kind === 'agenda') {
            const groupLabel =
              AGENDA_GROUPS[notification.group] || 'Minha Agenda';

            return (
              <div
                key={notification.id}
                className="
                  pointer-events-auto
                  relative
                  overflow-hidden
                  bg-white
                  dark:bg-[#151515]
                  border
                  border-[#e9e9e9]
                  dark:border-[#292929]
                  rounded-xl
                  animate-[notificationIn_240ms_ease-out]
                "
              >
                {/* Indicador lateral */}
                <div
                  className="
                    absolute
                    left-0
                    top-0
                    bottom-0
                    w-[3px]
                    bg-[var(--zelt-primary)]
                  "
                />

                <div className="p-4 pl-[18px]">

                  {/* Header */}
                  <div className="flex items-start gap-3">

                    {/* Ícone calendário */}
                    <div
                      className="
                        relative
                        shrink-0
                        w-10
                        h-10
                        rounded-full
                        flex
                        items-center
                        justify-center
                        bg-[#f1edff]
                        dark:bg-[#251c3d]
                        text-[var(--zelt-primary)]
                        border
                        border-[#e4ddff]
                        dark:border-[#332552]
                      "
                    >
                      <Calendar size={17} strokeWidth={1.8} />
                    </div>

                    {/* Título */}
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex items-center gap-2">
                        <p
                          className="
                            text-[13px]
                            font-semibold
                            text-[#161616]
                            dark:text-white
                            truncate
                          "
                        >
                          {notification.title}
                        </p>

                        <span
                          className="
                            shrink-0
                            text-[10px]
                            font-medium
                            text-[var(--zelt-primary)]
                          "
                        >
                          AGENDADO
                        </span>
                      </div>

                      <p
                        className="
                          mt-0.5
                          text-[11px]
                          text-[#999]
                          dark:text-[#777]
                        "
                      >
                        {formatAgendaDate(notification.date)}
                      </p>
                    </div>

                    {/* Close */}
                    <button
                      type="button"
                      onClick={() => dismiss(notification.id)}
                      aria-label="Fechar notificação"
                      className="
                        shrink-0
                        p-1
                        -mt-1
                        -mr-1
                        text-[#aaa]
                        hover:text-[#555]
                        dark:text-[#666]
                        dark:hover:text-[#aaa]
                        transition-colors
                      "
                    >
                      <X size={15} strokeWidth={1.8} />
                    </button>
                  </div>

                  {/* Detalhes */}
                  <div className="mt-3 flex items-start gap-2">

                    <Clock className="mt-[2px] shrink-0 text-[var(--zelt-primary)]" size={14} strokeWidth={1.8} />

                    <div className="min-w-0 flex-1">
                      <p
                        className="
                          text-[13px]
                          leading-5
                          text-[#444]
                          dark:text-[#c7c7c7]
                          break-words
                        "
                      >
                        {formatAgendaTime(notification.startTime, notification.endTime)}
                      </p>

                      <p
                        className="
                          mt-1
                          text-[11px]
                          leading-4
                          text-[#999]
                          dark:text-[#777]
                          break-words
                        "
                      >
                        {notification.clientName
                          ? `Cliente: ${notification.clientName}`
                          : groupLabel}
                      </p>
                    </div>
                  </div>

                  {/* Action */}
                  <button
                    type="button"
                    onClick={() => goToAgenda(notification.id)}
                    className="
                      group
                      mt-3.5
                      w-full
                      h-9
                      px-3
                      flex
                      items-center
                      justify-center
                      gap-2
                      rounded-lg
                      border
                      border-[#e8e8e8]
                      dark:border-[#303030]
                      bg-transparent
                      hover:bg-[#f7f7f7]
                      dark:hover:bg-[#202020]
                      text-[#333]
                      dark:text-[#ddd]
                      text-[12px]
                      font-medium
                      transition-colors
                    "
                  >
                    <span>Ver agenda</span>

                    <ArrowRight
                      size={14}
                      strokeWidth={1.8}
                      className="
                        transition-transform
                        duration-150
                        group-hover:translate-x-0.5
                      "
                    />
                  </button>

                </div>
              </div>
            );
          }

          return (
            <div
              key={notification.id}
              className="
                pointer-events-auto
                relative
                overflow-hidden
                bg-white
                dark:bg-[#151515]
                border
                border-[#e9e9e9]
                dark:border-[#292929]
                rounded-xl
                animate-[notificationIn_240ms_ease-out]
              "
            >
              {/* Indicador lateral */}
              <div
                className="
                  absolute
                  left-0
                  top-0
                  bottom-0
                  w-[3px]
                  bg-[var(--zelt-primary)]
                "
              />

              <div className="p-4 pl-[18px]">

                {/* Header */}
                <div className="flex items-start gap-3">

                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {notification.profilePic ? (
                      <img
                        src={notification.profilePic}
                        alt=""
                        className="
                          w-10
                          h-10
                          rounded-full
                          object-cover
                          border
                          border-[#eeeeee]
                          dark:border-[#292929]
                        "
                      />
                    ) : (
                      <div
                        className="
                          w-10
                          h-10
                          rounded-full
                          flex
                          items-center
                          justify-center
                          bg-[#f1edff]
                          dark:bg-[#251c3d]
                          text-[var(--zelt-primary)]
                          text-xs
                          font-semibold
                        "
                      >
                        {initials}
                      </div>
                    )}

                    {/* Online / unread indicator */}
                    <span
                      className="
                        absolute
                        right-0
                        bottom-0
                        w-2.5
                        h-2.5
                        rounded-full
                        bg-[var(--zelt-primary)]
                        border-2
                        border-white
                        dark:border-[#151515]
                      "
                    />
                  </div>

                  {/* Sender */}
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-center gap-2">

                      <p
                        className="
                          text-[13px]
                          font-semibold
                          text-[#161616]
                          dark:text-white
                          truncate
                        "
                      >
                        {notification.senderName}
                      </p>

                      <span
                        className="
                          shrink-0
                          text-[10px]
                          font-medium
                          text-[var(--zelt-primary)]
                        "
                      >
                        NOVA
                      </span>

                    </div>

                    <p
                      className="
                        mt-0.5
                        text-[11px]
                        text-[#999]
                        dark:text-[#777]
                      "
                    >
                      Nova mensagem
                    </p>
                  </div>

                  {/* Close */}
                  <button
                    type="button"
                    onClick={() => dismiss(notification.id)}
                    aria-label="Fechar notificação"
                    className="
                      shrink-0
                      p-1
                      -mt-1
                      -mr-1
                      text-[#aaa]
                      hover:text-[#555]
                      dark:text-[#666]
                      dark:hover:text-[#aaa]
                      transition-colors
                    "
                  >
                    <X size={15} strokeWidth={1.8} />
                  </button>
                </div>

                {/* Message */}
                <div className="mt-3 flex items-start gap-2">

                  <MessageSquare
                    size={14}
                    strokeWidth={1.8}
                    className="
                      mt-[2px]
                      shrink-0
                      text-[var(--zelt-primary)]
                    "
                  />

                  <p
                    className="
                      text-[13px]
                      leading-5
                      text-[#444]
                      dark:text-[#c7c7c7]
                      line-clamp-2
                      break-words
                    "
                  >
                    {notification.body}
                  </p>

                </div>

                {/* Action */}
                <button
                  type="button"
                  onClick={() => goToChat(notification.id)}
                  className="
                    group
                    mt-3.5
                    w-full
                    h-9
                    px-3
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    border
                    border-[#e8e8e8]
                    dark:border-[#303030]
                    bg-transparent
                    hover:bg-[#f7f7f7]
                    dark:hover:bg-[#202020]
                    text-[#333]
                    dark:text-[#ddd]
                    text-[12px]
                    font-medium
                    transition-colors
                  "
                >
                  <span>Ver conversa</span>

                  <ArrowRight
                    size={14}
                    strokeWidth={1.8}
                    className="
                      transition-transform
                      duration-150
                      group-hover:translate-x-0.5
                    "
                  />
                </button>

              </div>
            </div>
          );
        })}
      </div>

      <style>
        {`
          @keyframes notificationIn {
            from {
              opacity: 0;
              transform: translateX(12px);
            }

            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}
      </style>
    </>
  );
}
