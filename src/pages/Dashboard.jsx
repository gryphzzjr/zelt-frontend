import {
  Bell,
  BookOpen,
  Bot,
  CheckCircle2,
  CreditCard,
  Eye,
  FileText,
  Link2,
  LogOut,
  MessageCircle,
  MessageSquare,
  Moon,
  MoreVertical,
  Phone,
  Plus,
  QrCode,
  RefreshCw,
  Save,
  Settings,
  Sun,
  Trash2,
  Upload,
  User,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getPrompt, savePrompt } from "../services/prompt";
import { listDocuments, uploadDocument, deleteDocument, addUrl, listUrls } from "../services/knowledge";
import { listQuickAnswers, createQuickAnswer, updateQuickAnswer, deleteQuickAnswer } from "../services/quickAnswers";
import { getWhatsAppStatus, verifyWhatsApp, connectWhatsApp, disconnectWhatsApp, getWhatsAppProfile } from "../services/whatsapp";
import { getBilling, cancelBilling, getPlans, createCheckout } from "../services/billing";
import { getPreferences, savePreferences } from "../services/notifications";
import { getMe, updateMe } from "../services/auth";

// ── Theme context ──────────────────────────────────────────────────────────
function useTheme() {
  const [dark, setDark] = useState(true);
  return { dark, toggle: () => setDark((d) => !d) };
}

// ── Design tokens (theme-aware) ────────────────────────────────────────────
function tokens(dark) {
  return {
    bg: dark ? "bg-zinc-950" : "bg-slate-50",
    card: dark
      ? "bg-zinc-900 border border-zinc-800 rounded-2xl"
      : "bg-white border border-slate-200 rounded-2xl",
    inp: dark
      ? "w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-zinc-600 transition"
      : "w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 transition",
    text: dark ? "text-white" : "text-slate-900",
    subtext: dark ? "text-zinc-500" : "text-slate-500",
    muted: dark ? "text-zinc-600" : "text-slate-400",
    divider: dark ? "bg-zinc-800" : "bg-slate-100",
    surface: dark ? "bg-zinc-800" : "bg-slate-100",
    surfaceHover: dark ? "hover:bg-zinc-700" : "hover:bg-slate-200",
    border: dark ? "border-zinc-800" : "border-slate-200",
    navBg: dark
      ? "bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/60"
      : "bg-white/90 backdrop-blur-md border-b border-slate-200",
    subnav: dark
      ? "bg-zinc-950/70 backdrop-blur-md border-b border-zinc-800/40"
      : "bg-slate-50/80 backdrop-blur-md border-b border-slate-200",
    tabBar: dark
      ? "bg-zinc-900 border border-zinc-800 rounded-2xl"
      : "bg-slate-100 border border-slate-200 rounded-2xl",
    tabActive: dark ? "bg-zinc-800 text-white shadow" : "bg-white text-slate-900",
    tabInactive: dark ? "text-zinc-500 hover:text-zinc-300" : "text-slate-500 hover:text-slate-700",
    dropdownBg: dark
      ? "bg-zinc-900 border border-zinc-800"
      : "bg-white border border-slate-200",
    dropdownItem: dark
      ? "text-zinc-300 hover:bg-zinc-800"
      : "text-slate-700 hover:bg-slate-50",
    dashed: dark
      ? "border-dashed border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600"
      : "border-dashed border-slate-300 text-slate-400 hover:text-slate-600 hover:border-slate-400",
    uploadZone: dark
      ? "border-dashed hover:border-zinc-600 cursor-pointer"
      : "border-dashed hover:border-slate-400 cursor-pointer",
    uploadIcon: dark
      ? "bg-zinc-800 group-hover:bg-zinc-700"
      : "bg-slate-100 group-hover:bg-slate-200",
    statsCard: dark
      ? "bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-3"
      : "bg-slate-50 border border-slate-200 rounded-xl px-3 py-3",
    bottomNav: dark
      ? "bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800/60"
      : "bg-white/90 backdrop-blur-md border-t border-slate-200",
    activeNavItem: dark ? "text-green-400" : "text-green-600",
    inactiveNavItem: dark ? "text-zinc-600" : "text-slate-400",
  };
}

// ── Primitives ─────────────────────────────────────────────────────────────
function Badge({ color = "green", children }) {
  const map = {
    green: "text-green-600 bg-green-50 border border-green-200 dark:text-green-400 dark:bg-green-400/10 dark:border-green-400/20",
    blue: "text-blue-600 bg-blue-50 border border-blue-200",
    purple: "text-purple-600 bg-purple-50 border border-purple-200",
    yellow: "text-yellow-600 bg-yellow-50 border border-yellow-200",
    gray: "text-slate-500 bg-slate-100 border border-slate-200",
    red: "text-red-600 bg-red-50 border border-red-200",
  };
  const darkMap = {
    green: "text-green-400 bg-green-400/10 border-green-400/20",
    blue: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    purple: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    yellow: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    gray: "text-zinc-400 bg-zinc-800 border-zinc-700",
    red: "text-red-400 bg-red-400/10 border-red-400/20",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${map[color]}`}
      data-dark-class={darkMap[color]}
    >
      {children}
    </span>
  );
}

function ThemeAwareBadge({ color = "green", dark, children }) {
  const light = {
    green: "text-green-600 bg-green-50 border-green-200",
    blue: "text-blue-600 bg-blue-50 border-blue-200",
    purple: "text-purple-600 bg-purple-50 border-purple-200",
    yellow: "text-amber-600 bg-amber-50 border-amber-200",
    gray: "text-slate-500 bg-slate-100 border-slate-200",
    red: "text-red-600 bg-red-50 border-red-200",
  };
  const darkMap = {
    green: "text-green-400 bg-green-400/10 border-green-400/20",
    blue: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    purple: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    yellow: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    gray: "text-zinc-400 bg-zinc-800 border-zinc-700",
    red: "text-red-400 bg-red-400/10 border-red-400/20",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${dark ? darkMap[color] : light[color]}`}>
      {children}
    </span>
  );
}

function Toggle({ value, onChange, dark }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${value ? "bg-green-500" : dark ? "bg-zinc-700" : "bg-slate-300"}`}
    >
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${value ? "left-5" : "left-1"}`} />
    </button>
  );
}

