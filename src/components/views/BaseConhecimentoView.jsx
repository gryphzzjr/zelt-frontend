import { useState, useRef, useEffect } from 'react';
import {
  Search, Plus, FileText, Folder, MoreHorizontal, Pencil,
  Trash2, Eye, EyeOff, Clock, X, Check,
  Upload, File, LayoutGrid, List, Star, Archive,
  Copy, ArrowUpDown, AlertCircle, SlidersHorizontal, BookOpen,
} from 'lucide-react';
import { knowledgeApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

const CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'produtos', label: 'Produtos' },
  { id: 'financeiro', label: 'Financeiro' },
  { id: 'comercial', label: 'Comercial' },
  { id: 'suporte', label: 'Suporte' },
  { id: 'rh', label: 'Recursos Humanos' },
  { id: 'juridico', label: 'Juridico' },
  { id: 'institucional', label: 'Institucional' },
];

const CONTENT_TYPES = [
  { id: 'all', label: 'Todos', icon: FileText },
  { id: 'texto', label: 'Texto', icon: FileText },
  { id: 'pdf', label: 'PDF', icon: File },
  { id: 'docx', label: 'DOCX', icon: FileText },
  { id: 'txt', label: 'TXT', icon: File },
];

const STATUS_OPTIONS = [
  { id: 'all', label: 'Todos' },
  { id: 'active', label: 'Ativo' },
  { id: 'inactive', label: 'Inativo' },
];

const SORT_OPTIONS = [
  { id: 'recent', label: 'Mais recentes' },
  { id: 'oldest', label: 'Mais antigos' },
  { id: 'name', label: 'Nome' },
  { id: 'category', label: 'Categoria' },
  { id: 'used', label: 'Mais utilizados' },
];

function getTypeIcon(type) {
  const map = { texto: FileText, pdf: File, docx: FileText, txt: File };
  return map[type] || FileText;
}

function getTypeLabel(type) {
  return CONTENT_TYPES.find(t => t.id === type)?.label || type;
}

function getStatusInfo(status) {
  return status === 'active'
    ? { label: 'Ativo', color: '#10B981', bg: '#10B98112' }
    : { label: 'Inativo', color: '#9CA3AF', bg: '#9CA3AF12' };
}

