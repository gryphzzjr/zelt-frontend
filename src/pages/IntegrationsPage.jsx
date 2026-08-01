import React from 'react';
import { Link } from 'react-router-dom';
import {
  TbBrandWhatsapp,
  TbSparkles,
  TbRobot,
  TbApi,
  TbWebhook,
  TbCalendar,
  TbFileTypePdf,
  TbFileTypeDocx,
  TbFileTypeTxt,
  TbMarkdown,
  TbWorld,
} from 'react-icons/tb';
import { SiGooglesheets, SiGoogledrive, SiMercadopago } from 'react-icons/si';
import HeaderZelt from '../components/Header';
import FooterSection from '../components/Footer';

const mainIntegrations = [
  {
    icon: TbBrandWhatsapp,
    name: 'Evolution API',
    category: 'Comunicação',
    description: 'Conecte sua instância do WhatsApp através da Evolution API e automatize atendimentos, envios de mensagens, mídia e documentos em tempo real.',
    status: 'Disponível',
  },
  {
    icon: TbSparkles,
    name: 'Google Gemini',
    category: 'Inteligência Artificial',
    description: 'Utilize os modelos Gemini para criar agentes inteligentes, responder clientes e executar tarefas automaticamente.',
    status: 'Disponível',
  },
  {
    icon: TbRobot,
    name: 'OpenAI',
    category: 'Inteligência Artificial',
    description: 'Conecte modelos GPT para potencializar o atendimento, classificação de mensagens e geração de respostas.',
    status: 'Disponível',
  },
];

const serviceIntegrations = [
  { name: 'BrasilAPI', category: 'APIs', icon: TbApi },
  { name: 'Google Calendar', category: 'Agenda', icon: TbCalendar },
  { name: 'Google Drive', category: 'Armazenamento', icon: SiGoogledrive },
  { name: 'Google Sheets', category: 'Produtividade', icon: SiGooglesheets },
  { name: 'Mercado Pago', category: 'Pagamentos', icon: SiMercadopago },
];

const automationIntegrations = [
  { name: 'API REST', category: 'Desenvolvimento', icon: TbApi },
  { name: 'Webhooks', category: 'Automação', icon: TbWebhook },
];

const trainingIntegrations = [
  { name: 'PDF', category: 'Documento', icon: TbFileTypePdf },
  { name: 'DOCX', category: 'Documento', icon: TbFileTypeDocx },
  { name: 'TXT', category: 'Documento', icon: TbFileTypeTxt },
  { name: 'Markdown', category: 'Documento', icon: TbMarkdown },
  { name: 'Websites', category: 'Conteúdo', icon: TbWorld },
];

function IntegrationCard({ item }) {
  const Icon = item.icon;
  return (
    <div className="group rounded-xl border border-gray-200 p-5 text-center transition-colors hover:border-[#6300ff]/20 hover:bg-gray-50">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-gray-400 mx-auto mb-3 transition-colors group-hover:text-[#6300ff] group-hover:border-[#6300ff]/20 group-hover:bg-[#6300ff]/5">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-medium text-[#111111]">{item.name}</h3>
      <span className="text-[10px] text-gray-400 uppercase tracking-wider">{item.category}</span>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <HeaderZelt />

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm font-medium text-gray-600 mb-6">
              <TbWebhook className="h-4 w-4 text-[#6300ff]" />
              Integrações
            </div>
            <h1 className="text-4xl font-normal tracking-tight text-[#111111] sm:text-5xl lg:text-6xl leading-[1.1]">
              Conectado aos seus <span className="text-gray-400">sistemas favoritos</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 font-normal leading-relaxed max-w-2xl">
              Conecte a Zelt.ai aos principais serviços do seu negócio. Automatize atendimentos no WhatsApp, agendamentos, pagamentos, consultas em APIs e treine sua IA utilizando documentos e sites.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {mainIntegrations.map((integration) => {
              const Icon = integration.icon;
              return (
                <div key={integration.name} className="group rounded-xl border border-[#6300ff]/20 bg-[#6300ff]/5 p-8 transition-colors hover:bg-[#6300ff]/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#6300ff]/20 bg-white text-[#6300ff]">
                      <Icon className="h-7 w-7" />
                    </div>
                    <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-200">
                      {integration.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-[#111111] tracking-tight mb-1">{integration.name}</h3>
                  <span className="text-xs font-medium text-[#6300ff] uppercase tracking-wider">{integration.category}</span>
                  <p className="mt-3 text-sm text-gray-500 font-normal leading-relaxed">{integration.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8 border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <h2 className="text-2xl font-normal tracking-tight text-[#111111] sm:text-3xl leading-[1.15]">
              Serviços
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {serviceIntegrations.map((item) => (
              <IntegrationCard key={item.name} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <h2 className="text-2xl font-normal tracking-tight text-[#111111] sm:text-3xl leading-[1.15]">
              Automação
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-2xl">
            {automationIntegrations.map((item) => (
              <IntegrationCard key={item.name} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8 border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <h2 className="text-2xl font-normal tracking-tight text-[#111111] sm:text-3xl leading-[1.15]">
              Treinamento da IA
            </h2>
            <p className="mt-3 text-sm text-gray-500 max-w-2xl">
              Fontes de conteúdo utilizadas para treinar e alimentar sua IA com o conhecimento do seu negócio.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {trainingIntegrations.map((item) => (
              <IntegrationCard key={item.name} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-normal tracking-tight text-[#111111] sm:text-4xl leading-[1.15] mb-6">
                Não encontrou sua <span className="text-gray-400">integração?</span>
              </h2>
              <p className="text-base text-gray-600 font-normal leading-relaxed mb-8">
                A Zelt.ai possui API REST e suporte a Webhooks para integração com qualquer sistema. Caso sua empresa utilize uma plataforma específica, nossa equipe pode desenvolver uma integração personalizada.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/contact" className="rounded bg-[#6300ff] px-6 py-3.5 text-sm font-medium text-white hover:bg-[#5200d5] transition-colors text-center">
                  Solicitar Integração
                </Link>
                <Link to="/resources" className="rounded border border-gray-200 px-6 py-3.5 text-sm font-medium text-black hover:bg-gray-50 transition-colors text-center">
                  Ver Documentação
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 flex items-center justify-center min-h-[320px]">
              <span className="text-sm font-medium text-gray-400">
                [ Diagrama de Integrações ]
              </span>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
