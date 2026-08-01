import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, X, ArrowRight } from 'lucide-react';
import { chatApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

function formatMsgText(msg) {
  if (!msg) return '';
  const text = msg.messageText;
  if (text) return text;
  const type = msg.messageType || '';
  if (type === 'imageMessage') return 'Foto';
  if (type === 'videoMessage') return 'Video';
  if (type === 'audioMessage') return 'Audio';
  if (type === 'documentMessage') return 'Documento';
  if (type === 'stickerMessage') return 'Figurinha';
  if (type === 'locationMessage') return 'Localizacao';
  if (type === 'contactMessage') return 'Contato';
  return '(media)';
}

let notifId = 0;

export default function MessageNotifications({ activeView, onNavigate }) {
  const [notifications, setNotifications] = useState([]);
  const sseRef = useRef(null);
  const activeViewRef = useRef(activeView);

  const { workspace } = useAuth();
  const instanceName = workspace?.instanceName;

  useEffect(() => { activeViewRef.current = activeView; }, [activeView]);

  const dismiss = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  useEffect(() => {
    if (!instanceName) return;
    if (sseRef.current) sseRef.current.close();

    const es = chatApi.connectSSE(instanceName, (event, data) => {
      if (event !== 'message.upsert') return;
      const msg = data.message;
      if (msg.fromMe) return;
      if (activeViewRef.current === 'atendimentos/chat') return;

      const id = ++notifId;
      const senderName = msg.pushName || data.contact?.pushName || 'Cliente';
      const contactName = data.contact?.customName || senderName;
      const body = formatMsgText(msg);
      const profilePic = data.contact?.profilePicUrl || null;

      setNotifications(prev => [...prev, { id, senderName: contactName, body, remoteJid: msg.remoteJid, profilePic, timestamp: Date.now() }]);

      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 7000);
    });

    sseRef.current = es;
    return () => es.close();
  }, [instanceName]);

  const goToChat = (id) => {
    dismiss(id);
    onNavigate?.('atendimentos/chat');
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col gap-3 pointer-events-none" style={{ width: 380 }}>
      {notifications.map(n => {
        const initials = (n.senderName || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
        return (
          <div key={n.id}
            className="pointer-events-auto bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#232323] rounded-2xl shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12),0_2px_8px_-2px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.5),0_2px_8px_-2px_rgba(0,0,0,0.3)] overflow-hidden"
            style={{ animation: 'slideIn 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
            <div className="h-[3px] bg-gradient-to-r from-[#25D366] via-[#128C7E] to-[#075E54]" />
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="relative shrink-0">
                  {n.profilePic ? (
                    <img src={n.profilePic} alt="" className="w-11 h-11 rounded-full object-cover" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">{initials}</span>
                    </div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#25D366] border-2 border-white dark:border-[#1a1a1a] flex items-center justify-center">
                    <MessageSquare size={8} className="text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-[#ededed] truncate">{n.senderName}</h4>
                    <button onClick={() => dismiss(n.id)}
                      className="text-gray-300 dark:text-[#555] hover:text-gray-500 dark:hover:text-[#aaa] p-0.5 shrink-0 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-[#808080] leading-relaxed line-clamp-2">{n.body}</p>
                </div>
              </div>
              <button onClick={() => goToChat(n.id)}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--zelt-primary)] hover:opacity-90 text-white text-xs font-medium transition-all duration-150 hover:shadow-md active:scale-[0.98]">
                Ir para conversa
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        );
      })}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(24px) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
