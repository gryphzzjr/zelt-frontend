import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TbCheck, TbCircleDot, TbShieldCheck, TbHeadset, TbClock, TbFlame } from 'react-icons/tb';
import HeaderZelt from '../components/Header';
import FooterSection from '../components/Footer';

const plans = [
  {
    name: 'Professional',
    description: 'Para quem precisa de atendimento ilimitado com automação completa.',
    monthlyPrice: 149,
    annualPrice: 131.12,
    popular: true,
    features: [
      '3 dias de teste grátis',
      'Conversas ilimitadas',
      '10.000 contatos',
      '20 GB de base de conhecimento',
      'Automações avançadas',
      'Relatórios completos',
      'Integrações extras',
    ],
    buttonText: 'Iniciar teste grátis',
  },
  {
    name: 'Enterprise',
    description: 'Soluções sob medida para operações de alto volume e requisitos especiais.',
    monthlyPrice: null,
    annualPrice: null,
    features: [
      '3 dias de teste grátis',
      '100 GB de base de conhecimento',
      'Contatos ilimitados',
      'Integrações personalizadas',
      'APIs dedicadas',
      'Treinamento avançado da IA',
      'Suporte dedicado com SLA',
    ],
    buttonText: 'Falar com Especialista',
  },
];

const comparisonFeatures = [
  { name: 'Mensagens por mês', professional: 'Ilimitadas', enterprise: 'Sob consulta' },
  { name: 'Contatos', professional: '10.000', enterprise: 'Ilimitados' },
  { name: 'Base de conhecimento', professional: '20 GB', enterprise: '100 GB' },
  { name: 'Instâncias de WhatsApp', professional: '1', enterprise: 'Sob consulta' },
  { name: 'Treinamento de IA', professional: 'Avançado', enterprise: 'Premium' },
  { name: 'Automações', professional: 'Avançadas', enterprise: 'Personalizadas' },
  { name: 'Relatórios', professional: 'Completos', enterprise: 'Personalizados' },
  { name: 'Integrações', professional: 'Extras', enterprise: 'Personalizadas' },
  { name: 'Suporte', professional: 'Chat prioritário', enterprise: 'Dedicado 24/7' },
  { name: 'SLA garantido', professional: '—', enterprise: 'Sim' },
];

const faqs = [
  {
    question: 'Como funciona o teste grátis?',
    answer: 'Todos os planos incluem 3 dias de teste grátis. Você pode experimentar a plataforma completa antes de assinar.',
  },
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
    answer: 'O Professional oferece conversas ilimitadas. O Enterprise é sob consulta.',
  },
  {
    question: 'O teste grátis precisa de cartão de crédito?',
    answer: 'Não. Você testa os 3 dias sem cartão de crédito e só assina se quiser continuar.',
  },
  {
    question: 'Qual a diferença entre Professional e Enterprise?',
    answer: 'O Professional é ideal para operações de alto volume com conversas ilimitadas e automações avançadas. O Enterprise oferece integrações personalizadas, APIs dedicadas e suporte com SLA.',
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
            Teste grátis por 3 dias em todos os planos. Sem cartão de crédito, sem compromisso. Cancele quando quiser.
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
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                  </div>

                  {plan.monthlyPrice === null ? (
                    <div className="mt-4 text-3xl font-semibold tracking-tight text-[#111111] h-[44px] flex items-baseline">
                      Sob consulta
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

                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 text-[11px] font-semibold">
                    <TbFlame className="h-3.5 w-3.5" />
                    3 dias de teste grátis
                  </div>

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
                  to={plan.monthlyPrice === null
                    ? '/enterprise'
                    : `/checkout?plan=${plan.name.toLowerCase()}&period=${isAnnual ? 'annual' : 'monthly'}`}
                  className={`mt-8 block w-full text-center rounded border py-2.5 text-xs font-medium transition-all ${
                    plan.popular
                      ? 'bg-[#6300ff] border-[#6300ff] text-white hover:bg-[#5200d6]'
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
        <div className="mx-auto max-w-4xl">
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
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/3">Recurso</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#6300ff] uppercase tracking-wider text-center bg-[#6300ff]/5">Professional</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, idx) => (
                    <tr key={idx} className="border-b border-gray-100 last:border-0">
                      <td className="px-6 py-3.5 text-sm text-gray-700 font-medium">{feature.name}</td>
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
              Teste grátis por 3 dias
            </Link>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
