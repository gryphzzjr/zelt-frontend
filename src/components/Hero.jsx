import React from 'react';
import { FadeUp } from './ScrollReveal';

export default function Hero() {
  return (
    <section
      className="relative w-full overflow-hidden bg-white px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
      style={{
        backgroundImage: "url('landing.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
        <div className="absolute inset-0 bg-black/20 z-0" />

      <div className="mx-auto max-w-4xl text-center relative z-10 flex flex-col items-center">

        <FadeUp delay={0} show={true}>
          <h1 className="text-4xl font-normal tracking-tight text-white sm:text-6xl md:text-[68px] leading-[1.1] max-w-3xl">
            Sua plataforma de atendimento não foi criada para <span className="text-purple-200 font-normal">IA</span>
          </h1>
        </FadeUp>

        <FadeUp delay={150} show={true}>
          <p className="mt-8 text-base sm:text-lg font-normal text-white max-w-xl leading-relaxed">
            Zelt.AI é o ecossistema nativo de inteligência artificial para automação e vendas no WhatsApp, em escala global.
          </p>
        </FadeUp>

        <FadeUp delay={300} show={true}>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-12 flex w-full max-w-xl items-center rounded-2xl border border-gray-200 bg-white p-1.5 transition-all duration-300 focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-100"
            >
            <input
                type="email"
                required
                placeholder="Digite seu e-mail corporativo"
                className="flex-1 bg-transparent px-5 py-3.5 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />

            <button
                type="submit"
                className="cursor-pointer rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 px-6 py-3.5 text-[15px] font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:from-purple-700 hover:to-violet-600 active:scale-[0.98]"
            >
                Testar grátis
            </button>
            </form>
        </FadeUp>

      </div>
    </section>
  );
}
