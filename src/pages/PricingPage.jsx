import { useState, useEffect, useRef } from "react";
import {
  CheckCircle2, ArrowRight, Zap, Star, Building2, HelpCircle,
  MessageCircle, ChevronDown, Sparkles, Shield, Clock, TrendingUp,
  Lock, Loader2,
  X
} from "lucide-react";
import { createCheckout } from "../services/billing";
import Navbar from "../components/Navbar";

// ─── FOOTER ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-white/5 py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src="/logo1.png" className="w-8" alt="Zelt.ai" />
          <span className="text-white font-semibold text-sm">Zelt<span className="text-green-400">.AI</span></span>
        </div>
        <p className="text-xs text-zinc-600">© 2025 Zelt.AI · Parte do ecossistema <a href="https://urbansoft.vercel.app/" className="hover:text-white transition-all">UrbanSoft</a></p>
        <div className="flex gap-5">
          {["Termos", "Privacidade", "Contato"].map((l) => (
            <a key={l} href="#" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ─── HERO — novo estilo horizontal split ─────────────────────────────────────

function PageHero() {
  return (
    <section className="relative min-h-[72vh] flex items-center overflow-hidden pt-20">
      {/* Background layers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 1)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e\")" }} />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-700/8 rounded-full blur-[100px]" />
        {/* Vertical accent line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-green-500/20 to-transparent hidden lg:block" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 w-full py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* LEFT */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-green-500/10 border border-green-500/20 px-4 py-1.5 mb-8">
              <Sparkles className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs font-semibold text-green-400 tracking-wide">Planos transparentes, sem letra miúda</span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-black text-white leading-[1.0] tracking-tight">
              O preço certo<br />
              para o negócio<br />
              <span className="relative">
                <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">que você tem.</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 6C60 2 180 2 298 6" stroke="url(#underline)" strokeWidth="2.5" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="underline" x1="0" y1="0" x2="300" y2="0">
                      <stop stopColor="#22c55e" stopOpacity="0.8"/>
                      <stop offset="1" stopColor="#34d399" stopOpacity="0.3"/>
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            <p className="mt-8 text-zinc-400 text-lg leading-relaxed max-w-md">
              Sem taxa de instalação, sem fidelidade, sem surpresa no cartão. Escolha, configure e comece a vender.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <a href="/register" className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl px-7 py-3.5 text-sm transition-all hover:shadow-lg hover:shadow-green-500/30 active:scale-[0.98]">
                Começar 3 dias grátis <ArrowRight className="w-4 h-4" />
              </a>
              <a href="/contato" className="flex items-center justify-center gap-2 text-zinc-300 hover:text-white border border-white/10 hover:border-white/20 rounded-xl px-7 py-3.5 text-sm transition-all active:scale-[0.98]">
                <MessageCircle className="w-4 h-4" /> Falar com vendas
              </a>
            </div>

            <div className="mt-8 flex items-center gap-5 flex-wrap">
              {["Sem cartão de crédito", "Cancele quando quiser", "Setup em 2 horas"].map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500/70" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT — floating stat cards */}
          <div className="relative hidden lg:flex flex-col gap-4 items-end">
            {/* Big number card */}
            <div className="w-72 bg-zinc-900/80 border border-white/8 rounded-2xl p-6 backdrop-blur-sm">
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Economia mensal média</p>
              <p className="text-4xl font-black text-white mt-1">R$ <span className="text-green-400">1.820</span></p>
              <p className="text-xs text-zinc-500 mt-1">vs. atendente humano em tempo integral</p>
              <div className="mt-4 flex gap-1">
                {[85, 60, 90, 45, 75, 95, 55, 80].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm bg-green-500/20 hover:bg-green-500/40 transition-colors" style={{ height: `${h * 0.4}px` }} />
                ))}
              </div>
            </div>

            {/* ROI pill */}
            <div className="w-56 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">ROI médio</p>
                <p className="text-sm font-bold text-white">+3× em 30 dias</p>
              </div>
            </div>

            {/* Trust pill */}
            <div className="w-64 bg-zinc-900/60 border border-white/8 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="flex -space-x-2">
                {["CM", "RT", "JP"].map((i, idx) => (
                  <div key={idx} className={`w-7 h-7 rounded-full border-2 border-zinc-900 flex items-center justify-center text-[10px] font-bold text-white ${["bg-violet-500", "bg-emerald-500", "bg-amber-500"][idx]}`}>{i}</div>
                ))}
              </div>
              <div>
                <p className="text-xs text-white font-semibold">+120 empresas ativas</p>
                <div className="flex gap-0.5 mt-0.5">
                  {[...Array(5)].map((_, i) => <svg key={i} className="w-3 h-3 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-30">
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Ver planos</span>
        <ChevronDown className="w-4 h-4 text-zinc-500 animate-bounce" />
      </div>
    </section>
  );
}

// ─── BILLING TOGGLE ───────────────────────────────────────────────────────────

function BillingToggle({ billing, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`text-sm font-medium transition-colors ${billing === "monthly" ? "text-white" : "text-zinc-500"}`}>Mensal</span>
      <button
        onClick={() => onChange(billing === "monthly" ? "annual" : "monthly")}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${billing === "annual" ? "bg-green-500" : "bg-zinc-700"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${billing === "annual" ? "translate-x-6" : "translate-x-0"}`} />
      </button>
      <span className={`text-sm font-medium transition-colors ${billing === "annual" ? "text-white" : "text-zinc-500"}`}>
        Anual <span className="text-xs text-green-400 font-semibold bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded-full ml-1">−20%</span>
      </span>
    </div>
  );
}

// ─── PLANS DATA ───────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: "starter",
    icon: <Zap className="w-5 h-5" />,
    name: "Starter",
    tagline: "Para autônomos e MEIs",
    monthlyPrice: 79.90,
    annualPrice: 63.92,
    highlight: false,
    badge: null,
    color: "border-white/8 hover:border-white/15",
    iconBg: "bg-zinc-800 text-zinc-300",
    features: [
      { text: "1 Agente de IA", included: true },
      { text: "2.000 mensagens/mês", included: true },
      { text: "FAQ básico configurável", included: true },
      { text: "Integração WhatsApp", included: true },
      { text: "Atendimento 24/7", included: true },
      { text: "Suporte via WhatsApp", included: true },
      { text: "Múltiplos agentes", included: false },
      { text: "Relatórios avançados", included: false },
      { text: "Integrações premium", included: false },
    ],
    cta: "Começar grátis",
    ctaStyle: "bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20",
  },
  {
    id: "basic",
    icon: <Star className="w-5 h-5" />,
    name: "Basic",
    tagline: "Para pequenas empresas",
    monthlyPrice: 169.99,
    annualPrice: 135.99,
    highlight: true,
    badge: "Mais popular",
    disabled: true,
    color: "border-green-500/30",
    iconBg: "bg-green-500/20 text-green-400",
    features: [
      { text: "1 Agente de IA", included: true },
      { text: "10.000 mensagens/mês", included: true },
      { text: "FAQ avançado + catálogo", included: true },
      { text: "Integração WhatsApp", included: true },
      { text: "Atendimento 24/7", included: true },
      { text: "Suporte prioritário", included: true },
      { text: "Relatórios de performance", included: true },
      { text: "Múltiplos agentes", included: false },
      { text: "Integrações premium", included: false },
    ],
    cta: "Indisponível",
    ctaStyle: "bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed",
  },
  {
    id: "pro",
    icon: <Building2 className="w-5 h-5" />,
    name: "Pro",
    tagline: "Para médias empresas",
    monthlyPrice: 349.99,
    annualPrice: 279.99,
    highlight: false,
    badge: null,
    disabled: true,
    color: "border-white/8",
    iconBg: "bg-zinc-800 text-zinc-300",
    features: [
      { text: "Até 3 Agentes de IA", included: true },
      { text: "Mensagens ilimitadas", included: true },
      { text: "FAQ + catálogo + fluxos", included: true },
      { text: "Integração WhatsApp", included: true },
      { text: "Atendimento 24/7", included: true },
      { text: "Suporte premium (SLA)", included: true },
      { text: "Relatórios avançados", included: true },
      { text: "Múltiplos agentes", included: true },
      { text: "Integrações premium", included: true },
    ],
    cta: "Indisponível",
    ctaStyle: "bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed",
  },
];

// ─── PRICING SECTION ──────────────────────────────────────────────────────────

function PricingSection() {
  const [billing, setBilling] = useState("monthly");
  const [loading, setLoading] = useState(null);

  const fmt = (price) =>
    price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleCheckout = async (planId) => {
    const token = localStorage.getItem("zelt_token");
    if (!token || token === "undefined" || token === "null") {
      window.location.href = "/register";
      return;
    }
    setLoading(planId);
    try {
      const data = await createCheckout(planId);
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (err) {
      setLoading(null);
    }
  };

  return (
    <section id="pricing" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
          <div>
            <p className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-2">Planos e preços</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Escolha o seu plano</h2>
          </div>
          <BillingToggle billing={billing} onChange={setBilling} />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {PLANS.map((plan, idx) => {
            const price = billing === "annual" ? plan.annualPrice : plan.monthlyPrice;
            const integer = Math.floor(price);
            const cents = (price % 1).toFixed(2).slice(1);

            const isDisabled = plan.disabled;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl p-7 border bg-zinc-900/50 transition-all duration-300 ${plan.color} ${plan.highlight && !isDisabled ? "md:-translate-y-3 md:scale-[1.02]" : ""} ${isDisabled ? "select-none" : "hover:-translate-y-1"}`}
              >
                {plan.badge && !isDisabled && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-green-500 text-black text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-lg shadow-green-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-black/30" />
                    {plan.badge}
                  </div>
                )}

                {plan.badge && isDisabled && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-zinc-700 text-zinc-400 text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    <Lock className="w-3 h-3" />
                    Em breve
                  </div>
                )}

                <div className={isDisabled ? "blur-sm pointer-events-none" : ""}>
                  {/* Plan header */}
                  <div className="mb-6">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${plan.iconBg}`}>
                      {plan.icon}
                    </div>
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Zelt {plan.name}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">{plan.tagline}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-2">
                    {billing === "annual" && (
                      <p className="text-xs text-zinc-600 line-through mb-0.5">R$ {fmt(plan.monthlyPrice)}/mês</p>
                    )}
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-zinc-500 text-sm">R$</span>
                      <span className="text-4xl font-black text-white mx-1">{integer}</span>
                      <span className="text-zinc-400 text-lg">{cents}</span>
                      <span className="text-zinc-600 text-xs ml-1">/mês</span>
                    </div>
                    {plan.id === "starter" && (
                      <p className="text-[11px] text-zinc-500 mt-1">Taxa fixa · Consumo de IA à parte (geralmente R$ 2–5/mês)</p>
                    )}
                    <p className="text-[10px] text-zinc-700 mt-0.5">*Preço a partir de · varia conforme uso da IA</p>
                    {billing === "annual" && (
                      <p className="text-[11px] text-green-400 mt-1">Cobrado anualmente · Você economiza R$ {fmt((plan.monthlyPrice - plan.annualPrice) * 12)}/ano</p>
                    )}
                  </div>

                  {/* Separator */}
                  <div className="border-t border-white/5 my-5" />

                  {/* Features */}
                  <ul className="space-y-3 flex-1 mb-7">
                    {plan.features.map((f) => (
                      <li key={f.text} className={`flex items-center gap-3 text-sm ${f.included ? "text-zinc-300" : "text-zinc-700"}`}>
                        {f.included ? (
                          <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-3 h-3 text-green-400" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                            <X className="w-3 h-3 text-zinc-700" />
                          </div>
                        )}
                        {f.text}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {isDisabled ? (
                    <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed">
                      {plan.cta}
                    </div>
                  ) : plan.id === "starter" ? (
                    <button
                      onClick={() => handleCheckout("basic")}
                      disabled={loading === "starter"}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 active:scale-[0.98]"
                    >
                      {loading === "starter" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          {plan.cta}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  ) : (
                    <a
                      href="/contato"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 active:scale-[0.98]"
                    >
                      {plan.cta}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <p className="text-center text-[11px] text-zinc-700 mt-3">3 dias grátis · Sem cartão de crédito</p>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-zinc-700 mt-8">Todos os planos incluem SSL, backups automáticos e conformidade com a LGPD.</p>
      </div>
    </section>
  );
}

// ─── FEATURE COMPARISON TABLE ─────────────────────────────────────────────────

const COMPARISON_ROWS = [
  { category: "IA & Atendimento", items: [
    { label: "Agentes de IA", starter: "1", basic: "1", pro: "Até 3" },
    { label: "Mensagens mensais", starter: "2.000", basic: "10.000", pro: "Ilimitadas" },
    { label: "NLP avançado", starter: true, basic: true, pro: true },
    { label: "Atendimento 24/7", starter: true, basic: true, pro: true },
    { label: "FAQ configurável", starter: "Básico", basic: "Avançado", pro: "Avançado + fluxos" },
    { label: "Catálogo de produtos", starter: false, basic: true, pro: true },
  ]},
  { category: "Integrações", items: [
    { label: "WhatsApp Business", starter: true, basic: true, pro: true },
    { label: "WhatsApp pessoal", starter: true, basic: true, pro: true },
    { label: "Integrações premium", starter: false, basic: false, pro: true },
    { label: "API de webhooks", starter: false, basic: false, pro: true },
  ]},
  { category: "Relatórios & Suporte", items: [
    { label: "Dashboard básico", starter: true, basic: true, pro: true },
    { label: "Relatórios de conversão", starter: false, basic: true, pro: true },
    { label: "Exportação de dados", starter: false, basic: true, pro: true },
    { label: "Suporte", starter: "WhatsApp", basic: "Prioritário", pro: "Premium (SLA)" },
  ]},
];

function Cell({ value }) {
  if (value === true) return <div className="flex justify-center"><div className="w-5 h-5 rounded-full bg-green-500/15 flex items-center justify-center"><CheckCircle2 className="w-3 h-3 text-green-400" /></div></div>;
  if (value === false) return <div className="flex justify-center"><X className="w-3.5 h-3.5 text-zinc-700" /></div>;
  return <span className="text-xs text-zinc-300">{value}</span>;
}

function ComparisonTable() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-2">Comparativo completo</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">O que cada plano inclui</h2>
        </div>

        <div className="rounded-2xl border border-white/8 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-4 bg-zinc-900/80 border-b border-white/8 sticky top-0">
            <div className="px-5 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Recurso</div>
            {PLANS.map((p) => (
              <div key={p.id} className={`px-4 py-4 text-center ${p.highlight && !p.disabled ? "bg-green-500/5" : ""} ${p.disabled ? "relative" : ""}`}>
                <p className={`text-sm font-bold ${p.highlight && !p.disabled ? "text-green-400" : "text-white"} ${p.disabled ? "blur-sm" : ""}`}>
                  {p.name}
                </p>
                {p.disabled && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider bg-zinc-900/80 px-2 py-0.5 rounded-full border border-zinc-700/50">
                      <Lock className="w-2.5 h-2.5 inline mr-1 -mt-0.5" />Em breve
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Rows */}
          {COMPARISON_ROWS.map((section) => (
            <div key={section.category}>
              <div className="grid grid-cols-4 bg-white/[0.025] border-y border-white/5">
                <div className="px-5 py-2.5 col-span-4">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">{section.category}</span>
                </div>
              </div>
              {section.items.map((row, i) => (
                <div key={row.label} className={`grid grid-cols-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? "" : "bg-white/[0.01]"}`}>
                  <div className="px-5 py-3.5 text-sm text-zinc-400">{row.label}</div>
                  {(["starter", "basic", "pro"]).map((planId) => {
                    const p = PLANS.find(p => p.id === planId);
                    const colDisabled = p?.disabled;
                    return (
                      <div key={planId} className={`px-4 py-3.5 flex items-center justify-center ${planId === "basic" ? "bg-green-500/[0.03]" : ""} ${colDisabled ? "blur-sm" : ""}`}>
                        <Cell value={row[planId]} />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── TRUST STRIP ──────────────────────────────────────────────────────────────

function TrustStrip() {
  const items = [
    { icon: <Shield className="w-4 h-4 text-green-400" />, text: "Dados protegidos por SSL" },
    { icon: <CheckCircle2 className="w-4 h-4 text-green-400" />, text: "Conforme LGPD" },
    { icon: <Clock className="w-4 h-4 text-green-400" />, text: "Cancele a qualquer momento" },
    { icon: <Sparkles className="w-4 h-4 text-green-400" />, text: "Setup em menos de 2 horas" },
    { icon: <TrendingUp className="w-4 h-4 text-green-400" />, text: "Resultados em até 48h" },
  ];

  return (
    <section className="py-8 px-4 border-y border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {items.map((item) => (
            <div key={item.text} className="flex items-center gap-2">
              {item.icon}
              <span className="text-xs text-zinc-500 whitespace-nowrap">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQS = [
  { q: "Preciso de cartão de crédito para os 3 dias grátis?", a: "Não. O trial é totalmente gratuito e não exige nenhuma forma de pagamento. Você só paga se decidir continuar após os 3 dias." },
  { q: "Posso mudar de plano depois?", a: "Sim, você pode fazer upgrade ou downgrade a qualquer momento pelo painel. A diferença é calculada proporcionalmente ao período restante." },
  { q: "O que acontece se eu ultrapassar o limite de mensagens?", a: "Você receberá um aviso no painel. As mensagens excedentes ficam em fila e você pode fazer upgrade ou aguardar o próximo ciclo sem perder histórico." },
  { q: "O Zelt.AI funciona com meu número atual de WhatsApp?", a: "Sim. Integramos via Evolution API, compatível com WhatsApp Business e pessoal. Você não precisa trocar de número." },
  { q: "Existe fidelidade ou multa de cancelamento?", a: "Zero fidelidade. Cancele quando quiser, pelo painel, em menos de 1 minuto. Sem multa e sem burocracia." },
  { q: "Vocês oferecem desconto para ONGs ou projetos sociais?", a: "Sim! Entre em contato pelo WhatsApp ou e-mail para verificar elegibilidade. Analisamos caso a caso com muito prazer." },
];

function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-2">Dúvidas</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Perguntas frequentes</h2>
          <p className="mt-3 text-sm text-zinc-500">Não encontrou o que procura? <a href="/contato" className="text-green-400 hover:text-green-300 transition-colors">Fale com a gente →</a></p>
        </div>

        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i} className={`rounded-xl border overflow-hidden transition-all duration-200 ${open === i ? "border-white/10 bg-white/[0.05]" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"}`}>
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left gap-4">
                <span className="text-sm font-medium text-white">{faq.q}</span>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${open === i ? "bg-green-500/20" : "bg-white/5"}`}>
                  <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${open === i ? "rotate-180 text-green-400" : ""}`} />
                </div>
              </button>
              {open === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-zinc-400 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FINAL CTA ────────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-zinc-900/50">
          {/* Decorative blobs */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-600/8 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />
          {/* Dashed border accent */}
          <div className="absolute inset-0 rounded-3xl border border-dashed border-white/5 pointer-events-none m-3" />

          <div className="relative px-8 sm:px-14 py-14 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400 mb-5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />3 dias grátis
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                Comece hoje.<br />Veja resultados<br />ainda essa semana.
              </h2>
              <p className="mt-4 text-sm text-zinc-400 leading-relaxed">
                Sem burocracia. Sem cartão de crédito. Configure em 2 horas e seu agente já começa a trabalhar por você.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <a href="/register" className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl px-7 py-4 text-sm transition-all hover:shadow-lg hover:shadow-green-500/25 active:scale-[0.98]">
                Criar conta grátis <ArrowRight className="w-4 h-4" />
              </a>
              <a href="/contato" className="flex items-center justify-center gap-2 text-zinc-400 hover:text-white border border-white/8 hover:border-white/20 rounded-xl px-7 py-3.5 text-sm transition-all active:scale-[0.98]">
                <HelpCircle className="w-4 h-4" /> Ainda tenho dúvidas
              </a>
              <p className="text-center text-xs text-zinc-700">Cancele quando quiser · Sem multa · Sem fidelidade</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── PAGE ROOT ────────────────────────────────────────────────────────────────

export default function PrecosPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] font-sans antialiased">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'); * { font-family: 'Inter', system-ui, sans-serif; }`}</style>
      <Navbar />
      <PageHero />
      <TrustStrip />
      <PricingSection />
      <ComparisonTable />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
