import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  HiOutlineX, HiOutlineLink, HiOutlineMail, HiOutlineUserAdd,
  HiOutlineCheck, HiOutlineUsers, HiOutlineTrash, HiOutlineShieldCheck,
  HiOutlineDotsVertical, HiOutlinePencil, HiOutlineBan, HiOutlineRefresh,
  HiOutlineExclamationCircle, HiOutlineUserCircle, HiOutlineClock,
  HiOutlineDuplicate, HiOutlineKey, HiOutlineCog,
} from 'react-icons/hi';
import { useToast } from './Toast';

const API_URL = import.meta.env.VITE_API_URL || 'https://zelt-backend-production.up.railway.app/api/v1';

const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Administrador', desc: 'Acesso total ao workspace' },
  { value: 'MANAGER', label: 'Gerente', desc: 'Gerencia equipe e configurações' },
  { value: 'AGENT', label: 'Atendente', desc: 'Atende clientes no chat' },
  { value: 'VIEWER', label: 'Visualizador', desc: 'Somente visualização' },
];

const ROLE_COLORS = {
  OWNER: 'bg-[#6300ff]/10 text-[#6300ff]',
  ADMIN: 'bg-blue-50 text-blue-600',
  MANAGER: 'bg-amber-50 text-amber-600',
  AGENT: 'bg-gray-100 text-gray-600',
  VIEWER: 'bg-gray-50 text-gray-500',
};

const ROLE_LABELS = {
  OWNER: 'Proprietário',
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  AGENT: 'Atendente',
  VIEWER: 'Visualizador',
};

const PERMISSION_OPTIONS = [
  { key: 'workspace.edit', label: 'Editar workspace' },
  { key: 'members.manage', label: 'Gerenciar membros' },
  { key: 'chat.view', label: 'Ver conversas' },
  { key: 'chat.send', label: 'Enviar mensagens' },
  { key: 'knowledge.view', label: 'Ver base de conhecimento' },
  { key: 'knowledge.edit', label: 'Editar base de conhecimento' },
  { key: 'analytics.view', label: 'Ver relatórios' },
  { key: 'integrations.manage', label: 'Gerenciar integrações' },
];

const MAX_USES_OPTIONS = [1, 5, 10, -1];

