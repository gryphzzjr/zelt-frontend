import { useState } from 'react';
import {
  FileSpreadsheet, Check, RefreshCw, ExternalLink, Search,
  ChevronDown, ChevronRight, Table, Download, Settings, X, Link2,
  Clock, AlertTriangle,
} from 'lucide-react';

const MOCK_SPREADSHEETS = [
  { id: 1, name: 'Base de Conhecimento - Produtos', sheets: ['iPhone 16', 'MacBook Pro', 'iPad Air', 'Apple Watch'], owner: 'Lucas', updated: '2026-07-15 18:30', selected: ['iPhone 16', 'MacBook Pro'] },
  { id: 2, name: 'FAQ - Perguntas Frequentes', sheets: ['Contas e Login', 'Pagamentos', 'Entregas', 'Devolucoes'], owner: 'Lucas', updated: '2026-07-14 10:15', selected: ['Contas e Login', 'Pagamentos', 'Entregas'] },
  { id: 3, name: 'Pricing Table', sheets: ['Planos', 'Add-ons'], owner: 'Lucas', updated: '2026-07-12 09:00', selected: [] },
];

export default function GoogleSheetsView() {
  const [spreadsheets, setSpreadsheets] = useState(MOCK_SPREADSHEETS);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState('');
  const [syncing, setSyncing] = useState(false);

  const totalSelected = spreadsheets.reduce((s, sp) => s + sp.selected.length, 0);

  const toggleSheet = (spId, sheet) => {
    setSpreadsheets(prev => prev.map(sp => {
      if (sp.id !== spId) return sp;
      const sel = sp.selected.includes(sheet) ? sp.selected.filter(s => s !== sheet) : [...sp.selected, sheet];
      return { ...sp, selected: sel };
    }));
  };

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2000);
  };

  const filtered = spreadsheets.filter(sp => sp.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300;1,9..40,400&display=swap');
        .gsheets-view * { font-family: 'DM Sans', system-ui, sans-serif; }
      `}</style>
      <div className="gsheets-view space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-gray-900 dark:text-[#ededed]">Google Sheets</h1>
            <p className="text-sm text-gray-400 dark:text-[#666] mt-1">Sincronize planilhas Google como fonte de conhecimento para a IA</p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-white/[0.06] rounded-lg text-sm text-gray-500 dark:text-[#808080]">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Conectado como <span className="text-gray-700 dark:text-[#ccc]">lucas@zelt.ai</span></span>
            </div>
            <button onClick={handleSync} disabled={syncing || totalSelected === 0} className="flex items-center gap-2 px-4 py-2.5 bg-[#0F9D58] text-white rounded-lg text-sm hover:bg-[#0b8a4a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} /> Sincronizar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0F9D58]/10 flex items-center justify-center"><FileSpreadsheet size={18} className="text-[#0F9D58]" /></div>
            <div><p className="text-xl text-gray-900 dark:text-[#ededed]">{spreadsheets.length}</p><p className="text-xs text-gray-400 dark:text-[#666]">Planilhas</p></div>
          </div>
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--zelt-primary)]/10 flex items-center justify-center"><Table size={18} className="text-[var(--zelt-primary)]" /></div>
            <div><p className="text-xl text-gray-900 dark:text-[#ededed]">{totalSelected}</p><p className="text-xs text-gray-400 dark:text-[#666]">Abas selecionadas</p></div>
          </div>
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-[#111] flex items-center justify-center"><Clock size={18} className="text-gray-400 dark:text-[#666]" /></div>
            <div><p className="text-xl text-gray-900 dark:text-[#ededed]">15/07 18:30</p><p className="text-xs text-gray-400 dark:text-[#666]">Ultima sincronizacao</p></div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 flex items-center gap-2 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg px-3 py-2">
              <Search size={15} className="text-gray-400 dark:text-[#666]" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar planilhas..."
                className="flex-1 text-sm bg-transparent text-gray-900 dark:text-[#ededed] placeholder-gray-400 dark:placeholder-[#555]" />
              {search && <button onClick={() => setSearch('')} className="text-gray-400 dark:text-[#666] hover:text-gray-600 dark:hover:text-[#ccc]"><X size={14} /></button>}
            </div>
          </div>

          <div className="space-y-3">
            {filtered.map(sp => (
              <div key={sp.id} className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-[#1a1a1a]/50 transition-colors" onClick={() => setExpanded(expanded === sp.id ? null : sp.id)}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#0F9D58]/10 flex items-center justify-center shrink-0">
                      <FileSpreadsheet size={16} className="text-[#0F9D58]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900 dark:text-[#ededed]">{sp.name}</p>
                      <p className="text-xs text-gray-400 dark:text-[#666] mt-0.5">{sp.sheets.length} abas | Atualizado: {sp.updated}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {sp.selected.length > 0 && (
                      <span className="text-xs text-[#0F9D58] bg-[#0F9D58]/10 px-2 py-0.5 rounded-full">{sp.selected.length} selecionadas</span>
                    )}
                    {expanded === sp.id ? <ChevronDown size={16} className="text-gray-400 dark:text-[#666]" /> : <ChevronRight size={16} className="text-gray-400 dark:text-[#666]" />}
                  </div>
                </div>
                {expanded === sp.id && (
                  <div className="border-t border-gray-100 dark:border-white/[0.06] p-4">
                    <p className="text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider mb-3">Abas da planilha</p>
                    <div className="space-y-2">
                      {sp.sheets.map(sheet => (
                        <label key={sheet} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-white/[0.06] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors cursor-pointer">
                          <div className="flex items-center gap-2.5">
                            <Table size={14} className="text-gray-400 dark:text-[#666]" />
                            <span className="text-sm text-gray-700 dark:text-[#ccc]">{sheet}</span>
                          </div>
                          <div className="relative">
                            <input type="checkbox" checked={sp.selected.includes(sheet)} onChange={() => toggleSheet(sp.id, sheet)} className="sr-only" />
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${sp.selected.includes(sheet) ? 'bg-[#0F9D58] border-[#0F9D58]' : 'border-gray-300 dark:border-white/20 bg-white dark:bg-[#141414]'}`}>
                              {sp.selected.includes(sheet) && <Check size={12} className="text-white" />}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {totalSelected > 0 && (
          <div className="flex items-center justify-between bg-[#0F9D58]/5 border border-[#0F9D58]/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Check size={18} className="text-[#0F9D58]" />
              <span className="text-sm text-gray-700 dark:text-[#ccc]">{totalSelected} aba{totalSelected !== 1 ? 's' : ''} selecionada{totalSelected !== 1 ? 's' : ''} para sincronizacao</span>
            </div>
            <button onClick={handleSync} disabled={syncing} className="flex items-center gap-2 px-4 py-2 bg-[#0F9D58] text-white text-sm rounded-lg hover:bg-[#0b8a4a] transition-colors disabled:opacity-40">
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Sincronizando...' : 'Sincronizar agora'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
