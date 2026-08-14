import React, { useState, useMemo, useEffect, Suspense } from 'react';
import {
  HiOutlineTemplate,
  HiOutlineChatAlt2,
  HiChevronDown,
  HiOutlineLightningBolt,
  HiOutlineClipboardCheck,
  HiOutlineShare,
  HiOutlineQuestionMarkCircle,
  HiOutlineLogout,
  HiOutlineBell,
  HiOutlineSearch,
  HiOutlineCog,
  HiOutlinePlus,
  HiChevronRight,
  HiOutlineChat,
  HiOutlineUserGroup,
  HiOutlineBookOpen,
  HiOutlineSwitchHorizontal,
  HiOutlineCalendar,
  HiOutlineViewGrid,
  HiOutlineDeviceMobile,
  HiOutlineDocumentText,
  HiOutlineServer,
  HiOutlineMailOpen,
  HiOutlineCode,
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineHome,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineViewBoards,
  HiOutlineFolderOpen,
} from 'react-icons/hi';
import { CiSettings } from 'react-icons/ci';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme, getPrimaryVars } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import MessageNotifications from './MessageNotifications';
import TrialProgressBar from '../ui/TrialProgressBar';
import {
  SEARCH_INDEX, getSuggestions, getRecommended,
  loadHistory, pushHistory, saveHistory, Highlight,
} from '../../lib/searchIndex';

const NAV_MAIN = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: HiOutlineTemplate,
  },
  {
    id: 'atendimentos',
    label: 'Atendimentos',
    icon: HiOutlineChatAlt2,
    children: [
      { id: 'atendimentos/conversas', label: 'Conversas',     icon: HiOutlineUserGroup },
      { id: 'atendimentos/chat',      label: 'Chat ao vivo',  icon: HiOutlineChat },
    ],
  },
  {
    id: 'ia',
    label: 'IA',
    icon: HiOutlineLightningBolt,
    children: [
      { id: 'ia/base-conhecimento',     label: 'Base de conhecimento', icon: HiOutlineBookOpen },
      { id: 'ia/prompts',               label: 'Prompts',              icon: HiOutlineLightningBolt },
      { id: 'ia/respostas-automaticas', label: 'Respostas automaticas', icon: HiOutlineSwitchHorizontal },
      { id: 'ia/templates',             label: 'Templates de Treinamento', icon: HiOutlineTemplate },
    ],
  },
  {
    id: 'operacoes',
    label: 'Operações',
    icon: HiOutlineClipboardCheck,
    children: [
      { id: 'operacoes/tarefas', label: 'Lista de Tarefas', icon: HiOutlineClipboardCheck },
      { id: 'operacoes/agenda',  label: 'Agenda',           icon: HiOutlineCalendar },
      { id: 'operacoes/planilhas', label: 'Planilhas',      icon: HiOutlineViewBoards },
      { id: 'operacoes/arquivos',  label: 'Arquivos',       icon: HiOutlineFolderOpen },
    ],
  },
  {
    id: 'integracoes',
    label: 'Integrações',
    icon: HiOutlineShare,
    children: [
      { id: 'integracoes',                 label: 'Visão Geral',    icon: HiOutlineViewGrid },
      { id: 'integracoes/whatsapp',        label: 'WhatsApp',       icon: HiOutlineDeviceMobile },
      { id: 'integracoes/google-sheets',   label: 'Google Sheets',  icon: HiOutlineDocumentText },
      { id: 'integracoes/google-drive',    label: 'Google Drive',   icon: HiOutlineServer },
      { id: 'integracoes/google-calendar', label: 'Google Calendar', icon: HiOutlineCalendar },
      { id: 'integracoes/gmail',           label: 'Gmail',          icon: HiOutlineMailOpen },
      { id: 'integracoes/api-webhooks',    label: 'APIs',           icon: HiOutlineCode },
    ],
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    icon: CiSettings,
  },
  {
    id: 'ajuda',
    label: 'Ajuda',
    icon: HiOutlineQuestionMarkCircle,
  },
];

