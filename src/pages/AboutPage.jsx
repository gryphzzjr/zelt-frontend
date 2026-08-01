import React from 'react';
import { Link } from 'react-router-dom';
import { TbHeart, TbBulb, TbUsers, TbRocket, TbShieldCheck, TbWorld } from 'react-icons/tb';
import HeaderZelt from '../components/Header';
import FooterSection from '../components/Footer';

const values = [
  {
    icon: TbHeart,
    title: 'Humanizar a Automação',
    description: 'Acreditamos que tecnologia deve aproximar pessoas, não substituí-las. Nossa IA complementa o trabalho humano.',
  },
  {
    icon: TbBulb,
    title: 'Inovação Constante',
    description: 'Estamos sempre na fronteira da tecnologia, buscando soluções mais inteligentes e eficientes para nossos clientes.',
  },
  {
    icon: TbUsers,
    title: 'Foco no Cliente',
    description: 'Cada decisão que tomamos começa e termina com o sucesso do nosso cliente.',
  },
  {
    icon: TbShieldCheck,
    title: 'Confiança e Segurança',
    description: 'Tratamos os dados dos nossos clientes com o máximo cuidado e responsabilidade.',
  },
];

const timeline = [
  { year: '2024', title: 'Fundação', description: 'A Zelt.AI nasce com a missão de revolucionar o atendimento no WhatsApp usando inteligência artificial.' },
  { year: '2025', title: 'Produto', description: 'Lançamento da plataforma com IA generativa, automação visual e integrações nativas.' },
  { year: '2026', title: 'Escala', description: 'Expansão para novos mercados com suporte a múltiplos idiomas e operações globais.' },
];

const team = [
  { role: 'CEO & Co-Founder', description: 'Visão estratégica e liderança para transformar o atendimento ao cliente no Brasil e além.' },
  { role: 'CTO & Co-Founder', description: 'Arquitetura de IA e engenharia de software para construir uma plataforma de classe mundial.' },
  { role: 'Head of Product', description: 'Experiência do usuário e desenvolvimento de produto para simplificar automações complexas.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <HeaderZelt />

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm font-medium text-gray-600 mb-6">
              <TbHeart className="h-4 w-4 text-[#6300ff]" />
              Sobre Nós
            </div>
            <h1 className="text-4xl font-normal tracking-tight text-[#111111] sm:text-5xl lg:text-6xl leading-[1.1]">
              Humanizando a <span className="text-gray-400">automação</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 font-normal leading-relaxed max-w-2xl">
              A Zelt.AI nasceu da convicção de que inteligência artificial deve ampliar o potencial humano, não substituí-lo. Construímos uma plataforma que automatiza o repetitivo para que sua equipe foque no que realmente importa: conexões humanas que geram resultados.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-semibold text-[#111111] tracking-tight">100+</div>
              <div className="mt-1 text-sm text-gray-500">Empresas atendidas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-semibold text-[#111111] tracking-tight">1M+</div>
              <div className="mt-1 text-sm text-gray-500">Mensagens processadas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-semibold text-[#111111] tracking-tight">94%</div>
              <div className="mt-1 text-sm text-gray-500">Taxa de resolução IA</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-semibold text-[#111111] tracking-tight">24/7</div>
              <div className="mt-1 text-sm text-gray-500">Atendimento ativo</div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 max-w-3xl">
            <h2 className="text-3xl font-normal tracking-tight text-[#111111] sm:text-4xl leading-[1.15]">
              Nossos valores <br />
              <span className="text-gray-400">guiam cada decisão.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="rounded-xl border border-gray-200 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-[#6300ff] mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-medium text-[#111111] tracking-tight mb-2">{value.title}</h3>
                  <p className="text-sm text-gray-500 font-normal leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8 border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 max-w-3xl">
            <h2 className="text-3xl font-normal tracking-tight text-[#111111] sm:text-4xl leading-[1.15]">
              Nossa jornada <br />
              <span className="text-gray-400">até aqui.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {timeline.map((item) => (
              <div key={item.year} className="relative">
                <div className="text-5xl font-semibold text-gray-100 tracking-tight mb-4">{item.year}</div>
                <h3 className="text-lg font-medium text-[#111111] tracking-tight mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 font-normal leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 max-w-3xl">
            <h2 className="text-3xl font-normal tracking-tight text-[#111111] sm:text-4xl leading-[1.15]">
              Time de liderança <br />
              <span className="text-gray-400">apaixonado por resultado.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {team.map((member) => (
              <div key={member.role} className="rounded-xl border border-gray-200 p-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-400 mb-4">
                  <TbUsers className="h-7 w-7" />
                </div>
                <h3 className="text-base font-medium text-[#111111] tracking-tight">{member.role}</h3>
                <p className="mt-2 text-sm text-gray-500 font-normal leading-relaxed">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8 border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-600 mb-6">
                <TbWorld className="h-4 w-4 text-[#6300ff]" />
                Visão Global
              </div>
              <h2 className="text-3xl font-normal tracking-tight text-[#111111] sm:text-4xl leading-[1.15] mb-6">
                Pronto para o <span className="text-gray-400">mercado global</span>
              </h2>
              <p className="text-base text-gray-600 font-normal leading-relaxed mb-8">
                Embora tenhamos raízes no Brasil, nossa plataforma foi construída para operar em escala global. Suporte a múltiplos idiomas, zonas horárias e regulamentações locais.
              </p>
              <Link to="/contact" className="inline-flex rounded bg-[#111] px-6 py-3.5 text-sm font-medium text-white hover:bg-black transition-colors">
                Fale Conosco
              </Link>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-8 flex items-center justify-center min-h-[400px]">
              <span className="text-sm font-medium text-gray-400">
                [ Mapa de Presença Global ]
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-normal tracking-tight text-[#111111] sm:text-4xl leading-[1.15]">
            Junte-se a nós
          </h2>
          <p className="mt-4 text-base text-gray-600 font-normal leading-relaxed max-w-xl mx-auto">
            Estamos construindo o futuro do atendimento ao cliente. Quer fazer parte dessa jornada?
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="rounded bg-[#6300ff] px-8 py-3.5 text-sm font-medium text-white hover:bg-[#5200d5] transition-colors">
              Começar Agora
            </Link>
            <Link to="/contact" className="rounded border border-gray-200 px-8 py-3.5 text-sm font-medium text-black hover:bg-gray-50 transition-colors">
              Trabalhe Conosco
            </Link>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
