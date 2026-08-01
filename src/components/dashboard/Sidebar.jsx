import { useState, useEffect, useRef } from "react";
import { BiChevronDown, BiCreditCard, BiPackage } from "react-icons/bi";
import { BsFunnel } from "react-icons/bs";
import { FaClock } from "react-icons/fa";
import { FiZap } from "react-icons/fi";
import {
  RiDashboardLine,
  RiMessage3Line,
  RiRobot2Line,
  RiContactsLine,
  RiCalendarLine,
  RiBarChartLine,
  RiMegaphoneLine,
  RiBookOpenLine,
  RiPlugLine,
  RiSettings4Line,
  RiQuestionLine,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiLogoutBoxLine,
  RiSettings3Line,
  RiUser3Line,
  RiCheckboxCircleLine,
  RiCloseLine,
  RiMenuLine,
  RiChat3Line,
  RiLiveLine,
  RiTimeLine,
  RiListCheck2,
  RiHistoryLine,
  RiHeartLine,
  RiUserHeartLine,
  RiSparklingLine,
  RiBrainLine,
  RiFileTextLine,
  RiLightbulbLine,
  RiFlowChart,
  RiRulerLine,
  RiReplyLine,
  RiFileListLine,
  RiGroupLine,
  RiBuilding4Line,
  RiPriceTag3Line,
  RiPieChartLine,
  RiCalendar2Line,
  RiCalendarEventLine,
  RiArrowUpCircleLine,
  RiLineChartLine,
  RiSpeedLine,
  RiDownloadLine,
  RiSendPlaneLine,
  RiWhatsappLine,
  RiLayoutGridLine,
  RiFilePdf2Line,
  RiFolder3Line,
  RiSearchLine,
  RiShareLine,
  RiKeyLine,
  RiWebhookLine,
  RiGoogleLine,
  RiOpenaiLine,
  RiUserSettingsLine,
  RiShieldCheckLine,
  RiBellLine,
  RiLifebuoyLine,
  RiBook2Line,
  RiMailLine,
  RiHeadphoneLine,
} from "react-icons/ri";

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: RiDashboardLine,
    badge: null,
  },
  {
    id: "atendimentos",
    label: "Atendimentos",
    icon: RiMessage3Line,
    badge: 12,
    badgeColor: "bg-violet-500",
    children: [
      { id: "conversas", label: "Conversas", icon: RiChat3Line, badge: 12 },
      { id: "chat-ao-vivo", label: "Chat ao vivo", icon: RiLiveLine, badge: 3, badgeColor: "bg-emerald-500" },
      { id: "encerradas", label: "Conversas encerradas", icon: RiCheckboxCircleLine },
      { id: "pendentes", label: "Conversas pendentes", icon: RiTimeLine, badge: 5 },
      { id: "fila", label: "Fila de atendimento", icon: RiListCheck2 },
      { id: "favoritas", label: "Mensagens favoritas", icon: RiHeartLine },
      { id: "humano", label: "Atendimento humano", icon: RiUserHeartLine },
    ],
  },
  {
    id: "ia",
    label: "Inteligência Artificial",
    icon: RiRobot2Line,
    badge: null,
    children: [
      { id: "status-ia", label: "Status da IA", icon: RiSparklingLine, badge: "Ativo", badgeColor: "bg-emerald-500" },
      { id: "treinamento", label: "Treinamento", icon: RiBrainLine },
      { id: "base-ia", label: "Base de conhecimento", icon: RiBookOpenLine },
      { id: "prompts", label: "Prompts", icon: RiFileTextLine },
      { id: "fluxos", label: "Fluxos inteligentes", icon: RiFlowChart },
      { id: "regras", label: "Regras", icon: RiRulerLine },
      { id: "respostas", label: "Respostas automáticas", icon: RiReplyLine },
      { id: "logs-ia", label: "Logs da IA", icon: RiFileListLine },
      { id: "historico-ia", label: "Histórico", icon: RiHistoryLine },
      { id: "aprendizado", label: "Aprendizado", icon: RiLightbulbLine },
    ],
  },
  {
    id: "crm",
    label: "CRM",
    icon: RiContactsLine,
    children: [
      { id: "clientes", label: "Clientes", icon: RiUser3Line },
      { id: "leads", label: "Leads", icon: FiZap, badge: 8 },
      { id: "empresas", label: "Empresas", icon: RiBuilding4Line },
      { id: "pipeline", label: "Pipeline", icon: RiBarChartLine },
      { id: "funil", label: "Funil", icon: BsFunnel },
      { id: "etiquetas", label: "Etiquetas", icon: RiPriceTag3Line },
      { id: "historico-crm", label: "Histórico", icon: RiHistoryLine },
      { id: "segmentacoes", label: "Segmentações", icon: RiGroupLine },
    ],
  },
  {
    id: "agendamentos",
    label: "Agendamentos",
    icon: RiCalendarLine,
    children: [
      { id: "agenda", label: "Agenda", icon: RiCalendarLine },
      { id: "calendario", label: "Calendário", icon: RiCalendar2Line },
      { id: "proximos", label: "Próximos horários", icon: RiCalendarEventLine },
      { id: "disponiveis", label: "Horários disponíveis", icon: RiCheckboxCircleLine },
      { id: "historico-ag", label: "Histórico", icon: RiHistoryLine },
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: RiBarChartLine,
    children: [
      { id: "dash-analytics", label: "Dashboard", icon: RiPieChartLine },
      { id: "conversoes", label: "Conversões", icon: RiArrowUpCircleLine },
      { id: "receita", label: "Receita", icon: RiLineChartLine },
      { id: "crescimento", label: "Crescimento", icon: RiBarChartLine },
      { id: "performance", label: "Performance", icon: RiSpeedLine },
      { id: "tempo-medio", label: "Tempo médio", icon: FaClock },
      { id: "relatorios", label: "Relatórios", icon: RiFileListLine },
      { id: "exportacoes", label: "Exportações", icon: RiDownloadLine },
    ],
  },
  {
    id: "campanhas",
    label: "Campanhas",
    icon: RiMegaphoneLine,
    children: [
      { id: "disparos", label: "Disparos", icon: RiSendPlaneLine },
      { id: "whatsapp-camp", label: "WhatsApp", icon: RiWhatsappLine },
      { id: "templates", label: "Templates", icon: RiLayoutGridLine },
      { id: "campanhas-list", label: "Campanhas", icon: RiMegaphoneLine },
      { id: "agendadas", label: "Agendadas", icon: RiCalendarEventLine },
      { id: "historico-camp", label: "Histórico", icon: RiHistoryLine },
    ],
  },
  {
    id: "base-conhecimento",
    label: "Base de Conhecimento",
    icon: RiBookOpenLine,
    children: [
      { id: "pdfs", label: "PDFs", icon: RiFilePdf2Line },
      { id: "documentos", label: "Documentos", icon: RiFileTextLine },
      { id: "faq", label: "FAQ", icon: RiQuestionLine },
      { id: "arquivos", label: "Arquivos", icon: RiFolder3Line },
      { id: "categorias", label: "Categorias", icon: RiLayoutGridLine },
      { id: "pesquisa", label: "Pesquisa", icon: RiSearchLine },
    ],
  },
  {
    id: "integracoes",
    label: "Integrações",
    icon: RiPlugLine,
    children: [
      { id: "whatsapp-int", label: "WhatsApp", icon: RiWhatsappLine },
      { id: "openai", label: "OpenAI", icon: RiRobot2Line },
      { id: "evolution", label: "Evolution API", icon: RiShareLine },
      { id: "brasilapi", label: "BrasilAPI", icon: BiPackage },
      { id: "google-cal", label: "Google Calendar", icon: RiGoogleLine },
      { id: "stripe-int", label: "Stripe", icon: BiCreditCard },
      { id: "api-keys-int", label: "API Keys", icon: RiKeyLine },
      { id: "webhooks", label: "Webhooks", icon: RiWebhookLine },
    ],
  },
  {
    id: "assinatura",
    label: "Assinatura",
    icon: BiCreditCard,
    children: [
      { id: "plano-atual", label: "Plano atual", icon: BiPackage },
      { id: "upgrade", label: "Upgrade", icon: RiArrowUpCircleLine, badge: "Pro", badgeColor: "bg-violet-500" },
      { id: "historico-pag", label: "Histórico de pagamentos", icon: RiHistoryLine },
      { id: "faturas", label: "Faturas", icon: RiFileListLine },
      { id: "metodos-pag", label: "Métodos de pagamento", icon: BiCreditCard },
    ],
  },
  {
    id: "configuracoes",
    label: "Configurações",
    icon: RiSettings4Line,
    children: [
      { id: "perfil", label: "Perfil", icon: RiUser3Line },
      { id: "empresa", label: "Empresa", icon: RiBuilding4Line },
      { id: "usuarios", label: "Usuários", icon: RiGroupLine },
      { id: "equipe", label: "Equipe", icon: RiGroupLine },
      { id: "permissoes", label: "Permissões", icon: RiShieldCheckLine },
      { id: "seguranca", label: "Segurança", icon: RiShieldCheckLine },
      { id: "api-keys-cfg", label: "API Keys", icon: RiKeyLine },
      { id: "preferencias", label: "Preferências", icon: RiUserSettingsLine },
      { id: "notificacoes", label: "Notificações", icon: RiBellLine },
    ],
  },
  {
    id: "ajuda",
    label: "Ajuda",
    icon: RiQuestionLine,
    children: [
      { id: "central-ajuda", label: "Central de ajuda", icon: RiLifebuoyLine },
      { id: "documentacao", label: "Documentação", icon: RiBook2Line },
      { id: "contato", label: "Contato", icon: RiMailLine },
      { id: "suporte", label: "Suporte", icon: RiHeadphoneLine },
    ],
  },
];

