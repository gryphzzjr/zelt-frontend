import { useState, useEffect, useRef } from "react";
import {
  ArrowRight, Star, Quote, TrendingUp, Clock, MessageCircle,
  ChevronLeft, ChevronRight, Play
} from "lucide-react";
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
          {["Termos", "Privacidade", "Contato"].map((l) => (<a key={l} href="#" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">{l}</a>))}
        </div>
      </div>
    </footer>
  );
}

// ─── HERO — marquee + big stat + quote spotlight ──────────────────────────────

const MARQUEE_ITEMS = [
  "Boutique Carla M.", "Auto Center Torres", "Clínica Estética JP",
  "Salão Studio K", "Pet Shop Patinhas", "Pizzaria Dom Forno",
  "Academia FitLife", "Ótica Visão Clara", "Doçaria Mel & Cia",
  "Construtora VR", "Instituto Beleza Pura", "Loja Moda Viva",
];

function MarqueeLine({ reverse = false, speed = 30 }) {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="relative overflow-hidden w-full">
      <div
        className={`flex gap-3 whitespace-nowrap ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {items.map((name, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/8 bg-white/[0.03] text-zinc-500 text-xs font-medium flex-shrink-0 hover:border-green-500/30 hover:text-zinc-300 transition-colors cursor-default">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

function PageHero() {
  return (
    <section className="relative overflow-hidden pt-20">
      {/* Pure radial glows — no grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-green-500/[0.07] blur-[140px]" />
        <div className="absolute top-40 left-0 w-72 h-72 rounded-full bg-emerald-600/[0.06] blur-[80px]" />
        <div className="absolute top-20 right-0 w-80 h-80 rounded-full bg-green-400/[0.04] blur-[100px]" />
      </div>

      {/* ── Marquee rows at the very top ── */}
      <div className="relative pt-16 pb-10 space-y-3">
        <MarqueeLine reverse={false} speed={35} />
        <MarqueeLine reverse={true} speed={28} />
      </div>

      {/* ── Central content ── */}
      <div className="relative max-w-5xl mx-auto px-6 sm:px-8 pb-20 flex flex-col items-center text-center">

        {/* Massive pull-quote */}
        <div className="relative mb-8">
          <Quote className="absolute -top-6 -left-8 w-16 h-16 text-green-500/10 rotate-180 hidden sm:block" />
          <p className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-[1.1] tracking-tight max-w-3xl">
            "O Zelt pagou o plano inteiro{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">na primeira semana.</span>
              {/* animated underline */}
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" />
            </span>
            {" "}Agora não consigo imaginar o negócio sem ele."
          </p>
          <Quote className="absolute -bottom-4 -right-6 w-12 h-12 text-green-500/10 hidden sm:block" />
        </div>

        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm">JP</div>
          <div className="text-left">
            <p className="text-sm font-semibold text-white">Juliana Pires</p>
            <p className="text-xs text-zinc-500">Fundadora · Clínica Estética JP</p>
          </div>
          <div className="flex gap-0.5 ml-2">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-green-400 fill-green-400" />)}
          </div>
        </div>

        {/* Giant stats row */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
          {[
            { val: "120+", label: "Empresas ativas", sup: "" },
            { val: "98%", label: "Satisfação", sup: "" },
            { val: "3×", label: "Mais conversões", sup: "média" },
            { val: "48h", label: "Para ver resultado", sup: "ou menos" },
          ].map(({ val, label, sup }) => (
            <div key={label} className="bg-[#0a0a0f] px-6 py-7 flex flex-col items-center gap-1 group cursor-default hover:bg-green-500/5 transition-colors">
              <span className="text-3xl sm:text-4xl font-black text-white group-hover:text-green-400 transition-colors">{val}</span>
              <span className="text-xs text-zinc-500 text-center leading-tight">{label}</span>
              {sup && <span className="text-[10px] text-zinc-700">{sup}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0a0f] to-transparent pointer-events-none" />

      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes marquee-reverse { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .animate-marquee { animation: marquee linear infinite; }
        .animate-marquee-reverse { animation: marquee-reverse linear infinite; }
      `}</style>
    </section>
  );
}