function Btn({ onClick, disabled, variant = "primary", children, className = "", dark }) {
  const base = "flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-40";
  const variants = {
    primary: "bg-green-500 hover:bg-green-400 text-black",
    secondary: dark
      ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
      : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200",
    ghost: dark
      ? "text-zinc-400 hover:text-white hover:bg-zinc-800"
      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
    danger: dark
      ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
      : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

function SaveBtn({ saved, onClick, dark }) {
  return (
    <Btn onClick={onClick} variant={saved ? "secondary" : "primary"} dark={dark}>
      {saved ? <><CheckCircle2 size={14} /> Salvo</> : <><Save size={14} /> Salvar</>}
    </Btn>
  );
}

function Modal({ children, onClose, dark }) {
  const t = tokens(dark);
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0 pointer-events-none">
        <div className={`${t.card} w-full max-w-md pointer-events-auto`}>
          {children}
        </div>
      </div>
    </>
  );
}

function ModalHeader({ title, sub, onClose, dark }) {
  const t = tokens(dark);
  return (
    <div className={`flex items-start justify-between p-5 border-b ${t.border}`}>
      <div>
        <h2 className={`text-sm font-semibold ${t.text}`}>{title}</h2>
        {sub && <p className={`text-xs ${t.subtext} mt-0.5`}>{sub}</p>}
      </div>
      <button onClick={onClose} className={`${t.muted} hover:${t.text} transition p-1 rounded-lg ${t.surfaceHover}`}>
        <X size={15} />
      </button>
    </div>
  );
}

function ConfirmModal({ title, description, confirmLabel = "Confirmar", onConfirm, onClose, dark }) {
  const t = tokens(dark);
  return (
    <Modal onClose={onClose} dark={dark}>
      <ModalHeader title={title} onClose={onClose} dark={dark} />
      <div className="p-5 space-y-4">
        <p className={`text-sm ${t.subtext}`}>{description}</p>
        <div className="flex gap-2">
          <Btn variant="secondary" onClick={onClose} className="flex-1" dark={dark}>Cancelar</Btn>
          <Btn variant="danger" onClick={() => { onConfirm(); onClose(); }} className="flex-1" dark={dark}>{confirmLabel}</Btn>
        </div>
      </div>
    </Modal>
  );
}

// ── Theme Toggle Button ─────────────────────────────────────────────────────
function ThemeToggle({ dark, toggle }) {
  return (
    <button
      onClick={toggle}
      className={`relative w-14 h-7 rounded-full transition-all duration-300 flex items-center px-1 ${
        dark ? "bg-zinc-800 border border-zinc-700" : "bg-slate-200 border border-slate-300"
      }`}
    >
      <div className={`absolute w-5 h-5 rounded-full shadow transition-all duration-300 flex items-center justify-center ${
        dark
          ? "left-7 bg-zinc-950"
          : "left-1 bg-white"
      }`}>
        {dark
          ? <Moon size={11} className="text-blue-400" />
          : <Sun size={11} className="text-amber-500" />
        }
      </div>
      <Sun size={10} className={`ml-0.5 transition ${dark ? "text-zinc-600" : "text-amber-400"}`} />
      <Moon size={10} className={`ml-auto mr-0.5 transition ${dark ? "text-blue-400" : "text-slate-400"}`} />
    </button>
  );
}

// ── Navigation ─────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "training", label: "Treinar", icon: BookOpen },
  { id: "settings", label: "Config.", icon: Settings },
];

function TopBar({ active, onNav, dark, toggleTheme, userInitials }) {
  const t = tokens(dark);
  return (
    <div className="hidden lg:block sticky top-0 z-20">
      <header className={`${t.navBg} flex items-center justify-between px-6 py-3`}>
        <div className="flex items-center gap-2.5">
          <img src="/logo1.png" className="w-7" />
          <span className={`text-lg font-semibold ${t.text}`}>ZELT.AI</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle dark={dark} toggle={toggleTheme} />
          <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center text-xs font-bold text-white">{userInitials}</div>
        </div>
      </header>
      <div className={`${t.subnav} px-6 py-0 flex items-center gap-0`}>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNav(id)}
            className={`relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors ${
              active === id ? t.text : `${t.subtext} ${dark ? "hover:text-zinc-300" : "hover:text-slate-700"}`
            }`}
          >
            <Icon size={14} />
            {label}
            {active === id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 rounded-full" />}
          </button>
        ))}
      </div>
    </div>
  );
}

function BottomBar({ active, onNav, dark, toggleTheme }) {
  const t = tokens(dark);
  return (
    <nav className={`lg:hidden fixed bottom-0 inset-x-0 z-20 ${t.bottomNav} flex`}>
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onNav(id)}
          className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition ${
            active === id ? t.activeNavItem : t.inactiveNavItem
          }`}
        >
          <Icon size={20} />
          {label}
        </button>
      ))}
      <button
        onClick={toggleTheme}
        className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition ${t.inactiveNavItem}`}
      >
        {dark ? <Sun size={20} /> : <Moon size={20} />}
        {dark ? "Claro" : "Escuro"}
      </button>
    </nav>
  );
}

// ── Quick Answer Modal ─────────────────────────────────────────────────────
function QuickAnswerModal({ onClose, dark, onSave, edit }) {
  const t = tokens(dark);
  const [qa, setQa] = useState(edit || { question: "", answer: "", category: "" });
  const set = (k, v) => setQa((p) => ({ ...p, [k]: v }));
  return (
    <Modal onClose={onClose} dark={dark}>
      <ModalHeader title={edit ? "Editar Resposta Rápida" : "Nova Resposta Rápida"} onClose={onClose} dark={dark} />
      <div className="p-5 space-y-4">
        <div className="space-y-1.5">
          <label className={`text-xs ${t.subtext}`}>Pergunta / Gatilho</label>
          <input value={qa.question} onChange={(e) => set("question", e.target.value)} placeholder="Ex: Qual o horário de funcionamento?" className={t.inp} />
        </div>
        <div className="space-y-1.5">
          <label className={`text-xs ${t.subtext}`}>Resposta</label>
          <textarea value={qa.answer} onChange={(e) => set("answer", e.target.value)} rows={4} placeholder="Digite a resposta..." className={`${t.inp} resize-none`} />
        </div>
        <div className="space-y-1.5">
          <label className={`text-xs ${t.subtext}`}>Categoria</label>
          <input value={qa.category} onChange={(e) => set("category", e.target.value)} placeholder="Ex: Vendas, Suporte, Geral" className={t.inp} />
        </div>
        <Btn onClick={() => { if (qa.question && qa.answer) onSave(qa); }} className="w-full" dark={dark}>
          {edit ? "Salvar" : "Criar Resposta"}
        </Btn>
      </div>
    </Modal>
  );
}

