import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare, Users, Zap, TrendingUp, ArrowUpRight,
  MessageCircle, FileSpreadsheet, CalendarCheck, Folder,
  ClipboardCheck, RefreshCw,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { dashboardApi } from '../../lib/api';

const STATUS = {
  pendente: { label: 'Aguardando resposta', cls: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' },
  em_andamento: { label: 'Em andamento', cls: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' },
};

const WEEK_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const initials = (name) =>
  (name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

function dayLabel(dayStr) {
  const d = new Date(`${dayStr}T12:00:00`);
  return WEEK_LABELS[d.getDay()];
}

function formatFullDate(dayStr) {
  const d = new Date(`${dayStr}T12:00:00`);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function formatDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.08] rounded px-3.5 py-2.5">
        <p className="text-[10px] text-gray-400 dark:text-[#666] mb-0.5">{payload[0]?.payload?.full || label}</p>
        <p className="text-[13px] text-gray-900 dark:text-[#ededed]">{prefix}{payload[0].value}{suffix}</p>
      </div>
    );
  }
  return null;
};

const cardCls =
  'bg-white dark:bg-[#141414] rounded border border-gray-200 dark:border-white/[0.08]';

export default function Dashboard({ onNavigate }) {
  const [period, setPeriod] = useState('Semana');
  const [summaryIdx, setSummaryIdx] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = () => {
    setLoading(true);
    setError('');
    dashboardApi.stats()
      .then((res) => setStats(res))
      .catch((err) => setError(err.message || 'Erro ao carregar estatisticas'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStats();
  }, []);

  const summaryCards = useMemo(() => {
    if (!stats) return [];
    return [
      {
        label: 'Clientes Cadastrados',
        value: stats.contacts || 0,
        hint: `${stats.messagesWeek ?? 0} mensagens / 7d`,
        icon: Users,
        color: '#7C3AED',
        bg: '#f5f3ff',
      },
      {
        label: 'Atendimentos Hoje',
        value: stats.chatsToday || 0,
        hint: `${stats.messagesToday ?? 0} mensagens hoje`,
        icon: Zap,
        color: '#10B981',
        bg: '#ecfdf5',
      },
      {
        label: 'Conversas na Semana',
        value: stats.chatsWeek || 0,
        hint: `${stats.contacts ?? 0} clientes cadastrados`,
        icon: MessageSquare,
        color: '#3B82F6',
        bg: '#eff6ff',
      },
    ];
  }, [stats]);

  const quickCards = useMemo(() => {
    if (!stats) return [];
    return [
      {
        label: 'Agenda Hoje',
        value: stats.agenda?.today ?? 0,
        hint: `${stats.agenda?.thisWeek ?? 0} esta semana`,
        icon: CalendarCheck,
        color: 'text-[var(--zelt-primary)]',
        bg: 'bg-[var(--zelt-primary)]/5',
        iconColor: 'text-[var(--zelt-primary)]',
        nav: 'operacoes/agenda',
      },
      {
        label: 'Tarefas Abertas',
        value: stats.tasks?.myTasks ?? 0,
        hint: `${stats.tasks?.overdue ?? 0} atrasadas`,
        icon: ClipboardCheck,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        iconColor: 'text-blue-400',
        nav: 'operacoes/tarefas',
      },
      {
        label: 'Itens em Planilhas',
        value: stats.sheets?.itens ?? 0,
        hint: `${stats.sheets?.consulted ?? 0} consultas pela IA`,
        icon: FileSpreadsheet,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        iconColor: 'text-emerald-400',
        nav: 'operacoes/planilhas',
      },
      {
        label: 'Arquivos',
        value: stats.drive?.files ?? 0,
        hint: stats.drive?.storage ? formatSize(stats.drive.storage) : '0 B',
        icon: Folder,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        iconColor: 'text-amber-400',
        nav: 'operacoes/arquivos',
      },
    ];
  }, [stats]);

  const chartData = useMemo(() => {
    if (!stats?.messagesByDay?.length) return [];
    const days = stats.messagesByDay.slice(-(period === 'Semana' ? 7 : 30));
    return days.map((d) => ({
      dia: period === 'Semana' ? dayLabel(d.day) : d.day.slice(8, 10),
      full: formatFullDate(d.day),
      v: d.count,
    }));
  }, [stats, period]);

  const handleSummaryScroll = (e) => {
    const el = e.currentTarget;
    const idx = Math.round(el.scrollLeft / (el.clientWidth * 0.78));
    setSummaryIdx(Math.min(Math.max(idx, 0), summaryCards.length - 1));
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.08] rounded-xl p-12 flex justify-center">
        <div className="w-5 h-5 border-2 border-[var(--zelt-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.08] rounded-xl p-12 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-400 mb-4">
          <TrendingUp size={24} />
        </div>
        <h3 className="text-sm text-gray-900 dark:text-[#ededed] mb-1">Erro ao carregar estatisticas</h3>
        <p className="text-sm text-gray-400 dark:text-[#666] max-w-[300px] leading-relaxed mb-4">{error}</p>
        <button
          onClick={loadStats}
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--zelt-primary)] hover:underline transition-colors"
        >
          <RefreshCw size={12} />
          Tentar novamente
        </button>
      </div>
    );
  }

  const integrations = [
    { nome: 'WhatsApp', icon: MessageCircle, color: '#25D366', conectado: !!stats.integrations?.whatsapp, nav: 'integracoes/whatsapp' },
    { nome: 'Google Sheets', icon: FileSpreadsheet, color: '#34A853', conectado: !!stats.integrations?.googleSheets, nav: 'integracoes/google-sheets' },
    { nome: 'Google Calendar', icon: CalendarCheck, color: '#4285F4', conectado: !!stats.integrations?.googleCalendar, nav: 'integracoes/google-calendar' },
    { nome: 'Arquivos (Drive)', icon: Folder, color: '#F59E0B', conectado: !!stats.integrations?.drive, nav: 'operacoes/arquivos' },
  ];

  const recentChats = stats.recentChats || [];

  return (
    <div className="space-y-5">
      {/* Linha de cards de resumo (arrastavel no mobile) */}
      <div>
        <div
          onScroll={handleSummaryScroll}
          className="flex sm:grid sm:grid-cols-3 gap-4 overflow-x-auto sm:overflow-visible -mx-4 sm:mx-0 px-4 sm:px-0 snap-x snap-mandatory scroll-smooth scroll-pl-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className={`${cardCls} p-4 sm:p-5 flex items-center justify-between gap-3 shrink-0 snap-start w-[78%] max-w-[260px] sm:w-auto sm:max-w-none`}
              >
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-[11px] text-gray-400 dark:text-[#666] truncate">{card.label}</p>
                  <p className="mt-1 sm:mt-1.5 text-xl sm:text-2xl font-semibold tracking-tight text-gray-900 dark:text-[#ededed]">{card.value}</p>
                  <p className="mt-1 sm:mt-1.5 inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    <TrendingUp size={11} />
                    {card.hint}
                  </p>
                </div>
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: card.bg }}>
                  <Icon size={19} style={{ color: card.color }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex sm:hidden items-center justify-center gap-1.5 mt-3">
          {summaryCards.map((card, i) => (
            <span
              key={card.label}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === summaryIdx ? 'w-5 bg-[var(--zelt-primary)]' : 'w-1.5 bg-gray-200 dark:bg-white/10'}`}
            />
          ))}
        </div>
      </div>

      {/* Cards rapidos: Agenda / Tarefas / Planilhas / Arquivos */}
      <div className="cards-carousel" style={{ '--cols': 4 }}>
        {quickCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              onClick={() => onNavigate?.(card.nav)}
              className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg p-4 flex items-center gap-3 text-left hover:border-gray-300 dark:hover:border-white/[0.12] transition-colors"
            >
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center shrink-0`}>
                <Icon size={18} className={card.iconColor} />
              </div>
              <div className="min-w-0">
                <p className={`text-xl ${card.color}`}>{card.value}</p>
                <p className="text-xs text-gray-400 dark:text-[#666] truncate">{card.label}</p>
                <p className="text-[10px] text-gray-400 dark:text-[#555] truncate">{card.hint}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Grid: Ultimos Atendimentos + Integracoes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`${cardCls} lg:col-span-2 p-5`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[13px] font-medium text-gray-900 dark:text-[#ededed]">Últimos Atendimentos</p>
              <p className="text-[11px] text-gray-400 dark:text-[#666] mt-0.5">Conversas mais recentes do WhatsApp</p>
            </div>
            <button
              onClick={() => onNavigate?.('atendimentos/conversas')}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--zelt-primary)] hover:underline transition-colors"
            >
              Ver todos
              <ArrowUpRight size={12} />
            </button>
          </div>

          {recentChats.length === 0 ? (
            <div className="py-10 text-center">
              <MessageCircle size={24} className="mx-auto text-gray-300 dark:text-[#555] mb-2" />
              <p className="text-sm text-gray-400 dark:text-[#666]">Nenhuma conversa ainda. Conecte seu WhatsApp para comecar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left table-stack">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/[0.06]">
                    <th className="py-2.5 pr-4 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-[#666]">Cliente</th>
                    <th className="py-2.5 pr-4 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-[#666]">Última mensagem</th>
                    <th className="py-2.5 pr-4 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-[#666]">Status</th>
                    <th className="py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-[#666]">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {recentChats.map((item, idx) => {
                    const st = STATUS[item.incoming ? 'pendente' : 'em_andamento'];
                    return (
                      <tr
                        key={item.remoteJid || idx}
                        onClick={() => onNavigate?.('atendimentos/chat')}
                        className="border-b border-gray-50 dark:border-white/[0.04] last:border-0 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                      >
                        <td className="py-3 pr-4" data-label="Cliente">
                          <div className="flex items-center gap-2.5">
                            {item.profilePicUrl ? (
                              <img
                                src={item.profilePicUrl}
                                alt=""
                                className="w-7 h-7 rounded-full object-cover shrink-0"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-[var(--zelt-primary)]/10 flex items-center justify-center shrink-0">
                                <span className="text-[9px] font-semibold text-[var(--zelt-primary)]">{initials(item.name)}</span>
                              </div>
                            )}
                            <span className="text-xs text-gray-800 dark:text-gray-200 font-medium truncate max-w-[140px]">{item.name}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-xs text-gray-500 dark:text-[#808080] truncate max-w-[220px]" data-label="Ultima mensagem">
                          {item.lastMessage || '—'}
                        </td>
                        <td className="py-3 pr-4" data-label="Status">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${st.cls}`}>
                            {st.label}
                          </span>
                        </td>
                        <td className="py-3 text-xs text-gray-500 dark:text-[#808080]" data-label="Data">{formatDateTime(item.lastAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className={`${cardCls} p-5`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[13px] font-medium text-gray-900 dark:text-[#ededed]">Resumo de Integrações</p>
              <p className="text-[11px] text-gray-400 dark:text-[#666] mt-0.5">Status das conexões principais</p>
            </div>
            <button
              onClick={() => onNavigate?.('integracoes')}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--zelt-primary)] hover:underline transition-colors"
            >
              Ver todas
              <ArrowUpRight size={12} />
            </button>
          </div>

          <div className="space-y-2.5">
            {integrations.map((int) => {
              const Icon = int.icon;
              return (
                <button
                  key={int.nome}
                  onClick={() => onNavigate?.(int.nav)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded border border-gray-200 dark:border-white/[0.08] hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: `${int.color}14` }}>
                      <Icon size={15} style={{ color: int.color }} />
                    </div>
                    <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{int.nome}</span>
                  </div>
                  {int.conectado ? (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Conectado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-gray-400 dark:text-[#666]">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-[#555]" />
                      Desconectado
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grafico: Mensagens por Dia */}
      <div className={`${cardCls} p-5`}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <p className="text-[13px] font-medium text-gray-900 dark:text-[#ededed]">Mensagens por Dia</p>
            <p className="text-[11px] text-gray-400 dark:text-[#666] mt-0.5">Volume de mensagens no WhatsApp</p>
          </div>
          <div className="flex items-center bg-gray-50 dark:bg-[#1a1a1a] rounded p-0.5">
            {['Semana', 'Mês'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-[10px] rounded transition-all ${
                  period === p
                    ? 'bg-white dark:bg-[#141414] text-gray-900 dark:text-[#ededed] border border-gray-200 dark:border-white/[0.06]'
                    : 'text-gray-500 dark:text-[#808080] hover:text-gray-700 dark:hover:text-[#ddd]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="py-10 text-center">
            <MessageCircle size={24} className="mx-auto text-gray-300 dark:text-[#555] mb-2" />
            <p className="text-sm text-gray-400 dark:text-[#666]">Sem mensagens registradas ainda.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="gradAtend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--zelt-primary)" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="var(--zelt-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-white/[0.04]" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip suffix=" msgs" />} />
              <Area
                type="monotone"
                dataKey="v"
                stroke="var(--zelt-primary)"
                strokeWidth={2}
                fill="url(#gradAtend)"
                dot={{ r: 3, fill: 'var(--zelt-primary)', strokeWidth: 0 }}
                activeDot={{ r: 4, fill: 'var(--zelt-primary)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
