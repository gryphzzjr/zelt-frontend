import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  TbQrcode, TbCreditCard, TbTicket, TbLock, TbCheck, TbChevronDown, TbCopy,
} from 'react-icons/tb';
import { HiOutlineExclamationCircle, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { useToast } from '../components/Toast';

const PLANS = {
  professional: {
    name: 'Professional',
    monthly: 149,
    annual: 131.12,
    features: ['Conversas ilimitadas', '10.000 contatos', '20 GB de base de conhecimento', 'Automações avançadas', 'Relatórios completos'],
  },
  enterprise: {
    name: 'Enterprise',
    monthly: null,
    annual: null,
    features: ['Suporte dedicado com SLA', 'Integrações personalizadas', 'APIs dedicadas', 'Treinamento avançado da IA'],
  },
};

const COUPONS = {
  ZELT10: { percent: 10, label: 'ZELT10' },
  ZELT20: { percent: 20, label: 'ZELT20' },
  LANCADOR: { percent: 15, label: 'LANCADOR' },
};

const INSTALLMENTS = [1, 2, 3, 6, 12];

function formatBRL(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatCardNumber(v) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(v) {
  const d = v.replace(/\D/g, '').slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

function detectBrand(number) {
  const n = number.replace(/\D/g, '');
  if (/^4/.test(n)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n)) return 'Amex';
  if (/^(636368|438935|504175|451416|636297|5067|4576|4011|506699)/.test(n)) return 'Elo';
  return '';
}

function useCountdown(seconds, running) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (!running) return;
    setLeft(seconds);
    const iv = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(iv);
  }, [running, seconds]);
  const mins = Math.floor(left / 60);
  const secs = left % 60;
  return { left, label: `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}` };
}

