import { useState } from 'react';
import {
  Mail, RefreshCw, Check, X, ExternalLink, Clock, AlertTriangle,
  Settings, Shield, Link2, Unlink,
} from 'lucide-react';

export default function GmailView() {
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  const handleConnect = () => {
    setConnecting(true);
    setTimeout(() => {
      setConnected(true);
      setAccount({ email: 'lucas@zelt.ai', name: 'Lucas', connectedAt: '2026-07-10 14:30', lastSync: '2026-07-16 12:15' });
      setConnecting(false);
    }, 2000);
  };

  const handleDisconnect = () => {
    setConnected(false);
    setAccount(null);
    setShowDisconnectModal(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300;1,9..40,400&display=swap');
        .gmail-view * { font-family: 'DM Sans', system-ui, sans-serif; }
      `}</style>
      <div className="gmail-view space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-gray-900 dark:text-[#ededed]">Gmail</h1>
            <p className="text-sm text-gray-400 dark:text-[#666] mt-1">Conecte contas Gmail para envio e recebimento de emails na plataforma</p>
          </div>
        </div>

        <div className="cards-carousel">
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#EA4335]/10 flex items-center justify-center"><Mail size={18} className="text-[#EA4335]" /></div>
            <div>
              <p className="text-xl text-gray-900 dark:text-[#ededed]">{connected ? '1' : '0'}</p>
              <p className="text-xs text-gray-400 dark:text-[#666]">Contas conectadas</p>
            </div>
          </div>
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center"><Shield size={18} className="text-emerald-500" /></div>
            <div>
              <p className="text-sm text-gray-900 dark:text-[#ededed]">{connected ? 'Autorizado' : 'Nao conectado'}</p>
              <p className="text-xs text-gray-400 dark:text-[#666]">Status da autenticacao</p>
            </div>
          </div>
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-[#111] flex items-center justify-center"><Clock size={18} className="text-gray-400 dark:text-[#666]" /></div>
            <div>
              <p className="text-sm text-gray-900 dark:text-[#ededed]">{connected ? account.lastSync : '-'}</p>
              <p className="text-xs text-gray-400 dark:text-[#666]">Ultima sincronizacao</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-6">
          {!connected ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-[#EA4335]/10 flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-[#EA4335]" />
              </div>
              <h3 className="text-lg text-gray-900 dark:text-[#ededed] mb-2">Nenhuma conta Gmail conectada</h3>
              <p className="text-sm text-gray-400 dark:text-[#666] max-w-md mx-auto mb-6">
                Conecte sua conta Gmail para enviar e receber emails diretamente pela plataforma Zelt.AI
              </p>
              <button onClick={handleConnect} disabled={connecting}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#EA4335] text-white rounded-lg text-sm hover:bg-[#d63626] transition-colors disabled:opacity-40">
                {connecting ? (
                  <><RefreshCw size={14} className="animate-spin" /> Conectando...</>
                ) : (
                  <><Link2 size={14} /> Conectar com Google</>
                )}
              </button>
              <p className="text-xs text-gray-400 dark:text-[#666] mt-3">Voce sera redirecionado para autorizar o acesso</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#EA4335]/10 flex items-center justify-center">
                    <Mail size={24} className="text-[#EA4335]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base text-gray-900 dark:text-[#ededed]">{account.email}</h3>
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border border-emerald-100">
                        <Check size={10} /> Conectado
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 dark:text-[#666] mt-0.5">{account.name} | Conectado em {account.connectedAt}</p>
                  </div>
                </div>
                <button onClick={() => setShowDisconnectModal(true)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-white/[0.06] rounded-lg text-sm text-red-500 hover:bg-red-50 dark:bg-red-900/20 transition-colors">
                  <Unlink size={14} /> Desconectar
                </button>
              </div>

              <div className="border-t border-gray-100 dark:border-white/[0.06] pt-5">
                <h4 className="text-sm text-gray-700 dark:text-[#ccc] mb-3">Configuracoes</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Receber emails', desc: 'Receber emails na plataforma a partir da conta conectada', enabled: true },
                    { label: 'Enviar emails', desc: 'Permitir envio de emails pela plataforma via Gmail', enabled: true },
                    { label: 'Sincronizar contatos', desc: 'Importar contatos do Gmail para a plataforma', enabled: false },
                  ].map((opt, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-white/[0.06] hover:bg-gray-50 dark:bg-[#111] transition-colors">
                      <div>
                        <p className="text-sm text-gray-700 dark:text-[#ccc]">{opt.label}</p>
                        <p className="text-xs text-gray-400 dark:text-[#666] mt-0.5">{opt.desc}</p>
                      </div>
                      <div className={`w-10 h-5 rounded-full transition-colors ${opt.enabled ? 'bg-[#4285F4]' : 'bg-gray-200 dark:bg-[#232323]'} relative cursor-pointer`}>
                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white dark:bg-[#141414] shadow transition-transform ${opt.enabled ? 'translate-x-5' : ''}`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {showDisconnectModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20 p-0 sm:p-4" onClick={() => setShowDisconnectModal(false)}>
            <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-t-2xl sm:rounded-xl w-full max-w-[420px] p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center"><Unlink size={18} className="text-red-500" /></div>
                <h3 className="text-base text-gray-900 dark:text-[#ededed]">Desconectar Gmail</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-[#808080] mb-5">
                Tem certeza que deseja desconectar <span className="text-gray-700 dark:text-[#ccc]">{account?.email}</span>?
                Os emails nao serao perdidos, mas o envio/recebimento pela plataforma sera interrompido.
              </p>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <button onClick={() => setShowDisconnectModal(false)} className="px-4 py-2 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:bg-[#111] transition-colors">Cancelar</button>
                <button onClick={handleDisconnect} className="px-4 py-2 text-sm bg-red-50 dark:bg-red-900/200 text-white rounded-lg hover:bg-red-600 transition-colors">Desconectar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
