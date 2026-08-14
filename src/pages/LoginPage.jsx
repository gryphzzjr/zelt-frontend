import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { TbArrowRight, TbLock, TbMail } from 'react-icons/tb';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Insira seu e-mail.');
      return;
    }

    if (!password) {
      setError('Insira sua senha.');
      return;
    }

    try {
      setIsLoading(true);

      const result = await login(email, password, {
        country: 'Brasil',
        state: '',
        city: ''
      });

      if (result.requiresVerification) {
        window.location.href = `/verify-email?token=${result.verifyToken}`;
        return;
      }

      // Redireciona para o painel
      navigate('/dashboard', { replace: true });

    } catch (err) {
      setError(err.message || 'Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-white flex font-sans antialiased text-[#111111] overflow-hidden">

      {/* COLUNA DO FORMULÁRIO */}
      <div className="w-full lg:w-[45%] h-full flex items-center justify-center p-6 sm:p-10 lg:p-14">
        <div className="w-full max-w-[380px] flex flex-col gap-5">

          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-medium tracking-tight">Bem-vindo de volta</h1>
            <p className="text-sm text-gray-500">Insira suas credenciais para acessar o painel.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-gray-700 ml-1" htmlFor="email">E-mail corporativo</label>
              <div className="relative group">
                <TbMail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400 group-focus-within:text-[#6300ff] transition-colors" />
                <input
                  id="email"
                  type="email"
                  placeholder="nome@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-10 py-2.5 text-sm outline-none focus:border-[#6300ff] focus:ring-4 focus:ring-[#6300ff]/5 transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[13px] font-medium text-gray-700" htmlFor="password">Senha</label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-medium text-[#6300ff] hover:underline cursor-pointer"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative group">
                <TbLock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400 group-focus-within:text-[#6300ff] transition-colors" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-10 py-2.5 text-sm outline-none focus:border-[#6300ff] focus:ring-4 focus:ring-[#6300ff]/5 transition-all"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-center text-[13px] font-medium text-red-500 -mt-1">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-[#111111] text-white rounded-lg py-3 text-[15px] font-medium hover:bg-black transition-all flex items-center justify-center gap-2 group"
            >
              Entrar na plataforma
              <TbArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <span className="relative bg-white px-3 text-[11px] text-gray-400 uppercase tracking-widest">ou</span>
          </div>

          <a
            href={`${API_URL}/google/login`}
            className="w-full border border-gray-200 bg-white text-gray-700 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-3"
          >
            <FcGoogle className="h-[18px] w-[18px]" />
            Entrar com Google
          </a>

          <p className="text-center text-[13px] text-gray-500">
            Não tem uma conta?{' '}
            <Link to="/register" className="font-medium text-[#6300ff] hover:underline">Criar conta</Link>
          </p>

          <div className="flex gap-5 text-[11px] text-gray-400 uppercase tracking-wider font-medium justify-center">
            <Link to="/terms" className="hover:text-gray-600">Termos</Link>
            <Link to="/privacy" className="hover:text-gray-600">Privacidade</Link>
          </div>
        </div>
      </div>

      {/* COLUNA DA DIREITA: Imagem + Depoimento */}
      <div className="hidden lg:flex lg:w-[55%] h-full relative overflow-hidden bg-gray-900 p-16 flex-col justify-between">
        <img
          src="/auth/mountain.png"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 bg-black/30 z-10" />
        <div className="relative z-20">
          <img
            src="/banner-transparent.png"
            alt="Zelt.AI"
            className="h-10 w-auto object-contain"
          />
        </div>
        <div className="relative z-20 max-w-xl text-white">
          <p className="text-xl sm:text-2xl font-normal leading-relaxed tracking-tight text-gray-100">
            "A automação da Zelt transformou completamente nossa operação. Reduzimos o tempo de resposta no WhatsApp de horas para segundos."
          </p>
          <div className="mt-5 flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-white">Guilherme Fonseca</span>
            <span className="text-xs text-gray-300">Diretor de Operações na Vtex</span>
          </div>
        </div>
      </div>

      {/* MODAL DE CARREGAMENTO */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-[280px] bg-white rounded-md border border-gray-100 px-6 py-8 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full border-[3px] border-gray-100 border-t-[#6300ff] animate-spin" />
            <p className="mt-4 text-sm font-semibold text-gray-900">Entrando...</p>
            <p className="mt-1 text-xs text-gray-500 text-center">Verificando suas credenciais</p>
          </div>
        </div>
      )}

      {/* MODAL ESQUECEU A SENHA */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        initialEmail={email}
      />
    </div>
  );
}
