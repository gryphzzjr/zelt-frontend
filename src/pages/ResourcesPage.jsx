import { useState, useEffect, useRef } from "react";
import { Zap, Clock, TrendingUp, Link2, Users, MessageSquare, Bot, BarChart2, Lock, Globe, Repeat, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import Navbar from "../components/Navbar";

// ─── SHARED: FOOTER ───────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-white/5 py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src="/logo1.png" className="w-8" alt="Zelt.ai" />
          <span className="text-white font-semibold text-sm">Zelt<span className="text-green-400">.AI</span></span>
        </div>
        <p className="text-xs text-zinc-600">© 2025 Zelt.AI · Parte do ecossistema <a href="https://urbansoft.vercel.app/" className="hover:text-white cursor-pointer transition-all">UrbanSoft</a></p>
        <div className="flex gap-5">
          {["Termos", "Privacidade", "Contato"].map((l) => (
            <a key={l} href="#" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ─── PAGE DATA ────────────────────────────────────────────────────────────────

const FEATURE_CATEGORIES = [
  {
    id: "ia",
    label: "Inteligência Artificial",
    icon: <Bot className="w-4 h-4" />,
  },
  {
    id: "atendimento",
    label: "Atendimento",
    icon: <MessageSquare className="w-4 h-4" />,
  },
  {
    id: "vendas",
    label: "Vendas & Conversão",
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    id: "integracao",
    label: "Integrações",
    icon: <Link2 className="w-4 h-4" />,
  },
];

const ALL_FEATURES = [
  {
    category: "ia",
    icon: <Sparkles className="w-5 h-5" />,
    title: "NLP Avançado",
    desc: "Compreende linguagem natural, gírias e contexto regional. O agente interpreta intenções reais, não apenas palavras-chave — entregando respostas humanas e precisas.",
    highlight: true,
    badge: "Destaque",
    bullets: ["Interpretação contextual de mensagens", "Suporte a múltiplos dialetos", "Respostas naturais sem menus engessados"],
  },
  {
    category: "ia",
    icon: <Bot className="w-5 h-5" />,
    title: "Agente Personalizável",
    desc: "Defina personalidade, tom de voz e base de conhecimento. Catálogos, preços e regras viram contexto real para a IA atuar como um verdadeiro colaborador do seu negócio.",
    highlight: false,
    badge: null,
    bullets: ["Tom de voz configurável", "Base de conhecimento proprietária", "Regras de negócio como contexto"],
  },
  {
    category: "ia",
    icon: <Repeat className="w-5 h-5" />,
    title: "Aprendizado Contínuo",
    desc: "O agente melhora com cada interação. Novos produtos, preços e perguntas frequentes são absorvidos rapidamente para manter as respostas sempre atualizadas.",
    highlight: false,
    badge: null,
    bullets: ["Atualização fácil de catálogos", "FAQ que cresce com o uso", "Sem re-treinamento manual"],
  },
  {
    category: "atendimento",
    icon: <Clock className="w-5 h-5" />,
    title: "Atendimento 24/7",
    desc: "Nunca perca uma venda por estar offline. Seu agente qualifica leads, responde dúvidas e guia o cliente até o fechamento a qualquer hora — sem intervenção humana.",
    highlight: true,
    badge: "Popular",
    bullets: ["Disponibilidade total, sem pausas", "Zero custo de hora extra", "Leads qualificados mesmo de madrugada"],
  },
  {
    category: "atendimento",
    icon: <Users className="w-5 h-5" />,
    title: "Múltiplos Atendimentos Simultâneos",
    desc: "Atenda dezenas de clientes ao mesmo tempo sem filas de espera. O agente escala automaticamente conforme o volume de mensagens aumenta.",
    highlight: false,
    badge: null,
    bullets: ["Sem limite de conversas paralelas", "Resposta imediata para cada cliente", "Experiência consistente em escala"],
  },
  {
    category: "atendimento",
    icon: <MessageSquare className="w-5 h-5" />,
    title: "Histórico de Conversas",
    desc: "Acesse o histórico completo de cada conversa pelo painel. Monitore o desempenho do agente e identifique oportunidades de melhoria com facilidade.",
    highlight: false,
    badge: null,
    bullets: ["Histórico completo por contato", "Busca e filtros avançados", "Exportação de dados"],
  },
  {
    category: "vendas",
    icon: <TrendingUp className="w-5 h-5" />,
    title: "Foco em Conversão",
    desc: "Arquitetura desenhada para vender. O agente entende intenção de compra e conduz o fluxo de forma natural até o agendamento ou fechamento do negócio.",
    highlight: true,
    badge: "Destaque",
    bullets: ["Identificação de intenção de compra", "Fluxo guiado até o fechamento", "Scripts de vendas personalizáveis"],
  },
  {
    category: "vendas",
    icon: <BarChart2 className="w-5 h-5" />,
    title: "Métricas de Performance",
    desc: "Acompanhe taxas de conversão, volume de atendimentos e satisfação dos clientes em tempo real. Dados claros para decisões inteligentes.",
    highlight: false,
    badge: null,
    bullets: ["Dashboard em tempo real", "Taxa de conversão por período", "Relatórios exportáveis"],
  },
  {
    category: "vendas",
    icon: <Zap className="w-5 h-5" />,
    title: "Qualificação Automática de Leads",
    desc: "O agente coleta nome, interesse e dados relevantes de cada contato automaticamente. Leads qualificados chegam prontos para o time comercial fechar.",
    highlight: false,
    badge: null,
    bullets: ["Captura automática de dados", "Score de interesse do lead", "Integração com CRM (em breve)"],
  },
  {
    category: "integracao",
    icon: <Link2 className="w-5 h-5" />,
    title: "WhatsApp via Evolution API",
    desc: "Integração direta com seu número atual via Evolution API. Compatível com WhatsApp Business e pessoal — sem precisar trocar de número ou aparelho.",
    highlight: true,
    badge: "Popular",
    bullets: ["Mantém seu número atual", "Compatível com WA Business e pessoal", "Setup em menos de 5 minutos"],
  },
  {
    category: "integracao",
    icon: <Globe className="w-5 h-5" />,
    title: "Setup Instantâneo",
    desc: "Integre o Zelt ao seu número oficial e automatize suas vendas no mesmo dia. Sua operação passa a ser digital, resiliente e disponível em tempo integral.",
    highlight: false,
    badge: null,
    bullets: ["Guia passo a passo no painel", "Sem conhecimento técnico necessário", "Suporte via WhatsApp incluso"],
  },
  {
    category: "integracao",
    icon: <Lock className="w-5 h-5" />,
    title: "Segurança e Privacidade",
    desc: "Conversas criptografadas, dados armazenados com segurança e conformidade com a LGPD. Seus clientes e seu negócio estão protegidos.",
    highlight: false,
    badge: null,
    bullets: ["Criptografia de ponta a ponta", "Conformidade com LGPD", "Dados nunca vendidos a terceiros"],
  },
];

// ─── HERO SECTION ─────────────────────────────────────────────────────────────

function PageHero() {
  return (
    <section className="relative pt-40 pb-24 px-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-green-500/8 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 1)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e\")" }} />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
          Tudo que o Zelt.AI pode fazer por você
        </span>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[1.05] tracking-tight">
          Recursos pensados para{" "}
          <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-lime-300 bg-clip-text text-transparent">
            quem quer vender mais
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Conheça cada funcionalidade do Zelt.AI e entenda como cada uma foi criada para automatizar, qualificar e converter mais clientes via WhatsApp.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="#pricing" className="w-full sm:w-auto bg-green-500 hover:bg-green-400 text-black font-semibold rounded-xl px-7 py-3.5 text-sm transition-all hover:shadow-lg hover:shadow-green-500/30 active:scale-95 flex items-center justify-center gap-2">
            Começar agora <ArrowRight className="w-4 h-4" />
          </a>
          <a href="#features-grid" className="w-full sm:w-auto flex items-center justify-center gap-2 text-zinc-300 hover:text-white border border-white/10 hover:border-white/20 rounded-xl px-7 py-3.5 text-sm transition-all active:scale-95">
            Explorar recursos
          </a>
        </div>

        {/* Stats strip */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {[["12+", "Funcionalidades"], ["24/7", "Disponível"], ["~2h", "Setup completo"]].map(([val, label]) => (
            <div key={label} className="flex flex-col items-center group cursor-default">
              <span className="text-2xl sm:text-3xl font-bold text-white group-hover:text-green-400 transition-colors">{val}</span>
              <span className="mt-1 text-xs text-zinc-500">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FEATURES GRID ────────────────────────────────────────────────────────────

function FeaturesGrid() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = activeCategory === "all"
    ? ALL_FEATURES
    : ALL_FEATURES.filter((f) => f.category === activeCategory);

  return (
    <section id="features-grid" className="py-16 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          <button
            onClick={() => setActiveCategory("all")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${activeCategory === "all" ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-white/[0.03] text-zinc-400 hover:text-white border border-white/5 hover:border-white/10"}`}
          >
            Todos
          </button>
          {FEATURE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${activeCategory === cat.id ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-white/[0.03] text-zinc-400 hover:text-white border border-white/5 hover:border-white/10"}`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature }) {
  return (
    <div className={`group relative flex flex-col rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-0.5 ${feature.highlight ? "bg-zinc-900/80 border-green-500/20 hover:border-green-500/40 shadow-lg shadow-green-500/5" : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10"}`}>
      {/* Badge */}
      {feature.badge && (
        <span className="absolute top-4 right-4 text-[10px] font-bold bg-green-500/15 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
          {feature.badge}
        </span>
      )}

      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors ${feature.highlight ? "bg-green-500/20 text-green-400 group-hover:bg-green-500/30" : "bg-white/5 text-zinc-400 group-hover:bg-white/10 group-hover:text-green-400"}`}>
        {feature.icon}
      </div>

      {/* Text */}
      <h3 className="text-sm font-semibold text-white mb-2">{feature.title}</h3>
      <p className="text-sm text-zinc-500 leading-relaxed mb-5 flex-1">{feature.desc}</p>

      {/* Bullets */}
      <ul className="space-y-2 border-t border-white/5 pt-4">
        {feature.bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-xs text-zinc-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500/70 mt-0.5 flex-shrink-0" />
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── COMPARISON / HIGHLIGHT SECTION ───────────────────────────────────────────

function ComparisonSection() {
  const rows = [
    { label: "Disponibilidade", zelt: "24h / 7 dias", traditional: "Horário comercial" },
    { label: "Atendimentos simultâneos", zelt: "Ilimitados", traditional: "1 por atendente" },
    { label: "Qualificação de leads", zelt: "Automática", traditional: "Manual" },
    { label: "Custo mensal", zelt: "A partir de R$ 79,90", traditional: "R$ 2.000+ (salário)" },
    { label: "Tempo de setup", zelt: "~2 horas", traditional: "Semanas de treinamento" },
    { label: "Escalabilidade", zelt: "Instantânea", traditional: "Contratar + treinar" },
  ];

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="max-w-4xl mx-auto relative">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-3">Comparativo</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Zelt.AI vs. Atendimento tradicional</h2>
          <p className="mt-4 text-zinc-400">Veja por que cada vez mais PMEs estão migrando para o atendimento inteligente.</p>
        </div>

        <div className="rounded-2xl border border-white/8 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-3 bg-white/[0.04] border-b border-white/8">
            <div className="px-5 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Critério</div>
            <div className="px-5 py-3.5 text-xs font-semibold text-green-400 uppercase tracking-wider flex items-center gap-1.5">
              <img src="/logo1.png" className="w-4 h-4 object-contain" alt="" /> Zelt.AI
            </div>
            <div className="px-5 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Tradicional</div>
          </div>

          {/* Rows */}
          {rows.map((row, i) => (
            <div key={row.label} className={`grid grid-cols-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? "" : "bg-white/[0.01]"}`}>
              <div className="px-5 py-4 text-sm text-zinc-400">{row.label}</div>
              <div className="px-5 py-4 text-sm font-medium text-green-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                {row.zelt}
              </div>
              <div className="px-5 py-4 text-sm text-zinc-500">{row.traditional}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── DEEP DIVE FEATURE SPOTLIGHT ──────────────────────────────────────────────

const SPOTLIGHTS = [
  {
    tag: "IA Avançada",
    title: "Um agente que fala\ncomo o seu negócio",
    desc: "Esqueça respostas genéricas. O Zelt.AI é treinado com seu catálogo, suas regras e sua linguagem. Ele representa sua marca com precisão — e aprende com cada conversa.",
    points: ["Personalidade e tom de voz definidos por você", "Base de conhecimento atualizada em tempo real", "Contexto de negócio sempre presente nas respostas"],
    visual: "ia",
  },
  {
    tag: "Conversão",
    title: "Cada mensagem pode\nser uma venda",
    desc: "O agente identifica intenção de compra e guia o cliente naturalmente até o fechamento. Sem menus confusos, sem perda de contexto — só resultados.",
    points: ["Detecção automática de interesse de compra", "Fluxo de venda guiado e personalizado", "Métricas de conversão em tempo real no painel"],
    visual: "conversao",
  },
];

function SpotlightSection() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto space-y-20">
        {SPOTLIGHTS.map((s, i) => (
          <div key={s.tag} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${i % 2 !== 0 ? "lg:flex-row-reverse" : ""}`}>
            {/* Text side */}
            <div className={i % 2 !== 0 ? "lg:order-2" : ""}>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400 mb-5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                {s.tag}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white whitespace-pre-line leading-tight mb-5">{s.title}</h2>
              <p className="text-zinc-400 leading-relaxed mb-8">{s.desc}</p>
              <ul className="space-y-3">
                {s.points.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-sm text-zinc-300">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                    </div>
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual side */}
            <div className={`relative ${i % 2 !== 0 ? "lg:order-1" : ""}`}>
              {s.visual === "ia" ? <IaVisual /> : <ConversaoVisual />}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function IaVisual() {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-green-500/10 blur-3xl rounded-3xl" />
      <div className="relative bg-zinc-900/60 border border-white/8 rounded-2xl p-5 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/5">
          <img src="/logo1.png" className="w-7 h-7 object-contain" alt="" />
          <div>
            <p className="text-xs font-semibold text-white">Agente Zelt</p>
            <p className="text-[10px] text-green-400">Boutique Carla M. · online</p>
          </div>
        </div>
        <div className="space-y-3 text-xs">
          {[
            { side: "left", msg: "Oi, vi que vocês têm vestidos. Tem algo pra casamento?" },
            { side: "right", msg: "Oi! Sim 😊 Temos lindas opções para madrinhas e convidadas. Prefere algo mais longo ou midi?" },
            { side: "left", msg: "Midi, bem elegante. Orçamento até 400." },
            { side: "right", msg: "Perfeito! Tenho 3 modelos midi entre R$ 280 e R$ 390. Posso te mandar as fotos agora?" },
          ].map((m, i) => (
            <div key={i} className={`flex ${m.side === "left" ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${m.side === "left" ? "bg-white/5 text-zinc-300 rounded-tl-sm" : "bg-green-500/20 text-green-100 rounded-tr-sm"}`}>
                {m.msg}
              </div>
            </div>
          ))}
          <div className="flex justify-start">
            <div className="bg-white/5 rounded-2xl rounded-tl-sm px-4 py-2.5 flex gap-1 items-center">
              {[0, 1, 2].map((j) => <span key={j} className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: `${j * 0.15}s` }} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConversaoVisual() {
  const metrics = [
    { label: "Taxa de resposta", value: "98%", color: "text-green-400" },
    { label: "Leads qualificados", value: "+340", color: "text-emerald-400" },
    { label: "Conversões este mês", value: "87", color: "text-lime-400" },
  ];

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-emerald-500/8 blur-3xl rounded-3xl" />
      <div className="relative bg-zinc-900/60 border border-white/8 rounded-2xl p-6 backdrop-blur-sm space-y-4">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Performance — Últimos 30 dias</p>
        {metrics.map((m) => (
          <div key={m.label} className="flex items-center justify-between bg-white/[0.03] rounded-xl px-4 py-3 border border-white/5">
            <span className="text-sm text-zinc-400">{m.label}</span>
            <span className={`text-xl font-bold ${m.color}`}>{m.value}</span>
          </div>
        ))}
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-300 font-medium">+3× mais conversões vs. atendimento manual</span>
        </div>
      </div>
    </div>
  );
}

// ─── CTA SECTION ──────────────────────────────────────────────────────────────

function CTA() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-3xl blur-2xl" />
        <div className="relative border border-white/10 rounded-3xl p-12 text-center bg-white/[0.03] backdrop-blur-sm">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Pronto para colocar todos<br />esses recursos para trabalhar?
          </h2>
          <p className="text-zinc-400 max-w-lg mx-auto mb-8">
            3 dias grátis, sem cartão de crédito. Configure seu agente hoje e veja a diferença nas primeiras 48 horas.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button className="w-full sm:w-auto bg-green-500 hover:bg-green-400 text-black font-semibold rounded-xl px-8 py-4 text-sm transition-all hover:shadow-lg hover:shadow-green-500/25 active:scale-[0.98]">
              Começar grátis agora →
            </button>
            <a href="#" className="w-full sm:w-auto text-zinc-400 hover:text-white text-sm transition-colors">
              Ver planos e preços
            </a>
          </div>
          <p className="mt-4 text-xs text-zinc-500">3 dias grátis · Sem cartão de crédito · Setup em 2 horas</p>
        </div>
      </div>
    </section>
  );
}

// ─── PAGE ROOT ────────────────────────────────────────────────────────────────

export default function RecursosPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] font-sans antialiased">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'); * { font-family: 'Inter', system-ui, sans-serif; }`}</style>
      <Navbar />
      <PageHero />
      <FeaturesGrid />
      <ComparisonSection />
      <SpotlightSection />
      <CTA />
      <Footer />
    </div>
  );
}
