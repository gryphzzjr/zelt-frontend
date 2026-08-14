import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeGoogleLogin } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      const token = searchParams.get('token');
      const userParam = searchParams.get('user');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError(decodeURIComponent(errorParam));
        return;
      }

      if (!token || !userParam) {
        setError('Resposta inválida do Google. Tente novamente.');
        return;
      }

      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        await completeGoogleLogin(token, user);
        navigate('/dashboard', { replace: true });
      } catch (err) {
        setError('Erro ao entrar com Google. Tente novamente.');
      }
    };

    run();
  }, [searchParams, completeGoogleLogin, navigate]);

  return (
    <div className="h-screen w-full bg-white flex items-center justify-center font-sans antialiased text-[#111111]">
      <div className="flex flex-col items-center gap-4 px-6 text-center max-w-[340px]">
        {!error && (
          <div className="w-10 h-10 rounded-full border-[3px] border-gray-100 border-t-[#6300ff] animate-spin" />
        )}
        {error ? (
          <>
            <h1 className="text-xl font-medium tracking-tight">Não foi possível entrar</h1>
            <p className="text-sm text-gray-500">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-2 w-full bg-[#111111] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-black transition-all cursor-pointer"
            >
              Voltar para o login
            </button>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-[#6300ff]/10 flex items-center justify-center text-2xl">⚡</div>
            <p className="text-sm text-gray-500">Conectando sua conta Google...</p>
          </>
        )}
      </div>
    </div>
  );
}
