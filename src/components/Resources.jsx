import React from 'react';
import { FiZap } from 'react-icons/fi';
import { TbMessageChatbot, TbUsers, TbClockShare } from 'react-icons/tb';
import { AnimatedSection } from './ScrollReveal';

export default function Resources() {
  return (
    <section className="w-full bg-white px-4 py-24 sm:px-6 lg:px-8 border-t border-gray-200 font-sans antialiased">
      <div className="mx-auto max-w-7xl">

        <AnimatedSection className="mb-16 max-w-3xl">
          <h2 className="text-3xl font-normal tracking-tight text-[#111111] sm:text-4xl md:text-5xl leading-[1.15]">
            Tudo o que sua operação precisa, <br />
            <span className="text-gray-400">em um ecossistema unificado.</span>
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-6 lg:grid-cols-12">

          {/* Card 1 */}
          <AnimatedSection className="relative sm:col-span-6 lg:col-span-7 min-h-[360px] rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex flex-col justify-end p-8 group">
            <img
              src="https://dr-dsgvo.de/wp-content/uploads/2024/08/ai-training.webp"
              alt="Painel de Controle"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
            />
            <div className="absolute inset-0 bg-black/50 z-0 transition-opacity group-hover:opacity-60" />
            <div className="relative z-10 text-white max-w-md">
              <TbMessageChatbot className="h-6 w-6 text-blue-400 mb-3" />
              <h3 className="text-xl font-medium tracking-tight mb-2">Treinamento de Contexto Avançado</h3>
              <p className="text-sm text-gray-300 font-normal leading-relaxed">
                Suba manuais da sua marca, tabelas de preços ou históricos para alimentar a inteligência artificial. Ela aprende e responde como seu melhor vendedor.
              </p>
            </div>
          </AnimatedSection>

          {/* Card 2 */}
          <AnimatedSection delay={100} className="relative sm:col-span-6 lg:col-span-5 min-h-[360px] rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex flex-col justify-end p-8 group">
            <img
              src="https://prepara.com.br/wp-content/uploads/2025/12/Atendente-de-Clinicas-e-Laboratorios-Online.webp"
              alt="Atendimento Humano"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
            />
            <div className="absolute inset-0 bg-black/40 z-0 transition-opacity group-hover:opacity-50" />
            <div className="relative z-10 text-white">
              <TbUsers className="h-6 w-6 text-emerald-400 mb-3" />
              <h3 className="text-xl font-medium tracking-tight mb-2">Transbordo Impecável</h3>
              <p className="text-sm text-gray-300 font-normal leading-relaxed">
                Quando um cliente solicitar atendimento humano, a IA direciona o chat de forma imediata para a fila de operadores corretos do seu time.
              </p>
            </div>
          </AnimatedSection>

          {/* Card 3 */}
          <AnimatedSection delay={200} className="relative sm:col-span-3 lg:col-span-5 min-h-[320px] rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex flex-col justify-end p-8 group">
            <img
              src="https://cieepr.org.br/wp-content/uploads/2025/04/People-Analytics.jpg"
              alt="Métricas em tempo real"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
            />
            <div className="absolute inset-0 bg-black/40 z-0 transition-opacity group-hover:opacity-50" />
            <div className="relative z-10 text-white">
              <TbClockShare className="h-6 w-6 text-purple-400 mb-3" />
              <h3 className="text-lg font-medium tracking-tight mb-2">Disparos Automatizados</h3>
              <p className="text-sm text-gray-300 font-normal leading-relaxed">
                Envie alertas de carrinhos abandonados, confirmações de Pix ou atualizações de entrega nativamente no WhatsApp de seus clientes.
              </p>
            </div>
          </AnimatedSection>

          {/* Card 4 */}
          <AnimatedSection delay={300} className="relative sm:col-span-3 lg:col-span-7 min-h-[320px] rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex flex-col justify-end p-8 group">
            <img
              src="https://st.depositphotos.com/2288675/2453/i/450/depositphotos_24534561-stock-photo-hand-drawing-empty-diagram.jpg"
              alt="Construção de fluxos"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
            />
            <div className="absolute inset-0 bg-black/50 z-0 transition-opacity group-hover:opacity-60" />
            <div className="relative z-10 text-white max-w-md">
              <FiZap className="h-6 w-6 text-amber-400 mb-3" />
              <h3 className="text-lg font-medium tracking-tight mb-2">Gatilhos Rápidos de Conversação</h3>
              <p className="text-sm text-gray-300 font-normal leading-relaxed">
                Mapeie palavras-chave recorrentes e crie jornadas lógicas instantâneas que tiram dúvidas repetitivas antes mesmo de gerar custos operacionais.
              </p>
            </div>
          </AnimatedSection>

        </div>

      </div>
    </section>
  );
}