function FakeQR({ seed, size = 168 }) {
  const cells = 21;
  const matrix = useMemo(() => {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    const rand = () => {
      h ^= h << 13; h >>>= 0;
      h ^= h >> 17;
      h ^= h << 5; h >>>= 0;
      return h / 4294967295;
    };
    const m = Array.from({ length: cells }, () => Array(cells).fill(false));
    const finder = (row, col) => {
      for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) {
        const border = r === 0 || r === 6 || c === 0 || c === 6;
        const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        m[row + r][col + c] = border || core;
      }
    };
    finder(0, 0); finder(0, cells - 7); finder(cells - 7, 0);
    for (let r = 0; r < cells; r++) for (let c = 0; c < cells; c++) {
      const inFinder = (r < 8 && c < 8) || (r < 8 && c >= cells - 8) || (r >= cells - 8 && c < 8);
      if (!inFinder && !m[r][c]) m[r][c] = rand() > 0.5;
    }
    return m;
  }, [seed]);

  const cell = size / cells;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-lg bg-white p-1">
      {matrix.map((row, r) => row.map((on, c) => (
        <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell * 0.92} height={cell * 0.92} fill={on ? '#111111' : 'none'} />
      )))}
    </svg>
  );
}

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { success, error, info } = useToast();

  const planSlug = searchParams.get('plan') || 'professional';
  const period = searchParams.get('period') === 'annual' ? 'annual' : 'monthly';
  const plan = PLANS[planSlug] || PLANS.professional;

  useEffect(() => {
    if (!plan.monthlyPrice) {
      navigate('/enterprise');
    }
  }, [plan, navigate]);

  const [method, setMethod] = useState('pix');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [installments, setInstallments] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [terms, setTerms] = useState(false);

  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [showCvv, setShowCvv] = useState(false);
  const [installmentOpen, setInstallmentOpen] = useState(false);

  const brand = detectBrand(cardNumber);
  const basePrice = period === 'annual' ? plan.annual : plan.monthly;
  const discount = appliedCoupon ? (basePrice * appliedCoupon.percent) / 100 : 0;
  const total = basePrice - discount;
  const installmentValue = total / installments;

  const pixCode = useMemo(() => {
    return `00020126580014BR.GOV.BCB.PIX0136f2a8c9e1-${planSlug}-${Date.now().toString(36)}520400005303986540${String(Math.round(total * 100)).padStart(6, '0')}5802BR5912ZELT.AI6009SAO PAULO62070503***6304ABCD`;
  }, [planSlug, total]);

  const { label: countdownLabel } = useCountdown(899, method === 'pix' && !processing);

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    setCouponError('');
    if (!code) return;
    setCouponLoading(true);
    setTimeout(() => {
      const coupon = COUPONS[code];
      if (coupon) {
        setAppliedCoupon(coupon);
        setCouponInput('');
        success(`Cupom ${coupon.label} aplicado: ${coupon.percent}% de desconto.`);
      } else {
        setAppliedCoupon(null);
        setCouponError('Cupom inválido ou expirado.');
      }
      setCouponLoading(false);
    }, 700);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
    info('Cupom removido.');
  };

  const copyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      success('Código PIX copiado.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      error('Não foi possível copiar automaticamente.');
    }
  };

  const cardValid = cardNumber.replace(/\D/g, '').length === 16
    && cardName.trim().length >= 3
    && cardExpiry.length === 5
    && cardCvv.length >= 3
    && terms;

  const handlePay = () => {
    if (method === 'pix') {
      navigate(`/payment/success?plan=${planSlug}&period=${period}&method=pix&amount=${total.toFixed(2)}&coupon=${appliedCoupon?.label || ''}`);
      return;
    }
    if (!cardValid) {
      error('Preencha corretamente os dados do cartão e aceite os termos.');
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      navigate(`/payment/success?plan=${planSlug}&period=${period}&method=card&amount=${total.toFixed(2)}&installments=${installments}&coupon=${appliedCoupon?.label || ''}`);
    }, 1600);
  };

  const inputCls = 'w-full bg-transparent border-b border-gray-200 py-2.5 text-sm outline-none focus:border-[#6300ff] transition-colors placeholder:text-gray-300';

  return (
    <div className="min-h-screen bg-white font-sans antialiased text-[#111111]">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-8 lg:py-10 flex flex-col min-h-screen">
        {/* CENTERED LOGO */}
        <div className="flex justify-center lg:justify-start">
          <Link to="/" className="inline-block">
            <img src="banner.png" alt="Zelt.AI" className="h-10 w-auto object-contain" />
          </Link>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 lg:gap-24 items-center lg:items-start py-6 lg:py-8">

          {/* LEFT: payment form */}
          <div className="flex flex-col">
            <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-widest text-gray-400">
              <TbLock className="h-3.5 w-3.5 text-[#6300ff]" />
              Checkout seguro
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-normal tracking-tight leading-[1.15]">
              Finalizar assinatura
            </h1>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              Escolha como deseja pagar. Sem fidelidade, cancele quando quiser.
            </p>

            {/* Tabs */}
            <div className="mt-8 flex items-center gap-8 border-b border-gray-100">
              <button
                onClick={() => { setMethod('pix'); setInstallmentOpen(false); }}
                className={`flex items-center gap-2 pb-3.5 text-sm font-medium border-b-2 -mb-px transition-colors ${method === 'pix' ? 'border-[#6300ff] text-[#6300ff]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                <TbQrcode className="h-4 w-4" />
                Pix
              </button>
              <button
                onClick={() => { setMethod('card'); setInstallmentOpen(false); }}
                className={`flex items-center gap-2 pb-3.5 text-sm font-medium border-b-2 -mb-px transition-colors ${method === 'card' ? 'border-[#6300ff] text-[#6300ff]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                <TbCreditCard className="h-4 w-4" />
                Cartão de Crédito
              </button>
            </div>

            {/* Content */}
            <div className="mt-6">
              {method === 'pix' ? (
                <div className="flex flex-col items-start gap-5">
                  <div className="self-center flex flex-col items-center gap-2.5">
                    <div className="rounded-xl border border-gray-100 bg-white p-3">
                      <FakeQR seed={pixCode} />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <span className={`h-1.5 w-1.5 rounded-full ${copied ? 'bg-emerald-500' : 'bg-[#6300ff] animate-pulse'}`} />
                      {copied ? 'Código copiado!' : `Expira em ${countdownLabel}`}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3.5 w-full">
                    <div>
                      <h3 className="text-base font-medium tracking-tight">Pague com Pix</h3>
                      <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                        Escaneie o QR Code com o app do seu banco ou copie o código abaixo.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-gray-500 ml-1">Pix Copia e Cola</label>
                      <button
                        onClick={copyPix}
                        className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-xs font-medium transition-colors ${copied ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-[#111] hover:bg-gray-50 hover:border-gray-300'}`}
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          {copied ? <TbCheck className="h-4 w-4 text-emerald-500 shrink-0" /> : <TbCopy className="h-4 w-4 text-gray-400 shrink-0" />}
                          <span className="font-mono text-[11px] text-gray-400 truncate">{copied ? 'Código copiado!' : pixCode.slice(0, 28) + '…'}</span>
                        </span>
                        <span className="shrink-0">{copied ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>

                    <p className="text-xs text-gray-400 leading-relaxed">
                      Após o pagamento, você será redirecionado automaticamente. Não feche esta página.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6 max-w-md">
                  <div>
                    <h3 className="text-base font-medium tracking-tight">Dados do cartão</h3>
                    <p className="mt-1 text-sm text-gray-500">Insira os dados do seu cartão de crédito.</p>
                  </div>

                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-500 ml-1">Número do cartão</label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="0000 0000 0000 0000"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          className={`${inputCls} pr-16`}
                        />
                        {brand && (
                          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[11px] font-semibold uppercase tracking-wide text-[#6300ff]">
                            {brand}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-500 ml-1">Nome impresso no cartão</label>
                      <input
                        type="text"
                        placeholder="Como está no cartão"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className={inputCls}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-500 ml-1">Validade</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="MM/AA"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                          className={inputCls}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-500 ml-1">CVV</label>
                        <div className="relative">
                          <input
                            type={showCvv ? 'text' : 'password'}
                            inputMode="numeric"
                            placeholder="123"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            className={`${inputCls} pr-8`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowCvv(!showCvv)}
                            className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showCvv ? <HiOutlineEyeOff className="h-4 w-4" /> : <HiOutlineEye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-500 ml-1">Parcelamento</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setInstallmentOpen(!installmentOpen)}
                          className="w-full flex items-center justify-between border-b border-gray-200 py-2.5 text-sm hover:border-gray-300 transition-colors"
                        >
                          <span>{installments}x de {formatBRL(installmentValue)} {installments === 1 ? 'à vista' : 'sem juros'}</span>
                          <TbChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${installmentOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {installmentOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-lg py-1.5 z-10">
                            {INSTALLMENTS.map((n) => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => { setInstallments(n); setInstallmentOpen(false); }}
                                className={`w-full flex items-center justify-between px-3.5 py-2 text-sm hover:bg-gray-50 ${installments === n ? 'text-[#6300ff] font-medium' : 'text-gray-600'}`}
                              >
                                <span>{n}x de {formatBRL(total / n)}</span>
                                {n === 1 && <span className="text-[11px] text-gray-400">à vista</span>}
                                {installments === n && <TbCheck className="h-4 w-4 text-[#6300ff]" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: summary */}
          <div className="h-fit">
            <p className="text-xs font-medium uppercase tracking-widest text-gray-400">Resumo do pedido</p>

            <div className="mt-4">
              <p className="text-lg font-medium tracking-tight">Plano {plan.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {period === 'annual' ? 'Cobrança anual' : 'Cobrança mensal'}
              </p>
            </div>

            <ul className="mt-4 flex flex-col gap-2">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-500">
                  <TbCheck className="h-4 w-4 text-[#6300ff] shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between text-gray-500">
                <span>Plano {plan.name} {period === 'annual' ? 'anual' : 'mensal'}</span>
                <span>{formatBRL(basePrice)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex items-center justify-between text-emerald-600">
                  <span>Cupom {appliedCoupon.label} ({appliedCoupon.percent}%)</span>
                  <span>-{formatBRL(discount)}</span>
                </div>
              )}
              {method === 'card' && installments > 1 && (
                <div className="flex items-center justify-between text-gray-400 text-xs">
                  <span>Parcelas</span>
                  <span>{installments}x de {formatBRL(installmentValue)}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-end justify-between">
              <span className="text-sm text-gray-500">Total {period === 'annual' ? 'hoje' : 'por mês'}</span>
              <div className="flex flex-col items-end">
                {appliedCoupon && <span className="text-xs text-gray-300 line-through">{formatBRL(basePrice)}</span>}
                <span className="text-3xl font-semibold tracking-tight">{formatBRL(total)}</span>
              </div>
            </div>

            {/* Coupon */}
            <div className="mt-6">
              <p className="text-xs font-medium uppercase tracking-widest text-gray-400">Cupom de desconto</p>

              <div className="mt-3">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-100 text-emerald-600">
                        <TbCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-emerald-700">{appliedCoupon.label}</p>
                        <p className="text-[11px] text-emerald-600">{appliedCoupon.percent}% de desconto aplicado</p>
                      </div>
                    </div>
                    <button onClick={removeCoupon} className="text-xs font-medium text-emerald-700 hover:underline">Remover</button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-stretch gap-2 border-b border-gray-200 focus-within:border-[#6300ff] transition-colors">
                      <TbTicket className="h-4 w-4 text-gray-400 self-center shrink-0" />
                      <input
                        type="text"
                        placeholder="Digite seu cupom"
                        value={couponInput}
                        onChange={(e) => { setCouponInput(e.target.value); setCouponError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                        className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-gray-300"
                      />
                      <button
                        onClick={applyCoupon}
                        disabled={couponLoading}
                        className="text-xs font-medium text-[#6300ff] hover:text-[#5200d6] disabled:opacity-50 shrink-0 self-center"
                      >
                        {couponLoading ? (
                          <span className="h-3.5 w-3.5 rounded-full border-2 border-[#6300ff]/30 border-t-[#6300ff] animate-spin" />
                        ) : (
                          'Aplicar'
                        )}
                      </button>
                    </div>
                    {couponError && <p className="mt-2 text-xs font-medium text-red-500">{couponError}</p>}
                    <p className="mt-2 text-[11px] text-gray-300">ZELT10 · ZELT20 · LANCADOR</p>
                  </>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-6 flex flex-col gap-3">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[#6300ff]"
                />
                <span className="text-[11px] text-gray-400 leading-relaxed">
                  Li e aceito os <Link to="/terms" className="text-[#6300ff] hover:underline">Termos de Uso</Link> e a{' '}
                  <Link to="/privacy" className="text-[#6300ff] hover:underline">Política de Privacidade</Link>.
                </span>
              </label>

              <button
                onClick={handlePay}
                disabled={processing || (method === 'card' && !terms)}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#111111] py-3.5 text-sm font-medium text-white hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {processing ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Processando pagamento...
                  </>
                ) : (
                  method === 'pix' ? `Confirmar com Pix · ${formatBRL(total)}` : `Pagar ${formatBRL(total)}`
                )}
              </button>

              <p className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
                <TbLock className="h-3.5 w-3.5" />
                Pagamento criptografado de ponta a ponta
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
