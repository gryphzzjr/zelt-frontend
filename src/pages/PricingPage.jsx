import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TbCheck, TbCircleDot, TbShieldCheck, TbHeadset, TbClock } from 'react-icons/tb';
import HeaderZelt from '../components/Header';
import FooterSection from '../components/Footer';

const plans = [
  {
    name: 'Teste Grátis',
    description: 'Experimente a plataforma completa por 3 dias sem compromisso.',
    isTrial: true,
    monthlyPrice: 0,
    annualPrice: 0,
    periodLabel: '3 dias',
    features: [
      '1 Instância de WhatsApp',
      'Treinamento de IA',
      'Painel de conversas',
      'CRM integrado',
    ],
    buttonText: 'Iniciar teste grátis',
  },
  {
    name: 'Starter',
    description: 'Ideal para pequenas empresas automatizarem o atendimento no WhatsApp.',
    monthlyPrice: 197,
    annualPrice: 173.36,
    features: [
      'IA para WhatsApp',
      'Respostas automáticas',
      'Treinamento básico de IA',
      'Painel de conversas',
      'CRM integrado',
      'Integrações essenciais',
    ],
    buttonText: 'Começar agora',
  },
  {
    name: 'Professional',
    description: 'Para empresas em crescimento que precisam de mais controle e automação.',
    monthlyPrice: 425,
    annualPrice: 374,
    popular: true,
    features: [
      'Tudo do Starter',
      'Múltiplos atendentes',
      'CRM integrado',
      'Automações avançadas',
      'Base de conhecimento maior',
      'Relatórios completos',
      'Integrações extras',
    ],
    buttonText: 'Assinar Professional',
  },
  {
    name: 'Enterprise',
    description: 'Soluções sob medida para médias e grandes empresas com alto volume.',
    monthlyPrice: 1423,
    annualPrice: 1252.24,
    features: [
      'Tudo do Professional',
      'Usuários ilimitados',
      'Suporte prioritário',
      'Integrações personalizadas',
      'APIs dedicadas',
      'Múltiplas instâncias',
      'Treinamento avançado da IA',
      'CRM integrado',
      'Recursos exclusivos',
    ],
    buttonText: 'Falar com Especialista',
  },
];

const comparisonFeatures = [
  { name: 'Instâncias de WhatsApp', starter: '1', professional: '3', enterprise: 'Ilimitado' },
  { name: 'Atendentes', starter: '1', professional: '5', enterprise: 'Ilimitado' },
  { name: 'Treinamento de IA', starter: 'Básico', professional: 'Avançado', enterprise: 'Premium' },
  { name: 'Base de conhecimento', starter: '50 MB', professional: '500 MB', enterprise: 'Ilimitado' },
  { name: 'Automações', starter: 'Básicas', professional: 'Avançadas', enterprise: 'Personalizadas' },
  { name: 'Relatórios', starter: 'Simples', professional: 'Completos', enterprise: 'Personalizados' },
  { name: 'Integrações', starter: 'Essenciais', professional: 'Extras', enterprise: 'Personalizadas' },
  { name: 'Suporte', starter: 'E-mail', professional: 'Chat prioritário', enterprise: 'Dedicado 24/7' },
  { name: 'API dedicada', starter: '—', professional: '—', enterprise: 'Sim' },
  { name: 'SLA garantido', starter: '—', professional: '—', enterprise: 'Sim' },
];

