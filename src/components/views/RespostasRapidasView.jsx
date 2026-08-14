import { useState, useRef } from 'react';
import { onboardingApi } from '../../lib/api';
import {
  Search, Plus, Check, Trash2, Copy, Star, StarOff,
  Pencil, Tag, Clock, Zap, ChevronDown, Download, Upload,
  AlertCircle, Hash, MessageSquare, BarChart3,
} from 'lucide-react';
import Modal from '../../components/ui/Modal';

const CATEGORIES = [
  { id: 'atendimento', label: 'Atendimento', color: 'var(--zelt-primary)' },
  { id: 'comercial', label: 'Comercial', color: '#2563eb' },
  { id: 'financeiro', label: 'Financeiro', color: '#059669' },
  { id: 'cobranca', label: 'Cobranca', color: '#dc2626' },
  { id: 'suporte', label: 'Suporte', color: '#d97706' },
  { id: 'boas-vindas', label: 'Boas-vindas', color: '#8b5cf6' },
  { id: 'encerramento', label: 'Encerramento', color: '#6b7280' },
];

const VARIABLES = [
  { key: '{{nome_cliente}}', label: 'Nome do Cliente', sample: 'Joao Silva' },
  { key: '{{empresa}}', label: 'Empresa', sample: 'Zelt.AI' },
  { key: '{{telefone}}', label: 'Telefone', sample: '(11) 99999-0000' },
  { key: '{{email}}', label: 'Email', sample: 'joao@exemplo.com' },
  { key: '{{protocolo}}', label: 'Protocolo', sample: '#20260716001' },
  { key: '{{atendente}}', label: 'Atendente', sample: 'Maria Santos' },
  { key: '{{data}}', label: 'Data', sample: '16/07/2026' },
  { key: '{{hora}}', label: 'Hora', sample: '14:30' },
];

const INITIAL_RESPONSES = [
  { id: 1, title: 'Boas-vindas', shortcut: '/boasvindas', category: 'boas-vindas', message: 'Ola, {{nome_cliente}}! Seja bem-vindo(a) a {{empresa}}. Como posso te ajudar hoje?', uses: 234, favorite: true, updatedAt: '12 Jul 2026' },
  { id: 2, title: 'Orcamento', shortcut: '/orcamento', category: 'comercial', message: 'Olá {{nome_cliente}}! Para gerar seu orcamento, preciso de algumas informacoes. Poderia me confirmar o servico desejado e sua empresa ({{empresa}})?', uses: 189, favorite: false, updatedAt: '11 Jul 2026' },
  { id: 3, title: 'Suporte Tecnico', shortcut: '/suporte', category: 'suporte', message: 'Ola {{nome_cliente}}! Identificamos sua solicitacao. Nosso time tecnico esta analisando. Protocolo: {{protocolo}}. Retornaremos em ate 24h.', uses: 156, favorite: true, updatedAt: '10 Jul 2026' },
  { id: 4, title: 'Cobranca Pendente', shortcut: '/cobranca', category: 'cobranca', message: 'Ola {{nome_cliente}}, identificamos que existe um boleto pendente em sua conta. Para evitar o cancelamento do servico, por favor regularize. Dúvidas? Fale conosco!', uses: 78, favorite: false, updatedAt: '09 Jul 2026' },
  { id: 5, title: 'Encerramento', shortcut: '/encerramento', category: 'encerramento', message: 'Obrigado por entrar em contato, {{nome_cliente}}! Foi um prazer atende-lo(a). Se precisar de algo, estamo a disposicao. Tenha um otimo dia!', uses: 312, favorite: false, updatedAt: '08 Jul 2026' },
  { id: 6, title: 'Horario de Funcionamento', shortcut: '/horario', category: 'atendimento', message: 'Nosso horario de atendimento e de segunda a sexta, das 9h as 18h (horario de Brasilia). Nosso chatbot esta disponivel 24h!', uses: 45, favorite: false, updatedAt: '07 Jul 2026' },
  { id: 7, title: 'Pagamento Confirmado', shortcut: '/pagamento', category: 'financeiro', message: 'Ola {{nome_cliente}}! Confirmamos o recebimento do seu pagamento. Sua fatura foi quitada. Obrigado pela confianca!', uses: 98, favorite: false, updatedAt: '05 Jul 2026' },
];

