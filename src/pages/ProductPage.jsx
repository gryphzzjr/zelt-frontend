import React from 'react';
import { Link } from 'react-router-dom';
import { TbBrain, TbHierarchy2, TbMessages, TbSparkles, TbShieldCheck, TbBolt, TbChartBar, TbUsers, TbApi } from 'react-icons/tb';
import HeaderZelt from '../components/Header';
import FooterSection from '../components/Footer';

const features = [
  {
    icon: TbBrain,
    title: 'IA Generativa Treinada para Sua Marca',
    description: 'Alimente a inteligência artificial com manuais, tabelas de preços e FAQs da sua empresa. A IA aprende o tom de voz da marca e responde como seu melhor vendedor.',
  },
  {
    icon: TbHierarchy2,
    title: 'Automação Visual Sem Código',
    description: 'Crie fluxos de atendimento inteligentes com um editor visual intuitivo. Defina gatilhos, regras de negócio e jornadas conversacionais sem escrever uma única linha de código.',
  },
  {
    icon: TbMessages,
    title: 'Transbordo Humano Impecável',
    description: 'Quando um cliente precisa de atendimento humano, a IA direciona o chat para o operador correto do seu time, com contexto completo da conversa.',
  },
  {
    icon: TbSparkles,
    title: 'Base de Conhecimento Dinâmica',
    description: 'Arraste PDFs, manuais técnicos ou links de sites. Em menos de um minuto, o agente cognitivo absorve os dados e passa a utilizá-los de forma contextualizada.',
  },
  {
    icon: TbApi,
    title: 'Integrações Nativas',
    description: 'Sincronize com CRMs, plataformas de e-commerce e ferramentas de pagamento. Dispare fluxos automáticos baseados em ações do cliente.',
  },
  {
    icon: TbChartBar,
    title: 'Analytics em Tempo Real',
    description: 'Acompanhe métricas de atendimento, taxa de resolução e satisfação do cliente em um painel centralizado e intuitivo.',
  },
];

const stats = [
  { value: '94%', label: 'Taxa de resolução com IA' },
  { value: '18h+', label: 'Tempo economizado por semana' },
  { value: '0', label: 'Linhas de código necessárias' },
  { value: '<10min', label: 'Tempo de configuração' },
];

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <HeaderZelt />

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm font-medium text-gray-600 mb-6">
              <TbBolt className="h-4 w-4 text-[#6300ff]" />
              Plataforma Completa
            </div>
            <h1 className="text-4xl font-normal tracking-tight text-[#111111] sm:text-5xl lg:text-6xl leading-[1.1]">
              Inteligência artificial que <span className="text-gray-400">entende sua operação</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 font-normal leading-relaxed max-w-2xl">
              O Zelt.AI combina IA generativa, automação visual e atendimento humano em uma única plataforma. Reduza custos operacionais, aumente a satisfação do cliente e escale seu atendimento no WhatsApp sem complicação.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="rounded bg-[#111] px-6 py-3.5 text-sm font-medium text-white hover:bg-black transition-colors text-center">
                Começar Agora
              </Link>
              <Link to="/resources" className="rounded border border-gray-200 px-6 py-3.5 text-sm font-medium text-black hover:bg-gray-50 transition-colors text-center">
                Ver Como Funciona
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-semibold text-[#111111] tracking-tight">{stat.value}</div>
                <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 max-w-3xl">
            <h2 className="text-3xl font-normal tracking-tight text-[#111111] sm:text-4xl leading-[1.15]">
              Tudo que sua operação precisa, <br />
              <span className="text-gray-400">em um ecossistema unificado.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="group rounded-xl border border-gray-200 p-8 transition-colors hover:border-[#6300ff]/20 hover:bg-gray-50">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-[#6300ff] mb-5 transition-colors group-hover:bg-[#6300ff]/5 group-hover:border-[#6300ff]/20">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium text-[#111111] tracking-tight mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 font-normal leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm font-medium text-gray-600 mb-6">
                <TbUsers className="h-4 w-4 text-[#6300ff]" />
                Para Empresas
              </div>
              <h2 className="text-3xl font-normal tracking-tight text-[#111111] sm:text-4xl leading-[1.15] mb-6">
                Escale seu atendimento <span className="text-gray-400">sem perder qualidade</span>
              </h2>
              <p className="text-base text-gray-600 font-normal leading-relaxed mb-8">
                Seja uma startup ou uma enterprise, o Zelt.AI se adapta ao tamanho da sua operação. Automatize o atendimento repetitivo, libere sua equipe para tarefas estratégicas e mantenha a experiência do cliente sempre excepcional.
              </p>
              <ul className="flex flex-col gap-4">
                {[
                  'Setup em menos de 10 minutos',
                  'Sem necessidade de equipe técnica',
                  'Suporte dedicado para planos Enterprise',
                  'Conformidade com LGPD e criptografia de ponta',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                    <TbShieldCheck className="h-5 w-5 text-[#6300ff] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 flex items-center justify-center min-h-[400px]">
              <span className="text-sm font-medium text-gray-400">
                [ Interface da Plataforma ]
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8 border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-normal tracking-tight text-[#111111] sm:text-4xl leading-[1.15]">
            Pronto para transformar seu atendimento?
          </h2>
          <p className="mt-4 text-base text-gray-600 font-normal leading-relaxed max-w-xl mx-auto">
            Comece seu teste grátis hoje. Não precisa de cartão de crédito.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="rounded bg-[#6300ff] px-8 py-3.5 text-sm font-medium text-white hover:bg-[#5200d5] transition-colors">
              Criar Conta
            </Link>
            <Link to="/login" className="rounded border border-gray-200 px-8 py-3.5 text-sm font-medium text-black hover:bg-white transition-colors">
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
