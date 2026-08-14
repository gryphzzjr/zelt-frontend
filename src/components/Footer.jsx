import React from 'react';
import { Link } from 'react-router-dom';
import { TbBrandWhatsapp, TbArrowUpRight, TbShieldCheck } from 'react-icons/tb';
import { AnimatedSection } from './ScrollReveal';

export default function FooterSection() {
  return (
    <footer className="w-full bg-[#111111] text-gray-400 px-4 pt-24 pb-12 sm:px-6 lg:px-8 font-sans antialiased relative overflow-hidden">

      <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full border border-white/5 pointer-events-none z-0" />

      <div className="mx-auto max-w-7xl relative z-10">

        <AnimatedSection className="rounded-2xl border border-white/10 bg-white/5 p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-20 backdrop-blur-xs">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white mb-4">
              <TbShieldCheck className="h-4 w-4 text-[#6300ff]" />
              Pronto para escala global
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-white tracking-tight leading-[1.2]">
              Pare de perder vendas no WhatsApp por falta de braço operacional.
            </h3>
            <p className="mt-4 text-sm text-gray-400 max-w-lg leading-relaxed">
              Ative sua inteligência artificial em menos de 10 minutos e veja a mágica acontecer ainda hoje. Não precisa de cartão de crédito.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto shrink-0">
            <Link
              to="/register"
              className="rounded bg-[#6300ff] px-6 py-3.5 text-sm font-medium text-white hover:bg-[#5200d5] transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <TbBrandWhatsapp className="h-5 w-5" />
              Criar meu Bot
            </Link>
            <Link
              to="/pricing"
              className="rounded border border-white/10 px-6 py-3.5 text-sm font-medium text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-1"
            >
              Ver Planos
              <TbArrowUpRight className="h-4 w-4 text-gray-500" />
            </Link>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={150} className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 border-t border-white/10 pt-12 mb-12">

          <div className="col-span-2 md:col-span-4 lg:col-span-2 flex flex-col gap-4">
            <Link to="/">
              <img src="/banner-transparent.png" alt="Zelt.AI" className="h-12 object-contain brightness-0 invert max-w-[140px]" />
            </Link>
            <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
              O ecossistema nativo de inteligência artificial para automação e vendas no WhatsApp, em escala global.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold text-white tracking-wider uppercase">Produto</span>
            <Link to="/product" className="text-xs hover:text-white transition-colors">Visão Geral</Link>
            <Link to="/enterprise" className="text-xs hover:text-white transition-colors">Enterprise</Link>
            <Link to="/integrations" className="text-xs hover:text-white transition-colors">Integrações</Link>
            <Link to="/pricing" className="text-xs hover:text-white transition-colors">Preços</Link>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold text-white tracking-wider uppercase">Empresa</span>
            <Link to="/about" className="text-xs hover:text-white transition-colors">Sobre Nós</Link>
            <Link to="/clients" className="text-xs hover:text-white transition-colors">Clientes</Link>
            <Link to="/resources" className="text-xs hover:text-white transition-colors">Recursos</Link>
            <Link to="/contact" className="text-xs hover:text-white transition-colors">Contato</Link>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold text-white tracking-wider uppercase">Legal</span>
            <Link to="/privacy" className="text-xs hover:text-white transition-colors">Privacidade</Link>
            <Link to="/terms" className="text-xs hover:text-white transition-colors">Termos de Uso</Link>
            <Link to="/privacy" className="text-xs hover:text-white transition-colors">LGPD</Link>
          </div>

        </AnimatedSection>

        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-600">
          <span>&copy; 2026 Zelt.AI. Todos os direitos reservados.</span>
          <div className="flex gap-4">
            <Link to="/terms" className="hover:text-gray-400 transition-colors">Termos</Link>
            <Link to="/privacy" className="hover:text-gray-400 transition-colors">Privacidade</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
