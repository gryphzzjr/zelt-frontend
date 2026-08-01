import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search, Plus, ChevronDown, ChevronUp, MoreHorizontal,
  Eye, Edit3, Copy, CheckCircle, Trash2, X,
  ArrowUpDown, ArrowUp, ArrowDown, CheckSquare, Square,
  Calendar, Clock, User, Tag, MessageSquare, Link2,
  AlertTriangle, Filter, ChevronLeft, ChevronRight,
  FileText, Users, Loader2, Send, History,
} from 'lucide-react';
import { taskApi, memberApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

const PRIORITIES = {
  baixa: { label: 'Baixa', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100 dark:border-emerald-500/30', dot: 'bg-emerald-500' },
  media: { label: 'Media', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100 dark:border-yellow-500/30', dot: 'bg-yellow-500' },
  alta: { label: 'Alta', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100 dark:border-orange-500/30', dot: 'bg-orange-500' },
  urgente: { label: 'Urgente', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100 dark:border-red-500/30', dot: 'bg-red-500' },
};

const STATUSES = {
  pendente: { label: 'Pendente', color: 'text-gray-600 dark:text-[#aaa]', bg: 'bg-gray-50 dark:bg-[#111]', border: 'border-gray-200 dark:border-white/[0.06]' },
  em_andamento: { label: 'Em andamento', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100 dark:border-blue-500/30' },
  aguardando_cliente: { label: 'Aguardando cliente', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100 dark:border-amber-500/30' },
  concluida: { label: 'Concluida', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100 dark:border-emerald-500/30' },
  cancelada: { label: 'Cancelada', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100 dark:border-red-500/30' },
};

const ORIGENS = {
  conversa: { label: 'Conversa', color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100 dark:border-violet-500/30' },
  cliente: { label: 'Cliente', color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-100 dark:border-sky-500/30' },
  manual: { label: 'Manual', color: 'text-gray-600 dark:text-[#aaa]', bg: 'bg-gray-50 dark:bg-[#111]', border: 'border-gray-200 dark:border-white/[0.06]' },
};

const BACKEND_STATUS_MAP = {
  pendente: 'PENDING',
  em_andamento: 'IN_PROGRESS',
  aguardando_cliente: 'WAITING_CUSTOMER',
  concluida: 'COMPLETED',
  cancelada: 'CANCELED',
};

const FRONTEND_STATUS_MAP = {
  PENDING: 'pendente',
  IN_PROGRESS: 'em_andamento',
  WAITING_CUSTOMER: 'aguardando_cliente',
  COMPLETED: 'concluida',
  CANCELED: 'cancelada',
};

const BACKEND_PRIORITY_MAP = {
  baixa: 'LOW',
  media: 'MEDIUM',
  alta: 'HIGH',
  urgente: 'URGENT',
};

const FRONTEND_PRIORITY_MAP = {
  LOW: 'baixa',
  MEDIUM: 'media',
  HIGH: 'alta',
  URGENT: 'urgente',
};

const BACKEND_ORIGIN_MAP = {
  conversa: 'CONVERSATION',
  cliente: 'CLIENT',
  manual: 'MANUAL',
};

const FRONTEND_ORIGIN_MAP = {
  CONVERSATION: 'conversa',
  CLIENT: 'cliente',
  MANUAL: 'manual',
};

const MEMBER_COLORS = ['var(--zelt-primary)', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'];

function getMemberColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return MEMBER_COLORS[Math.abs(hash) % MEMBER_COLORS.length];
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function mapBackendTask(t) {
  const assigneeName = t.assignee?.name || '';
  return {
    ...t,
    status: FRONTEND_STATUS_MAP[t.status] || t.status,
    priority: FRONTEND_PRIORITY_MAP[t.priority] || t.priority,
    origin: FRONTEND_ORIGIN_MAP[t.origin] || t.origin,
    assignee: t.assignee ? {
      id: t.assignee.id,
      name: assigneeName,
      initials: getInitials(assigneeName),
      color: getMemberColor(assigneeName),
    } : { id: 0, name: 'Sem responsavel', initials: 'SR', color: '#9CA3AF' },
    tags: Array.isArray(t.tags) ? t.tags : (typeof t.tags === 'string' ? (() => { try { return JSON.parse(t.tags); } catch { return []; } })() : []),
    commentCount: t._count?.comments || 0,
  };
}

function mapFrontendTask(data) {
  const result = {};
  if (data.title !== undefined) result.title = data.title;
  if (data.description !== undefined) result.description = data.description;
  if (data.priority !== undefined) result.priority = BACKEND_PRIORITY_MAP[data.priority] || data.priority;
  if (data.origin !== undefined) result.origin = BACKEND_ORIGIN_MAP[data.origin] || data.origin;
  if (data.assigneeId !== undefined) result.assigneeId = data.assigneeId || null;
  if (data.dueDate !== undefined) result.dueDate = data.dueDate || null;
  if (data.dueTime !== undefined) result.dueTime = data.dueTime || null;
  if (data.tags !== undefined) result.tags = Array.isArray(data.tags) ? data.tags : [];
  if (data.status !== undefined) result.status = BACKEND_STATUS_MAP[data.status] || data.status;
  return result;
}

function getDaysUntil(dateStr) {
  if (!dateStr) return null;
  const now = new Date();
  now.setHours(0,0,0,0);
  const due = new Date(dateStr + 'T00:00:00');
  const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  return diff;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

const PER_PAGE = 8;

export default function TarefasView() {
  const { workspace } = useAuth();
  const workspaceId = workspace?.id;

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [membersList, setMembersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('todos');
  const [filterPriority, setFilterPriority] = useState('todas');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterOrigin, setFilterOrigin] = useState('todas');
  const [filterDue, setFilterDue] = useState('todos');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailPanel, setShowDetailPanel] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [rowMenuOpen, setRowMenuOpen] = useState(null);
  const [rowMenuPos, setRowMenuPos] = useState({ top: 0, right: 0 });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [bulkAction, setBulkAction] = useState(null);
  const [hasData, setHasData] = useState(false);

  const menuRef = useRef(null);

  const showToastMessage = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTasks = async () => {
    if (!workspaceId) return;
    try {
      setLoading(true);
      const res = await taskApi.list(workspaceId);
      const mapped = (res.tasks || []).map(mapBackendTask);
      setTasks(mapped);
      setHasData(mapped.length > 0);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      showToastMessage('Erro ao carregar tarefas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    if (!workspaceId) return;
    try {
      const res = await memberApi.list(workspaceId);
      const members = (res.members || []).map(m => {
        const name = m.user?.name || '';
        return {
          id: m.user?.id || m.id,
          name,
          initials: getInitials(name),
          color: getMemberColor(name),
        };
      });
      setMembersList(members);
    } catch (err) {
      console.error('Failed to fetch members:', err);
    }
  };

  useEffect(() => {
    if (workspaceId) {
      fetchTasks();
      fetchMembers();
    }
  }, [workspaceId]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setRowMenuOpen(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleSelectAll = () => {
    const allIds = filteredTasks.map(t => t.id);
    setSelectedIds(prev => prev.length === allIds.length ? [] : allIds);
  };

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.client?.name?.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }
    if (filterAssignee !== 'todos') result = result.filter(t => t.assignee.id === Number(filterAssignee));
    if (filterPriority !== 'todas') result = result.filter(t => t.priority === filterPriority);
    if (filterStatus !== 'todos') result = result.filter(t => t.status === filterStatus);
    if (filterOrigin !== 'todas') result = result.filter(t => t.origin === filterOrigin);
    if (filterDue === 'atrasadas') result = result.filter(t => getDaysUntil(t.dueDate) < 0 && t.status !== 'concluida' && t.status !== 'cancelada');
    else if (filterDue === 'hoje') result = result.filter(t => getDaysUntil(t.dueDate) === 0);
    else if (filterDue === 'semana') result = result.filter(t => { const d = getDaysUntil(t.dueDate); return d >= 0 && d <= 7; });

    result.sort((a, b) => {
      let valA, valB;
      if (sortKey === 'title') { valA = a.title.toLowerCase(); valB = b.title.toLowerCase(); }
      else if (sortKey === 'assignee') { valA = a.assignee.name.toLowerCase(); valB = b.assignee.name.toLowerCase(); }
      else if (sortKey === 'priority') { valA = ['baixa','media','alta','urgente'].indexOf(a.priority); valB = ['baixa','media','alta','urgente'].indexOf(b.priority); }
      else if (sortKey === 'status') { valA = a.status; valB = b.status; }
      else if (sortKey === 'origin') { valA = a.origin; valB = b.origin; }
      else if (sortKey === 'dueDate') { valA = a.dueDate || '9999'; valB = b.dueDate || '9999'; }
      else if (sortKey === 'createdAt') { valA = a.createdAt; valB = b.createdAt; }
      else if (sortKey === 'client') { valA = a.client?.name || ''; valB = b.client?.name || ''; }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [tasks, searchQuery, filterAssignee, filterPriority, filterStatus, filterOrigin, filterDue, sortKey, sortDir]);

  const totalPages = Math.ceil(filteredTasks.length / PER_PAGE);
  const paginatedTasks = filteredTasks.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const counts = useMemo(() => ({
    total: tasks.length,
    pendentes: tasks.filter(t => t.status === 'pendente').length,
    em_andamento: tasks.filter(t => t.status === 'em_andamento').length,
    concluidas: tasks.filter(t => t.status === 'concluida').length,
    atrasadas: tasks.filter(t => getDaysUntil(t.dueDate) < 0 && t.status !== 'concluida' && t.status !== 'cancelada').length,
    minhas: membersList.length > 0 ? tasks.filter(t => t.assignee.id === membersList[0].id).length : 0,
  }), [tasks, membersList]);

  const handleDelete = async (id) => {
    try {
      await taskApi.delete(workspaceId, id);
      setTasks(prev => prev.filter(t => t.id !== id));
      setConfirmDelete(null);
      if (showDetailPanel?.id === id) setShowDetailPanel(null);
      showToastMessage('Tarefa excluida');
    } catch (err) {
      console.error('Failed to delete task:', err);
      showToastMessage('Erro ao excluir tarefa', 'error');
    }
  };

  const handleBulkDelete = async () => {
    try {
      for (const id of selectedIds) {
        await taskApi.delete(workspaceId, id);
      }
      setTasks(prev => prev.filter(t => !selectedIds.includes(t.id)));
      setSelectedIds([]);
      setBulkAction(null);
      setConfirmDelete(null);
      showToastMessage('Tarefas excluidas');
    } catch (err) {
      console.error('Failed to bulk delete:', err);
      showToastMessage('Erro ao excluir tarefas', 'error');
    }
  };

  const handleBulkStatus = async (status) => {
    try {
      for (const id of selectedIds) {
        await taskApi.update(workspaceId, id, { status: BACKEND_STATUS_MAP[status] || status });
      }
      await fetchTasks();
      setSelectedIds([]);
      setBulkAction(null);
      showToastMessage('Status atualizado');
    } catch (err) {
      console.error('Failed to bulk update status:', err);
      showToastMessage('Erro ao atualizar status', 'error');
    }
  };

  const handleComplete = async (id) => {
    try {
      await taskApi.update(workspaceId, id, { status: 'COMPLETED' });
      await fetchTasks();
      setRowMenuOpen(null);
      showToastMessage('Tarefa concluida');
    } catch (err) {
      console.error('Failed to complete task:', err);
      showToastMessage('Erro ao concluir tarefa', 'error');
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const data = mapFrontendTask({
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        origin: taskData.origin || 'manual',
        assigneeId: taskData.assigneeId,
        dueDate: taskData.dueDate,
        dueTime: taskData.dueTime,
        tags: taskData.tags,
      });
      await taskApi.create(workspaceId, data);
      await fetchTasks();
      setShowCreateModal(false);
      showToastMessage('Tarefa criada');
    } catch (err) {
      console.error('Failed to create task:', err);
      showToastMessage('Erro ao criar tarefa', 'error');
    }
  };

  const handleDuplicate = async (task) => {
    try {
      const data = {
        title: task.title + ' (copia)',
        description: task.description,
        priority: BACKEND_PRIORITY_MAP[task.priority] || task.priority,
        origin: BACKEND_ORIGIN_MAP[task.origin] || task.origin,
        assigneeId: task.assignee?.id || null,
        dueDate: task.dueDate,
        dueTime: task.dueTime,
        tags: task.tags,
      };
      await taskApi.create(workspaceId, data);
      await fetchTasks();
      setRowMenuOpen(null);
      showToastMessage('Tarefa duplicada');
    } catch (err) {
      console.error('Failed to duplicate task:', err);
      showToastMessage('Erro ao duplicar tarefa', 'error');
    }
  };

  const renderSortIcon = (key) => {
    if (sortKey !== key) return <ArrowUpDown size={13} className="text-gray-300 dark:text-[#555] ml-1" />;
    return sortDir === 'asc' ? <ArrowUp size={13} className="text-[var(--zelt-primary)] ml-1" /> : <ArrowDown size={13} className="text-[var(--zelt-primary)] ml-1" />;
  };

  const SortTh = ({ label, sortKey: key }) => (
    <th className="px-4 py-3 text-left text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider cursor-pointer select-none hover:text-gray-600 transition-colors whitespace-nowrap"
      onClick={() => toggleSort(key)}>
      <div className="flex items-center">{label}{renderSortIcon(key)}</div>
    </th>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300;1,9..40,400&display=swap');
        .tarefas-view * { font-family: 'DM Sans', system-ui, sans-serif; }
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .slide-in-right { animation: slideInRight 0.2s ease-out; }
        .fade-in { animation: fadeIn 0.15s ease-out; }
        .tarefas-view input[type="text"]:focus,
        .tarefas-view select:focus { outline: none; }
      `}</style>

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg text-xs border ${
          toast.type === 'error'
            ? 'bg-red-50 text-red-600 border-red-200 dark:border-red-500/40'
            : 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:border-emerald-500/40'
        }`} style={{ animation: 'fadeIn 0.15s ease-out' }}>
          {toast.message}
        </div>
      )}

      <div className="tarefas-view space-y-5">

        {loading && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-7 w-32 bg-gray-100 dark:bg-[#1a1a1a] rounded animate-pulse"></div>
                <div className="h-4 w-56 bg-gray-100 dark:bg-[#1a1a1a] rounded mt-2 animate-pulse"></div>
              </div>
              <div className="h-10 w-32 bg-gray-100 dark:bg-[#1a1a1a] rounded-lg animate-pulse"></div>
            </div>
            <div className="flex gap-2.5">
              <div className="h-10 w-64 bg-gray-100 dark:bg-[#1a1a1a] rounded-lg animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-100 dark:bg-[#1a1a1a] rounded-lg animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-100 dark:bg-[#1a1a1a] rounded-lg animate-pulse"></div>
            </div>
            <div className="grid grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#1a1a1a] animate-pulse"></div>
                  <div>
                    <div className="h-6 w-8 bg-gray-100 dark:bg-[#1a1a1a] rounded animate-pulse mb-1"></div>
                    <div className="h-3 w-16 bg-gray-100 dark:bg-[#1a1a1a] rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl overflow-hidden">
              <div className="p-5 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-4 h-4 bg-gray-100 dark:bg-[#1a1a1a] rounded animate-pulse"></div>
                    <div className="h-4 flex-1 bg-gray-100 dark:bg-[#1a1a1a] rounded animate-pulse"></div>
                    <div className="h-4 w-24 bg-gray-100 dark:bg-[#1a1a1a] rounded animate-pulse"></div>
                    <div className="h-4 w-20 bg-gray-100 dark:bg-[#1a1a1a] rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!loading && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl text-gray-900 dark:text-[#ededed]">Tarefas</h1>
                <p className="text-sm text-gray-400 dark:text-[#666] mt-1">Gerencie todas as atividades da equipe</p>
              </div>
              <button onClick={() => { setEditTask(null); setShowCreateModal(true); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-[var(--zelt-primary)] text-white rounded-lg text-sm hover:bg-[var(--zelt-primary-hover)] transition-colors">
                <Plus size={16} /> Nova Tarefa
              </button>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="relative flex-1 min-w-[240px] max-w-sm">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#666]" />
                <input type="text" placeholder="Buscar tarefas..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#141414] text-gray-900 dark:text-[#ededed] placeholder-gray-400 dark:placeholder-[#555] focus:border-[var(--zelt-primary)]/40 transition-colors" />
              </div>
              <select value={filterAssignee} onChange={(e) => { setFilterAssignee(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#141414] text-gray-600 dark:text-[#aaa] cursor-pointer">
                <option value="todos">Responsavel</option>
                {membersList.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <select value={filterPriority} onChange={(e) => { setFilterPriority(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#141414] text-gray-600 dark:text-[#aaa] cursor-pointer">
                <option value="todas">Prioridade</option>
                {Object.entries(PRIORITIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#141414] text-gray-600 dark:text-[#aaa] cursor-pointer">
                <option value="todos">Status</option>
                {Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <select value={filterOrigin} onChange={(e) => { setFilterOrigin(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#141414] text-gray-600 dark:text-[#aaa] cursor-pointer">
                <option value="todas">Origem</option>
                {Object.entries(ORIGENS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <select value={filterDue} onChange={(e) => { setFilterDue(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#141414] text-gray-600 dark:text-[#aaa] cursor-pointer">
                <option value="todos">Prazo</option>
                <option value="atrasadas">Atrasadas</option>
                <option value="hoje">Vence hoje</option>
                <option value="semana">Proximos 7 dias</option>
              </select>
            </div>

            {hasData ? (
              <>
            <div className="grid grid-cols-6 gap-3">
              {[
                { label: 'Total', value: counts.total, color: 'text-gray-900 dark:text-[#ededed]', icon: FileText, iconColor: 'text-gray-400 dark:text-[#666]' },
                { label: 'Pendentes', value: counts.pendentes, color: 'text-gray-600 dark:text-[#aaa]', icon: Clock, iconColor: 'text-gray-400 dark:text-[#666]' },
                { label: 'Em andamento', value: counts.em_andamento, color: 'text-blue-600', icon: Loader2, iconColor: 'text-blue-400' },
                { label: 'Concluidas', value: counts.concluidas, color: 'text-emerald-600', icon: CheckCircle, iconColor: 'text-emerald-400' },
                { label: 'Atrasadas', value: counts.atrasadas, color: 'text-red-600', icon: AlertTriangle, iconColor: 'text-red-400' },
                { label: 'Minhas', value: counts.minhas, color: 'text-[var(--zelt-primary)]', icon: User, iconColor: 'text-[var(--zelt-primary)]' },
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-[#111] flex items-center justify-center shrink-0">
                    <stat.icon size={18} className={stat.iconColor} />
                  </div>
                  <div>
                    <p className={`text-xl ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-gray-400 dark:text-[#666]">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {selectedIds.length > 0 && (
              <div className="bg-[var(--zelt-primary)]/[0.03] border border-[var(--zelt-primary)]/10 rounded-lg px-5 py-3 flex items-center justify-between fade-in">
                <span className="text-sm text-[var(--zelt-primary)]">{selectedIds.length} tarefa(s) selecionada(s)</span>
                <div className="flex items-center gap-2">
                  <select onChange={(e) => { if (e.target.value) { handleBulkStatus(e.target.value); e.target.value = ''; } }} defaultValue=""
                    className="px-3 py-1.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded bg-white dark:bg-[#141414] text-gray-600 dark:text-[#aaa]">
                    <option value="" disabled>Alterar status</option>
                    {Object.entries(STATUSES).filter(([k]) => k !== 'concluida' && k !== 'cancelada').map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    <option value="concluida">Concluir</option>
                    <option value="cancelada">Cancelar</option>
                  </select>
                  <button onClick={() => { handleBulkStatus('concluida'); }}
                    className="px-3 py-1.5 text-sm border border-emerald-200 dark:border-emerald-500/40 text-emerald-600 rounded hover:bg-emerald-50 transition-colors">
                    Concluir
                  </button>
                  <button onClick={() => setConfirmDelete({ type: 'bulk' })}
                    className="px-3 py-1.5 text-sm border border-red-200 dark:border-red-500/40 text-red-500 rounded hover:bg-red-50 transition-colors">
                    Excluir
                  </button>
                  <button onClick={() => setSelectedIds([])} className="p-1.5 text-gray-400 dark:text-[#666] hover:text-gray-600 rounded hover:bg-gray-100 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-[#111] border-b border-gray-100 dark:border-white/[0.06]">
                    <tr>
                      <th className="px-4 py-3 w-10">
                        <button onClick={toggleSelectAll} className="text-gray-400 dark:text-[#666] hover:text-gray-600">
                          {selectedIds.length === paginatedTasks.length && paginatedTasks.length > 0
                            ? <CheckSquare size={16} className="text-[var(--zelt-primary)]" />
                            : <Square size={16} />}
                        </button>
                      </th>
                      <SortTh label="Titulo" sortKey="title" />
                      <SortTh label="Cliente" sortKey="client" />
                      <SortTh label="Responsavel" sortKey="assignee" />
                      <SortTh label="Prioridade" sortKey="priority" />
                      <SortTh label="Status" sortKey="status" />
                      <SortTh label="Origem" sortKey="origin" />
                      <SortTh label="Prazo" sortKey="dueDate" />
                      <SortTh label="Criacao" sortKey="createdAt" />
                      <th className="px-4 py-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {paginatedTasks.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-6 py-16 text-center">
                          <FileText size={32} className="mx-auto text-gray-300 dark:text-[#555] mb-3" />
                          <p className="text-sm text-gray-400 dark:text-[#666]">Nenhuma tarefa encontrada.</p>
                        </td>
                      </tr>
                    ) : paginatedTasks.map((task) => {
                      const isSelected = selectedIds.includes(task.id);
                      const daysUntil = getDaysUntil(task.dueDate);
                      const isOverdue = daysUntil < 0 && task.status !== 'concluida' && task.status !== 'cancelada';
                      const isDueSoon = daysUntil >= 0 && daysUntil <= 2 && task.status !== 'concluida' && task.status !== 'cancelada';

                      return (
                        <tr key={task.id}
                          className={`group transition-colors cursor-pointer ${isSelected ? 'bg-[var(--zelt-primary)]/[0.02]' : isOverdue ? 'bg-red-50/30' : 'hover:bg-gray-50/50 dark:hover:bg-[#1a1a1a]'}`}
                          onClick={() => setShowDetailPanel(task)}>
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => toggleSelect(task.id)} className="text-gray-400 dark:text-[#666] hover:text-gray-600">
                              {isSelected
                                ? <CheckSquare size={16} className="text-[var(--zelt-primary)]" />
                                : <Square size={16} />}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className={`text-sm text-gray-900 dark:text-[#ededed] ${isOverdue ? 'text-red-600' : ''}`}>{task.title}</span>
                              {task.tags.length > 0 && (
                                <div className="flex gap-1.5 mt-1.5">
                                  {task.tags.slice(0, 2).map((tag, i) => (
                                    <span key={i} className="text-xs bg-gray-100 dark:bg-[#1a1a1a] text-gray-500 dark:text-[#808080] px-2 py-0.5 rounded">{tag}</span>
                                  ))}
                                  {task.tags.length > 2 && <span className="text-xs text-gray-400 dark:text-[#666]">+{task.tags.length - 2}</span>}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-sm ${task.client ? 'text-gray-700 dark:text-[#ccc]' : 'text-gray-300 dark:text-[#555]'}`}>
                              {task.client?.name || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px]"
                                style={{ background: task.assignee.color }}>
                                {task.assignee.initials}
                              </div>
                              <span className="text-sm text-gray-600 dark:text-[#aaa]">{task.assignee.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded border ${PRIORITIES[task.priority].color} ${PRIORITIES[task.priority].bg} ${PRIORITIES[task.priority].border}`}>
                              <span className={`w-2 h-2 rounded-full ${PRIORITIES[task.priority].dot}`}></span>
                              {PRIORITIES[task.priority].label}
                            </span>
                          </td>
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <span className={`text-xs px-2 py-1 rounded border ${STATUSES[task.status].color} ${STATUSES[task.status].bg} ${STATUSES[task.status].border}`}>
                              {STATUSES[task.status].label}
                            </span>
                          </td>
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <span className={`text-xs px-2 py-1 rounded border ${ORIGENS[task.origin].color} ${ORIGENS[task.origin].bg} ${ORIGENS[task.origin].border}`}>
                              {ORIGENS[task.origin].label}
                            </span>
                          </td>
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            {task.dueDate ? (
                              <div className={`flex items-center gap-1.5 text-sm ${isOverdue ? 'text-red-500' : isDueSoon ? 'text-amber-600' : 'text-gray-600 dark:text-[#aaa]'}`}>
                                <Calendar size={13} />
                                <span>{formatDate(task.dueDate)}</span>
                                {isOverdue && <span className="text-xs bg-red-50 px-1.5 py-0.5 rounded">{Math.abs(daysUntil)}d atraso</span>}
                                {isDueSoon && !isOverdue && <span className="text-xs bg-amber-50 px-1.5 py-0.5 rounded">{daysUntil === 0 ? 'hoje' : `${daysUntil}d`}</span>}
                              </div>
                            ) : <span className="text-gray-300 dark:text-[#555] text-sm">-</span>}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-400 dark:text-[#666]">{formatDate(task.createdAt)}</span>
                          </td>
                          <td className="px-4 py-3 relative" onClick={(e) => e.stopPropagation()}>
                            <button onClick={(e) => {
                              if (rowMenuOpen === task.id) { setRowMenuOpen(null); return; }
                              const rect = e.currentTarget.getBoundingClientRect();
                              setRowMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
                              setRowMenuOpen(task.id);
                            }}
                              className="p-1.5 rounded hover:bg-gray-100 text-gray-400 dark:text-[#666] hover:text-gray-600 transition-colors">
                              <MoreHorizontal size={16} />
                            </button>
                            {rowMenuOpen === task.id && (
                              <div ref={menuRef} style={{ position: 'fixed', top: rowMenuPos.top, right: rowMenuPos.right, zIndex: 9999 }} className="w-44 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg py-1.5 shadow-sm fade-in">
                                <button onClick={() => { setShowDetailPanel(task); setRowMenuOpen(null); }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                                  <Eye size={14} /> Visualizar
                                </button>
                                <button onClick={() => { setEditTask(task); setShowCreateModal(true); setRowMenuOpen(null); }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                                  <Edit3 size={14} /> Editar
                                </button>
                                <button onClick={() => handleDuplicate(task)}
                                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                                  <Copy size={14} /> Duplicar
                                </button>
                                {task.status !== 'concluida' && (
                                  <button onClick={() => handleComplete(task.id)}
                                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors">
                                    <CheckCircle size={14} /> Concluir
                                  </button>
                                )}
                                <div className="border-t border-gray-100 dark:border-white/[0.06] my-1"></div>
                                <button onClick={() => { setConfirmDelete({ type: 'single', id: task.id, title: task.title }); setRowMenuOpen(null); }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                                  <Trash2 size={14} /> Excluir
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-white/[0.06]">
                  <span className="text-sm text-gray-400 dark:text-[#666]">
                    {filteredTasks.length} tarefa(s) encontrada(s)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                      className="p-1.5 rounded border border-gray-200 dark:border-white/[0.06] text-gray-400 dark:text-[#666] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] disabled:opacity-30 transition-colors">
                      <ChevronLeft size={14} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button key={page} onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded text-sm transition-colors ${currentPage === page ? 'bg-[var(--zelt-primary)] text-white' : 'text-gray-500 dark:text-[#808080] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] border border-gray-200 dark:border-white/[0.06]'}`}>
                        {page}
                      </button>
                    ))}
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                      className="p-1.5 rounded border border-gray-200 dark:border-white/[0.06] text-gray-400 dark:text-[#666] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] disabled:opacity-30 transition-colors">
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[var(--zelt-primary)]/8 flex items-center justify-center mb-4">
                  <CheckSquare size={24} className="text-[var(--zelt-primary)]" />
                </div>
                <h3 className="text-sm text-gray-900 dark:text-[#ededed] mb-1">Nenhuma tarefa ainda</h3>
                <p className="text-sm text-gray-400 dark:text-[#666] max-w-[320px] mb-5">Crie tarefas para organizar o trabalho da equipe.</p>
                <button
                  onClick={() => { setEditTask(null); setShowCreateModal(true); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm text-white bg-[var(--zelt-primary)] hover:bg-[var(--zelt-primary-hover)] rounded-lg transition-colors"
                >
                  <Plus size={14} /> Nova Tarefa
                </button>
              </div>
            )}

            {showDetailPanel && (
              <DetailPanel task={showDetailPanel} onClose={() => setShowDetailPanel(null)} workspaceId={workspaceId} onRefresh={fetchTasks} />
            )}

            {showCreateModal && (
              <TaskModal task={editTask} onClose={() => { setShowCreateModal(false); setEditTask(null); }} onSave={handleCreateTask} membersList={membersList} />
            )}

            {confirmDelete && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 fade-in" onClick={() => setConfirmDelete(null)}>
                <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl w-[400px] p-6" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                      <Trash2 size={18} className="text-red-500" />
                    </div>
                    <h3 className="text-base text-gray-900 dark:text-[#ededed]">Excluir tarefa</h3>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-[#808080] mb-5">
                    {confirmDelete.type === 'bulk'
                      ? `Tem certeza que deseja excluir ${selectedIds.length} tarefa(s)? Esta acao nao pode ser desfeita.`
                      : `Tem certeza que deseja excluir "${confirmDelete.title}"? Esta acao nao pode ser desfeita.`}
                  </p>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setConfirmDelete(null)}
                      className="px-4 py-2 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                      Cancelar
                    </button>
                    <button onClick={() => confirmDelete.type === 'bulk' ? handleBulkDelete() : handleDelete(confirmDelete.id)}
                      className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function DetailPanel({ task, onClose, workspaceId, onRefresh }) {
  const [activeTab, setActiveTab] = useState('info');
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [fullTask, setFullTask] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(true);

  const displayTask = fullTask || task;

  const fetchDetail = async () => {
    if (!workspaceId || !task.id) return;
    try {
      setLoadingDetail(true);
      const res = await taskApi.get(workspaceId, task.id);
      const t = res.task;
      const mapped = {
        ...t,
        status: FRONTEND_STATUS_MAP[t.status] || t.status,
        priority: FRONTEND_PRIORITY_MAP[t.priority] || t.priority,
        origin: FRONTEND_ORIGIN_MAP[t.origin] || t.origin,
        assignee: t.assignee ? {
          id: t.assignee.id,
          name: t.assignee.name,
          initials: getInitials(t.assignee.name),
          color: getMemberColor(t.assignee.name),
        } : { id: 0, name: 'Sem responsavel', initials: 'SR', color: '#9CA3AF' },
        tags: Array.isArray(t.tags) ? t.tags : (typeof t.tags === 'string' ? (() => { try { return JSON.parse(t.tags); } catch { return []; } })() : []),
        comments: (t.comments || []).map(c => ({
          ...c,
          author: c.user ? {
            id: c.user.id,
            name: c.user.name,
            initials: getInitials(c.user.name),
            color: getMemberColor(c.user.name),
          } : null,
        })),
        history: (t.history || []).map(h => ({
          ...h,
          user: h.user ? { id: h.user.id, name: h.user.name } : { id: 0, name: 'Sistema' },
          date: new Date(h.createdAt).toLocaleString('pt-BR'),
        })),
      };
      setFullTask(mapped);
    } catch (err) {
      console.error('Failed to fetch task detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [task.id, workspaceId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await taskApi.addComment(workspaceId, task.id, newComment);
      setNewComment('');
      await fetchDetail();
      onRefresh?.();
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await taskApi.deleteComment(workspaceId, task.id, commentId);
      await fetchDetail();
      onRefresh?.();
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const handleSaveEdit = async (commentId) => {
    try {
      await taskApi.deleteComment(workspaceId, task.id, commentId);
      await taskApi.addComment(workspaceId, task.id, editText);
      setEditingComment(null);
      await fetchDetail();
    } catch (err) {
      console.error('Failed to edit comment:', err);
    }
  };

  const daysUntil = getDaysUntil(displayTask.dueDate);
  const isOverdue = daysUntil < 0 && displayTask.status !== 'concluida' && displayTask.status !== 'cancelada';

  return (
    <div className="fixed inset-0 z-40 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/10 fade-in"></div>
      <div className="relative w-[480px] h-full bg-white dark:bg-[#141414] border-l border-gray-200 dark:border-white/[0.06] flex flex-col slide-in-right overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <span className={`text-xs px-2 py-1 rounded border ${PRIORITIES[displayTask.priority].color} ${PRIORITIES[displayTask.priority].bg} ${PRIORITIES[displayTask.priority].border}`}>
              {PRIORITIES[displayTask.priority].label}
            </span>
            <span className={`text-xs px-2 py-1 rounded border ${STATUSES[displayTask.status].color} ${STATUSES[displayTask.status].bg} ${STATUSES[displayTask.status].border}`}>
              {STATUSES[displayTask.status].label}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 dark:text-[#666] hover:text-gray-600 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 pt-4 pb-3">
          <h2 className={`text-base text-gray-900 dark:text-[#ededed] leading-snug ${isOverdue ? 'text-red-600' : ''}`}>{displayTask.title}</h2>
          {displayTask.description && <p className="text-sm text-gray-500 dark:text-[#808080] mt-1.5 leading-relaxed">{displayTask.description}</p>}
        </div>

        <div className="flex border-b border-gray-100 dark:border-white/[0.06] px-5 gap-5">
          {[
            { id: 'info', label: 'Informacoes', icon: FileText },
            { id: 'history', label: 'Historico', icon: History },
            { id: 'comments', label: 'Comentarios', icon: MessageSquare },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 py-2.5 text-sm border-b-2 transition-colors ${activeTab === tab.id ? 'border-[var(--zelt-primary)] text-[var(--zelt-primary)]' : 'border-transparent text-gray-400 dark:text-[#666] hover:text-gray-600'}`}>
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loadingDetail && (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-24 bg-gray-100 dark:bg-[#1a1a1a] rounded animate-pulse"></div>
                  <div className="h-4 w-32 bg-gray-100 dark:bg-[#1a1a1a] rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          )}

          {!loadingDetail && activeTab === 'info' && (
            <>
              <div className="space-y-4">
                <InfoRow label="Responsavel">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px]" style={{ background: displayTask.assignee.color }}>
                      {displayTask.assignee.initials}
                    </div>
                    <span className="text-sm text-gray-700 dark:text-[#ccc]">{displayTask.assignee.name}</span>
                  </div>
                </InfoRow>
                <InfoRow label="Prazo">
                  <span className={`text-sm ${isOverdue ? 'text-red-500' : 'text-gray-700 dark:text-[#ccc]'}`}>
                    {displayTask.dueDate ? `${formatDate(displayTask.dueDate)}${displayTask.dueTime ? ' as ' + displayTask.dueTime : ''}` : '-'}
                  </span>
                </InfoRow>
                <InfoRow label="Criacao"><span className="text-sm text-gray-700 dark:text-[#ccc]">{formatDate(displayTask.createdAt)}</span></InfoRow>
                <InfoRow label="Origem">
                  <span className={`text-xs px-2 py-1 rounded border ${ORIGENS[displayTask.origin].color} ${ORIGENS[displayTask.origin].bg} ${ORIGENS[displayTask.origin].border}`}>
                    {ORIGENS[displayTask.origin].label}
                  </span>
                </InfoRow>
                {displayTask.tags.length > 0 && (
                  <InfoRow label="Tags">
                    <div className="flex flex-wrap gap-1.5">
                      {displayTask.tags.map((tag, i) => (
                        <span key={i} className="text-xs bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] text-gray-500 dark:text-[#808080] px-2 py-0.5 rounded">{tag}</span>
                      ))}
                    </div>
                  </InfoRow>
                )}
              </div>

              {(displayTask.client || displayTask.conversation) && (
                <div className="border-t border-gray-100 dark:border-white/[0.06] pt-4">
                  <p className="text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider mb-3">Relacionamentos</p>
                  <div className="space-y-2.5">
                    {displayTask.client && (
                      <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-white/[0.06] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors text-left">
                        <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center"><User size={16} className="text-sky-500" /></div>
                        <div>
                          <p className="text-sm text-gray-700 dark:text-[#ccc]">{displayTask.client.name}</p>
                          <p className="text-xs text-gray-400 dark:text-[#666]">Cliente</p>
                        </div>
                        <Link2 size={13} className="text-gray-300 dark:text-[#555] ml-auto" />
                      </button>
                    )}
                    {displayTask.conversation && (
                      <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-white/[0.06] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors text-left">
                        <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center"><MessageSquare size={16} className="text-violet-500" /></div>
                        <div>
                          <p className="text-sm text-gray-700 dark:text-[#ccc]">{displayTask.conversation.name}</p>
                          <p className="text-xs text-gray-400 dark:text-[#666]">Conversa vinculada</p>
                        </div>
                        <Link2 size={13} className="text-gray-300 dark:text-[#555] ml-auto" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {!loadingDetail && activeTab === 'history' && (
            <div className="space-y-4">
              {(displayTask.history || []).length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-[#666] text-center py-8">Nenhum registro de alteracoes.</p>
              ) : (displayTask.history || []).map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#1a1a1a] flex items-center justify-center shrink-0">
                      <Clock size={13} className="text-gray-400 dark:text-[#666]" />
                    </div>
                    {i < (displayTask.history || []).length - 1 && <div className="w-px flex-1 bg-gray-100 dark:bg-[#1a1a1a] mt-1"></div>}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm text-gray-700 dark:text-[#ccc]">{item.action}</p>
                    <p className="text-xs text-gray-400 dark:text-[#666] mt-1">
                      {item.user.name} - {item.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loadingDetail && activeTab === 'comments' && (
            <div className="space-y-3">
              {(displayTask.comments || []).length === 0 && !newComment ? (
                <p className="text-sm text-gray-400 dark:text-[#666] text-center py-8">Nenhum comentario ainda.</p>
              ) : (displayTask.comments || []).map((comment) => (
                <div key={comment.id} className="p-3 bg-gray-50 dark:bg-[#111] rounded-lg border border-gray-100 dark:border-white/[0.06]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px]" style={{ background: comment.author?.color || '#9CA3AF' }}>
                        {comment.author?.initials || '?'}
                      </div>
                      <span className="text-sm text-gray-700 dark:text-[#ccc]">{comment.author?.name || 'Usuario'}</span>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-[#666]">{comment.createdAt ? new Date(comment.createdAt).toLocaleString('pt-BR') : ''}</span>
                  </div>
                  {editingComment === comment.id ? (
                    <div className="space-y-2">
                      <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={2}
                        className="w-full text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg p-2 bg-white dark:bg-[#141414] resize-none outline-none focus:border-[var(--zelt-primary)]/40" />
                      <div className="flex gap-2">
                        <button onClick={() => handleSaveEdit(comment.id)} className="px-3 py-1 text-sm bg-[var(--zelt-primary)] text-white rounded hover:bg-[var(--zelt-primary-hover)]">Salvar</button>
                        <button onClick={() => setEditingComment(null)} className="px-3 py-1 text-sm text-gray-500 dark:text-[#808080] border border-gray-200 dark:border-white/[0.06] rounded hover:bg-gray-50 dark:hover:bg-[#1a1a1a]">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-[#aaa] leading-relaxed">{comment.text}</p>
                  )}
                  {editingComment !== comment.id && comment.author && (
                    <div className="flex gap-3 mt-2">
                      <button onClick={() => { setEditingComment(comment.id); setEditText(comment.text); }} className="text-xs text-gray-400 dark:text-[#666] hover:text-gray-600">Editar</button>
                      <button onClick={() => handleDeleteComment(comment.id)} className="text-xs text-red-400 hover:text-red-500">Excluir</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {activeTab === 'comments' && (
          <div className="p-4 border-t border-gray-100 dark:border-white/[0.06]">
            <div className="flex gap-2.5">
              <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Adicionar comentario..." rows={2}
                className="flex-1 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg p-2.5 resize-none outline-none focus:border-[var(--zelt-primary)]/40 bg-white dark:bg-[#141414]" />
              <button onClick={handleAddComment} disabled={!newComment.trim()}
                className={`self-end p-2.5 rounded-lg transition-colors ${newComment.trim() ? 'bg-[var(--zelt-primary)] text-white hover:bg-[var(--zelt-primary-hover)]' : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-400 dark:text-[#666]'}`}>
                <Send size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider shrink-0 pt-1">{label}</span>
      <div className="text-right">{children}</div>
    </div>
  );
}

function TaskModal({ task, onClose, onSave, membersList }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    assigneeId: task?.assignee?.id || '',
    client: task?.client?.name || '',
    conversation: task?.conversation?.name || '',
    priority: task?.priority || 'media',
    status: task?.status || 'pendente',
    origin: task?.origin || 'manual',
    dueDate: task?.dueDate || '',
    dueTime: task?.dueTime || '',
    tags: task?.tags?.join(', ') || '',
  });

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave({
      ...form,
      client: form.client ? { name: form.client, id: null } : null,
      conversation: form.conversation ? { name: form.conversation, id: null } : null,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl w-[580px] max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
          <h3 className="text-base text-gray-900 dark:text-[#ededed]">{task ? 'Editar Tarefa' : 'Nova Tarefa'}</h3>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 dark:text-[#666] hover:text-gray-600 transition-colors">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider block mb-1.5">Titulo *</label>
            <input type="text" value={form.title} onChange={(e) => handleChange('title', e.target.value)} placeholder="Ex: Ligacao de follow-up"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#141414] text-gray-900 dark:text-[#ededed] placeholder-gray-400 dark:placeholder-[#555] focus:border-[var(--zelt-primary)]/40 transition-colors" required />
          </div>
          <div>
            <label className="text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider block mb-1.5">Descricao</label>
            <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} placeholder="Detalhes sobre a tarefa..."
              className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#141414] text-gray-900 dark:text-[#ededed] placeholder-gray-400 dark:placeholder-[#555] focus:border-[var(--zelt-primary)]/40 resize-none transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider block mb-1.5">Responsavel</label>
              <select value={form.assigneeId} onChange={(e) => handleChange('assigneeId', e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#141414] text-gray-600 dark:text-[#aaa] focus:border-[var(--zelt-primary)]/40 transition-colors">
                <option value="">Selecionar...</option>
                {membersList.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider block mb-1.5">Prioridade</label>
              <select value={form.priority} onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#141414] text-gray-600 dark:text-[#aaa] focus:border-[var(--zelt-primary)]/40 transition-colors">
                {Object.entries(PRIORITIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider block mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#141414] text-gray-600 dark:text-[#aaa] focus:border-[var(--zelt-primary)]/40 transition-colors">
                {Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider block mb-1.5">Origem</label>
              <select value={form.origin || 'manual'} onChange={(e) => handleChange('origin', e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#141414] text-gray-600 dark:text-[#aaa] focus:border-[var(--zelt-primary)]/40 transition-colors">
                {Object.entries(ORIGENS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider block mb-1.5">Cliente (opcional)</label>
              <input type="text" value={form.client} onChange={(e) => handleChange('client', e.target.value)} placeholder="Nome do cliente"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#141414] text-gray-900 dark:text-[#ededed] placeholder-gray-400 dark:placeholder-[#555] focus:border-[var(--zelt-primary)]/40 transition-colors" />
            </div>
            <div>
              <label className="text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider block mb-1.5">Conversa (opcional)</label>
              <input type="text" value={form.conversation} onChange={(e) => handleChange('conversation', e.target.value)} placeholder="Vincular conversa"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#141414] text-gray-900 dark:text-[#ededed] placeholder-gray-400 dark:placeholder-[#555] focus:border-[var(--zelt-primary)]/40 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider block mb-1.5">Data de vencimento</label>
              <input type="date" value={form.dueDate} onChange={(e) => handleChange('dueDate', e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#141414] text-gray-900 dark:text-[#ededed] focus:border-[var(--zelt-primary)]/40 transition-colors" />
            </div>
            <div>
              <label className="text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider block mb-1.5">Hora de vencimento</label>
              <input type="time" value={form.dueTime} onChange={(e) => handleChange('dueTime', e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#141414] text-gray-900 dark:text-[#ededed] focus:border-[var(--zelt-primary)]/40 transition-colors" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider block mb-1.5">Tags (separadas por virgula)</label>
            <input type="text" value={form.tags} onChange={(e) => handleChange('tags', e.target.value)} placeholder="Ex: Vendas, Urgente, Follow-up"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#141414] text-gray-900 dark:text-[#ededed] placeholder-gray-400 dark:placeholder-[#555] focus:border-[var(--zelt-primary)]/40 transition-colors" />
          </div>
        </form>
        <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-gray-100 dark:border-white/[0.06]">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">Cancelar</button>
          <button onClick={handleSubmit} className="px-4 py-2 text-sm bg-[var(--zelt-primary)] text-white rounded-lg hover:bg-[var(--zelt-primary-hover)] transition-colors">
            {task ? 'Salvar alteracoes' : 'Criar tarefa'}
          </button>
        </div>
      </div>
    </div>
  );
}
