import { useState, useEffect, useRef } from "react";
import {
  MessageCircle, Instagram, Mail, ArrowRight, CheckCircle2,
  Send, Loader2, Sparkles, Clock, Zap, HeadphonesIcon
} from "lucide-react";
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

// ─── CONTACT CHANNELS ─────────────────────────────────────────────────────────

const CHANNELS = [
  {
    id: "whatsapp",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
    label: "WhatsApp",
    sublabel: "Atendido pelo Zelt.AI · Resposta imediata",
    value: "+55 87 99656-0568",
    href: "https://wa.me/5587996560568",
    color: "from-green-500/20 to-emerald-600/10",
    border: "border-green-500/20 hover:border-green-500/40",
    iconBg: "bg-green-500/15 text-green-400",
    badge: "Mais rápido",
    badgeColor: "bg-green-500/20 text-green-400 border-green-500/30",
    cta: "Chamar no WhatsApp",
    ctaStyle: "bg-green-500 hover:bg-green-400 text-black",
  },
  {
    id: "instagram",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
    label: "Instagram",
    sublabel: "Acompanhe novidades e bastidores",
    value: "@urbansoft.ofc",
    href: "https://instagram.com/urbansoft.ofc",
    color: "from-pink-500/15 to-purple-600/10",
    border: "border-pink-500/15 hover:border-pink-500/30",
    iconBg: "bg-gradient-to-br from-pink-500/20 to-purple-500/20 text-pink-400",
    badge: null,
    badgeColor: "",
    cta: "Seguir no Instagram",
    ctaStyle: "bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20",
  },
  {
    id: "email",
    icon: <Mail className="w-6 h-6" />,
    label: "E-mail",
    sublabel: "Para parcerias, imprensa e assuntos formais",
    value: "contato@zelt.ai",
    href: "mailto:contato@zelt.ai",
    color: "from-blue-500/15 to-indigo-600/10",
    border: "border-blue-500/15 hover:border-blue-500/30",
    iconBg: "bg-blue-500/15 text-blue-400",
    badge: null,
    badgeColor: "",
    cta: "Enviar e-mail",
    ctaStyle: "bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20",
  },
];

// ─── HERO ─────────────────────────────────────────────────────────────────────

