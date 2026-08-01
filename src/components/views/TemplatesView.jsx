import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search, Plus, X, Edit3, Trash2, Copy, Eye, Star,
  FileText, Tag, Building2, Layers, Clock, ChevronDown,
  ChevronRight, Check, BookOpen, Settings, Heart,
  ArrowRight, ExternalLink, AlertTriangle,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'atendimento', label: 'Atendimento', color: 'var(--zelt-primary)' },
  { id: 'comercial', label: 'Comercial', color: '#10B981' },
  { id: 'suporte', label: 'Suporte', color: '#F59E0B' },
  { id: 'financeiro', label: 'Financeiro', color: '#EF4444' },
  { id: 'saude', label: 'Saude', color: '#0EA5E9' },
  { id: 'educacao', label: 'Educacao', color: '#8B5CF6' },
  { id: 'ecommerce', label: 'E-commerce', color: '#EC4899' },
  { id: 'servicos', label: 'Servicos', color: '#14B8A6' },
  { id: 'geral', label: 'Geral', color: '#6B7280' },
];

const KNOWLEDGE_ITEMS = [
  { id: 1, name: 'Politica de troca e devolucao', category: 'Politicas', type: 'Documento' },
  { id: 2, name: 'Politica de pagamento e cobranca', category: 'Politicas', type: 'Documento' },
  { id: 3, name: 'Horarios de funcionamento', category: 'Institucional', type: 'Texto' },
  { id: 4, name: 'FAQ - Perguntas frequentes', category: 'Suporte', type: 'Documento' },
  { id: 5, name: 'Catalogo de produtos e servicos', category: 'Produtos', type: 'Documento' },
  { id: 6, name: 'Termos de uso e privacidade', category: 'Juridico', type: 'Documento' },
  { id: 7, name: 'Script de vendas - Abordagem inicial', category: 'Vendas', type: 'Texto' },
  { id: 8, name: 'Script de pos-venda - Follow-up', category: 'Vendas', type: 'Texto' },
  { id: 9, name: 'Guia de onboarding do cliente', category: 'Atendimento', type: 'Texto' },
  { id: 10, name: 'Estrutura organizacional e equipe', category: 'Institucional', type: 'Texto' },
  { id: 11, name: 'Canais de suporte e contato', category: 'Suporte', type: 'Documento' },
  { id: 12, name: 'Regras de encaminhamento para humano', category: 'Atendimento', type: 'Texto' },
  { id: 13, name: 'Lista de servicos e precos', category: 'Produtos', type: 'Documento' },
  { id: 14, name: 'Politica de cancelamento', category: 'Politicas', type: 'Documento' },
];

