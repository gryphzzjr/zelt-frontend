import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare, FileSpreadsheet, Folder, Calendar, Mail,
  Code, ChevronRight, Check, X, RefreshCw, Globe, Link2,
  ExternalLink, Zap, Clock, AlertTriangle,
} from 'lucide-react';

const INTEGRATIONS = [
  {
    id: 'integracoes/whatsapp',
    name: 'WhatsApp',
    description: 'Conecte numeros do WhatsApp via Evolution API para atendimento automatizado.',
    icon: MessageSquare,
    color: '#25D366',
    bg: 'bg-[#25D366]/10',
    connected: true,
    account: '+55 81 91111-1111',
    lastSync: '2026-07-16 14:32',
    status: 'active',
  },
  {
    id: 'integracoes/google-sheets',
    name: 'Google Sheets',
    description: 'Utilize planilhas Google como fonte de conhecimento para a IA.',
    icon: FileSpreadsheet,
    color: '#0F9D58',
    bg: 'bg-[#0F9D58]/10',
    connected: true,
    account: 'lucas@zelt.ai',
    lastSync: '2026-07-16 10:15',
    status: 'active',
  },
  {
    id: 'integracoes/google-drive',
    name: 'Google Drive',
    description: 'Importe documentos, PDFs e arquivos armazenados no Google Drive.',
    icon: Folder,
    color: '#4285F4',
    bg: 'bg-[#4285F4]/10',
    connected: false,
    account: null,
    lastSync: null,
    status: 'inactive',
  },
  {
    id: 'integracoes/google-calendar',
    name: 'Google Calendar',
    description: 'Sincronize compromissos e eventos com o Google Calendar.',
    icon: Calendar,
    color: '#4285F4',
    bg: 'bg-[#4285F4]/10',
    connected: true,
    account: 'lucas@zelt.ai',
    lastSync: '2026-07-16 09:00',
    status: 'active',
  },
  {
    id: 'integracoes/gmail',
    name: 'Gmail',
    description: 'Conecte contas Gmail para envio e recebimento de emails na plataforma.',
    icon: Mail,
    color: '#EA4335',
    bg: 'bg-[#EA4335]/10',
    connected: false,
    account: null,
    lastSync: null,
    status: 'inactive',
  },
  {
    id: 'integracoes/api-webhooks',
    name: 'APIs',
    description: 'Conecte servicos externos como BrasilAPI e Mercado Pago.',
    icon: Code,
    color: 'var(--zelt-primary)',
    bg: 'bg-[var(--zelt-primary)]/10',
    connected: true,
    account: 'Chave ativa',
    lastSync: null,
    status: 'active',
  },
];

export default function IntegracoesView() {
  const navigate = useNavigate();
  const [integrations, setIntegrations] = useState(INTEGRATIONS);

  const connectedCount = integrations.filter(i => i.connected).length;

  const handleSync = (id) => {
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, lastSync: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) } : i));
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300;1,9..40,400&display=swap');
        .integracoes-view * { font-family: 'DM Sans', system-ui, sans-serif; }
      `}</style>
      <div className="integracoes-view space-y-5">

        <div>
          <h1 className="text-2xl text-gray-900 dark:text-[#ededed]">Integracoes</h1>
          <p className="text-sm text-gray-400 dark:text-[#666] mt-1">Central de configuracao de servicos externos do Zelt.AI</p>
        </div>

        <div className="cards-carousel">
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--zelt-primary)]/5 flex items-center justify-center"><Link2 size={18} className="text-[var(--zelt-primary)]" /></div>
            <div><p className="text-xl text-gray-900 dark:text-[#ededed]">{connectedCount}</p><p className="text-xs text-gray-400 dark:text-[#666]">Conectadas</p></div>
          </div>
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-[#111] flex items-center justify-center"><Globe size={18} className="text-gray-400 dark:text-[#666]" /></div>
            <div><p className="text-xl text-gray-900 dark:text-[#ededed]">{integrations.length}</p><p className="text-xs text-gray-400 dark:text-[#666]">Total disponiveis</p></div>
          </div>
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center"><Zap size={18} className="text-emerald-400" /></div>
            <div><p className="text-xl text-emerald-600">{integrations.filter(i => i.status === 'active').length}</p><p className="text-xs text-gray-400 dark:text-[#666]">Ativas</p></div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {integrations.map(integration => {
            const Icon = integration.icon;
            return (
              <button key={integration.id}
                onClick={() => navigate(`/dashboard?view=${integration.id}`)}
                className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-5 text-left hover:border-gray-300 dark:hover:border-white/15 transition-colors group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl ${integration.bg} flex items-center justify-center`}>
                      <Icon size={22} style={{ color: integration.color }} />
                    </div>
                    <div>
                      <h3 className="text-sm text-gray-900 dark:text-[#ededed]">{integration.name}</h3>
                      <p className="text-xs text-gray-400 dark:text-[#666] mt-0.5">{integration.description}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 dark:text-[#555] group-hover:text-gray-500 dark:group-hover:text-[#808080] transition-colors shrink-0 mt-1" />
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/[0.06]">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${integration.connected ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                      <span className={`text-xs ${integration.connected ? 'text-emerald-600' : 'text-gray-400 dark:text-[#666]'}`}>
                        {integration.connected ? 'Conectado' : 'Desconectado'}
                      </span>
                    </div>
                    {integration.account && (
                      <span className="text-xs text-gray-500 dark:text-[#808080]">{integration.account}</span>
                    )}
                  </div>
                  {integration.lastSync && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-[#666]">
                      <Clock size={10} /> {integration.lastSync}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
