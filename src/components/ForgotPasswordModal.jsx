import React, { useState, useEffect } from 'react';
import { TbX, TbMail, TbLock, TbCheck } from 'react-icons/tb';

const API_URL = import.meta.env.VITE_API_URL || 'https://zelt-backend-production.up.railway.app/api/v1';

export default function ForgotPasswordModal({ isOpen, onClose, initialEmail }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(initialEmail || '');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setOtp('');
      setPassword('');
      setConfirmPassword('');
      setError('');
      setResetToken('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Insira seu e-mail.');
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Erro ao enviar e-mail.');
      }

      setResetToken(data.resetToken);
      setStep(2);
      setCooldown(60);
    } catch (err) {
      setError(err.message || 'Erro ao enviar e-mail. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp.trim()) {
      setError('Insira o código de 6 dígitos.');
      return;
    }

    if (otp.length !== 6) {
      setError('O código deve ter 6 dígitos.');
      return;
    }

    if (!password) {
      setError('Insira a nova senha.');
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: resetToken,
          otp,
          password
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Erro ao redefinir senha.');
      }

      setStep(3);
    } catch (err) {
      setError(err.message || 'Erro ao redefinir senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setError('');

    try {
      setIsLoading(true);

      const res = await fetch(`${API_URL}/auth/reset-password/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Erro ao reenviar código.');
      }

      setCooldown(60);
    } catch (err) {
      setError(err.message || 'Erro ao reenviar código.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-[400px] bg-white rounded-xl border border-gray-200 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors z-10"
        >
          <TbX className="h-4 w-4" />
        </button>

        <div className="p-8">

          {/* STEP 1: Digite o e-mail */}
          {step === 1 && (
            <form onSubmit={handleSendEmail} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-[#6300ff] mb-2">
                  <TbLock className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-medium tracking-tight text-[#111111]">Esqueceu a senha?</h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Digite o e-mail associado à sua conta e enviaremos um código para redefinir sua senha.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700 ml-1" htmlFor="reset-email">E-mail corporativo</label>
                <div className="relative group">
                  <TbMail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400 group-focus-within:text-[#6300ff] transition-colors" />
                  <input
                    id="reset-email"
                    type="email"
                    placeholder="nome@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-10 py-2.5 text-sm outline-none focus:border-[#6300ff] focus:ring-4 focus:ring-[#6300ff]/5 transition-all"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-center text-[13px] font-medium text-red-500">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#111111] text-white rounded-lg py-3 text-[15px] font-medium hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 rounded-full border-[2px] border-white/30 border-t-white animate-spin" />
                ) : (
                  'Enviar código'
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Digite o OTP + nova senha */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <h2 className="text-xl font-medium tracking-tight text-[#111111]">Verifique seu e-mail</h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Enviamos um código de 6 dígitos para <span className="font-medium text-[#111]">{email}</span>.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700 ml-1" htmlFor="reset-otp">Código de verificação</label>
                <input
                  id="reset-otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-center font-mono text-[22px] tracking-[6px] outline-none focus:border-[#6300ff] focus:ring-4 focus:ring-[#6300ff]/5 transition-all placeholder:text-gray-300 placeholder:tracking-[6px]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-gray-700 ml-1" htmlFor="reset-password">Nova senha</label>
                  <div className="relative group">
                    <TbLock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400 group-focus-within:text-[#6300ff] transition-colors" />
                    <input
                      id="reset-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-10 py-2.5 text-sm outline-none focus:border-[#6300ff] focus:ring-4 focus:ring-[#6300ff]/5 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-gray-700 ml-1" htmlFor="reset-confirm">Confirmar</label>
                  <div className="relative group">
                    <TbLock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400 group-focus-within:text-[#6300ff] transition-colors" />
                    <input
                      id="reset-confirm"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-10 py-2.5 text-sm outline-none focus:border-[#6300ff] focus:ring-4 focus:ring-[#6300ff]/5 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-gray-400 ml-1 -mt-1">Mínimo de 8 caracteres</p>

              {error && (
                <p className="text-center text-[13px] font-medium text-red-500">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#111111] text-white rounded-lg py-3 text-[15px] font-medium hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 rounded-full border-[2px] border-white/30 border-t-white animate-spin" />
                ) : (
                  'Redefinir senha'
                )}
              </button>

              <div className="text-center">
                {cooldown > 0 ? (
                  <span className="text-[12px] text-gray-400">Reenviar em {cooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-[12px] font-medium text-[#6300ff] hover:underline disabled:opacity-50"
                  >
                    Reenviar código
                  </button>
                )}
              </div>
            </form>
          )}

          {/* STEP 3: Sucesso */}
          {step === 3 && (
            <div className="flex flex-col items-center text-center gap-3 py-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                <TbCheck className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-medium tracking-tight text-[#111111]">Senha redefinida!</h2>
              <p className="text-sm text-gray-500 leading-relaxed max-w-[280px]">
                Sua senha foi atualizada com sucesso. Agora você pode fazer login com a nova senha.
              </p>
              <button
                onClick={onClose}
                className="mt-2 w-full bg-[#111111] text-white rounded-lg py-3 text-[15px] font-medium hover:bg-black transition-all"
              >
                Fazer login
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
