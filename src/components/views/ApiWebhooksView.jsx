import { useState, useRef, useEffect } from 'react';
import {
  Zap, Search, X, Check, Settings, ExternalLink, CreditCard,
  Database, Shield, AlertTriangle, ToggleLeft, ToggleRight, Key,
} from 'lucide-react';

const APIS = [
  {
    id: 'mercadopago',
    name: 'Mercado Pago',
    description: 'Receba pagamentos via Pix, cartao de credito e boleto atraves do Mercado Pago.',
    category: 'Pagamentos',
    icon: CreditCard,
    color: '#009EE3',
    bg: 'bg-[#009EE3]/10',
    pricing: 'Pago',
    enabled: false,
    configFields: [
      { key: 'publicKey', label: 'Public Key', type: 'text', placeholder: 'APP_USR-...' },
      { key: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'TG-...' },
      { key: 'webhookUrl', label: 'Webhook URL (opcional)', type: 'text', placeholder: 'https://...', readonly: true, value: 'https://api.zelt.ai/webhooks/mercadopago' },
    ],
  },
  {
    id: 'brasilapi',
    name: 'BrasilAPI',
    description: 'Consulta gratuita de CNPJ, CEP, bancos, boletos e dados publicos brasileiros.',
    category: 'Dados',
    icon: Database,
    color: '#0FA858',
    bg: 'bg-[#0FA858]/10',
    pricing: 'Gratuito',
    enabled: true,
    configFields: [],
  },
];