const MOCK_TEMPLATES = [
  { id: 1, name: 'SaaS B2B - Atendimento padrao', category: 'atendimento', businessType: 'SaaS', description: 'Template completo para atendimento de empresas SaaS focadas em B2B. Inclui politicas de suporte, onboarding e cobranca.', contents: [1, 2, 3, 4, 9, 12], instructions: 'Voce e um assistente virtual de atendimento ao cliente. Seja profissional, objetivo e empatico. Responda sempre em portugues brasileiro. Se nao souber a resposta, transfira para um humano.', usageCount: 47, favorited: true, updatedAt: '2026-07-10' },
  { id: 2, name: 'E-commerce - Suporte e pos-venda', category: 'suporte', businessType: 'E-commerce', description: 'Suporte completo para lojas online. Cobre entregas, devolucoes, trocas, problemas com pedidos e atendimento pos-venda.', contents: [1, 2, 4, 5, 11], instructions: 'Voce e o suporte de uma loja online. Ajude o cliente com duvidas sobre pedidos, entregas, trocas e devolucoes. Consulte sempre o numero do pedido antes de responder.', usageCount: 32, favorited: false, updatedAt: '2026-07-08' },
  { id: 3, name: 'Comercial - Qualificacao de leads', category: 'comercial', businessType: 'Serviços', description: 'Template para captacao e qualificacao de leads. Orienta a IA a fazer perguntas estrategicas e direcionar para o time comercial.', contents: [5, 7, 8, 10], instructions: 'Voce e um consultor comercial. Seu objetivo e qualificar leads, entender suas necessidades e agendar demonstracoes ou reunioes. Nao envie precos sem aprovacao.', usageCount: 28, favorited: true, updatedAt: '2026-07-12' },
  { id: 4, name: 'Saude - Pronto atendimento digital', category: 'saude', businessType: 'Saude', description: 'Atendimento digital para clinicas e consultorios. Triagem basica, agendamento de consultas e orientacoes gerais.', contents: [3, 4, 6, 9], instructions: 'Voce e um assistente de clinica medica. Faca triagem basica perguntando sintomas. Nao diagnostique. Agende consultas e oriente sobre horarios. Em urgencias, oriente a procurar pronto-socorro.', usageCount: 15, favorited: false, updatedAt: '2026-07-05' },
  { id: 5, name: 'Educacao - Suporte academico', category: 'educacao', businessType: 'Educacao', description: 'Suporte para instituicoes de ensino. Informacoes sobre cursos, matriculas, notas, calendario academico e processos seletivos.', contents: [3, 4, 9, 10], instructions: 'Voce e o assistente de uma instituicao de ensino. Responda sobre cursos, matriculas, calendario, notas e processos seletivos. Mantenha tom academico e formal.', usageCount: 11, favorited: false, updatedAt: '2026-07-01' },
  { id: 6, name: 'Financeiro - Atendimento bancario', category: 'financeiro', businessType: 'Financeiro', description: 'Atendimento para instituicoes financeiras. Duvidas sobre contas, transferencias, investimentos e produtos financeiros.', contents: [2, 4, 6, 14], instructions: 'Voce e o assistente de uma instituicao financeira. Nao compartilhe informacoes sensiveis. Oriente sobre produtos e canais de atendimento. Em caso de fraudes, transfira imediatamente.', usageCount: 22, favorited: true, updatedAt: '2026-07-11' },
  { id: 7, name: 'E-commerce - Recomendacao de produtos', category: 'ecommerce', businessType: 'E-commerce', description: 'IA focada em recomendar produtos personalizados. Analisa preferencias do cliente e sugere itens relevantes.', contents: [5, 7, 9], instructions: 'Voce e um consultor de moda e lifestyle. Analise as preferencias do cliente e recomende produtos. Use linguagem amigavel e persuasiva. Ofereca alternativas caso o produto desejado nao esteja disponivel.', usageCount: 19, favorited: false, updatedAt: '2026-07-09' },
  { id: 8, name: 'Geral - Onboarding de clientes', category: 'geral', businessType: 'Geral', description: 'Template generico para onboarding de novos clientes. Apresenta a empresa, explica como usar o servico e tira duvidas iniciais.', contents: [3, 5, 9, 10, 11], instructions: 'Voce e o assistente de boas-vindas. Apresente a empresa, explique os principais recursos e guie o cliente nos primeiros passos. Seja caloroso e prestativo.', usageCount: 35, favorited: true, updatedAt: '2026-07-14' },
];

