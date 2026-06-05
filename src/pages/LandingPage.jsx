import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";

const NAV_LINKS = ["Produto", "Funcionalidades", "Preços", "Integrações"];

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
      </svg>
    ),
    title: "Agente de IA Personalizável",
    desc: "Defina a personalidade, tom de voz e base de conhecimento do seu agente. Catálogos, preços e regras de negócio viram contexto real para a IA.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Atendimento 24/7",
    desc: "Nunca perca uma venda por estar offline. O Zelt qualifica leads, responde dúvidas e guia o cliente até o fechamento — sem intervenção humana.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Foco em Conversão",
    desc: "Arquitetura desenhada para vender. O agente entende intenção de compra e conduz o fluxo de forma natural até o agendamento ou fechamento.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
    title: "Setup Instantâneo",
    desc: "Integre o Zelt ao seu número oficial e automatize suas vendas. Esqueça a instabilidade: sua operação passa a ser digital, resiliente e disponível em tempo integral.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    title: "Acessível para PMEs",
    desc: "Tecnologia de grande porte por R$ 169,99/mês. Pequenos e médios negócios agora podem competir com o atendimento das grandes corporações.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.169 1.169 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.169 2.25 6.741v6.018z" />
      </svg>
    ),
    title: "NLP Avançado",
    desc: "Sem menus engessados. O agente compreende linguagem natural, dialetos e contexto — entregando uma experiência realmente humana.",
  },
];

const STEPS = [
  { num: "01", title: "Crie sua conta", desc: "Cadastro simples em menos de 2 minutos. Sem cartão de crédito para começar." },
  { num: "02", title: "Configure o Agente", desc: "Insira catálogo, preços, horários e defina a personalidade do seu colaborador digital." },
  { num: "03", title: "Conecte ao WhatsApp", desc: "Integração direta com seu número via API oficial. Sem complicação técnica." },
  { num: "04", title: "Comece a vender", desc: "Seu agente entra em operação 24/7, qualificando leads e fechando vendas automaticamente." },
];

const TESTIMONIALS = [
  {
    name: "Carla Mendes",
    role: "Proprietária, Boutique Carla M.",
    avatar: "CM",
    color: "bg-violet-500",
    text: "Antes eu perdia vendas fora do horário comercial. Com o Zelt, as dúvidas dos clientes são respondidas na hora, mesmo de madrugada. O retorno foi imediato.",
  },
  {
    name: "Rafael Torres",
    role: "Gestor, Auto Center Torres",
    avatar: "RT",
    color: "bg-emerald-500",
    text: "O robô responde todas as dúvidas sobre nossos serviços perfeitamente, sem parecer uma máquina. Tirou um peso gigante das minhas costas no dia a dia.",
  },
  {
    name: "Juliana Pires",
    role: "Fundadora, Clínica Estética JP",
    avatar: "JP",
    color: "bg-amber-500",
    text: "Alimentamos o Zelt com os nossos horários e preços, e ele começou a atender no mesmo dia. A facilidade de treinar a IA com as regras do nosso negócio é incrível.",
  },
];

const FAQS = [
  { q: "Preciso ter conhecimento técnico para configurar?", a: "Não. A plataforma foi desenvolvida para que qualquer empreendedor configure seu agente de forma intuitiva, sem código." },
  { q: "O Zelt funciona com qualquer número de WhatsApp?", a: "Sim. Integramos via Evolution API. Você mantém seu número atual independentemente do tipo de whatsapp que você usa." },
  { q: "Quanto tempo leva para ver resultados?", a: "A maioria dos clientes já relata impacto nas primeiras 48h após ativação — mais leads qualificados e menos tempo gasto em atendimento manual." },
  { q: "Posso cancelar a qualquer momento?", a: "Sim. Sem fidelidade. Você cancela quando quiser, sem multa ou burocracia." },
];

