import { useState, useEffect, useRef } from "react";

// ─── NAVBAR (exata do landing.jsx) ───────────────────────────────────────────
const NAV_LINKS = ["Produto", "Funcionalidades", "Preços", "Integrações"];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-black/80 backdrop-blur-xl border-b border-white/5" : "bg-transparent"}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <img src="/logo1.png" className="w-8" alt="Zelt" />
          <span className="text-white font-semibold text-sm">Zelt<span className="text-green-400">.AI</span></span>
        </a>
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((l) => (
            <a key={l} href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">{l}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <a href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">Entrar</a>
          <a href="/register" className="bg-green-500 hover:bg-green-400 text-black font-semibold rounded-xl px-4 py-2 text-sm transition-all hover:shadow-lg hover:shadow-green-500/30 active:scale-95">
            Começar grátis
          </a>
        </div>
      </div>
    </nav>
  );
}

// ─── FOOTER (exata do landing.jsx) ───────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-white/5 py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src="/logo1.png" className="w-8" alt="Zelt" />
          <span className="text-white font-semibold text-sm">Zelt<span className="text-green-400">.AI</span></span>
        </div>
        <p className="text-xs text-zinc-600">
          © 2025 Zelt.AI · Parte do ecossistema{" "}
          <a href="https://urbansoft.vercel.app/" className="hover:text-white cursor-pointer transition-all">UrbanSoft</a>
        </p>
        <div className="flex gap-5">
          {["Termos", "Privacidade", "Contato"].map((l) => (
            <a key={l} href="#" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ─── ANIMATED 3D BACKGROUND ──────────────────────────────────────────────────
function Background3D() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Deep base gradient */}
      <div className="absolute inset-0 bg-[#050509]" />

      {/* Primary radial pulse — hero glow */}
      <div
        className="absolute rounded-full"
        style={{
          top: "5%", left: "50%", transform: "translateX(-50%)",
          width: 900, height: 500,
          background: "radial-gradient(ellipse, rgba(34,197,94,0.13) 0%, transparent 70%)",
          animation: "pulseGlow 8s ease-in-out infinite",
        }}
      />

      {/* Bottom-right accent */}
      <div
        className="absolute rounded-full"
        style={{
          bottom: "-10%", right: "-5%",
          width: 600, height: 600,
          background: "radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 65%)",
          animation: "pulseGlow 12s 3s ease-in-out infinite",
        }}
      />

      {/* Left mid accent */}
      <div
        className="absolute rounded-full"
        style={{
          top: "40%", left: "-8%",
          width: 450, height: 450,
          background: "radial-gradient(circle, rgba(16,163,74,0.06) 0%, transparent 65%)",
          animation: "pulseGlow 10s 1.5s ease-in-out infinite",
        }}
      />

      {/* GRID */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40' width='40' height='40' fill='none' stroke='rgb(255 255 255)'%3e%3cpath d='M0 .5H40V40'/%3e%3c/svg%3e")`,
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
        }}
      />

      {/* FLOATING 3D ORBS */}
      {[
        { size: 180, x: "15%", y: "18%", delay: "0s", dur: "14s", opacity: 0.04 },
        { size: 120, x: "80%", y: "12%", delay: "2s", dur: "10s", opacity: 0.05 },
        { size: 90,  x: "70%", y: "55%", delay: "4s", dur: "16s", opacity: 0.04 },
        { size: 200, x: "5%",  y: "65%", delay: "1s", dur: "18s", opacity: 0.03 },
        { size: 70,  x: "55%", y: "80%", delay: "3s", dur: "12s", opacity: 0.05 },
        { size: 140, x: "90%", y: "75%", delay: "5s", dur: "20s", opacity: 0.03 },
      ].map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size, height: orb.size,
            left: orb.x, top: orb.y,
            background: `radial-gradient(circle at 35% 35%, rgba(34,197,94,${orb.opacity * 4}), rgba(22,163,74,${orb.opacity}) 50%, transparent 70%)`,
            border: "1px solid rgba(34,197,94,0.07)",
            animation: `floatOrb ${orb.dur} ${orb.delay} ease-in-out infinite`,
            backdropFilter: "blur(0px)",
          }}
        />
      ))}

      {/* SCANNING LINE */}
      <div
        style={{
          position: "absolute", left: 0, right: 0, height: 1,
          background: "linear-gradient(to right, transparent, rgba(34,197,94,0.3), transparent)",
          animation: "scanLine 8s linear infinite",
        }}
      />

      {/* CORNER DECORATIONS */}
      <svg className="absolute top-20 right-8 opacity-10" width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="55" stroke="#22c55e" strokeWidth="0.5" strokeDasharray="4 6"/>
        <circle cx="60" cy="60" r="38" stroke="#22c55e" strokeWidth="0.5" strokeDasharray="2 8"/>
        <circle cx="60" cy="60" r="20" stroke="#22c55e" strokeWidth="1" strokeDasharray="1 4"/>
        <circle cx="60" cy="60" r="3" fill="#22c55e" opacity="0.6"/>
      </svg>
      <svg className="absolute bottom-32 left-6 opacity-10" width="80" height="80" viewBox="0 0 80 80" fill="none">
        <rect x="4" y="4" width="72" height="72" rx="8" stroke="#22c55e" strokeWidth="0.5" strokeDasharray="4 4"/>
        <rect x="18" y="18" width="44" height="44" rx="5" stroke="#22c55e" strokeWidth="0.5" strokeDasharray="2 6"/>
      </svg>

      <style>{`
        @keyframes pulseGlow {
          0%,100%{opacity:1;transform:translateX(-50%) scale(1);}
          50%{opacity:.6;transform:translateX(-50%) scale(1.08);}
        }
        @keyframes floatOrb {
          0%,100%{transform:translateY(0px) scale(1);}
          33%{transform:translateY(-22px) scale(1.04);}
          66%{transform:translateY(10px) scale(0.97);}
        }
        @keyframes scanLine {
          0%{top:-2px;opacity:0;}
          10%{opacity:1;}
          90%{opacity:.3;}
          100%{top:100vh;opacity:0;}
        }
        @keyframes fadeSlideUp {
          from{opacity:0;transform:translateY(28px);}
          to{opacity:1;transform:translateY(0);}
        }
        @keyframes shimmerText {
          0%{background-position:0%;}
          100%{background-position:200%;}
        }
        @keyframes rotateSlow {
          from{transform:rotate(0deg);}to{transform:rotate(360deg);}
        }
        @keyframes pingDot {
          0%,100%{opacity:1;transform:scale(1);}
          50%{opacity:.4;transform:scale(1.5);}
        }
      `}</style>
    </div>
  );
}

