import { useState, useRef, useEffect } from 'react';
import {
  Search, Plus, X, Check, ChevronDown, ChevronRight,
  Shield, ShieldCheck, Settings, Users, Copy, Trash2, Pencil,
  MoreHorizontal, Eye, AlertTriangle, CheckCircle2, ToggleLeft, ToggleRight,
  BarChart3, Zap, MessageSquare, UserPlus, Link2, FileText, Clock,
  Database, Activity, Hash, Layers,
} from 'lucide-react';

const PERMISSION_CATEGORIES = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: BarChart3,
    color: 'var(--zelt-primary)',
    permissions: [
      { id: 'dashboard.view', label: 'Visualizar Dashboard' },
    ],
  },
  {
    id: 'atendimento',
    label: 'Atendimento',
    icon: MessageSquare,
    color: '#2563eb',
    permissions: [
      { id: 'atendimento.ver-conversas', label: 'Visualizar Conversas' },
      { id: 'atendimento.atender', label: 'Atender Conversas' },
      { id: 'atendimento.encerrar', label: 'Encerrar Conversas' },
      { id: 'atendimento.transferir', label: 'Transferir Conversas' },
      { id: 'atendimento.responder', label: 'Responder Clientes' },
      { id: 'atendimento.respostas-rapidas', label: 'Gerenciar Respostas Rapidas' },
    ],
  },
  {
    id: 'ia',
    label: 'Inteligencia Artificial',
    icon: Zap,
    color: '#7c3aed',
    permissions: [
      { id: 'ia.ver-prompts', label: 'Visualizar Prompts' },
      { id: 'ia.editar-prompts', label: 'Editar Prompts' },
      { id: 'ia.base-conhecimento', label: 'Gerenciar Base de Conhecimento' },
      { id: 'ia.testar', label: 'Executar Testes da IA' },
    ],
  },
  {
    id: 'operacoes',
    label: 'Operacoes',
    icon: Settings,
    color: '#d97706',
    permissions: [
      { id: 'operacoes.ver-tarefas', label: 'Visualizar Tarefas' },
      { id: 'operacoes.criar-tarefas', label: 'Criar Tarefas' },
      { id: 'operacoes.editar-tarefas', label: 'Editar Tarefas' },
      { id: 'operacoes.excluir-tarefas', label: 'Excluir Tarefas' },
      { id: 'operacoes.concluir-tarefas', label: 'Concluir Tarefas' },
    ],
  },
  {
    id: 'equipe',
    label: 'Equipe',
    icon: UserPlus,
    color: '#ec4899',
    permissions: [
      { id: 'equipe.ver-membros', label: 'Visualizar Membros' },
      { id: 'equipe.convidar', label: 'Convidar Membros' },
      { id: 'equipe.remover', label: 'Remover Membros' },
      { id: 'equipe.cargos', label: 'Gerenciar Cargos e Permissoes' },
    ],
  },
  {
    id: 'integracoes',
    label: 'Integracoes',
    icon: Link2,
    color: '#0ea5e9',
    permissions: [
      { id: 'integracoes.ver', label: 'Visualizar Integracoes' },
      { id: 'integracoes.configurar', label: 'Configurar Integracoes' },
      { id: 'integracoes.conectar', label: 'Conectar Novas Integracoes' },
      { id: 'integracoes.remover', label: 'Remover Integracoes' },
    ],
  },
  {
    id: 'relatorios',
    label: 'Relatorios',
    icon: FileText,
    color: '#78716c',
    permissions: [
      { id: 'relatorios.ver', label: 'Visualizar Relatorios' },
      { id: 'relatorios.exportar', label: 'Exportar Relatorios' },
    ],
  },
  {
    id: 'configuracoes',
    label: 'Configuracoes',
    icon: Database,
    color: '#dc2626',
    permissions: [
      { id: 'config.workspaces', label: 'Gerenciar Workspaces' },
      { id: 'config.geral', label: 'Alterar Configuracoes Gerais' },
      { id: 'config.cobranca', label: 'Gerenciar Cobranca' },
      { id: 'config.api', label: 'Gerenciar API' },
      { id: 'config.webhooks', label: 'Gerenciar Webhooks' },
    ],
  },
];

const ALL_PERMISSION_IDS = PERMISSION_CATEGORIES.flatMap(c => c.permissions.map(p => p.id));

