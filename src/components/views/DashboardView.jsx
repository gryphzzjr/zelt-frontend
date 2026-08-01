import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare, Users, Send, Bot, TrendingUp, TrendingDown,
  Search, Plus, Clock, Star, Briefcase, DollarSign, Wrench, Rocket,
  BarChart3, ArrowRight, Zap, Settings, Globe, Check, Loader2,
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { onboardingApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

const conversationData = [
  { day: '01', value: 180 }, { day: '03', value: 220 }, { day: '05', value: 195 },
  { day: '07', value: 310 }, { day: '09', value: 280 }, { day: '11', value: 340 },
  { day: '13', value: 290 }, { day: '15', value: 410 }, { day: '17', value: 380 },
  { day: '19', value: 460 }, { day: '21', value: 390 }, { day: '23', value: 480 },
  { day: '25', value: 520 }, { day: '27', value: 445 }, { day: '29', value: 510 },
];

const responseTimeData = [
  { h: '8h', v: 4.2 }, { h: '10h', v: 3.1 }, { h: '12h', v: 5.8 },
  { h: '14h', v: 2.9 }, { h: '16h', v: 3.6 }, { h: '18h', v: 4.1 },
];

const satisfactionData = [
  { label: 'Seg', v: 92 }, { label: 'Ter', v: 88 }, { label: 'Qua', v: 95 },
  { label: 'Qui', v: 91 }, { label: 'Sex', v: 97 }, { label: 'Sab', v: 89 },
];

const recentConversations = [
  { name: 'Ana Souza', msg: 'Quero saber sobre os planos disponiveis', time: '2min', status: 'answered', initials: 'AS', color: '#7C3AED' },
  { name: 'Carlos Lima', msg: 'Nao recebi o boleto do mes passado...', time: '8min', status: 'waiting', initials: 'CL', color: '#0EA5E9' },
  { name: 'Julia Martins', msg: 'Consegui resolver, muito obrigada!', time: '15min', status: 'answered', initials: 'JM', color: '#10B981' },
  { name: 'Bruno Alves', msg: 'O sistema esta fora do ar pra mim', time: '31min', status: 'no-reply', initials: 'BA', color: '#F59E0B' },
  { name: 'Fernanda Costa', msg: 'Preciso cancelar minha assinatura', time: '47min', status: 'waiting', initials: 'FC', color: '#EF4444' },
];

const agents = [
  { name: 'Agente Comercial', status: 'online', clients: 38, icon: Briefcase, color: '#7C3AED' },
  { name: 'Agente Financeiro', status: 'online', clients: 12, icon: DollarSign, color: '#10B981' },
  { name: 'Agente Suporte', status: 'offline', clients: 0, icon: Wrench, color: '#6B7280' },
  { name: 'Agente Onboarding', status: 'online', clients: 21, icon: Rocket, color: '#0EA5E9' },
];

const stats = [
  { label: 'Conversas Hoje', value: '248', delta: '+12%', up: true, icon: MessageSquare, color: 'var(--zelt-primary)', bg: 'rgba(var(--zelt-primary-rgb), 0.05)' },
  { label: 'Clientes Ativos', value: '81', delta: '+8%', up: true, icon: Users, color: '#0EA5E9', bg: '#0ea5e90d' },
  { label: 'Mensagens Enviadas', value: '4.582', delta: '+18%', up: true, icon: Send, color: '#10B981', bg: '#10b9810d' },
  { label: 'Agentes IA', value: '7', delta: null, up: null, icon: Bot, color: '#F59E0B', bg: '#f59e0b0d' },
];

const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl px-3.5 py-2.5">
        <p className="text-[10px] text-gray-400 dark:text-[#666] mb-0.5">{label}</p>
        <p className="text-[13px] text-gray-900 dark:text-[#ededed]">{prefix}{payload[0].value}{suffix}</p>
      </div>
    );
  }
  return null;
};

