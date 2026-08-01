import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Search, Plus, X, Edit3, Trash2, Copy, Clock,
  Calendar, User, MapPin, Link2, ExternalLink,
  ChevronRight, AlertTriangle, CheckCircle, Globe,
  MessageSquare, FileText, History,
} from 'lucide-react';
import { agendaApi, memberApi } from '../../lib/api';

const CALENDAR_COLORS = {
  minha: { label: 'Minha Agenda', color: 'var(--zelt-primary)' },
  equipe: { label: 'Equipe', color: '#10B981' },
  atendimentos: { label: 'Atendimentos', color: '#F59E0B' },
  reunioes: { label: 'Reunioes', color: '#EF4444' },
};

const GROUP_MAP = {
  minha: 'MINHA',
  equipe: 'EQUIPE',
  atendimentos: 'ATENDIMENTOS',
  reunioes: 'REUNIOES',
};

const GROUP_REVERSE = Object.fromEntries(Object.entries(GROUP_MAP).map(([k, v]) => [v, k]));

function initials(name) {
  if (!name) return '??';
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function memberColor(name) {
  const colors = ['#6300ff', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6'];
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function todayStr() { return new Date().toISOString().slice(0, 10); }
function tomorrowStr() { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); }
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); }
function daysFromNow(n) { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }

function toDateString(dateVal) {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  return d.toISOString().slice(0, 10);
}