function PageHero() {
  return (
    <section className="relative pt-40 pb-20 px-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-green-500/8 blur-[130px]" />
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] rounded-full bg-blue-500/5 blur-[80px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 1)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e\")" }} />
      </div>

      <div className="relative max-w-3xl mx-auto text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400 mb-7">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
          Estamos aqui para ajudar
        </span>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[1.05] tracking-tight">
          Fale com a gente,{" "}
          <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-lime-300 bg-clip-text text-transparent">
            quando quiser
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Tem dúvidas, quer uma demonstração ou só curiosidade? Escolha o canal que preferir — nossa equipe (e o Zelt.AI) estão prontos pra você.
        </p>

        <div className="mt-10 grid grid-cols-3 gap-6 max-w-sm mx-auto">
          {[
            { icon: <Zap className="w-4 h-4" />, label: "Resposta imediata" },
            { icon: <Clock className="w-4 h-4" />, label: "Suporte 24/7" },
            { icon: <HeadphonesIcon className="w-4 h-4" />, label: "Atendimento real" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center">{item.icon}</div>
              <span className="text-xs text-zinc-500 text-center leading-tight">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CHANNEL CARDS ────────────────────────────────────────────────────────────

function ChannelCards() {
  return (
    <section className="py-6 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
        {CHANNELS.map((ch) => (
          <div
            key={ch.id}
            className={`group relative flex flex-col rounded-2xl p-6 border bg-gradient-to-b ${ch.color} ${ch.border} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30`}
          >
            {ch.badge && (
              <span className={`absolute top-4 right-4 text-[10px] font-bold border px-2 py-0.5 rounded-full uppercase tracking-wider ${ch.badgeColor}`}>
                {ch.badge}
              </span>
            )}

            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 duration-300 ${ch.iconBg}`}>
              {ch.icon}
            </div>

            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1">{ch.label}</p>
            <h3 className="text-base font-bold text-white mb-1">{ch.value}</h3>
            <p className="text-xs text-zinc-500 leading-relaxed mb-6 flex-1">{ch.sublabel}</p>

            <a
              href={ch.href}
              target={ch.id !== "email" ? "_blank" : undefined}
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 ${ch.ctaStyle}`}
            >
              {ch.cta}
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── CONTACT FORM ─────────────────────────────────────────────────────────────

const SUBJECTS = [
  "Quero fazer uma demonstração",
  "Tenho dúvidas sobre os planos",
  "Preciso de suporte técnico",
  "Interesse em parceria",
  "Imprensa / Press kit",
  "Outro assunto",
];

function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [touched, setTouched] = useState({});

  const validate = (data) => {
    const e = {};
    if (!data.name.trim()) e.name = "Seu nome é obrigatório.";
    if (!data.email.trim()) e.email = "Informe seu e-mail.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = "E-mail inválido.";
    if (!data.subject) e.subject = "Escolha um assunto.";
    if (!data.message.trim()) e.message = "Escreva sua mensagem.";
    else if (data.message.trim().length < 20) e.message = "Mensagem muito curta (mín. 20 caracteres).";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const errs = validate({ ...form, [name]: value });
      setErrors((prev) => ({ ...prev, [name]: errs[name] }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errs = validate(form);
    setErrors((prev) => ({ ...prev, [name]: errs[name] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = { name: true, email: true, subject: true, message: true };
    setTouched(allTouched);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus("sending");
    await new Promise((r) => setTimeout(r, 1800));
    setStatus("success");
  };

  const inputBase =
    "w-full bg-white/[0.04] border rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 transition-all duration-200 outline-none focus:bg-white/[0.07]";
  const inputNormal = `${inputBase} border-white/8 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/10`;
  const inputError = `${inputBase} border-red-500/40 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/10`;

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-500/20 flex items-center justify-center mb-5 animate-in zoom-in-50 duration-300">
          <CheckCircle2 className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Mensagem enviada!</h3>
        <p className="text-zinc-400 text-sm max-w-xs leading-relaxed mb-8">
          Recebemos sua mensagem e vamos responder em breve. Se for urgente, chame no WhatsApp!
        </p>
        <a
          href="https://wa.me/5587996560568"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold text-sm px-6 py-3 rounded-xl transition-all active:scale-95"
        >
          <MessageCircle className="w-4 h-4" />
          Chamar no WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Nome completo <span className="text-green-500">*</span></label>
          <input
            name="name" value={form.name} onChange={handleChange} onBlur={handleBlur}
            placeholder="Rafael Torres"
            className={errors.name ? inputError : inputNormal}
          />
          {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">E-mail <span className="text-green-500">*</span></label>
          <input
            name="email" type="email" value={form.email} onChange={handleChange} onBlur={handleBlur}
            placeholder="rafael@empresa.com"
            className={errors.email ? inputError : inputNormal}
          />
          {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">WhatsApp <span className="text-zinc-600">(opcional)</span></label>
          <input
            name="phone" value={form.phone} onChange={handleChange}
            placeholder="(87) 9 9999-9999"
            className={inputNormal}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Assunto <span className="text-green-500">*</span></label>
          <select
            name="subject" value={form.subject} onChange={handleChange} onBlur={handleBlur}
            className={`${errors.subject ? inputError : inputNormal} appearance-none cursor-pointer`}
          >
            <option value="" disabled className="bg-zinc-900 text-zinc-500">Selecione um assunto…</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s} className="bg-zinc-900 text-white">{s}</option>
            ))}
          </select>
          {errors.subject && <p className="mt-1.5 text-xs text-red-400">{errors.subject}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Mensagem <span className="text-green-500">*</span></label>
        <textarea
          name="message" value={form.message} onChange={handleChange} onBlur={handleBlur}
          rows={5}
          placeholder="Olá! Gostaria de saber mais sobre o Zelt.AI para o meu negócio..."
          className={`${errors.message ? inputError : inputNormal} resize-none`}
        />
        <div className="flex items-start justify-between mt-1.5">
          {errors.message ? (
            <p className="text-xs text-red-400">{errors.message}</p>
          ) : (
            <span />
          )}
          <span className={`text-xs ml-auto ${form.message.length < 20 && form.message.length > 0 ? "text-amber-500" : "text-zinc-600"}`}>
            {form.message.length}/500
          </span>
        </div>
      </div>

      <div className="pt-1">
        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 disabled:bg-green-500/40 disabled:cursor-not-allowed text-black font-semibold rounded-xl py-3.5 text-sm transition-all hover:shadow-lg hover:shadow-green-500/20 active:scale-[0.98]"
        >
          {status === "sending" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enviando mensagem…
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Enviar mensagem
            </>
          )}
        </button>
        <p className="text-center text-xs text-zinc-600 mt-3">Respondemos em até 24h · Sem spam, prometemos</p>
      </div>
    </form>
  );
}

// ─── MAIN CONTACT SECTION ─────────────────────────────────────────────────────

function ContactSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">

          {/* LEFT: Info panel */}
          <div className="lg:col-span-2 space-y-7">
            <div>
              <p className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-3">Formulário de contato</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                Prefere escrever<br />para a gente?
              </h2>
              <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                Preencha o formulário e receba uma resposta personalizada em até 24h. Para urgências, prefira o WhatsApp.
              </p>
            </div>

            {/* Info tiles */}
            <div className="space-y-3">
              {[
                {
                  icon: <MessageCircle className="w-4 h-4 text-green-400" />,
                  title: "WhatsApp",
                  sub: "+55 87 99656-0568",
                  note: "Atendido pelo Zelt.AI · 24/7",
                  href: "https://wa.me/5587996560568",
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-pink-400">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  ),
                  title: "Instagram",
                  sub: "@urbansoft.ofc",
                  note: "Novidades e bastidores",
                  href: "https://instagram.com/urbansoft.ofc",
                },
                {
                  icon: <Mail className="w-4 h-4 text-blue-400" />,
                  title: "E-mail",
                  sub: "contato@zelt.ai",
                  note: "Para assuntos formais",
                  href: "mailto:contato@zelt.ai",
                },
              ].map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-xl px-4 py-3.5 transition-all duration-200 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-500">{item.title}</p>
                    <p className="text-sm font-medium text-white truncate">{item.sub}</p>
                    <p className="text-xs text-zinc-600 truncate">{item.note}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
                </a>
              ))}
            </div>

            {/* Zelt.AI note */}
            <div className="relative overflow-hidden rounded-xl border border-green-500/15 bg-green-500/5 p-4">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl" />
              <div className="relative flex items-start gap-3">
                <img src="/logo1.png" className="w-8 h-8 object-contain flex-shrink-0 mt-0.5" alt="Zelt.AI" />
                <div>
                  <p className="text-xs font-semibold text-green-400 mb-0.5 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                    Zelt.AI online
                  </p>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    O WhatsApp é atendido pelo nosso próprio agente de IA. Perfeito para ver o Zelt em ação antes de contratar!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Form card */}
          <div className="lg:col-span-3">
            <div className="relative rounded-2xl border border-white/8 bg-white/[0.03] p-7 sm:p-8 backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-6 pb-5 border-b border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Enviar mensagem</p>
                    <p className="text-xs text-zinc-500">Resposta em até 24 horas</p>
                  </div>
                </div>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FAQ STRIP ────────────────────────────────────────────────────────────────

const FAQS = [
  { q: "Quanto tempo leva para receber uma resposta?", a: "Via WhatsApp, a resposta é imediata graças ao Zelt.AI. Por e-mail ou formulário, respondemos em até 24 horas úteis." },
  { q: "Posso pedir uma demonstração gratuita?", a: "Claro! Manda uma mensagem no WhatsApp ou preencha o formulário selecionando 'Quero uma demonstração'. É gratuito, sem compromisso." },
  { q: "Vocês atendem empresas de qualquer segmento?", a: "Sim! O Zelt.AI já atende boutiques, clínicas, auto centers, salões, restaurantes e muito mais. Se seu negócio recebe mensagens, o Zelt pode ajudar." },
];

function FaqStrip() {
  const [open, setOpen] = useState(null);

  return (
    <section className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-2">Antes de escrever</p>
          <h2 className="text-2xl font-bold text-white">Perguntas frequentes</h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className={`border rounded-xl overflow-hidden transition-colors ${open === i ? "border-white/10 bg-white/[0.05]" : "border-white/5 bg-white/[0.02]"}`}>
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                <span className="text-sm font-medium text-white">{faq.q}</span>
                <svg className={`w-4 h-4 text-zinc-500 flex-shrink-0 ml-4 transition-transform duration-200 ${open === i ? "rotate-45" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
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

// ─── CTA FINAL ────────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-10 sm:p-14 text-center backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-emerald-600/10 pointer-events-none" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-green-500/15 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
              <img src="/logo1.png" className="w-8 h-8 object-contain" alt="Zelt.AI" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Quer ver o Zelt.AI em ação<br className="hidden sm:block" /> agora mesmo?
            </h2>
            <p className="text-zinc-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
              Manda um "oi" no WhatsApp e você já vai estar conversando com o Zelt.AI de verdade — o mesmo que vai trabalhar para o seu negócio.
            </p>
            <a
              href="https://wa.me/5587996560568"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl px-8 py-4 text-sm transition-all hover:shadow-lg hover:shadow-green-500/25 active:scale-[0.98]"
            >
              <MessageCircle className="w-4 h-4" />
              Testar o Zelt.AI agora
            </a>
            <p className="mt-4 text-xs text-zinc-600">Grátis, sem cadastro, sem compromisso</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── PAGE ROOT ────────────────────────────────────────────────────────────────

export default function ContatoPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] font-sans antialiased">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'); * { font-family: 'Inter', system-ui, sans-serif; }`}</style>
      <Navbar />
      <PageHero />
      <ChannelCards />
      <ContactSection />
      <FaqStrip />
      <FinalCTA />
      <Footer />
    </div>
  );
}
