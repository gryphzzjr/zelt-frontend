import React, { useState, useRef, useEffect, Suspense } from 'react';
import {
  HiOutlineTemplate,
  HiOutlineChatAlt2,
  HiChevronDown,
  HiChevronUp,
  HiOutlineLightningBolt,
  HiOutlineUsers,
  HiOutlineCalendar,
  HiOutlineChartBar,
  HiOutlineShare,
  HiOutlineQuestionMarkCircle,
  HiOutlineLogout,
  HiOutlineUserCircle,
  HiOutlineBell,
  HiOutlineSearch,
  HiOutlineOfficeBuilding,
  HiOutlineCheck,
  HiOutlineShieldCheck,
  HiOutlineClipboardCheck,
} from 'react-icons/hi';
import { CiSettings } from 'react-icons/ci';
import { BiChevronLeft } from 'react-icons/bi';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme, getPrimaryVars } from '../../contexts/ThemeContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MessageNotifications from './MessageNotifications';

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
      { id: 'atendimentos/conversas', label: 'Conversas' },
      { id: 'atendimentos/chat',      label: 'Chat ao vivo' },
    ],
  },
  {
    id: 'ia',
    label: 'IA',
    icon: HiOutlineLightningBolt,
    children: [
      { id: 'ia/base-conhecimento',     label: 'Base de conhecimento' },
      { id: 'ia/prompts',               label: 'Prompts' },
      { id: 'ia/respostas-automaticas', label: 'Respostas automaticas' },
      { id: 'ia/templates',             label: 'Templates de Treinamento' },
    ],
  },
  {
    id: 'equipe',
    label: 'Equipe',
    icon: HiOutlineShieldCheck,
    children: [
      { id: 'equipe/membros',          label: 'Membros' },
      { id: 'equipe/cargos-permissoes', label: 'Cargos e Permissoes' },
    ],
  },
  {
    id: 'operacoes',
    label: 'Operacoes',
    icon: HiOutlineClipboardCheck,
    children: [
      { id: 'operacoes/tarefas', label: 'Lista de Tarefas' },
      { id: 'operacoes/agenda',   label: 'Agenda' },
    ],
  },
  {
    id: 'integracoes',
    label: 'Integracoes',
    icon: HiOutlineShare,
    children: [
      { id: 'integracoes',               label: 'Visao Geral' },
      { id: 'integracoes/whatsapp',       label: 'WhatsApp' },
      { id: 'integracoes/google-sheets',  label: 'Google Sheets' },
      { id: 'integracoes/google-drive',   label: 'Google Drive' },
      { id: 'integracoes/google-calendar',label: 'Google Calendar' },
      { id: 'integracoes/gmail',          label: 'Gmail' },
      { id: 'integracoes/api-webhooks',   label: 'APIs' },
    ],
  },
];

const NAV_BOTTOM = [
  { id: 'configuracoes', label: 'Configuracoes', icon: CiSettings },
  { id: 'ajuda',         label: 'Ajuda',         icon: HiOutlineQuestionMarkCircle },
];