function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
      <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
      {children}
    </span>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16 overflow-hidden bg-black">
      {/* Background glow com animação de pulso lenta */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-green-500/10 blur-[120px] animate-[pulse_8s_infinite]" />
        <div className="absolute bottom-0 right-1/4 w-75 h-75 rounded-full bg-emerald-600/8 blur-[80px] animate-[pulse_10s_infinite]" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:"url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 1)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e\")"}} />

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Badge com entrada suave */}
        <div className="animate-[fadeIn_1s_ease-out]">
          <Badge>Colaborador digital para o seu negócio</Badge>
        </div>

        <h1 className="mt-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[0.95] tracking-tight animate-[slideUp_0.8s_ease-out]">
          Transforme mensagens
          <br />
          em{" "}
          <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-lime-300 bg-clip-text text-transparent">
            clientes todos os dias
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed animate-[fadeIn_1.2s_ease-out]">
          O Zelt.AI é o agente de inteligência artificial que atende, qualifica e converte clientes via WhatsApp. 24 horas por dia, 7 dias por semana.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 animate-[fadeIn_1.5s_ease-out]">
          <a href="/register" className="w-full sm:w-auto bg-green-500 hover:bg-green-400 text-black font-semibold rounded-xl px-7 py-3.5 text-sm transition-all hover:shadow-lg hover:shadow-green-500/40 active:scale-95 text-center block">
            Começar com 3 dias gratuitos!
          </a>
          <a href="#pricing" className="w-full sm:w-auto flex items-center justify-center gap-2 text-zinc-300 hover:text-white border border-white/10 hover:border-white/20 rounded-xl px-7 py-3.5 text-sm transition-all active:scale-95">
            Ver planos
          </a>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto opacity-0 animate-[fadeIn_2s_ease-out_forwards]">
          {[["100%", "Satisfação"], ["24/7", "Disponível"], ["+3x", "Mais conversões"]].map(([val, label]) => (
            <div key={label} className="flex flex-col items-center group cursor-default">
              <span className="text-2xl sm:text-3xl font-bold text-white group-hover:text-green-400 transition-colors">{val}</span>
              <span className="mt-1 text-xs text-zinc-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* WhatsApp mockup com flutuação suave */}
      <div className="relative mt-16 max-w-sm mx-auto w-full animate-[float_6s_infinite_ease-in-out]">
        <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-3xl" />
        <div className="relative bg-zinc-900/80 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
            <img src="/logo1.png" className="w-8" />
            <div>
              <p className="text-sm font-medium text-white">Zelt.AI</p>
              <p className="text-xs text-green-400 flex items-center gap-1">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                online
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="animate-[slideInLeft_0.5s_ease-out_forwards]">
              <ChatBubble side="left" text="Olá! 👋 Bem-vindo à Boutique Carla M. Posso te ajudar?" />
            </div>
            <div className="opacity-0 animate-[slideInRight_0.5s_ease-out_1s_forwards]">
              <ChatBubble side="right" text="Oi! Quero um vestido para formatura." />
            </div>
            <div className="opacity-0 animate-[slideInLeft_0.5s_ease-out_2s_forwards]">
              <ChatBubble side="left" text="Perfeito! Qual o seu tamanho?" />
            </div>
            <div className="opacity-0 animate-[slideInRight_0.5s_ease-out_1s_forwards]">
              <ChatBubble side="right" text="Eu uso Tamanho M!" />
            </div>
            <div className="opacity-0 animate-[slideInLeft_0.5s_ease-out_2s_forwards]">
              <ChatBubble side="left" text="Certo, vou verificar o estoque rapidinho." />
            </div>
            <div className="pt-2">
              <TypingIndicator />
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations (Adicione isso no seu tailwind.config.js ou no seu CSS global) */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}

function ChatBubble({ side, text }) {
  return (
    <div className={`flex ${side === "right" ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${side === "right" ? "bg-green-500/20 text-green-100 rounded-tr-sm" : "bg-white/5 text-zinc-300 rounded-tl-sm"}`}>
        {text}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white/5 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
        {[0, 1, 2].map((i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

function Features() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-3">Funcionalidades</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Mais do que um chatbot.<br />Um colaborador digital.</h2>
          <p className="mt-4 text-zinc-400 max-w-xl mx-auto">O Zelt entende contexto, aprende com seu negócio e age com a precisão que seus clientes merecem.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                {f.icon}
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full bg-emerald-600/5 blur-[100px]" />
      </div>
      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-3">Como funciona</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Do cadastro à primeira venda<br />em menos de 2 horas</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, i) => (
            <div key={s.num} className="relative">
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(100%_-_12px)] w-full h-px border-t border-dashed border-white/10 z-10" />
              )}
              <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
                <span className="text-3xl font-bold text-white/10">{s.num}</span>
                <h3 className="mt-3 text-sm font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-zinc-500 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-3">Depoimentos</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Negócios que já vendem<br />enquanto dormem</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 flex flex-col gap-5">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed flex-1">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-xs font-bold text-white`}>{t.avatar}</div>
                <div>
                  <p className="text-sm font-medium text-white">{t.name}</p>
                  <p className="text-xs text-zinc-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const PLANS = [
  {
    id: "trial",
    name: "Trial",
    price: "0",
    cents: ",00",
    for: "Teste grátis por 3 dias",
    highlight: false,
    badge: "Grátis",
    features: [
      "1 Agente de IA",
      "1.000 execuções/mês",
      "1 GB de armazenamento",
      "Integração WhatsApp",
      "Atendimento 24/7",
      "Suporte por e-mail",
    ],
    cta: "Começar grátis",
    href: "/register",
  },
  {
    id: "basic",
    name: "Basic",
    price: "69",
    cents: ",99",
    for: "Pequenos negócios",
    highlight: true,
    badge: "Mais popular",
    features: [
      "3 Agentes de IA",
      "10.000 execuções/mês",
      "5 GB de armazenamento",
      "WhatsApp + Web integrados",
      "Suporte prioritário",
      "Relatórios semanais",
    ],
    cta: "Assinar agora",
    href: "/register",
  },
];

function CheckIcon() {
  return (
    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
      <svg className="w-3 h-3 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    </div>
  );
}

function Pricing() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-3">Preços</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">O plano certo para cada negócio</h2>
          <p className="text-zinc-400">Sem fidelidade. Cancele quando quiser.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-stretch justify-center">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`relative flex flex-col rounded-3xl p-8 transition-all ${
              plan.highlight
                ? "bg-zinc-900 border border-green-500/40 shadow-xl shadow-green-500/10"
                : "bg-white/[0.03] border border-white/5"
            }`}>
              {plan.highlight && (
                <div className="absolute -inset-px rounded-3xl pointer-events-none border border-green-500/20" />
              )}

              {plan.badge && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 bg-green-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-black/30" />
                  {plan.badge}
                </span>
              )}

              <div className="mb-6">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1">Zelt {plan.name}</p>
                <div className="flex items-baseline gap-0.5 mt-3">
                  <span className="text-zinc-400 text-base">R$</span>
                  <span className="text-5xl font-bold text-white mx-1">{plan.price}</span>
                  <span className="text-zinc-400 text-xl">{plan.cents}</span>
                  <span className="text-zinc-600 text-sm ml-1">/mês</span>
                </div>
                <p className="mt-2 text-sm text-zinc-500">{plan.for}</p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-zinc-300">
                    <CheckIcon />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href={plan.href}
                className={`w-full font-semibold rounded-xl py-3.5 text-sm transition-all active:scale-[0.98] text-center block ${
                  plan.highlight
                    ? "bg-green-500 hover:bg-green-400 text-black hover:shadow-lg hover:shadow-green-500/20"
                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-zinc-600 mt-8">Todos os planos incluem 3 dias grátis · Sem cartão de crédito para começar</p>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <section className="py-24 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-3">Dúvidas frequentes</p>
          <h2 className="text-3xl font-bold text-white">Respostas diretas</h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className={`border rounded-xl overflow-hidden transition-colors ${open === i ? "border-white/10 bg-white/[0.05]" : "border-white/5 bg-white/[0.02]"}`}>
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                <span className="text-sm font-medium text-white">{faq.q}</span>
                <svg className={`w-4 h-4 text-zinc-500 flex-shrink-0 ml-4 transition-transform ${open === i ? "rotate-45" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
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

function CTA() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-3xl blur-2xl" />
        <div className="relative border border-white/10 rounded-3xl p-12 text-center bg-white/[0.03] backdrop-blur-sm">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Seu negócio merece um<br />colaborador que nunca para.
          </h2>
          <p className="text-zinc-400 max-w-lg mx-auto mb-8">
            Junte-se às empresas que já automatizaram seu atendimento e multiplicaram suas conversões com o Zelt.AI.
          </p>
          <a href="/register" className="inline-block bg-green-500 hover:bg-green-400 text-black font-semibold rounded-xl px-8 py-4 text-sm transition-all hover:shadow-lg hover:shadow-green-500/25 active:scale-[0.98]">
            Começar por R$ 69,99/mês →
          </a>
          <p className="mt-4 text-xs text-zinc-300">3 dias grátis · Sem cartão de crédito · Setup em 2 horas</p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src="/logo1.png" className="w-8" />
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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] font-sans antialiased">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); * { font-family: 'Inter', system-ui, sans-serif; }`}</style>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