const VIEW_META = {
  dashboard: { title: 'Visão Geral', parent: 'Dashboard' },
  'atendimentos/conversas': { title: 'Conversas', parent: 'Atendimentos' },
  'atendimentos/chat': { title: 'Chat ao vivo', parent: 'Atendimentos' },
  'ia/base-conhecimento': { title: 'Base de conhecimento', parent: 'IA' },
  'ia/prompts': { title: 'Prompts', parent: 'IA' },
  'ia/respostas-automaticas': { title: 'Respostas automáticas', parent: 'IA' },
  'ia/templates': { title: 'Templates de Treinamento', parent: 'IA' },
  'operacoes/tarefas': { title: 'Lista de Tarefas', parent: 'Operações' },
  'operacoes/agenda': { title: 'Agenda', parent: 'Operações' },
  'operacoes/planilhas': { title: 'Planilhas', parent: 'Operações' },
  'operacoes/arquivos': { title: 'Arquivos', parent: 'Operações' },
  integracoes: { title: 'Visão Geral', parent: 'Integrações' },
  'integracoes/whatsapp': { title: 'WhatsApp', parent: 'Integrações' },
  'integracoes/google-sheets': { title: 'Google Sheets', parent: 'Integrações' },
  'integracoes/google-drive': { title: 'Google Drive', parent: 'Integrações' },
  'integracoes/google-calendar': { title: 'Google Calendar', parent: 'Integrações' },
  'integracoes/gmail': { title: 'Gmail', parent: 'Integrações' },
  'integracoes/api-webhooks': { title: 'APIs', parent: 'Integrações' },
  configuracoes: { title: 'Configurações', parent: 'Conta' },
  ajuda: { title: 'Ajuda', parent: 'Suporte' },
};

function NavBar({ activeView, onNavigate }) {
  const [openMenu, setOpenMenu] = useState(null);

  const isParentActive = (item) =>
    item.children?.some((c) => c.id === activeView);

  const handleNavigate = (view) => {
    setOpenMenu(null);
    onNavigate(view);
  };

  const baseLink =
    'relative h-full inline-flex items-center gap-1.5 px-3 text-[13px] font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-100 transition-colors';
  const activeLink =
    'relative h-full inline-flex items-center gap-1.5 px-3 text-[13px] font-semibold text-[var(--zelt-primary)] after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-t-full after:bg-[var(--zelt-primary)]';

  return (
    <nav className="hidden lg:flex items-stretch gap-0.5 px-6 h-11 border-t border-gray-100 dark:border-white/[0.06]">
      {NAV_MAIN.map((item) => {
        const IconComp = item.icon;

        if (!item.children) {
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={activeView === item.id ? activeLink : baseLink}
            >
              <IconComp size={16} />
              <span>{item.label}</span>
            </button>
          );
        }

        const parentActive = isParentActive(item);
        const isOpen = openMenu === item.id;

        return (
          <div key={item.id} className="relative h-full">
            <button
              onClick={() => setOpenMenu(isOpen ? null : item.id)}
              className={`${parentActive ? activeLink : baseLink} ${isOpen ? 'bg-gray-50 text-gray-900 dark:bg-white/5 dark:text-gray-100' : ''}`}
            >
              <IconComp size={16} />
              <span>{item.label}</span>
              <HiChevronDown
                size={13}
                className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${parentActive ? 'text-[var(--zelt-primary)]' : 'text-gray-400'}`}
              />
            </button>

            {isOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setOpenMenu(null)} />
                <div className="absolute left-0 top-full z-40 w-64 pt-1.5 animate-[dropdownIn_.15s_ease-out]">
                  <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.08] rounded py-1.5">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const isActive = activeView === child.id;
                      return (
                        <button
                          key={child.id}
                          onClick={() => handleNavigate(child.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${
                            isActive
                              ? 'bg-[var(--zelt-primary)]/5 text-[var(--zelt-primary)]'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-100'
                          }`}
                        >
                          <span className={`flex items-center justify-center w-7 h-7 rounded ${
                            isActive
                              ? 'bg-[var(--zelt-primary)]/10 text-[var(--zelt-primary)]'
                              : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400'
                          }`}>
                            <ChildIcon size={14} />
                          </span>
                          <span className="flex-1 text-left">{child.label}</span>
                          {isActive && <HiOutlineCheck size={14} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })}
    </nav>
  );
}