const ALL_PERMISSIONS_COUNT = ALL_PERMISSION_IDS.length;

const SIDEBAR_MAP = {
  'dashboard.view': 'Dashboard',
  'atendimento.ver-conversas': 'Atendimentos',
  'atendimento.atender': 'Atendimentos',
  'atendimento.respostas-rapidas': 'Atendimentos',
  'ia.ver-prompts': 'IA',
  'ia.editar-prompts': 'IA',
  'ia.base-conhecimento': 'IA',
  'ia.testar': 'IA',
  'equipe.ver-membros': 'Equipe',
  'equipe.cargos': 'Equipe',
  'integracoes.ver': 'Integracoes',
  'relatorios.ver': 'Relatorios',
  'config.workspaces': 'Configuracoes',
  'config.geral': 'Configuracoes',
  'config.cobranca': 'Configuracoes',
  'operacoes.ver-tarefas': 'Operacoes',
};

const DEFAULT_ROLES = [
  {
    id: 'admin',
    name: 'Administrador',
    description: 'Acesso total a todas as funcionalidades do sistema.',
    color: 'var(--zelt-primary)',
    isDefault: true,
    members: 2,
    permissions: [...ALL_PERMISSION_IDS],
  },
  {
    id: 'gerente',
    name: 'Gerente',
    description: 'Gerencia equipe e configuracoes basicas.',
    color: '#2563eb',
    isDefault: true,
    members: 2,
    permissions: [
      'dashboard.view',
      'atendimento.ver-conversas', 'atendimento.atender', 'atendimento.encerrar', 'atendimento.transferir', 'atendimento.responder', 'atendimento.respostas-rapidas',
      'ia.ver-prompts', 'ia.editar-prompts', 'ia.base-conhecimento', 'ia.testar',
      'operacoes.ver-tarefas', 'operacoes.criar-tarefas', 'operacoes.editar-tarefas', 'operacoes.concluir-tarefas',
      'equipe.ver-membros', 'equipe.convidar',
      'integracoes.ver',
      'relatorios.ver', 'relatorios.exportar',
    ],
  },
  {
    id: 'supervisor',
    name: 'Supervisor',
    description: 'Supervisiona atendimentos e operacoes.',
    color: '#059669',
    isDefault: true,
    members: 1,
    permissions: [
      'dashboard.view',
      'atendimento.ver-conversas', 'atendimento.atender', 'atendimento.encerrar', 'atendimento.transferir', 'atendimento.responder',
      'operacoes.ver-tarefas', 'operacoes.criar-tarefas', 'operacoes.concluir-tarefas',
      'equipe.ver-membros',
      'relatorios.ver',
    ],
  },
  {
    id: 'atendente',
    name: 'Atendente',
    description: 'Atende conversas e visualiza informacoes basicas.',
    color: '#78716c',
    isDefault: true,
    members: 2,
    permissions: [
      'dashboard.view',
      'atendimento.ver-conversas', 'atendimento.atender', 'atendimento.encerrar', 'atendimento.responder', 'atendimento.respostas-rapidas',
      'operacoes.ver-tarefas', 'operacoes.criar-tarefas', 'operacoes.concluir-tarefas',
    ],
  },
];

function getPermCount(permissions) {
  if (permissions.includes('*')) return ALL_PERMISSIONS_COUNT;
  return permissions.length;
}

function getModuleCount(permissions) {
  if (permissions.includes('*')) return PERMISSION_CATEGORIES.length;
  const modules = new Set();
  permissions.forEach(p => {
    const mod = p.split('.')[0];
    modules.add(mod);
  });
  return modules.size;
}

function getSidebarItems(permissions) {
  if (permissions.includes('*')) return [...new Set(Object.values(SIDEBAR_MAP))];
  const items = new Set();
  permissions.forEach(p => {
    if (SIDEBAR_MAP[p]) items.add(SIDEBAR_MAP[p]);
  });
  return [...items];
}