export default function ApiWebhooksView() {
  const [apis, setApis] = useState(APIS);
  const [search, setSearch] = useState('');
  const [configModal, setConfigModal] = useState(null);
  const [detailApi, setDetailApi] = useState(null);

  const filtered = apis.filter(api => {
    return api.name.toLowerCase().includes(search.toLowerCase()) || api.description.toLowerCase().includes(search.toLowerCase());
  });

  const enabledCount = apis.filter(a => a.enabled).length;

  const handleToggle = (id) => {
    const api = apis.find(a => a.id === id);
    if (api.configFields.length === 0) {
      setApis(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
    } else {
      setConfigModal(api);
    }
  };

  const handleSaveConfig = (id, config) => {
    setApis(prev => prev.map(a => a.id === id ? { ...a, enabled: true, config } : a));
    setConfigModal(null);
  };

  const handleDisconnect = (id) => {
    setApis(prev => prev.map(a => a.id === id ? { ...a, enabled: false, config: null } : a));
    setConfigModal(null);
    setDetailApi(null);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300;1,9..40,400&display=swap');
        .apis-view * { font-family: 'DM Sans', system-ui, sans-serif; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .fade-in { animation: fadeIn 0.15s ease-out; }
      `}</style>
      <div className="apis-view space-y-5">
        <div>
          <h1 className="text-2xl text-gray-900 dark:text-[#ededed]">APIs</h1>
          <p className="text-sm text-gray-400 dark:text-[#666] mt-1">Conecte servicos externos para enriquecer o funcionamento do Zelt.AI</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--zelt-primary)]/10 flex items-center justify-center"><Zap size={18} className="text-[var(--zelt-primary)]" /></div>
            <div><p className="text-xl text-gray-900 dark:text-[#ededed]">{apis.length}</p><p className="text-xs text-gray-400 dark:text-[#666]">APIs disponiveis</p></div>
          </div>
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center"><Check size={18} className="text-emerald-500" /></div>
            <div><p className="text-xl text-emerald-600">{enabledCount}</p><p className="text-xs text-gray-400 dark:text-[#666]">Habilitadas</p></div>
          </div>
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center"><Key size={18} className="text-amber-500" /></div>
            <div><p className="text-xl text-gray-900 dark:text-[#ededed]">{apis.filter(a => a.enabled && a.configFields.length > 0).length}</p><p className="text-xs text-gray-400 dark:text-[#666]">Com chave configurada</p></div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg px-3 py-2">
            <Search size={15} className="text-gray-400 dark:text-[#666]" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar APIs..."
              className="flex-1 text-sm bg-transparent text-gray-900 dark:text-[#ededed] placeholder-gray-400 dark:placeholder-[#555]" />
            {search && <button onClick={() => setSearch('')} className="text-gray-400 dark:text-[#666] hover:text-gray-600 dark:text-[#aaa]"><X size={14} /></button>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {filtered.map(api => {
            const Icon = api.icon;
            return (
              <div key={api.id} className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-5 hover:border-gray-300 dark:hover:border-white/15 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl ${api.bg} flex items-center justify-center`}>
                      <Icon size={22} style={{ color: api.color }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm text-gray-900 dark:text-[#ededed]">{api.name}</h3>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${api.pricing === 'Gratuito' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100' : 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-100'}`}>
                          {api.pricing}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 dark:text-[#666] mt-0.5">{api.description}</p>
                    </div>
                  </div>
                  <button onClick={() => handleToggle(api.id)} className="shrink-0 mt-1">
                    {api.enabled ? <ToggleRight size={28} className="text-[var(--zelt-primary)]" /> : <ToggleLeft size={28} className="text-gray-300 dark:text-[#555]" />}
                  </button>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${api.enabled ? 'bg-emerald-50 dark:bg-emerald-900/200' : 'bg-gray-300'}`}></span>
                    <span className={`text-xs ${api.enabled ? 'text-emerald-600' : 'text-gray-400 dark:text-[#666]'}`}>
                      {api.enabled ? 'Habilitada' : 'Desabilitada'}
                    </span>
                    {api.enabled && api.configFields.length > 0 && (
                      <span className="text-[10px] text-gray-400 dark:text-[#666] bg-gray-100 dark:bg-[#1a1a1a] px-1.5 py-0.5 rounded">Configurada</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {api.enabled && api.configFields.length > 0 && (
                      <button onClick={() => { setDetailApi(api); setConfigModal(api); }}
                        className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-[#808080] hover:text-gray-700 dark:text-[#ccc] transition-colors">
                        <Settings size={12} /> Configurar
                      </button>
                    )}
                    {api.enabled && (
                      <button onClick={() => setDetailApi(api)}
                        className="flex items-center gap-1.5 text-xs text-[var(--zelt-primary)] hover:text-[var(--zelt-primary)] transition-colors">
                        <ExternalLink size={12} /> Detalhes
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Zap size={32} className="mx-auto text-gray-300 dark:text-[#555] mb-3" />
            <p className="text-sm text-gray-500 dark:text-[#808080] mb-1">Nenhuma API encontrada</p>
            <p className="text-xs text-gray-400 dark:text-[#666]">Tente buscar por outro termo ou categoria</p>
          </div>
        )}

        {configModal && (
          <ConfigModal api={configModal} onClose={() => setConfigModal(null)} onSave={handleSaveConfig} />
        )}

        {detailApi && !configModal && (
          <DetailPanel api={detailApi} onClose={() => setDetailApi(null)} onConfigure={() => setConfigModal(detailApi)} onDisconnect={() => handleDisconnect(detailApi.id)} />
        )}
      </div>
    </>
  );
}

function ConfigModal({ api, onClose, onSave }) {
  const [config, setConfig] = useState(() => {
    const initial = {};
    api.configFields.forEach(f => { initial[f.key] = f.value || ''; });
    return initial;
  });
  const [error, setError] = useState('');

  const handleSave = () => {
    const missing = api.configFields.filter(f => f.type !== 'text' || !f.readonly).find(f => !config[f.key]?.trim());
    if (missing) { setError(`Preencha o campo "${missing.label}"`); return; }
    setError('');
    onSave(api.id, config);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl w-[480px] p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${api.bg} flex items-center justify-center`}>
              <api.icon size={20} style={{ color: api.color }} />
            </div>
            <div>
              <h3 className="text-base text-gray-900 dark:text-[#ededed]">{api.name}</h3>
              <p className="text-xs text-gray-400 dark:text-[#666]">Configuracao da integracao</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100 dark:bg-[#1a1a1a] text-gray-400 dark:text-[#666] hover:text-gray-600 dark:text-[#aaa] transition-colors"><X size={16} /></button>
        </div>
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/40 text-sm text-red-600 mb-4">
            <AlertTriangle size={14} /> {error}
          </div>
        )}
        {api.configFields.length === 0 ? (
          <div className="text-center py-6">
            <Check size={32} className="mx-auto text-emerald-500 mb-3" />
            <p className="text-sm text-gray-700 dark:text-[#ccc] mb-1">Esta API nao requer configuracao</p>
            <p className="text-xs text-gray-400 dark:text-[#666]">Apenas ative a integracao para comecar a usar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {api.configFields.map(field => (
              <div key={field.key}>
                <label className="text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider block mb-1.5">{field.label}</label>
                <input type={field.type} value={config[field.key] || ''} onChange={(e) => { setConfig(p => ({ ...p, [field.key]: e.target.value })); setError(''); }}
                  placeholder={field.placeholder} readOnly={field.readonly}
                  className={`w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#141414] text-gray-900 dark:text-[#ededed] placeholder-gray-400 dark:placeholder-[#555] focus:border-[var(--zelt-primary)]/40 transition-colors ${field.readonly ? 'bg-gray-50 dark:bg-[#111] text-gray-500 dark:text-[#808080] cursor-not-allowed' : ''}`} />
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:bg-[#111] transition-colors">Cancelar</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm bg-[var(--zelt-primary)] text-white rounded-lg hover:bg-[var(--zelt-primary)]/80 transition-colors">
            {api.enabled ? 'Salvar' : 'Habilitar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailPanel({ api, onClose, onConfigure, onDisconnect }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl w-[520px] p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${api.bg} flex items-center justify-center`}>
              <api.icon size={24} style={{ color: api.color }} />
            </div>
            <div>
              <h3 className="text-base text-gray-900 dark:text-[#ededed]">{api.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${api.enabled ? 'bg-emerald-50 dark:bg-emerald-900/200' : 'bg-gray-300'}`}></span>
                <span className={`text-xs ${api.enabled ? 'text-emerald-600' : 'text-gray-400 dark:text-[#666]'}`}>{api.enabled ? 'Habilitada' : 'Desabilitada'}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${api.pricing === 'Gratuito' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100' : 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-100'}`}>{api.pricing}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100 dark:bg-[#1a1a1a] text-gray-400 dark:text-[#666] hover:text-gray-600 dark:text-[#aaa] transition-colors"><X size={16} /></button>
        </div>

        <p className="text-sm text-gray-500 dark:text-[#808080] mb-5">{api.description}</p>

        {api.enabled && (
          <div className="bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] rounded-lg p-4 mb-5">
            <p className="text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider mb-2">Status da integracao</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400 dark:text-[#666]">Categoria</p>
                <p className="text-sm text-gray-700 dark:text-[#ccc] capitalize">{api.category}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-[#666]">Campos configurados</p>
                <p className="text-sm text-gray-700 dark:text-[#ccc]">{api.configFields.length > 0 ? `${api.configFields.length} campos` : 'Nenhum campo necessario'}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 justify-end">
          {api.enabled && (
            <button onClick={onDisconnect} className="px-4 py-2 text-sm border border-red-200 dark:border-red-500/40 text-red-500 rounded-lg hover:bg-red-50 dark:bg-red-900/20 transition-colors">
              Desabilitar
            </button>
          )}
          {api.enabled && api.configFields.length > 0 && (
            <button onClick={onConfigure} className="px-4 py-2 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:bg-[#111] transition-colors flex items-center gap-2">
              <Settings size={14} /> Configurar
            </button>
          )}
          {!api.enabled && (
            <button onClick={onConfigure} className="px-4 py-2 text-sm bg-[var(--zelt-primary)] text-white rounded-lg hover:bg-[var(--zelt-primary)]/80 transition-colors flex items-center gap-2">
              <Zap size={14} /> Habilitar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
