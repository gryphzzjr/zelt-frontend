import { useState, useRef, useEffect, useCallback } from 'react';
import { onboardingApi, knowledgeApi, geminiApi } from '../../lib/api';
import {
  Search, FileText, File, X, Check, Save, RotateCcw,
  ChevronDown, ChevronUp, Clock, Send, Trash2, History,
  BookOpen, Sparkles, Settings2, MessageSquare,
  AlertTriangle, Info, Brain, Loader2,
} from 'lucide-react';

const PERSONALITY_OPTIONS = [
  { id: 'amigavel', label: 'Amigavel' },
  { id: 'profissional', label: 'Profissional' },
  { id: 'formal', label: 'Formal' },
  { id: 'descontraida', label: 'Descontraida' },
  { id: 'empatico', label: 'Empatico' },
  { id: 'direto', label: 'Direto e Objetivo' },
];

const LANGUAGE_OPTIONS = [
  { id: 'pt-br', label: 'Portugues (BR)' },
  { id: 'en', label: 'Ingles' },
  { id: 'es', label: 'Espanhol' },
  { id: 'fr', label: 'Frances' },
];

const EMPTY_CONFIG = {
  name: '',
  systemPrompt: '',
  objective: '',
  personality: 'profissional',
  language: 'pt-br',
  temperature: 0.7,
  maxTokens: 500,
  allowEmojis: false,
  onlyKB: true,
  allowCreative: false,
};

const SYSTEM_PROMPT_PLACEHOLDER = `Exemplo de como escrever:

Voce e o assistente virtual da minha empresa.

Sua missao e atender os clientes com educacao e agilidade, ajudando com:
- Produtos e servicos oferecidos
- Tabela de precos e condicoes de pagamento
- Horarios de atendimento e formas de contato
- Duvidas sobre pedidos, trocas e devolucoes

Sempre responda usando a base de conhecimento cadastrada.
Quando nao souber a resposta, peca desculpas e informe que um atendente humano vai ajudar em seguida.`;

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

