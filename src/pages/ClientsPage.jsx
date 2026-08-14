import React from 'react';
import { Link } from 'react-router-dom';
import { TbStar, TbMessageChatbot, TbClock, TbChartBar } from 'react-icons/tb';
import HeaderZelt from '../components/Header';
import FooterSection from '../components/Footer';

const testimonials = [
  {
    name: 'Carlos Mendes',
    role: 'Diretor de Operações',
    company: 'LojaVirtual Brasil',
    text: 'Reduzimos 78% do tempo de resposta no WhatsApp desde que implementamos o Zelt.AI. A IA responde dúvidas de produto com uma precisão impressionante.',
    metric: '-78% tempo de resposta',
  },
  {
    name: 'Ana Paula Ribeiro',
    role: 'CEO',
    company: 'Clínica Saúde+',
    text: 'O agendamento automatizado pelo WhatsApp transformou nossa operação. Eliminamos faltas com lembretes inteligentes e aumentamos a receita em 35%.',
    metric: '+35% receita',
  },
  {
    name: 'Marcos Oliveira',
    role: 'Head de Atendimento',
    company: 'TechSolutions',
    text: 'A integração com nosso CRM foi impecável. O Zelt.AI sincroniza todos os dados do cliente automaticamente, economizando horas do time.',
    metric: '100% sincronização CRM',
  },
  {
    name: 'Fernanda Costa',
    role: 'Gerente Comercial',
    company: 'E-commerce Express',
    text: 'O transbordo para atendentes humanos é perfeito. Quando a IA não resolve, o cliente é direcionado para o especialista correto com contexto completo.',
    metric: '94% satisfação',
  },
  {
    name: 'Ricardo Santos',
    role: 'Fundador',
    company: 'StartupHub',
    text: 'Como startup, precisávamos de uma solução que escalasse conosco. O teste grátis de 3 dias foi perfeito para começarmos e agora estamos no Professional.',
    metric: '3x crescimento',
  },
  {
    name: 'Juliana Ferreira',
    role: 'Diretora de Marketing',
    company: 'Agência Digital Pro',
    text: 'Os disparos automatizados de WhatsApp são uma mão na roda. Campanhas de remarketing que antes levavam dias agora saem em minutos.',
    metric: '-90% tempo de campanha',
  },
];

const metrics = [
  { value: '4.9/5', label: 'Nota média dos clientes' },
  { value: '94%', label: 'Taxa de resolução IA' },
  { value: '2min', label: 'Tempo médio de resposta' },
  { value: '99.9%', label: 'Uptime da plataforma' },
];

export default function ClientsPage() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <HeaderZelt />

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm font-medium text-gray-600 mb-6">
              <TbStar className="h-4 w-4 text-[#6300ff]" />
              Clientes
            </div>
            <h1 className="text-4xl font-normal tracking-tight text-[#111111] sm:text-5xl lg:text-6xl leading-[1.1]">
              Empresas que confiam <br />
              <span className="text-gray-400">no Zelt.AI</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 font-normal leading-relaxed max-w-2xl">
              De startups a grandes corporações, o Zelt.AI está transformando o atendimento ao cliente em diversas indústrias.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {metrics.map((stat) => (
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
          <div className="mb-12">
            <h2 className="text-2xl font-normal tracking-tight text-[#111111] sm:text-3xl">
              O que nossos clientes dizem
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="rounded-xl border border-gray-200 p-6 flex flex-col">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <TbStar key={i} className="h-4 w-4 text-[#6300ff] fill-[#6300ff]" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 font-normal leading-relaxed flex-1">"{testimonial.text}"</p>
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-[#111111]">{testimonial.name}</div>
                      <div className="text-xs text-gray-500">{testimonial.role} — {testimonial.company}</div>
                    </div>
                    <span className="text-[10px] font-semibold bg-[#6300ff]/10 text-[#6300ff] px-2 py-0.5 rounded-full">
                      {testimonial.metric}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8 border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 max-w-3xl">
            <h2 className="text-3xl font-normal tracking-tight text-[#111111] sm:text-4xl leading-[1.15]">
              Resultados que <br />
              <span className="text-gray-400">falam por si.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <TbMessageChatbot className="h-8 w-8 text-[#6300ff] mb-4" />
              <div className="text-2xl font-semibold text-[#111111] tracking-tight">78%</div>
              <div className="text-sm font-medium text-[#111111] mt-1">Redução no tempo de resposta</div>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">Média entre todos os clientes nos primeiros 30 dias.</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <TbClock className="h-8 w-8 text-[#6300ff] mb-4" />
              <div className="text-2xl font-semibold text-[#111111] tracking-tight">18h+</div>
              <div className="text-sm font-medium text-[#111111] mt-1">Economizadas por semana</div>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">Tempo que equipes recuperam ao automatizar atendimentos repetitivos.</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <TbChartBar className="h-8 w-8 text-[#6300ff] mb-4" />
              <div className="text-2xl font-semibold text-[#111111] tracking-tight">35%</div>
              <div className="text-sm font-medium text-[#111111] mt-1">Aumento em vendas</div>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">Clientes que automatizam upsell e cross-sell via WhatsApp.</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <TbStar className="h-8 w-8 text-[#6300ff] mb-4" />
              <div className="text-2xl font-semibold text-[#111111] tracking-tight">94%</div>
              <div className="text-sm font-medium text-[#111111] mt-1">Satisfação do cliente</div>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">Índice de aprovação nas respostas geradas pela IA.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-normal tracking-tight text-[#111111] sm:text-4xl leading-[1.15]">
            Pronto para esses resultados?
          </h2>
          <p className="mt-4 text-base text-gray-600 font-normal leading-relaxed max-w-xl mx-auto">
            Comece seu teste grátis e veja na prática como o Zelt.AI pode transformar seu atendimento.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="rounded bg-[#6300ff] px-8 py-3.5 text-sm font-medium text-white hover:bg-[#5200d5] transition-colors">
              Teste grátis por 3 dias
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
