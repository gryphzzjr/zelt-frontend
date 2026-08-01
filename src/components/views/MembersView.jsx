import { useState, useRef, useEffect } from 'react';
import {
  Search, Plus, X, Check, ChevronDown, ChevronRight, ChevronLeft,
  Users, Shield, UserCheck, Clock, UserX, MoreHorizontal, Eye, Pencil,
  Trash2, Mail, Send, Link2, Copy, Ban, RefreshCw, AlertTriangle,
  ToggleLeft, ToggleRight, ArrowUpDown, ArrowUp, ArrowDown,
  ShieldCheck, Briefcase, Activity, Calendar, Phone, MessageSquare,
  Star, Settings, ExternalLink, CheckCircle2,
} from 'lucide-react';
import { memberApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

const ROLES = [
  { id: 'admin', label: 'Administrador', color: 'var(--zelt-primary)', permissions: ['all'] },
  { id: 'gerente', label: 'Gerente', color: '#2563eb', permissions: ['dashboard', 'conversas', 'conhecimento', 'prompts', 'respostas'] },
  { id: 'supervisor', label: 'Supervisor', color: '#059669', permissions: ['dashboard', 'conversas'] },
  { id: 'atendente', label: 'Atendente', color: '#78716c', permissions: ['dashboard', 'conversas'] },
];

const ALL_PERMISSIONS = [
  { id: 'dashboard', label: 'Acessar Dashboard', group: 'Geral' },
  { id: 'conversas', label: 'Atender Conversas', group: 'Atendimento' },
  { id: 'chat', label: 'Chat ao Vivo', group: 'Atendimento' },
  { id: 'conhecimento', label: 'Gerenciar Base de Conhecimento', group: 'IA' },
  { id: 'prompts', label: 'Editar Prompts', group: 'IA' },
  { id: 'respostas', label: 'Gerenciar Respostas Rapidas', group: 'IA' },
  { id: 'templates', label: 'Gerenciar Templates', group: 'IA' },
  { id: 'equipe', label: 'Gerenciar Equipe', group: 'Admin' },
  { id: 'workspaces', label: 'Gerenciar Workspaces', group: 'Admin' },
  { id: 'integracoes', label: 'Gerenciar Integracoes', group: 'Admin' },
  { id: 'relatorios', label: 'Visualizar Relatorios', group: 'Admin' },
  { id: 'configuracoes', label: 'Configurar IA', group: 'Admin' },
];

const STATUS_CONFIG = {
  ativo: { label: 'Ativo', color: '#16a34a', bg: '#f0fdf4', icon: CheckCircle2 },
  pendente: { label: 'Convite Pendente', color: '#d97706', bg: '#fffbeb', icon: Clock },
  inativo: { label: 'Inativo', color: '#9ca3af', bg: '#f9fafb', icon: UserX },
  suspenso: { label: 'Suspenso', color: '#dc2626', bg: '#fef2f2', icon: Ban },
};

const ACTIVITY_LOG = [
  { text: 'Entrou no sistema', date: 'Agora mesmo', color: '#16a34a', icon: UserCheck },
  { text: 'Atendeu conversa #4521', date: '2h atras', color: 'var(--zelt-primary)', icon: MessageSquare },
  { text: 'Criou tarefa "Follow-up comercial"', date: '5h atras', color: '#2563eb', icon: CheckCircle2 },
  { text: 'Editou cliente Tech Solutions', date: 'Ontem', color: '#059669', icon: Pencil },
  { text: 'Atualizou Base de Conhecimento', date: '2 dias atras', color: '#d97706', icon: Star },
];

const BACKEND_TO_FRONTEND_ROLE = {
  OWNER: 'admin',
  ADMIN: 'admin',
  MANAGER: 'gerente',
  AGENT: 'atendente',
  VIEWER: 'supervisor',
};

const FRONTEND_TO_BACKEND_ROLE = {
  admin: 'ADMIN',
  gerente: 'MANAGER',
  atendente: 'AGENT',
  supervisor: 'VIEWER',
};

function mapBackendMember(m) {
  const user = m.user || {};
  return {
    id: m.userId || m.id,
    _memberId: m.id,
    name: user.name || 'Sem nome',
    email: user.email || '',
    phone: '',
    role: BACKEND_TO_FRONTEND_ROLE[m.role] || 'atendente',
    backendRole: m.role,
    status: m.active ? 'ativo' : 'inativo',
    avatar: user.avatar || 0,
    joinedAt: m.joinedAt ? new Date(m.joinedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '--',
    lastAccess: 'Nunca',
    seed: (user.name || '').length,
    permissions: m.permissions || {},
  };
}

function mapBackendInvite(inv) {
  return {
    id: inv.id,
    _inviteId: inv.id,
    name: inv.email?.split('@')[0] || 'Convidado',
    email: inv.email || '',
    phone: '',
    role: BACKEND_TO_FRONTEND_ROLE[inv.role] || 'atendente',
    backendRole: inv.role,
    status: 'pendente',
    avatar: 0,
    joinedAt: new Date(inv.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
    lastAccess: 'Nunca',
    seed: (inv.email || '').length,
    inviteType: inv.type,
    expiresAt: inv.expiresAt,
  };
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-fade">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#1a1a1a] animate-pulse" />
          <div className="h-4 w-24 bg-gray-100 dark:bg-[#1a1a1a] rounded animate-pulse" />
        </div>
        <div className="h-8 w-32 bg-gray-100 dark:bg-[#1a1a1a] rounded-lg animate-pulse" />
      </div>
      <div className="grid grid-cols-5 gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl px-4 py-3 animate-pulse">
            <div className="h-3 w-16 bg-gray-100 dark:bg-[#1a1a1a] rounded mb-2" />
            <div className="h-5 w-8 bg-gray-100 dark:bg-[#1a1a1a] rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 dark:border-b-white/[0.06]">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#1a1a1a] animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-32 bg-gray-100 dark:bg-[#1a1a1a] rounded animate-pulse" />
              <div className="h-2.5 w-48 bg-gray-50 dark:bg-[#111] rounded animate-pulse" />
            </div>
            <div className="h-5 w-16 bg-gray-100 dark:bg-[#1a1a1a] rounded animate-pulse" />
            <div className="h-5 w-12 bg-gray-100 dark:bg-[#1a1a1a] rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function Avatar({ member, size = 36 }) {
  const colors = ['var(--zelt-primary)', '#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0ea5e9', '#f43f5e'];
  const bg = colors[member.id % colors.length];
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 font-medium"
      style={{ width: size, height: size, backgroundColor: bg + '15', color: bg, fontSize: size * 0.33 }}
    >
      {getInitials(member.name)}
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]"
      style={{ color: cfg.color, backgroundColor: cfg.bg }}
    >
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}

function RoleBadge({ roleId }) {
  const role = ROLES.find(r => r.id === roleId);
  if (!role) return null;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium"
      style={{ color: role.color, backgroundColor: role.color + '10', border: `1px solid ${role.color}20` }}
    >
      {role.label}
    </span>
  );
}

function ConfirmModal({ open, title, message, type = 'danger', onClose, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade">
      <div className="w-full max-w-sm bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-white/[0.06] overflow-hidden animate-scale">
        <div className="p-6 text-center">
          <div className={`w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center ${type === 'danger' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
            <AlertTriangle size={18} className={type === 'danger' ? 'text-red-500' : 'text-amber-500'} />
          </div>
          <h3 className="text-sm text-gray-900 dark:text-[#ededed] mb-1">{title}</h3>
          <p className="text-xs text-gray-500 dark:text-[#808080]">{message}</p>
        </div>
        <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-gray-100 dark:border-white/[0.06] bg-gray-50/50">
          <button onClick={onClose} className="px-4 py-2 text-xs text-gray-500 dark:text-[#808080] hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
          <button onClick={() => { onConfirm(); onClose(); }}
            className={`px-4 py-2 text-xs text-white rounded-lg transition-colors ${type === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-[var(--zelt-primary)] hover:bg-[var(--zelt-primary-hover)]'}`}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

function InviteModal({ open, onClose, roles, onInvite, workspaceId }) {
  const [tab, setTab] = useState('email');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('atendente');
  const [message, setMessage] = useState('');
  const [linkRole, setLinkRole] = useState('atendente');
  const [linkExpiry, setLinkExpiry] = useState('7');
  const [linkMaxUses, setLinkMaxUses] = useState('10');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState(null);

  const handleInvite = () => {
    if (!email.trim()) return;
    onInvite({ email, role, message });
    setEmail('');
    setMessage('');
    onClose();
  };

  const handleGenerateLink = async () => {
    if (!workspaceId) return;
    setLinkLoading(true);
    try {
      const backendRole = FRONTEND_TO_BACKEND_ROLE[linkRole] || 'AGENT';
      const expiresIn = linkExpiry === 'never' ? 3650 : parseInt(linkExpiry);
      const maxUses = linkMaxUses ? parseInt(linkMaxUses) : 10;
      const result = await memberApi.generateLink(workspaceId, backendRole, {}, expiresIn, maxUses);
      const link = `${window.location.origin}/invite/${result.token}`;
      setGeneratedLink(link);
    } catch (err) {
      setLinkError(err.message || 'Erro ao gerar link');
      setTimeout(() => setLinkError(null), 3000);
    } finally {
      setLinkLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = () => {
    setGeneratedLink('');
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade">
      <div className="w-full max-w-lg bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-white/[0.06] overflow-hidden animate-scale">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
          <h3 className="text-sm text-gray-900 dark:text-[#ededed]">Convidar Membro</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 dark:text-[#666] hover:text-gray-600 dark:text-[#aaa] dark:hover:text-[#ccc] hover:bg-gray-100 rounded-lg transition-colors"><X size={16} /></button>
        </div>

        <div className="flex border-b border-gray-100 dark:border-white/[0.06]">
          <button onClick={() => setTab('email')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-3 text-xs transition-colors ${tab === 'email' ? 'text-[var(--zelt-primary)] border-b-2 border-[var(--zelt-primary)] font-medium' : 'text-gray-500 dark:text-[#808080] hover:text-gray-700 dark:text-[#ccc] dark:hover:text-[#ddd]'}`}>
            <Mail size={13} /> Convidar por E-mail
          </button>
          <button onClick={() => setTab('link')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-3 text-xs transition-colors ${tab === 'link' ? 'text-[var(--zelt-primary)] border-b-2 border-[var(--zelt-primary)] font-medium' : 'text-gray-500 dark:text-[#808080] hover:text-gray-700 dark:text-[#ccc] dark:hover:text-[#ddd]'}`}>
            <Link2 size={13} /> Gerar Link
          </button>
        </div>

        <div className="p-6 space-y-4">
          {tab === 'email' ? (
            <>
              <div>
                <label className="block text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wider mb-1">E-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemplo.com"
                  className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-white/[0.06] rounded-lg focus:outline-none focus:border-[var(--zelt-primary)]/40 transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wider mb-1">Cargo</label>
                <div className="relative">
                  <select value={role} onChange={e => setRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-white/[0.06] rounded-lg appearance-none focus:outline-none focus:border-[var(--zelt-primary)]/40 transition-colors bg-white dark:bg-[#141414]">
                    {roles.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#666] pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wider mb-1">Mensagem (opcional)</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} placeholder="Mensagem personalizada..."
                  className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-white/[0.06] rounded-lg focus:outline-none focus:border-[var(--zelt-primary)]/40 transition-colors resize-none" />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wider mb-1">Cargo padrao</label>
                  <div className="relative">
                    <select value={linkRole} onChange={e => setLinkRole(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-white/[0.06] rounded-lg appearance-none focus:outline-none focus:border-[var(--zelt-primary)]/40 transition-colors bg-white dark:bg-[#141414]">
                      {roles.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#666] pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wider mb-1">Expiracao</label>
                  <div className="relative">
                    <select value={linkExpiry} onChange={e => setLinkExpiry(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-white/[0.06] rounded-lg appearance-none focus:outline-none focus:border-[var(--zelt-primary)]/40 transition-colors bg-white dark:bg-[#141414]">
                      <option value="1">1 dia</option>
                      <option value="3">3 dias</option>
                      <option value="7">7 dias</option>
                      <option value="30">30 dias</option>
                      <option value="never">Nunca</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#666] pointer-events-none" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wider mb-1">Maximo de utilizacoes</label>
                <input type="number" value={linkMaxUses} onChange={e => setLinkMaxUses(e.target.value)} placeholder="10"
                  className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-white/[0.06] rounded-lg focus:outline-none focus:border-[var(--zelt-primary)]/40 transition-colors" />
              </div>

              {linkError && (
                <div className="px-3 py-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/40 rounded-lg">
                  {linkError}
                </div>
              )}

              {generatedLink ? (
                <div className="bg-gray-50 dark:bg-[#111] rounded-xl p-4 border border-gray-100 dark:border-white/[0.06] space-y-3">
                  <div className="flex items-center gap-2">
                    <input readOnly value={generatedLink}
                      className="flex-1 px-3 py-2 text-xs bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg text-gray-600 dark:text-[#aaa]" />
                    <button onClick={handleCopy}
                      className={`px-3 py-2 text-xs rounded-lg transition-colors inline-flex items-center gap-1 ${copied ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border border-emerald-200 dark:border-emerald-500/40' : 'bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:bg-[#111] dark:hover:bg-[#1a1a1a]'}`}>
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-[#666]">
                    <span>0/{linkMaxUses} acessos restantes</span>
                    <span>Expira em {linkExpiry === 'never' ? 'nunca' : linkExpiry + ' dias'}</span>
                  </div>
                  <button onClick={handleRevoke}
                    className="w-full px-3 py-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/40 rounded-lg hover:bg-red-100 transition-colors inline-flex items-center justify-center gap-1">
                    <Ban size={12} /> Revogar Link
                  </button>
                </div>
              ) : (
                <button onClick={handleGenerateLink} disabled={linkLoading}
                  className="w-full px-3 py-2.5 text-xs text-[var(--zelt-primary)] bg-[var(--zelt-primary)]/5 border border-dashed border-[var(--zelt-primary)]/20 rounded-lg hover:bg-[var(--zelt-primary)]/10 transition-colors inline-flex items-center justify-center gap-1.5 disabled:opacity-50">
                  {linkLoading ? <RefreshCw size={13} className="animate-spin" /> : <Link2 size={13} />}
                  {linkLoading ? 'Gerando...' : 'Gerar Link de Convite'}
                </button>
              )}
            </>
          )}
        </div>

        {tab === 'email' && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 dark:border-white/[0.06] bg-gray-50/50">
            <button onClick={onClose} className="px-3 py-1.5 text-xs text-gray-500 dark:text-[#808080] hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
            <button onClick={handleInvite} disabled={!email.trim()}
              className="px-3 py-1.5 text-xs text-white bg-[var(--zelt-primary)] hover:bg-[var(--zelt-primary-hover)] rounded-lg transition-colors disabled:opacity-40 inline-flex items-center gap-1">
              <Send size={11} /> Enviar Convite
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function RoleModal({ open, roles, onClose, onSave }) {
  const [editing, setEditing] = useState(null);
  const [formName, setFormName] = useState('');
  const [formPerms, setFormPerms] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (editing) {
      setFormName(editing.label);
      setFormPerms(editing.permissions[0] === 'all' ? ALL_PERMISSIONS.map(p => p.id) : [...editing.permissions]);
    } else {
      setFormName('');
      setFormPerms([]);
    }
  }, [editing]);

  const togglePerm = (permId) => {
    setFormPerms(prev => prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]);
  };

  const handleSave = () => {
    if (!formName.trim()) return;
    if (editing) {
      onSave(roles.map(r => r.id === editing.id ? { ...r, label: formName, permissions: formPerms.length === ALL_PERMISSIONS.length ? ['all'] : formPerms } : r));
    } else {
      const newId = formName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
      onSave([...roles, { id: newId, label: formName, color: '#6b7280', permissions: formPerms.length === ALL_PERMISSIONS.length ? ['all'] : formPerms }]);
    }
    setEditing(null);
    setFormName('');
    setFormPerms([]);
  };

  const handleDelete = (roleId) => {
    onSave(roles.filter(r => r.id !== roleId));
    setDeleteConfirm(null);
    if (editing?.id === roleId) { setEditing(null); setFormName(''); setFormPerms([]); }
  };

  if (!open) return null;

  const permGroups = [...new Set(ALL_PERMISSIONS.map(p => p.group))];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade">
      <div className="w-full max-w-xl bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-white/[0.06] overflow-hidden animate-scale">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
          <h3 className="text-sm text-gray-900 dark:text-[#ededed]">Gerenciar Cargos</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 dark:text-[#666] hover:text-gray-600 dark:text-[#aaa] dark:hover:text-[#ccc] hover:bg-gray-100 rounded-lg transition-colors"><X size={16} /></button>
        </div>

        <div className="flex min-h-[400px]">
          <div className="w-48 border-r border-gray-100 dark:border-white/[0.06] p-3 space-y-1">
            {roles.map(r => (
              <button key={r.id} onClick={() => setEditing(r)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${editing?.id === r.id ? 'bg-[var(--zelt-primary)]/5 text-[var(--zelt-primary)]' : 'text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:bg-[#111] dark:hover:bg-[#1a1a1a]'}`}>
                {r.label}
              </button>
            ))}
            <button onClick={() => { setEditing(null); setFormName(''); setFormPerms([]); }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs text-[var(--zelt-primary)] hover:bg-[var(--zelt-primary)]/5 transition-colors inline-flex items-center gap-1">
              <Plus size={12} /> Novo Cargo
            </button>
          </div>

          <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[400px]">
            <div>
              <label className="block text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wider mb-1">Nome do Cargo</label>
              <input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="Ex: Analista"
                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-white/[0.06] rounded-lg focus:outline-none focus:border-[var(--zelt-primary)]/40 transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wider mb-2">Permissoes</label>
              <div className="space-y-3">
                {permGroups.map(group => (
                  <div key={group}>
                    <p className="text-[10px] text-gray-500 dark:text-[#808080] mb-1.5">{group}</p>
                    <div className="space-y-1">
                      {ALL_PERMISSIONS.filter(p => p.group === group).map(p => {
                        const active = formPerms.includes(p.id);
                        return (
                          <button key={p.id} onClick={() => togglePerm(p.id)}
                            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${active ? 'bg-[var(--zelt-primary)]/5 text-[var(--zelt-primary)]' : 'text-gray-500 dark:text-[#808080] hover:bg-gray-50 dark:bg-[#111] dark:hover:bg-[#1a1a1a]'}`}>
                            {active ? <ToggleRight size={16} className="text-[var(--zelt-primary)]" /> : <ToggleLeft size={16} className="text-gray-300 dark:text-[#555]" />}
                            {p.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-white/[0.06] bg-gray-50/50">
          {editing ? (
            <button onClick={() => setDeleteConfirm(editing)}
              className="px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center gap-1">
              <Trash2 size={11} /> Excluir Cargo
            </button>
          ) : <div />}
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-3 py-1.5 text-xs text-gray-500 dark:text-[#808080] hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
            <button onClick={handleSave} disabled={!formName.trim()}
              className="px-3 py-1.5 text-xs text-white bg-[var(--zelt-primary)] hover:bg-[var(--zelt-primary-hover)] rounded-lg transition-colors disabled:opacity-40">
              {editing ? 'Salvar Alteracoes' : 'Criar Cargo'}
            </button>
          </div>
        </div>

        <ConfirmModal open={!!deleteConfirm} title="Excluir cargo" message={`Tem certeza que deseja excluir o cargo "${deleteConfirm?.label}"? Membros com este cargo ficarao sem cargo definido.`}
          type="danger" onClose={() => setDeleteConfirm(null)} onConfirm={() => handleDelete(deleteConfirm?.id)} />
      </div>
    </div>
  );
}

function DetailPanel({ member, onClose, roles, onEditRole, onDeactivate, onRemove, onResendInvite }) {
  const [tab, setTab] = useState('info');
  const [permissions, setPermissions] = useState([]);
  const role = roles.find(r => r.id === member.role);

  useEffect(() => {
    if (role) {
      setPermissions(role.permissions[0] === 'all' ? ALL_PERMISSIONS.map(p => p.id) : [...role.permissions]);
    }
  }, [role]);

  const togglePerm = (permId) => {
    setPermissions(prev => prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]);
  };

  const tabs = [
    { id: 'info', label: 'Informacoes' },
    { id: 'perms', label: 'Permissoes' },
    { id: 'activity', label: 'Atividade' },
  ];

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/20 animate-fade" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md bg-white dark:bg-[#141414] border-l border-gray-200 dark:border-white/[0.06] overflow-y-auto animate-slide-in">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#141414]">
          <h3 className="text-sm text-gray-900 dark:text-[#ededed]">{member.name}</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 dark:text-[#666] hover:text-gray-600 dark:text-[#aaa] dark:hover:text-[#ccc] hover:bg-gray-100 rounded-lg transition-colors"><X size={16} /></button>
        </div>

        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-4 mb-4">
            <Avatar member={member} size={56} />
            <div>
              <p className="text-sm text-gray-900 dark:text-[#ededed]">{member.name}</p>
              <p className="text-xs text-gray-400 dark:text-[#666]">{member.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={member.status} />
                <RoleBadge roleId={member.role} />
              </div>
            </div>
          </div>

          <div className="flex gap-1 bg-gray-50 dark:bg-[#111] rounded-lg p-0.5">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 px-3 py-1.5 text-[10px] rounded-md transition-colors ${tab === t.id ? 'bg-white dark:bg-[#141414] text-gray-900 dark:text-[#ededed] border border-gray-200 dark:border-white/[0.06]' : 'text-gray-500 dark:text-[#808080] hover:text-gray-700 dark:text-[#ccc] dark:hover:text-[#ddd]'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {tab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem icon={Mail} label="E-mail" value={member.email} />
                <InfoItem icon={Phone} label="Telefone" value={member.phone || "Nao informado"} />
                <InfoItem icon={Shield} label="Cargo" value={role?.label || 'Sem cargo'} />
                <InfoItem icon={CheckCircle2} label="Status" value={STATUS_CONFIG[member.status]?.label} />
                <InfoItem icon={Calendar} label="Entrou em" value={member.joinedAt} />
                <InfoItem icon={Clock} label="Ultimo acesso" value={member.lastAccess} />
              </div>
            </div>
          )}

          {tab === 'perms' && (
            <div className="space-y-3">
              {[...new Set(ALL_PERMISSIONS.map(p => p.group))].map(group => (
                <div key={group}>
                  <p className="text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wider mb-1.5">{group}</p>
                  <div className="space-y-1">
                    {ALL_PERMISSIONS.filter(p => p.group === group).map(p => {
                      const active = permissions.includes(p.id);
                      return (
                        <button key={p.id} onClick={() => togglePerm(p.id)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors border ${active ? 'bg-[var(--zelt-primary)]/5 text-[var(--zelt-primary)] border-[var(--zelt-primary)]/10' : 'text-gray-500 dark:text-[#808080] hover:bg-gray-50 dark:bg-[#111] dark:hover:bg-[#1a1a1a] border-transparent'}`}>
                          {active ? <ToggleRight size={16} className="text-[var(--zelt-primary)] shrink-0" /> : <ToggleLeft size={16} className="text-gray-300 dark:text-[#555] shrink-0" />}
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'activity' && (
            <div className="space-y-0">
              {ACTIVITY_LOG.map((evt, i) => (
                <div key={i} className="flex gap-3 relative">
                  {i < ACTIVITY_LOG.length - 1 && <div className="absolute left-[11px] top-6 w-px h-full bg-gray-100 dark:bg-[#1a1a1a]" />}
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10" style={{ backgroundColor: evt.color + '15' }}>
                    <evt.icon size={11} style={{ color: evt.color }} />
                  </div>
                  <div className="pb-4">
                    <p className="text-[11px] text-gray-700 dark:text-[#ccc]">{evt.text}</p>
                    <p className="text-[9px] text-gray-400 dark:text-[#666] mt-0.5">{evt.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 px-6 py-4 border-t border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#141414] space-y-2">
          {member.status === 'pendente' && (
            <button onClick={() => onResendInvite(member)} className="w-full px-3 py-2 text-xs text-[var(--zelt-primary)] bg-[var(--zelt-primary)]/5 border border-[var(--zelt-primary)]/10 rounded-lg hover:bg-[var(--zelt-primary)]/10 transition-colors inline-flex items-center justify-center gap-1">
              <RefreshCw size={12} /> Reenviar Convite
            </button>
          )}
          <div className="flex gap-2">
            <button onClick={() => onEditRole(member)}
              className="flex-1 px-3 py-2 text-xs text-gray-600 dark:text-[#aaa] bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/[0.06] rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-1">
              <Pencil size={11} /> Editar Cargo
            </button>
            <button onClick={() => onDeactivate(member)}
              className="flex-1 px-3 py-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/40 rounded-lg hover:bg-amber-100 transition-colors inline-flex items-center justify-center gap-1">
              <UserX size={11} /> Desativar
            </button>
            <button onClick={() => onRemove(member)}
              className="px-3 py-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/40 rounded-lg hover:bg-red-100 transition-colors">
              <Trash2 size={11} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slide-in { animation: slideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={13} className="text-gray-400 dark:text-[#666] shrink-0" />
      <div>
        <p className="text-[9px] text-gray-400 dark:text-[#666] uppercase tracking-wider">{label}</p>
        <p className="text-xs text-gray-700 dark:text-[#ccc]">{value || '-'}</p>
      </div>
    </div>
  );
}

export default function MembersView() {
  const { workspace } = useAuth();
  const workspaceId = workspace?.id;

  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState(ROLES);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [selected, setSelected] = useState(new Set());
  const [selectedMember, setSelectedMember] = useState(null);
  const [inviteModal, setInviteModal] = useState(false);
  const [roleModal, setRoleModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [hasData, setHasData] = useState(false);
  const menuRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchMembers = async () => {
    if (!workspaceId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await memberApi.list(workspaceId);
      const mappedMembers = (res.members || []).map(mapBackendMember);
      const mappedInvites = (res.pendingInvites || []).map(mapBackendInvite);
      setMembers([...mappedMembers, ...mappedInvites]);
    } catch (err) {
      setError(err.message || 'Erro ao carregar membros');
      showToast(err.message || 'Erro ao carregar membros', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [workspaceId]);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = members
    .filter(m => {
      if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.email.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterRole !== 'all' && m.role !== filterRole) return false;
      if (filterStatus !== 'all' && m.status !== filterStatus) return false;
      return true;
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'name') return a.name.localeCompare(b.name) * dir;
      if (sortKey === 'role') return (a.role || '').localeCompare(b.role || '') * dir;
      if (sortKey === 'status') return (a.status || '').localeCompare(b.status || '') * dir;
      return 0;
    });

  const total = members.length;
  const admins = members.filter(m => m.role === 'admin').length;
  const atendentes = members.filter(m => m.role === 'atendente').length;
  const pendentes = members.filter(m => m.status === 'pendente').length;
  const ativos = members.filter(m => m.status === 'ativo').length;

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(m => m.id)));
  };

  const handleInvite = async ({ email, role, message }) => {
    if (!workspaceId) return;
    const backendRole = FRONTEND_TO_BACKEND_ROLE[role] || 'AGENT';
    try {
      await memberApi.inviteByEmail(workspaceId, email, backendRole);
      showToast('Convite enviado com sucesso');
      fetchMembers();
    } catch (err) {
      showToast(err.message || 'Erro ao enviar convite', 'error');
    }
  };

  const handleDeactivate = async (member) => {
    if (!workspaceId) return;
    try {
      if (member.status === 'pendente' && member._inviteId) {
        await memberApi.revokeInvite(workspaceId, member._inviteId);
        showToast('Convite revogado');
      } else if (member.status === 'ativo') {
        await memberApi.deactivate(workspaceId, member.id);
        showToast(`${member.name} desativado`);
      } else {
        await memberApi.reactivate(workspaceId, member.id);
        showToast(`${member.name} reativado`);
      }
      fetchMembers();
      if (selectedMember?.id === member.id) setSelectedMember(null);
    } catch (err) {
      showToast(err.message || 'Erro ao alterar status', 'error');
    }
  };

  const handleRemove = async (member) => {
    if (!workspaceId) return;
    try {
      if (member.status === 'pendente' && member._inviteId) {
        await memberApi.revokeInvite(workspaceId, member._inviteId);
        showToast('Convite revogado');
      } else {
        await memberApi.remove(workspaceId, member.id);
        showToast(`${member.name} removido do workspace`);
      }
      fetchMembers();
      if (selectedMember?.id === member.id) setSelectedMember(null);
    } catch (err) {
      showToast(err.message || 'Erro ao remover membro', 'error');
    }
  };

  const handleResendInvite = async (member) => {
    if (!workspaceId || !member._inviteId) return;
    try {
      await memberApi.resendInvite(workspaceId, member._inviteId);
      showToast('Convite reenviado');
    } catch (err) {
      showToast(err.message || 'Erro ao reenviar convite', 'error');
    }
    setOpenMenu(null);
  };

  const handleBulkAction = async (action) => {
    if (!workspaceId) return;
    const selectedMembers = members.filter(m => selected.has(m.id));
    let successCount = 0;
    for (const m of selectedMembers) {
      try {
        if (action === 'remove') {
          await memberApi.remove(workspaceId, m.id);
          successCount++;
        } else if (action === 'deactivate') {
          await memberApi.deactivate(workspaceId, m.id);
          successCount++;
        }
      } catch { /* skip failed */ }
    }
    if (successCount > 0) {
      showToast(`${successCount} membro(s) ${action === 'remove' ? 'removido(s)' : 'desativado(s)'}`);
      fetchMembers();
    }
    setSelected(new Set());
  };

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ArrowUpDown size={10} className="text-gray-300 dark:text-[#555]" />;
    return sortDir === 'asc' ? <ArrowUp size={10} className="text-[var(--zelt-primary)]" /> : <ArrowDown size={10} className="text-[var(--zelt-primary)]" />;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300;1,9..40,400&display=swap');
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.97); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes slideDown { from { transform: translateY(-8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-fade { animation: fadeIn 0.15s ease-out forwards; }
        .animate-scale { animation: scaleUp 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .members-view * { font-family: 'DM Sans', system-ui, sans-serif; }
      `}</style>

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg text-xs border animate-slide-down ${
          toast.type === 'error'
            ? 'bg-red-50 dark:bg-red-900/20 text-red-600 border-red-200 dark:border-red-500/40'
            : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-200 dark:border-emerald-500/40'
        }`} style={{ animation: 'slideDown 0.15s ease-out' }}>
          {toast.message}
        </div>
      )}

      {!workspaceId && (
        <div className="members-view flex items-center justify-center h-64 text-gray-400 dark:text-[#666] text-xs">
          Selecione um workspace para gerenciar membros.
        </div>
      )}

      {workspaceId && loading && (
        <div className="members-view">
          <LoadingSkeleton />
        </div>
      )}

      {workspaceId && error && !loading && (
        <div className="members-view flex flex-col items-center justify-center h-64 gap-3">
          <p className="text-xs text-red-500">{error}</p>
          <button onClick={fetchMembers}
            className="px-3 py-1.5 text-xs text-[var(--zelt-primary)] bg-[var(--zelt-primary)]/5 border border-[var(--zelt-primary)]/10 rounded-lg hover:bg-[var(--zelt-primary)]/10 transition-colors inline-flex items-center gap-1">
            <RefreshCw size={12} /> Tentar novamente
          </button>
        </div>
      )}

      {workspaceId && !loading && !error && (
      <div className="members-view space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--zelt-primary)]/8 flex items-center justify-center">
              <Users size={16} className="text-[var(--zelt-primary)]" />
            </div>
            <h2 className="text-sm text-gray-900 dark:text-[#ededed]">Membros</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setRoleModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-gray-600 dark:text-[#aaa] bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg hover:bg-gray-50 dark:bg-[#111] dark:hover:bg-[#1a1a1a] transition-colors">
              <Shield size={13} /> Cargos
            </button>
            <button onClick={() => setInviteModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs text-white bg-[var(--zelt-primary)] hover:bg-[var(--zelt-primary-hover)] rounded-lg transition-colors">
              <Plus size={14} /> Convidar Membro
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#666]" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar membros..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 dark:border-white/[0.06] rounded-lg focus:outline-none focus:border-[var(--zelt-primary)]/40 transition-colors bg-white dark:bg-[#141414]" />
          </div>
          <FilterSelect value={filterRole} onChange={setFilterRole} options={roles.map(r => ({ value: r.id, label: r.label }))} label="Cargo" />
          <FilterSelect value={filterStatus} onChange={setFilterStatus} options={[
            { value: 'ativo', label: 'Ativo' }, { value: 'pendente', label: 'Pendente' },
            { value: 'inativo', label: 'Inativo' }, { value: 'suspenso', label: 'Suspenso' },
          ]} label="Status" />
          {(filterRole !== 'all' || filterStatus !== 'all') && (
            <button onClick={() => { setFilterRole('all'); setFilterStatus('all'); }}
              className="inline-flex items-center gap-1 px-2.5 py-2 text-[10px] text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <X size={11} /> Limpar
            </button>
          )}
        </div>

        {/* Stats */}
        {hasData ? (
          <>
        <div className="grid grid-cols-5 gap-2">
          <StatCard icon={Users} label="Total" value={total} color="var(--zelt-primary)" />
          <StatCard icon={Shield} label="Administradores" value={admins} color="#7c3aed" />
          <StatCard icon={MessageSquare} label="Atendentes" value={atendentes} color="#78716c" />
          <StatCard icon={Clock} label="Convites pendentes" value={pendentes} color="#d97706" />
          <StatCard icon={UserCheck} label="Membros ativos" value={ativos} color="#16a34a" />
        </div>

        {/* Bulk Actions Bar */}
        {selected.size > 0 && (
          <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--zelt-primary)]/5 border border-[var(--zelt-primary)]/10 rounded-lg">
            <span className="text-xs text-[var(--zelt-primary)]">{selected.size} selecionado(s)</span>
            <div className="flex items-center gap-2">
              <button onClick={() => handleBulkAction('deactivate')}
                className="px-3 py-1.5 text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/40 rounded-lg hover:bg-amber-100 transition-colors">
                Desativar
              </button>
              <button onClick={() => handleBulkAction('remove')}
                className="px-3 py-1.5 text-[10px] text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/40 rounded-lg hover:bg-red-100 transition-colors">
                Remover
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/[0.06]">
                <th className="w-10 px-4 py-3">
                  <button onClick={toggleSelectAll}
                    className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${selected.size === filtered.length && filtered.length > 0 ? 'bg-[var(--zelt-primary)] border-[var(--zelt-primary)]' : 'border-gray-300 dark:border-white/20 hover:border-gray-400 dark:hover:border-white/30'}`}>
                    {selected.size === filtered.length && filtered.length > 0 && <Check size={10} className="text-white" />}
                  </button>
                </th>
                <th onClick={() => handleSort('name')} className="text-left px-4 py-3 cursor-pointer group">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wider group-hover:text-gray-600 dark:text-[#aaa] dark:hover:text-[#ccc] transition-colors">
                    Membro <SortIcon col="name" />
                  </div>
                </th>
                <th onClick={() => handleSort('role')} className="text-left px-4 py-3 cursor-pointer group">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wider group-hover:text-gray-600 dark:text-[#aaa] dark:hover:text-[#ccc] transition-colors">
                    Cargo <SortIcon col="role" />
                  </div>
                </th>
                <th onClick={() => handleSort('status')} className="text-left px-4 py-3 cursor-pointer group">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wider group-hover:text-gray-600 dark:text-[#aaa] dark:hover:text-[#ccc] transition-colors">
                    Status <SortIcon col="status" />
                  </div>
                </th>
                <th className="text-left px-4 py-3">
                  <span className="text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wider">Ultimo Acesso</span>
                </th>
                <th className="text-left px-4 py-3">
                  <span className="text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wider">Entrou em</span>
                </th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(member => (
                <tr key={member.id}
                  className={`border-b border-gray-50 dark:border-b-white/[0.06] hover:bg-gray-50/50 transition-colors cursor-pointer ${selected.has(member.id) ? 'bg-[var(--zelt-primary)]/[0.02]' : ''}`}
                  onClick={() => setSelectedMember(member)}>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <button onClick={() => toggleSelect(member.id)}
                      className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${selected.has(member.id) ? 'bg-[var(--zelt-primary)] border-[var(--zelt-primary)]' : 'border-gray-300 dark:border-white/20 hover:border-gray-400 dark:hover:border-white/30'}`}>
                      {selected.has(member.id) && <Check size={10} className="text-white" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar member={member} size={32} />
                      <div>
                        <p className="text-xs text-gray-900 dark:text-[#ededed]">{member.name}</p>
                        <p className="text-[10px] text-gray-400 dark:text-[#666]">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><RoleBadge roleId={member.role} /></td>
                  <td className="px-4 py-3"><StatusBadge status={member.status} /></td>
                  <td className="px-4 py-3 text-[11px] text-gray-500 dark:text-[#808080]">{member.lastAccess}</td>
                  <td className="px-4 py-3 text-[11px] text-gray-500 dark:text-[#808080]">{member.joinedAt}</td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="relative" ref={openMenu === member.id ? menuRef : undefined}>
                      <button onClick={() => setOpenMenu(openMenu === member.id ? null : member.id)}
                        className="p-1.5 text-gray-400 dark:text-[#666] hover:text-gray-600 dark:text-[#aaa] dark:hover:text-[#ccc] hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreHorizontal size={14} />
                      </button>
                      {openMenu === member.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl py-1.5 z-20 shadow-sm">
                          <button onClick={() => { setSelectedMember(member); setOpenMenu(null); }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-[11px] text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:bg-[#111] dark:hover:bg-[#1a1a1a]">
                            <Eye size={11} /> Visualizar perfil
                          </button>
                          <button onClick={() => setOpenMenu(null)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-[11px] text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:bg-[#111] dark:hover:bg-[#1a1a1a]">
                            <Pencil size={11} /> Editar cargo
                          </button>
                          <button onClick={() => setOpenMenu(null)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-[11px] text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:bg-[#111] dark:hover:bg-[#1a1a1a]">
                            <Settings size={11} /> Editar permissoes
                          </button>
                          {member.status === 'pendente' && (
                            <button onClick={() => { handleResendInvite(member); setOpenMenu(null); }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-[11px] text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:bg-[#111] dark:hover:bg-[#1a1a1a]">
                              <RefreshCw size={11} /> Reenviar convite
                            </button>
                          )}
                          <div className="border-t border-gray-100 dark:border-white/[0.06] my-1" />
                          <button onClick={() => { handleDeactivate(member); setOpenMenu(null); }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-[11px] text-amber-600 hover:bg-amber-50">
                            <UserX size={11} /> {member.status === 'ativo' ? 'Desativar acesso' : 'Reativar acesso'}
                          </button>
                          <button onClick={() => { setConfirmModal({ title: 'Remover membro', message: `Tem certeza que deseja remover ${member.name} do Workspace?`, onConfirm: () => handleRemove(member) }); setOpenMenu(null); }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-[11px] text-red-500 hover:bg-red-50">
                            <Trash2 size={11} /> Remover do Workspace
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-xs text-gray-400 dark:text-[#666]">
                    Nenhum membro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[var(--zelt-primary)]/8 flex items-center justify-center mb-4">
              <Users size={24} className="text-[var(--zelt-primary)]" />
            </div>
            <h3 className="text-sm text-gray-900 dark:text-[#ededed] mb-1">Nenhum membro na equipe</h3>
            <p className="text-sm text-gray-400 dark:text-[#666] max-w-[320px] mb-5">Convide membros para sua equipe para comecar a trabalhar junto.</p>
            <button
              onClick={() => setInviteModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm text-white bg-[var(--zelt-primary)] hover:bg-[var(--zelt-primary-hover)] rounded-lg transition-colors"
            >
              <Plus size={14} /> Convidar Membro
            </button>
          </div>
        )}

        {selectedMember && (
          <DetailPanel member={selectedMember} onClose={() => setSelectedMember(null)} roles={roles}
            onEditRole={(m) => { setRoleModal(true); setSelectedMember(null); }}
            onDeactivate={handleDeactivate} onRemove={(m) => {
              setConfirmModal({ title: 'Remover membro', message: `Tem certeza que deseja remover ${m.name} do Workspace?`, onConfirm: () => handleRemove(m) });
              setSelectedMember(null);
            }}
            onResendInvite={handleResendInvite} />
        )}

        <InviteModal open={inviteModal} onClose={() => setInviteModal(false)} roles={roles} onInvite={handleInvite} workspaceId={workspaceId} />
        <RoleModal open={roleModal} roles={roles} onClose={() => setRoleModal(false)} onSave={setRoles} />
        <ConfirmModal open={!!confirmModal} title={confirmModal?.title} message={confirmModal?.message} type="danger"
          onClose={() => setConfirmModal(null)} onConfirm={() => { confirmModal?.onConfirm(); setConfirmModal(null); }} />
      </div>
      )}
    </>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl px-4 py-3 transition-colors hover:border-gray-300 dark:hover:border-white/15">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: color + '10' }}>
          <Icon size={12} style={{ color }} />
        </div>
        <span className="text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg text-gray-900 dark:text-[#ededed]">{value}</p>
    </div>
  );
}

function FilterSelect({ value, onChange, options, label }) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)}
        className="pl-3 pr-8 py-2 text-xs border border-gray-200 dark:border-white/[0.06] rounded-lg appearance-none focus:outline-none focus:border-[var(--zelt-primary)]/40 transition-colors bg-white dark:bg-[#141414]">
        <option value="all">Todos {label}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#666] pointer-events-none" />
    </div>
  );
}