function ConfirmModal({ open, title, message, type = 'danger', onClose, onConfirm, children }) {
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
          {children}
        </div>
        <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-[#111]/50">
          <button onClick={onClose} className="px-4 py-2 text-xs text-gray-500 dark:text-[#808080] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] rounded-lg transition-colors">Cancelar</button>
          <button onClick={() => { onConfirm(); onClose(); }}
            className={`px-4 py-2 text-xs text-white rounded-lg transition-colors ${type === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-[var(--zelt-primary)] hover:bg-[var(--zelt-primary-hover)]'}`}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

function RoleModal({ open, role, roles, onClose, onSave }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('var(--zelt-primary)');
  const [permissions, setPermissions] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [emptyWarning, setEmptyWarning] = useState(false);

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description);
      setColor(role.color);
      setPermissions(role.permissions.includes('*') ? [...ALL_PERMISSION_IDS] : [...role.permissions]);
    } else {
      setName('');
      setDescription('');
      setColor('var(--zelt-primary)');
      setPermissions([]);
    }
    setEmptyWarning(false);
  }, [role, open]);

  useEffect(() => {
    setEmptyWarning(permissions.length === 0 && name.length > 0);
  }, [permissions, name]);

  const togglePerm = (permId) => {
    setPermissions(prev => prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]);
  };

  const toggleCategory = (catId) => {
    const cat = PERMISSION_CATEGORIES.find(c => c.id === catId);
    const allIn = cat.permissions.every(p => permissions.includes(p.id));
    if (allIn) {
      setPermissions(prev => prev.filter(p => !cat.permissions.map(cp => cp.id).includes(p)));
    } else {
      setPermissions(prev => [...new Set([...prev, ...cat.permissions.map(p => p.id)])]);
    }
  };

  const toggleAll = () => {
    if (permissions.length === ALL_PERMISSION_IDS.length) setPermissions([]);
    else setPermissions([...ALL_PERMISSION_IDS]);
  };

  const toggleExpanded = (catId) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const savePerms = permissions.length === ALL_PERMISSION_IDS.length ? ['*'] : permissions;
    if (role) {
      onSave({ ...role, name, description, color, permissions: savePerms });
    } else {
      onSave({
        id: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now(),
        name, description, color, isDefault: false, members: 0, permissions: savePerms,
      });
    }
    onClose();
  };

  if (!open) return null;

  const permCount = getPermCount(permissions);
  const modCount = getModuleCount(permissions);
  const sidebarItems = getSidebarItems(permissions);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade">
      <div className="w-full max-w-4xl bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-white/[0.06] overflow-hidden animate-scale max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/[0.06] shrink-0">
          <h3 className="text-sm text-gray-900 dark:text-[#ededed]">{role ? 'Editar Cargo' : 'Novo Cargo'}</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 dark:text-[#666] hover:text-gray-600 dark:hover:text-[#ccc] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] rounded-lg transition-colors"><X size={16} /></button>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* Left - Form + Permissions */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wider mb-1">Nome do Cargo</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Analista"
                  className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-white/[0.06] rounded-lg focus:outline-none focus:border-[var(--zelt-primary)]/40 transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wider mb-1">Cor</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={color} onChange={e => setColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-gray-200 dark:border-white/[0.06] cursor-pointer" />
                  <input type="text" value={color} onChange={e => setColor(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-gray-200 dark:border-white/[0.06] rounded-lg focus:outline-none focus:border-[var(--zelt-primary)]/40 transition-colors" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wider mb-1">Descricao</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Descreva as responsabilidades deste cargo..."
                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-white/[0.06] rounded-lg focus:outline-none focus:border-[var(--zelt-primary)]/40 transition-colors resize-none" />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 dark:text-[#aaa]">Permissoes</span>
                <span className="text-[10px] text-gray-400 dark:text-[#666] bg-gray-100 dark:bg-[#1a1a1a] px-1.5 py-0.5 rounded">{permCount}/{ALL_PERMISSIONS_COUNT}</span>
              </div>
              <button onClick={toggleAll}
                className="text-[10px] text-[var(--zelt-primary)] hover:underline transition-colors">
                {permissions.length === ALL_PERMISSIONS_COUNT ? 'Remover Todas' : 'Selecionar Todas'}
              </button>
            </div>

            {emptyWarning && (
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/40 rounded-lg">
                <AlertTriangle size={13} className="text-amber-500 shrink-0" />
                <p className="text-[11px] text-amber-700">Membros vinculados a este cargo nao conseguirao acessar nenhuma funcionalidade.</p>
              </div>
            )}

            <div className="space-y-2">
              {PERMISSION_CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const catPerms = cat.permissions;
                const activeCount = catPerms.filter(p => permissions.includes(p.id)).length;
                const allActive = activeCount === catPerms.length;
                const someActive = activeCount > 0 && !allActive;
                const isExpanded = expandedCategories[cat.id];

                return (
                  <div key={cat.id} className="border border-gray-100 dark:border-white/[0.06] rounded-xl overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50/50 dark:bg-[#111]/50">
                      <button onClick={() => toggleExpanded(cat.id)}
                        className="text-gray-400 dark:text-[#666] hover:text-gray-600 dark:hover:text-[#ccc] transition-colors">
                        <ChevronRight size={14} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>
                      <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: cat.color + '10' }}>
                        <Icon size={12} style={{ color: cat.color }} />
                      </div>
                      <span className="flex-1 text-xs text-gray-700 dark:text-[#ccc]">{cat.label}</span>
                      <span className="text-[9px] text-gray-400 dark:text-[#666]">{activeCount}/{catPerms.length}</span>
                      <button onClick={() => toggleCategory(cat.id)}
                        className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${allActive ? 'bg-[var(--zelt-primary)] border-[var(--zelt-primary)]' : someActive ? 'bg-[var(--zelt-primary)]/20 border-[var(--zelt-primary)]/40' : 'border-gray-300 dark:border-white/20 hover:border-gray-400 dark:hover:border-white/30'}`}>
                        {allActive && <Check size={10} className="text-white" />}
                        {someActive && <div className="w-2 h-0.5 bg-[var(--zelt-primary)] rounded" />}
                      </button>
                    </div>
                    {isExpanded && (
                      <div className="px-4 py-2 space-y-0.5 border-t border-gray-100 dark:border-white/[0.06]">
                        {catPerms.map(perm => {
                          const active = permissions.includes(perm.id);
                          return (
                            <button key={perm.id} onClick={() => togglePerm(perm.id)}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${active ? 'bg-[var(--zelt-primary)]/5 text-[var(--zelt-primary)]' : 'text-gray-500 dark:text-[#808080] hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'}`}>
                              {active ? <ToggleRight size={16} className="shrink-0" /> : <ToggleLeft size={16} className="text-gray-300 dark:text-[#555] shrink-0" />}
                              {perm.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right - Preview Panel */}
          <div className="w-64 border-l border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-[#111]/50 p-5 overflow-y-auto shrink-0">
            <p className="text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wider mb-3">Pre-visualizacao</p>

            <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-sm text-gray-900 dark:text-[#ededed]">{name || 'Nome do cargo'}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-gray-50 dark:bg-[#111] rounded-lg p-2 text-center">
                  <p className="text-lg text-gray-900 dark:text-[#ededed]">{permCount}</p>
                  <p className="text-[9px] text-gray-400 dark:text-[#666]">Permissoes</p>
                </div>
                <div className="bg-gray-50 dark:bg-[#111] rounded-lg p-2 text-center">
                  <p className="text-lg text-gray-900 dark:text-[#ededed]">{modCount}</p>
                  <p className="text-[9px] text-gray-400 dark:text-[#666]">Modulos</p>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wider mb-2">Sidebar visivel</p>
            <div className="space-y-1">
              {sidebarItems.length > 0 ? sidebarItems.map(item => (
                <div key={item} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-lg">
                  <Check size={10} className="text-[var(--zelt-primary)] shrink-0" />
                  <span className="text-[11px] text-gray-600 dark:text-[#aaa]">{item}</span>
                </div>
              )) : (
                <p className="text-[11px] text-gray-400 dark:text-[#666] italic">Nenhum modulo visivel</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-[#111]/50 shrink-0">
          <button onClick={onClose} className="px-3 py-1.5 text-xs text-gray-500 dark:text-[#808080] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] rounded-lg transition-colors">Cancelar</button>
          <button onClick={handleSave} disabled={!name.trim()}
            className="px-3 py-1.5 text-xs text-white bg-[var(--zelt-primary)] hover:bg-[var(--zelt-primary-hover)] rounded-lg transition-colors disabled:opacity-40">
            {role ? 'Salvar Alteracoes' : 'Criar Cargo'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RolesPermissionsView() {
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [search, setSearch] = useState('');
  const [roleModal, setRoleModal] = useState({ open: false, role: null });
  const [confirmModal, setConfirmModal] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [deleteReassign, setDeleteReassign] = useState(null);
  const [reassignRole, setReassignRole] = useState('');
  const [hasData, setHasData] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = roles.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase())
  );

  const total = roles.length;
  const totalPerms = ALL_PERMISSIONS_COUNT;
  const custom = roles.filter(r => !r.isDefault).length;
  const defaults = roles.filter(r => r.isDefault).length;

  const handleSaveRole = (role) => {
    const exists = roles.find(r => r.id === role.id);
    if (exists) setRoles(prev => prev.map(r => r.id === role.id ? role : r));
    else setRoles(prev => [...prev, role]);
  };

  const handleDuplicate = (role) => {
    const dup = {
      ...role,
      id: role.id + '-copy-' + Date.now(),
      name: role.name + ' (Copia)',
      isDefault: false,
    };
    setRoles(prev => [...prev, dup]);
    setOpenMenu(null);
  };

  const handleDeleteClick = (role) => {
    setOpenMenu(null);
    if (role.members > 0) {
      setDeleteReassign(role);
      setReassignRole('');
    } else {
      setConfirmModal({
        title: 'Excluir cargo',
        message: `Tem certeza que deseja excluir o cargo "${role.name}"?`,
        onConfirm: () => setRoles(prev => prev.filter(r => r.id !== role.id)),
      });
    }
  };

  const handleDeleteReassign = () => {
    if (!reassignRole) return;
    setRoles(prev => prev.filter(r => r.id !== deleteReassign.id).map(r =>
      r.id === reassignRole ? { ...r, members: r.members + deleteReassign.members } : r
    ));
    setDeleteReassign(null);
    setReassignRole('');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300;1,9..40,400&display=swap');
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.97); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fade { animation: fadeIn 0.15s ease-out forwards; }
        .animate-scale { animation: scaleUp 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .roles-view * { font-family: 'DM Sans', system-ui, sans-serif; }
      `}</style>

      <div className="roles-view space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--zelt-primary)]/8 flex items-center justify-center">
              <ShieldCheck size={16} className="text-[var(--zelt-primary)]" />
            </div>
            <h2 className="text-sm text-gray-900 dark:text-[#ededed]">Cargos e Permissoes</h2>
          </div>
          <button onClick={() => setRoleModal({ open: true, role: null })}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs text-white bg-[var(--zelt-primary)] hover:bg-[var(--zelt-primary-hover)] rounded-lg transition-colors">
            <Plus size={14} /> Novo Cargo
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#666]" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cargos..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 dark:border-white/[0.06] rounded-lg focus:outline-none focus:border-[var(--zelt-primary)]/40 transition-colors bg-white dark:bg-[#141414]" />
          </div>
        </div>

        {/* Stats + Content */}
        {hasData ? (
          <>
            <div className="grid grid-cols-4 gap-2">
              <StatCard icon={Layers} label="Total de cargos" value={total} color="var(--zelt-primary)" />
              <StatCard icon={Hash} label="Total de permissoes" value={totalPerms} color="#2563eb" />
              <StatCard icon={Pencil} label="Cargos personalizados" value={custom} color="#059669" />
              <StatCard icon={Shield} label="Cargos padrao" value={defaults} color="#78716c" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map(role => {
                const permCount = getPermCount(role.permissions);
                const modCount = getModuleCount(role.permissions);
                const sidebarItems = getSidebarItems(role.permissions);

                return (
                  <div key={role.id}
                    className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-4 transition-colors hover:border-gray-300 dark:hover:border-white/15 group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: role.color + '15' }}>
                          <Shield size={14} style={{ color: role.color }} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-900 dark:text-[#ededed]">{role.name}</p>
                          {role.isDefault && (
                            <span className="text-[9px] text-gray-400 dark:text-[#666] bg-gray-100 dark:bg-[#1a1a1a] px-1.5 py-0.5 rounded">Padrao</span>
                          )}
                        </div>
                      </div>
                      <div className="relative" ref={openMenu === role.id ? menuRef : undefined}>
                        <button onClick={() => setOpenMenu(openMenu === role.id ? null : role.id)}
                          className="p-1 text-gray-400 dark:text-[#666] hover:text-gray-600 dark:hover:text-[#ccc] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                          <MoreHorizontal size={14} />
                        </button>
                        {openMenu === role.id && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl py-1.5 z-20 shadow-sm">
                            <button onClick={() => { setRoleModal({ open: true, role }); setOpenMenu(null); }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-[11px] text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:hover:bg-[#1a1a1a]">
                              <Pencil size={11} /> Editar
                            </button>
                            <button onClick={() => { handleDuplicate(role); }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-[11px] text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:hover:bg-[#1a1a1a]">
                              <Copy size={11} /> Duplicar
                            </button>
                            {!role.isDefault && (
                              <>
                                <div className="border-t border-gray-100 dark:border-white/[0.06] my-1" />
                                <button onClick={() => handleDeleteClick(role)}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-[11px] text-red-500 hover:bg-red-50 dark:bg-red-900/20">
                                  <Trash2 size={11} /> Excluir
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-500 dark:text-[#808080] mb-3 line-clamp-2">{role.description}</p>

                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Users size={11} className="text-gray-400 dark:text-[#666]" />
                        <span className="text-[10px] text-gray-500 dark:text-[#808080]">{role.members} {role.members === 1 ? 'membro' : 'membros'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={11} className="text-gray-400 dark:text-[#666]" />
                        <span className="text-[10px] text-gray-500 dark:text-[#808080]">{permCount} permissoes</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {sidebarItems.slice(0, 5).map(item => (
                        <span key={item} className="text-[9px] text-gray-500 dark:text-[#808080] bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] px-1.5 py-0.5 rounded">
                          {item}
                        </span>
                      ))}
                      {sidebarItems.length > 5 && (
                        <span className="text-[9px] text-gray-400 dark:text-[#666]">+{sidebarItems.length - 5}</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="col-span-full text-center py-12 text-xs text-gray-400 dark:text-[#666]">
                  Nenhum cargo encontrado.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-12 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-[var(--zelt-primary)]/5 flex items-center justify-center text-[var(--zelt-primary)] mb-4">
              <Shield size={24} />
            </div>
            <h3 className="text-sm text-gray-900 dark:text-[#ededed] mb-1">Nenhum cargo configurado</h3>
            <p className="text-sm text-gray-400 dark:text-[#666] max-w-[300px] leading-relaxed mb-1">Crie cargos e defina permissoes para sua equipe.</p>
          </div>
        )}

        <RoleModal
          open={roleModal.open}
          role={roleModal.role}
          roles={roles}
          onClose={() => setRoleModal({ open: false, role: null })}
          onSave={handleSaveRole}
        />

        <ConfirmModal
          open={!!confirmModal}
          title={confirmModal?.title}
          message={confirmModal?.message}
          type="danger"
          onClose={() => setConfirmModal(null)}
          onConfirm={() => { confirmModal?.onConfirm(); setConfirmModal(null); }}
        />

        {/* Delete with reassign modal */}
        {deleteReassign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade">
            <div className="w-full max-w-md bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-white/[0.06] overflow-hidden animate-scale">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
                <h3 className="text-sm text-gray-900 dark:text-[#ededed]">Excluir cargo com membros</h3>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-xs text-gray-600 dark:text-[#aaa]">
                  O cargo <span className="text-gray-900 dark:text-[#ededed] font-medium">{deleteReassign.name}</span> possui{' '}
                  <span className="text-gray-900 dark:text-[#ededed] font-medium">{deleteReassign.members}</span> {deleteReassign.members === 1 ? 'membro vinculado' : 'membros vinculados'}.
                  Escolha um cargo para substituir antes de excluir.
                </p>
                <div>
                  <label className="block text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wider mb-1">Novo cargo</label>
                  <div className="relative">
                    <select value={reassignRole} onChange={e => setReassignRole(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-white/[0.06] rounded-lg appearance-none focus:outline-none focus:border-[var(--zelt-primary)]/40 transition-colors bg-white dark:bg-[#141414]">
                      <option value="">Selecione um cargo</option>
                      {roles.filter(r => r.id !== deleteReassign.id).map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#666] pointer-events-none" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-[#111]/50">
                <button onClick={() => setDeleteReassign(null)} className="px-3 py-1.5 text-xs text-gray-500 dark:text-[#808080] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] rounded-lg transition-colors">Cancelar</button>
                <button onClick={handleDeleteReassign} disabled={!reassignRole}
                  className="px-3 py-1.5 text-xs text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-40">
                  Excluir e Reatribuir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
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
