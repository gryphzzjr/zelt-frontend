import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  TbCheck, TbShieldCheck, TbArrowRight, TbHome, TbQrcode, TbCreditCard, TbChecklist,
} from 'react-icons/tb';

function formatBRL(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const PLANS = { starter: 'Starter', professional: 'Professional', enterprise: 'Enterprise' };

export default function PaymentSuccessPage() {
  const [params] = useSearchParams();
  const plan = PLANS[params.get('plan')] || 'Professional';
  const period = params.get('period') === 'annual' ? 'anual' : 'mensal';
  const method = params.get('method');
  const installments = params.get('installments');
  const coupon = params.get('coupon');
  const amount = params.get('amount');
  const orderId = `ZT-${Date.now().toString(36).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-white font-sans antialiased text-[#111111]">
      <div className="w-full bg-emerald-600 py-2 px-4 text-center text-xs sm:text-sm font-medium text-white">
        <span className="inline-flex items-center gap-1.5">
          <TbCheck className="h-4 w-4" />
          Pagamento confirmado com sucesso
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
              <TbShieldCheck className="h-5 w-5 text-emerald-500" />
              <span className="hidden sm:inline">Pagamento verificado</span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60">
              <TbCheck className="h-10 w-10" strokeWidth={2.5} />
            </div>
            <div className="absolute -inset-3 rounded-full border border-emerald-200 animate-pulse" />
          </div>

          <h1 className="mt-8 text-3xl sm:text-4xl font-normal tracking-tight leading-[1.15]">
            Assinatura ativada!
          </h1>
          <p className="mt-4 text-base text-gray-500 leading-relaxed max-w-md">
            Seu plano <span className="font-medium text-[#111]">{plan} {period}</span> está ativo. Já pode configurar sua IA e começar a atender seus clientes.
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Resumo do pedido</p>
          </div>

          <div className="flex flex-col gap-4 px-6 py-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6300ff]/5 text-[#6300ff] border border-[#6300ff]/10">
                  {method === 'pix' ? <TbQrcode className="h-5 w-5" /> : <TbCreditCard className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#111]">Plano {plan}</p>
                  <p className="text-xs text-gray-500">
                    {method === 'pix' ? 'Pix' : `Cartão de Crédito${installments > 1 ? ` · ${installments}x` : ''}`} · {period}
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold text-[#111]">{formatBRL(amount)}</span>
            </div>

            {coupon && (
              <div className="flex items-center justify-between text-sm text-emerald-600">
                <span>Cupom aplicado</span>
                <span className="font-medium">{coupon}</span>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-sm">
              <span className="text-gray-500">Identificador do pedido</span>
              <span className="font-mono text-xs font-medium text-gray-700">{orderId}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Pago
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 rounded-lg bg-[#6300ff] px-8 py-3.5 text-sm font-medium text-white hover:bg-[#5200d6] transition-all group"
          >
            Ir para o painel
            <TbArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-8 py-3.5 text-sm font-medium text-[#111] hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <TbHome className="h-4 w-4" />
            Voltar ao início
          </Link>
        </div>

        <p className="mt-8 text-center text-[11px] text-gray-400">
          Enviamos os detalhes da assinatura e o recibo para o seu e-mail.
        </p>
      </div>
    </div>
  );
}