// ─── TOC DATA ─────────────────────────────────────────────────────────────────
const PART1 = [
  { id: "sec1", num: "01", label: "Definição do Serviço" },
  { id: "sec2", num: "02", label: "Cadastro & Segurança" },
  { id: "sec3", num: "03", label: "Uso Aceitável" },
  { id: "sec4", num: "04", label: "Limitação Técnica" },
  { id: "sec5", num: "05", label: "Planos & Cancelamento" },
];
const PART2 = [
  { id: "sec6", num: "06", label: "Coleta de Dados" },
  { id: "sec7", num: "07", label: "Retenção & Descarte" },
  { id: "sec8", num: "08", label: "Compartilhamento" },
  { id: "sec9", num: "09", label: "Disposições Finais" },
];

// ─── SMALL ATOMS ─────────────────────────────────────────────────────────────
function GreenDot() {
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500/15 border border-green-500/30 flex-shrink-0 mt-1">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
    </span>
  );
}

function SectionTag({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-md">
      {children}
    </span>
  );
}

function Callout({ type = "info", title, children }) {
  const styles = {
    info:   "border-green-500/25 bg-green-500/[0.06]",
    warn:   "border-yellow-500/30 bg-yellow-500/[0.05]",
    danger: "border-red-500/25 bg-red-500/[0.06]",
  };
  const icons = { info: "🔒", warn: "⚠️", danger: "🚨" };
  return (
    <div className={`rounded-2xl border p-5 my-5 ${styles[type]}`}>
      <p className="text-sm font-semibold text-white mb-2">{icons[type]} {title}</p>
      <p className="text-sm text-zinc-400 leading-relaxed">{children}</p>
    </div>
  );
}

