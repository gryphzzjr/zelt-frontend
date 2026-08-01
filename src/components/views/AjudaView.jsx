import { useState, useRef, useEffect } from 'react';
import {
  Search, X, ChevronRight, ChevronDown, BookOpen, MessageSquare,
  Phone, Mail, Clock, ThumbsUp, ThumbsDown, ExternalLink, ArrowLeft,
  Zap, Shield, Users, Calendar, FileText, Database, Settings,
  Package, CreditCard, HelpCircle, Star, Hash, AlertCircle,
  Send, Heart,
} from 'lucide-react';

const QUICK_ACCESS = [
  { id: 'primeiros-passos', title: 'Primeiros Passos', description: 'Como comecar a usar o Zelt.AI', icon: Zap, color: 'var(--zelt-primary)', bg: 'bg-[var(--zelt-primary)]/10' },
  { id: 'whatsapp', title: 'Configurar WhatsApp', description: 'Conecte seu numero via Evolution API', icon: MessageSquare, color: '#25D366', bg: 'bg-[#25D366]/10' },
  { id: 'treinar-ia', title: 'Treinar a IA', description: 'Configure prompts e respostas automaticas', icon: Settings, color: '#4285F4', bg: 'bg-[#4285F4]/10' },
  { id: 'base-conhecimento', title: 'Base de Conhecimento', description: 'Importe documentos e fontes de dados', icon: Database, color: '#EA4335', bg: 'bg-[#EA4335]/10' },
  { id: 'integracoes', title: 'Integracoes', description: 'Conecte servicos externos', icon: Package, color: '#009EE3', bg: 'bg-[#009EE3]/10' },
  { id: 'equipe', title: 'Equipe', description: 'Gerencie membros e permissoes', icon: Users, color: '#0F9D58', bg: 'bg-[#0F9D58]/10' },
  { id: 'clientes', title: 'Clientes', description: 'Visualize e gerencie seus clientes', icon: Heart, color: '#E91E63', bg: 'bg-[#E91E63]/10' },
  { id: 'tarefas', title: 'Tarefas', description: 'Organize e acompanhe tarefas da equipe', icon: FileText, color: '#FF8C00', bg: 'bg-[#FF8C00]/10' },
  { id: 'agenda', title: 'Agenda', description: 'Gerencie compromissos e eventos', icon: Calendar, color: '#635BFF', bg: 'bg-[#635BFF]/10' },
];

