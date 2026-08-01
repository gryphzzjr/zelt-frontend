import { useState } from 'react';
import {
  Calendar, RefreshCw, Check, X, Clock, ExternalLink, ChevronRight,
  Settings, ToggleLeft, ToggleRight, AlertTriangle,
} from 'lucide-react';

const MOCK_CALENDARS = [
  { id: 1, name: 'Trabalho', color: '#4285F4', enabled: true, eventsCount: 48 },
  { id: 2, name: 'Pessoal', color: '#0F9D58', enabled: false, eventsCount: 12 },
  { id: 3, name: 'Reunioes Zelt', color: 'var(--zelt-primary)', enabled: true, eventsCount: 24 },
  { id: 4, name: 'Feriados', color: '#EA4335', enabled: true, eventsCount: 8 },
];

export default function GoogleCalendarView() {
  const [calendars, setCalendars] = useState(MOCK_CALENDARS);
  const [syncSettings, setSyncSettings] = useState({ autoSync: true, createEvents: true, importEvents: false });
  const [syncing, setSyncing] = useState(false);
  const [lastSync] = useState('16/07/2026 09:00');

  const toggleCalendar = (id) => setCalendars(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  const toggleSetting = (key) => setSyncSettings(prev => ({ ...prev, [key]: !prev[key] }));
  const handleSync = () => { setSyncing(true); setTimeout(() => setSyncing(false), 2000); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300;1,9..40,400&display=swap');
        .gcal-view * { font-family: 'DM Sans', system-ui, sans-serif; }
      `}</style>
      <div className="gcal-view space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-gray-900 dark:text-[#ededed]">Google Calendar</h1>
            <p className="text-sm text-gray-400 dark:text-[#666] mt-1">Sincronize compromissos e eventos com o Google Calendar</p>
          </div>
          <div className="flex items-center gap-2.5">
            <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-white/[0.06] rounded-lg text-sm text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:bg-[#111] transition-colors">
              <ExternalLink size={14} /> Abrir Google Calendar
            </a>
            <button onClick={handleSync} disabled={syncing}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#4285F4] text-white rounded-lg text-sm hover:bg-[#3a76e0] transition-colors disabled:opacity-40">
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} /> Sincronizar agora
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center"><Check size={18} className="text-emerald-500" /></div>
            <div>
              <p className="text-xl text-gray-900 dark:text-[#ededed]">{calendars.filter(c => c.enabled).length}</p>
              <p className="text-xs text-gray-400 dark:text-[#666]">Calendarios ativos</p>
            </div>
          </div>
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#4285F4]/10 flex items-center justify-center"><Calendar size={18} className="text-[#4285F4]" /></div>
            <div>
              <p className="text-xl text-gray-900 dark:text-[#ededed]">{calendars.reduce((s, c) => s + c.eventsCount, 0)}</p>
              <p className="text-xs text-gray-400 dark:text-[#666]">Eventos totais</p>
            </div>
          </div>
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-[#111] flex items-center justify-center"><Clock size={18} className="text-gray-400 dark:text-[#666]" /></div>
            <div>
              <p className="text-sm text-gray-900 dark:text-[#ededed]">{lastSync}</p>
              <p className="text-xs text-gray-400 dark:text-[#666]">Ultima sincronizacao</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <h3 className="text-sm text-gray-700 dark:text-[#ccc] mb-3">Calendarios disponiveis</h3>
            <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl overflow-hidden">
              {calendars.map((cal, i) => (
                <div key={cal.id} className={`flex items-center justify-between p-4 hover:bg-gray-50/50 dark:bg-[#111] transition-colors ${i < calendars.length - 1 ? 'border-b border-gray-50 dark:border-white/[0.06]' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cal.color }}></div>
                    <div>
                      <p className="text-sm text-gray-900 dark:text-[#ededed]">{cal.name}</p>
                      <p className="text-xs text-gray-400 dark:text-[#666]">{cal.eventsCount} eventos</p>
                    </div>
                  </div>
                  <button onClick={() => toggleCalendar(cal.id)}>
                    {cal.enabled ? <ToggleRight size={24} className="text-[#4285F4]" /> : <ToggleLeft size={24} className="text-gray-300 dark:text-[#555]" />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm text-gray-700 dark:text-[#ccc] mb-3">Configuracoes de sincronizacao</h3>
            <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-4 space-y-4">
              {[
                { key: 'autoSync', label: 'Sincronizacao automatica', desc: 'Sincronizar calendarios automaticamente a cada 15 minutos' },
                { key: 'createEvents', label: 'Criar eventos', desc: 'Permitir que a plataforma crie eventos no Google Calendar' },
                { key: 'importEvents', label: 'Importar eventos existentes', desc: 'Importar eventos ja existentes no Google Calendar' },
              ].map(opt => (
                <label key={opt.key} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-white/[0.06] hover:bg-gray-50 dark:bg-[#111] transition-colors cursor-pointer">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-[#ccc]">{opt.label}</p>
                    <p className="text-xs text-gray-400 dark:text-[#666] mt-0.5">{opt.desc}</p>
                  </div>
                  <button onClick={() => toggleSetting(opt.key)}>
                    {syncSettings[opt.key] ? <ToggleRight size={24} className="text-[#4285F4]" /> : <ToggleLeft size={24} className="text-gray-300 dark:text-[#555]" />}
                  </button>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