// ─── DATA ─────────────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    name: "Carla Mendes",
    role: "Proprietária",
    company: "Boutique Carla M.",
    avatar: "CM",
    avatarColor: "bg-violet-500",
    stars: 5,
    category: "vendas",
    highlight: "Vendi enquanto dormia pela primeira vez.",
    text: "Antes eu perdia vendas fora do horário comercial. Com o Zelt, as dúvidas dos clientes são respondidas na hora, mesmo de madrugada. O retorno foi imediato. Na primeira semana já fechei 3 pedidos que teriam ficado sem resposta.",
    metric: "+40% em vendas fora do horário",
    metricIcon: <TrendingUp className="w-3.5 h-3.5" />,
  },
  {
    name: "Rafael Torres",
    role: "Gestor",
    company: "Auto Center Torres",
    avatar: "RT",
    avatarColor: "bg-emerald-500",
    stars: 5,
    category: "atendimento",
    highlight: "Tirou um peso gigante das minhas costas.",
    text: "O agente responde todas as dúvidas sobre nossos serviços perfeitamente, sem parecer uma máquina. A qualidade das respostas impressionou até minha equipe. Hoje consigo focar no que realmente importa.",
    metric: "Zero reclamações de atendimento",
    metricIcon: <Star className="w-3.5 h-3.5" />,
  },
  {
    name: "Juliana Pires",
    role: "Fundadora",
    company: "Clínica Estética JP",
    avatar: "JP",
    avatarColor: "bg-amber-500",
    stars: 5,
    category: "setup",
    highlight: "Configurei e já estava atendendo no mesmo dia.",
    text: "Alimentamos o Zelt com nossos horários e preços, e ele começou a atender no mesmo dia. A facilidade de treinar a IA com as regras do nosso negócio é incrível. Minha agenda lotou em 2 semanas.",
    metric: "Agenda 100% ocupada em 2 semanas",
    metricIcon: <Clock className="w-3.5 h-3.5" />,
  },
  {
    name: "Marcos Andrade",
    role: "Dono",
    company: "Salão Studio K",
    avatar: "MA",
    avatarColor: "bg-rose-500",
    stars: 5,
    category: "atendimento",
    highlight: "Meus clientes pensam que é humano.",
    text: "A naturalidade do atendimento é absurda. Vários clientes perguntaram se tinham falado com uma pessoa real. O Zelt entende contexto, brinca com o cliente, e ainda consegue agendar tudo automaticamente.",
    metric: "3× mais agendamentos por mês",
    metricIcon: <TrendingUp className="w-3.5 h-3.5" />,
  },
  {
    name: "Fernanda Costa",
    role: "Proprietária",
    company: "Doçaria Mel & Cia",
    avatar: "FC",
    avatarColor: "bg-pink-500",
    stars: 5,
    category: "vendas",
    highlight: "As encomendas nunca pararam de chegar.",
    text: "Épocas como Natal e Páscoa eram um caos de mensagens. Agora o Zelt gerencia tudo: catálogo, disponibilidade, prazos. Meu faturamento nessas datas cresceu 60% porque não perco mais nenhuma encomenda.",
    metric: "+60% no faturamento sazonal",
    metricIcon: <TrendingUp className="w-3.5 h-3.5" />,
  },
  {
    name: "Lucas Ferreira",
    role: "Gerente",
    company: "Pet Shop Patinhas",
    avatar: "LF",
    avatarColor: "bg-cyan-500",
    stars: 5,
    category: "setup",
    highlight: "Em 1 hora já estava funcionando.",
    text: "Sinceramente, achei que ia ser complicado. Mas o painel é muito intuitivo. Em menos de uma hora já tinha o agente rodando com nosso catálogo completo. O suporte no WhatsApp tirou minhas dúvidas em tempo real.",
    metric: "Setup completo em menos de 1h",
    metricIcon: <Clock className="w-3.5 h-3.5" />,
  },
  {
    name: "Beatriz Nunes",
    role: "Sócia",
    company: "Ótica Visão Clara",
    avatar: "BN",
    avatarColor: "bg-indigo-500",
    stars: 5,
    category: "atendimento",
    highlight: "Zero clientes ignorados.",
    text: "Antes de domingos e feriados eram dias perdidos. Agora são dias de vendas. O Zelt atende, qualifica, e quando chegamos na segunda-feira temos uma lista de leads prontos para fechar.",
    metric: "Domingos viraram dia de vendas",
    metricIcon: <Star className="w-3.5 h-3.5" />,
  },
  {
    name: "Diego Melo",
    role: "Proprietário",
    company: "Pizzaria Dom Forno",
    avatar: "DM",
    avatarColor: "bg-orange-500",
    stars: 5,
    category: "vendas",
    highlight: "Nosso delivery cresceu 80%.",
    text: "Configurei o cardápio, os preços, os horários de entrega e as promoções. O Zelt vende, confirma pedidos e ainda faz upsell dos adicionais. Meu faturamento de delivery cresceu 80% em dois meses.",
    metric: "+80% no faturamento de delivery",
    metricIcon: <TrendingUp className="w-3.5 h-3.5" />,
  },
  {
    name: "Patrícia Lima",
    role: "Diretora",
    company: "Academia FitLife",
    avatar: "PL",
    avatarColor: "bg-teal-500",
    stars: 5,
    category: "setup",
    highlight: "Retorno sobre o investimento imediato.",
    text: "No primeiro mês o Zelt já havia pago mais de 10× o valor do plano em matrículas que vieram de conversas fora do horário. Para uma academia com muita concorrência local, responder rápido é o diferencial.",
    metric: "10× ROI no primeiro mês",
    metricIcon: <TrendingUp className="w-3.5 h-3.5" />,
  },
];

