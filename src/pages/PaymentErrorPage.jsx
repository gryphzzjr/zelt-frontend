import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  TbX, TbShieldCheck, TbArrowRight, TbHome, TbRotate, TbChecklist,
} from 'react-icons/tb';

function formatBRL(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const PLANS = { professional: 'Professional', enterprise: 'Enterprise' };

export default function PaymentErrorPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [retrying, setRetrying] = useState(false);

  const plan = PLANS[params.get('plan')] || 'Professional';
  const period = params.get('period') === 'annual' ? 'anual' : 'mensal';
  const amount = params.get('amount');

  const retry = () => {
    setRetrying(true);
    setTimeout(() => {
      setRetrying(false);
      navigate(`/checkout?plan=${params.get('plan') || 'professional'}&period=${params.get('period') || 'monthly'}`);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-white font-sans antialiased text-[#111111]">
      <div className="w-full bg-red-600 py-2 px-4 text-center text-xs sm:text-sm font-medium text-white">
        <span className="inline-flex items-center gap-1.5">
          <TbX className="h-4 w-4" />
          Pagamento não concluído
        </span>
      </div>

      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6300ff] text-white">
                <TbChecklist className="h-5 w-5" />
              </div>
              <img src="banner.png" alt="Zelt.AI" className="h-9 w-auto object-contain" />
            </Link>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <TbShieldCheck className="h-5 w-5 text-red-500" />
              <span className="hidden sm:inline">Nenhuma cobrança foi realizada</span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600 ring-8 ring-red-50/60">
            <TbX className="h-10 w-10" strokeWidth={2.5} />
          </div>

          <h1 className="mt-8 text-3xl sm:text-4xl font-normal tracking-tight leading-[1.15]">
            Não foi possível concluir o pagamento
          </h1>
          <p className="mt-4 text-base text-gray-500 leading-relaxed max-w-md">
            Ocorreu um erro ao processar sua transação. Nenhum valor foi cobrado. Verifique os dados e tente novamente.
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">O que pode ter acontecido</p>
          </div>
          <div className="flex flex-col gap-4 px-6 py-6">
            {[
              'Dados do cartão incorretos ou cartão recusado pela operadora.',
              'Saldo insuficiente ou limite de crédito indisponível.',
              'Falha temporária na comunicação com o banco emissor.',
              'Cupom de desconto inválido ou expirado.',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={retry}
            disabled={retrying}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#6300ff] px-8 py-3.5 text-sm font-medium text-white hover:bg-[#5200d6] disabled:opacity-60 transition-all group"
          >
            {retrying ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Redirecionando...
              </>
            ) : (
              <>
                <TbRotate className="h-4 w-4 group-hover:rotate-180 transition-transform" />
                Tentar novamente
              </>
            )}
          </button>
          <Link
            to="/pricing"
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-8 py-3.5 text-sm font-medium text-[#111] hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <TbHome className="h-4 w-4" />
            Ver planos
          </Link>
        </div>

        <p className="mt-8 text-center text-[11px] text-gray-400">
          Se o problema persistir, entre em contato com o suporte em suporte@zelt.ai
        </p>
      </div>
    </div>
  );
}
