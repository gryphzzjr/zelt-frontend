import { useState, useRef } from "react";
import {
  LayoutDashboard, Bot, BarChart3, Settings,
  BookOpen, Filter, LogOut, ChevronRight,
  X,
} from "lucide-react";

const NAV_MAIN = [
  { id: "overview", label: "Visão Geral", icon: LayoutDashboard },
  {
    id: "agents",
    label: "Agentes de IA",
    icon: Bot,
    children: [
      { id: "agents-train", label: "Treinamento", icon: BookOpen },
      { id: "agents-flows", label: "Fluxos", icon: Filter },
    ],
  },
];

const NAV_BOTTOM = [
  { id: "settings", label: "Configurações", icon: Settings },
];

const isChildActive = (item, active) =>
  item.children?.some((c) => c.id === active) ?? false;

function Tooltip({ label, children }) {
  const [show, setShow] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 pointer-events-none">
          <span className="bg-zinc-800 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}

function NavItem({ item, active, onNav, expanded }) {
  const [open, setOpen] = useState(false);
  const Icon = item.icon;
  const hasChildren = !!item.children?.length;
  const isActive = active === item.id || isChildActive(item, active);
  const activeClass = "text-green-400 bg-green-500/10";
  const idleClass = "text-zinc-500 hover:text-zinc-200 hover:bg-white/5";

  const btn = (
    <button
      onClick={() => (hasChildren ? setOpen((p) => !p) : onNav(item.id))}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? activeClass : idleClass}`}
    >
      <Icon size={18} strokeWidth={1.75} className="flex-shrink-0" />
      {expanded && (
        <>
          <span className="flex-1 text-left">{item.label}</span>
          {hasChildren && (
            <ChevronRight
              size={12}
              strokeWidth={2}
              className={`transition-transform ${open ? "rotate-90" : ""}`}
            />
          )}
        </>
      )}
    </button>
  );

  return (
    <div>
      {expanded ? btn : <Tooltip label={item.label}>{btn}</Tooltip>}

      {hasChildren && open && expanded && (
        <div className="mt-0.5 ml-4 pl-3 border-l border-white/[0.06] space-y-0.5">
          {item.children.map((child) => {
            const ChildIcon = child.icon;
            return (
              <button
                key={child.id}
                onClick={() => onNav(child.id)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  active === child.id ? activeClass : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
                }`}
              >
                <ChildIcon size={13} strokeWidth={1.75} className="flex-shrink-0" />
                {child.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ active, onNav }) {
  const [expanded, setExpanded] = useState(false);
  const [logOutOpen, setLogOutOpen] = useState(false);
  const timer = useRef(null);

  // Função para lidar com o hover de forma limpa
  const handleMouseEnter = () => {
    timer.current = setTimeout(() => setExpanded(true), 80);
  };

  const handleMouseLeave = () => {
    if (timer.current) clearTimeout(timer.current);
    setExpanded(false);
  };

  return (
    <aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        width: expanded ? 232 : 64,
        transition: "width 240ms cubic-bezier(0.4, 0, 0.2, 1)"
      }}
      className="hidden lg:flex flex-col h-screen sticky top-0 flex-shrink-0 bg-[#0d0d10] border-r border-white/[0.05] overflow-hidden z-40"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-3.5 h-14 border-b border-white/[0.05] flex-shrink-0">
        <img src="/logo1.png" alt="Zelt" className="w-7 h-7 object-contain flex-shrink-0" />
        <div
          style={{
            opacity: expanded ? 1 : 0,
            transition: "opacity 160ms ease",
            whiteSpace: "nowrap",
            visibility: expanded ? "visible" : "hidden",
          }}
          className="flex items-center"
        >
          <span className="text-white font-semibold text-sm tracking-tight">
            ZELT<span className="text-green-400">.AI</span>
          </span>
          <span className="ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
            Admin
          </span>
        </div>
      </div>

      {/* Navegação Principal */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {NAV_MAIN.map((item) => (
          <NavItem key={item.id} item={item} active={active} onNav={onNav} expanded={expanded} />
        ))}
      </nav>

      <div className="mx-3 h-px bg-white/[0.05]" />

      {/* Navegação Inferior (Configurações, etc) */}
      <div className="px-2 py-3 space-y-0.5">
        {NAV_BOTTOM.map((item) => (
          <NavItem key={item.id} item={item} active={active} onNav={onNav} expanded={expanded} />
        ))}
      </div>

      {/* Card de Usuário */}
      <div className="px-2 py-3 border-t border-white/[0.05]">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer relative">
          <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
            RT
          </div>

          <div
            style={{
              opacity: expanded ? 1 : 0,
              transition: "opacity 140ms ease",
              whiteSpace: "nowrap",
              flex: 1,
              minWidth: 0,
            }}
          >
            <p className="text-xs font-medium text-white text-left truncate">Rafael Torres</p>
            <p className="text-[10px] text-zinc-500 text-left">Plano Básico</p>
          </div>

          {expanded && (
            <button
              onClick={() => setLogOutOpen(true)}
              className="p-1 hover:bg-white/10 rounded-md transition-colors"
            >
              <LogOut size={13} strokeWidth={1.75} className="text-zinc-500 hover:text-red-400" />
            </button>
          )}
        </div>
      </div>

      {/* Modal de Logout Simples */}
      {logOutOpen && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[50]">
          {/* Card do Modal */}
          <div className="bg-[#16161a] border border-white/[0.08] w-full max-w-[400px] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
              <h1 className="text-white font-medium text-lg tracking-tight">Sair do sistema</h1>
              <button
                onClick={() => setLogOutOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors p-1"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-8 text-center lg:text-left">
              <p className="text-zinc-400 text-sm leading-relaxed">
                Tem certeza que deseja encerrar sua sessão? Você precisará fazer login novamente para acessar o painel do <span className="text-green-400 font-medium">Zelt.ai</span>.
              </p>
            </div>

            {/* Footer / Actions */}
            <div className="flex flex-col sm:flex-row gap-3 px-6 py-4 bg-white/[0.02] border-t border-white/[0.05]">
              <button
                onClick={() => setLogOutOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white text-sm font-medium transition-all"
              >
                Cancelar
              </button>
              <button
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-sm font-medium transition-all"
              >
                Sair agora
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export function BottomBar({ active, onNav }) {
  const ITEMS = [
    { id: "overview",     label: "Início",      icon: LayoutDashboard },
    { id: "agents-train", label: "Treino",      icon: BookOpen        },
    { id: "settings",     label: "Config.",     icon: Settings        },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0d0d10]/95 backdrop-blur-xl border-t border-white/[0.05]">
      <div className="flex h-14 px-2">
        {ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onNav(id)}
              className="flex-1 flex flex-col items-center justify-center gap-1 relative"
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-green-400 rounded-full" />
              )}
              <Icon
                size={17}
                strokeWidth={isActive ? 2 : 1.75}
                className={isActive ? "text-green-400" : "text-zinc-600"}
              />
              <span className={`text-[9px] font-medium ${isActive ? "text-green-400" : "text-zinc-600"}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}