function getDateLabel(dateStr) {
  const today = todayStr();
  const tomorrow = tomorrowStr();
  if (dateStr === today) return 'Hoje';
  if (dateStr === tomorrow) return 'Amanha';
  const d = new Date(dateStr + 'T12:00:00');
  const now = new Date();
  const diff = Math.ceil((d - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 'Atrasado';
  if (diff <= 7) return d.toLocaleDateString('pt-BR', { weekday: 'long' });
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
}

function getDaysUntil(dateStr) {
  if (!dateStr) return null;
  const now = new Date(); now.setHours(0,0,0,0);
  const d = new Date(dateStr + 'T00:00:00');
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(time) {
  if (!time) return '';
  return time.slice(0, 5);
}

function formatDateTime(dateStr, time) {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T12:00:00');
  const date = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  return time ? `${date} as ${formatTime(time)}` : date;
}

function mapEvent(ev) {
  const calId = GROUP_REVERSE[ev.group] || 'minha';
  const assignee = ev.assignee ? {
    id: ev.assignee.id,
    name: ev.assignee.name,
    initials: initials(ev.assignee.name),
    color: memberColor(ev.assignee.name),
  } : null;
  return {
    ...ev,
    calendarId: calId,
    date: toDateString(ev.date),
    assignee,
    client: ev.clientName ? { name: ev.clientName, id: ev.clientId } : null,
  };
}

function getWorkspaceId() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.workspaceId || null;
  } catch { return null; }
}

export default function AgendaView() {
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('todos');
  const [filterPeriod, setFilterPeriod] = useState('todos');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [rowMenuOpen, setRowMenuOpen] = useState(null);

  const menuRef = useRef(null);
  const wsId = useRef(getWorkspaceId());

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setRowMenuOpen(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadEvents = useCallback(async () => {
    if (!wsId.current) return;
    try {
      const res = await agendaApi.list(wsId.current);
      setEvents((res.events || []).map(mapEvent));
    } catch (err) {
      console.error('Failed to load events:', err);
    }
  }, []);

  const loadMembers = useCallback(async () => {
    if (!wsId.current) return;
    try {
      const res = await memberApi.list(wsId.current);
      const list = (res.members || [])
        .filter(m => m.active)
        .map(m => ({
          id: m.user.id,
          name: m.user.name,
          initials: initials(m.user.name),
          color: memberColor(m.user.name),
        }));
      setMembers(list);
    } catch (err) {
      console.error('Failed to load members:', err);
    }
  }, []);

  useEffect(() => {
    Promise.all([loadEvents(), loadMembers()]).then(() => setLoading(false));
  }, [loadEvents, loadMembers]);

  const filteredEvents = useMemo(() => {
    let result = [...events];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        e.client?.name?.toLowerCase().includes(q)
      );
    }
    if (filterAssignee !== 'todos') {
      if (filterAssignee === 'sem') result = result.filter(e => !e.assignee);
      else result = result.filter(e => e.assignee?.id === filterAssignee);
    }
    if (filterPeriod === 'hoje') result = result.filter(e => e.date === todayStr());
    else if (filterPeriod === 'amanha') result = result.filter(e => e.date === tomorrowStr());
    else if (filterPeriod === 'semana') result = result.filter(e => e.date >= todayStr() && e.date <= daysFromNow(7));
    else if (filterPeriod === 'atrasados') result = result.filter(e => e.date < todayStr());

    result.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.startTime || '').localeCompare(b.startTime || '');
    });

    return result;
  }, [events, searchQuery, filterAssignee, filterPeriod]);

  const counts = useMemo(() => {
    const today = todayStr();
    const weekEnd = daysFromNow(7);
    return {
      hoje: events.filter(e => e.date === today).length,
      proximos: events.filter(e => e.date > today && e.date <= weekEnd).length,
      atrasados: events.filter(e => e.date < today).length,
      semana: events.filter(e => e.date >= today && e.date <= weekEnd).length,
    };
  }, [events]);

  const groupedEvents = useMemo(() => {
    const groups = {};
    filteredEvents.forEach(ev => {
      const label = getDateLabel(ev.date);
      if (!groups[label]) groups[label] = { date: ev.date, label, events: [] };
      groups[label].events.push(ev);
    });
    return Object.values(groups);
  }, [filteredEvents]);

  const handleCreateEvent = async (data) => {
    if (!wsId.current) return;
    try {
      const payload = {
        title: data.title,
        description: data.description,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        group: GROUP_MAP[data.calendarId] || 'MINHA',
        assigneeId: data.assigneeId || null,
        clientName: data.client || null,
        syncGoogle: data.syncGoogle || false,
      };
      const res = await agendaApi.create(wsId.current, payload);
      setEvents(prev => [...prev, mapEvent(res.event)]);
      setShowCreateModal(false);
    } catch (err) {
      console.error('Failed to create event:', err);
    }
  };

  const handleUpdateEvent = async (data) => {
    if (!wsId.current || !data.id) return;
    try {
      const payload = {
        title: data.title,
        description: data.description,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        group: GROUP_MAP[data.calendarId] || 'MINHA',
        assigneeId: data.assigneeId || null,
        clientName: data.client || null,
        syncGoogle: data.syncGoogle || false,
      };
      const res = await agendaApi.update(wsId.current, data.id, payload);
      const updated = mapEvent(res.event);
      setEvents(prev => prev.map(e => e.id === data.id ? updated : e));
      setShowCreateModal(false);
      setEditEvent(null);
      if (selectedEvent?.id === data.id) setSelectedEvent(updated);
    } catch (err) {
      console.error('Failed to update event:', err);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!wsId.current) return;
    try {
      await agendaApi.delete(wsId.current, id);
      setEvents(prev => prev.filter(e => e.id !== id));
      setConfirmDelete(null);
      if (selectedEvent?.id === id) setSelectedEvent(null);
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  const handleDuplicateEvent = async (event) => {
    if (!wsId.current) return;
    try {
      const payload = {
        title: event.title + ' (copia)',
        description: event.description,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        group: GROUP_MAP[event.calendarId] || 'MINHA',
        assigneeId: event.assignee?.id || null,
        clientName: event.client?.name || null,
        syncGoogle: event.syncGoogle || false,
      };
      const res = await agendaApi.create(wsId.current, payload);
      setEvents(prev => [...prev, mapEvent(res.event)]);
      setRowMenuOpen(null);
    } catch (err) {
      console.error('Failed to duplicate event:', err);
    }
  };

  const upcomingEvents = useMemo(() => {
    const today = todayStr();
    return events
      .filter(e => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date) || (a.startTime || '').localeCompare(b.startTime || ''))
      .slice(0, 6);
  }, [events]);

  const overdueEvents = useMemo(() => {
    return events
      .filter(e => e.date < todayStr())
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 4);
  }, [events]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300;1,9..40,400&display=swap');
        .agenda-view * { font-family: 'DM Sans', system-ui, sans-serif; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .fade-in { animation: fadeIn 0.15s ease-out; }
        .slide-in-right { animation: slideInRight 0.2s ease-out; }
        .agenda-view select:focus, .agenda-view input:focus, .agenda-view textarea:focus { outline: none; }
      `}</style>
      <div className="agenda-view flex gap-5">

        {/* MAIN CONTENT */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl text-gray-900">Agenda</h1>
              <p className="text-sm text-gray-400 mt-1">Acompanhe seus compromissos e eventos</p>
            </div>
            <div className="flex items-center gap-2.5">
              <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                <Globe size={15} /> Abrir Google Calendar
              </a>
              <button onClick={() => { setEditEvent(null); setShowCreateModal(true); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-[var(--zelt-primary)] text-white rounded-lg text-sm hover:bg-[var(--zelt-primary-hover)] transition-colors">
                <Plus size={16} /> Novo Evento
              </button>
            </div>
          </div>

          {/* FILTERS */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Buscar eventos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:border-[var(--zelt-primary)]/40 transition-colors" />
            </div>
            <select value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)}
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 cursor-pointer">
              <option value="todos">Responsavel</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              <option value="sem">Sem responsavel</option>
            </select>
            <select value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value)}
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 cursor-pointer">
              <option value="todos">Periodo</option>
              <option value="hoje">Hoje</option>
              <option value="amanha">Amanha</option>
              <option value="semana">Esta semana</option>
              <option value="atrasados">Atrasados</option>
            </select>
          </div>

          {/* STATS + CONTENT */}
          {!loading && events.length > 0 ? (
            <>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Hoje', value: counts.hoje, color: 'text-[var(--zelt-primary)]', bg: 'bg-[var(--zelt-primary)]/5', iconColor: 'text-[var(--zelt-primary)]' },
                  { label: 'Proximos', value: counts.proximos, color: 'text-blue-600', bg: 'bg-blue-50', iconColor: 'text-blue-400' },
                  { label: 'Atrasados', value: counts.atrasados, color: 'text-red-600', bg: 'bg-red-50', iconColor: 'text-red-400' },
                  { label: 'Esta semana', value: counts.semana, color: 'text-gray-900', bg: 'bg-gray-50', iconColor: 'text-gray-400' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                      <Calendar size={18} className={stat.iconColor} />
                    </div>
                    <div>
                      <p className={`text-xl ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-gray-400">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-5">
                {groupedEvents.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                    <Calendar size={32} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-sm text-gray-400">Nenhum evento encontrado.</p>
                  </div>
                ) : groupedEvents.map((group, gi) => {
                  const isToday = group.label === 'Hoje';
                  const isOverdue = group.label === 'Atrasado';
                  return (
                    <div key={gi}>
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className={`text-base ${isToday ? 'text-[var(--zelt-primary)]' : isOverdue ? 'text-red-500' : 'text-gray-700'}`}>{group.label}</h3>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{group.events.length}</span>
                        {isOverdue && <AlertTriangle size={14} className="text-red-400" />}
                      </div>
                      <div className="space-y-2">
                        {group.events.map(ev => {
                          const cal = CALENDAR_COLORS[ev.calendarId];
                          const isOverdueEvent = ev.date < todayStr();
                          return (
                            <div key={ev.id}
                              className={`bg-white border rounded-lg p-4 flex items-center gap-4 group transition-colors cursor-pointer
                                ${isOverdueEvent ? 'border-red-200 hover:border-red-300' : isToday ? 'border-[var(--zelt-primary)]/10 hover:border-[var(--zelt-primary)]/20' : 'border-gray-200 hover:border-gray-300'}`}
                              onClick={() => setSelectedEvent(ev)}>
                              <div className="w-1.5 h-12 rounded-full shrink-0" style={{ background: cal?.color || 'var(--zelt-primary)' }}></div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2.5 mb-1">
                                  <span className={`text-sm ${isOverdueEvent ? 'text-red-500' : 'text-gray-400'}`}>
                                    {formatTime(ev.startTime)} - {formatTime(ev.endTime)}
                                  </span>
                                  {ev.syncGoogle && (
                                    <span className="text-[10px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                                      <Globe size={9} /> Sync
                                    </span>
                                  )}
                                </div>
                                <h4 className={`text-sm truncate ${isOverdueEvent ? 'text-red-600' : 'text-gray-900'}`}>{ev.title}</h4>
                                {ev.description && <p className="text-xs text-gray-400 truncate mt-0.5">{ev.description}</p>}
                                <div className="flex items-center gap-3 mt-1.5">
                                  {ev.assignee && (
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px]"
                                        style={{ background: ev.assignee.color }}>
                                        {ev.assignee.initials}
                                      </div>
                                      <span className="text-xs text-gray-500">{ev.assignee.name}</span>
                                    </div>
                                  )}
                                  {ev.client && (
                                    <div className="flex items-center gap-1">
                                      <User size={10} className="text-gray-400" />
                                      <span className="text-xs text-gray-500">{ev.client.name}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                <div className="relative">
                                  <button onClick={() => setRowMenuOpen(rowMenuOpen === ev.id ? null : ev.id)}
                                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="3" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="13" cy="8" r="1.5"/></svg>
                                  </button>
                                  {rowMenuOpen === ev.id && (
                                    <div ref={menuRef} className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg py-1.5 z-30 shadow-sm fade-in">
                                      <button onClick={() => { setSelectedEvent(ev); setRowMenuOpen(null); }}
                                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                        <Clock size={14} /> Visualizar
                                      </button>
                                      <button onClick={() => { setEditEvent(ev); setShowCreateModal(true); setRowMenuOpen(null); }}
                                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                        <Edit3 size={14} /> Editar
                                      </button>
                                      <button onClick={() => handleDuplicateEvent(ev)}
                                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                        <Copy size={14} /> Duplicar
                                      </button>
                                      <div className="border-t border-gray-100 my-1"></div>
                                      <button onClick={() => { setConfirmDelete(ev); setRowMenuOpen(null); }}
                                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                                        <Trash2 size={14} /> Excluir
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : !loading ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-[var(--zelt-primary)]/5 flex items-center justify-center text-[var(--zelt-primary)] mb-4">
                <Calendar size={24} />
              </div>
              <h3 className="text-sm text-gray-900 mb-1">Nenhum evento</h3>
              <p className="text-sm text-gray-400 max-w-[300px] leading-relaxed mb-1">Agende reunioes, follow-ups e compromissos.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-12 flex justify-center">
              <div className="w-5 h-5 border-2 border-[var(--zelt-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <aside className="w-[300px] shrink-0 space-y-4">

          {/* TODAY */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm text-gray-700">Compromissos de Hoje</h3>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{events.filter(e => e.date === todayStr()).length}</span>
            </div>
            <div className="space-y-2">
              {events.filter(e => e.date === todayStr()).sort((a, b) => (a.startTime || '').localeCompare(b.startTime || '')).length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">Nenhum compromisso hoje.</p>
              ) : events.filter(e => e.date === todayStr()).sort((a, b) => (a.startTime || '').localeCompare(b.startTime || '')).slice(0, 5).map(ev => {
                const cal = CALENDAR_COLORS[ev.calendarId];
                return (
                  <button key={ev.id} onClick={() => setSelectedEvent(ev)}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors text-left">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cal?.color }}></span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 truncate">{ev.title}</p>
                      <p className="text-xs text-gray-400">{formatTime(ev.startTime)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* UPCOMING */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm text-gray-700">Proximos Compromissos</h3>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{upcomingEvents.length}</span>
            </div>
            <div className="space-y-2">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">Nenhum evento proximo.</p>
              ) : upcomingEvents.map(ev => {
                const cal = CALENDAR_COLORS[ev.calendarId];
                const daysUntil = getDaysUntil(ev.date);
                return (
                  <button key={ev.id} onClick={() => setSelectedEvent(ev)}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors text-left">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cal?.color }}></span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 truncate">{ev.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">{formatDate(ev.date)} as {formatTime(ev.startTime)}</span>
                        {daysUntil === 0 && <span className="text-[10px] bg-[var(--zelt-primary)]/10 text-[var(--zelt-primary)] px-1.5 py-0.5 rounded">hoje</span>}
                        {daysUntil === 1 && <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded">amanha</span>}
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-gray-300 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* OVERDUE */}
          {overdueEvents.length > 0 && (
            <div className="bg-white border border-red-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm text-red-600 flex items-center gap-1.5">
                  <AlertTriangle size={14} /> Eventos Atrasados
                </h3>
                <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">{overdueEvents.length}</span>
              </div>
              <div className="space-y-2">
                {overdueEvents.map(ev => {
                  const cal = CALENDAR_COLORS[ev.calendarId];
                  const daysAgoCount = Math.abs(getDaysUntil(ev.date));
                  return (
                    <button key={ev.id} onClick={() => setSelectedEvent(ev)}
                      className="w-full flex items-center gap-2.5 p-2.5 rounded-lg border border-red-100 hover:bg-red-50 transition-colors text-left">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cal?.color }}></span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-red-600 truncate">{ev.title}</p>
                        <p className="text-xs text-red-400">{formatDate(ev.date)} - {daysAgoCount}d atraso</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        {/* DETAIL PANEL */}
        {selectedEvent && (
          <EventDetailPanel event={selectedEvent} onClose={() => setSelectedEvent(null)}
            onEdit={(ev) => { setEditEvent(ev); setShowCreateModal(true); setSelectedEvent(null); }}
            onDuplicate={(ev) => handleDuplicateEvent(ev)}
            onDelete={(ev) => setConfirmDelete(ev)} />
        )}

        {/* CREATE/EDIT MODAL */}
        {showCreateModal && (
          <EventModal event={editEvent} members={members} onClose={() => { setShowCreateModal(false); setEditEvent(null); }}
            onSave={editEvent?.id ? handleUpdateEvent : handleCreateEvent} />
        )}

        {/* CONFIRM DELETE */}
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 fade-in" onClick={() => setConfirmDelete(null)}>
            <div className="bg-white border border-gray-200 rounded-xl w-[400px] p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                  <Trash2 size={18} className="text-red-500" />
                </div>
                <h3 className="text-base text-gray-900">Excluir evento</h3>
              </div>
              <p className="text-sm text-gray-500 mb-5">Tem certeza que deseja excluir "{confirmDelete.title}"? Esta acao nao pode ser desfeita.</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
                <button onClick={() => handleDeleteEvent(confirmDelete.id)} className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Excluir</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ─── DETAIL PANEL ─────────────────────────────────────────────────────────── */

function EventDetailPanel({ event, onClose, onEdit, onDuplicate, onDelete }) {
  const cal = CALENDAR_COLORS[event.calendarId];

  return (
    <div className="fixed inset-0 z-40 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/10 fade-in"></div>
      <div className="relative w-[420px] h-full bg-white border-l border-gray-200 flex flex-col slide-in-right overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: cal?.color }}></span>
            <span className="text-sm text-gray-500">{cal?.label}</span>
            {event.syncGoogle && (
              <span className="text-[10px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                <Globe size={9} /> Sincronizado
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 pt-4 pb-3">
          <h2 className="text-lg text-gray-900">{event.title}</h2>
          {event.description && <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{event.description}</p>}
        </div>

        <div className="px-5 space-y-4 flex-1 overflow-y-auto">
          <div className="space-y-3">
            <DetailRow icon={Calendar} label="Data">
              <span className="text-sm text-gray-700">{formatDate(event.date)}</span>
            </DetailRow>
            <DetailRow icon={Clock} label="Horario">
              <span className="text-sm text-gray-700">{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
            </DetailRow>
            {event.assignee && (
              <DetailRow icon={User} label="Responsavel">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px]"
                    style={{ background: event.assignee.color }}>
                    {event.assignee.initials}
                  </div>
                  <span className="text-sm text-gray-700">{event.assignee.name}</span>
                </div>
              </DetailRow>
            )}
            {event.client && (
              <DetailRow icon={User} label="Cliente">
                <span className="text-sm text-[var(--zelt-primary)]">{event.client.name}</span>
              </DetailRow>
            )}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Criado em</span>
              <span className="text-xs text-gray-500">{event.createdAt ? formatDateTime(toDateString(event.createdAt)) : '-'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Ultima atualizacao</span>
              <span className="text-xs text-gray-500">{event.updatedAt ? formatDateTime(toDateString(event.updatedAt)) : '-'}</span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 flex gap-2">
          <button onClick={() => onEdit(event)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            <Edit3 size={14} /> Editar
          </button>
          <button onClick={() => onDuplicate(event)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            <Copy size={14} /> Duplicar
          </button>
          <button onClick={() => onDelete(event)} className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={15} className="text-gray-400 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
        {children}
      </div>
    </div>
  );
}

/* ─── EVENT MODAL ──────────────────────────────────────────────────────────── */

function EventModal({ event, members, onClose, onSave }) {
  const [form, setForm] = useState({
    title: event?.title || '',
    description: event?.description || '',
    date: event?.date || todayStr(),
    startTime: event?.startTime || '09:00',
    endTime: event?.endTime || '10:00',
    assigneeId: event?.assignee?.id || '',
    client: event?.client?.name || '',
    calendarId: event?.calendarId || 'minha',
    syncGoogle: event?.syncGoogle || false,
  });

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave({
      ...form,
      id: event?.id || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 fade-in" onClick={onClose}>
      <div className="bg-white border border-gray-200 rounded-xl w-[520px] max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base text-gray-900">{event?.id ? 'Editar Evento' : 'Novo Evento'}</h3>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">Titulo *</label>
            <input type="text" value={form.title} onChange={(e) => handleChange('title', e.target.value)} placeholder="Ex: Reuniao com cliente"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:border-[var(--zelt-primary)]/40 transition-colors" required />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">Descricao</label>
            <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} placeholder="Detalhes do evento..."
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:border-[var(--zelt-primary)]/40 resize-none transition-colors" />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">Data</label>
            <input type="date" value={form.date} onChange={(e) => handleChange('date', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 focus:border-[var(--zelt-primary)]/40 transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">Horario de inicio</label>
              <input type="time" value={form.startTime} onChange={(e) => handleChange('startTime', e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 focus:border-[var(--zelt-primary)]/40 transition-colors" />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">Horario de termino</label>
              <input type="time" value={form.endTime} onChange={(e) => handleChange('endTime', e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 focus:border-[var(--zelt-primary)]/40 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">Responsavel</label>
              <select value={form.assigneeId} onChange={(e) => handleChange('assigneeId', e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 focus:border-[var(--zelt-primary)]/40 transition-colors">
                <option value="">Sem responsavel</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">Cliente (opcional)</label>
              <input type="text" value={form.client} onChange={(e) => handleChange('client', e.target.value)} placeholder="Nome do cliente"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:border-[var(--zelt-primary)]/40 transition-colors" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">Grupo</label>
            <select value={form.calendarId} onChange={(e) => handleChange('calendarId', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 focus:border-[var(--zelt-primary)]/40 transition-colors">
              {Object.entries(CALENDAR_COLORS).map(([id, cal]) => (
                <option key={id} value={id}>{cal.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <input type="checkbox" checked={form.syncGoogle} onChange={(e) => handleChange('syncGoogle', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[var(--zelt-primary)] focus:ring-[var(--zelt-primary)]/30" />
            <div>
              <p className="text-sm text-gray-700">Sincronizar com Google Calendar</p>
              <p className="text-xs text-gray-400">O evento sera enviado automaticamente para o Google Calendar conectado.</p>
            </div>
          </div>
        </form>
        <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
          <button onClick={handleSubmit} className="px-4 py-2 text-sm bg-[var(--zelt-primary)] text-white rounded-lg hover:bg-[var(--zelt-primary-hover)] transition-colors">
            {event?.id ? 'Salvar alteracoes' : 'Criar evento'}
          </button>
        </div>
      </div>
    </div>
  );
}
