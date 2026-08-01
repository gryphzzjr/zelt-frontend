import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  TbClock, TbShieldCheck, TbHome, TbQrcode, TbRotate, TbChecklist,
} from 'react-icons/tb';

function formatBRL(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const PLANS = { starter: 'Starter', professional: 'Professional', enterprise: 'Enterprise' };

function useCountdown(totalSeconds) {
  const [left, setLeft] = useState(totalSeconds);
  useEffect(() => {
    const iv = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(iv);
  }, []);
  const mins = Math.floor(left / 60);
  const secs = left % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function PaymentWarningPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

  const plan = PLANS[params.get('plan')] || 'Professional';
  const period = params.get('period') === 'annual' ? 'anual' : 'mensal';
  const amount = params.get('amount');
  const countdown = useCountdown(300);

  const checkStatus = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      navigate(`/payment/success?plan=${params.get('plan') || 'professional'}&period=${params.get('period') || 'monthly'}&method=pix&amount=${params.get('amount') || ''}`);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-white font-sans antialiased text-[#111111]">
      <div className="w-full bg-amber-500 py-2 px-4 text-center text-xs sm:text-sm font-medium text-white">
        <span className="inline-flex items-center gap-1.5">
          <TbClock className="h-4 w-4" />
          Aguardando confirmação do pagamento
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
              <TbShieldCheck className="h-5 w-5 text-amber-500" />
              <span className="hidden sm:inline">Pagamento em análise</span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-500 ring-8 ring-amber-50/60">
              <TbQrcode className="h-10 w-10" />
            </div>
            <div className="absolute -inset-3 rounded-full border border-amber-200 animate-ping opacity-60" />
          </div>

          <h1 className="mt-8 text-3xl sm:text-4xl font-normal tracking-tight leading-[1.15]">
            Aguardando confirmação do Pix
          </h1>
          <p className="mt-4 text-base text-gray-500 leading-relaxed max-w-md">
            Recebemos sua intenção de pagamento, mas ainda não confirmamos a transferência. Assim que o banco compensar, sua assinatura será ativada automaticamente.
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4 bg-gray-50 flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status do pagamento</p>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              Em análise
            </span>
          </div>

          <div className="flex flex-col gap-4 px-6 py-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6300ff]/5 text-[#6300ff] border border-[#6300ff]/10">
                  <TbQrcode className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#111]">Plano {plan}</p>
                  <p className="text-xs text-gray-500">Pix · {period}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-[#111]">{formatBRL(amount)}</span>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-sm">
              <span className="text-gray-500">Tempo restante para confirmação</span>
              <span className="font-mono text-sm font-medium text-amber-600">{countdown}</span>
            </div>

            <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3">
              <TbClock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                O Pix é normalmente confirmado em segundos, mas em alguns casos pode levar até alguns minutos. Não é necessário refazer o pagamento.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={checkStatus}
            disabled={checking}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#6300ff] px-8 py-3.5 text-sm font-medium text-white hover:bg-[#5200d6] disabled:opacity-60 transition-all group"
          >
            {checking ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <TbRotate className="h-4 w-4 group-hover:rotate-180 transition-transform" />
                Já paguei, verificar
              </>
            )}
          </button>
          <Link
            to="/checkout?plan=professional&period=monthly"
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-8 py-3.5 text-sm font-medium text-[#111] hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <TbHome className="h-4 w-4" />
            Voltar ao checkout
          </Link>
        </div>

        <p className="mt-8 text-center text-[11px] text-gray-400">
          Precisa de ajuda? Fale com o suporte em suporte@zelt.ai
        </p>
      </div>
    </div>
  );
}