export default function MemberManagementModal({ workspace, token, onClose }) {
  const toast = useToast();

  // Data
  const [members, setMembers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [linkInvites, setLinkInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tabs
  const [tab, setTab] = useState('members');

  // Invite modal
  const [inviteTab, setInviteTab] = useState('email');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('AGENT');
  const [invitePerms, setInvitePerms] = useState({});
  const [linkRole, setLinkRole] = useState('AGENT');
  const [linkPerms, setLinkPerms] = useState({});
  const [linkExpiry, setLinkExpiry] = useState(30);
  const [linkMaxUses, setLinkMaxUses] = useState(-1);
  const [inviting, setInviting] = useState(false);

  // Member actions
  const [actionMember, setActionMember] = useState(null);
  const [actionOpen, setActionOpen] = useState(false);
  const [changeRoleOpen, setChangeRoleOpen] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [permsOpen, setPermsOpen] = useState(false);
  const [editPerms, setEditPerms] = useState({});
  const [confirmAction, setConfirmAction] = useState(null);

  const actionRef = useRef(null);

  // Fetch data
  const fetchMembers = useCallback(async () => {
    if (!workspace?.id || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/workspace/${workspace.id}/members`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMembers(data.members || []);
        setPendingInvites(data.pendingInvites || []);
      }
    } catch { /* silent */ }
    setLoading(false);
  }, [workspace?.id, token]);

  const fetchLinkInvites = useCallback(async () => {
    if (!workspace?.id || !token) return;
    try {
      const res = await fetch(`${API_URL}/workspace/${workspace.id}/invite/links`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setLinkInvites(data.invites || []);
    } catch { /* silent */ }
  }, [workspace?.id, token]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);
  useEffect(() => { if (tab === 'invites') fetchLinkInvites(); }, [tab, fetchLinkInvites]);

  // Close action menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (actionRef.current && !actionRef.current.contains(e.target)) {
        setActionOpen(false);
        setActionMember(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ---------- INVITE BY EMAIL ----------
  const handleInviteEmail = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim() || inviting) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim())) {
      toast.warning('Insira um e-mail válido.');
      return;
    }
    setInviting(true);
    try {
      const res = await fetch(`${API_URL}/workspace/${workspace.id}/invite/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole, permissions: invitePerms })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Convite enviado para ${inviteEmail.trim()}`);
        setInviteEmail('');
        setInviteOpen(false);
        fetchMembers();
      } else {
        toast.error(data.message || 'Erro ao enviar convite.');
      }
    } catch {
      toast.error('Erro ao enviar convite.');
    }
    setInviting(false);
  };

  // ---------- GENERATE LINK ----------
  const handleGenerateLink = async () => {
    setInviting(true);
    try {
      const res = await fetch(`${API_URL}/workspace/${workspace.id}/invite/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ role: linkRole, permissions: linkPerms, expiresInDays: linkExpiry, maxUses: linkMaxUses === -1 ? 999999 : linkMaxUses })
      });
      const data = await res.json();
      if (data.success) {
        const link = `${window.location.origin}/register?invite=${data.token}`;
        await navigator.clipboard.writeText(link);
        toast.success('Link gerado e copiado!');
        setInviteOpen(false);
        fetchLinkInvites();
      } else {
        toast.error(data.message || 'Erro ao gerar link.');
      }
    } catch {
      toast.error('Erro ao gerar link.');
    }
    setInviting(false);
  };

  // ---------- MEMBER ACTIONS ----------
  const handleChangeRole = async () => {
    if (!actionMember || !newRole) return;
    try {
      const res = await fetch(`${API_URL}/workspace/${workspace.id}/members/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ targetUserId: actionMember.userId, role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Cargo alterado!');
        setChangeRoleOpen(false);
        setActionMember(null);
        fetchMembers();
      } else {
        toast.error(data.message || 'Erro ao alterar cargo.');
      }
    } catch {
      toast.error('Erro ao alterar cargo.');
    }
  };

  const handleUpdatePermissions = async () => {
    if (!actionMember) return;
    try {
      const res = await fetch(`${API_URL}/workspace/${workspace.id}/members/permissions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ targetUserId: actionMember.userId, permissions: editPerms })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Permissões atualizadas!');
        setPermsOpen(false);
        setActionMember(null);
        fetchMembers();
      } else {
        toast.error(data.message || 'Erro ao atualizar permissões.');
      }
    } catch {
      toast.error('Erro ao atualizar permissões.');
    }
  };

  const handleDeactivate = async () => {
    if (!actionMember) return;
    try {
      const res = await fetch(`${API_URL}/workspace/${workspace.id}/members/${actionMember.userId}/deactivate`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Membro desativado.');
        setConfirmAction(null);
        setActionMember(null);
        fetchMembers();
      } else {
        toast.error(data.message || 'Erro ao desativar.');
      }
    } catch {
      toast.error('Erro ao desativar.');
    }
  };

  const handleRemove = async () => {
    if (!actionMember) return;
    try {
      const res = await fetch(`${API_URL}/workspace/${workspace.id}/members/${actionMember.userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Membro removido.');
        setConfirmAction(null);
        setActionMember(null);
        fetchMembers();
      } else {
        toast.error(data.message || 'Erro ao remover.');
      }
    } catch {
      toast.error('Erro ao remover.');
    }
  };

  const handleResendInvite = async (inviteId) => {
    try {
      const res = await fetch(`${API_URL}/workspace/${workspace.id}/invite/resend/${inviteId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Convite reenviado!');
        fetchMembers();
      } else {
        toast.error(data.message || 'Erro ao reenviar.');
      }
    } catch {
      toast.error('Erro ao reenviar.');
    }
  };

  const handleRevokeLink = async (inviteId) => {
    try {
      const res = await fetch(`${API_URL}/workspace/${workspace.id}/invite/revoke/${inviteId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Link revogado.');
        fetchLinkInvites();
      } else {
        toast.error(data.message || 'Erro ao revogar.');
      }
    } catch {
      toast.error('Erro ao revogar.');
    }
  };

  const handleCopyLink = async (tokenInvite) => {
    const link = `${window.location.origin}/register?invite=${tokenInvite}`;
    await navigator.clipboard.writeText(link);
    toast.success('Link copiado!');
  };

  const formatDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return d; }
  };

  const togglePerm = (key, obj, setter) => {
    setter({ ...obj, [key]: !obj[key] });
  };

  const currentUser = members.find(m => m.userId === workspace?.ownerId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20" onClick={onClose}>
      <style>{`@keyframes scaleMember { from { transform: scale(0.97); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200/60 shadow-xl flex flex-col"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'scaleMember 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#6300ff]/8 flex items-center justify-center">
              <HiOutlineUsers size={18} className="text-[#6300ff]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Gerenciar Membros</h2>
              <p className="text-[10px] text-gray-400 mt-0.5">{workspace?.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition">
            <HiOutlineX size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-5 pt-3 shrink-0">
          <button onClick={() => setTab('members')} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${tab === 'members' ? 'bg-[#6300ff]/10 text-[#6300ff]' : 'text-gray-500 hover:bg-gray-50'}`}>
            Membros ({members.length})
          </button>
          <button onClick={() => setTab('invites')} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${tab === 'invites' ? 'bg-[#6300ff]/10 text-[#6300ff]' : 'text-gray-500 hover:bg-gray-50'}`}>
            Convites ({pendingInvites.length + linkInvites.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-[#6300ff] rounded-full animate-spin" />
            </div>
          ) : tab === 'members' ? (
            <>
              {members.length === 0 ? (
                <div className="text-center py-12">
                  <HiOutlineUsers size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-xs text-gray-400">Nenhum membro encontrado.</p>
                </div>
              ) : (
                members.map(member => (
                  <div key={member.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200/80 transition group relative">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6300ff] to-purple-400 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
                      {member.user?.avatar ? (
                        <img src={member.user.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        member.user?.name?.charAt(0)?.toUpperCase() || 'U'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-800 truncate">{member.user?.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${ROLE_COLORS[member.role] || ROLE_COLORS.AGENT}`}>
                          {ROLE_LABELS[member.role] || member.role}
                        </span>
                        {!member.active && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-red-50 text-red-500">Desativado</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-400 truncate">{member.user?.email}</span>
                        <span className="text-[10px] text-gray-300">·</span>
                        <span className="text-[10px] text-gray-400">{formatDate(member.joinedAt)}</span>
                        {member.lastAccessAt && (
                          <>
                            <span className="text-[10px] text-gray-300">·</span>
                            <span className="text-[10px] text-gray-400">Último acesso: {formatDate(member.lastAccessAt)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {member.role !== 'OWNER' && (
                      <div className="relative" ref={actionMember?.id === member.id ? actionRef : undefined}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionMember(member);
                            setActionOpen(actionMember?.id === member.id ? !actionOpen : true);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                        >
                          <HiOutlineDotsVertical size={14} />
                        </button>
                        {actionOpen && actionMember?.id === member.id && (
                          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200/60 rounded-xl py-1.5 min-w-[180px] z-20 shadow-lg">
                            <button onClick={() => { setChangeRoleOpen(true); setNewRole(member.role); setActionOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 transition">
                              <HiOutlineShieldCheck size={13} /> Alterar cargo
                            </button>
                            <button onClick={() => { setPermsOpen(true); setEditPerms(member.permissions || {}); setActionOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 transition">
                              <HiOutlineCog size={13} /> Alterar permissões
                            </button>
                            {member.active ? (
                              <button onClick={() => { setConfirmAction({ type: 'deactivate', member }); setActionOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-amber-600 hover:bg-amber-50 transition">
                                <HiOutlineBan size={13} /> Desativar acesso
                              </button>
                            ) : (
                              <button onClick={() => { handleDeactivate(); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-emerald-600 hover:bg-emerald-50 transition">
                                <HiOutlineRefresh size={13} /> Reativar acesso
                              </button>
                            )}
                            <div className="border-t border-gray-100 my-1" />
                            <button onClick={() => { setConfirmAction({ type: 'remove', member }); setActionOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition">
                              <HiOutlineTrash size={13} /> Remover do workspace
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </>
          ) : (
            <>
              {/* Pending email invites */}
              {pendingInvites.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-2">Convites por e-mail pendentes</p>
                  {pendingInvites.map(inv => (
                    <div key={inv.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl mb-2">
                      <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                        <HiOutlineMail size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium text-gray-800 block truncate">{inv.email}</span>
                        <span className="text-[10px] text-gray-400">Expira: {formatDate(inv.expiresAt)}</span>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${ROLE_COLORS[inv.role] || ROLE_COLORS.AGENT}`}>
                        {ROLE_LABELS[inv.role] || inv.role}
                      </span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleResendInvite(inv.id)} className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Reenviar">
                          <HiOutlineRefresh size={13} />
                        </button>
                        <button onClick={() => { setConfirmAction({ type: 'revokeInvite', invite: inv }); }} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition" title="Revogar">
                          <HiOutlineX size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Link invites */}
              {linkInvites.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-2">Links de convite</p>
                  {linkInvites.map(inv => (
                    <div key={inv.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl mb-2">
                      <div className="w-8 h-8 rounded-full bg-[#6300ff]/10 flex items-center justify-center text-[#6300ff] shrink-0">
                        <HiOutlineLink size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${ROLE_COLORS[inv.role] || ROLE_COLORS.AGENT}`}>
                            {ROLE_LABELS[inv.role] || inv.role}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {inv.usedCount}/{inv.maxUses >= 999999 ? '∞' : inv.maxUses} usos
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 block mt-0.5">Expira: {formatDate(inv.expiresAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleCopyLink(inv.token)} className="p-1 text-gray-400 hover:text-[#6300ff] hover:bg-[#6300ff]/10 rounded-lg transition" title="Copiar link">
                          <HiOutlineDuplicate size={13} />
                        </button>
                        <button onClick={() => handleRevokeLink(inv.id)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition" title="Revogar">
                          <HiOutlineX size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {pendingInvites.length === 0 && linkInvites.length === 0 && (
                <div className="text-center py-12">
                  <HiOutlineClock size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-xs text-gray-400">Nenhum convite pendente.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 shrink-0 flex items-center justify-between">
          <button onClick={() => setInviteOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#6300ff] hover:bg-[#5200d6] rounded-xl transition">
            <HiOutlineUserAdd size={14} /> Convidar membro
          </button>
          <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200/60 rounded-lg hover:bg-gray-100 transition">
            Fechar
          </button>
        </div>
      </div>

      {/* ===== INVITE MODAL ===== */}
      {inviteOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30" onClick={() => setInviteOpen(false)}>
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200/60 shadow-xl" onClick={e => e.stopPropagation()} style={{ animation: 'scaleMember 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Convidar membro</h3>
              <button onClick={() => setInviteOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition">
                <HiOutlineX size={16} />
              </button>
            </div>

            {/* Invite tabs */}
            <div className="flex items-center gap-1 px-5 pt-3">
              <button onClick={() => setInviteTab('email')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition ${inviteTab === 'email' ? 'bg-[#6300ff]/10 text-[#6300ff]' : 'text-gray-500 hover:bg-gray-50'}`}>
                <HiOutlineMail size={13} /> Por e-mail
              </button>
              <button onClick={() => setInviteTab('link')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition ${inviteTab === 'link' ? 'bg-[#6300ff]/10 text-[#6300ff]' : 'text-gray-500 hover:bg-gray-50'}`}>
                <HiOutlineLink size={13} /> Gerar link
              </button>
            </div>

            <div className="p-5 space-y-4">
              {inviteTab === 'email' ? (
                <form onSubmit={handleInviteEmail} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">E-mail do colaborador</label>
                    <input
                      type="email" required value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                      placeholder="email@exemplo.com"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#6300ff]/40 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Cargo</label>
                    <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#6300ff]/40 transition bg-white">
                      {ROLE_OPTIONS.filter(r => r.value !== 'OWNER').map(r => (
                        <option key={r.value} value={r.value}>{r.label} — {r.desc}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Permissões</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PERMISSION_OPTIONS.map(p => (
                        <label key={p.key} className="flex items-center gap-2 cursor-pointer group">
                          <div onClick={() => togglePerm(p.key, invitePerms, setInvitePerms)} className={`w-4 h-4 rounded border flex items-center justify-center transition ${invitePerms[p.key] ? 'bg-[#6300ff] border-[#6300ff]' : 'border-gray-300 group-hover:border-gray-400'}`}>
                            {invitePerms[p.key] && <HiOutlineCheck size={10} className="text-white" />}
                          </div>
                          <span className="text-[11px] text-gray-600">{p.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                    <button type="button" onClick={() => setInviteOpen(false)} className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancelar</button>
                    <button type="submit" disabled={inviting || !inviteEmail.trim()} className="px-4 py-2 text-xs font-medium text-white bg-[#6300ff] hover:bg-[#5200d6] rounded-lg transition disabled:opacity-50 flex items-center gap-1.5">
                      {inviting ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HiOutlineMail size={12} />}
                      Enviar convite
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Cargo padrão</label>
                    <select value={linkRole} onChange={e => setLinkRole(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#6300ff]/40 transition bg-white">
                      {ROLE_OPTIONS.filter(r => r.value !== 'OWNER').map(r => (
                        <option key={r.value} value={r.value}>{r.label} — {r.desc}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Permissões padrão</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PERMISSION_OPTIONS.map(p => (
                        <label key={p.key} className="flex items-center gap-2 cursor-pointer group">
                          <div onClick={() => togglePerm(p.key, linkPerms, setLinkPerms)} className={`w-4 h-4 rounded border flex items-center justify-center transition ${linkPerms[p.key] ? 'bg-[#6300ff] border-[#6300ff]' : 'border-gray-300 group-hover:border-gray-400'}`}>
                            {linkPerms[p.key] && <HiOutlineCheck size={10} className="text-white" />}
                          </div>
                          <span className="text-[11px] text-gray-600">{p.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Expiração (dias)</label>
                      <select value={linkExpiry} onChange={e => setLinkExpiry(Number(e.target.value))}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#6300ff]/40 transition bg-white">
                        <option value={7}>7 dias</option>
                        <option value={15}>15 dias</option>
                        <option value={30}>30 dias</option>
                        <option value={60}>60 dias</option>
                        <option value={90}>90 dias</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Máx. de usos</label>
                      <select value={linkMaxUses} onChange={e => setLinkMaxUses(Number(e.target.value))}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#6300ff]/40 transition bg-white">
                        <option value={1}>1 uso</option>
                        <option value={5}>5 usos</option>
                        <option value={10}>10 usos</option>
                        <option value={-1}>Ilimitado</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                    <button onClick={() => setInviteOpen(false)} className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancelar</button>
                    <button onClick={handleGenerateLink} disabled={inviting} className="px-4 py-2 text-xs font-medium text-white bg-[#6300ff] hover:bg-[#5200d6] rounded-lg transition disabled:opacity-50 flex items-center gap-1.5">
                      {inviting ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HiOutlineLink size={12} />}
                      Gerar e copiar link
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== CHANGE ROLE MODAL ===== */}
      {changeRoleOpen && actionMember && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30" onClick={() => setChangeRoleOpen(false)}>
          <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200/60 shadow-xl" onClick={e => e.stopPropagation()} style={{ animation: 'scaleMember 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Alterar cargo</h3>
              <button onClick={() => setChangeRoleOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition">
                <HiOutlineX size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-gray-500">Selecione o novo cargo para <strong className="text-gray-700">{actionMember.user?.name}</strong></p>
              <div className="space-y-2">
                {ROLE_OPTIONS.filter(r => r.value !== 'OWNER').map(r => (
                  <label key={r.value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${newRole === r.value ? 'border-[#6300ff] bg-[#6300ff]/[0.02]' : 'border-gray-100 hover:border-gray-200'}`}>
                    <input type="radio" name="role" value={r.value} checked={newRole === r.value} onChange={e => setNewRole(e.target.value)} className="sr-only" />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${newRole === r.value ? 'border-[#6300ff]' : 'border-gray-300'}`}>
                      {newRole === r.value && <div className="w-2 h-2 rounded-full bg-[#6300ff]" />}
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-800 block">{r.label}</span>
                      <span className="text-[10px] text-gray-400">{r.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button onClick={() => setChangeRoleOpen(false)} className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancelar</button>
                <button onClick={handleChangeRole} className="px-4 py-2 text-xs font-medium text-white bg-[#6300ff] hover:bg-[#5200d6] rounded-lg transition">Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== PERMISSIONS MODAL ===== */}
      {permsOpen && actionMember && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30" onClick={() => setPermsOpen(false)}>
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200/60 shadow-xl" onClick={e => e.stopPropagation()} style={{ animation: 'scaleMember 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Permissões</h3>
              <button onClick={() => setPermsOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition">
                <HiOutlineX size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-gray-500">Permissões de <strong className="text-gray-700">{actionMember.user?.name}</strong></p>
              <div className="space-y-2">
                {PERMISSION_OPTIONS.map(p => (
                  <label key={p.key} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 cursor-pointer transition">
                    <span className="text-xs font-medium text-gray-700">{p.label}</span>
                    <div onClick={() => togglePerm(p.key, editPerms, setEditPerms)} className={`w-9 h-5 rounded-full transition cursor-pointer relative ${editPerms[p.key] ? 'bg-[#6300ff]' : 'bg-gray-200'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${editPerms[p.key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button onClick={() => setPermsOpen(false)} className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancelar</button>
                <button onClick={handleUpdatePermissions} className="px-4 py-2 text-xs font-medium text-white bg-[#6300ff] hover:bg-[#5200d6] rounded-lg transition">Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== CONFIRM ACTION MODAL ===== */}
      {confirmAction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30" onClick={() => setConfirmAction(null)}>
          <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200/60 shadow-xl" onClick={e => e.stopPropagation()} style={{ animation: 'scaleMember 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
            <div className="p-5 text-center">
              <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${confirmAction.type === 'revokeInvite' ? 'bg-amber-50' : 'bg-red-50'}`}>
                <HiOutlineExclamationCircle size={24} className={confirmAction.type === 'revokeInvite' ? 'text-amber-500' : 'text-red-500'} />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                {confirmAction.type === 'remove' ? 'Remover membro' : confirmAction.type === 'deactivate' ? 'Desativar acesso' : 'Revogar convite'}
              </h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                {confirmAction.type === 'remove'
                  ? `Tem certeza que deseja remover ${confirmAction.member.user?.name} do workspace? Esta ação não pode ser desfeita.`
                  : confirmAction.type === 'deactivate'
                  ? `Deseja desativar o acesso de ${confirmAction.member.user?.name}? Ele não poderá mais acessar este workspace.`
                  : `Deseja revogar este convite? O link não funcionará mais.`
                }
              </p>
            </div>
            <div className="flex gap-2 px-5 pb-5">
              <button onClick={() => setConfirmAction(null)} className="flex-1 px-4 py-2 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200/60 rounded-lg hover:bg-gray-100 transition">
                Cancelar
              </button>
              <button onClick={() => {
                if (confirmAction.type === 'remove') handleRemove();
                else if (confirmAction.type === 'deactivate') handleDeactivate();
                else if (confirmAction.type === 'revokeInvite') handleRevokeLink(confirmAction.invite.id);
              }} className={`flex-1 px-4 py-2 text-xs font-medium text-white rounded-lg transition ${confirmAction.type === 'revokeInvite' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-red-500 hover:bg-red-600'}`}>
                {confirmAction.type === 'remove' ? 'Remover' : confirmAction.type === 'deactivate' ? 'Desativar' : 'Revogar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
