import React, { useState, useRef, useEffect } from 'react';
import {
  HiOutlineMailOpen,
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
  HiOutlineRefresh
} from 'react-icons/hi';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://zelt-backend-production.up.railway.app/api/v1';

export default function EmailVerification() {
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);

  const [digits, setDigits] = useState(Array(6).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(38);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const code = digits.join('');
  const isComplete = code.length === 6;

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setError('');
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(6).fill('');
    pasted.split('').forEach((char, i) => (next[i] = char));
    setDigits(next);
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!isComplete) return;

    try {
      setIsVerifying(true);
      setError('');

      const res = await fetch(`${API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, code })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Código inválido');
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      }

      setIsVerified(true);
    } catch (err) {
      setError(err.message || 'Código inválido. Verifique e tente novamente.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;

    try {
      await fetch(`${API_URL}/auth/verify-email/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      setCooldown(38);
      setDigits(Array(6).fill(''));
      setError('');
      inputsRef.current[0]?.focus();
    } catch {
      setError('Erro ao reenviar código. Tente novamente.');
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');

    if (!urlToken) {
      window.location.href = '/';
      return;
    }

    setToken(urlToken);

    const validateToken = async () => {
      try {
        const res = await fetch(
          `${API_URL}/auth/verify-email?token=${urlToken}`
        );

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message);
        }

        setEmail(data.email);
      } catch {
        window.location.href = '/';
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/30 font-sans flex flex-col">
        <header className="sticky top-0 z-10 w-full h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 md:px-10 flex items-center">
          <div className="flex items-center gap-3">
            <img src="/icon.png" className="h-9" />
            <div className="hidden md:flex flex-col leading-tight">
              <span className="text-sm font-semibold text-gray-900">Zelt.ai</span>
              <span className="text-[11px] text-gray-400">Verificação de conta</span>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-10 h-10 rounded-full border-[3px] border-gray-100 border-t-[#6300ff] animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 font-sans flex flex-col">
      {/* HEADER GLOBAL */}
      <header className="sticky top-0 z-10 w-full h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 md:px-10 flex items-center">
        <div className="flex items-center gap-3">
          <img src="/icon.png" className="h-9" />
          <div className="hidden md:flex flex-col leading-tight">
            <span className="text-sm font-semibold text-gray-900">Zelt.ai</span>
            <span className="text-[11px] text-gray-400">Verificação de conta</span>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          {!isVerified ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-8">

              {/* Ícone + título */}
              <div className="flex flex-col items-center text-center">
                <div className="p-3.5 rounded-2xl bg-[#6300ff]/5 text-[#6300ff]">
                  <HiOutlineMailOpen size={26} />
                </div>

                <h1 className="mt-4 text-lg font-bold text-gray-900 tracking-tight">
                  Verifique seu e-mail
                </h1>
                <p className="mt-1.5 text-xs text-gray-500 leading-relaxed max-w-[280px]">
                  Enviamos um código de 6 dígitos para
                  <span className="font-medium text-gray-700"> {email}</span>
                </p>
              </div>

              {/* Form OTP */}
              <form onSubmit={handleVerify} className="mt-7">
                <div className="flex items-center justify-between gap-2" onPaste={handlePaste}>
                  {digits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputsRef.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={`w-11 h-12 sm:w-12 sm:h-14 text-center text-lg font-semibold rounded-xl border transition-all
                        focus:outline-none focus:ring-2
                        ${
                          error
                            ? 'border-red-200 bg-red-50/50 text-red-600 focus:border-red-300 focus:ring-red-100'
                            : 'border-gray-200 text-gray-900 focus:border-[#6300ff]/40 focus:ring-[#6300ff]/10'
                        }`}
                    />
                  ))}
                </div>

                {error && (
                  <p className="mt-3 text-center text-xs font-medium text-red-500">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!isComplete}
                  className="w-full mt-6 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-[#6300ff] hover:bg-[#5200d6] disabled:bg-gray-200 disabled:text-gray-400 rounded-xl transition-all duration-200"
                >
                  Confirmar código
                </button>
              </form>

              {/* Reenvio */}
              <div className="mt-5 pt-5 border-t border-gray-50 flex items-center justify-center">
                <button
                  onClick={handleResend}
                  disabled={cooldown > 0}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#6300ff] disabled:hover:text-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                  <HiOutlineRefresh size={13} />
                  {cooldown > 0 ? `Reenviar código em ${cooldown}s` : 'Reenviar código'}
                </button>
              </div>

              <a
                href="/login"
                className="mt-4 flex items-center justify-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
              >
                <HiOutlineArrowLeft size={13} />
                Voltar para o login
              </a>
            </div>
          ) : (
            /* ESTADO DE SUCESSO */
            <div className="bg-white border border-gray-100 rounded-2xl p-8 flex flex-col items-center text-center">
              <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600">
                <HiOutlineCheckCircle size={28} />
              </div>
              <h1 className="mt-4 text-lg font-bold text-gray-900 tracking-tight">
                E-mail verificado
              </h1>
              <p className="mt-1.5 text-xs text-gray-500 leading-relaxed max-w-[260px]">
                Sua conta foi confirmada com sucesso. Vamos configurar sua empresa.
              </p>

              <button
                onClick={() => {
                  window.location.href = '/onboarding';
                }}
                className="w-full mt-6 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-[#6300ff] hover:bg-[#5200d6] rounded-xl transition-all duration-200"
              >
                Começar configuração
              </button>
            </div>
          )}
        </div>
      </main>

      {/* MODAL DE CARREGAMENTO */}
      {isVerifying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-[280px] bg-white rounded-md border border-gray-100 px-6 py-8 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full border-[3px] border-gray-100 border-t-[#6300ff] animate-spin" />
            <p className="mt-4 text-sm font-semibold text-gray-900">Verificando código</p>
            <p className="mt-1 text-xs text-gray-500 text-center">Aguarde um instante...</p>
          </div>
        </div>
      )}
    </div>
  );
}
