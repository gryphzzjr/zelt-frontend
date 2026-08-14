import React from 'react';
import { Link } from 'react-router-dom';
import { TbShieldCheck, TbUsers, TbApi, TbHeadset, TbServer, TbLock, TbSettings, TbChartBar, TbCheck } from 'react-icons/tb';
import HeaderZelt from '../components/Header';
import FooterSection from '../components/Footer';

const enterpriseFeatures = [
  {
    icon: TbChartBar,
    title: 'Alto Volume de Atendimento',
    description: 'Capacidade ampliada para operações com grande volume de mensagens e contatos, sem limites restritivos.',
  },
  {
    icon: TbApi,
    title: 'APIs Dedicadas',
    description: 'Acesso exclusivo a APIs REST e WebSocket para integrações personalizadas com seus sistemas.',
  },
  {
    icon: TbServer,
    title: 'Infraestrutura Dedicada',
    description: 'Recursos dedicados e dimensionados para manter performance e estabilidade em qualquer cenário.',
  },
  {
    icon: TbHeadset,
    title: 'Suporte 24/7 Dedicado',
    description: 'Time de suporte exclusivo com SLA garantido e gerente de conta dedicado.',
  },
  {
    icon: TbLock,
    title: 'Segurança Empresarial',
    description: 'Autenticação de dois fatores, logs de auditoria e conformidade total com LGPD.',
  },
  {
    icon: TbSettings,
    title: 'Integrações Personalizadas',
    description: 'Desenvolvemos integrações sob medida para CRMs, ERPs e sistemas legados da sua empresa.',
  },
  {
    icon: TbUsers,
    title: 'Treinamento Avançado da IA',
    description: 'Modelagem avançada dos prompts e base de conhecimento para cenários complexos e específicos.',
  },
  {
    icon: TbShieldCheck,
    title: 'SLA Garantido',
    description: 'Contrato de nível de serviço com garantia de uptime e tempo de resposta.',
  },
];

const stats = [
  { value: '99.9%', label: 'Uptime garantido' },
  { value: '<2h', label: 'Tempo de resposta' },
  { value: '24/7', label: 'Suporte dedicado' },
  { value: '100 GB', label: 'Base de conhecimento' },
];

export default function EnterprisePage() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <HeaderZelt />

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm font-medium text-gray-600 mb-6">
                <TbShieldCheck className="h-4 w-4 text-[#6300ff]" />
                Enterprise
              </div>
              <h1 className="text-4xl font-normal tracking-tight text-[#111111] sm:text-5xl lg:text-6xl leading-[1.1]">
                Atendimento em escala <span className="text-gray-400">para grandes operações</span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 font-normal leading-relaxed">
                Soluções sob medida para médias e grandes empresas com alto volume de atendimento. Infraestrutura dedicada, suporte premium e integrações personalizadas.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link to="/contact" className="rounded bg-[#6300ff] px-6 py-3.5 text-sm font-medium text-white hover:bg-[#5200d5] transition-colors text-center">
                  Falar com Especialista
                </Link>
                <Link to="/pricing" className="rounded border border-gray-200 px-6 py-3.5 text-sm font-medium text-black hover:bg-gray-50 transition-colors text-center">
                  Ver Planos
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 flex items-center justify-center min-h-[400px]">
              <span className="text-sm font-medium text-gray-400">
                [ Dashboard Enterprise ]
              </span>
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
              Tudo que sua empresa precisa, <br />
              <span className="text-gray-400">em uma plataforma dedicada.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {enterpriseFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="group rounded-xl border border-gray-200 p-6 transition-colors hover:border-[#6300ff]/20 hover:bg-gray-50">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-[#6300ff] mb-4 transition-colors group-hover:bg-[#6300ff]/5 group-hover:border-[#6300ff]/20">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-medium text-[#111111] tracking-tight mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 font-normal leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8 border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-8 flex items-center justify-center min-h-[400px] order-2 lg:order-1">
              <span className="text-sm font-medium text-gray-400">
                [ Arquitetura de Segurança ]
              </span>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-normal tracking-tight text-[#111111] sm:text-4xl leading-[1.15] mb-6">
                Segurança de <span className="text-gray-400">nível empresarial</span>
              </h2>
              <p className="text-base text-gray-600 font-normal leading-relaxed mb-8">
                Seus dados e os dados dos seus clientes estão protegidos com as melhores práticas de segurança da indústria.
              </p>
              <ul className="flex flex-col gap-4">
                {[
                  'Criptografia AES-256 em repouso e TLS 1.3 em trânsito',
                  'Autenticação de dois fatores (2FA) obrigatória',
                  'Logs de auditoria completos e imutáveis',
                  'Conformidade com LGPD, SOC 2 e ISO 27001',
                  'Backups diários com retenção estendida',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                    <TbCheck className="h-5 w-5 text-[#6300ff] shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-normal tracking-tight text-[#111111] sm:text-4xl leading-[1.15]">
            Pronto para escalar sua operação?
          </h2>
          <p className="mt-4 text-base text-gray-600 font-normal leading-relaxed max-w-xl mx-auto">
            Entre em contato com nosso time de especialistas e descubra como o Zelt.AI pode transformar seu atendimento corporativo.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="rounded bg-[#6300ff] px-8 py-3.5 text-sm font-medium text-white hover:bg-[#5200d5] transition-colors">
              Solicitar Demonstração
            </Link>
            <Link to="/pricing" className="rounded border border-gray-200 px-8 py-3.5 text-sm font-medium text-black hover:bg-gray-50 transition-colors">
              Ver Planos
            </Link>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