function FancyList({ items }) {
  return (
    <ul className="space-y-3 my-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-sm text-zinc-400 leading-relaxed">
          <GreenDot />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SectionHeader({ num, title }) {
  return (
    <div className="flex items-start gap-4 mb-5 pb-4 border-b border-white/5">
      <span className="text-xs font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1.5 rounded-lg tracking-widest flex-shrink-0 mt-0.5">
        {num}
      </span>
      <h3 className="text-lg font-bold text-white leading-snug">{title}</h3>
    </div>
  );
}

function PartHeader({ icon, title, sub, num }) {
  return (
    <div className="relative flex items-center gap-5 p-6 sm:p-7 rounded-2xl border border-white/8 bg-zinc-900/60 backdrop-blur-sm mb-10 overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-green-400 to-transparent rounded-l-2xl" />
      <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="text-sm text-zinc-500 mt-0.5">{sub}</p>
      </div>
      <span className="text-6xl font-black text-white/[0.04] select-none hidden sm:block">{num}</span>
    </div>
  );
}

// ─── HERO ────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-[480px] flex flex-col items-center justify-center text-center px-4 pt-28 pb-16 overflow-hidden">
      {/* Shield SVG — right */}
      <div
        className="absolute right-[6%] top-1/2 -translate-y-1/2 opacity-40 hidden lg:block"
        style={{ animation: "floatOrb 10s ease-in-out infinite" }}
      >
        <svg width="150" height="170" viewBox="0 0 150 170" fill="none">
          <defs>
            <linearGradient id="sg1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity=".7"/>
              <stop offset="100%" stopColor="#16a34a" stopOpacity=".2"/>
            </linearGradient>
          </defs>
          <path d="M75 10L14 36V78C14 112 42 142 75 155C108 142 136 112 136 78V36L75 10Z" fill="url(#sg1)" stroke="#22c55e" strokeWidth="1.2" strokeOpacity=".4"/>
          <path d="M75 28L30 50V78C30 104 50 128 75 140C100 128 120 104 120 78V50L75 28Z" fill="rgba(34,197,94,0.07)" stroke="#22c55e" strokeWidth=".8" strokeOpacity=".2"/>
          <path d="M54 78L68 92L96 64" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="75" cy="78" r="30" stroke="#22c55e" strokeWidth=".5" strokeOpacity=".25" strokeDasharray="4 4"/>
          <circle cx="75" cy="78" r="50" stroke="#22c55e" strokeWidth=".3" strokeOpacity=".12" strokeDasharray="3 7"/>
        </svg>
      </div>

      {/* Doc SVG — left */}
      <div
        className="absolute left-[5%] top-[35%] opacity-30 hidden lg:block"
        style={{ animation: "floatOrb 13s 2s ease-in-out infinite" }}
      >
        <svg width="90" height="110" viewBox="0 0 90 110" fill="none">
          <rect x="8" y="6" width="66" height="88" rx="10" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.3)" strokeWidth="1"/>
          <rect x="18" y="24" width="38" height="3" rx="1.5" fill="rgba(34,197,94,0.55)"/>
          <rect x="18" y="34" width="48" height="2" rx="1" fill="rgba(255,255,255,0.12)"/>
          <rect x="18" y="42" width="42" height="2" rx="1" fill="rgba(255,255,255,0.08)"/>
          <rect x="18" y="50" width="46" height="2" rx="1" fill="rgba(255,255,255,0.08)"/>
          <rect x="18" y="62" width="32" height="3" rx="1.5" fill="rgba(34,197,94,0.4)"/>
          <rect x="18" y="72" width="48" height="2" rx="1" fill="rgba(255,255,255,0.08)"/>
          <rect x="18" y="80" width="38" height="2" rx="1" fill="rgba(255,255,255,0.06)"/>
          <path d="M60 6L74 20" stroke="rgba(34,197,94,0.3)" strokeWidth="1"/>
          <path d="M60 6H74V20H60V6Z" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.2)" strokeWidth="1"/>
        </svg>
      </div>

      {/* Floating rings behind title */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-green-500/5 pointer-events-none" style={{animation:"rotateSlow 40s linear infinite"}}/>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-green-500/8 pointer-events-none" style={{animation:"rotateSlow 25s reverse linear infinite"}}/>

      <div className="relative max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-xs font-medium text-green-400 mb-6"
          style={{animation:"fadeSlideUp .8s ease both"}}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" style={{animation:"pingDot 2s infinite"}}/>
          Documento Legal · Versão 1.0 · Junho 2026
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[.95] tracking-tight mb-5"
          style={{animation:"fadeSlideUp .9s .1s ease both",animationFillMode:"both"}}>
          Transparência é o nosso{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:"linear-gradient(90deg,#22c55e,#86efac,#22c55e)",
              backgroundSize:"200%",
              animation:"shimmerText 4s linear infinite",
            }}
          >
            protocolo
          </span>
        </h1>

        <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed"
          style={{animation:"fadeSlideUp 1s .2s ease both",animationFillMode:"both"}}>
          Tudo que você precisa saber sobre como o Zelt.AI opera, protege seus dados e define os limites da nossa parceria.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
          style={{animation:"fadeSlideUp 1s .35s ease both",animationFillMode:"both"}}>
          {[
            { icon: "🗓️", label: "Última atualização", val: "Junho 2026" },
            { icon: "⚖️", label: "Foro", val: "São Paulo/SP" },
            { icon: "📄", label: "Versão", val: "1.0" },
          ].map((m) => (
            <div key={m.label} className="flex items-center gap-2 text-xs text-zinc-500 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-2.5">
              <span>{m.icon}</span>
              <span className="text-zinc-600">{m.label}:</span>
              <span className="text-zinc-300 font-medium">{m.val}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SIDEBAR TOC ─────────────────────────────────────────────────────────────
function Sidebar({ activeId }) {
  const scroll = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const Item = ({ item }) => (
    <button
      onClick={() => scroll(item.id)}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs transition-all ${
        activeId === item.id
          ? "bg-green-500/10 border border-green-500/20 text-green-400"
          : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04]"
      }`}
    >
      <span className={`text-[10px] font-bold tabular-nums ${activeId === item.id ? "text-green-400" : "text-zinc-600"}`}>
        {item.num}
      </span>
      {item.label}
    </button>
  );
  return (
    <aside className="sticky top-24 h-fit hidden lg:block">
      <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-600 px-3 mb-2">Índice</p>
      <p className="text-[10px] font-semibold tracking-widest uppercase text-green-500 px-3 mb-1.5 mt-4">Parte I · Termos</p>
      <div className="space-y-0.5">
        {PART1.map((i) => <Item key={i.id} item={i} />)}
      </div>
      <p className="text-[10px] font-semibold tracking-widest uppercase text-green-500 px-3 mb-1.5 mt-4">Parte II · Privacidade</p>
      <div className="space-y-0.5">
        {PART2.map((i) => <Item key={i.id} item={i} />)}
      </div>

      <div className="mt-6 p-4 rounded-2xl border border-green-500/20 bg-green-500/[0.06]">
        <p className="text-xs font-semibold text-green-400 mb-1.5">📋 Dúvidas?</p>
        <p className="text-[11px] text-zinc-500 leading-relaxed">Respondemos em até 24h úteis no chat ou por e-mail.</p>
      </div>
    </aside>
  );
}

// ─── SECTIONS ────────────────────────────────────────────────────────────────
function Sec1() {
  return (
    <div id="sec1" className="scroll-mt-24 mb-12">
      <SectionHeader num="01" title="Definição do Serviço e Escopo de Atuação" />

      {/* Architecture diagram */}
      <div className="rounded-2xl border border-white/8 bg-zinc-900/50 backdrop-blur-sm p-6 mb-5 overflow-x-auto">
        <svg width="100%" height="130" viewBox="0 0 580 130" fill="none" preserveAspectRatio="xMidYMid meet">
          <defs>
            <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0 0L6 3L0 6" fill="none" stroke="rgba(34,197,94,0.6)" strokeWidth="1.2"/>
            </marker>
          </defs>
          <rect x="10" y="45" width="120" height="44" rx="10" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
          <text x="70" y="64" fill="rgba(244,244,245,0.85)" fontFamily="sans-serif" fontSize="11" fontWeight="600" textAnchor="middle">Usuário</text>
          <text x="70" y="80" fill="rgba(113,113,122,0.8)" fontFamily="sans-serif" fontSize="10" textAnchor="middle">Seu negócio</text>

          <path d="M132 67L196 67" stroke="rgba(34,197,94,0.5)" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arr)"/>
          <text x="164" y="60" fill="rgba(113,113,122,0.5)" fontFamily="sans-serif" fontSize="9" textAnchor="middle">payload</text>

          <rect x="198" y="28" width="184" height="80" rx="13" fill="rgba(34,197,94,0.07)" stroke="rgba(34,197,94,0.35)" strokeWidth="1.5"/>
          <text x="290" y="58" fill="#22c55e" fontFamily="sans-serif" fontSize="15" fontWeight="700" textAnchor="middle">Zelt.AI</text>
          <text x="290" y="76" fill="rgba(244,244,245,0.5)" fontFamily="sans-serif" fontSize="10" textAnchor="middle">Camada de software</text>
          <text x="290" y="90" fill="rgba(244,244,245,0.35)" fontFamily="sans-serif" fontSize="10" textAnchor="middle">&amp; pipeline técnico</text>

          <path d="M384 67L448 67" stroke="rgba(34,197,94,0.5)" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arr)"/>
          <text x="416" y="60" fill="rgba(113,113,122,0.5)" fontFamily="sans-serif" fontSize="9" textAnchor="middle">roteamento</text>

          <rect x="450" y="45" width="120" height="44" rx="10" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
          <text x="510" y="64" fill="rgba(244,244,245,0.85)" fontFamily="sans-serif" fontSize="11" fontWeight="600" textAnchor="middle">WhatsApp</text>
          <text x="510" y="80" fill="rgba(113,113,122,0.8)" fontFamily="sans-serif" fontSize="10" textAnchor="middle">API / Meta</text>
        </svg>
        <p className="text-[11px] text-zinc-600 text-center mt-1">O Zelt.AI atua exclusivamente como camada técnica intermediária.</p>
      </div>

      <p className="text-sm text-zinc-400 leading-relaxed mb-3">
        O Zelt.AI é uma plataforma tecnológica de infraestrutura que atua como ferramenta de integração, automação e roteamento de dados — incluindo serviços de mensageria, conexão via API e motores de conversão. A plataforma fornece os meios técnicos para que o Usuário conecte suas próprias instâncias e gerencie suas comunicações.
      </p>
      <Callout type="warn" title="Importante">
        O Zelt.AI não é um provedor de serviços de telefonia, nem possui vínculo direto com empresas terceiras de mensageria (como o WhatsApp/Meta). A responsabilidade pelo conteúdo das mensagens trafegadas é exclusivamente do Usuário.
      </Callout>
    </div>
  );
}

function Sec2() {
  return (
    <div id="sec2" className="scroll-mt-24 mb-12">
      <SectionHeader num="02" title="Cadastro, Chaves de API e Segurança das Contas" />
      {/* API Key mockup */}
      <div className="rounded-2xl border border-white/8 bg-zinc-900/50 p-4 mb-5 flex items-center gap-4 overflow-hidden">
        <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/25 flex items-center justify-center flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"><circle cx="7.5" cy="15.5" r="4.5"/><path d="M21 2L10 13M15 7l4 4"/></svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-0.5">API KEY</p>
          <p className="text-sm font-mono text-zinc-400 truncate">zelt_live_••••••••••••••••••••••••</p>
        </div>
        <span className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-1.5 rounded-lg flex-shrink-0">Proteger</span>
      </div>
      <p className="text-sm text-zinc-400 leading-relaxed mb-3">
        Para utilizar os serviços, o Usuário receberá ou gerará credenciais de acesso exclusivas, incluindo chaves globais e tokens de instâncias (apikey). O Usuário é o único e exclusivo responsável por manter o sigilo absoluto dessas credenciais.
      </p>
      <Callout type="danger" title="Responsabilidade Exclusiva do Usuário">
        Qualquer requisição efetuada utilizando as chaves de API atribuídas ao Usuário será considerada, para todos os fins jurídicos e contratuais, como realizada pelo próprio Usuário. O Zelt.AI não se responsabiliza por perdas, vazamentos ou acessos não autorizados decorrentes da negligência do Usuário na guarda de seus tokens.
      </Callout>
    </div>
  );
}

function Sec3() {
  return (
    <div id="sec3" className="scroll-mt-24 mb-12">
      <SectionHeader num="03" title="Política de Uso Aceitável e Práticas Anti-Spam" />
      <p className="text-sm text-zinc-400 leading-relaxed mb-3">
        O Usuário compromete-se a utilizar a plataforma em estrita conformidade com a legislação vigente. É <span className="text-white font-medium">expressamente proibida</span> a utilização do Zelt.AI para:
      </p>
      <FancyList items={[
        "Envio de comunicações não solicitadas em massa (Spam) que violem as políticas de provedores de terceiros.",
        "Disseminação de conteúdos ilegais, fraudulentos, ofensivos, vírus, malwares ou engenharia social (phishing).",
        "Práticas que visem sobrecarregar de forma maliciosa a infraestrutura do Zelt.AI, sob pena de bloqueio imediato do IP e da instância, sem direito a qualquer tipo de ressarcimento.",
      ]}/>

      {/* LEGAL WARNING */}
      <div className="relative rounded-2xl border border-red-500/25 bg-red-500/[0.06] p-6 mt-6 overflow-hidden">
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-red-500/08 pointer-events-none"/>
        <div className="flex items-center gap-2 mb-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>
          <p className="text-[11px] font-black tracking-widest uppercase text-red-400">Cláusula de Limitação de Litígio</p>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">
          <span className="text-red-400 font-bold">VOCÊ NÃO PODE PROCESSAR O ZELT.AI.</span> Ao aceitar estes termos, o Usuário renuncia, de forma irrevogável e irretratável, ao direito de pleitear em juízo ou fora dele qualquer indenização por perdas e danos, lucros cessantes, bloqueios de contas de terceiros ou instabilidade no sistema. O Zelt.AI fornece a tecnologia "como está" (<em>as is</em>) e "conforme disponível".
        </p>
      </div>
    </div>
  );
}

function Sec4() {
  return (
    <div id="sec4" className="scroll-mt-24 mb-12">
      <SectionHeader num="04" title="Limitação de Responsabilidade Técnica" />
      <p className="text-sm text-zinc-400 leading-relaxed mb-3">
        Considerando a natureza da tecnologia e a dependência de plataformas parceiras de mensageria e serviços de nuvem, o Zelt.AI não garante a operação ininterrupta do sistema. O Zelt.AI exime-se de qualquer responsabilidade decorrente de:
      </p>
      <FancyList items={[
        "Bloqueios, banimentos ou suspensões de números de telefone e contas de WhatsApp aplicados pela Meta Platforms Inc. decorrentes do mau uso ou das regras internas de tais plataformas.",
        "Instabilidades decorrentes de atualizações globais em APIs de terceiros que quebrem a compatibilidade temporária dos payloads.",
        "Atrasos ou falhas de entrega causados por problemas de conexão do próprio Usuário com a URL de destino (ex: 127.0.0.1 ou servidores externos).",
      ]}/>
    </div>
  );
}

function Sec5() {
  return (
    <div id="sec5" className="scroll-mt-24 mb-12">
      <SectionHeader num="05" title="Planos, Cobrança e Cancelamento" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div className="rounded-2xl border border-white/8 bg-zinc-900/50 p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 mb-2">Trial</p>
          <p className="text-4xl font-black text-green-400">R$ 0<span className="text-xl text-zinc-500 font-normal">,00</span></p>
          <p className="text-xs text-zinc-600 mt-1">3 dias grátis · sem cartão</p>
        </div>
        <div className="rounded-2xl border border-green-500/30 bg-green-500/[0.05] p-5 relative">
          <span className="absolute -top-3 left-4 text-[10px] font-black tracking-widest uppercase bg-green-500 text-black px-3 py-1 rounded-full">Mais popular</span>
          <p className="text-[10px] font-bold tracking-widest uppercase text-green-400 mb-2">Basic</p>
          <p className="text-4xl font-black text-white">R$ 79<span className="text-xl text-zinc-500 font-normal">,90</span></p>
          <p className="text-xs text-zinc-600 mt-1">/mês · sem fidelidade</p>
        </div>
      </div>
      <p className="text-sm text-zinc-400 leading-relaxed mb-3">
        O Zelt.AI disponibiliza o acesso aos seus serviços mediante planos de assinatura recorrente. Os valores, limites de requisições, capacidade de instâncias e condições de pagamento são detalhados no momento da contratação.
      </p>
      <Callout type="warn" title="Inadimplemento">
        O inadimplemento resultará na <span className="text-white font-medium">suspensão imediata dos tokens de API</span> associados e, após 15 dias corridos de atraso, na <span className="text-white font-medium">exclusão definitiva</span> das configurações e histórico da instância nos servidores de produção.
      </Callout>
    </div>
  );
}

function Sec6() {
  const rows = [
    { tag: "Cadastro", dados: "Nome, e-mail, CNPJ/CPF, dados de faturamento.", fin: "Gestão de assinatura, faturamento e autenticação." },
    { tag: "Conexão",  dados: "Endereços IP, logs de requisição, metadados HTTP.", fin: "Segurança do servidor, auditoria, prevenção a ataques." },
    { tag: "Tráfego",  dados: "Números de destino, payloads JSON, status de entrega.", fin: "Roteamento e execução da automação via API." },
  ];
  return (
    <div id="sec6" className="scroll-mt-24 mb-12">
      <SectionHeader num="06" title="Coleta e Tratamento de Dados" />
      <p className="text-sm text-zinc-400 leading-relaxed mb-5">
        O Zelt.AI coleta estritamente os dados necessários para o fornecimento, monitoramento e segurança da infraestrutura de automação.
      </p>
      <div className="rounded-2xl border border-white/8 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-900/80">
              <th className="text-left text-[10px] font-bold tracking-widest uppercase text-zinc-600 px-4 py-3 border-b border-white/5">Categoria</th>
              <th className="text-left text-[10px] font-bold tracking-widest uppercase text-zinc-600 px-4 py-3 border-b border-white/5">Dados Coletados</th>
              <th className="text-left text-[10px] font-bold tracking-widest uppercase text-zinc-600 px-4 py-3 border-b border-white/5 hidden sm:table-cell">Finalidade</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors last:border-0">
                <td className="px-4 py-3.5 align-top">
                  <span className="text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-md">{r.tag}</span>
                </td>
                <td className="px-4 py-3.5 text-zinc-400 text-xs leading-relaxed align-top">{r.dados}</td>
                <td className="px-4 py-3.5 text-zinc-500 text-xs leading-relaxed align-top hidden sm:table-cell">{r.fin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Sec7() {
  const steps = [
    { emoji: "✅", label: "Trânsito", color: "border-green-500/30 bg-green-500/10", textColor: "text-green-400", desc: "Payloads em memória temporária. Não armazenados permanentemente." },
    { emoji: "📅", label: "90 Dias",  color: "border-yellow-500/30 bg-yellow-500/10", textColor: "text-yellow-400", desc: "Logs de auditoria e metadados retidos por conformidade." },
    { emoji: "🗑️", label: "Eliminação", color: "border-red-500/25 bg-red-500/[0.08]", textColor: "text-red-400", desc: "Exclusão automática após 90 dias. Sem intervenção manual." },
  ];
  return (
    <div id="sec7" className="scroll-mt-24 mb-12">
      <SectionHeader num="07" title="Retenção e Descarte de Dados" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {steps.map((s, i) => (
          <div key={i} className={`relative rounded-2xl border p-5 ${s.color}`}>
            {i < 2 && (
              <div className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
              </div>
            )}
            <p className="text-2xl mb-2">{s.emoji}</p>
            <p className={`text-sm font-bold mb-1.5 ${s.textColor}`}>{s.label}</p>
            <p className="text-xs text-zinc-500 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-zinc-400 leading-relaxed">
        O Zelt.AI adota o princípio da <span className="text-white font-medium">minimização de dados</span>. Logs de auditoria e metadados de conexões HTTP são armazenados por até 90 dias para fins de conformidade jurídica e segurança cibernética, sendo eliminados automaticamente após esse intervalo.
      </p>
    </div>
  );
}

function Sec8() {
  return (
    <div id="sec8" className="scroll-mt-24 mb-12">
      <SectionHeader num="08" title="Compartilhamento de Informações com Terceiros" />
      <Callout type="info" title="Compromisso Zelt.AI">
        O Zelt.AI não comercializa, aluga ou cede dados de Usuários para fins publicitários ou mercadológicos.
      </Callout>
      <p className="text-sm text-zinc-400 leading-relaxed mb-3">O compartilhamento de dados ocorre unicamente nas seguintes hipóteses:</p>
      <FancyList items={[
        "Com provedores de infraestrutura de nuvem e servidores de hospedagem (ex: AWS, DigitalOcean), estritamente para manter o sistema online.",
        "Por força de determinação judicial ou requisição legal emitida por autoridades governamentais competentes, nos moldes da legislação aplicável.",
      ]}/>
    </div>
  );
}

function Sec9() {
  return (
    <div id="sec9" className="scroll-mt-24 mb-12">
      <SectionHeader num="09" title="Disposições Finais e Foro" />
      <p className="text-sm text-zinc-400 leading-relaxed mb-5">
        O Zelt.AI reserva-se o direito de modificar estes Termos de Uso e Política de Privacidade a qualquer momento, mediante aviso prévio publicado na plataforma ou enviado por e-mail com antecedência mínima de 5 (cinco) dias da entrada em vigor das alterações.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/8 bg-zinc-900/50 p-5">
          <p className="text-2xl mb-2">⏱️</p>
          <p className="text-sm font-semibold text-white mb-1">Aviso Prévio</p>
          <p className="text-xs text-zinc-500 leading-relaxed">Mínimo de 5 dias antes de qualquer alteração entrar em vigor.</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-zinc-900/50 p-5">
          <p className="text-2xl mb-2">⚖️</p>
          <p className="text-sm font-semibold text-white mb-1">Foro de Eleição</p>
          <p className="text-xs text-zinc-500 leading-relaxed">Comarca de São Paulo/SP, com exclusão de qualquer outro por mais privilegiado que seja.</p>
        </div>
      </div>

      {/* CTA */}
      <div className="relative mt-10 rounded-2xl border border-white/8 bg-zinc-900/50 p-8 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/[0.04] to-transparent pointer-events-none rounded-2xl"/>
        <p className="text-3xl mb-3">🤝</p>
        <h3 className="text-xl font-bold text-white mb-2">Dúvidas ou sugestões?</h3>
        <p className="text-sm text-zinc-400 max-w-sm mx-auto mb-6">
          Nossa equipe está disponível para esclarecer qualquer ponto deste documento.
        </p>
        <a href="mailto:suporte@zelt.ai"
          className="inline-block bg-green-500 hover:bg-green-400 text-black font-semibold text-sm rounded-xl px-6 py-3 transition-all hover:shadow-lg hover:shadow-green-500/30 active:scale-95">
          Falar com o time →
        </a>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function TermsPage() {
  const [activeId, setActiveId] = useState("sec1");
  const allSections = [...PART1, ...PART2];

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveId(e.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    allSections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#050509] font-sans antialiased relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', system-ui, sans-serif; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050509; }
        ::-webkit-scrollbar-thumb { background: #16a34a; border-radius: 99px; }
        @keyframes pulseGlow {
          0%,100%{opacity:1;transform:translateX(-50%) scale(1);}
          50%{opacity:.55;transform:translateX(-50%) scale(1.1);}
        }
        @keyframes floatOrb {
          0%,100%{transform:translateY(0px) scale(1);}
          33%{transform:translateY(-22px) scale(1.04);}
          66%{transform:translateY(10px) scale(0.97);}
        }
        @keyframes scanLine {
          0%{top:-2px;opacity:0;}10%{opacity:1;}90%{opacity:.25;}100%{top:100vh;opacity:0;}
        }
        @keyframes fadeSlideUp {
          from{opacity:0;transform:translateY(28px);}to{opacity:1;transform:translateY(0);}
        }
        @keyframes shimmerText {
          0%{background-position:0%;}100%{background-position:200%;}
        }
        @keyframes rotateSlow {
          from{transform:translate(-50%,-50%) rotate(0deg);}
          to{transform:translate(-50%,-50%) rotate(360deg);}
        }
        @keyframes pingDot {
          0%,100%{opacity:1;transform:scale(1);}50%{opacity:.4;transform:scale(1.6);}
        }
      `}</style>

      <Background3D />
      <Navbar />

      <div className="relative z-10">
        <Hero />

        {/* INTRO BANNER */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-8">
          <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.05] p-5 flex items-start gap-4">
            <span className="text-green-400 flex-shrink-0 mt-0.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
            </span>
            <p className="text-sm text-zinc-400 leading-relaxed">
              <span className="text-white font-medium">Sobre este documento — </span>
              Ao criar uma conta, conectar uma instância, trafegar payloads ou utilizar qualquer serviço relacionado ao Zelt.AI, você declara ter lido, compreendido e concordado integralmente com todas as cláusulas dispostas neste instrumento. Se você não concorda com qualquer disposição, interrompa imediatamente o uso do sistema.
            </p>
          </div>
        </div>

        {/* LAYOUT */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10">
            <Sidebar activeId={activeId} />

            <main>
              {/* PARTE I */}
              <PartHeader
                num="I"
                title="Parte I — Termos de Uso"
                sub="Regras de uso, responsabilidades e limites da plataforma."
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                }
              />
              <Sec1/><Sec2/><Sec3/><Sec4/><Sec5/>

              {/* DIVIDER */}
              <div className="my-12 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent"/>

              {/* PARTE II */}
              <PartHeader
                num="II"
                title="Parte II — Política de Privacidade"
                sub="Como coletamos, tratamos e protegemos seus dados."
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                }
              />
              <Sec6/><Sec7/><Sec8/><Sec9/>
            </main>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