function NavBadge({ badge, color = "bg-violet-500" }) {
  if (!badge) return null;
  const isText = typeof badge === "string";
  return (
    <span
      className={`ml-auto flex-shrink-0 text-[10px] font-semibold text-white px-1.5 py-0.5 rounded-full leading-none ${color}`}
    >
      {badge}
    </span>
  );
}

function Tooltip({ label, visible }) {
  if (!visible) return null;
  return (
    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
      <div className="bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap border border-gray-700">
        {label}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
      </div>
    </div>
  );
}

function NavItem({ item, collapsed, activeId, setActiveId, openMenus, toggleMenu, depth = 0 }) {
  const hasChildren = item.children && item.children.length > 0;
  const isOpen = openMenus[item.id];
  const isActive = activeId === item.id;
  const isChildActive = hasChildren && item.children.some((c) => c.id === activeId);
  const [showTooltip, setShowTooltip] = useState(false);

  const Icon = item.icon;

  const handleClick = () => {
    if (hasChildren) {
      if (!collapsed) toggleMenu(item.id);
    } else {
      setActiveId(item.id);
    }
  };

  if (depth === 0) {
    return (
      <div className="relative">
        <button
          onClick={handleClick}
          onMouseEnter={() => collapsed && setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group
            ${isActive || isChildActive
              ? "bg-violet-50 text-violet-700"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }
          `}
        >
          <span className={`flex-shrink-0 text-lg transition-colors duration-150
            ${isActive || isChildActive ? "text-violet-600" : "text-gray-400 group-hover:text-gray-600"}
          `}>
            <Icon />
          </span>

          {!collapsed && (
            <>
              <span className="flex-1 text-left truncate">{item.label}</span>
              {item.badge && !hasChildren && (
                <NavBadge badge={item.badge} color={item.badgeColor} />
              )}
              {hasChildren && (
                <span className={`flex-shrink-0 text-gray-400 text-base transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                  <BiChevronDown />
                </span>
              )}
            </>
          )}

          {collapsed && item.badge && !hasChildren && (
            <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-violet-500" />
          )}

          {(isActive || isChildActive) && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-violet-600 rounded-r-full" />
          )}
        </button>

        {collapsed && <Tooltip label={item.label} visible={showTooltip} />}

        {hasChildren && !collapsed && (
          <div
            className={`overflow-hidden transition-all duration-200 ease-in-out ${
              isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="mt-0.5 ml-4 pl-3 border-l border-gray-100 space-y-0.5 py-1">
              {item.children.map((child) => (
                <NavItem
                  key={child.id}
                  item={child}
                  collapsed={false}
                  activeId={activeId}
                  setActiveId={setActiveId}
                  openMenus={openMenus}
                  toggleMenu={toggleMenu}
                  depth={1}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Child item
  const ChildIcon = item.icon;
  return (
    <button
      onClick={() => setActiveId(item.id)}
      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-all duration-150 group
        ${activeId === item.id
          ? "bg-violet-50 text-violet-700 font-medium"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
        }
      `}
    >
      <span className={`flex-shrink-0 text-base transition-colors duration-150
        ${activeId === item.id ? "text-violet-500" : "text-gray-400 group-hover:text-gray-500"}
      `}>
        <ChildIcon />
      </span>
      <span className="flex-1 text-left truncate text-[13px]">{item.label}</span>
      {item.badge && <NavBadge badge={item.badge} color={item.badgeColor} />}
    </button>
  );
}

