import React, { useState } from 'react';
import { TbMail, TbPhone, TbMapPin, TbSend, TbClock } from 'react-icons/tb';
import HeaderZelt from '../components/Header';
import FooterSection from '../components/Footer';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <HeaderZelt />

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-normal tracking-tight text-[#111111] sm:text-5xl lg:text-6xl leading-[1.1]">
              Fale <span className="text-gray-400">conosco</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 font-normal leading-relaxed max-w-2xl">
              Tem dúvidas sobre nossos planos, integrações ou quer uma demonstração personalizada? Nossa equipe está pronta para ajudar.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="mx-auto max-w-7xl py-16">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-5">

            <div className="lg:col-span-2">
              <h2 className="text-lg font-medium text-[#111111] tracking-tight mb-8">Informações de contato</h2>

              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-[#6300ff]">
                    <TbMail className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#111111]">E-mail</div>
                    <div className="text-sm text-gray-500 mt-0.5">contato@zelt.ai</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-[#6300ff]">
                    <TbPhone className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#111111]">Telefone</div>
                    <div className="text-sm text-gray-500 mt-0.5">(11) 4002-8922</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-[#6300ff]">
                    <TbMapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#111111]">Escritório</div>
                    <div className="text-sm text-gray-500 mt-0.5">São Paulo, SP - Brasil</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-[#6300ff]">
                    <TbClock className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#111111]">Horário de atendimento</div>
                    <div className="text-sm text-gray-500 mt-0.5">Seg - Sex, 9h às 18h (BRT)</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              {submitted ? (
                <div className="rounded-xl border border-gray-200 p-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-500 mx-auto mb-6">
                    <TbSend className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-medium text-[#111111] tracking-tight mb-2">Mensagem enviada!</h3>
                  <p className="text-sm text-gray-500 font-normal leading-relaxed max-w-sm mx-auto">
                    Obrigado pelo contato. Nosso time responderá em até 24 horas úteis.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 p-8">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Nome completo *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-[#111] placeholder:text-gray-400 focus:outline-none focus:border-[#6300ff] focus:ring-1 focus:ring-[#6300ff] transition-colors"
                        placeholder="Seu nome"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">E-mail corporativo *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-[#111] placeholder:text-gray-400 focus:outline-none focus:border-[#6300ff] focus:ring-1 focus:ring-[#6300ff] transition-colors"
                        placeholder="seu@empresa.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Empresa</label>
                      <input
                        type="text"
                        name="company"
                        value={form.company}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-[#111] placeholder:text-gray-400 focus:outline-none focus:border-[#6300ff] focus:ring-1 focus:ring-[#6300ff] transition-colors"
                        placeholder="Nome da empresa"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Telefone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-[#111] placeholder:text-gray-400 focus:outline-none focus:border-[#6300ff] focus:ring-1 focus:ring-[#6300ff] transition-colors"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Assunto *</label>
                      <select
                        name="subject"
                        required
                        value={form.subject}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-[#111] focus:outline-none focus:border-[#6300ff] focus:ring-1 focus:ring-[#6300ff] transition-colors bg-white"
                      >
                        <option value="">Selecione um assunto</option>
                        <option value="demo">Solicitar demonstração</option>
                        <option value="enterprise">Plano Enterprise</option>
                        <option value="integration">Integração personalizada</option>
                        <option value="support">Suporte técnico</option>
                        <option value="partnership">Parceria</option>
                        <option value="other">Outro</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Mensagem *</label>
                      <textarea
                        name="message"
                        required
                        rows={5}
                        value={form.message}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-[#111] placeholder:text-gray-400 focus:outline-none focus:border-[#6300ff] focus:ring-1 focus:ring-[#6300ff] transition-colors resize-none"
                        placeholder="Como podemos ajudar?"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="mt-6 w-full rounded-lg bg-[#6300ff] px-6 py-3 text-sm font-medium text-white hover:bg-[#5200d5] transition-colors flex items-center justify-center gap-2"
                  >
                    <TbSend className="h-4 w-4" />
                    Enviar mensagem
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
