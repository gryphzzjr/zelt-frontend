import React from 'react';
import { Link } from 'react-router-dom';
import { TbMessageChatbot, TbUsers, TbClockShare, TbBook, TbCode, TbHeadset, TbMail } from 'react-icons/tb';
import HeaderZelt from '../components/Header';
import FooterSection from '../components/Footer';
import { FiZap } from 'react-icons/fi';

const howItWorks = [
  {
    step: '01',
    title: 'Crie sua conta',
    description: 'Cadastre-se em segundos com seu e-mail corporativo. Sem necessidade de cartão de crédito para começar.',
  },
  {
    step: '02',
    title: 'Treine sua IA',
    description: 'Faça upload dos manuais, FAQs e documentos da sua empresa. A inteligência artificial aprende automaticamente o contexto do seu negócio.',
  },
  {
    step: '03',
    title: 'Configure os fluxos',
    description: 'Use o editor visual para criar jornadas conversacionais, gatilhos automáticos e regras de transbordo para atendimento humano.',
  },
  {
    step: '04',
    title: 'Ative no WhatsApp',
    description: 'Conecte seu número de WhatsApp e comece a atender seus clientes com inteligência artificial em escala.',
  },
];

const integrations = [
  { name: 'WhatsApp Business', description: 'Integração nativa com a API oficial do WhatsApp.' },
  { name: 'CRMs', description: 'Sincronize dados de clientes com seu CRM favorito.' },
  { name: 'E-commerce', description: 'Conecte com Shopify, WooCommerce e outras plataformas.' },
  { name: 'Pagamentos', description: 'Integrações com gateways de pagamento para fluxos automáticos.' },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <HeaderZelt />

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm font-medium text-gray-600 mb-6">
              <TbBook className="h-4 w-4 text-[#6300ff]" />
              Recursos
            </div>
            <h1 className="text-4xl font-normal tracking-tight text-[#111111] sm:text-5xl lg:text-6xl leading-[1.1]">
              Como o Zelt.AI <span className="text-gray-400">funciona</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 font-normal leading-relaxed max-w-2xl">
              Descubra como nossa plataforma transforma seu atendimento no WhatsApp em poucos minutos. Sem complicação, sem código, sem dor de cabeça.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 max-w-3xl">
            <h2 className="text-3xl font-normal tracking-tight text-[#111111] sm:text-4xl leading-[1.15]">
              Do cadastro ao ativo, <br />
              <span className="text-gray-400">em menos de 10 minutos.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((item) => (
              <div key={item.step} className="relative">
                <div className="text-5xl font-semibold text-gray-100 tracking-tight mb-4">{item.step}</div>
                <h3 className="text-lg font-medium text-[#111111] tracking-tight mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 font-normal leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8 border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-600 mb-6">
                <TbMessageChatbot className="h-4 w-4 text-[#6300ff]" />
                IA Generativa
              </div>
              <h2 className="text-3xl font-normal tracking-tight text-[#111111] sm:text-4xl leading-[1.15] mb-6">
                Treine sua IA com <span className="text-gray-400">seus próprios dados</span>
              </h2>
              <p className="text-base text-gray-600 font-normal leading-relaxed mb-8">
                Alimente a inteligência artificial com manuais, tabelas de preços, FAQs e qualquer outro documento relevante. A IA aprende o contexto do seu negócio e responde precisamente às dúvidas dos seus clientes.
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-[#6300ff]">
                    <FiZap className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#111111]">Upload de documentos</div>
                    <p className="text-xs text-gray-500 mt-0.5">PDFs, links de sites e arquivos de texto.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-[#6300ff]">
                    <TbClockShare className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#111111]">Aprendizado instantâneo</div>
                    <p className="text-xs text-gray-500 mt-0.5">A IA absorve os dados em menos de um minuto.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-[#6300ff]">
                    <TbUsers className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#111111]">Respostas contextuais</div>
                    <p className="text-xs text-gray-500 mt-0.5">Precisão milimétrica baseada na sua base de conhecimento.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-8 flex items-center justify-center min-h-[400px]">
              <span className="text-sm font-medium text-gray-400">
                [ Interface de Treinamento ]
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 max-w-3xl">
            <h2 className="text-3xl font-normal tracking-tight text-[#111111] sm:text-4xl leading-[1.15]">
              Integrações que <br />
              <span className="text-gray-400">conectam seu ecossistema.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {integrations.map((item) => (
              <div key={item.name} className="rounded-xl border border-gray-200 p-6">
                <h3 className="text-base font-medium text-[#111111] tracking-tight mb-1">{item.name}</h3>
                <p className="text-sm text-gray-500 font-normal leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8 border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-8 flex items-center justify-center min-h-[400px] order-2 lg:order-1">
              <span className="text-sm font-medium text-gray-400">
                [ Editor de Fluxos ]
              </span>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-600 mb-6">
                <TbCode className="h-4 w-4 text-[#6300ff]" />
                Zero Código
              </div>
              <h2 className="text-3xl font-normal tracking-tight text-[#111111] sm:text-4xl leading-[1.15] mb-6">
                Automação visual <span className="text-gray-400">que entende intenções</span>
              </h2>
              <p className="text-base text-gray-600 font-normal leading-relaxed mb-8">
                Crie fluxos de atendimento inteligentes com um editor visual intuitivo. Defina gatilhos, regras de negócio e jornadas conversacionais sem escrever uma única linha de código.
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-[#6300ff]">
                    <FiZap className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#111111]">Gatilhos automáticos</div>
                    <p className="text-xs text-gray-500 mt-0.5">Respostas instantâneas baseadas em palavras-chave.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-[#6300ff]">
                    <TbHeadset className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#111111]">Transbordo inteligente</div>
                    <p className="text-xs text-gray-500 mt-0.5">Direcionamento automático para o operador correto.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-[#6300ff]">
                    <TbMail className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#111111]">Disparos em massa</div>
                    <p className="text-xs text-gray-500 mt-0.5">Envie alertas e notificações nativamente no WhatsApp.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-normal tracking-tight text-[#111111] sm:text-4xl leading-[1.15]">
            Comece a automatizar hoje
          </h2>
          <p className="mt-4 text-base text-gray-600 font-normal leading-relaxed max-w-xl mx-auto">
            Cadastre-se e teste grátis por 3 dias para descobrir como o Zelt.AI pode transformar seu atendimento.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="rounded bg-[#6300ff] px-8 py-3.5 text-sm font-medium text-white hover:bg-[#5200d5] transition-colors">
              Criar Conta
            </Link>
            <Link to="/login" className="rounded border border-gray-200 px-8 py-3.5 text-sm font-medium text-black hover:bg-gray-50 transition-colors">
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