const ARTICLES = [
  { id: 'como-comecar', title: 'Como comecar a usar o Zelt.AI', category: 'Primeiros Passos', updated: '15/07/2026', readTime: '3 min', icon: Zap, content: {
    sections: [
      { title: 'Criando sua conta', text: 'Acesse zelt.ai e clique em "Comecar Gratis". Preencha seus dados, verifique o email e faca login pela primeira vez.' },
      { title: 'Configurando o workspace', text: 'Ao entrar, voce sera direcionado para o onboarding. Escolha o nome do workspace, faca upload do logotipo e configure as preferencias basicas.' },
      { title: 'Conectando canais', text: 'Na aba Integracoes, conecte os canais que deseja utilizar. O WhatsApp e o mais popular — basta escanear o QR Code pela Evolution API.' },
      { title: 'Treinando a IA', text: 'Acesse IA > Prompts para configurar como a inteligencia artificial deve responder seus clientes. Defina o tom de voz, regras e fluxos de atendimento.' },
      { title: 'Convidando a equipe', text: 'Va em Equipe > Membros e envie convites por email. Escolha o cargo e as permissoes de cada membro.' },
    ],
    related: ['configurar-whatsapp', 'treinar-ia']
  }},
  { id: 'configurar-whatsapp', title: 'Como configurar o WhatsApp', category: 'Integracoes', updated: '14/07/2026', readTime: '5 min', icon: MessageSquare, content: {
    sections: [
      { title: 'Acessando a integracao', text: 'Navegue ate Integracoes > WhatsApp no menu lateral. Clique em "Conectar Numero" para iniciar o processo.' },
      { title: 'Escolhendo a instancia', text: 'Selecione a instancia Evolution API que deseja utilizar. Cada instancia representa uma conexao WhatsApp independente.' },
      { title: 'Escaneando o QR Code', text: 'Um QR Code sera gerado. Abra o WhatsApp no celular, va em Aparelhos conectados > Conectar aparelho e escaneie o codigo.' },
      { title: 'Configuracoes avancadas', text: 'Apos a conexao, configure opcoes como recebimento de mensagens, envio automatico, reconexao e webhook para notificacoes.' },
      { title: 'Testando a conexao', text: 'Envie uma mensagem de teste para o numero conectido. A IA deve responder automaticamente conforme os prompts configurados.' },
    ],
    related: ['como-comecar', 'treinar-ia']
  }},
  { id: 'treinar-ia', title: 'Como treinar a IA do Zelt', category: 'Inteligencia Artificial', updated: '13/07/2026', readTime: '4 min', icon: Settings, content: {
    sections: [
      { title: 'Configurando prompts', text: 'Acesse IA > Prompts. Aqui voce define o comportamento da IA: tom de voz, regras de resposta, fluxos de conversa e restricoes.' },
      { title: 'Respostas automaticas', text: 'Crie respostas rapidas para perguntas frequentes. Use variaveis como {nome_cliente} para personalizar as mensagens.' },
      { title: 'Base de conhecimento', text: 'Importe documentos, PDFs e planilhas na aba Base de Conhecimento. A IA usara essas fontes para responder com precisao.' },
      { title: 'Testando na pratica', text: 'Use o chat de teste dentro da aba Prompts para simular conversas e ajustar os prompts ate obter as respostas desejadas.' },
    ],
    related: ['base-conhecimento', 'configurar-whatsapp']
  }},
  { id: 'base-conhecimento', title: 'Como usar a Base de Conhecimento', category: 'Inteligencia Artificial', updated: '12/07/2026', readTime: '3 min', icon: Database, content: {
    sections: [
      { title: 'Criando uma fonte', text: 'Acesse IA > Base de Conhecimento. Clique em "Nova Fonte" e escolha o tipo: documento, URL, planilha ou texto manual.' },
      { title: 'Importando documentos', text: 'Envie PDFs, Word ou TXT diretamente. A plataforma processara o conteudo e indexara para consulta pela IA.' },
      { title: 'Sincronizando com Google', text: 'Conecte Google Sheets ou Google Drive nas Integracoes para manter a base sempre atualizada automaticamente.' },
      { title: 'Organizando por categorias', text: 'Use categorias para manter a base organizada. Isso ajuda a IA a encontrar informacoes mais relevantes.' },
    ],
    related: ['treinar-ia', 'integracoes']
  }},
  { id: 'gerenciar-equipe', title: 'Como gerenciar a equipe', category: 'Equipe', updated: '11/07/2026', readTime: '3 min', icon: Users, content: {
    sections: [
      { title: 'Convidando membros', text: 'Va em Equipe > Membros e clique em "Convidar". Envie o convite por email ou compartilhe o link de convite.' },
      { title: 'Definindo cargos', text: 'Cada membro recebe um cargo que define suas permissoes. Cargos padrao incluem Administrador, Gerente e Atendente.' },
      { title: 'Gerenciando permissoes', text: 'Acesse Equipe > Cargos e Permissoes para criar cargos personalizados com permissoes especificas para cada modulo.' },
    ],
    related: ['como-comecar']
  }},
];

const FAQ = [
  { question: 'Como conectar meu WhatsApp?', answer: 'Va em Integracoes > WhatsApp, clique em "Conectar Numero", escolha a instancia Evolution API e escaneie o QR Code com o WhatsApp no celular. A conexao e instantanea.' },
  { question: 'Como adicionar novos membros?', answer: 'Acesse Equipe > Membros e clique em "Convidar". Preencha o email, escolha o cargo e envie o convite. O membro recebera um email com o link para aceitar.' },
  { question: 'Como treinar a IA?', answer: 'Navegue ate IA > Prompts para configurar o comportamento da IA. Defina o tom de voz, regras e respostas. Use o chat de teste para ajustar antes de ativar.' },
  { question: 'Como importar documentos para a Base de Conhecimento?', answer: 'Acesse IA > Base de Conhecimento, clique em "Nova Fonte" e selecione o tipo de arquivo. PDFs, Word e TXT sao aceitos diretamente. Google Sheets e Drive podem ser sincronizados via Integracoes.' },
  { question: 'Como alterar meu plano?', answer: 'Va em Configuracoes > Cobranca. Clique em "Alterar Plano" para ver as opcoes disponiveis. A alteracao e aplicada imediatamente e o valor e proporcional.' },
  { question: 'A IA responde automaticamente?', answer: 'Sim. Apos configurar os prompts e conectar o WhatsApp, a IA responde automaticamente todas as mensagens recebidas. Voce pode desativar a qualquer momento.' },
  { question: 'Como criar tarefas para a equipe?', answer: 'Acesse Operacoes > Lista de Tarefas e clique em "Nova Tarefa". Defina titulo, responsavel, prioridade, data limite e vincule a um cliente ou conversa.' },
  { question: 'Meus dados estao seguros?', answer: 'Sim. Utilizamos criptografia em repouso e em transito, backups diarios e seguimos as melhores praticas de seguranca. Consulte nossa Politica de Privacidade para mais detalhes.' },
];

const CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'Primeiros Passos', label: 'Primeiros Passos' },
  { id: 'Integracoes', label: 'Integracoes' },
  { id: 'Inteligencia Artificial', label: 'IA' },
  { id: 'Equipe', label: 'Equipe' },
];

export default function AjudaView() {
  const [search, setSearch] = useState('');
  const [activeArticle, setActiveArticle] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openFaq, setOpenFaq] = useState(null);
  const [feedbackGiven, setFeedbackGiven] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef(null);

  const searchResults = search.trim() ? [...QUICK_ACCESS, ...ARTICLES].filter(item =>
    (item.title?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (item.description?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (item.category?.toLowerCase() || '').includes(search.toLowerCase())
  ) : [];

  const filteredArticles = ARTICLES.filter(a => selectedCategory === 'all' || a.category === selectedCategory);

  const handleOpenArticle = (id) => {
    const article = ARTICLES.find(a => a.id === id);
    if (article) { setActiveArticle(article); setFeedbackGiven(null); }
  };

  if (activeArticle) {
    return <ArticleView article={activeArticle} onBack={() => setActiveArticle(null)} feedbackGiven={feedbackGiven} onFeedback={(v) => setFeedbackGiven(v)} onOpenArticle={handleOpenArticle} />;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300;1,9..40,400&display=swap');
        .help-view * { font-family: 'DM Sans', system-ui, sans-serif; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .help-fade { animation: fadeIn 0.2s ease-out; }
        @keyframes slideDown { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 300px; } }
        .help-slide { animation: slideDown 0.25s ease-out; overflow: hidden; }
      `}</style>
      <div className="help-view space-y-8 help-fade">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl text-gray-900 dark:text-[#ededed] mb-2">Central de Ajuda</h1>
          <p className="text-sm text-gray-400 dark:text-[#666] mb-6">Pesquise qualquer duvida ou navegue pelas categorias abaixo</p>
          <div className={`relative flex items-center gap-2 bg-white dark:bg-[#141414] border rounded-xl px-4 py-3 transition-colors ${searchFocused ? 'border-[var(--zelt-primary)]/40' : 'border-gray-200 dark:border-white/[0.06]'}`}>
            <Search size={18} className="text-gray-400 dark:text-[#666] shrink-0" />
            <input ref={searchRef} type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
              placeholder="Buscar artigos, tutoriais, FAQ..."
              className="flex-1 text-sm bg-transparent text-gray-900 dark:text-[#ededed] placeholder-gray-400 dark:placeholder-[#555] outline-none" />
            {search && <button onClick={() => setSearch('')} className="text-gray-400 dark:text-[#666] hover:text-gray-600 dark:text-[#aaa]"><X size={16} /></button>}
          </div>
        </div>

        {/* Search Results */}
        {search.trim() && (
          <div className="max-w-3xl mx-auto help-fade">
            <p className="text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider mb-3">{searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} para "{search}"</p>
            {searchResults.length === 0 ? (
              <div className="text-center py-10 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl">
                <HelpCircle size={32} className="mx-auto text-gray-300 dark:text-[#555] mb-3" />
                <p className="text-sm text-gray-500 dark:text-[#808080]">Nenhum resultado encontrado</p>
                <p className="text-xs text-gray-400 dark:text-[#666] mt-1">Tente outros termos ou navegue pelas categorias</p>
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map(item => (
                  <button key={item.id} onClick={() => { if (item.content) handleOpenArticle(item.id); setSearch(''); }}
                    className="w-full flex items-center gap-3 p-4 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl hover:border-gray-300 dark:hover:border-white/15 transition-colors text-left">
                    <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-[#111] flex items-center justify-center shrink-0">
                      {item.icon && <item.icon size={16} className="text-gray-400 dark:text-[#666]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-[#ededed]">{item.title}</p>
                      {item.description && <p className="text-xs text-gray-400 dark:text-[#666] mt-0.5">{item.description}</p>}
                      {item.category && <span className="text-[10px] text-gray-400 dark:text-[#666] bg-gray-100 dark:bg-[#1a1a1a] px-1.5 py-0.5 rounded mt-1 inline-block">{item.category}</span>}
                    </div>
                    <ChevronRight size={14} className="text-gray-300 dark:text-[#555] shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Access */}
        {!search.trim() && (
          <>
            <div>
              <h2 className="text-lg text-gray-900 dark:text-[#ededed] mb-4">Acesso Rapido</h2>
              <div className="grid grid-cols-3 gap-3">
                {QUICK_ACCESS.map(item => {
                  const Icon = item.icon;
                  return (
                    <button key={item.id} onClick={() => handleOpenArticle(item.id)}
                      className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-4 text-left hover:border-gray-300 dark:hover:border-white/15 transition-colors group">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                          <Icon size={18} style={{ color: item.color }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-gray-900 dark:text-[#ededed] group-hover:text-[var(--zelt-primary)] transition-colors">{item.title}</p>
                          <p className="text-xs text-gray-400 dark:text-[#666] mt-0.5">{item.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Articles */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg text-gray-900 dark:text-[#ededed]">Artigos</h2>
                <div className="flex items-center gap-1.5 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg p-1">
                  {CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 text-xs rounded-md transition-colors ${selectedCategory === cat.id ? 'bg-[var(--zelt-primary)] text-white' : 'text-gray-500 dark:text-[#808080] hover:bg-gray-50 dark:bg-[#111]'}`}>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                {filteredArticles.map(article => {
                  const Icon = article.icon;
                  return (
                    <button key={article.id} onClick={() => handleOpenArticle(article.id)}
                      className="w-full flex items-center gap-4 p-4 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl hover:border-gray-300 dark:hover:border-white/15 transition-colors text-left group">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#111] flex items-center justify-center shrink-0">
                        <Icon size={18} className="text-gray-400 dark:text-[#666]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-[#ededed] group-hover:text-[var(--zelt-primary)] transition-colors">{article.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-gray-400 dark:text-[#666] bg-gray-100 dark:bg-[#1a1a1a] px-1.5 py-0.5 rounded">{article.category}</span>
                          <span className="text-[10px] text-gray-400 dark:text-[#666]">{article.readTime} de leitura</span>
                          <span className="text-[10px] text-gray-400 dark:text-[#666]">Atualizado em {article.updated}</span>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-gray-300 dark:text-[#555] group-hover:text-gray-500 dark:text-[#808080] shrink-0 transition-colors" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-lg text-gray-900 dark:text-[#ededed] mb-4">Perguntas Frequentes</h2>
              <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-white/[0.06]">
                {FAQ.map((item, i) => (
                  <div key={i}>
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors text-left">
                      <span className="text-sm text-gray-700 dark:text-[#ccc] pr-4">{item.question}</span>
                      <ChevronDown size={16} className={`text-gray-400 dark:text-[#666] shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                    </button>
                    {openFaq === i && (
                      <div className="px-5 pb-4 help-slide">
                        <p className="text-sm text-gray-500 dark:text-[#808080] leading-relaxed">{item.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Support */}
            <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-6">
              <div className="text-center mb-6">
                <h2 className="text-lg text-gray-900 dark:text-[#ededed] mb-1">Precisa de ajuda?</h2>
                <p className="text-sm text-gray-400 dark:text-[#666]">Nossa equipe esta pronta para atender voce</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button className="flex items-center justify-center gap-2.5 px-5 py-3.5 bg-[var(--zelt-primary)] text-white rounded-xl text-sm hover:bg-[var(--zelt-primary)]/80 transition-colors">
                  <MessageSquare size={16} /> Abrir Conversa com o Suporte
                </button>
                <button className="flex items-center justify-center gap-2.5 px-5 py-3.5 border border-gray-200 dark:border-white/[0.06] text-gray-600 dark:text-[#aaa] rounded-xl text-sm hover:bg-gray-50 dark:bg-[#111] transition-colors">
                  <Send size={16} /> Enviar Feedback
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/[0.06]">
                  <Clock size={16} className="text-gray-400 dark:text-[#666] shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 dark:text-[#666]">Horario de atendimento</p>
                    <p className="text-sm text-gray-700 dark:text-[#ccc]">Seg-Sex, 9h as 18h</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/[0.06]">
                  <Zap size={16} className="text-gray-400 dark:text-[#666] shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 dark:text-[#666]">Tempo medio de resposta</p>
                    <p className="text-sm text-gray-700 dark:text-[#ccc]">~2 horas</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Info */}
            <div className="flex items-center justify-between py-5 border-t border-gray-100 dark:border-white/[0.06]">
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-400 dark:text-[#666]">Zelt.AI v1.0.0</span>
                <span className="text-xs text-gray-400 dark:text-[#666]">Atualizado em 16/07/2026</span>
              </div>
              <div className="flex items-center gap-4">
                <button className="text-xs text-gray-400 dark:text-[#666] hover:text-gray-600 dark:text-[#aaa] transition-colors">Politica de Privacidade</button>
                <button className="text-xs text-gray-400 dark:text-[#666] hover:text-gray-600 dark:text-[#aaa] transition-colors">Termos de Uso</button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function ArticleView({ article, onBack, feedbackGiven, onFeedback, onOpenArticle }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const relatedArticles = (article.content.related || []).map(id => ARTICLES.find(a => a.id === id)).filter(Boolean);

  return (
    <div className="help-fade">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-400 dark:text-[#666] hover:text-gray-600 dark:text-[#aaa] transition-colors mb-5">
        <ArrowLeft size={14} /> Voltar para a Central de Ajuda
      </button>

      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-6 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] text-[var(--zelt-primary)] bg-[var(--zelt-primary)]/5 border border-[var(--zelt-primary)]/10 px-2 py-0.5 rounded-full">{article.category}</span>
              <span className="text-[10px] text-gray-400 dark:text-[#666]">{article.readTime} de leitura</span>
              <span className="text-[10px] text-gray-400 dark:text-[#666]">Atualizado em {article.updated}</span>
            </div>
            <h1 className="text-xl text-gray-900 dark:text-[#ededed] mb-6">{article.title}</h1>

            <div className="space-y-6">
              {article.content.sections.map((section, i) => (
                <div key={i}>
                  <h3 className="text-base text-gray-900 dark:text-[#ededed] mb-2 flex items-center gap-2">
                    <Hash size={14} className="text-[var(--zelt-primary)]" />
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-[#808080] leading-relaxed pl-6">{section.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-5 text-center mb-5">
            <p className="text-sm text-gray-700 dark:text-[#ccc] mb-3">Este artigo foi util?</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => onFeedback('yes')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm border transition-colors ${feedbackGiven === 'yes' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-500/40 text-emerald-600' : 'border-gray-200 dark:border-white/[0.06] text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:bg-[#111]'}`}>
                <ThumbsUp size={15} /> Sim
              </button>
              <button onClick={() => onFeedback('no')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm border transition-colors ${feedbackGiven === 'no' ? 'bg-red-50 border-red-200 dark:border-red-500/40 text-red-500' : 'border-gray-200 dark:border-white/[0.06] text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:bg-[#111]'}`}>
                <ThumbsDown size={15} /> Nao
              </button>
            </div>
            {feedbackGiven && (
              <p className="text-xs text-gray-400 dark:text-[#666] mt-3">Obrigado pelo feedback!</p>
            )}
          </div>

          {/* Related */}
          {relatedArticles.length > 0 && (
            <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-5">
              <h3 className="text-sm text-gray-700 dark:text-[#ccc] mb-3">Artigos Relacionados</h3>
              <div className="space-y-2">
                {relatedArticles.map(ra => {
                  const Icon = ra.icon;
                  return (
                    <button key={ra.id} onClick={() => onOpenArticle(ra.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:bg-[#111] transition-colors text-left">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-[#111] flex items-center justify-center shrink-0">
                        <Icon size={14} className="text-gray-400 dark:text-[#666]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 dark:text-[#ccc]">{ra.title}</p>
                        <p className="text-[10px] text-gray-400 dark:text-[#666]">{ra.readTime} de leitura</p>
                      </div>
                      <ChevronRight size={12} className="text-gray-300 dark:text-[#555] shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Index */}
        {article.content.sections.length > 2 && (
          <div className="w-52 shrink-0 hidden lg:block">
            <div className="sticky top-6">
              <p className="text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider mb-3">Indice</p>
              <nav className="space-y-1">
                {article.content.sections.map((section, i) => (
                  <a key={i} href={`#section-${i}`}
                    className="block text-xs text-gray-500 dark:text-[#808080] hover:text-[var(--zelt-primary)] transition-colors py-1.5 pl-3 border-l border-gray-100 dark:border-white/[0.06] hover:border-[var(--zelt-primary)]/40">
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