function replaceVars(text) {
  let result = text;
  VARIABLES.forEach(v => { result = result.replaceAll(v.key, v.sample); });
  return result;
}

function getCategoryInfo(catId) {
  return CATEGORIES.find(c => c.id === catId) || CATEGORIES[0];
}

export default function RespostasRapidasView() {
  const [responses, setResponses] = useState(INITIAL_RESPONSES);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [hasData] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formShortcut, setFormShortcut] = useState('/');
  const [formCategory, setFormCategory] = useState('atendimento');
  const [formMessage, setFormMessage] = useState('');
  const [formFavorite, setFormFavorite] = useState(false);
  const [showVarMenu, setShowVarMenu] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const textareaRef = useRef(null);

  const [importModal, setImportModal] = useState(false);
  const [newCatModal, setNewCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('var(--zelt-primary)');
  const [customCategories, setCustomCategories] = useState([]);

  const allCategories = [...CATEGORIES, ...customCategories];

  const filtered = responses
    .filter(r => {
      const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.shortcut.toLowerCase().includes(search.toLowerCase()) ||
        r.message.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCategory === 'all' || r.category === filterCategory;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === 'uses') return b.uses - a.uses;
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      return 0;
    });

  const openCreate = () => {
    setEditing(null);
    setFormTitle('');
    setFormShortcut('/');
    setFormCategory('atendimento');
    setFormMessage('');
    setFormFavorite(false);
    setModalOpen(true);
  };

  const openEdit = (resp) => {
    setEditing(resp);
    setFormTitle(resp.title);
    setFormShortcut(resp.shortcut);
    setFormCategory(resp.category);
    setFormMessage(resp.message);
    setFormFavorite(resp.favorite);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim() || !formMessage.trim()) return;
    if (editing) {
      setResponses(prev => prev.map(r => r.id === editing.id ? {
        ...r, title: formTitle, shortcut: formShortcut, category: formCategory,
        message: formMessage, favorite: formFavorite, updatedAt: 'Agora',
      } : r));
    } else {
      const newResp = {
        id: Date.now(), title: formTitle, shortcut: formShortcut,
        category: formCategory, message: formMessage, favorite: formFavorite,
        uses: 0, updatedAt: 'Agora',
      };
      setResponses(prev => [newResp, ...prev]);
    }
    setModalOpen(false);
    try { await onboardingApi.completeStep('responses'); } catch {}
  };

  const handleDuplicate = (resp) => {
    const dup = { ...resp, id: Date.now(), title: resp.title + ' (Copia)', uses: 0, updatedAt: 'Agora' };
    setResponses(prev => [dup, ...prev]);
  };

  const handleDelete = (id) => {
    setResponses(prev => prev.filter(r => r.id !== id));
    setDeleteConfirm(null);
  };

  const handleToggleFav = (id) => {
    setResponses(prev => prev.map(r => r.id === id ? { ...r, favorite: !r.favorite } : r));
  };

  const insertVariable = (varKey) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newText = formMessage.substring(0, start) + varKey + formMessage.substring(end);
    setFormMessage(newText);
    setShowVarMenu(false);
    setTimeout(() => {
      ta.selectionStart = ta.selectionEnd = start + varKey.length;
      ta.focus();
    }, 0);
  };

  const handleExport = () => {
    const data = JSON.stringify(responses, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'respostas-rapidas.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const addCustomCategory = () => {
    if (!newCatName.trim()) return;
    setCustomCategories(prev => [...prev, { id: newCatName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-'), label: newCatName, color: newCatColor }]);
    setNewCatModal(false);
    setNewCatName('');
    setNewCatColor('var(--zelt-primary)');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--zelt-primary)]/8 flex items-center justify-center">
            <Zap size={16} className="text-[var(--zelt-primary)]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-[#ededed]">Respostas Rapidas</h2>
            <p className="text-[10px] text-gray-400 dark:text-[#666]">{responses.length} respostas cadastradas</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 dark:text-[#808080] bg-gray-100 dark:bg-[#1a1a1a] hover:bg-gray-200 rounded-lg transition-colors">
            <Download size={12} /> Exportar
          </button>
          <button onClick={() => setImportModal(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 dark:text-[#808080] bg-gray-100 dark:bg-[#1a1a1a] hover:bg-gray-200 rounded-lg transition-colors">
            <Upload size={12} /> Importar
          </button>
          <button onClick={openCreate} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[var(--zelt-primary)] hover:bg-[var(--zelt-primary-hover)] rounded-lg transition-colors">
            <Plus size={14} /> Nova Resposta
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#666]" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar respostas..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 dark:border-white/[0.06] rounded-lg focus:outline-none focus:border-[var(--zelt-primary)]/40 transition-colors bg-white dark:bg-[#141414]"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-2.5 py-1.5 text-xs rounded-lg border transition-colors ${
              filterCategory === 'all'
                ? 'bg-[var(--zelt-primary)]/8 text-[var(--zelt-primary)] border-[var(--zelt-primary)]/25'
                : 'bg-white dark:bg-[#141414] text-gray-500 dark:text-[#808080] border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'
            }`}
          >
            Todas
          </button>
          {allCategories.map(c => (
            <button
              key={c.id}
              onClick={() => setFilterCategory(c.id)}
              className={`px-2.5 py-1.5 text-xs rounded-lg border transition-colors ${
                filterCategory === c.id
                  ? 'bg-[var(--zelt-primary)]/8 text-[var(--zelt-primary)] border-[var(--zelt-primary)]/25'
                  : 'bg-white dark:bg-[#141414] text-gray-500 dark:text-[#808080] border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'
              }`}
            >
              {c.label}
            </button>
          ))}
          <span className="w-px h-4 bg-gray-200 dark:bg-white/[0.08] mx-1.5" />
          <button
            onClick={() => setSortBy('recent')}
            className={`px-2.5 py-1.5 text-xs rounded-lg border transition-colors ${
              sortBy === 'recent'
                ? 'bg-[var(--zelt-primary)]/8 text-[var(--zelt-primary)] border-[var(--zelt-primary)]/25'
                : 'bg-white dark:bg-[#141414] text-gray-500 dark:text-[#808080] border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'
            }`}
          >
            Mais recentes
          </button>
          <button
            onClick={() => setSortBy('uses')}
            className={`px-2.5 py-1.5 text-xs rounded-lg border transition-colors ${
              sortBy === 'uses'
                ? 'bg-[var(--zelt-primary)]/8 text-[var(--zelt-primary)] border-[var(--zelt-primary)]/25'
                : 'bg-white dark:bg-[#141414] text-gray-500 dark:text-[#808080] border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'
            }`}
          >
            Mais usadas
          </button>
          <button
            onClick={() => setSortBy('name')}
            className={`px-2.5 py-1.5 text-xs rounded-lg border transition-colors ${
              sortBy === 'name'
                ? 'bg-[var(--zelt-primary)]/8 text-[var(--zelt-primary)] border-[var(--zelt-primary)]/25'
                : 'bg-white dark:bg-[#141414] text-gray-500 dark:text-[#808080] border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'
            }`}
          >
            Nome
          </button>
        </div>
      </div>

      {/* Response Cards */}
      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--zelt-primary)]/8 flex items-center justify-center mb-4">
            <Zap size={24} className="text-[var(--zelt-primary)]" />
          </div>
          <h3 className="text-sm text-gray-900 dark:text-[#ededed] mb-1">Nenhuma resposta rapida</h3>
          <p className="text-sm text-gray-400 dark:text-[#666] max-w-[320px] mb-5">Crie respostas padronizadas para agilizar o atendimento.</p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm text-white bg-[var(--zelt-primary)] hover:bg-[var(--zelt-primary-hover)] rounded-lg transition-colors"
          >
            <Plus size={14} /> Nova Resposta
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-[#1a1a1a] flex items-center justify-center mb-3">
            <MessageSquare size={20} className="text-gray-300 dark:text-[#555]" />
          </div>
          <h3 className="text-sm text-gray-900 dark:text-[#ededed] mb-1">Nenhuma resposta encontrada</h3>
          <p className="text-xs text-gray-400 dark:text-[#666] max-w-[240px]">Crie sua primeira resposta rapida para agilizar o atendimento.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(resp => {
            const cat = getCategoryInfo(resp.category);
            return (
              <div key={resp.id}
                className="group relative bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-4 hover:border-gray-300 dark:hover:border-white/15 transition-all"
              >
                <div className="flex items-start gap-3">
                  <button onClick={() => handleToggleFav(resp.id)} className="mt-0.5 shrink-0">
                    {resp.favorite
                      ? <Star size={14} className="text-amber-400 fill-amber-400" />
                      : <StarOff size={14} className="text-gray-300 dark:text-[#555] hover:text-amber-400 transition-colors" />
                    }
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xs font-semibold text-gray-900 dark:text-[#ededed]">{resp.title}</h3>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono text-gray-500 dark:text-[#808080] bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/[0.06]">
                        {resp.shortcut}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium border"
                        style={{ color: cat.color, backgroundColor: cat.color + '10', borderColor: cat.color + '20' }}>
                        {cat.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-[#808080] leading-relaxed line-clamp-2">{resp.message}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400 dark:text-[#666]">
                      <span className="flex items-center gap-1"><Clock size={9} /> {resp.updatedAt}</span>
                      <span className="flex items-center gap-1"><BarChart3 size={9} /> {resp.uses} usos</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => openEdit(resp)} className="p-1.5 text-gray-400 dark:text-[#666] hover:text-[var(--zelt-primary)] hover:bg-[var(--zelt-primary)]/5 rounded-lg transition-colors" title="Editar">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDuplicate(resp)} className="p-1.5 text-gray-400 dark:text-[#666] hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Duplicar">
                      <Copy size={13} />
                    </button>
                    <button onClick={() => setDeleteConfirm(resp.id)} className="p-1.5 text-gray-400 dark:text-[#666] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {deleteConfirm === resp.id && (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center gap-2 z-10 border border-red-200 dark:border-red-500/40">
                    <AlertCircle size={14} className="text-red-500" />
                    <span className="text-xs text-gray-700 dark:text-[#ccc]">Excluir esta resposta?</span>
                    <button onClick={() => handleDelete(resp.id)} className="px-2.5 py-1 text-[11px] font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors">Sim</button>
                    <button onClick={() => setDeleteConfirm(null)} className="px-2.5 py-1 text-[11px] font-medium text-gray-500 dark:text-[#808080] bg-gray-100 dark:bg-[#1a1a1a] hover:bg-gray-200 rounded-md transition-colors">Nao</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ===== CREATE/EDIT MODAL ===== */}
      {modalOpen && (
        <Modal
          open
          onClose={() => setModalOpen(false)}
          size="xl"
          title={editing ? 'Editar Resposta' : 'Nova Resposta'}
          subtitle="Modelo de mensagem com variaveis dinamicas"
          icon={<Zap size={16} className="text-[var(--zelt-primary)]" />}
          bodyClassName="flex overflow-hidden p-0"
          footer={
            <>
              <div className="flex items-center gap-2">
                <button onClick={() => setFormFavorite(!formFavorite)} className="p-1.5 rounded-lg transition-colors hover:bg-gray-100">
                  {formFavorite
                    ? <Star size={16} className="text-amber-400 fill-amber-400" />
                    : <StarOff size={16} className="text-gray-400 dark:text-[#666]" />
                  }
                </button>
                <button onClick={() => setNewCatModal(true)} className="text-[11px] text-[var(--zelt-primary)] hover:underline">+ Nova categoria</button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setModalOpen(false)} className="px-3 py-1.5 text-xs text-gray-500 dark:text-[#808080] hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
                <button onClick={handleSave} disabled={!formTitle.trim() || !formMessage.trim()}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-[var(--zelt-primary)] hover:bg-[var(--zelt-primary-hover)] rounded-lg transition-colors disabled:opacity-40">
                  {editing ? 'Salvar' : 'Criar Resposta'}
                </button>
              </div>
            </>
          }
        >
          {/* Left: Form */}
          <div className="flex-1 min-w-0 p-5 space-y-4 overflow-y-auto md:border-r border-gray-100 dark:border-white/[0.06]">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-gray-400 dark:text-[#666] uppercase tracking-wider mb-1">Titulo</label>
                    <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Ex: Boas-vindas"
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg focus:outline-none focus:border-[var(--zelt-primary)]/40 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-400 dark:text-[#666] uppercase tracking-wider mb-1">Atalho</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-[#666] font-mono">/</span>
                      <input type="text" value={formShortcut.replace('/', '')} onChange={(e) => setFormShortcut('/' + e.target.value.replace('/', ''))}
                        placeholder="boasvindas"
                        className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg focus:outline-none focus:border-[var(--zelt-primary)]/40 transition-colors font-mono" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-gray-400 dark:text-[#666] uppercase tracking-wider mb-1">Categoria</label>
                  <div className="relative">
                    <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg appearance-none focus:outline-none focus:border-[var(--zelt-primary)]/40 transition-colors bg-white dark:bg-[#141414]">
                      {allCategories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#666] pointer-events-none" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-medium text-gray-400 dark:text-[#666] uppercase tracking-wider">Mensagem</label>
                    <div className="relative">
                      <button onClick={() => setShowVarMenu(!showVarMenu)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-[var(--zelt-primary)] bg-[var(--zelt-primary)]/5 border border-[var(--zelt-primary)]/10 rounded-md hover:bg-[var(--zelt-primary)]/10 transition-colors">
                        <Hash size={10} /> Variaveis
                      </button>
                      {showVarMenu && (
                        <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl shadow-lg py-1.5 z-20">
                          <p className="px-3 py-1 text-[9px] text-gray-400 dark:text-[#666] uppercase tracking-wider">Inserir variavel</p>
                          {VARIABLES.map(v => (
                            <button key={v.key} onClick={() => insertVariable(v.key)}
                              className="w-full text-left px-3 py-1.5 text-[11px] text-gray-700 dark:text-[#ccc] hover:bg-gray-50 dark:bg-[#111] dark:hover:bg-[#1a1a1a] transition-colors flex items-center justify-between">
                              <span className="font-mono text-[var(--zelt-primary)]">{v.key}</span>
                              <span className="text-gray-400 dark:text-[#666]">{v.sample}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <textarea ref={textareaRef} value={formMessage} onChange={(e) => setFormMessage(e.target.value)}
                    rows={8} placeholder="Escreva sua mensagem aqui..."
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg focus:outline-none focus:border-[var(--zelt-primary)]/40 transition-colors resize-none leading-relaxed" />
                  <p className="text-[10px] text-gray-400 dark:text-[#666] mt-1 text-right">{formMessage.length} caracteres</p>
                </div>
              </div>

              {/* Right: WhatsApp Preview */}
              <div className="hidden md:flex w-[300px] lg:w-[320px] shrink-0 flex-col bg-[#e5ddd5] dark:bg-[#1f2c33]">
                <div className="px-4 py-2.5 bg-[#075e54] dark:bg-[#0b141a] flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-[10px] font-bold">JS</div>
                  <div>
                    <p className="text-xs font-medium text-white">{VARIABLES[0].sample}</p>
                    <p className="text-[9px] text-white/60">online</p>
                  </div>
                </div>

                <div className="flex-1 p-3 overflow-y-auto">
                  <div className="max-w-[85%] ml-auto">
                    <div className="bg-[#dcf8c6] dark:bg-[#005c4b] rounded-lg px-3 py-2 shadow-sm">
                      <p className="text-[12px] text-gray-800 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                        {formMessage ? replaceVars(formMessage) : (
                          <span className="text-gray-400 dark:text-[#666] italic">Sua mensagem aparecera aqui...</span>
                        )}
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[9px] text-gray-500 dark:text-[#808080]">14:30</span>
                        <Check size={11} className="text-blue-500" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-3 py-2 bg-[#f0f0f0] dark:bg-[#0b141a] border-t border-gray-200 dark:border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-8 bg-white dark:bg-[#141414] rounded-full px-3 flex items-center">
                      <span className="text-[11px] text-gray-400 dark:text-[#666]">Digite uma mensagem</span>
                    </div>
                    <div className="w-8 h-8 bg-[#075e54] dark:bg-[#0b141a] rounded-full flex items-center justify-center">
                      <MessageSquare size={12} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
          </Modal>
        )}

      {/* ===== NEW CATEGORY MODAL ===== */}
      {newCatModal && (
        <Modal
          open
          onClose={() => setNewCatModal(false)}
          size="sm"
          title="Nova Categoria"
          subtitle="Agrupe suas respostas por tema"
          icon={<Tag size={16} className="text-[var(--zelt-primary)]" />}
          footer={
            <>
              <button onClick={() => setNewCatModal(false)} className="px-3 py-1.5 text-xs text-gray-500 dark:text-[#808080] hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
              <button onClick={addCustomCategory} disabled={!newCatName.trim()}
                className="px-3 py-1.5 text-xs font-medium text-white bg-[var(--zelt-primary)] hover:bg-[var(--zelt-primary-hover)] rounded-lg transition-colors disabled:opacity-40">
                Criar
              </button>
            </>
          }
        >
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-medium text-gray-400 dark:text-[#666] uppercase tracking-wider mb-1">Nome</label>
              <input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Ex: Promocoes"
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg focus:outline-none focus:border-[var(--zelt-primary)]/40 transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-400 dark:text-[#666] uppercase tracking-wider mb-1">Cor</label>
              <div className="flex items-center gap-2">
                <input type="color" value={newCatColor} onChange={(e) => setNewCatColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border border-gray-200 dark:border-white/[0.06] cursor-pointer" />
                <span className="text-xs text-gray-500 dark:text-[#808080] font-mono">{newCatColor}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ===== IMPORT MODAL ===== */}
      {importModal && (
        <Modal
          open
          onClose={() => setImportModal(false)}
          size="sm"
          title="Importar Respostas"
          subtitle="Restaurar respostas de um backup"
          icon={<Upload size={16} className="text-[var(--zelt-primary)]" />}
          footer={
            <>
              <button onClick={() => setImportModal(false)} className="px-3 py-1.5 text-xs text-gray-500 dark:text-[#808080] hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
              <button className="px-3 py-1.5 text-xs font-medium text-white bg-[var(--zelt-primary)] hover:bg-[var(--zelt-primary-hover)] rounded-lg transition-colors">Importar</button>
            </>
          }
        >
          <p className="text-xs text-gray-400 dark:text-[#666] mb-4">Selecione um arquivo JSON exportado anteriormente.</p>
          <div className="border-2 border-dashed border-gray-200 dark:border-white/[0.06] rounded-xl p-8 text-center hover:border-[var(--zelt-primary)]/40 transition-colors cursor-pointer">
            <Upload size={24} className="text-gray-300 dark:text-[#555] mx-auto mb-2" />
            <p className="text-xs text-gray-500 dark:text-[#808080]">Arraste ou clique para selecionar</p>
            <p className="text-[10px] text-gray-400 dark:text-[#666] mt-1">.json</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