const StatusBadge = ({ status }) => {
  const map = {
    answered: { label: 'Respondido', cls: 'bg-[#f0fdf4] dark:bg-emerald-500/15 text-[#16a34a] dark:text-emerald-400' },
    waiting: { label: 'Aguardando', cls: 'bg-[#fffbeb] dark:bg-amber-500/15 text-[#d97706] dark:text-amber-400' },
    'no-reply': { label: 'Sem resposta', cls: 'bg-[#fef2f2] dark:bg-red-500/15 text-[#dc2626] dark:text-red-400' },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] ${s.cls}`}>
      {s.label}
    </span>
  );
};

function EmptyState({ onNavigate }) {
  const { workspace } = useAuth();
  const workspaceId = workspace?.id;

  const [stepsStatus, setStepsStatus] = useState({});
  const [loadingSteps, setLoadingSteps] = useState(true);

  const fetchStatus = useCallback(async () => {
    if (!workspaceId) return;
    try {
      setLoadingSteps(true);
      const res = await onboardingApi.getStatus(workspaceId);
      setStepsStatus({
        whatsapp: !!res.whatsapp,
        prompts: !!res.prompts,
        responses: !!res.responses,
        settings: !!res.settings,
      });
    } catch {
      setStepsStatus({});
    } finally {
      setLoadingSteps(false);
    }
  }, [workspaceId]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const steps = [
    { key: 'whatsapp', icon: Globe, label: 'Conectar WhatsApp', desc: 'Crie uma instancia na Evolution API e escaneie o QR Code', view: 'integracoes/whatsapp', color: '#25D366' },
    { key: 'prompts', icon: Bot, label: 'Criar Agente IA', desc: 'Configure um agente com prompt, modelo e personalidade', view: 'ia/prompts', color: '#7C3AED' },
    { key: 'responses', icon: Zap, label: 'Configurar Respostas', desc: 'Defina respostas rapidas e fluxos de atendimento', view: 'ia/respostas-automaticas', color: '#0EA5E9' },
    { key: 'settings', icon: Settings, label: 'Ajustar Configuracoes', desc: 'Personalize seu workspace, equipe e permissoes', view: 'configuracoes', color: '#F59E0B' },
  ];

  const completedCount = steps.filter(s => stepsStatus[s.key]).length;
  const progressPercent = (completedCount / steps.length) * 100;

  const handleStepClick = (step) => {
    onNavigate?.(step.view);
  };

  const handleSkip = async () => {
    try {
      for (const step of steps) {
        if (!stepsStatus[step.key]) {
          await onboardingApi.completeStep(step.key);
        }
      }
      await fetchStatus();
      onNavigate?.('dashboard');
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl text-gray-900 dark:text-[#ededed] tracking-tight">Bem Vindo, Usuario!</h1>
          <p className="text-xs text-gray-400 dark:text-[#666] mt-0.5">
            Configure sua plataforma para comecar a atender.
          </p>
        </div>
      </div>

      {/* Empty stat cards */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl px-4 py-4 transition-colors hover:border-gray-300 dark:hover:border-white/15">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                  <Icon size={15} style={{ color: s.color }} />
                </div>
                <span className="text-[10px] text-gray-300 dark:text-[#555]">--</span>
              </div>
              <p className="text-xl text-gray-300 dark:text-[#555] tracking-tight">0</p>
              <p className="text-[11px] text-gray-400 dark:text-[#666] mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Hero empty state */}
      <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-8">
        <div className="flex flex-col items-center text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[rgba(var(--zelt-primary-rgb),0.05)] flex items-center justify-center mb-5">
            <BarChart3 size={28} className="text-[var(--zelt-primary)]" />
          </div>
          <h2 className="text-base text-gray-900 dark:text-[#ededed] mb-1.5">Seu painel esta vazio</h2>
          <p className="text-xs text-gray-400 dark:text-[#666] leading-relaxed mb-2">
            Comece conectando seu WhatsApp e criando um agente de IA. Assim que seus primeiros atendimentos acontecerem, os dados aparecerao aqui.
          </p>

          <p className="text-[11px] text-gray-500 dark:text-[#808080] mb-3">
            {completedCount === steps.length
              ? `${steps.length} de ${steps.length} concluidos`
              : loadingSteps
                ? 'Carregando...'
                : `Passo ${completedCount + 1} de ${steps.length}`}
          </p>

          <div className="w-full bg-gray-100 dark:bg-[#232323] rounded-full h-1.5 mb-5">
            <div
              className="h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%`, backgroundColor: 'var(--zelt-primary)' }}
            />
          </div>

          <div className="w-full space-y-2">
            {steps.map((step) => {
              const StepIcon = step.icon;
              const isCompleted = !!stepsStatus[step.key];
              return (
                <button key={step.key}
                  onClick={() => handleStepClick(step)}
                  className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl border transition-all text-left group ${
                    isCompleted
                      ? 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-500/10 hover:border-emerald-300 dark:hover:border-emerald-500/40'
                      : 'border-gray-100 dark:border-white/[0.06] hover:border-gray-200 dark:hover:border-white/15 hover:bg-gray-50/50 dark:hover:bg-white/[0.02]'
                  }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isCompleted ? 'bg-emerald-100 dark:bg-emerald-500/15' : ''
                  }`} style={!isCompleted ? { backgroundColor: `color-mix(in srgb, ${step.color} 12%, transparent)` } : undefined}>
                    {loadingSteps ? (
                      <Loader2 size={16} className="text-gray-300 dark:text-[#555] animate-spin" />
                    ) : isCompleted ? (
                      <Check size={18} className="text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <StepIcon size={18} style={{ color: step.color }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[12px] ${isCompleted ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-900 dark:text-[#ededed]'}`}>{step.label}</p>
                    <p className="text-[10px] text-gray-400 dark:text-[#777] mt-0.5">{step.desc}</p>
                  </div>
                  {isCompleted ? (
                    <Check size={14} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <ArrowRight size={14} className="text-gray-300 dark:text-[#555] group-hover:text-gray-500 dark:group-hover:text-[#808080] transition-colors shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSkip}
            className="mt-4 text-[11px] text-gray-400 dark:text-[#666] hover:text-gray-600 dark:hover:text-[#ccc] transition-colors underline underline-offset-2">
            Pular introducao
          </button>
        </div>
      </div>

      {/* Empty chart area */}
      <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl px-5 py-12">
        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#1a1a1a] flex items-center justify-center mb-3">
            <BarChart3 size={18} className="text-gray-300 dark:text-[#555]" />
          </div>
          <p className="text-[12px] text-gray-400 dark:text-[#666]">Dados de conversas aparecerao aqui</p>
          <p className="text-[10px] text-gray-300 dark:text-[#555] mt-0.5">Apos conectar o WhatsApp e receber as primeiras mensagens</p>
        </div>
      </div>

      {/* Empty bottom grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] text-gray-900 dark:text-[#ededed]">Conversas Recentes</p>
          </div>
          <div className="flex flex-col items-center py-8">
            <MessageSquare size={24} className="text-gray-200 dark:text-[#444] mb-2" />
            <p className="text-[11px] text-gray-400 dark:text-[#666]">Nenhuma conversa ainda</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] text-gray-900 dark:text-[#ededed]">Atividade dos Agentes</p>
          </div>
          <div className="flex flex-col items-center py-8">
            <Bot size={24} className="text-gray-200 dark:text-[#444] mb-2" />
            <p className="text-[11px] text-gray-400 dark:text-[#666]">Nenhum agente configurado</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ onNavigate }) {
  const [period, setPeriod] = useState('30 dias');
  const [hasData] = useState(false);

  if (!hasData) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300;1,9..40,400&display=swap');
          .dash-view * { font-family: 'DM Sans', system-ui, sans-serif; }
        `}</style>
        <div className="dash-view" style={{ maxWidth: 1200 }}>
          <EmptyState onNavigate={onNavigate} />
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300;1,9..40,400&display=swap');
        .dash-view * { font-family: 'DM Sans', system-ui, sans-serif; }
      `}</style>
      <div className="dash-view space-y-6" style={{ maxWidth: 1200 }}>

        {/* HEADER */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl text-gray-900 dark:text-[#ededed] tracking-tight">Bem Vindo, Usuario!</h1>
            <p className="text-xs text-gray-400 dark:text-[#666] mt-0.5">
              Acompanhe em tempo real o desempenho dos seus atendimentos.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#666]" />
              <input placeholder="Buscar..."
                className="pl-9 pr-3 py-2 text-xs border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#141414] text-gray-900 dark:text-[#ededed] w-48 focus:outline-none focus:border-[rgba(var(--zelt-primary-rgb),0.4)] transition-colors" />
            </div>
            <button className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs text-white bg-[var(--zelt-primary)] hover:bg-[var(--zelt-primary-hover)] rounded-lg transition-colors">
              <Plus size={14} />
              Novo Agente
            </button>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-4 gap-3">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl px-4 py-4 transition-colors hover:border-gray-300 dark:hover:border-white/15">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                    <Icon size={15} style={{ color: s.color }} />
                  </div>
                  {s.up !== null ? (
                    <div className="inline-flex items-center gap-1 text-[10px]" style={{ color: s.up ? '#16a34a' : '#dc2626' }}>
                      {s.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {s.delta}
                    </div>
                  ) : (
                    <span className="text-[10px] text-gray-400 dark:text-[#666]">--</span>
                  )}
                </div>
                <p className="text-xl text-gray-900 dark:text-[#ededed] tracking-tight">{s.value}</p>
                <p className="text-[11px] text-gray-400 dark:text-[#666] mt-0.5">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* CHART */}
        <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl px-5 py-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[13px] text-gray-900 dark:text-[#ededed]">Volume de Conversas</p>
              <p className="text-[11px] text-gray-400 dark:text-[#666] mt-0.5">Ultimos 30 dias</p>
            </div>
            <div className="flex items-center bg-gray-50 dark:bg-[#1a1a1a] rounded-lg p-0.5">
              {['Hoje', '7 dias', '30 dias'].map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 text-[10px] rounded-md transition-all ${period === p ? 'bg-white dark:bg-[#141414] text-gray-900 dark:text-[#ededed] border border-gray-200 dark:border-white/[0.06]' : 'text-gray-500 dark:text-[#808080] hover:text-gray-700 dark:hover:text-[#ddd]'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={conversationData}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--zelt-primary)" stopOpacity={0.08} />
                  <stop offset="95%" stopColor="var(--zelt-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-white/[0.04]" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<CustomTooltip suffix=" conv." />} />
              <Area type="monotone" dataKey="value" stroke="var(--zelt-primary)" strokeWidth={2} fill="url(#grad)" dot={false} activeDot={{ r: 4, fill: 'var(--zelt-primary)' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* CONVERSAS + AGENTES */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] text-gray-900 dark:text-[#ededed]">Conversas Recentes</p>
              <button className="text-[11px] text-[var(--zelt-primary)] hover:underline transition-colors">Ver todas</button>
            </div>
            <div className="space-y-0">
              {recentConversations.map((c) => (
                <div key={c.name} className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] shrink-0" style={{ background: c.color }}>
                    {c.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-900 dark:text-[#ededed] truncate">{c.name}</p>
                    <p className="text-[10px] text-gray-400 dark:text-[#666] truncate">{c.msg}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[9px] text-gray-400 dark:text-[#666]">{c.time}</span>
                    <StatusBadge status={c.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] text-gray-900 dark:text-[#ededed]">Atividade dos Agentes</p>
              <span className="inline-flex items-center gap-1 text-[9px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                3 Online
              </span>
            </div>
            <div className="space-y-2">
              {agents.map((a) => {
                const AgentIcon = a.icon;
                return (
                  <div key={a.name} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-100 dark:border-white/[0.06] hover:border-gray-200 dark:hover:border-white/15 transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: a.color + '10' }}>
                      <AgentIcon size={14} style={{ color: a.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-gray-900 dark:text-[#ededed]">{a.name}</p>
                      {a.status === 'online' && (
                        <p className="text-[10px] text-gray-400 dark:text-[#666] mt-0.5">Atendeu {a.clients} clientes hoje</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${a.status === 'online' ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-[#555]'}`} />
                      <span className={`text-[10px] ${a.status === 'online' ? 'text-emerald-600' : 'text-gray-400 dark:text-[#666]'}`}>
                        {a.status === 'online' ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* FINANCEIRO + PERFORMANCE */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] text-gray-900 dark:text-[#ededed]">Resumo Financeiro</p>
              <span className="text-[9px] text-[var(--zelt-primary)] bg-[rgba(var(--zelt-primary-rgb),0.05)] border border-[rgba(var(--zelt-primary-rgb),0.1)] px-2 py-0.5 rounded-full">Mensal</span>
            </div>
            <div className="mb-4">
              <p className="text-[10px] text-gray-400 dark:text-[#666] mb-0.5">Receita Mensal</p>
              <p className="text-2xl text-gray-900 dark:text-[#ededed] tracking-tight">R$ 12.480</p>
              <div className="flex items-center gap-1 text-[10px] text-emerald-600 mt-1">
                <TrendingUp size={11} /> +14% vs mes anterior
              </div>
            </div>
            <div className="space-y-0">
              {[
                { label: 'MRR', value: 'R$ 12.480', up: true },
                { label: 'ARR', value: 'R$ 149.760', up: true },
                { label: 'Clientes Pagantes', value: '81', up: true },
                { label: 'Churn Rate', value: '2.3%', up: false },
              ].map(m => (
                <div key={m.label} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-white/[0.06] last:border-0">
                  <span className="text-[11px] text-gray-500 dark:text-[#808080]">{m.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-900 dark:text-[#ededed]">{m.value}</span>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${m.up ? 'bg-emerald-50 dark:bg-emerald-500/15' : 'bg-red-50 dark:bg-red-500/15'}`}>
                      {m.up ? <TrendingUp size={8} className="text-emerald-500" /> : <TrendingDown size={8} className="text-red-500" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[rgba(var(--zelt-primary-rgb),0.05)] flex items-center justify-center">
                <Clock size={13} className="text-[var(--zelt-primary)]" />
              </div>
              <div>
                <p className="text-[12px] text-gray-900 dark:text-[#ededed]">Tempo Medio</p>
                <p className="text-[10px] text-gray-400 dark:text-[#666]">de Resposta</p>
              </div>
            </div>
            <div className="flex items-end gap-1.5 mb-4">
              <span className="text-2xl text-gray-900 dark:text-[#ededed] tracking-tight">3.8</span>
              <span className="text-[11px] text-emerald-600 mb-0.5">min</span>
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={responseTimeData} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-white/[0.04]" vertical={false} />
                <XAxis dataKey="h" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip suffix=" min" />} />
                <Bar dataKey="v" fill="var(--zelt-primary)" radius={[4, 4, 0, 0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                <Star size={13} className="text-amber-500" />
              </div>
              <div>
                <p className="text-[12px] text-gray-900 dark:text-[#ededed]">Satisfacao</p>
                <p className="text-[10px] text-gray-400 dark:text-[#666]">dos Clientes</p>
              </div>
            </div>
            <div className="flex items-end gap-1.5 mb-4">
              <span className="text-2xl text-gray-900 dark:text-[#ededed] tracking-tight">94</span>
              <span className="text-[11px] text-emerald-600 mb-0.5">%</span>
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={satisfactionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-white/[0.04]" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis domain={[80, 100]} hide />
                <Tooltip content={<CustomTooltip suffix="%" />} />
                <Line type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 3, fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}
