import React, { useState } from 'react';
import { TbCheck, TbCircleDot } from 'react-icons/tb';
import { AnimatedSection } from './ScrollReveal';

export default function PricingAndFaq() {
  const [isAnnual, setIsAnnual] = useState(false);

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
        'CRM integrado'
      ],
      buttonText: 'Iniciar teste grátis'
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
        'Integrações essenciais'
      ],
      buttonText: 'Começar agora'
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
        'Integrações extras'
      ],
      buttonText: 'Assinar Professional'
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
        'Recursos exclusivos'
      ],
      buttonText: 'Falar com Especialista'
    }
  ];

  return (
    <section className="w-full bg-white px-4 py-24 sm:px-6 lg:px-8 border-t border-gray-200 font-sans antialiased relative overflow-hidden">

      <div className="absolute top-1/4 -right-20 w-96 h-96 rounded-full border border-gray-100 pointer-events-none z-0" />
      <div className="absolute bottom-10 -left-10 w-64 h-64 rounded-full border border-gray-100 pointer-events-none z-0" />

      <div className="mx-auto max-w-7xl relative z-10">

        <AnimatedSection className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-normal tracking-tight text-[#111111] sm:text-4xl md:text-5xl leading-[1.15]">
            Preços simples e transparentes. <br />
            <span className="text-gray-400">Escolha o plano ideal para você.</span>
          </h2>

          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-gray-200 p-1 bg-gray-50">
            <button
              onClick={() => setIsAnnual(false)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${!isAnnual ? 'bg-[#111111] text-white' : 'text-gray-600 hover:text-[#111]'}`}
            >
              Mensal
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5 ${isAnnual ? 'bg-[#111111] text-white' : 'text-gray-600 hover:text-[#111]'}`}
            >
              Anual
              <span className="text-[10px] bg-[#6300ff] text-white px-1.5 py-0.5 rounded-full font-semibold">-12%</span>
            </button>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto mb-24">
          {plans.map((plan, index) => (
            <AnimatedSection key={index} delay={index * 80}>
              <div
                className={`rounded-xl border bg-white p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 group h-full ${
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
                        <span className="ml-1 text-xs font-normal text-gray-500">
                          /mês
                        </span>
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

                <button
                  className={`mt-8 block w-full text-center rounded border py-2.5 text-xs font-medium transition-all ${
                    plan.popular
                      ? 'bg-[#6300ff] border-[#6300ff] text-white hover:bg-[#5200d6]'
                      : plan.isTrial
                        ? 'bg-[#111111] border-[#111111] text-white hover:bg-black'
                        : 'border-gray-200 text-black bg-white hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection className="max-w-3xl mx-auto border-t border-gray-200 pt-16">
          <div className="flex items-center gap-2 mb-8 text-[#111]">
            <TbCircleDot className="h-5 w-5 text-[#6300ff] animate-pulse" />
            <h3 className="text-xl font-medium tracking-tight">Perguntas frequentes</h3>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {[
              { q: 'Como funciona a cobrança do plano anual?', a: 'O plano anual é cobrado em uma única parcela com 12% de desconto sobre o valor equivalente aos 12 meses de assinatura.' },
              { q: 'Posso mudar de plano depois?', a: 'Sim! Você pode fazer upgrade ou downgrade a qualquer momento pelo painel de controle sem perder seus dados.' },
              { q: 'Tem limite de mensagens?', a: 'O plano Starter possui limite mensal de mensagens. Planos Professional e Enterprise possuem limites expandidos e sob consulta.' },
              { q: 'Posso cancelar quando quiser?', a: 'Sim, sem multa nem fidelidade. Cancele direto pelo painel a qualquer momento.' },
            ].map((item, i) => (
              <div key={i} className="border-b border-gray-100 pb-4">
                <h4 className="text-sm font-medium text-[#111]">{item.q}</h4>
                <p className="mt-2 text-xs text-gray-500 font-normal leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>

      </div>
    </section>
  );
}