export default function TemplatesView() {
  const [templates, setTemplates] = useState(MOCK_TEMPLATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('todas');
  const [filterBusiness, setFilterBusiness] = useState('todos');
  const [sortBy, setSortBy] = useState('name');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [rowMenuOpen, setRowMenuOpen] = useState(null);


  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setRowMenuOpen(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredTemplates = useMemo(() => {
    let result = [...templates];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.businessType.toLowerCase().includes(q)
      );
    }
    if (filterCategory !== 'todas') result = result.filter(t => t.category === filterCategory);
    if (filterBusiness !== 'todos') result = result.filter(t => t.businessType === filterBusiness);

    if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'category') result.sort((a, b) => a.category.localeCompare(b.category));
    else if (sortBy === 'usage') result.sort((a, b) => b.usageCount - a.usageCount);
    else if (sortBy === 'updated') result.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

    return result;
  }, [templates, searchQuery, filterCategory, filterBusiness, sortBy]);

  const counts = useMemo(() => ({
    total: templates.length,
    active: templates.length,
    mostUsed: templates.reduce((max, t) => t.usageCount > max ? t.usageCount : max, 0),
    lastUpdate: templates.reduce((latest, t) => t.updatedAt > latest ? t.updatedAt : latest, ''),
  }), [templates]);

  const businessTypes = useMemo(() => [...new Set(templates.map(t => t.businessType))].sort(), [templates]);

  const handleCreateTemplate = (data) => {
    const newTemplate = { ...data, id: Date.now(), usageCount: 0, favorited: false, updatedAt: new Date().toISOString().slice(0, 10) };
    setTemplates(prev => [...prev, newTemplate]);
    setShowCreateModal(false);
  };

  const handleUpdateTemplate = (data) => {
    setTemplates(prev => prev.map(t => t.id === data.id ? { ...data, updatedAt: new Date().toISOString().slice(0, 10) } : t));
    setShowCreateModal(false);
    setEditTemplate(null);
    if (selectedTemplate?.id === data.id) setSelectedTemplate({ ...data, updatedAt: new Date().toISOString().slice(0, 10) });
  };

  const handleDeleteTemplate = (id) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    setConfirmDelete(null);
    if (selectedTemplate?.id === id) setSelectedTemplate(null);
  };

  const handleDuplicateTemplate = (template) => {
    const newTemplate = { ...template, id: Date.now(), name: template.name + ' (copia)', usageCount: 0, updatedAt: new Date().toISOString().slice(0, 10) };
    setTemplates(prev => [...prev, newTemplate]);
    setRowMenuOpen(null);
  };

  const handleToggleFavorite = (id) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, favorited: !t.favorited } : t));
  };

  const handleApplyTemplate = (template) => {
    setTemplates(prev => prev.map(t => t.id === template.id ? { ...t, usageCount: t.usageCount + 1 } : t));
    setShowApplyModal(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300;1,9..40,400&display=swap');
        .templates-view * { font-family: 'DM Sans', system-ui, sans-serif; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .fade-in { animation: fadeIn 0.15s ease-out; }
        .slide-in-right { animation: slideInRight 0.2s ease-out; }
        .templates-view select:focus, .templates-view input:focus, .templates-view textarea:focus { outline: none; }
      `}</style>
      <div className="templates-view space-y-5">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-gray-900 dark:text-[#ededed]">Templates de Treinamento</h1>
            <p className="text-sm text-gray-400 dark:text-[#666] mt-1">Crie e gerencie bases de treinamento reutilizaveis para a IA</p>
          </div>
          <button onClick={() => { setEditTemplate(null); setShowCreateModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--zelt-primary)] text-white rounded-lg text-sm hover:bg-[var(--zelt-primary)]/80 transition-colors">
            <Plus size={16} /> Novo Template
          </button>
        </div>

        {/* FILTERS */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#666]" />
            <input type="text" placeholder="Buscar templates..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#141414] text-gray-900 dark:text-[#ededed] placeholder-gray-400 dark:placeholder-[#555] focus:border-[var(--zelt-primary)]/40 transition-colors" />
          </div>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#141414] text-gray-600 dark:text-[#aaa] cursor-pointer">
            <option value="todas">Categoria</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <select value={filterBusiness} onChange={(e) => setFilterBusiness(e.target.value)}
            className="px-3 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#141414] text-gray-600 dark:text-[#aaa] cursor-pointer">
            <option value="todos">Tipo de negocio</option>
            {businessTypes.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#141414] text-gray-600 dark:text-[#aaa] cursor-pointer">
            <option value="name">Ordenar por nome</option>
            <option value="category">Ordenar por categoria</option>
            <option value="usage">Mais utilizados</option>
            <option value="updated">Atualizados recentemente</option>
          </select>
        </div>

        {/* STATS + CONTENT */}
        <>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Total de Templates', value: counts.total, color: 'text-gray-900 dark:text-[#ededed]', bg: 'bg-gray-50 dark:bg-[#111]', icon: FileText, iconColor: 'text-gray-400 dark:text-[#666]' },
                { label: 'Templates Ativos', value: counts.active, color: 'text-[var(--zelt-primary)]', bg: 'bg-[var(--zelt-primary)]/5', icon: Check, iconColor: 'text-[var(--zelt-primary)]' },
                { label: 'Mais Utilizado', value: counts.mostUsed + 'x', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: Star, iconColor: 'text-emerald-400' },
                { label: 'Ultima Atualizacao', value: formatDate(counts.lastUpdate), color: 'text-gray-700 dark:text-[#ccc]', bg: 'bg-gray-50 dark:bg-[#111]', icon: Clock, iconColor: 'text-gray-400 dark:text-[#666]' },
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                    <stat.icon size={18} className={stat.iconColor} />
                  </div>
                  <div>
                    <p className={`text-xl ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-gray-400 dark:text-[#666]">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {filteredTemplates.length === 0 ? (
              <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-12 text-center">
                <FileText size={32} className="mx-auto text-gray-300 dark:text-[#555] mb-3" />
                <p className="text-sm text-gray-400 dark:text-[#666]">Nenhum template encontrado.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {filteredTemplates.map(template => {
                  const cat = CATEGORIES.find(c => c.id === template.category);
                  return (
                    <div key={template.id}
                      className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-5 hover:border-gray-300 dark:hover:border-white/15 transition-colors group cursor-pointer relative"
                      onClick={() => setSelectedTemplate(template)}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: cat?.color }}></span>
                          <span className="text-xs text-gray-500 dark:text-[#808080]">{cat?.label}</span>
                        </div>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => handleToggleFavorite(template.id)}
                            className={`p-1 rounded transition-colors ${template.favorited ? 'text-amber-400' : 'text-gray-300 dark:text-[#555] hover:text-amber-400'}`}>
                            <Star size={14} fill={template.favorited ? 'currentColor' : 'none'} />
                          </button>
                          <div className="relative">
                            <button onClick={() => setRowMenuOpen(rowMenuOpen === template.id ? null : template.id)}
                              className="p-1 rounded text-gray-400 dark:text-[#666] hover:text-gray-600 dark:text-[#aaa] hover:bg-gray-100 dark:bg-[#1a1a1a] transition-colors opacity-0 group-hover:opacity-100">
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><circle cx="3" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="13" cy="8" r="1.5"/></svg>
                            </button>
                            {rowMenuOpen === template.id && (
                              <div ref={menuRef} className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg py-1.5 z-30 shadow-sm fade-in">
                                <button onClick={() => { setSelectedTemplate(template); setRowMenuOpen(null); }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:bg-[#111] transition-colors">
                                  <Eye size={14} /> Visualizar
                                </button>
                                <button onClick={() => { setEditTemplate(template); setShowCreateModal(true); setRowMenuOpen(null); }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:bg-[#111] transition-colors">
                                  <Edit3 size={14} /> Editar
                                </button>
                                <button onClick={() => { handleDuplicateTemplate(template); }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:bg-[#111] transition-colors">
                                  <Copy size={14} /> Duplicar
                                </button>
                                <button onClick={() => { setShowApplyModal(template); setRowMenuOpen(null); }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-[var(--zelt-primary)] hover:bg-[var(--zelt-primary)]/5 transition-colors">
                                  <ArrowRight size={14} /> Aplicar
                                </button>
                                <div className="border-t border-gray-100 dark:border-white/[0.06] my-1"></div>
                                <button onClick={() => { setConfirmDelete(template); setRowMenuOpen(null); }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:bg-red-900/20 transition-colors">
                                  <Trash2 size={14} /> Excluir
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <h3 className="text-sm text-gray-900 dark:text-[#ededed] mb-1.5 truncate">{template.name}</h3>
                      <p className="text-xs text-gray-400 dark:text-[#666] line-clamp-2 mb-3 leading-relaxed">{template.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-gray-400 dark:text-[#666] bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] px-2 py-0.5 rounded">{template.businessType}</span>
                          <span className="text-[10px] text-gray-400 dark:text-[#666] flex items-center gap-1">
                            <Layers size={10} /> {template.contents.length} conteudos
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 dark:text-[#666]">{formatDate(template.updatedAt)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </>

        {/* DETAIL PANEL */}
        {selectedTemplate && (
          <TemplateDetailPanel template={selectedTemplate} onClose={() => setSelectedTemplate(null)}
            onEdit={(t) => { setEditTemplate(t); setShowCreateModal(true); setSelectedTemplate(null); }}
            onDuplicate={(t) => handleDuplicateTemplate(t)}
            onApply={(t) => { setShowApplyModal(t); setSelectedTemplate(null); }}
            onDelete={(t) => setConfirmDelete(t)} />
        )}

        {/* CREATE/EDIT MODAL */}
        {showCreateModal && (
          <TemplateModal template={editTemplate} onClose={() => { setShowCreateModal(false); setEditTemplate(null); }}
            onSave={editTemplate?.id ? handleUpdateTemplate : handleCreateTemplate} />
        )}

        {/* APPLY MODAL */}
        {showApplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 fade-in" onClick={() => setShowApplyModal(null)}>
            <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl w-[440px] p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--zelt-primary)]/10 flex items-center justify-center">
                  <ArrowRight size={18} className="text-[var(--zelt-primary)]" />
                </div>
                <div>
                  <h3 className="text-base text-gray-900 dark:text-[#ededed]">Aplicar Template</h3>
                  <p className="text-xs text-gray-400 dark:text-[#666]">{showApplyModal.name}</p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] rounded-lg p-4 mb-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-[#808080]">Conteudos incluidos</span>
                  <span className="text-sm text-gray-700 dark:text-[#ccc]">{showApplyModal.contents.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-[#808080]">Instrucoes de treinamento</span>
                  <span className="text-sm text-gray-700 dark:text-[#ccc]">{showApplyModal.instructions ? '1' : '0'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-[#808080]">Categoria</span>
                  <span className="text-sm text-gray-700 dark:text-[#ccc]">{CATEGORIES.find(c => c.id === showApplyModal.category)?.label}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-[#808080] mb-5">O template ira preencher automaticamente as configuracoes de treinamento da IA e selecionar os conteudos definidos.</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowApplyModal(null)} className="px-4 py-2 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:bg-[#111] transition-colors">Cancelar</button>
                <button onClick={() => handleApplyTemplate(showApplyModal)} className="px-4 py-2 text-sm bg-[var(--zelt-primary)] text-white rounded-lg hover:bg-[var(--zelt-primary)]/80 transition-colors">Confirmar</button>
              </div>
            </div>
          </div>
        )}

        {/* CONFIRM DELETE */}
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 fade-in" onClick={() => setConfirmDelete(null)}>
            <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl w-[400px] p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                  <Trash2 size={18} className="text-red-500" />
                </div>
                <h3 className="text-base text-gray-900 dark:text-[#ededed]">Excluir template</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-[#808080] mb-5">Tem certeza que deseja excluir "{confirmDelete.name}"? Esta acao nao pode ser desfeita.</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:bg-[#111] transition-colors">Cancelar</button>
                <button onClick={() => handleDeleteTemplate(confirmDelete.id)} className="px-4 py-2 text-sm bg-red-50 dark:bg-red-900/200 text-white rounded-lg hover:bg-red-600 transition-colors">Excluir</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ─── DETAIL PANEL ─────────────────────────────────────────────────────────── */

function TemplateDetailPanel({ template, onClose, onEdit, onDuplicate, onApply, onDelete }) {
  const cat = CATEGORIES.find(c => c.id === template.category);
  const selectedItems = KNOWLEDGE_ITEMS.filter(k => template.contents.includes(k.id));

  return (
    <div className="fixed inset-0 z-40 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/10 fade-in"></div>
      <div className="relative w-[480px] h-full bg-white dark:bg-[#141414] border-l border-gray-200 dark:border-white/[0.06] flex flex-col slide-in-right overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: cat?.color }}></span>
            <span className="text-sm text-gray-500 dark:text-[#808080]">{cat?.label}</span>
            <span className="text-xs text-gray-400 dark:text-[#666] bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] px-2 py-0.5 rounded">{template.businessType}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100 dark:bg-[#1a1a1a] text-gray-400 dark:text-[#666] hover:text-gray-600 dark:text-[#aaa] transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 pt-4 pb-3">
          <h2 className="text-lg text-gray-900 dark:text-[#ededed]">{template.name}</h2>
          {template.description && <p className="text-sm text-gray-500 dark:text-[#808080] mt-1.5 leading-relaxed">{template.description}</p>}
        </div>

        <div className="px-5 space-y-4 flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] rounded-lg p-3">
              <p className="text-xs text-gray-400 dark:text-[#666] mb-1">Conteudos</p>
              <p className="text-lg text-gray-900 dark:text-[#ededed]">{template.contents.length}</p>
            </div>
            <div className="bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] rounded-lg p-3">
              <p className="text-xs text-gray-400 dark:text-[#666] mb-1">Utilizacoes</p>
              <p className="text-lg text-gray-900 dark:text-[#ededed]">{template.usageCount}</p>
            </div>
          </div>

          {template.instructions && (
            <div>
              <h4 className="text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider mb-2">Instrucoes de Treinamento</h4>
              <div className="bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] rounded-lg p-3">
                <p className="text-sm text-gray-600 dark:text-[#aaa] leading-relaxed whitespace-pre-wrap">{template.instructions}</p>
              </div>
            </div>
          )}

          {selectedItems.length > 0 && (
            <div>
              <h4 className="text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider mb-2">Conteudos Incluidos</h4>
              <div className="space-y-1.5">
                {selectedItems.map(item => (
                  <div key={item.id} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-[#111]">
                    <BookOpen size={13} className="text-gray-400 dark:text-[#666] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 dark:text-[#ccc] truncate">{item.name}</p>
                      <p className="text-[10px] text-gray-400 dark:text-[#666]">{item.category} - {item.type}</p>
                    </div>
                    <Check size={13} className="text-emerald-500 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-gray-100 dark:border-white/[0.06] pt-3 text-xs text-gray-400 dark:text-[#666]">
            Ultima atualizacao: {template.updatedAt ? new Date(template.updatedAt + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-white/[0.06] flex gap-2">
          <button onClick={() => onEdit(template)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:bg-[#111] transition-colors">
            <Edit3 size={14} /> Editar
          </button>
          <button onClick={() => onDuplicate(template)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:bg-[#111] transition-colors">
            <Copy size={14} /> Duplicar
          </button>
          <button onClick={() => onApply(template)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm bg-[var(--zelt-primary)] text-white rounded-lg hover:bg-[var(--zelt-primary)]/80 transition-colors">
            <ArrowRight size={14} /> Aplicar
          </button>
          <button onClick={() => onDelete(template)} className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm border border-red-200 dark:border-red-500/40 rounded-lg text-red-500 hover:bg-red-50 dark:bg-red-900/20 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── CREATE/EDIT MODAL ────────────────────────────────────────────────────── */

function TemplateModal({ template, onClose, onSave }) {
  const [form, setForm] = useState({
    name: template?.name || '',
    category: template?.category || 'atendimento',
    businessType: template?.businessType || '',
    description: template?.description || '',
    instructions: template?.instructions || '',
    contents: template?.contents || [],
  });

  const [showNewContent, setShowNewContent] = useState(false);
  const [newContentName, setNewContentName] = useState('');

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleContent = (id) => {
    setForm(prev => ({
      ...prev,
      contents: prev.contents.includes(id) ? prev.contents.filter(x => x !== id) : [...prev.contents, id],
    }));
  };

  const handleAddContent = () => {
    if (!newContentName.trim()) return;
    const newItem = { id: Date.now(), name: newContentName, category: 'Personalizado', type: 'Texto' };
    KNOWLEDGE_ITEMS.push(newItem);
    setForm(prev => ({ ...prev, contents: [...prev.contents, newItem.id] }));
    setNewContentName('');
    setShowNewContent(false);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSave({ ...form, id: template?.id || undefined });
  };

  const selectedItems = KNOWLEDGE_ITEMS.filter(k => form.contents.includes(k.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl w-[900px] max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
          <h3 className="text-base text-gray-900 dark:text-[#ededed]">{template?.id ? 'Editar Template' : 'Novo Template'}</h3>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100 dark:bg-[#1a1a1a] text-gray-400 dark:text-[#666] hover:text-gray-600 dark:text-[#aaa] transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* FORM */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 border-r border-gray-100 dark:border-white/[0.06]">
            <div>
              <label className="text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider block mb-1.5">Nome *</label>
              <input type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Ex: SaaS B2B - Atendimento padrao"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#141414] text-gray-900 dark:text-[#ededed] placeholder-gray-400 dark:placeholder-[#555] focus:border-[var(--zelt-primary)]/40 transition-colors" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider block mb-1.5">Categoria</label>
                <select value={form.category} onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#141414] text-gray-600 dark:text-[#aaa] focus:border-[var(--zelt-primary)]/40 transition-colors">
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider block mb-1.5">Tipo de negocio</label>
                <input type="text" value={form.businessType} onChange={(e) => handleChange('businessType', e.target.value)} placeholder="Ex: SaaS, E-commerce"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#141414] text-gray-900 dark:text-[#ededed] placeholder-gray-400 dark:placeholder-[#555] focus:border-[var(--zelt-primary)]/40 transition-colors" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider block mb-1.5">Descricao</label>
              <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={2} placeholder="Descreva o objetivo deste template..."
                className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#141414] text-gray-900 dark:text-[#ededed] placeholder-gray-400 dark:placeholder-[#555] focus:border-[var(--zelt-primary)]/40 resize-none transition-colors" />
            </div>
            <div>
              <label className="text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider block mb-1.5">Instrucoes de Treinamento</label>
              <textarea value={form.instructions} onChange={(e) => handleChange('instructions', e.target.value)} rows={5} placeholder="Escreva as instrucoes que servirao como base para o treinamento da IA..."
                className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#141414] text-gray-900 dark:text-[#ededed] placeholder-gray-400 dark:placeholder-[#555] focus:border-[var(--zelt-primary)]/40 resize-none transition-colors leading-relaxed" />
            </div>

            {/* CONTENTS */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider">Conteudos do Template</label>
                <button onClick={() => setShowNewContent(!showNewContent)} className="text-xs text-[var(--zelt-primary)] flex items-center gap-1 hover:underline">
                  <Plus size={11} /> Adicionar Novo Conteudo
                </button>
              </div>
              {showNewContent && (
                <div className="flex gap-2 mb-3 fade-in">
                  <input type="text" value={newContentName} onChange={(e) => setNewContentName(e.target.value)} placeholder="Nome do novo conteudo"
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#141414] text-gray-900 dark:text-[#ededed] placeholder-gray-400 dark:placeholder-[#555] focus:border-[var(--zelt-primary)]/40 transition-colors" onKeyDown={(e) => e.key === 'Enter' && handleAddContent()} />
                  <button onClick={handleAddContent} className="px-3 py-2 text-sm bg-[var(--zelt-primary)] text-white rounded-lg hover:bg-[var(--zelt-primary)]/80 transition-colors">Adicionar</button>
                  <button onClick={() => setShowNewContent(false)} className="px-3 py-2 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg text-gray-500 dark:text-[#808080] hover:bg-gray-50 dark:bg-[#111] transition-colors">Cancelar</button>
                </div>
              )}
              <div className="space-y-1.5 max-h-[240px] overflow-y-auto border border-gray-100 dark:border-white/[0.06] rounded-lg p-2">
                {KNOWLEDGE_ITEMS.map(item => {
                  const selected = form.contents.includes(item.id);
                  return (
                    <label key={item.id} className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${selected ? 'bg-[var(--zelt-primary)]/[0.03] border border-[var(--zelt-primary)]/10' : 'border border-transparent hover:bg-gray-50 dark:bg-[#111]'}`}>
                      <input type="checkbox" checked={selected} onChange={() => toggleContent(item.id)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-white/20 text-[var(--zelt-primary)] focus:ring-[var(--zelt-primary)]/30" />
                      <BookOpen size={13} className="text-gray-400 dark:text-[#666] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 dark:text-[#ccc] truncate">{item.name}</p>
                        <p className="text-[10px] text-gray-400 dark:text-[#666]">{item.category} - {item.type}</p>
                      </div>
                      {selected && <Check size={13} className="text-[var(--zelt-primary)] shrink-0" />}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* PREVIEW */}
          <div className="w-[280px] shrink-0 p-5 bg-gray-50/50 dark:bg-[#111] overflow-y-auto">
            <h4 className="text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider mb-3">Pre-visualizacao</h4>
            <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm text-gray-900 dark:text-[#ededed]">{form.name || 'Nome do template'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-gray-500 dark:text-[#808080] bg-gray-100 dark:bg-[#1a1a1a] px-1.5 py-0.5 rounded">{CATEGORIES.find(c => c.id === form.category)?.label}</span>
                  {form.businessType && <span className="text-[10px] text-gray-500 dark:text-[#808080] bg-gray-100 dark:bg-[#1a1a1a] px-1.5 py-0.5 rounded">{form.businessType}</span>}
                </div>
              </div>
              {form.description && <p className="text-xs text-gray-400 dark:text-[#666] leading-relaxed">{form.description}</p>}

              <div className="border-t border-gray-100 dark:border-white/[0.06] pt-3">
                <p className="text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wider mb-2">Resumo</p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-[#808080]">Conteudos selecionados</span>
                    <span className="text-xs text-gray-700 dark:text-[#ccc]">{selectedItems.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-[#808080]">Instrucoes</span>
                    <span className="text-xs text-gray-700 dark:text-[#ccc]">{form.instructions ? 'Definidas' : 'Nao definidas'}</span>
                  </div>
                </div>
              </div>

              {selectedItems.length > 0 && (
                <div className="border-t border-gray-100 dark:border-white/[0.06] pt-3">
                  <p className="text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wider mb-2">Documentos que serao utilizados</p>
                  <div className="space-y-1">
                    {selectedItems.map(item => (
                      <div key={item.id} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-[#808080]">
                        <Check size={10} className="text-emerald-500 shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {form.instructions && (
                <div className="border-t border-gray-100 dark:border-white/[0.06] pt-3">
                  <p className="text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wider mb-1">Instrucoes</p>
                  <p className="text-xs text-gray-500 dark:text-[#808080] leading-relaxed line-clamp-4">{form.instructions}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-gray-100 dark:border-white/[0.06]">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:bg-[#111] transition-colors">Cancelar</button>
          <button onClick={handleSubmit} className="px-4 py-2 text-sm bg-[var(--zelt-primary)] text-white rounded-lg hover:bg-[var(--zelt-primary)]/80 transition-colors">
            {template?.id ? 'Salvar alteracoes' : 'Criar template'}
          </button>
        </div>
      </div>
    </div>
  );
}