function Sidebar({ activeView, onNavigate, openMenus, toggleSubmenu }) {
  const { user, workspace, workspaces, switchWorkspace, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [wsMenuOpen, setWsMenuOpen] = useState(false);
  const wsMenuRef = useRef(null);

  const baseCls =
    'flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 text-gray-600 hover:bg-gray-50 hover:text-gray-900';
  const activeCls =
    'flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm font-semibold bg-[var(--zelt-primary-100)] text-[var(--zelt-primary)]';

  const isParentActive = (item) =>
    item.children?.some((c) => c.id === activeView);

  useEffect(() => {
    const handler = (e) => {
      if (wsMenuRef.current && !wsMenuRef.current.contains(e.target)) {
        setWsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSwitchWorkspace = (ws) => {
    switchWorkspace(ws.id);
    const uid = user?.id;
    navigate(`/workspace/${uid}/dashboard?workspaceId=${ws.id}`, { replace: true });
    setWsMenuOpen(false);
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex flex-col w-64 bg-white dark:bg-[#0a0a0a] border-r border-gray-100 dark:border-white/[0.06] h-screen">
      <div className="flex items-center h-16 px-6 border-b border-gray-50 dark:border-white/[0.06]">
        <div className="bg-transparent rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-stone-700 dark:text-stone-300 cursor-pointer">
          <BiChevronLeft size={24} />
        </div>
        <img src="/banner.png" alt="Zelt.ai" className="mr-auto h-10" />
      </div>

      <div className="flex-1 px-4 py-6 overflow-y-auto space-y-1 custom-scrollbar">
        {NAV_MAIN.map((item) => {
          const IconComp = item.icon;

          if (!item.children) {
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={activeView === item.id ? activeCls : baseCls}
              >
                <div className="flex items-center gap-3">
                  <IconComp size={20} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          }

          const parentActive = isParentActive(item);
          const isOpen = openMenus[item.id];

          return (
            <div key={item.id}>
              <button
                onClick={() => toggleSubmenu(item.id)}
                className={parentActive ? activeCls : baseCls}
              >
                <div className="flex items-center gap-3">
                  <IconComp size={20} />
                  <span>{item.label}</span>
                </div>
                {isOpen ? <HiChevronUp size={16} /> : <HiChevronDown size={16} />}
              </button>

              {isOpen && (
                <div className="mt-1 space-y-1">
                  {item.children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => onNavigate(child.id)}
                      className={`w-full text-left flex items-center gap-3 pl-11 pr-4 py-2 rounded-lg text-xs font-medium transition-colors duration-150 ${
                        activeView === child.id
                          ? 'text-[var(--zelt-primary)] font-semibold bg-[var(--zelt-primary-50)]'
                          : 'text-gray-500 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <div className="pt-4 my-2 border-t border-gray-50 dark:border-white/[0.06]" />

        {NAV_BOTTOM.map((item) => {
          const IconComp = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={activeView === item.id ? activeCls : baseCls}
            >
              <div className="flex items-center gap-3">
                <IconComp size={20} />
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="border-t border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
        {workspaces.length > 1 && (
          <div className="px-4 pt-3 pb-1 relative" ref={wsMenuRef}>
            <button
              onClick={() => setWsMenuOpen(!wsMenuOpen)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-white/5 border border-gray-200/60 dark:border-white/[0.08] hover:border-gray-300 dark:hover:border-white/15 transition-all text-left"
            >
              <div className="w-6 h-6 rounded-md bg-[var(--zelt-primary-100)] flex items-center justify-center shrink-0">
                <HiOutlineOfficeBuilding size={12} className="text-[var(--zelt-primary)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-gray-700 dark:text-gray-300 truncate">{workspace?.name || 'Workspace'}</p>
              </div>
              <HiChevronDown size={12} className={`text-gray-400 transition-transform ${wsMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {wsMenuOpen && (
              <div className="absolute bottom-full left-4 right-4 mb-1.5 bg-white dark:bg-[#141414] border border-gray-200/60 dark:border-white/[0.08] rounded-xl py-1.5 z-30 shadow-lg max-h-[200px] overflow-y-auto">
                <p className="px-3 py-1 text-[9px] text-gray-400 uppercase tracking-wide">Trocar workspace</p>
                {workspaces.map(ws => (
                  <button
                    key={ws.id}
                    onClick={() => handleSwitchWorkspace(ws)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${
                      ws.id === workspace?.id ? 'bg-[var(--zelt-primary-50)]' : ''
                    }`}
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                      ws.id === workspace?.id ? 'bg-[var(--zelt-primary-100)]' : 'bg-gray-100 dark:bg-white/5'
                    }`}>
                      <HiOutlineOfficeBuilding size={10} className={ws.id === workspace?.id ? 'text-[var(--zelt-primary)]' : 'text-gray-400'} />
                    </div>
                    <span className={`text-xs truncate ${
                      ws.id === workspace?.id ? 'text-[var(--zelt-primary)] font-medium' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {ws.name}
                    </span>
                    {ws.id === workspace?.id && (
                      <HiOutlineCheck size={12} className="text-[var(--zelt-primary)] ml-auto shrink-0" />
                    )}
                  </button>
                ))}
                <div className="border-t border-gray-100 dark:border-white/[0.06] mt-1 pt-1">
                  <button
                    onClick={() => { setWsMenuOpen(false); navigate(`/workspace/${user?.id}/workspaces`); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <span className="text-xs text-gray-500 dark:text-gray-400">Gerenciar workspaces</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-[var(--zelt-primary)]">
                <HiOutlineUserCircle size={36} className="opacity-80" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[110px]">
                  {user?.name || 'Usuario'}
                </span>
                <span className="text-[10px] font-semibold text-[var(--zelt-primary)] bg-[var(--zelt-primary-100)] px-1.5 py-0.5 rounded w-max mt-0.5">
                  {workspace?.name || 'Workspace'}
                </span>
              </div>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="p-2 text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 hover:text-red-500 transition-colors duration-200"
              title="Sair"
            >
              <HiOutlineLogout size={20} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Header() {
  const { workspace } = useAuth();
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-8 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/[0.06]">
      <div className="relative w-72">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
          <HiOutlineSearch size={18} />
        </span>
        <input
          type="text"
          placeholder="Buscar conversas, contatos ou relatorios..."
          className="w-full py-2 pl-10 pr-4 text-xs bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/[0.06] rounded-lg focus:outline-none focus:border-[var(--zelt-primary)]/40 focus:bg-white dark:focus:bg-white/5 transition-all duration-200 text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200 transition-colors duration-200">
          <HiOutlineBell size={22} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--zelt-primary)] rounded-full" />
        </button>

        <div className="h-6 w-px bg-gray-100 dark:bg-white/[0.06]" />

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--zelt-primary)] to-purple-400 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            U
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-none">{workspace?.name || 'Workspace'}</span>
            <span className="text-[10px] text-gray-400 mt-0.5">Online</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function DashboardLayout({ viewComponents = {}, defaultView = 'dashboard' }) {
  const { primaryColor } = useTheme();
  const [activeView, setActiveView] = useState(defaultView);
  const [openMenus, setOpenMenus] = useState({
    atendimentos: false,
    ia: false,
    equipe: false,
    operacoes: false,
    integracoes: false,
  });

  const toggleSubmenu = (menu) =>
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));

  const handleNavigate = (viewId) => {
    setActiveView(viewId);
    const parent = NAV_MAIN.find((item) =>
      item.children?.some((c) => c.id === viewId)
    );
    if (parent) {
      setOpenMenus((prev) => ({ ...prev, [parent.id]: true }));
    }
  };

  const ActiveView = viewComponents[activeView] ?? null;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505]" style={getPrimaryVars(primaryColor)}>
      <MessageNotifications activeView={activeView} onNavigate={handleNavigate} />
      <Sidebar
        activeView={activeView}
        onNavigate={handleNavigate}
        openMenus={openMenus}
        toggleSubmenu={toggleSubmenu}
      />

      <div className="pl-64 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 p-8">
          {ActiveView ? (
            <Suspense fallback={
              <div className="flex items-center justify-center py-20">
                <div className="w-5 h-5 border-2 border-[var(--zelt-primary)]/30 border-t-[var(--zelt-primary)] rounded-full animate-spin" />
              </div>
            }>
              <ActiveView onNavigate={handleNavigate} />
            </Suspense>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
              Nenhum componente mapeado para <code className="ml-1 font-mono text-xs bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded">{activeView}</code>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