function mapBackendItem(item) {
  return {
    ...item,
    status: item.status?.toLowerCase() || 'active',
    type: item.type === 'text' ? 'texto' : item.type,
    author: item.author?.name || 'Sistema',
    excerpt: item.content?.slice(0, 120) + (item.content?.length > 120 ? '...' : '') || '',
    tags: Array.isArray(item.tags) ? item.tags : [],
    updatedAt: new Date(item.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
  };
}

function mapFrontendType(type) {
  return type === 'texto' ? 'text' : type;
}

export default function BaseConhecimentoView() {
  const { workspace } = useAuth();
  const workspaceId = workspace?.id;

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeType, setActiveType] = useState('all');
  const [activeStatus, setActiveStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('list');
  const [selectedContent, setSelectedContent] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [contents, setContents] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, totalUsage: 0 });
  const [hasData, setHasData] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', content: '', category: '', tags: '' });
  const filterRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchItems = async () => {
    if (!workspaceId) return;
    try {
      const res = await knowledgeApi.list(workspaceId);
      if (res.success) {
        const mapped = res.items.map(mapBackendItem);
        setContents(mapped);
        setHasData(mapped.length > 0);
      }
    } catch (err) {
      showToast('Erro ao carregar conteudos', 'error');
    }
  };

  const fetchStats = async () => {
    if (!workspaceId) return;
    try {
      const res = await knowledgeApi.stats(workspaceId);
      if (res.success) {
        const s = res.stats;
        const totalUsage = s.byCategory ? Object.values(s.byCategory).reduce((sum, cat) => sum + (cat.usageCount || 0), 0) : 0;
        setStats({ total: s.total, active: s.active, inactive: s.inactive, totalUsage });
      }
    } catch (err) {
      showToast('Erro ao carregar estatisticas', 'error');
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchItems(), fetchStats()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, [workspaceId]);

  useEffect(() => {
    const handleClick = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = contents.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || (c.tags || []).some(t => t.includes(search.toLowerCase()));
    const matchCategory = activeCategory === 'all' || c.category === activeCategory;
    const matchType = activeType === 'all' || c.type === activeType;
    const matchStatus = activeStatus === 'all' || c.status === activeStatus;
    return matchSearch && matchCategory && matchType && matchStatus;
  }).sort((a, b) => {
    if (sortBy === 'recent') return 0;
    if (sortBy === 'oldest') return 0;
    if (sortBy === 'name') return a.title.localeCompare(b.title);
    if (sortBy === 'category') return a.category.localeCompare(b.category);
    if (sortBy === 'used') return b.usageCount - a.usageCount;
    return 0;
  });

  const handleDelete = async (item) => {
    setMenuOpen(null);
    try {
      await knowledgeApi.delete(workspaceId, item.id);
      showToast('Conteudo excluido com sucesso');
      fetchAll();
    } catch (err) {
      showToast('Erro ao excluir conteudo', 'error');
    }
  };

  const handleToggleStatus = async (item) => {
    setMenuOpen(null);
    try {
      const newStatus = item.status === 'active' ? 'INACTIVE' : 'ACTIVE';
      await knowledgeApi.update(workspaceId, item.id, { status: newStatus });
      showToast(item.status === 'active' ? 'Conteudo desativado' : 'Conteudo ativado');
      fetchAll();
    } catch (err) {
      showToast('Erro ao alterar status', 'error');
    }
  };

  const handleToggleFavorite = async (item) => {
    try {
      await knowledgeApi.update(workspaceId, item.id, { favorite: !item.favorite });
      fetchItems();
    } catch (err) {
      showToast('Erro ao alterar favorito', 'error');
    }
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setEditForm({
      title: item.title || '',
      content: item.content || '',
      category: item.category || '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
    });
  };

  const handleSaveEdit = async () => {
    if (!editForm.title.trim()) return;
    try {
      const payload = {
        title: editForm.title.trim(),
        content: editForm.content,
        category: editForm.category,
        tags: editForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      await knowledgeApi.update(workspaceId, editingItem.id, payload);
      setEditingItem(null);
      showToast('Conteudo atualizado com sucesso');
      fetchAll();
    } catch (err) {
      showToast('Erro ao atualizar conteudo', 'error');
    }
  };

  const handleDuplicate = async (item) => {
    try {
      const formData = new FormData();
      formData.append('title', item.title + ' (Copia)');
      formData.append('content', item.content || '');
      formData.append('category', item.category);
      formData.append('type', mapFrontendType(item.type));
      formData.append('status', 'ACTIVE');
      formData.append('tags', JSON.stringify(item.tags || []));
      await knowledgeApi.create(workspaceId, formData);
      showToast('Conteudo duplicado com sucesso');
      fetchAll();
    } catch (err) {
      showToast('Erro ao duplicar conteudo', 'error');
    }
  };

  const handleArchive = async (item) => {
    try {
      const newStatus = item.status === 'inactive' ? 'ACTIVE' : 'INACTIVE';
      await knowledgeApi.update(workspaceId, item.id, { status: newStatus });
      showToast(item.status === 'inactive' ? 'Conteudo ativado' : 'Conteudo desativado');
      fetchAll();
    } catch (err) {
      showToast('Erro ao alterar status', 'error');
    }
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setEditingItem(null);
      }
    };
    if (editingItem) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [editingItem]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300;1,9..40,400&display=swap');
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.97); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .animate-fade { animation: fadeIn 0.15s ease-out forwards; }
        .animate-scale { animation: scaleUp 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .kb-view * { font-family: 'DM Sans', system-ui, sans-serif; }
        .skeleton-line { background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 6px; }
      `}</style>

      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-2.5 rounded-xl text-xs shadow-lg animate-scale ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
          {toast.message}
        </div>
      )}

      <div className="kb-view flex flex-col h-[calc(100vh-64px)] p-6 overflow-y-auto text-gray-800">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-xl text-gray-900 dark:text-[#ededed] tracking-tight">Base de Conhecimento</h1>
            <p className="text-xs text-gray-400 dark:text-[#666] mt-0.5">Cadastre as informacoes que a IA utilizara para responder seus clientes.</p>
          </div>
          <div className="flex items-center gap-2 self-end md:self-auto">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#666]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar conteudos..."
                className="pl-8 pr-3 py-2 text-xs border border-gray-200/80 rounded-xl bg-white dark:bg-[#141414] text-gray-700 dark:text-[#ccc] placeholder-gray-400 dark:placeholder-[#555] outline-none focus:border-[#7C3AED]/40 transition-all w-48"
              />
            </div>
            <button onClick={() => setIsCreateOpen('create')} className="flex items-center gap-1 px-3.5 py-2 text-xs text-white bg-[#7C3AED] rounded-xl hover:bg-[#6D32D9] transition-all">
              <Plus size={14} /> Novo Conteudo
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Total', value: stats.total, icon: FileText, color: '#7C3AED' },
            { label: 'Ativos', value: stats.active, icon: Eye, color: '#10B981' },
            { label: 'Inativos', value: stats.inactive, icon: EyeOff, color: '#9CA3AF' },
            { label: 'Usos pela IA', value: stats.totalUsage.toLocaleString(), icon: Star, color: '#F59E0B' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white dark:bg-[#141414] p-3.5 rounded-xl border border-gray-200/60 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${s.color}10` }}>
                  <Icon size={14} color={s.color} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wide">{s.label}</p>
                  <p className="text-base text-gray-800 mt-0.5">{s.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters row */}
        <div className="flex items-center gap-3 mb-4">
          {/* Filtros button */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[11px] rounded-xl border transition-all
                ${filterOpen || activeCategory !== 'all' || activeType !== 'all' || activeStatus !== 'all'
                  ? 'bg-[#7C3AED]/8 text-[#7C3AED] border-[#7C3AED]/20'
                  : 'bg-white dark:bg-[#141414] text-gray-500 dark:text-[#808080] border-gray-200/60 hover:bg-gray-50 dark:bg-[#111] dark:hover:bg-[#1a1a1a]'}`}
            >
              <SlidersHorizontal size={12} />
              Filtros
              {(activeCategory !== 'all' || activeType !== 'all' || activeStatus !== 'all') && (
                <span className="w-4 h-4 rounded-full bg-[#7C3AED] text-white text-[9px] flex items-center justify-center">
                  {[activeCategory, activeType, activeStatus].filter(v => v !== 'all').length}
                </span>
              )}
            </button>

            {filterOpen && (
              <div className="absolute left-0 top-full mt-1.5 bg-white dark:bg-[#141414] border border-gray-200/60 rounded-xl py-3 min-w-[220px] z-20 animate-scale shadow-lg max-h-[320px] overflow-y-auto">
                {/* Category */}
                <div className="px-3 mb-3">
                  <p className="text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wide mb-2">Categoria</p>
                  <div className="flex flex-wrap gap-1">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-2 py-1 rounded-lg text-[10px] transition-all border
                          ${activeCategory === cat.id
                            ? 'bg-[#7C3AED]/8 text-[#7C3AED] border-[#7C3AED]/20'
                            : 'bg-white dark:bg-[#141414] text-gray-500 dark:text-[#808080] border-gray-200/60 hover:bg-gray-50 dark:bg-[#111] dark:hover:bg-[#1a1a1a]'}`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-white/[0.06] mx-3 mb-3" />

                {/* Type */}
                <div className="px-3 mb-3">
                  <p className="text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wide mb-2">Tipo</p>
                  <div className="flex flex-wrap gap-1">
                    {CONTENT_TYPES.map(t => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setActiveType(t.id)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] transition-all border
                            ${activeType === t.id
                              ? 'bg-[#7C3AED]/8 text-[#7C3AED] border-[#7C3AED]/20'
                              : 'bg-white dark:bg-[#141414] text-gray-500 dark:text-[#808080] border-gray-200/60 hover:bg-gray-50 dark:bg-[#111] dark:hover:bg-[#1a1a1a]'}`}
                        >
                          {t.id !== 'all' && <Icon size={10} />} {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-white/[0.06] mx-3 mb-3" />

                {/* Status */}
                <div className="px-3 mb-3">
                  <p className="text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wide mb-2">Status</p>
                  <div className="flex gap-1">
                    {STATUS_OPTIONS.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setActiveStatus(s.id)}
                        className={`px-2 py-1 rounded-lg text-[10px] transition-all border
                          ${activeStatus === s.id
                            ? 'bg-[#7C3AED]/8 text-[#7C3AED] border-[#7C3AED]/20'
                            : 'bg-white dark:bg-[#141414] text-gray-500 dark:text-[#808080] border-gray-200/60 hover:bg-gray-50 dark:bg-[#111] dark:hover:bg-[#1a1a1a]'}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Limpar */}
                {(activeCategory !== 'all' || activeType !== 'all' || activeStatus !== 'all') && (
                  <>
                    <div className="border-t border-gray-100 dark:border-white/[0.06] mx-3 mb-2" />
                    <button
                      onClick={() => { setActiveCategory('all'); setActiveType('all'); setActiveStatus('all'); }}
                      className="w-full px-3 py-1.5 text-[10px] text-red-500 hover:bg-red-50 transition-colors text-left"
                    >
                      Limpar filtros
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Active filters chips */}
          <div className="flex items-center gap-1.5 flex-wrap flex-1">
            {activeCategory !== 'all' && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] bg-[#7C3AED]/8 text-[#7C3AED] border border-[#7C3AED]/20">
                {CATEGORIES.find(c => c.id === activeCategory)?.label}
                <button onClick={() => setActiveCategory('all')} className="hover:opacity-60"><X size={10} /></button>
              </span>
            )}
            {activeType !== 'all' && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] bg-[#7C3AED]/8 text-[#7C3AED] border border-[#7C3AED]/20">
                {CONTENT_TYPES.find(t => t.id === activeType)?.label}
                <button onClick={() => setActiveType('all')} className="hover:opacity-60"><X size={10} /></button>
              </span>
            )}
            {activeStatus !== 'all' && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] bg-[#7C3AED]/8 text-[#7C3AED] border border-[#7C3AED]/20">
                {STATUS_OPTIONS.find(s => s.id === activeStatus)?.label}
                <button onClick={() => setActiveStatus('all')} className="hover:opacity-60"><X size={10} /></button>
              </span>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-gray-400 dark:text-[#666]">{filtered.length} conteudos encontrados</span>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="appearance-none pl-2.5 pr-6 py-1 text-[11px] border border-gray-200/60 rounded-lg bg-white dark:bg-[#141414] text-gray-600 dark:text-[#aaa] outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
              <ArrowUpDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#666] pointer-events-none" />
            </div>
            <div className="flex border border-gray-200/60 rounded-lg overflow-hidden">
              <button onClick={() => setViewMode('list')} className={`p-1.5 transition-colors ${viewMode === 'list' ? 'bg-[#7C3AED]/8 text-[#7C3AED]' : 'text-gray-400 dark:text-[#666] hover:bg-gray-50 dark:bg-[#111] dark:hover:bg-[#1a1a1a]'}`}>
                <List size={13} />
              </button>
              <button onClick={() => setViewMode('cards')} className={`p-1.5 transition-colors ${viewMode === 'cards' ? 'bg-[#7C3AED]/8 text-[#7C3AED]' : 'text-gray-400 dark:text-[#666] hover:bg-gray-50 dark:bg-[#111] dark:hover:bg-[#1a1a1a]'}`}>
                <LayoutGrid size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {!hasData && !loading ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[320px]">
            <div className="w-16 h-16 rounded-2xl bg-[var(--zelt-primary)]/5 border border-[var(--zelt-primary)]/10 flex items-center justify-center mb-4">
              <BookOpen size={28} className="text-[var(--zelt-primary)]/40" strokeWidth={1.5} />
            </div>
            <h3 className="text-base text-gray-800 mb-1">Base de conhecimento vazia</h3>
            <p className="text-sm text-gray-400 dark:text-[#666] max-w-[340px] text-center leading-relaxed">
              Adicione artigos, documentos e FAQs para que a IA possa responder seus clientes.
            </p>
          </div>
        ) : loading ? (
          <div className="bg-white dark:bg-[#141414] rounded-xl border border-gray-200/60 overflow-hidden flex-1 p-4 space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center gap-4 p-3">
                <div className="w-8 h-8 rounded-lg skeleton-line shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-48 skeleton-line" />
                  <div className="h-2.5 w-72 skeleton-line" />
                </div>
                <div className="w-16 h-5 rounded-full skeleton-line shrink-0" />
              </div>
            ))}
          </div>
        ) : viewMode === 'list' ? (
          <div className="bg-white dark:bg-[#141414] rounded-xl border border-gray-200/60 flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[280px] gap-2 text-gray-400 dark:text-[#666]">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] flex items-center justify-center">
                    <FileText size={20} className="text-gray-300 dark:text-[#555]" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-[#808080]">Nenhum conteudo encontrado</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100/80">
                  {filtered.map(item => {
                    const status = getStatusInfo(item.status);
                    const TypeIcon = getTypeIcon(item.type);
                    return (
                      <div key={item.id} className="px-5 py-3.5 hover:bg-[#7C3AED]/[0.02] transition-colors cursor-pointer group" onClick={() => setSelectedContent(item)}>
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] flex items-center justify-center shrink-0">
                            <TypeIcon size={14} className="text-gray-400 dark:text-[#666]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h3 className="text-sm text-gray-800 truncate">{item.title}</h3>
                              <button onClick={e => { e.stopPropagation(); handleToggleFavorite(item); }} className="shrink-0 p-0.5 hover:opacity-70 transition-opacity">
                                {item.favorite ? <Star size={11} className="text-amber-400 fill-amber-400" /> : <Star size={11} className="text-gray-300 dark:text-[#555]" />}
                              </button>
                              <span className="text-[9px] px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0" style={{ background: status.bg, color: status.color }}>{status.label}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-[#666]">
                              <span className="flex items-center gap-1"><Folder size={9} /> {item.category}</span>
                              <span className="flex items-center gap-1"><TypeIcon size={9} /> {getTypeLabel(item.type)}</span>
                              <span className="flex items-center gap-1"><Clock size={9} /> {item.updatedAt}</span>
                              <span className="flex items-center gap-1"><Star size={9} /> {item.usageCount} usos</span>
                              {item.usageCount === 0 && item.status === 'inactive' && (
                                <span className="flex items-center gap-0.5 text-amber-500"><AlertCircle size={9} /> Desatualizado</span>
                              )}
                            </div>
                          </div>
                          <div className="relative shrink-0">
                            <button
                              onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === item.id ? null : item.id); }}
                              className="p-1 text-gray-400 dark:text-[#666] hover:text-gray-600 dark:text-[#aaa] dark:hover:text-[#ccc] hover:bg-gray-50 dark:bg-[#111] dark:hover:bg-[#1a1a1a] rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <MoreHorizontal size={14} />
                            </button>
                            {menuOpen === item.id && (
                              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-[#141414] border border-gray-200/60 rounded-xl py-1 min-w-[150px] z-10 animate-scale">
                                <button onClick={e => { e.stopPropagation(); setMenuOpen(null); openEdit(item); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:bg-[#111] dark:hover:bg-[#1a1a1a] transition-colors"><Pencil size={11} /> Editar</button>
                                <button onClick={e => { e.stopPropagation(); setMenuOpen(null); handleDuplicate(item); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:bg-[#111] dark:hover:bg-[#1a1a1a] transition-colors"><Copy size={11} /> Duplicar</button>
                                <button onClick={e => { e.stopPropagation(); setMenuOpen(null); handleArchive(item); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:bg-[#111] dark:hover:bg-[#1a1a1a] transition-colors"><Archive size={11} /> {item.status === 'active' ? 'Desativar' : 'Ativar'}</button>
                                <button onClick={e => { e.stopPropagation(); handleToggleStatus(item); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:bg-[#111] dark:hover:bg-[#1a1a1a] transition-colors">
                                  {item.status === 'active' ? <><EyeOff size={11} /> Desativar</> : <><Eye size={11} /> Ativar</>}
                                </button>
                                <div className="border-t border-gray-100 dark:border-white/[0.06] my-1" />
                                <button onClick={e => { e.stopPropagation(); handleDelete(item); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={11} /> Excluir</button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* CARDS VIEW */
          <div className="grid grid-cols-3 gap-3 flex-1 overflow-y-auto pb-4">
            {filtered.length === 0 ? (
              <div className="col-span-3 flex flex-col items-center justify-center min-h-[280px] gap-2 text-gray-400 dark:text-[#666]">
                <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] flex items-center justify-center"><FileText size={20} className="text-gray-300 dark:text-[#555]" /></div>
                <p className="text-xs text-gray-500 dark:text-[#808080]">Nenhum conteudo encontrado</p>
              </div>
            ) : (
              filtered.map(item => {
                const status = getStatusInfo(item.status);
                const TypeIcon = getTypeIcon(item.type);
                return (
                  <div key={item.id} className="bg-white dark:bg-[#141414] rounded-xl border border-gray-200/60 p-4 hover:border-[#7C3AED]/20 transition-colors cursor-pointer" onClick={() => setSelectedContent(item)}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] flex items-center justify-center">
                        <TypeIcon size={16} className="text-gray-400 dark:text-[#666]" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={e => { e.stopPropagation(); handleToggleFavorite(item); }} className="p-0.5 hover:opacity-70 transition-opacity">
                          {item.favorite ? <Star size={12} className="text-amber-400 fill-amber-400" /> : <Star size={12} className="text-gray-300 dark:text-[#555]" />}
                        </button>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md" style={{ background: status.bg, color: status.color }}>{status.label}</span>
                      </div>
                    </div>
                    <h3 className="text-sm text-gray-800 mb-1 truncate">{item.title}</h3>
                    <p className="text-[11px] text-gray-400 dark:text-[#666] line-clamp-2 mb-3 leading-relaxed">{item.excerpt}</p>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {(item.tags || []).slice(0, 3).map(t => (
                        <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#1a1a1a] text-gray-500 dark:text-[#808080]">{t}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-gray-400 dark:text-[#666] pt-2 border-t border-gray-100 dark:border-white/[0.06]">
                      <span>{item.author}</span>
                      <span>{item.usageCount} usos</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* MODAL DETALHES */}
        {selectedContent && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 animate-fade" onClick={() => setSelectedContent(null)}>
            <div className="bg-white dark:bg-[#141414] rounded-xl w-full max-w-lg overflow-hidden border border-gray-200/60 animate-scale relative" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/[0.06]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] flex items-center justify-center shrink-0">
                    {(() => { const Icon = getTypeIcon(selectedContent.type); return <Icon size={16} className="text-gray-400 dark:text-[#666]" />; })()}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm text-gray-900 dark:text-[#ededed] truncate">{selectedContent.title}</h2>
                    <p className="text-[10px] text-gray-400 dark:text-[#666] mt-0.5">{selectedContent.author} · {selectedContent.updatedAt}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedContent(null)} className="p-1 text-gray-400 dark:text-[#666] hover:text-gray-600 dark:text-[#aaa] dark:hover:text-[#ccc] hover:bg-gray-50 dark:bg-[#111] dark:hover:bg-[#1a1a1a] rounded-lg transition-colors"><X size={15} /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: getStatusInfo(selectedContent.status).bg, color: getStatusInfo(selectedContent.status).color }}>{getStatusInfo(selectedContent.status).label}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-[#1a1a1a] text-gray-600 dark:text-[#aaa] flex items-center gap-1">{(() => { const Icon = getTypeIcon(selectedContent.type); return <Icon size={9} />; })()} {getTypeLabel(selectedContent.type)}</span>
                  <span className="text-[10px] text-gray-400 dark:text-[#666] ml-auto flex items-center gap-1"><Folder size={10} /> {selectedContent.category}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-[#808080] leading-relaxed">{selectedContent.excerpt}</p>
                <div className="flex flex-wrap gap-1">
                  {(selectedContent.tags || []).map(t => <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#1a1a1a] text-gray-500 dark:text-[#808080]">{t}</span>)}
                </div>
                <div className="flex items-center gap-4 text-[10px] text-gray-400 dark:text-[#666] pt-2 border-t border-gray-100 dark:border-white/[0.06]">
                  <span className="flex items-center gap-1"><Star size={10} /> {selectedContent.usageCount} usos pela IA</span>
                  <span className="flex items-center gap-1"><Clock size={10} /> {selectedContent.updatedAt}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-4 border-t border-gray-100 dark:border-white/[0.06]">
                <button onClick={() => setSelectedContent(null)} className="flex-1 px-3 py-2 text-xs text-gray-500 dark:text-[#808080] bg-gray-50 dark:bg-[#111] border border-gray-200/60 rounded-lg hover:bg-gray-100 transition-all">Fechar</button>
                <button onClick={() => { setSelectedContent(null); openEdit(selectedContent); }} className="flex-1 px-3 py-2 text-xs text-white bg-[#7C3AED] rounded-lg hover:bg-[#6D32D9] transition-all flex items-center justify-center gap-1"><Pencil size={12} /> Editar</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL CRIAR CONTEUDO */}
        {isCreateOpen && (
          <CreateContentModal onClose={() => setIsCreateOpen(null)} categories={CATEGORIES.filter(c => c.id !== 'all')} workspaceId={workspaceId} onSave={fetchAll} />
        )}

        {/* MODAL EDITAR CONTEUDO */}
        {editingItem && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 animate-fade" onClick={() => setEditingItem(null)}>
            <div className="bg-white dark:bg-[#141414] rounded-xl w-full max-w-2xl max-h-[85vh] overflow-hidden border border-gray-200/60 animate-scale relative flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/[0.06] shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/8 flex items-center justify-center"><Pencil size={14} className="text-[#7C3AED]" /></div>
                  <h2 className="text-sm text-gray-900 dark:text-[#ededed]">Editar Conteudo</h2>
                </div>
                <button onClick={() => setEditingItem(null)} className="p-1 text-gray-400 dark:text-[#666] hover:text-gray-600 dark:text-[#aaa] dark:hover:text-[#ccc] hover:bg-gray-50 dark:bg-[#111] dark:hover:bg-[#1a1a1a] rounded-lg transition-colors"><X size={15} /></button>
              </div>
              <div className="p-5 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="text-xs text-gray-500 dark:text-[#808080] block mb-1.5">Titulo</label>
                  <input type="text" placeholder="Titulo do conteudo" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="w-full px-3 py-2 text-xs border border-gray-200/80 rounded-xl outline-none focus:border-[#7C3AED]/40 transition-all" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-[#808080] block mb-1.5">Categoria</label>
                  <select value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} className="w-full px-3 py-2 text-xs border border-gray-200/80 rounded-xl outline-none bg-white dark:bg-[#141414] text-gray-700 dark:text-[#ccc]">
                    {CATEGORIES.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-[#808080] block mb-1.5">Tags</label>
                  <input type="text" placeholder="Separar por virgula" value={editForm.tags} onChange={e => setEditForm({ ...editForm, tags: e.target.value })} className="w-full px-3 py-2 text-xs border border-gray-200/80 rounded-xl outline-none focus:border-[#7C3AED]/40 transition-all" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-[#808080] block mb-1.5">Conteudo</label>
                  <textarea rows={8} placeholder="Escreva o conteudo aqui..." value={editForm.content} onChange={e => setEditForm({ ...editForm, content: e.target.value })} className="w-full px-3 py-2 text-xs border border-gray-200/80 rounded-xl outline-none focus:border-[#7C3AED]/40 transition-all resize-none leading-relaxed" />
                </div>
              </div>
              <div className="flex items-center gap-2 p-4 border-t border-gray-100 dark:border-white/[0.06] shrink-0">
                <button onClick={() => setEditingItem(null)} className="flex-1 px-3 py-2 text-xs text-gray-500 dark:text-[#808080] bg-gray-50 dark:bg-[#111] border border-gray-200/60 rounded-lg hover:bg-gray-100 transition-all">Cancelar</button>
                <button onClick={handleSaveEdit} disabled={!editForm.title.trim()} className="flex-1 px-3 py-2 text-xs text-white bg-[#7C3AED] rounded-lg hover:bg-[#6D32D9] transition-all flex items-center justify-center gap-1 disabled:opacity-50"><Check size={12} /> Salvar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function CreateContentModal({ onClose, categories, workspaceId, onSave }) {
  const [contentType, setContentType] = useState('texto');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[0]?.id || 'produtos');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const fileInputRef = useRef(null);

  const ACCEPT_MAP = {
    pdf: '.pdf',
    docx: '.docx',
    txt: '.txt',
  };

  const handleFile = (file) => {
    if (file) setSelectedFile(file);
  };

  const openSelector = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('tags', JSON.stringify(tags.split(',').map(t => t.trim()).filter(Boolean)));
      formData.append('type', mapFrontendType(contentType));
      formData.append('status', 'ACTIVE');

      if (contentType === 'texto') {
        formData.append('content', content);
      } else if (selectedFile) {
        formData.append('file', selectedFile);
      }

      await knowledgeApi.create(workspaceId, formData);
      onSave();
      onClose();
    } catch (err) {
      setSaving(false);
    }
  };

  const isFile = contentType === 'pdf' || contentType === 'docx' || contentType === 'txt';

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 animate-fade" onClick={onClose}>
      <div className="bg-white dark:bg-[#141414] rounded-xl w-full max-w-2xl max-h-[85vh] overflow-hidden border border-gray-200/60 animate-scale relative flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/[0.06] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/8 flex items-center justify-center"><Plus size={14} className="text-[#7C3AED]" /></div>
            <h2 className="text-sm text-gray-900 dark:text-[#ededed]">Novo Conteudo</h2>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 dark:text-[#666] hover:text-gray-600 dark:text-[#aaa] dark:hover:text-[#ccc] hover:bg-gray-50 dark:bg-[#111] dark:hover:bg-[#1a1a1a] rounded-lg transition-colors"><X size={15} /></button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Basic info */}
          <div>
            <label className="text-xs text-gray-500 dark:text-[#808080] block mb-1.5">Titulo</label>
            <input type="text" required placeholder="Titulo do conteudo" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 text-xs border border-gray-200/80 rounded-xl outline-none focus:border-[#7C3AED]/40 transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 dark:text-[#808080] block mb-1.5">Categoria</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 text-xs border border-gray-200/80 rounded-xl outline-none bg-white dark:bg-[#141414] text-gray-700 dark:text-[#ccc]">
                {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-[#808080] block mb-1.5">Descricao (opcional)</label>
              <input type="text" placeholder="Breve descricao" className="w-full px-3 py-2 text-xs border border-gray-200/80 rounded-xl outline-none focus:border-[#7C3AED]/40 transition-all" />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 dark:text-[#808080] block mb-1.5">Tags</label>
            <input type="text" placeholder="Separar por virgula" value={tags} onChange={e => setTags(e.target.value)} className="w-full px-3 py-2 text-xs border border-gray-200/80 rounded-xl outline-none focus:border-[#7C3AED]/40 transition-all" />
          </div>

          {/* Content type selector */}
          <div>
            <label className="text-xs text-gray-500 dark:text-[#808080] block mb-2">Tipo do conteudo</label>
            <div className="grid grid-cols-3 gap-1.5">
              {CONTENT_TYPES.filter(t => t.id !== 'all').map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => { setContentType(t.id); setSelectedFile(null); }}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl text-[10px] transition-all border
                      ${contentType === t.id
                        ? 'bg-[#7C3AED]/8 text-[#7C3AED] border-[#7C3AED]/20'
                        : 'bg-white dark:bg-[#141414] text-gray-500 dark:text-[#808080] border-gray-200/60 hover:bg-gray-50 dark:bg-[#111] dark:hover:bg-[#1a1a1a]'}`}
                  >
                    <Icon size={16} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic content area */}
          {contentType === 'texto' && (
            <div>
              <label className="text-xs text-gray-500 dark:text-[#808080] block mb-1.5">Conteudo</label>
              <textarea rows={5} placeholder="Escreva o conteudo aqui..." value={content} onChange={e => setContent(e.target.value)} className="w-full px-3 py-2 text-xs border border-gray-200/80 rounded-xl outline-none focus:border-[#7C3AED]/40 transition-all resize-none leading-relaxed" />
            </div>
          )}

          {isFile && (
            <div>
              <label className="text-xs text-gray-500 dark:text-[#808080] block mb-1.5">Arquivo</label>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={openSelector}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer
                  ${dragOver ? 'border-[#7C3AED]/40 bg-[#7C3AED]/[0.03]' : 'border-gray-200/80 dark:border-white/[0.06] hover:border-gray-300 dark:hover:border-white/15'}`}
              >
                {selectedFile ? (
                  <div className="flex flex-col items-center gap-1">
                    <File size={20} className="text-[#7C3AED]" />
                    <p className="text-xs text-gray-700 dark:text-[#ccc]">{selectedFile.name}</p>
                    <p className="text-[10px] text-gray-400 dark:text-[#666]">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    <button
                      onClick={e => { e.stopPropagation(); setSelectedFile(null); }}
                      className="text-[10px] text-red-500 hover:underline mt-1"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload size={20} className="mx-auto text-gray-300 dark:text-[#555] mb-2" />
                    <p className="text-xs text-gray-500 dark:text-[#808080] mb-1">Arraste o arquivo aqui ou clique para selecionar</p>
                    <p className="text-[10px] text-gray-400 dark:text-[#666]">{ACCEPT_MAP[contentType]?.toUpperCase()}</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept={ACCEPT_MAP[contentType]}
                  onChange={e => handleFile(e.target.files[0])}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 p-4 border-t border-gray-100 dark:border-white/[0.06] shrink-0">
          <button onClick={onClose} className="flex-1 px-3 py-2 text-xs text-gray-500 dark:text-[#808080] bg-gray-50 dark:bg-[#111] border border-gray-200/60 rounded-lg hover:bg-gray-100 transition-all">Cancelar</button>
          <button onClick={handleSave} disabled={saving || !title.trim()} className="flex-1 px-3 py-2 text-xs text-white bg-[#7C3AED] rounded-lg hover:bg-[#6D32D9] transition-all flex items-center justify-center gap-1 disabled:opacity-50"><Check size={12} /> {saving ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </div>
    </div>
  );
}