function SidebarContent({ collapsed, activeId, setActiveId, openMenus, toggleMenu }) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`flex-shrink-0 px-4 py-4 border-b border-gray-100 ${collapsed ? "px-3" : ""}`}>
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
        <img src="/icon.png" className={`h-9 ${collapsed ? "w-12" : ""}`} />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 text-[15px] tracking-tight">Zelt.ai</span>
                <span className="text-[10px] font-semibold text-violet-700 bg-violet-100 px-1.5 py-0.5 rounded-full leading-none">
                  Pro
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5 truncate">Plataforma de atendimento IA</p>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-hide">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            collapsed={collapsed}
            activeId={activeId}
            setActiveId={setActiveId}
            openMenus={openMenus}
            toggleMenu={toggleMenu}
          />
        ))}
      </div>

      {/* Footer */}
      <div className={`flex-shrink-0 border-t border-gray-100 p-3 ${collapsed ? "px-2" : ""}`}>
        {!collapsed ? (
          <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                JD
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-gray-800 truncate leading-tight">João Dias</p>
              <p className="text-[11px] text-gray-400 truncate leading-tight">CEO · Acme Corp</p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1 rounded-md hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors">
                <RiSettings3Line size={14} />
              </button>
              <button className="p-1 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                <RiLogoutBoxLine size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="relative cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                JD
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ZeltSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId, setActiveId] = useState("dashboard");
  const [openMenus, setOpenMenus] = useState({ atendimentos: true });
  const drawerRef = useRef(null);

  const toggleMenu = (id) => {
    setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Close mobile drawer on outside click
  useEffect(() => {
    const handler = (e) => {
      if (mobileOpen && drawerRef.current && !drawerRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileOpen]);

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-gray-100 shadow-sm flex-shrink-0 transition-all duration-300 ease-in-out relative
          ${collapsed ? "w-16" : "w-64"}
        `}
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        <SidebarContent
          collapsed={collapsed}
          activeId={activeId}
          setActiveId={setActiveId}
          openMenus={openMenus}
          toggleMenu={toggleMenu}
        />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-violet-600 hover:border-violet-300 transition-all z-10"
        >
          {collapsed ? <RiMenuUnfoldLine size={12} /> : <RiMenuFoldLine size={12} />}
        </button>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden" />
      )}

      {/* Mobile Drawer */}
      <div
        ref={drawerRef}
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        >
          <RiCloseLine size={18} />
        </button>
        <SidebarContent
          collapsed={false}
          activeId={activeId}
          setActiveId={(id) => { setActiveId(id); setMobileOpen(false); }}
          openMenus={openMenus}
          toggleMenu={toggleMenu}
        />
      </div>

      {/* Main area preview */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <RiMenuLine size={20} />
          </button>
          <div className="flex items-center gap-2">
            <img src="/banner.png" className="h-10" />
          </div>
        </div>

        {/* Content placeholder */}
        <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
          <div className="text-center max-w-sm">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
              <RiDashboardLine className="text-violet-600 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Sidebar do Zelt.ai</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Clique nos itens do menu para navegar. A sidebar está completamente funcional com submenus, estado ativo, colapso e responsividade mobile.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <span className="text-xs bg-violet-50 text-violet-600 px-2.5 py-1 rounded-full font-medium">Submenus</span>
              <span className="text-xs bg-violet-50 text-violet-600 px-2.5 py-1 rounded-full font-medium">Collapsível</span>
              <span className="text-xs bg-violet-50 text-violet-600 px-2.5 py-1 rounded-full font-medium">Mobile Drawer</span>
              <span className="text-xs bg-violet-50 text-violet-600 px-2.5 py-1 rounded-full font-medium">Tooltips</span>
              <span className="text-xs bg-violet-50 text-violet-600 px-2.5 py-1 rounded-full font-medium">Badges</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