const NOTIFICATIONS = [
  {
    id: 1,
    icon: HiOutlineChatAlt2,
    title: 'Novo atendimento',
    desc: 'Maria Silva enviou uma mensagem',
    time: '2 min',
    tone: 'bg-[var(--zelt-primary)]/10 text-[var(--zelt-primary)]',
  },
  {
    id: 2,
    icon: HiOutlineClipboardCheck,
    title: 'Tarefa concluida',
    desc: 'Ligar para cliente pendente foi finalizada',
    time: '1 h',
    tone: 'bg-green-500/10 text-green-600 dark:text-green-400',
  },
  {
    id: 3,
    icon: HiOutlineShare,
    title: 'Integracao desconectada',
    desc: 'Google Sheets perdeu a conexao',
    time: '3 h',
    tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
];

function Header({ activeView, onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const avatarSrc = user?.avatar;

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate('/login');
  };

  const handleMenuClick = (view) => {
    setProfileOpen(false);
    onNavigate(view);
  };

  const toggleProfile = () => {
    setProfileOpen((o) => !o);
    setNotifOpen(false);
  };

  const toggleNotif = () => {
    setNotifOpen((o) => !o);
    setProfileOpen(false);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [history, setHistory] = useState(loadHistory);

  const suggestions = useMemo(() => getSuggestions(searchQuery), [searchQuery]);
  const recommended = useMemo(() => getRecommended(), []);

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
  };

  const selectSearchEntry = (entry) => {
    setHistory((prev) => pushHistory(prev, entry.label, entry.id));
    closeSearch();
    onNavigate(entry.id);
  };

  const selectSearchHistory = (item) => {
    setHistory((prev) => pushHistory(prev, item.label, item.view));
    closeSearch();
    onNavigate(item.view);
  };

  const removeSearchHistory = (id) => {
    setHistory((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveHistory(next);
      return next;
    });
  };

  const clearSearchHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  const handleSearchKey = (e) => {
    if (e.key === 'Escape') {
      setSearchOpen(false);
      setSearchQuery('');
    } else if (e.key === 'Enter' && suggestions.length > 0) {
      selectSearchEntry(suggestions[0]);
    }
  };

  const searchEntryRow = (entry) => {
    const Icon = entry.icon;
    return (
      <button
        key={entry.id}
        onClick={() => selectSearchEntry(entry)}
        className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
      >
        <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 flex items-center justify-center shrink-0">
          <Icon size={14} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
            <Highlight text={entry.label} q={searchQuery} />
          </span>
          <span className="block text-[10px] text-gray-400 dark:text-gray-500 truncate">{entry.parent}</span>
        </span>
        <HiChevronRight size={13} className="text-gray-300 dark:text-gray-600 shrink-0" />
      </button>
    );
  };

  const notifContent = (
    <>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 dark:border-white/[0.06]">
        <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">Notificacoes</span>
        <button
          className="text-[10px] font-medium text-[var(--zelt-primary)] hover:underline"
          onClick={() => setNotifOpen(false)}
        >
          Marcar todas como lidas
        </button>
      </div>
      <div className="py-1">
        {NOTIFICATIONS.map((n) => (
          <button
            key={n.id}
            className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
          >
            <span className={`w-8 h-8 shrink-0 rounded flex items-center justify-center ${n.tone}`}>
              <n.icon size={15} />
            </span>
            <span className="flex-1 min-w-0">
              <span className="flex items-center gap-1.5">
                <span className="text-[11px] font-medium text-gray-900 dark:text-gray-100 truncate">{n.title}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--zelt-primary)] shrink-0" />
              </span>
              <span className="block text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">{n.desc}</span>
            </span>
            <span className="flex items-center gap-1 text-[9px] text-gray-400 dark:text-gray-500 shrink-0">
              <HiOutlineClock size={10} />
              {n.time}
            </span>
          </button>
        ))}
      </div>
      <div className="border-t border-gray-100 dark:border-white/[0.06]">
        <button
          onClick={() => setNotifOpen(false)}
          className="w-full py-2 text-[10px] font-medium text-gray-500 dark:text-gray-400 hover:text-[var(--zelt-primary)] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
          Ver todas as notificacoes
        </button>
      </div>
    </>
  );

  return (
    <header className="sticky top-0 z-20 bg-white/85 dark:bg-[#0a0a0a]/85 backdrop-blur-xl border-b border-gray-100 dark:border-white/[0.06]">
      <div className="flex items-center h-16 px-4 lg:px-6">
        <div className="flex items-center shrink-0 gap-3">
          <img src="/banner.png" alt="Zelt.ai" className="h-8 sm:h-9" />
          <TrialProgressBar className="hidden md:flex" />
        </div>

        <div className="flex-1 hidden lg:flex items-center justify-center px-6">
          <div className="relative w-full max-w-md">
            <HiOutlineSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(closeSearch, 120)}
              onKeyDown={handleSearchKey}
              placeholder="Buscar conversas, contatos ou relatorios..."
              className="w-full py-2 pl-9 pr-10 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/[0.08] rounded focus:outline-none focus:border-[var(--zelt-primary)]/50 focus:bg-white dark:focus:bg-white/5 transition-all duration-200 text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/5 text-[9px] text-gray-400">
              <span className="font-medium">/</span>
            </kbd>

            {searchOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 z-40 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.08] rounded-xl overflow-hidden shadow-lg shadow-black/5 animate-[dropdownIn_.15s_ease-out]">
                {searchQuery.trim() ? (
                  <>
                    <div className="px-4 pt-2.5 pb-1 text-[9px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      Sugestoes
                    </div>
                    {suggestions.length > 0 ? (
                      <div className="pb-1.5">
                        {suggestions.map(searchEntryRow)}
                      </div>
                    ) : (
                      <div className="px-4 py-8 flex flex-col items-center gap-2 text-center">
                        <span className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-400 flex items-center justify-center">
                          <HiOutlineSearch size={18} />
                        </span>
                        <span className="text-[11px] text-gray-400 dark:text-gray-500">
                          Nenhum resultado para &ldquo;{searchQuery}&rdquo;
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {history.length > 0 && (
                      <>
                        <div className="flex items-center justify-between px-4 pt-2.5 pb-1">
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                            Recentes
                          </span>
                          <button
                            onClick={clearSearchHistory}
                            className="text-[9px] font-medium text-[var(--zelt-primary)] hover:underline"
                          >
                            Limpar
                          </button>
                        </div>
                        <div className="pb-1.5">
                          {history.map((item) => (
                            <div key={item.id} className="group flex items-center">
                              <button
                                onClick={() => selectSearchHistory(item)}
                                className="flex-1 flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors min-w-0"
                              >
                                <HiOutlineClock size={14} className="text-gray-400 dark:text-gray-500 shrink-0" />
                                <span className="flex-1 min-w-0">
                                  <span className="block text-xs text-gray-800 dark:text-gray-200 truncate">{item.label}</span>
                                  <span className="block text-[10px] text-gray-400 dark:text-gray-500 truncate">
                                    {SEARCH_INDEX.find((e) => e.id === item.view)?.parent || 'Pagina'}
                                  </span>
                                </span>
                              </button>
                              <button
                                onClick={() => removeSearchHistory(item.id)}
                                onMouseDown={(e) => e.preventDefault()}
                                className="opacity-0 group-hover:opacity-100 p-1 mr-3 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-all"
                                aria-label="Remover do historico"
                              >
                                <HiOutlineX size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    <div className="px-4 pt-2.5 pb-1 text-[9px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      Recomendados
                    </div>
                    <div className="pb-1.5">
                      {recommended.map(searchEntryRow)}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 lg:hidden" />

        <div className="flex items-center gap-2 lg:gap-2.5 shrink-0">
          <button
            onClick={() => onNavigate('search')}
            className="lg:hidden p-2 text-gray-500 dark:text-gray-400 rounded border border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            aria-label="Buscar"
          >
            <HiOutlineSearch size={18} />
          </button>

          <div className="relative">
            <button
              onClick={toggleNotif}
              className={`relative p-2 text-gray-500 dark:text-gray-400 rounded border transition-colors ${
                notifOpen
                  ? 'border-[var(--zelt-primary)]/40 text-[var(--zelt-primary)] bg-[var(--zelt-primary)]/5'
                  : 'border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <HiOutlineBell size={18} />
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[var(--zelt-primary)] text-white text-[9px] font-semibold flex items-center justify-center">
                {NOTIFICATIONS.length}
              </span>
            </button>

            {notifOpen && (
              <>
                <div className="hidden lg:block fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
                <div className="lg:hidden fixed inset-0 z-40 bg-black/30 animate-[fadeIn_.2s_ease-out]" onClick={() => setNotifOpen(false)} />

                <div className="hidden lg:block absolute right-0 top-full mt-2 z-40 w-80 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.08] rounded overflow-hidden animate-[dropdownIn_.15s_ease-out]">
                  {notifContent}
                </div>

                <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-[#141414] rounded-t-2xl border-t border-gray-200 dark:border-white/[0.06] animate-[sheetIn_.28s_cubic-bezier(.32,.72,0,1)] max-h-[80dvh] flex flex-col pb-[env(safe-area-inset-bottom)]">
                  <div className="mx-auto w-9 h-1 rounded-full bg-gray-200 dark:bg-white/10 mt-2 shrink-0" />
                  <div className="flex-1 overflow-y-auto">{notifContent}</div>
                </div>
              </>
            )}
          </div>

          <div className="h-6 w-px bg-gray-100 dark:bg-white/[0.06]" />

          <div className="relative">
            <button
              onClick={toggleProfile}
              className={`flex items-center gap-2.5 rounded px-2 py-1.5 border transition-colors ${
                profileOpen
                  ? 'border-[var(--zelt-primary)]/40 bg-[var(--zelt-primary)]/5'
                  : 'border-transparent hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover border border-gray-100 dark:border-white/[0.06]"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--zelt-primary)] to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-none">{user?.name || 'Usuario'}</span>
                <span className="text-[10px] text-gray-400 mt-0.5">Proprietario</span>
              </div>
              <HiChevronDown
                size={14}
                className={`text-gray-400 hidden md:block transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 top-full mt-2 z-40 w-60 bg-white dark:bg-[#141414] rounded border border-gray-200 dark:border-white/[0.08] overflow-hidden animate-[dropdownIn_.15s_ease-out]">
                  <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-white/[0.06]">
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-white/[0.06]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--zelt-primary)] to-purple-400 flex items-center justify-center text-white text-sm font-bold">
                        {(user?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{user?.name || 'Usuario'}</p>
                      <p className="text-[10px] text-gray-400 truncate">{user?.email || 'usuario@zelt.ai'}</p>
                      <span className="mt-1 inline-flex items-center px-1.5 py-0.5 rounded bg-[var(--zelt-primary)]/10 text-[var(--zelt-primary)] text-[9px] font-semibold">
                        Plano Professional
                      </span>
                    </div>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => handleMenuClick('dashboard')}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                    >
                      <HiOutlineHome size={15} />
                      Visao geral
                    </button>
                    <button
                      onClick={() => handleMenuClick('configuracoes')}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                    >
                      <HiOutlineCog size={15} />
                      Configuracoes
                    </button>
                    <button
                      onClick={() => handleMenuClick('ajuda')}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                    >
                      <HiOutlineQuestionMarkCircle size={15} />
                      Ajuda
                    </button>
                  </div>
                  <div className="border-t border-gray-100 dark:border-white/[0.06]">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <HiOutlineLogout size={15} />
                      Sair
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <NavBar activeView={activeView} onNavigate={onNavigate} />
    </header>
  );
}

function ContentHeader({ activeView, onNavigate }) {
  const meta = VIEW_META[activeView] || { title: 'Dashboard', parent: 'Dashboard' };

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-1">
      <nav className="hidden sm:flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-[#666]">
        <span className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Dashboard</span>
        <HiChevronRight size={12} />
        <span className="text-gray-500 dark:text-[#888]">{meta.parent}</span>
        <HiChevronRight size={12} />
        <span className="text-[var(--zelt-primary)] font-medium">{meta.title}</span>
      </nav>

      <div className="flex items-center justify-between mt-1.5">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-[#ededed]">{meta.title}</h1>
        <button
          onClick={() => onNavigate('operacoes/tarefas')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.08] rounded hover:border-[var(--zelt-primary)]/40 hover:text-[var(--zelt-primary)] transition-colors"
        >
          <HiOutlinePlus size={14} />
          Nova Tarefa
        </button>
      </div>
    </div>
  );
}

const BOTTOM_TABS = [
  { id: 'inicio', label: 'Inicio', icon: HiOutlineTemplate },
  { id: 'atendimentos', label: 'Atendimentos', icon: HiOutlineChatAlt2 },
  { id: 'ia', label: 'IA', icon: HiOutlineLightningBolt },
  { id: 'operacoes', label: 'Operacoes', icon: HiOutlineClipboardCheck },
  { id: 'mais', label: 'Mais', icon: HiOutlineMenu },
];

function getActiveTab(activeView) {
  if (activeView === 'dashboard') return 'inicio';
  if (activeView.startsWith('atendimentos')) return 'atendimentos';
  if (activeView.startsWith('ia/')) return 'ia';
  if (activeView.startsWith('operacoes')) return 'operacoes';
  return 'mais';
}

function MobileBottomBar({ activeView, onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sheet, setSheet] = useState(null);
  const activeTab = getActiveTab(activeView);

  const avatarSrc = user?.avatar;
  const sheetParent = sheet ? NAV_MAIN.find((i) => i.id === sheet) : null;
  const SheetIcon = sheetParent?.icon || HiOutlineMenu;

  const openTab = (id) => {
    if (id === 'inicio') {
      onNavigate('dashboard');
      return;
    }
    setSheet(id);
  };

  const go = (view) => {
    setSheet(null);
    onNavigate(view);
  };

  const handleLogout = () => {
    setSheet(null);
    logout();
    navigate('/login');
  };

  const sheetItems = (item) =>
    item.children.map((child) => {
      const ChildIcon = child.icon;
      const isActive = activeView === child.id;
      return (
        <button
          key={child.id}
          onClick={() => go(child.id)}
          className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
            isActive
              ? 'bg-[var(--zelt-primary)]/5 text-[var(--zelt-primary)]'
              : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5'
          }`}
        >
          <span className={`flex items-center justify-center w-9 h-9 rounded shrink-0 ${
            isActive
              ? 'bg-[var(--zelt-primary)]/10 text-[var(--zelt-primary)]'
              : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400'
          }`}>
            <ChildIcon size={17} />
          </span>
          <span className="flex-1 text-left text-[13px] font-medium">{child.label}</span>
          {isActive && <HiOutlineCheck size={16} />}
        </button>
      );
    });

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-gray-200 dark:border-white/[0.06] pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-stretch justify-around">
          {BOTTOM_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => openTab(tab.id)}
                className="relative flex flex-col items-center gap-1 pt-2 pb-1.5 flex-1 active:scale-95 transition-transform"
              >
                <span className={`relative flex items-center justify-center w-11 h-7 rounded-full transition-colors ${
                  isActive
                    ? 'bg-[var(--zelt-primary)]/10 text-[var(--zelt-primary)]'
                    : 'text-gray-400 dark:text-[#666]'
                }`}>
                  <tab.icon size={19} />
                </span>
                <span className={`text-[9px] font-medium ${
                  isActive ? 'text-[var(--zelt-primary)]' : 'text-gray-400 dark:text-[#666]'
                }`}>
                  {tab.label}
                </span>
                {isActive && <span className="absolute top-0 h-0.5 w-7 rounded-b-full bg-[var(--zelt-primary)]" />}
              </button>
            );
          })}
        </div>
      </nav>

      {sheet && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 lg:hidden animate-[fadeIn_.2s_ease-out]" onClick={() => setSheet(null)} />
          <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-white dark:bg-[#141414] rounded-t-2xl border-t border-gray-200 dark:border-white/[0.06] animate-[sheetIn_.28s_cubic-bezier(.32,.72,0,1)] max-h-[80dvh] flex flex-col pb-[env(safe-area-inset-bottom)]">
            <div className="px-4 pt-2 pb-2 border-b border-gray-100 dark:border-white/[0.06] flex items-center gap-3 shrink-0">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--zelt-primary)]/10 text-[var(--zelt-primary)] shrink-0">
                <SheetIcon size={17} />
              </div>
              <span className="flex-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                {sheetParent?.label || 'Menu'}
              </span>
              <button
                onClick={() => setSheet(null)}
                className="p-1.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                <HiOutlineX size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-1.5">
              {sheetParent && sheetItems(sheetParent)}

              {!sheetParent && (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-white/[0.06]">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-white/[0.06]" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--zelt-primary)] to-purple-400 flex items-center justify-center text-white text-sm font-bold">
                        {(user?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{user?.name || 'Usuario'}</p>
                      <p className="text-[10px] text-gray-400 truncate">{user?.email || 'usuario@zelt.ai'}</p>
                    </div>
                  </div>

                  <p className="px-4 pt-3 pb-1 text-[9px] font-semibold uppercase tracking-wider text-gray-400 dark:text-[#666]">
                    Integracoes
                  </p>
                  {sheetItems(NAV_MAIN.find((i) => i.id === 'integracoes'))}

                  <div className="my-1.5 border-t border-gray-100 dark:border-white/[0.06]" />
                  <button
                    onClick={() => go('configuracoes')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5 transition-colors"
                  >
                    <span className="flex items-center justify-center w-9 h-9 rounded bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400">
                      <HiOutlineCog size={17} />
                    </span>
                    Configuracoes
                  </button>
                  <button
                    onClick={() => go('ajuda')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5 transition-colors"
                  >
                    <span className="flex items-center justify-center w-9 h-9 rounded bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400">
                      <HiOutlineQuestionMarkCircle size={17} />
                    </span>
                    Ajuda
                  </button>

                  <div className="my-1.5 border-t border-gray-100 dark:border-white/[0.06]" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <span className="flex items-center justify-center w-9 h-9 rounded bg-red-500/10 text-red-500">
                      <HiOutlineLogout size={17} />
                    </span>
                    Sair da conta
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default function DashboardLayout({ viewComponents = {}, defaultView = 'dashboard', fullscreenViews = [], mobileFullscreenViews = [] }) {
  const { primaryColor } = useTheme();
  const [activeView, setActiveView] = useState(defaultView);
  const [prevView, setPrevView] = useState(defaultView);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const handleNavigate = (viewId) => {
    setPrevView(activeView);
    setActiveView(viewId);
  };

  const ActiveView = viewComponents[activeView] ?? null;
  const isFullscreen = fullscreenViews.includes(activeView) || (isMobile && mobileFullscreenViews.includes(activeView));

  return (
    <div className="min-h-screen bg-gray-50/60 dark:bg-[#050505]" style={getPrimaryVars(primaryColor)}>
      <MessageNotifications activeView={activeView} onNavigate={handleNavigate} />

      <div className={`flex flex-col ${isFullscreen ? 'h-dvh overflow-hidden' : 'min-h-screen'}`}>
        {!isFullscreen && <Header activeView={activeView} onNavigate={handleNavigate} />}

        {activeView === 'dashboard' && !isFullscreen && (
          <ContentHeader activeView={activeView} onNavigate={handleNavigate} />
        )}

        <main key={activeView} className={`flex-1 view-enter ${isFullscreen ? 'p-0' : 'p-4 sm:p-6 lg:p-8 pt-5 pb-24 lg:pb-5'}`}>
          {ActiveView ? (
            <Suspense fallback={
              <div className="flex flex-col items-center justify-center min-h-[55vh] gap-4 py-16">
                <img src="/banner.png" alt="Zelt.ai" className="h-7 opacity-70" />
                <div className="w-8 h-8 border-2 border-[var(--zelt-primary)]/20 border-t-[var(--zelt-primary)] rounded-full animate-spin" />
                <p className="text-xs text-gray-400 dark:text-[#666]">Carregando...</p>
              </div>
            }>
              <ActiveView onNavigate={handleNavigate} fullscreen={isFullscreen} onBack={() => handleNavigate(prevView)} />
            </Suspense>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
              Nenhum componente mapeado para <code className="ml-1 font-mono text-xs bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded">{activeView}</code>
            </div>
          )}
        </main>
      </div>

      {!isFullscreen && <MobileBottomBar activeView={activeView} onNavigate={handleNavigate} />}
    </div>
  );
}