function formatDateTime(iso) {
  try {
    return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function nowTime() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function mapKbItem(item) {
  return {
    id: item.id,
    name: item.title || item.name || 'Sem titulo',
    category: item.category || 'Geral',
    type: item.type === 'text' ? 'texto' : item.type || 'texto',
    updatedAt: formatDate(item.updatedAt),
    active: String(item.status || 'ACTIVE').toUpperCase() === 'ACTIVE',
  };
}

function Toggle({ checked, onChange, size = 'md' }) {
  const sizes = {
    sm: { track: 'w-8 h-[18px]', dot: 'w-3.5 h-3.5', translate: 'translate-x-3.5' },
    md: { track: 'w-10 h-5', dot: 'w-4 h-4', translate: 'translate-x-5' },
  };
  const s = sizes[size] || sizes.md;
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center rounded-full transition-colors ${s.track} ${
        checked ? 'bg-[var(--zelt-primary)]' : 'bg-gray-200'
      }`}
    >
      <span className={`inline-block rounded-full bg-white dark:bg-[#141414] shadow-sm transition-transform ${s.dot} ${
        checked ? s.translate : 'translate-x-0.5'
      }`} />
    </button>
  );
}

function Slider({ value, onChange, min = 0, max = 2, step = 0.1 }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-1.5 rounded-full appearance-none bg-gray-200 accent-[var(--zelt-primary)] cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--zelt-primary)] [&::-webkit-slider-thumb]:border-2
          [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md"
      />
      <span className="text-xs font-mono text-gray-500 dark:text-[#808080] w-8 text-right">{value.toFixed(1)}</span>
    </div>
  );
}

function KnowledgeBaseModal({ open, onClose, contents, saving, onSave }) {
  const [search, setSearch] = useState('');
  const [localContents, setLocalContents] = useState(contents);

  useEffect(() => { setLocalContents(contents); }, [contents]);

  if (!open) return null;

  const filtered = localContents.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = localContents.filter(c => c.active).length;

  const typeIcon = (type) => {
    if (type === 'pdf') return <File size={14} className="text-red-400" />;
    return <FileText size={14} className="text-[var(--zelt-primary)]" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-white dark:bg-[#141414] rounded-t-2xl sm:rounded-2xl border border-gray-200 dark:border-white/[0.06] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-white/[0.12]" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--zelt-primary)]/8 flex items-center justify-center">
              <BookOpen size={16} className="text-[var(--zelt-primary)]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-[#ededed]">Gerenciar Conhecimento</h3>
              <p className="text-[11px] text-gray-400 dark:text-[#666]">{activeCount} de {localContents.length} conteudos ativos</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 dark:text-[#666] hover:text-gray-600 dark:text-[#aaa] dark:hover:text-[#ccc] hover:bg-gray-100 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#666]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar conteudo..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 dark:border-white/[0.06] rounded-lg focus:outline-none focus:border-[var(--zelt-primary)]/40 transition-colors"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {localContents.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400 dark:text-[#666]">
              Nenhum conteudo cadastrado. Adicione conteudos na pagina Base de Conhecimento.
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400 dark:text-[#666]">Nenhum conteudo encontrado</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map(content => (
                <div key={content.id} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50/50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#1a1a1a] flex items-center justify-center shrink-0">
                    {typeIcon(content.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-[#ededed] truncate">{content.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-gray-400 dark:text-[#666]">{content.category}</span>
                      <span className="text-[10px] text-gray-300 dark:text-[#555]">|</span>
                      <span className="text-[10px] text-gray-400 dark:text-[#666]">{content.type.toUpperCase()}</span>
                      <span className="text-[10px] text-gray-300 dark:text-[#555]">|</span>
                      <span className="text-[10px] text-gray-400 dark:text-[#666]">{content.updatedAt}</span>
                    </div>
                  </div>
                  <Toggle
                    checked={content.active}
                    size="sm"
                    onChange={() => {
                      setLocalContents(prev =>
                        prev.map(c => c.id === content.id ? { ...c, active: !c.active } : c)
                      );
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 dark:border-white/[0.06] bg-gray-50/50">
          <button onClick={onClose} className="px-3 py-1.5 text-xs text-gray-500 dark:text-[#808080] hover:bg-gray-100 rounded-lg transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => onSave(localContents)}
            disabled={saving}
            className="px-3 py-1.5 text-xs font-medium text-white bg-[var(--zelt-primary)] hover:bg-[var(--zelt-primary-hover)] rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
          >
            {saving && <Loader2 size={12} className="animate-spin" />}
            Salvar Selecao
          </button>
        </div>
      </div>
    </div>
  );
}

function ResponseInfo({ info, expanded, onToggle }) {
  if (!info) return null;
  return (
    <div className="mx-4 mb-3">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 text-[10px] bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2 text-gray-500 dark:text-[#808080]">
          <Info size={11} />
          <span>Informacoes da resposta</span>
        </div>
        {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
      </button>
      {expanded && (
        <div className="mt-1 p-3 bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] rounded-lg space-y-1.5">
          {info.responseTime != null && (
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-400 dark:text-[#666]">Tempo de resposta</span>
              <span className="text-gray-600 dark:text-[#aaa] font-medium">{info.responseTime}ms</span>
            </div>
          )}
          {info.tokensTotal != null && (
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-400 dark:text-[#666]">Tokens utilizados</span>
              <span className="text-gray-600 dark:text-[#aaa] font-medium">{info.tokensTotal}</span>
            </div>
          )}
          {info.tokensPrompt != null && (
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-400 dark:text-[#666]">Tokens de entrada</span>
              <span className="text-gray-600 dark:text-[#aaa] font-medium">{info.tokensPrompt}</span>
            </div>
          )}
          {info.tokensCompletion != null && (
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-400 dark:text-[#666]">Tokens de saida</span>
              <span className="text-gray-600 dark:text-[#aaa] font-medium">{info.tokensCompletion}</span>
            </div>
          )}
          {info.model && (
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-400 dark:text-[#666]">Modelo</span>
              <span className="text-gray-600 dark:text-[#aaa] font-medium">{info.model}</span>
            </div>
          )}
          {info.kbUsed && info.kbUsed.length > 0 && (
            <div className="pt-1.5 border-t border-gray-100 dark:border-white/[0.06]">
              <span className="text-[10px] text-gray-400 dark:text-[#666]">Bases consultadas:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {info.kbUsed.map((kb, i) => (
                  <span key={i} className="text-[9px] px-1.5 py-0.5 bg-[var(--zelt-primary)]/5 text-[var(--zelt-primary)] rounded border border-[var(--zelt-primary)]/10">
                    {kb}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PromptsView() {
  const [config, setConfig] = useState(EMPTY_CONFIG);
  const [configLoading, setConfigLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [kbContents, setKbContents] = useState([]);
  const [kbLoading, setKbLoading] = useState(true);
  const [kbSaving, setKbSaving] = useState(false);
  const [kbModalOpen, setKbModalOpen] = useState(false);
  const [lastSync, setLastSync] = useState('');

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [expandedInfo, setExpandedInfo] = useState(null);
  const [lastModel, setLastModel] = useState('');
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const [testHistory, setTestHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateConfig = useCallback((field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setSaved(false);
  }, []);

  const loadConfig = useCallback(async () => {
    setConfigLoading(true);
    try {
      const res = await geminiApi.getConfig();
      setConfig({ ...EMPTY_CONFIG, ...(res.data || {}) });
    } catch {
      showToast('Erro ao carregar configuracao da IA', 'error');
    } finally {
      setConfigLoading(false);
    }
  }, []);

  const loadKnowledge = useCallback(async () => {
    setKbLoading(true);
    try {
      const res = await knowledgeApi.list({ limit: 200 });
      const items = (res.items || []).map(mapKbItem);
      setKbContents(items);
      setLastSync(formatDateTime(Date.now()));
    } catch {
      showToast('Erro ao carregar base de conhecimento', 'error');
    } finally {
      setKbLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
    loadKnowledge();
  }, [loadConfig, loadKnowledge]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await geminiApi.saveConfig(config);
      setSaved(true);
      setHasChanges(false);
      setTimeout(() => setSaved(false), 2000);
      try { await onboardingApi.completeStep('prompts'); } catch {}
    } catch {
      showToast('Erro ao salvar configuracao', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async () => {
    setSaving(true);
    try {
      await geminiApi.resetConfig();
      const res = await geminiApi.getConfig();
      setConfig({ ...EMPTY_CONFIG, ...(res.data || {}) });
      setHasChanges(false);
      setSaved(false);
      showToast('Configuracao restaurada para o padrao');
    } catch {
      showToast('Erro ao restaurar configuracao', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleKbSave = async (updated) => {
    setKbSaving(true);
    try {
      const changes = updated.filter(item => {
        const original = kbContents.find(c => c.id === item.id);
        return original && original.active !== item.active;
      });
      for (const item of changes) {
        await knowledgeApi.update(item.id, { status: item.active ? 'ACTIVE' : 'INACTIVE' });
      }
      await loadKnowledge();
      setHasChanges(true);
      setKbModalOpen(false);
      showToast('Base de conhecimento atualizada');
    } catch {
      showToast('Erro ao salvar base de conhecimento', 'error');
    } finally {
      setKbSaving(false);
    }
  };

  const handleSendMessage = async (prefill) => {
    const text = (prefill ?? input).trim();
    if (!text || sending) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: nowTime(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await geminiApi.test({
        message: text,
        systemPrompt: config.systemPrompt,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        onlyKB: config.onlyKB,
        allowCreative: config.allowCreative,
        allowEmojis: config.allowEmojis,
      });
      const data = res?.data || {};
      const hasInfo = !!(data.responseTime != null || data.model || (data.kbUsed && data.kbUsed.length > 0) || data.tokens);

      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.reply || 'Nao foi possivel gerar uma resposta.',
        timestamp: nowTime(),
        info: hasInfo ? {
          responseTime: data.responseTime,
          tokensPrompt: data.tokens?.prompt,
          tokensCompletion: data.tokens?.completion,
          tokensTotal: data.tokens?.total,
          model: data.model,
          kbUsed: data.kbUsed || [],
        } : undefined,
      };

      setMessages(prev => [...prev, aiMsg]);
      setExpandedInfo(aiMsg.id);
      if (data.model) setLastModel(data.model);

      setTestHistory(prev => [
        { id: Date.now(), question: text, answer: aiMsg.content, timestamp: new Date().toLocaleString('pt-BR') },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      const errMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Erro ao consultar a IA: ' + (err.message || 'tente novamente'),
        error: true,
        timestamp: nowTime(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setExpandedInfo(null);
  };

  const handleNewSession = () => {
    setMessages([]);
    setExpandedInfo(null);
  };

  const activeCount = kbContents.filter(c => c.active).length;
  const assistantName = config.name || 'Assistente IA';
  const modelLabel = lastModel || 'Modelo de IA';

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 lg:h-[calc(100vh-8rem)]">
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-2.5 rounded-xl text-xs shadow-lg animate-in fade-in ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
          {toast.message}
        </div>
      )}

      <KnowledgeBaseModal
        open={kbModalOpen}
        onClose={() => setKbModalOpen(false)}
        contents={kbContents}
        saving={kbSaving}
        onSave={handleKbSave}
      />

      <>
          {/* ===== LEFT COLUMN - CONFIG ===== */}
          <div className="lg:flex-1 lg:min-w-0 lg:flex lg:flex-col lg:overflow-hidden">
        {/* Config Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--zelt-primary)]/8 flex items-center justify-center">
              <Settings2 size={16} className="text-[var(--zelt-primary)]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-[#ededed]">Configuracao da IA</h2>
              <p className="text-[10px] text-gray-400 dark:text-[#666]">Defina o comportamento e personalidade do assistente</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <span className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 px-2 py-1 rounded-lg">
                <AlertTriangle size={10} /> Alteracoes nao salvas
              </span>
            )}
            {saved && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 px-2 py-1 rounded-lg">
                <Check size={10} /> Salvo
              </span>
            )}
          </div>
        </div>

        {/* Config Scroll Area */}
        <div className="lg:flex-1 lg:overflow-y-auto space-y-4 pr-1">
          {/* Basic Settings */}
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-5 space-y-4">
            <div>
              <label className="block text-[10px] font-medium text-gray-400 dark:text-[#666] uppercase tracking-wider mb-1.5">Nome da IA</label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => updateConfig('name', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg focus:outline-none focus:border-[var(--zelt-primary)]/40 transition-colors"
                placeholder="Ex: Assistente Comercial"
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium text-gray-400 dark:text-[#666] uppercase tracking-wider mb-1.5">Prompt Principal (System Prompt)</label>
              <textarea
                value={config.systemPrompt}
                onChange={(e) => updateConfig('systemPrompt', e.target.value)}
                rows={8}
                placeholder={SYSTEM_PROMPT_PLACEHOLDER}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg focus:outline-none focus:border-[var(--zelt-primary)]/40 transition-colors resize-none leading-relaxed font-mono text-[13px]"
              />
              <p className="text-[10px] text-gray-400 dark:text-[#666] mt-1">{config.systemPrompt.length} caracteres</p>
            </div>

            <div>
              <label className="block text-[10px] font-medium text-gray-400 dark:text-[#666] uppercase tracking-wider mb-1.5">Objetivo da IA</label>
              <input
                type="text"
                value={config.objective}
                onChange={(e) => updateConfig('objective', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg focus:outline-none focus:border-[var(--zelt-primary)]/40 transition-colors"
                placeholder="Ex: Atender clientes com informacoes sobre produtos, planos e suporte"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-medium text-gray-400 dark:text-[#666] uppercase tracking-wider mb-1.5">Personalidade</label>
                <div className="relative">
                  <select
                    value={config.personality}
                    onChange={(e) => updateConfig('personality', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg appearance-none focus:outline-none focus:border-[var(--zelt-primary)]/40 transition-colors bg-white dark:bg-[#141414] pr-8"
                  >
                    {PERSONALITY_OPTIONS.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#666] pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-gray-400 dark:text-[#666] uppercase tracking-wider mb-1.5">Idioma</label>
                <div className="relative">
                  <select
                    value={config.language}
                    onChange={(e) => updateConfig('language', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg appearance-none focus:outline-none focus:border-[var(--zelt-primary)]/40 transition-colors bg-white dark:bg-[#141414] pr-8"
                  >
                    {LANGUAGE_OPTIONS.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#666] pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-5 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-medium text-gray-400 dark:text-[#666] uppercase tracking-wider">Temperatura</label>
                <span className="text-[10px] text-gray-500 dark:text-[#808080]">
                  {config.temperature <= 0.5 ? 'Preciso' : config.temperature <= 1.0 ? 'Equilibrado' : config.temperature <= 1.5 ? 'Criativo' : 'Muito criativo'}
                </span>
              </div>
              <Slider
                value={config.temperature}
                onChange={(v) => updateConfig('temperature', v)}
                min={0}
                max={2}
                step={0.1}
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium text-gray-400 dark:text-[#666] uppercase tracking-wider mb-1.5">Tamanho maximo da resposta (tokens)</label>
              <input
                type="number"
                value={config.maxTokens}
                onChange={(e) => updateConfig('maxTokens', parseInt(e.target.value) || 0)}
                min={50}
                max={4000}
                step={50}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg focus:outline-none focus:border-[var(--zelt-primary)]/40 transition-colors"
              />
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-700 dark:text-[#ccc]">Permitir uso de emojis</p>
                  <p className="text-[10px] text-gray-400 dark:text-[#666]">A IA podera usar emojis nas respostas</p>
                </div>
                <Toggle checked={config.allowEmojis} onChange={(v) => updateConfig('allowEmojis', v)} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-700 dark:text-[#ccc]">Responder apenas com a Base de Conhecimento</p>
                  <p className="text-[10px] text-gray-400 dark:text-[#666]">A IA so respondera com informacoes da base</p>
                </div>
                <Toggle checked={config.onlyKB} onChange={(v) => updateConfig('onlyKB', v)} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-700 dark:text-[#ccc]">Respostas criativas sem informacoes</p>
                  <p className="text-[10px] text-gray-400 dark:text-[#666]">Permitir respostas mesmo sem dados na base</p>
                </div>
                <Toggle checked={config.allowCreative} onChange={(v) => updateConfig('allowCreative', v)} />
              </div>
            </div>
          </div>

          {/* Knowledge Base Active Card */}
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--zelt-primary)]/8 flex items-center justify-center">
                  <BookOpen size={16} className="text-[var(--zelt-primary)]" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-gray-900 dark:text-[#ededed]">Base de Conhecimento Ativa</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {kbLoading ? (
                      <Loader2 size={10} className="animate-spin text-gray-400" />
                    ) : (
                      <>
                        <span className="text-[10px] text-gray-400 dark:text-[#666]">{activeCount} conteudo{activeCount !== 1 ? 's' : ''} ativo{activeCount !== 1 ? 's' : ''}</span>
                        <span className="text-[10px] text-gray-300 dark:text-[#555]">|</span>
                        <span className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-[#666]">
                          <Clock size={9} /> {lastSync || 'carregando...'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setKbModalOpen(true)}
                disabled={kbLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--zelt-primary)] bg-[var(--zelt-primary)]/5 border border-[var(--zelt-primary)]/10 rounded-lg hover:bg-[var(--zelt-primary)]/10 transition-colors disabled:opacity-40"
              >
                Gerenciar Conhecimento
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pb-4">
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges || configLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[var(--zelt-primary)] hover:bg-[var(--zelt-primary-hover)] rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={13} />
              )}
              Salvar Alteracoes
            </button>
            <button
              onClick={handleRestore}
              disabled={saving || configLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-gray-600 dark:text-[#aaa] bg-gray-100 dark:bg-[#1a1a1a] hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-40"
            >
              <RotateCcw size={13} /> Restaurar Padrao
            </button>
          </div>
        </div>
      </div>

      {/* ===== RIGHT COLUMN - TEST CHAT ===== */}
      <div className="w-full lg:w-[420px] lg:shrink-0 h-[70dvh] lg:h-auto flex flex-col bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-2xl overflow-hidden">
        {/* Chat Header */}
        <div className="px-5 py-3.5 border-b border-gray-100 dark:border-white/[0.06] shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-[var(--zelt-primary)]/10 flex items-center justify-center">
                  <Brain size={16} className="text-[var(--zelt-primary)]" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900 dark:text-[#ededed]">{assistantName}</p>
                <p className="text-[10px] text-gray-400 dark:text-[#666]">{modelLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`p-1.5 rounded-lg transition-colors ${showHistory ? 'bg-[var(--zelt-primary)]/10 text-[var(--zelt-primary)]' : 'text-gray-400 dark:text-[#666] hover:bg-gray-100'}`}
                title="Historico"
              >
                <History size={14} />
              </button>
              <button
                onClick={handleClearChat}
                className="p-1.5 text-gray-400 dark:text-[#666] hover:bg-gray-100 rounded-lg transition-colors"
                title="Limpar conversa"
              >
                <Trash2 size={14} />
              </button>
              <button
                onClick={handleNewSession}
                className="p-1.5 text-gray-400 dark:text-[#666] hover:bg-gray-100 rounded-lg transition-colors"
                title="Nova sessao"
              >
                <Sparkles size={14} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-[#666]">
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online
            </span>
            {kbLoading ? (
              <span className="flex items-center gap-1"><Loader2 size={9} className="animate-spin" /> Carregando base...</span>
            ) : (
              <span>{activeCount} base{activeCount !== 1 ? 's' : ''} ativa{activeCount !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="border-b border-gray-100 dark:border-white/[0.06] max-h-[140px] overflow-y-auto">
            <div className="px-4 py-2">
              <p className="text-[10px] font-medium text-gray-400 dark:text-[#666] uppercase tracking-wider mb-2">Historico de testes</p>
              {testHistory.length === 0 ? (
                <p className="text-[10px] text-gray-300 dark:text-[#555] text-center py-2">Nenhum teste realizado</p>
              ) : (
                <div className="space-y-1">
                  {testHistory.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setShowHistory(false);
                        handleSendMessage(item.question);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:bg-[#111] dark:hover:bg-[#1a1a1a] transition-colors"
                    >
                      <p className="text-[11px] text-gray-700 dark:text-[#ccc] truncate">{item.question}</p>
                      <p className="text-[9px] text-gray-400 dark:text-[#666]">{item.timestamp}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-12 h-12 rounded-2xl bg-[var(--zelt-primary)]/5 border border-[var(--zelt-primary)]/10 flex items-center justify-center mb-3">
                <MessageSquare size={20} className="text-[var(--zelt-primary)]/40" />
              </div>
              <p className="text-xs font-medium text-gray-900 dark:text-[#ededed] mb-1">Ambiente de testes</p>
              <p className="text-[11px] text-gray-400 dark:text-[#666] max-w-[220px] leading-relaxed">
                Envie uma mensagem para testar como a IA responde com a configuracao atual.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[var(--zelt-primary)] text-white rounded-br-md'
                      : msg.error
                        ? 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 rounded-bl-md'
                        : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-800 rounded-bl-md'
                  }`}>
                    {msg.content}
                  </div>
                  {msg.timestamp && (
                    <p className={`text-[9px] text-gray-400 dark:text-[#666] mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.timestamp}
                    </p>
                  )}
                  {msg.info && (
                    <div className="mt-1">
                      <ResponseInfo
                        info={msg.info}
                        expanded={expandedInfo === msg.id}
                        onToggle={() => setExpandedInfo(expandedInfo === msg.id ? null : msg.id)}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {sending && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-[#1a1a1a] rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="px-4 py-3 border-t border-gray-100 dark:border-white/[0.06] shrink-0">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={1}
                placeholder="Digite sua mensagem..."
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-xl focus:outline-none focus:border-[var(--zelt-primary)]/40 transition-colors resize-none max-h-24"
              />
            </div>
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || sending}
              className="p-2.5 text-white bg-[var(--zelt-primary)] hover:bg-[var(--zelt-primary-hover)] rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
      </>
    </div>
  );
}