function formatFileSize(size) {
  if (!size || size === "—" || size === "-") return "—";
  const num = Number(size);
  if (isNaN(num)) return String(size);
  if (num === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(num) / Math.log(1024)), units.length - 1);
  return `${(num / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

// ── Doc Viewer Modal ────────────────────────────────────────────────────────
function DocViewer({ doc, onClose, dark, onMarkIndexed }) {
  const t = tokens(dark);
  if (!doc) return null;
  return (
    <Modal onClose={onClose} dark={dark}>
      <ModalHeader title={doc.name} sub="Detalhes do documento" onClose={onClose} dark={dark} />
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            ["Tamanho", formatFileSize(doc.file_size || doc.size)],
            ["Trechos", String(doc.chunks || 0)],
            ["Status", doc.status === "indexed" ? "Indexado" : doc.status === "processing" ? "Processando..." : "Erro"],
            ["Criado em", doc.created_at ? new Date(doc.created_at).toLocaleString("pt-BR") : "-"],
          ].map(([l, v]) => (
            <div key={l} className={t.statsCard}>
              <p className={`text-[11px] ${t.subtext} uppercase tracking-wider`}>{l}</p>
              <p className={`text-sm font-semibold mt-1 ${t.text}`}>{v}</p>
            </div>
          ))}
        </div>
        <div className={`flex gap-2 ${t.statsCard} p-3`}>
          <div className={`w-2 h-2 rounded-full mt-1 ${doc.status === "indexed" ? "bg-green-400" : doc.status === "processing" ? "bg-yellow-400 animate-pulse" : "bg-red-400"}`} />
          <div className="flex-1">
            <p className={`text-xs ${t.subtext}`}>
              {doc.status === "indexed"
                ? "Documento processado e pronto para uso."
                : doc.status === "processing"
                ? "O documento está sendo processado. O status será atualizado automaticamente."
                : "Ocorreu um erro ao processar este documento."}
            </p>
            {doc.status === "processing" && onMarkIndexed && (
              <button onClick={onMarkIndexed} className={`mt-2 text-xs text-green-500 hover:text-green-400 font-medium transition`}>
                Marcar como indexado (manual)
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════════════
// TRAINING PAGE
// ══════════════════════════════════════════════════════════════════════
function Training({ dark }) {
  const t = tokens(dark);
  const [tab, setTab] = useState("knowledge");
  const [prompt, setPrompt] = useState("");
  const [promptLoading, setPromptLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [urlInput, setUrlInput] = useState("");
  const menuRef = useRef(null);

  const [docs, setDocs] = useState([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [urls, setUrls] = useState(() => {
    try { return JSON.parse(localStorage.getItem("zelt_urls") || "[]"); } catch { return []; }
  });
  const [urlsLoading, setUrlsLoading] = useState(true);
  const [docViewer, setDocViewer] = useState(null);

  const [quickAnswers, setQuickAnswers] = useState([]);
  const [qaLoading, setQaLoading] = useState(true);

  useEffect(() => {
    getPrompt().then((d) => setPrompt(d.content || "")).catch(() => {}).finally(() => setPromptLoading(false));
    listDocuments().then(setDocs).catch(() => {}).finally(() => setDocsLoading(false));
    listQuickAnswers().then(setQuickAnswers).catch(() => {}).finally(() => setQaLoading(false));
    listUrls().then(setUrls).catch(() => {}).finally(() => setUrlsLoading(false));
  }, []);

  useEffect(() => { try { localStorage.setItem("zelt_urls", JSON.stringify(urls)); } catch {} }, [urls]);

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setActiveMenu(null); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  async function refreshDocs() {
    try { setDocs(await listDocuments()); } catch {}
  }

  useEffect(() => {
    const hasProcessing = docs.some((x) => x.status === "processing");
    if (!hasProcessing) return;
    const id = setInterval(refreshDocs, 3000);
    return () => clearInterval(id);
  }, [docs]);

  async function save() {
    try { await savePrompt(prompt); } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function removeDoc(id) {
    deleteDocument(id).then(() => setDocs((d) => d.filter((x) => x.id !== id))).catch(() => {});
  }

  function markIndexed(id) {
    const now = new Date().toISOString();
    setDocs((d) => d.map((x) => x.id === id ? { ...x, status: "indexed", chunks: x.chunks || 12, created_at: x.created_at || now } : x));
  }

  function removeQuickAnswer(id) {
    deleteQuickAnswer(id).then(() => setQuickAnswers((qs) => qs.filter((x) => x.id !== id))).catch(() => {});
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try { const doc = await uploadDocument(file); setDocs((d) => [...d, doc]); } catch {}
    e.target.value = "";
  }

  async function handleAddUrl() {
    if (!urlInput) return;
    try { const u = await addUrl(urlInput); setUrls((prev) => [...prev, u]); setUrlInput(""); } catch {}
  }

  const TABS = [
    { id: "knowledge", label: "Arquivos", icon: BookOpen },
    { id: "prompt", label: "Personalidade", icon: MessageSquare },
    { id: "quickAnswers", label: "Respostas Rápidas", icon: MessageCircle },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-5 px-4 lg:px-0">
      {modal && (modal === "quickAnswer" || modal?.type === "quickAnswer") && (
        <QuickAnswerModal
          onClose={() => setModal(null)}
          dark={dark}
          onSave={async (data) => {
            const editData = modal?.data || null;
            try {
              if (editData) {
                const updated = await updateQuickAnswer(editData.id, data);
                setQuickAnswers((qs) => qs.map((q) => (q.id === updated.id ? updated : q)));
              } else {
                const created = await createQuickAnswer(data);
                setQuickAnswers((qs) => [...qs, created]);
              }
            } catch {}
            setModal(null);
          }}
          edit={modal?.data || null}
        />
      )}
      {docViewer && <DocViewer doc={docViewer} onClose={() => setDocViewer(null)} dark={dark} onMarkIndexed={() => { markIndexed(docViewer.id); setDocViewer((prev) => prev ? { ...prev, status: "indexed" } : null); }} />}
      {confirm && <ConfirmModal {...confirm} onClose={() => setConfirm(null)} dark={dark} />}

      {/* Hero card */}
      <div className={`${t.card} p-5`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <Bot size={18} className="text-green-500" />
            </div>
            <div>
              <p className={`text-sm font-semibold ${t.text}`}>Assistente de Vendas</p>
              <p className={`text-xs ${t.subtext} mt-0.5`}>Configure como seu robô vai responder</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-500 font-medium">Ativo</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 p-1 ${t.tabBar}`}>
        {TABS.map((tab_item) => {
          const Icon = tab_item.icon;
          return (
            <button
              key={tab_item.id}
              onClick={() => setTab(tab_item.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium rounded-xl transition ${
                tab === tab_item.id ? t.tabActive : t.tabInactive
              }`}
            >
              <Icon size={13} />
              <span className="hidden sm:inline">{tab_item.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Knowledge ── */}
      {tab === "knowledge" && (
        <div className="space-y-3">
          <label className={`${t.card} p-8 ${t.uploadZone} flex flex-col items-center gap-3 text-center group transition-all`}>
            <input type="file" className="hidden" accept=".pdf,.docx,.txt,.csv,.xlsx" onChange={handleUpload} />
            <div className={`w-12 h-12 rounded-2xl ${t.uploadIcon} transition flex items-center justify-center`}>
              <Upload size={20} className={t.subtext} />
            </div>
            <div>
              <p className={`text-sm font-medium ${dark ? "text-zinc-300 group-hover:text-white" : "text-slate-600 group-hover:text-slate-900"} transition`}>
                Envie seus documentos
              </p>
              <p className={`text-xs ${t.muted} mt-1`}>PDF, DOCX, TXT, CSV, XLSX · até 10 MB cada</p>
            </div>
            <span className={`px-4 py-1.5 rounded-xl ${t.surface} text-xs ${t.subtext} ${t.surfaceHover} transition`}>
              Selecionar arquivos
            </span>
          </label>

          <div className={`${t.card} p-4`}>
            <div className="flex items-center gap-2 mb-3">
              <Link2 size={13} className={t.subtext} />
              <p className={`text-xs font-medium ${t.subtext}`}>Indexar uma URL</p>
            </div>
            <div className="flex gap-2">
              <input className={`${t.inp} flex-1`} placeholder="https://suaempresa.com/faq" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} />
              <Btn variant="secondary" onClick={handleAddUrl} dark={dark}>Adicionar</Btn>
            </div>
            {urls.length > 0 && (
              <div className={`mt-3 space-y-1.5`}>
                {urls.map((u) => (
                  <div key={u.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${t.surface}`}>
                    <Link2 size={11} className={t.subtext} />
                    <span className={`text-xs flex-1 truncate ${t.text}`}>{u.url}</span>
                    <span className={`text-[11px] font-medium ${u.status === "indexed" ? "text-green-500" : u.status === "error" ? "text-red-500" : "text-yellow-500"}`}>
                      {u.status === "indexed" ? "Indexado" : u.status === "error" ? "Erro" : "Pendente"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {docs.length > 0 && (
            <div className={`${t.card} overflow-hidden`}>
              <div className={`px-4 py-3 border-b ${t.border} flex items-center justify-between`}>
                <p className={`text-xs font-medium ${t.subtext}`}>Documentos ({docs.length})</p>
                <button onClick={refreshDocs} className={`${t.muted} hover:${t.text} transition p-1 rounded-lg ${t.surfaceHover}`} title="Atualizar">
                  <RefreshCw size={12} />
                </button>
              </div>
              <div className={`divide-y ${dark ? "divide-zinc-800/60" : "divide-slate-100"}`}>
                {docs.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 px-4 py-3.5">
                    <div className={`w-8 h-8 rounded-lg ${t.surface} flex items-center justify-center flex-shrink-0`}>
                      <FileText size={13} className={t.subtext} />
                    </div>
                    <button className="flex-1 min-w-0 text-left" onClick={() => setDocViewer(doc)}>
                      <p className={`text-sm ${t.text} truncate`}>{doc.name}</p>
                      <p className={`text-xs ${t.subtext} mt-0.5`}>{formatFileSize(doc.file_size || doc.size)} · {doc.chunks || 0} trechos</p>
                    </button>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => setDocViewer(doc)} className={`${t.muted} hover:${t.text} transition p-1.5 rounded-lg ${t.surfaceHover}`} title="Visualizar">
                        <Eye size={13} />
                      </button>
                      <ThemeAwareBadge color={doc.status === "indexed" ? "green" : doc.status === "error" ? "red" : "yellow"} dark={dark}>
                        {doc.status === "indexed" ? "Indexado" : doc.status === "error" ? "Erro" : "Processando..."}
                      </ThemeAwareBadge>
                      {doc.status === "processing" && (
                        <button onClick={() => markIndexed(doc.id)} className={`text-zinc-500 hover:text-green-400 transition p-1.5 rounded-lg ${t.surfaceHover}`} title="Marcar como indexado (manual)">
                          <CheckCircle2 size={13} />
                        </button>
                      )}
                      <button
                        onClick={() => setConfirm({ title: "Remover documento", description: `"${doc.name}" será removido permanentemente.`, confirmLabel: "Remover", onConfirm: () => removeDoc(doc.id) })}
                        className={`${t.muted} hover:text-red-500 transition p-1.5 rounded-lg ${t.surfaceHover}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {docs.length === 0 && !docsLoading && (
            <div className="text-center py-8">
              <p className={`text-sm ${t.muted}`}>Nenhum documento ainda</p>
              <p className={`text-xs ${t.muted} opacity-60 mt-1`}>Envie arquivos acima para começar</p>
            </div>
          )}
        </div>
      )}

      {/* ── Prompt ── */}
      {tab === "prompt" && (
        <div className="space-y-3">
          <div className={`flex gap-3 px-4 py-3.5 rounded-2xl ${dark ? "bg-blue-500/5 border border-blue-500/20" : "bg-blue-50 border border-blue-200"}`}>
            <Zap size={14} className={`${dark ? "text-blue-400" : "text-blue-500"} flex-shrink-0 mt-0.5`} />
            <div>
              <p className={`text-xs font-medium ${dark ? "text-blue-300" : "text-blue-700"}`}>Como definir a personalidade</p>
              <p className={`text-xs ${dark ? "text-blue-400/70" : "text-blue-600/80"} mt-0.5 leading-relaxed`}>
                Escreva como seu robô deve se comportar: nome, tom de voz, o que pode ou não responder, e quando transferir para humano.
              </p>
            </div>
          </div>

          <div className={`${t.card} p-5 space-y-4`}>
            <div>
              <p className={`text-sm font-semibold ${t.text}`}>Personalidade do Robô</p>
              <p className={`text-xs ${t.subtext} mt-0.5`}>Descreva como ele deve agir com os clientes</p>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={10}
              className={`${t.inp} resize-none leading-relaxed`}
              placeholder="Ex: Você se chama Mari, assistente de vendas..."
            />
            <div className="flex items-center justify-between">
              <p className={`text-xs ${t.muted}`}>{prompt.length} caracteres</p>
              <SaveBtn saved={saved} onClick={save} dark={dark} />
            </div>
          </div>

          <div className={`${t.card} p-4`}>
            <p className={`text-xs font-medium ${t.subtext} mb-3`}>Exemplos rápidos</p>
            <div className="space-y-2">
              {[
                "Seja sempre simpático e use emojis 😊",
                "Nunca informe preços, direcione para a equipe de vendas",
                "Responda sempre em menos de 3 parágrafos",
              ].map((ex) => (
                <button
                  key={ex}
                  onClick={() => setPrompt((p) => p + "\n" + ex)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border ${t.border} text-xs ${t.subtext} ${dark ? "hover:text-zinc-200 hover:border-zinc-700" : "hover:text-slate-800 hover:border-slate-400"} transition flex items-center justify-between group`}
                >
                  <span>{ex}</span>
                  <Plus size={12} className={`${t.muted} group-hover:${dark ? "text-zinc-400" : "text-slate-600"} transition flex-shrink-0 ml-2`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Answers ── */}
      {tab === "quickAnswers" && (
        <div className="space-y-3">
          <div className={`flex gap-3 px-4 py-3.5 rounded-2xl ${dark ? "bg-blue-500/5 border border-blue-500/20" : "bg-blue-50 border border-blue-200"}`}>
            <MessageCircle size={14} className={`${dark ? "text-blue-400" : "text-blue-500"} flex-shrink-0 mt-0.5`} />
            <div>
              <p className={`text-xs font-medium ${dark ? "text-blue-300" : "text-blue-700"}`}>Respostas Rápidas</p>
              <p className={`text-xs ${dark ? "text-blue-400/70" : "text-blue-600/80"} mt-0.5 leading-relaxed`}>
                Respostas pré-definidas que o robô pode usar automaticamente quando identificar a pergunta.
              </p>
            </div>
          </div>

          <div ref={menuRef} className="space-y-2">
            {quickAnswers.map((qa) => (
              <div key={qa.id} className={`${t.card} px-4 py-4 flex items-start gap-4`}>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${t.text} mb-1`}>{qa.question}</p>
                  <p className={`text-xs ${t.subtext} line-clamp-2 mb-2`}>{qa.answer}</p>
                  <Badge color="purple">{qa.category}</Badge>
                </div>
                <div className="flex-shrink-0">
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenu(activeMenu === qa.id ? null : qa.id)}
                      className={`${t.muted} ${dark ? "hover:text-white" : "hover:text-slate-900"} transition p-1.5 rounded-lg ${t.surfaceHover}`}
                    >
                      <MoreVertical size={14} />
                    </button>
                    {activeMenu === qa.id && (
                      <div className={`absolute right-0 top-full mt-1 w-40 ${t.dropdownBg} rounded-xl z-30 py-1 overflow-hidden`}>
                        <button
                          onClick={() => { setModal({ type: "quickAnswer", data: qa }); setActiveMenu(null); }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-xs ${t.dropdownItem} transition`}
                        >
                          <RefreshCw size={12} className={t.subtext} /> Editar
                        </button>
                        <div className={`h-px ${t.divider} my-1`} />
                        <button
                          onClick={() => { setActiveMenu(null); setConfirm({ title: "Remover resposta", description: `"${qa.question}" será excluída permanentemente.`, confirmLabel: "Remover", onConfirm: () => removeQuickAnswer(qa.id) }); }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 ${dark ? "hover:bg-red-500/10" : "hover:bg-red-50"} transition`}
                        >
                          <Trash2 size={12} className="text-red-500" /> Remover
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setModal("quickAnswer")}
            className={`w-full py-4 rounded-2xl border ${t.dashed} transition flex items-center justify-center gap-2 text-sm`}
          >
            <Plus size={14} /> Nova resposta
          </button>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SETTINGS PAGE
// ══════════════════════════════════════════════════════════════════════
function SettingsPage({ dark }) {
  const t = tokens(dark);
  const { logout } = useAuth();
  const [tab, setTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [notifs, setNotifs] = useState({ email: true, push: true, digest: false });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [planType, setPlanType] = useState("");
  const [loading, setLoading] = useState(true);
  const [whatsappData, setWhatsappData] = useState(null);
  const [whatsappLoading, setWhatsappLoading] = useState(true);
  const [whatsappInput, setWhatsappInput] = useState("");
  const [whatsappQr, setWhatsappQr] = useState(null);
  const [whatsappQrLoading, setWhatsappQrLoading] = useState(false);
  const [whatsappQrError, setWhatsappQrError] = useState("");
  const [whatsappProfile, setWhatsappProfile] = useState(null);
  const [whatsappChats, setWhatsappChats] = useState([]);
  const [whatsappStep, setWhatsappStep] = useState(0); // 0=closed, 1=phone input, 2=QR
  const [whatsappManualPhone, setWhatsappManualPhone] = useState("");
  const [billingData, setBillingData] = useState(null);
  const [billingLoading, setBillingLoading] = useState(true);
  const [plansData, setPlansData] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [notifsLoading, setNotifsLoading] = useState(true);

  const initials = name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "??";

  useEffect(() => {
    getMe()
      .then((data) => { setName(data.name || ""); setEmail(data.email || ""); setPlanType(data.plan_type || ""); })
      .catch(() => { try { const c = JSON.parse(localStorage.getItem("zelt_user") || "{}"); setName(c.name || ""); setEmail(c.email || ""); } catch {} })
      .finally(() => setLoading(false));
    getWhatsAppStatus().then(setWhatsappData).catch(() => {}).finally(() => setWhatsappLoading(false));
    getPlans().then((d) => { setBillingData(d.current); setPlansData(d); }).catch(() => {}).finally(() => setBillingLoading(false));
    getPreferences().then(setNotifs).catch(() => {}).finally(() => setNotifsLoading(false));
  }, []);

  async function handleCheckout(planId) {
    if (planId === "trial") return;
    setCheckoutLoading(true);
    try {
      const d = await createCheckout(planId);
      if (d.checkout_url) window.location.href = d.checkout_url;
    } catch {
      alert("Erro ao gerar checkout. Tente novamente.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function save() {
    try { await updateMe({ name, email }); } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleConnectWhatsApp() {
    setWhatsappStep(1);
    setWhatsappManualPhone(whatsappData?.phone_number || whatsappProfile?.phone || "");
    setWhatsappQr(null);
    setWhatsappQrError("");
  }

  async function handleGenerateQr() {
    const clientName = name || "user";
    setWhatsappQrLoading(true);
    setWhatsappQrError("");
    try {
      const res = await connectWhatsApp(clientName, whatsappManualPhone);
      if (res.status === "success" && res.qrcode) {
        setWhatsappStep(2);
        setWhatsappQr(res.qrcode);
      } else {
        setWhatsappQrError(res.details?.message || "Erro ao gerar QR Code. Tente novamente.");
      }
    } catch (e) {
      const msg = e?.response?.data?.detail?.message || e?.response?.data?.detail || "";
      setWhatsappQrError(msg || "Erro ao conectar. Verifique se o servidor Evolution API está rodando.");
    } finally {
      setWhatsappQrLoading(false);
    }
  }

  async function handleDisconnectWhatsApp() {
    try { await disconnectWhatsApp(); } catch {}
    setWhatsappData((p) => p ? { ...p, status: "disconnected" } : p);
    setWhatsappQr(null);
  }

  function applyProfile(d) {
    setWhatsappProfile(d.profile);
    setWhatsappChats(d.chats || []);
    setWhatsappData((prev) => ({ ...(prev || {}), status: d.connected ? "connected" : (prev?.status || "disconnected"), phone_number: d.profile?.phone || "" }));
  }

  const qrStartRef = useRef(null);
  useEffect(() => {
    if (whatsappQr) qrStartRef.current = Date.now();
  }, [whatsappQr]);

  useEffect(() => {
    if (!whatsappQr) return;
    const id = setInterval(async () => {
      try {
        const d = await getWhatsAppProfile();
        if (d.connected) {
          setWhatsappQr(null);
          applyProfile(d);
          return;
        }
        if (qrStartRef.current && Date.now() - qrStartRef.current > 120000) {
          setWhatsappQr(null);
          setWhatsappQrError("Tempo limite excedido. O QR Code expirou. Tente novamente.");
        }
      } catch {}
    }, 2000);
    return () => clearInterval(id);
  }, [whatsappQr]);

  useEffect(() => {
    if (whatsappData?.status === "connected" && !whatsappProfile) {
      getWhatsAppProfile().then(applyProfile).catch(() => {});
    }
    if (whatsappData?.status !== "connected") {
      setWhatsappProfile(null);
      setWhatsappChats([]);
    }
  }, [whatsappData?.status]);

  const TABS = [
    { id: "profile", label: "Perfil", icon: User },
    { id: "whatsapp", label: "WhatsApp", icon: Phone },
    { id: "billing", label: "Plano", icon: CreditCard },
    { id: "notifs", label: "Alertas", icon: Bell },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-5 px-4 lg:px-0">
      {confirm && <ConfirmModal {...confirm} onClose={() => setConfirm(null)} dark={dark} />}

      <div className="pt-1">
        <h1 className={`text-base font-semibold ${t.text}`}>Configurações</h1>
        <p className={`text-xs ${t.subtext} mt-0.5`}>Gerencie sua conta e integrações</p>
      </div>

      <div className={`flex gap-1 overflow-x-auto scrollbar-none p-1 ${t.tabBar}`}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition flex-shrink-0 ${
              tab === id ? t.tabActive : t.tabInactive
            }`}
          >
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>

      {/* ── Profile ── */}
      {tab === "profile" && (
        <div className={`${t.card} p-5 space-y-5`}>
          {loading ? (
            <div className="flex items-center gap-4 animate-pulse">
              <div className={`w-12 h-12 rounded-2xl ${dark ? "bg-zinc-700" : "bg-slate-200"}`} />
              <div className="space-y-2 flex-1">
                <div className={`h-4 ${dark ? "bg-zinc-700" : "bg-slate-200"} rounded w-1/3`} />
                <div className={`h-3 ${dark ? "bg-zinc-700" : "bg-slate-200"} rounded w-1/2`} />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">{initials}</div>
              <div>
                <p className={`text-sm font-semibold ${t.text}`}>{name}</p>
                <p className={`text-xs ${t.subtext}`}>{email}</p>
                <div className="mt-1.5">
                  <ThemeAwareBadge color="purple" dark={dark}>{planType ? `Plano ${planType.charAt(0).toUpperCase() + planType.slice(1)}` : "Plano Trial"}</ThemeAwareBadge>
                </div>
              </div>
            </div>
          )}
          <div className={`h-px ${t.divider}`} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={`text-xs ${t.subtext}`}>Nome</label>
              <input className={t.inp} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className={`text-xs ${t.subtext}`}>Email</label>
              <input className={t.inp} value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setConfirm({ title: "Sair da conta", description: "Você será desconectado desta sessão.", confirmLabel: "Sair", onConfirm: () => { logout(); window.location.href = '/login'; } })}
              className={`flex items-center gap-1.5 text-xs ${t.subtext} hover:text-red-500 transition`}
            >
              <LogOut size={12} /> Sair da conta
            </button>
            <SaveBtn saved={saved} onClick={save} dark={dark} />
          </div>
        </div>
      )}

      {/* ── WhatsApp ── */}
      {tab === "whatsapp" && (
        <div className="space-y-3">
          {whatsappLoading ? (
            <div className={`${t.card} p-5 animate-pulse space-y-3`}>
              <div className={`h-4 ${dark ? "bg-zinc-700" : "bg-slate-200"} rounded w-1/3`} />
              <div className={`h-3 ${dark ? "bg-zinc-700" : "bg-slate-200"} rounded w-1/4`} />
            </div>
          ) : whatsappData?.status === "connected" ? (
            <>
              <div className={`${t.card} p-5`}>
                <div className="flex items-center gap-4 mb-5">
                  {whatsappProfile?.profilePicUrl ? (
                    <img src={whatsappProfile.profilePicUrl} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500" onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
                  ) : null}
                  <div className={`w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 ${whatsappProfile?.profilePicUrl ? "hidden" : ""}`}>
                    <Phone size={20} className="text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <p className={`text-base font-semibold ${t.text}`}>{whatsappProfile?.name || whatsappData?.phone_number || "WhatsApp"}</p>
                    <p className={`text-sm ${t.subtext} mt-0.5`}>{whatsappProfile?.phone || whatsappData?.phone_number || ""}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className={`text-xs ${t.subtext}`}>Conectado</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["Status do Agente", whatsappData?.agent_status || "Ativo"],
                    ["Inteligência", whatsappData?.intelligence_version || "Zelt v1.0"],
                    ["Conexão API", "Estável"],
                    ["Modo de Operação", whatsappData?.operation_mode || "Atendimento"],
                  ].map(([l, v]) => (
                    <div key={l} className={t.statsCard}>
                      <p className={`text-xs ${t.subtext} font-medium uppercase tracking-wider`}>{l}</p>
                      <p className={`text-sm font-semibold mt-1 ${v === "Ativo" || v === "Estável" ? "text-emerald-500" : t.text}`}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              {whatsappChats.length > 0 && (
                <div className={`${t.card} overflow-hidden`}>
                  <div className={`px-4 py-3 border-b ${t.border}`}>
                    <p className={`text-xs font-medium ${t.subtext}`}>Conversas recentes</p>
                  </div>
                  <div className={`divide-y ${dark ? "divide-zinc-800/60" : "divide-slate-100"}`}>
                    {whatsappChats.map((chat) => (
                      <div key={chat.id} className="flex items-center gap-3 px-4 py-3">
                        {chat.profilePicUrl ? (
                          <img src={chat.profilePicUrl} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
                        ) : null}
                        <div className={`w-9 h-9 rounded-full ${t.surface} flex items-center justify-center flex-shrink-0 ${chat.profilePicUrl ? "hidden" : ""}`}>
                          <MessageCircle size={14} className={t.subtext} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-sm font-medium ${t.text} truncate`}>{chat.name || chat.id?.split("@")[0] || "Desconhecido"}</p>
                            {chat.timestamp > 0 && (
                              <p className={`text-[10px] ${t.muted} flex-shrink-0`}>
                                {new Date(chat.timestamp * 1000).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                              </p>
                            )}
                          </div>
                          <p className={`text-xs ${t.subtext} truncate mt-0.5`}>{chat.lastMessage || "—"}</p>
                        </div>
                        {chat.unread > 0 && (
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500 text-[10px] font-bold text-black flex items-center justify-center">{chat.unread}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {whatsappChats.length === 0 && (
                <div className={`${t.card} p-5 text-center`}>
                  <p className={`text-sm ${t.muted}`}>Nenhuma conversa encontrada</p>
                  <p className={`text-xs ${t.muted} opacity-60 mt-1`}>As conversas aparecerão aqui após receber mensagens</p>
                </div>
              )}

              <div className={`${t.card} p-5 space-y-3`}>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Phone size={12} className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.muted}`} />
                    <input className={`${t.inp} pl-8`} placeholder="+55 11 9 0000-0000" value={whatsappInput} onChange={(e) => setWhatsappInput(e.target.value)} />
                  </div>
                  <Btn variant="secondary" onClick={async () => { try { const d = await verifyWhatsApp(whatsappInput); setWhatsappData(d); } catch {} setWhatsappInput(""); }} dark={dark}>Vincular</Btn>
                </div>
                <div className={`h-px ${t.divider}`} />
                <button onClick={() => setConfirm({ title: "Desconectar WhatsApp", description: "O número será desconectado e o atendimento será interrompido.", confirmLabel: "Desconectar", onConfirm: handleDisconnectWhatsApp })} className={`w-full flex items-center justify-center gap-1.5 text-xs ${t.subtext} hover:text-red-500 transition py-2`}>
                  <Trash2 size={12} /> Desconectar WhatsApp
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={`${t.card} p-8 text-center`}>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <Phone size={24} className="text-emerald-500" />
                </div>
                <p className={`text-base font-semibold ${t.text}`}>Conectar WhatsApp</p>
                <p className={`text-sm ${t.subtext} mt-1.5 max-w-sm mx-auto leading-relaxed`}>
                  Conecte seu número para que o robô possa atender clientes automaticamente pelo WhatsApp.
                </p>
                <button
                  onClick={handleConnectWhatsApp}
                  disabled={whatsappQrLoading}
                  className={`mt-6 px-8 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition flex items-center justify-center gap-2 mx-auto disabled:opacity-50 ${whatsappQrLoading ? "cursor-wait" : "cursor-pointer"}`}
                >
                  {whatsappQrLoading ? (
                    <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Gerando QR Code...</>
                  ) : (
                    <><Phone size={15} /> Conectar WhatsApp</>
                  )}
                </button>
                {whatsappQrError && (
                  <p className="text-xs text-red-500 mt-3">{whatsappQrError}</p>
                )}
              </div>
              <div className={`${t.card} p-5`}>
                <p className={`text-sm font-semibold ${t.text} mb-3`}>Vincular número manualmente</p>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Phone size={12} className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.muted}`} />
                    <input className={`${t.inp} pl-8`} placeholder="+55 11 9 0000-0000" value={whatsappInput} onChange={(e) => setWhatsappInput(e.target.value)} />
                  </div>
                  <Btn variant="secondary" onClick={async () => { try { const d = await verifyWhatsApp(whatsappInput); setWhatsappData(d); } catch {} setWhatsappInput(""); }} dark={dark}>Vincular</Btn>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* WhatsApp Connect Modal */}
      {whatsappData?.status !== "connected" && (whatsappStep > 0 || whatsappQr || whatsappQrLoading) && (
        <Modal onClose={() => { setWhatsappQr(null); setWhatsappQrLoading(false); setWhatsappQrError(""); setWhatsappStep(0); }} dark={dark}>
          <ModalHeader
            title={whatsappStep === 1 ? "Conectar WhatsApp" : "Escaneie o QR Code"}
            sub={whatsappStep === 1 ? "Digite seu número de WhatsApp" : "Aponte a câmera do seu celular para o QR Code"}
            onClose={() => { setWhatsappQr(null); setWhatsappQrLoading(false); setWhatsappQrError(""); setWhatsappStep(0); }}
            dark={dark}
          />
          <div className="p-5 space-y-4">
            {whatsappStep === 1 && (
              <>
                <div className="space-y-3">
                  <div className="relative">
                    <Phone size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.muted}`} />
                    <input
                      className={`${t.inp} pl-9 text-sm`}
                      placeholder="+55 11 99999-9999"
                      value={whatsappManualPhone}
                      onChange={(e) => setWhatsappManualPhone(e.target.value)}
                    />
                  </div>
                  <p className={`text-xs ${t.subtext} text-center`}>
                    Este número será salvo para identificar sua conexão.
                  </p>
                </div>
                <button
                  onClick={handleGenerateQr}
                  className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition flex items-center justify-center gap-2"
                >
                  <QrCode size={16} /> Gerar QR Code
                </button>
              </>
            )}
            {whatsappStep === 2 && (whatsappQrLoading ? (
              <div className="py-8 text-center">
                <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto" />
                <p className={`text-xs ${t.subtext} mt-4`}>Gerando QR Code...</p>
              </div>
            ) : whatsappQrError ? (
              <div className="py-8 text-center space-y-4">
                <p className="text-sm text-red-500">{whatsappQrError}</p>
                <button onClick={handleGenerateQr} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-medium rounded-xl text-sm transition">
                  Tentar novamente
                </button>
                <div>
                  <button onClick={() => setWhatsappStep(1)} className={`text-xs ${t.subtext} hover:underline`}>
                    Voltar e corrigir o número
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="w-56 h-56 mx-auto rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                  <img
                    src={whatsappQr.startsWith("data:") ? whatsappQr : `data:image/png;base64,${whatsappQr}`}
                    alt="QR Code WhatsApp"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className={`text-xs ${t.subtext} text-center leading-relaxed`}>
                  Abra o WhatsApp no seu celular, vá em <strong>Menu › WhatsApp Web</strong> e aponte a câmera para o QR Code.
                </p>
                <div className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl ${t.surface}`}>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className={`text-xs ${t.subtext}`}>Aguardando escaneamento...</p>
                </div>
              </>
            ))}
          </div>
        </Modal>
      )}

      {/* ── Billing ── */}
      {tab === "billing" && (
        <div className="space-y-3">
          {billingLoading ? (
            <div className={`${t.card} p-5 animate-pulse space-y-3`}>
              <div className={`h-4 ${dark ? "bg-zinc-700" : "bg-slate-200"} rounded w-1/3`} />
              <div className={`h-3 ${dark ? "bg-zinc-700" : "bg-slate-200"} rounded w-1/2`} />
            </div>
          ) : (
            <>
              {/* Current plan card */}
              <div className={`${t.card} p-5`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className={`text-sm font-semibold ${t.text}`}>
                      Plano {billingData?.plan_type ? billingData.plan_type.charAt(0).toUpperCase() + billingData.plan_type.slice(1) : "Trial"}
                    </p>
                    <p className={`text-xs ${t.subtext} mt-0.5`}>
                      {billingData?.plan_type === "trial"
                        ? "Período de teste gratuito"
                        : billingData?.renews_at
                          ? `Renova em ${new Date(billingData.renews_at).toLocaleDateString("pt-BR")}`
                          : billingData?.status === "active"
                            ? "Assinatura ativa"
                            : "Sem assinatura ativa"}
                    </p>
                  </div>
                  <ThemeAwareBadge
                    color={billingData?.status === "active" ? "purple" : billingData?.status === "cancelled" ? "gray" : "amber"}
                    dark={dark}
                  >
                    {billingData?.status === "active" ? "Ativo"
                      : billingData?.status === "cancelled" ? "Cancelado"
                      : billingData?.plan_type === "trial" ? "Teste"
                      : "Expirado"}
                  </ThemeAwareBadge>
                </div>
                <div className="space-y-3">
                  {[
                    ["Agentes de IA", `${billingData?.agents_limit || 0}`],
                    ["Execuções/mês", billingData?.executions_limit ? `${Number(billingData.executions_limit).toLocaleString()}` : "0"],
                    ["Armazenamento", `${billingData?.storage_limit_gb || 0} GB`],
                    ["Preço mensal", billingData?.price ? `R$ ${Number(billingData.price).toFixed(2)}` : "Grátis"],
                  ].map(([l, v]) => (
                    <div key={l} className="flex items-center justify-between">
                      <span className={`text-xs ${t.subtext}`}>{l}</span>
                      <span className={`text-xs font-medium ${t.text}`}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plan comparison cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(plansData?.plans || []).map((plan) => {
                  const isCurrent = plan.nome === billingData?.plan_type;
                  const isTrial = plan.nome === "trial";
                  return (
                    <div key={plan.id} className={`${t.card} p-5 flex flex-col ${isCurrent ? `ring-2 ring-emerald-500` : ''}`}>
                      <div className="flex items-center justify-between mb-3">
                        <p className={`text-sm font-semibold ${t.text}`}>{plan.nome ? plan.nome.charAt(0).toUpperCase() + plan.nome.slice(1) : "Plano"}</p>
                        {isCurrent && (
                          <span className="text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Atual</span>
                        )}
                      </div>
                      <div className="mb-3">
                        {Number(plan.preco) > 0 ? (
                          <p className={`text-lg font-bold ${t.text}`}>R$ {Number(plan.preco).toFixed(2)}<span className={`text-xs font-normal ${t.subtext}`}>/mês</span></p>
                        ) : (
                          <p className={`text-lg font-bold ${t.text}`}>Grátis</p>
                        )}
                      </div>
                      <ul className="space-y-1.5 flex-1 mb-4">
                        {[
                          `Até ${plan.limite_instancias} ${plan.limite_instancias === 1 ? 'instância' : 'instâncias'}`,
                          `Até ${plan.limite_mensagens >= 999999 ? 'ilimitadas' : plan.limite_mensagens.toLocaleString()} mensagens/mês`,
                          `Até ${plan.limite_usuarios} ${plan.limite_usuarios === 1 ? 'usuário' : 'usuários'}`,
                        ].map((f, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                            <span className={`text-xs ${t.subtext}`}>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => handleCheckout(plan.nome)}
                        disabled={isCurrent || checkoutLoading || isTrial || plan.nome !== "basic"}
                        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2
                          ${isCurrent
                            ? `${t.surface} ${t.subtext} cursor-default`
                            : plan.nome === "basic"
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-black disabled:opacity-50'
                              : `${t.surface} ${t.subtext} cursor-default`}`}
                      >
                        {checkoutLoading ? (
                          <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Processando...</>
                        ) : isCurrent ? "Plano atual" : isTrial ? "Gratuito" : plan.nome === "basic" ? "Assinar agora" : "Em breve"}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Cancel subscription */}
              {billingData?.plan_type !== "trial" && billingData?.status === "active" && (
                <button
                  onClick={() => setConfirm({
                    title: "Cancelar assinatura",
                    description: "Sua conta voltará ao plano gratuito ao final do período faturado.",
                    confirmLabel: "Cancelar",
                    onConfirm: () => { cancelBilling().then((d) => setBillingData((p) => p ? { ...p, status: d.status } : p)).catch(() => {}); }
                  })}
                  className={`w-full text-xs ${t.muted} hover:text-red-500 transition text-center py-2`}
                >
                  Cancelar assinatura
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Notifications ── */}
      {tab === "notifs" && (
        <div className={`${t.card} p-5 divide-y ${dark ? "divide-zinc-800" : "divide-slate-100"}`}>
          {notifsLoading ? (
            <div className="animate-pulse space-y-4 py-4">
              {[0, 1, 2].map((i) => <div key={i} className={`h-8 ${dark ? "bg-zinc-700" : "bg-slate-200"} rounded`} />)}
            </div>
          ) : (
            <>
              {[
                { key: "email", label: "E-mail", sub: "Resumos e alertas de sistema" },
                { key: "push", label: "Push", sub: "Alertas em tempo real no navegador" },
                { key: "digest", label: "Relatório semanal", sub: "Resumo de performance toda segunda" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-4 first:pt-0 last:pb-4">
                  <div>
                    <p className={`text-sm font-medium ${t.text}`}>{item.label}</p>
                    <p className={`text-xs ${t.subtext} mt-0.5`}>{item.sub}</p>
                  </div>
                  <Toggle value={notifs[item.key]} onChange={(v) => setNotifs((n) => ({ ...n, [item.key]: v }))} dark={dark} />
                </div>
              ))}
              <div className="pt-4">
                <SaveBtn saved={saved} onClick={async () => { try { await savePreferences(notifs); } catch {} setSaved(true); setTimeout(() => setSaved(false), 2000); }} dark={dark} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// ROOT
// ══════════════════════════════════════════════════════════════════════
export default function App() {
  const [active, setActive] = useState("training");
  const { dark, toggle } = useTheme();
  const t = tokens(dark);

  let userInitials = "??";
  try { const c = JSON.parse(localStorage.getItem("zelt_user") || "{}"); const n = c.name || c.nome || ""; if (n) userInitials = n.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(); } catch {}

  // 1. VALIDAÇÃO DIRETA NO STORAGE (SEM CONTEXTO)
  const token = localStorage.getItem('zelt_token');
  const paginaAtual = window.location.pathname; // Pega exatamente o que tá escrito na barra de endereço

  // 2. SE NÃO TIVER TOKEN E O CARA TENTAR ENTRAR NA DASHBOARD
  if (!token && paginaAtual !== '/login') {
    window.location.href = '/login'; // Chuta pro login de verdade
    return null; // Para o React aqui
  }

  // 3. SE O TOKEN EXISTIR MAS O NAVEGADOR AINDA ESTIVER NA URL DE LOGIN
  if (token && paginaAtual === '/login') {
    window.location.href = '/dashboard'; // Puxa o cara de volta pra cá
    return null;
  }

  // 4. SE ESTIVER TUDO CERTO (Tem token e está na rota certa), RENDERIZA A DASHBOARD
  return (
    <div className={`min-h-screen ${t.bg} ${t.text} transition-colors duration-300`}>
      <TopBar active={active} onNav={setActive} dark={dark} toggleTheme={toggle} userInitials={userInitials} />
      <main className="pt-4 lg:pt-6 pb-28 lg:pb-10">
        {active === "training" && <Training dark={dark} />}
        {active === "settings" && <SettingsPage dark={dark} />}
      </main>
      <BottomBar active={active} onNav={setActive} dark={dark} toggleTheme={toggle} />
    </div>
  );
}