const faqs = [
  {
    question: 'Como funciona a cobrança do plano anual?',
    answer: 'O plano anual é cobrado em uma única parcela com 12% de desconto sobre o valor equivalente aos 12 meses de assinatura.',
  },
  {
    question: 'Posso mudar de plano depois?',
    answer: 'Sim! Você pode fazer upgrade ou downgrade a qualquer momento pelo painel de controle sem perder seus dados.',
  },
  {
    question: 'Tem limite de mensagens?',
    answer: 'O plano Starter possui limite mensal de mensagens. Planos Professional e Enterprise possuem limites expandidos e sob consulta.',
  },
  {
    question: 'Posso cancelar quando quiser?',
    answer: 'Sim, sem multa nem fidelidade. Cancele direto pelo painel a qualquer momento.',
  },
  {
    question: 'O teste grátis precisa de cartão de crédito?',
    answer: 'Não. O teste grátis de 3 dias está disponível sem necessidade de cartão de crédito.',
  },
  {
    question: 'Qual a diferença entre Starter e Professional?',
    answer: 'O Professional oferece múltiplos atendentes, automações avançadas, relatórios completos e mais integrações. Ideal para empresas em crescimento.',
  },
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <HeaderZelt />

      <section className="px-4 pt-20 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm font-medium text-gray-600 mb-6">
            <TbShieldCheck className="h-4 w-4 text-[#6300ff]" />
            Preços transparentes
          </div>
          <h1 className="text-4xl font-normal tracking-tight text-[#111111] sm:text-5xl lg:text-6xl leading-[1.1]">
            Preços simples e transparentes. <br />
            <span className="text-gray-400">Escolha o plano ideal para você.</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 font-normal leading-relaxed max-w-2xl mx-auto">
            Comece com o teste grátis. Sem cartão de crédito, sem compromisso. Cancele quando quiser.
          </p>

          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-gray-200 p-1 bg-gray-50">
            <button
              onClick={() => setIsAnnual(false)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${!isAnnual ? 'bg-[#111111] text-white' : 'text-gray-600 hover:text-[#111]'}`}
            >
              Mensal
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all flex items-center gap-1.5 ${isAnnual ? 'bg-[#111111] text-white' : 'text-gray-600 hover:text-[#111]'}`}
            >
              Anual
              <span className="text-[10px] bg-[#6300ff] text-white px-1.5 py-0.5 rounded-full font-semibold">-12%</span>
            </button>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`rounded-xl border bg-white p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
                  plan.popular
                    ? 'border-[#6300ff] shadow-lg shadow-[#6300ff]/5 ring-1 ring-[#6300ff]/10'
                    : 'border-gray-200 hover:border-[#6300ff]/40'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">{plan.name}</span>
                    {plan.popular && (
                      <span className="text-[10px] font-semibold bg-[#6300ff] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Mais popular
                      </span>
                    )}
                    {plan.isTrial && (
                      <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-200">
                        Grátis
                      </span>
                    )}
                  </div>

                  {plan.isTrial ? (
                    <div className="mt-4 text-3xl font-semibold tracking-tight text-[#111111] h-[44px] flex items-baseline">
                      Grátis
                      <span className="ml-2 text-xs font-normal text-gray-500">por 3 dias</span>
                    </div>
                  ) : (
                    <div className="mt-4 flex flex-col text-[#111111]">
                      <div className="flex items-baseline">
                        <span className="text-3xl font-semibold tracking-tight">
                          R$ {isAnnual ? plan.annualPrice.toFixed(2).replace('.', ',') : plan.monthlyPrice.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="ml-1 text-xs font-normal text-gray-500">/mês</span>
                      </div>
                      {isAnnual && (
                        <span className="text-[11px] text-gray-400 mt-0.5">
                          R$ {(plan.annualPrice * 12).toFixed(2).replace('.', ',')} cobrado anualmente
                        </span>
                      )}
                    </div>
                  )}

                  <p className="mt-4 text-xs text-gray-500 leading-relaxed min-h-[48px]">{plan.description}</p>

                  <ul className="mt-6 space-y-3.5 border-t border-gray-100 pt-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-600">
                        <TbCheck className="h-4 w-4 text-[#6300ff] shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to={plan.isTrial ? '/register' : `/checkout?plan=${plan.name.toLowerCase()}&period=${isAnnual ? 'annual' : 'monthly'}`}
                  className={`mt-8 block w-full text-center rounded border py-2.5 text-xs font-medium transition-all ${
                    plan.popular
                      ? 'bg-[#6300ff] border-[#6300ff] text-white hover:bg-[#5200d6]'
                      : plan.isTrial
                        ? 'bg-[#111111] border-[#111111] text-white hover:bg-black'
                        : 'border-gray-200 text-black bg-white hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  {plan.buttonText}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-normal tracking-tight text-[#111111] sm:text-3xl">
              Compare os planos
            </h2>
          </div>

          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">Recurso</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Starter</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#6300ff] uppercase tracking-wider text-center bg-[#6300ff]/5">Professional</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, idx) => (
                    <tr key={idx} className="border-b border-gray-100 last:border-0">
                      <td className="px-6 py-3.5 text-sm text-gray-700 font-medium">{feature.name}</td>
                      <td className="px-6 py-3.5 text-sm text-gray-500 text-center">{feature.starter}</td>
                      <td className="px-6 py-3.5 text-sm text-gray-700 text-center bg-[#6300ff]/5 font-medium">{feature.professional}</td>
                      <td className="px-6 py-3.5 text-sm text-gray-500 text-center">{feature.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mb-16">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-[#6300ff]">
                <TbShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#111111]">Segurança LGPD</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">Dados criptografados em trânsito e em repouso. Conformidade total com a legislação brasileira.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-[#6300ff]">
                <TbHeadset className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#111111]">Suporte dedicado</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">Time de especialistas disponível para ajudar você em cada etapa da configuração.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-[#6300ff]">
                <TbClock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#111111]">Setup em 10 minutos</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">Configure sua inteligência artificial e comece a atender seus clientes rapidamente.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-2 mb-10 text-[#111]">
            <TbCircleDot className="h-5 w-5 text-[#6300ff] animate-pulse" />
            <h3 className="text-xl font-medium tracking-tight">Perguntas frequentes</h3>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-[#111111]">{faq.question}</span>
                  <TbCircleDot className={`h-4 w-4 text-gray-400 shrink-0 ml-4 transition-transform ${openFaq === idx ? 'rotate-90 text-[#6300ff]' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4">
                    <p className="text-sm text-gray-500 font-normal leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8 border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-normal tracking-tight text-[#111111] sm:text-4xl leading-[1.15]">
            Ainda tem dúvidas?
          </h2>
          <p className="mt-4 text-base text-gray-600 font-normal leading-relaxed max-w-xl mx-auto">
            Fale com nosso time de especialistas e encontre o plano perfeito para sua operação.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="rounded bg-[#6300ff] px-8 py-3.5 text-sm font-medium text-white hover:bg-[#5200d5] transition-colors">
              Falar com Vendas
            </Link>
            <Link to="/register" className="rounded border border-gray-200 px-8 py-3.5 text-sm font-medium text-black hover:bg-white transition-colors">
              Começar Grátis
            </Link>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