const CATEGORIES = [
  { id: "all", label: "Todos" },
  { id: "vendas", label: "Vendas" },
  { id: "atendimento", label: "Atendimento" },
  { id: "setup", label: "Setup & ROI" },
];

// ─── FEATURED SPOTLIGHT ───────────────────────────────────────────────────────

function FeaturedSpotlight() {
  const [active, setActive] = useState(0);
  const featured = [TESTIMONIALS[0], TESTIMONIALS[2], TESTIMONIALS[7]];

  useEffect(() => {
    const timer = setInterval(() => setActive((p) => (p + 1) % featured.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const t = featured[active];

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-zinc-900/60 border border-white/8">
          {/* Green left accent bar */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-green-500 to-transparent" />

          <div className="p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-5 gap-10 items-center">
            {/* Left text */}
            <div className="lg:col-span-3">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-xs font-bold text-green-400 uppercase tracking-widest bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                  Destaque
                </span>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-green-400 fill-green-400" />)}
                </div>
              </div>

              <blockquote className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-6">
                "{t.highlight}"
              </blockquote>

              <p className="text-zinc-400 leading-relaxed text-sm sm:text-base mb-8">{t.text}</p>

              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${t.avatarColor} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-zinc-500">{t.role} · {t.company}</p>
                </div>
                <div className="ml-auto hidden sm:flex items-center gap-1.5 bg-green-500/10 border border-green-500/15 rounded-xl px-3 py-1.5">
                  <span className="text-green-400">{t.metricIcon}</span>
                  <span className="text-xs text-green-400 font-medium">{t.metric}</span>
                </div>
              </div>
            </div>

            {/* Right: selector cards */}
            <div className="lg:col-span-2 flex flex-row lg:flex-col gap-3">
              {featured.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setActive(idx)}
                  className={`flex-1 lg:flex-none text-left p-4 rounded-xl border transition-all duration-300 ${active === idx ? "bg-green-500/10 border-green-500/30" : "bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.04]"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${item.avatarColor} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>{item.avatar}</div>
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold truncate ${active === idx ? "text-white" : "text-zinc-400"}`}>{item.name}</p>
                      <p className="text-[10px] text-zinc-600 truncate">{item.company}</p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  {active === idx && (
                    <div className="mt-3 h-0.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full animate-progress" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Nav arrows */}
          <div className="absolute bottom-6 right-6 flex gap-2">
            <button onClick={() => setActive((p) => (p - 1 + featured.length) % featured.length)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setActive((p) => (p + 1) % featured.length)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes progress { from { width: 0%; } to { width: 100%; } }
        .animate-progress { animation: progress 5s linear forwards; }
      `}</style>
    </section>
  );
}

// ─── MASONRY WALL ─────────────────────────────────────────────────────────────

function TestimonialCard({ t, featured = false }) {
  return (
    <div className={`group relative flex flex-col rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-0.5 break-inside-avoid mb-5 ${featured ? "bg-zinc-900/70 border-green-500/20 hover:border-green-500/35 shadow-xl shadow-green-500/5" : "bg-white/[0.03] border-white/5 hover:bg-white/[0.05] hover:border-white/10"}`}>
      {featured && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/8 rounded-full blur-2xl pointer-events-none" />
      )}

      {/* Stars */}
      <div className="flex gap-0.5 mb-4">
        {[...Array(t.stars)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-green-400 fill-green-400" />)}
      </div>

      {/* Highlight quote */}
      <p className={`text-sm font-bold mb-2 ${featured ? "text-green-400" : "text-white"}`}>"{t.highlight}"</p>

      {/* Full text */}
      <p className="text-sm text-zinc-500 leading-relaxed flex-1 mb-5">{t.text}</p>

      {/* Metric pill */}
      <div className="flex items-center gap-1.5 bg-green-500/8 border border-green-500/15 rounded-lg px-3 py-1.5 w-fit mb-5">
        <span className="text-green-500">{t.metricIcon}</span>
        <span className="text-xs text-green-400 font-medium">{t.metric}</span>
      </div>

      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-white/5">
        <div className={`w-9 h-9 rounded-xl ${t.avatarColor} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>{t.avatar}</div>
        <div>
          <p className="text-sm font-semibold text-white">{t.name}</p>
          <p className="text-xs text-zinc-600">{t.role} · {t.company}</p>
        </div>
      </div>
    </div>
  );
}

function TestimonialsWall() {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all"
    ? TESTIMONIALS
    : TESTIMONIALS.filter((t) => t.category === filter);

  // Split into 3 columns for masonry
  const col1 = filtered.filter((_, i) => i % 3 === 0);
  const col2 = filtered.filter((_, i) => i % 3 === 1);
  const col3 = filtered.filter((_, i) => i % 3 === 2);

  return (
    <section className="py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${filter === cat.id ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-white/[0.03] text-zinc-400 hover:text-white border border-white/5 hover:border-white/10"}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Masonry — 3 col desktop */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-5">
          <div>{col1.map((t, i) => <TestimonialCard key={t.name} t={t} featured={i === 0 && filter === "all"} />)}</div>
          <div>{col2.map((t, i) => <TestimonialCard key={t.name} t={t} featured={i === 0 && filter === "vendas"} />)}</div>
          <div>{col3.map((t) => <TestimonialCard key={t.name} t={t} />)}</div>
        </div>

        {/* 2 col tablet */}
        <div className="hidden sm:grid lg:hidden sm:grid-cols-2 gap-5">
          {filtered.map((t, i) => <TestimonialCard key={t.name} t={t} featured={i === 0} />)}
        </div>

        {/* 1 col mobile */}
        <div className="sm:hidden space-y-4">
          {filtered.map((t, i) => <TestimonialCard key={t.name} t={t} featured={i === 0} />)}
        </div>
      </div>
    </section>
  );
}

// ─── TICKER STRIP ─────────────────────────────────────────────────────────────

function ResultsTicker() {
  const results = [
    "+80% delivery", "10× ROI", "Agenda lotada", "+60% faturamento",
    "Setup em 1h", "Zero leads perdidos", "+40% vendas noturnas", "3× conversões",
  ];

  return (
    <section className="py-10 border-y border-white/5 overflow-hidden my-12">
      <div className="relative">
        <div className="flex gap-6 animate-marquee whitespace-nowrap" style={{ animationDuration: "20s" }}>
          {[...results, ...results].map((r, i) => (
            <span key={i} className="inline-flex items-center gap-2 text-sm font-bold flex-shrink-0">
              <span className="text-green-400">{r}</span>
              <span className="text-zinc-700">·</span>
            </span>
          ))}
        </div>
      </div>
      <style>{`@keyframes marquee { from{transform:translateX(0)}to{transform:translateX(-50%)} } .animate-marquee{animation:marquee linear infinite;}`}</style>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-zinc-900/50 p-10 sm:p-16 text-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-green-500/15 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/8 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl" />
            {/* Corner dots */}
            <div className="absolute top-6 left-6 w-1.5 h-1.5 rounded-full bg-green-500/30" />
            <div className="absolute top-6 right-6 w-1.5 h-1.5 rounded-full bg-green-500/30" />
            <div className="absolute bottom-6 left-6 w-1.5 h-1.5 rounded-full bg-green-500/30" />
            <div className="absolute bottom-6 right-6 w-1.5 h-1.5 rounded-full bg-green-500/30" />
          </div>

          <div className="relative">
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-green-400 fill-green-400" />)}
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
              A próxima história de sucesso<br />
              <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">pode ser a sua.</span>
            </h2>

            <p className="text-zinc-400 max-w-md mx-auto mb-8 text-sm sm:text-base leading-relaxed">
              Junte-se a mais de 120 negócios que automatizaram seu atendimento e multiplicaram suas conversões com o Zelt.AI.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl px-8 py-4 text-sm transition-all hover:shadow-lg hover:shadow-green-500/25 active:scale-[0.98]">
                Começar 3 dias grátis <ArrowRight className="w-4 h-4" />
              </a>
              <a href="https://wa.me/5587996560568" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto flex items-center justify-center gap-2 text-zinc-300 hover:text-white border border-white/10 hover:border-white/20 rounded-xl px-8 py-4 text-sm transition-all active:scale-[0.98]">
                <MessageCircle className="w-4 h-4" /> Falar com o Zelt.AI
              </a>
            </div>

            <p className="mt-5 text-xs text-zinc-700">Sem cartão de crédito · Setup em 2 horas · Cancele quando quiser</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function DepoimentosPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] font-sans antialiased">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'); * { font-family: 'Inter', system-ui, sans-serif; }`}</style>
      <Navbar />
      <PageHero />
      <FeaturedSpotlight />
      <ResultsTicker />
      <TestimonialsWall />
      <FinalCTA />
      <Footer />
    </div>
  );
}
