import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  HiOutlinePlus,
  HiOutlineOfficeBuilding,
  HiOutlineArrowRight,
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiOutlineMinusCircle,
  HiOutlineX,
  HiOutlineSearch,
  HiChevronDown,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineUsers,
  HiOutlineDotsVertical,
  HiOutlineUserCircle,
  HiOutlineLogout,
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import MemberManagementModal from '../components/MemberManagementModal';


export default function WorkspacesPage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const isEmployee = user?.accountType === 'EMPLOYEE';

  const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(null);
  const [isMembersOpen, setIsMembersOpen] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const contextMenuRef = useRef(null);

  const fetchWorkspaces = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch(`${API_URL}/workspace`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const all = [...(data.owned || []), ...(data.members || [])];
        setWorkspaces(all);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchWorkspaces(); }, [fetchWorkspaces]);

  useEffect(() => {
    const handler = (e) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) setContextMenu(null);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredWorkspaces = workspaces.filter(ws =>
    ws.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ws.description && ws.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim() || creating) return;
    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/workspace`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined })
      });
      const data = await res.json();
      if (data.success && data.workspace) {
        setWorkspaces(prev => [data.workspace, ...prev]);
        setIsCreateOpen(false);
        setName('');
        setDescription('');
        toast.success('Workspace criado com sucesso!');
      } else {
        toast.error(data.message || 'Erro ao criar workspace.');
      }
    } catch {
      toast.error('Erro ao criar workspace. Tente novamente.');
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !isEditOpen) return;
    try {
      const res = await fetch(`${API_URL}/workspace/${isEditOpen.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined })
      });
      const data = await res.json();
      if (data.success && data.workspace) {
        setWorkspaces(prev => prev.map(ws => ws.id === isEditOpen.id ? data.workspace : ws));
        setIsEditOpen(null);
        setName('');
        setDescription('');
        toast.success('Workspace atualizado!');
      } else {
        toast.error(data.message || 'Erro ao atualizar workspace.');
      }
    } catch {
      toast.error('Erro ao atualizar workspace.');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      const res = await fetch(`${API_URL}/workspace/${confirmDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setWorkspaces(prev => prev.filter(w => w.id !== confirmDelete.id));
        toast.success(`"${confirmDelete.name}" foi excluido.`);
      } else {
        toast.error(data.message || 'Erro ao excluir workspace.');
      }
    } catch {
      toast.error('Erro ao excluir workspace.');
    }
    setConfirmDelete(null);
    setContextMenu(null);
  };

  const openCreate = () => { setName(''); setDescription(''); setIsCreateOpen(true); };
  const openEdit = (ws) => { setName(ws.name); setDescription(ws.description || ''); setIsEditOpen(ws); setContextMenu(null); };
  const openMembers = (ws) => { setIsMembersOpen(ws); setContextMenu(null); };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try { return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return dateStr; }
  };

  return (
    <div className="min-h-screen bg-gray-50/30 flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-10 w-full h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 md:px-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/icon.png" className="h-9 object-contain" alt="Zelt" />
          <div className="hidden md:flex flex-col leading-tight">
            <span className="text-sm font-semibold text-gray-900">Zelt.ai</span>
            <span className="text-[11px] text-gray-400">Workspace Manager</span>
          </div>
        </div>

        <div className="relative w-full max-w-md mx-6 hidden md:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <HiOutlineSearch size={18} />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar workspaces..."
            className="w-full py-2.5 pl-10 pr-4 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-[#6300ff]/40 focus:bg-white transition-all text-gray-700 placeholder-gray-400"
          />
        </div>

        <div className="flex items-center gap-3" ref={profileRef}>
          <div
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 hover:bg-gray-100 transition cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6300ff] to-purple-400 flex items-center justify-center text-white font-semibold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-xs font-medium text-gray-900">{user?.name || 'Usuario'}</span>
              <span className="text-[10px] text-gray-400">Plano Pro</span>
            </div>
            <HiChevronDown className={`text-gray-400 text-sm transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </div>

          {profileOpen && (
            <div className="absolute right-6 top-full mt-1.5 bg-white border border-gray-200/60 rounded-xl py-1.5 min-w-[180px] z-30 shadow-lg">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs font-medium text-gray-900">{user?.name}</p>
                <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
              </div>
              <button onClick={() => setProfileOpen(false)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                <HiOutlineUserCircle size={14} /> Meu perfil
              </button>
              <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors">
                <HiOutlineLogout size={14} /> Sair
              </button>
            </div>
          )}
        </div>
      </header>

      {/* CONTEUDO */}
      <main className="flex-1 p-6 md:p-10 max-w-6xl w-full mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Ambientes de Trabalho</h1>
            <p className="text-xs text-gray-500 mt-0.5">Gerencie seus fluxos e dados integrados de automacao do WhatsApp.</p>
          </div>
          {!isEmployee && (
            <button onClick={openCreate} className="inline-flex items-center gap-2 justify-center px-4 py-2.5 text-xs font-semibold text-white bg-[#6300ff] hover:bg-[#5200d6] rounded-xl transition-all duration-200">
              <HiOutlinePlus size={16} /> Criar workspace
            </button>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-[3px] border-gray-200 border-t-[#6300ff] rounded-full animate-spin" />
          </div>
        )}

        {!loading && workspaces.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#6300ff]/8 flex items-center justify-center mb-4">
              <HiOutlineOfficeBuilding size={28} className="text-[#6300ff]" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {isEmployee ? 'Nenhum workspace atribuído' : 'Nenhum workspace ainda'}
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mb-6">
              {isEmployee
                ? 'Você ainda não foi adicionado a nenhum workspace. Aguarde um convite de um administrador.'
                : 'Crie seu primeiro workspace para comecar a organizar seus atendimentos, automacoes e integracoes.'
              }
            </p>
            {!isEmployee && (
              <button onClick={openCreate} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#6300ff] hover:bg-[#5200d6] rounded-xl transition-all">
                <HiOutlinePlus size={16} /> Criar primeiro workspace
              </button>
            )}
          </div>
        )}

        {!loading && workspaces.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!isEmployee && (
              <div onClick={openCreate} className="flex flex-col items-center justify-center p-6 min-h-[220px] bg-white border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-[#6300ff]/50 hover:bg-[#6300ff]/[0.02] transition-all duration-300 group">
                <div className="p-3 rounded-full bg-gray-50 text-gray-400 group-hover:bg-[#6300ff]/10 group-hover:text-[#6300ff] transition-all duration-300">
                  <HiOutlinePlus size={24} />
                </div>
              <span className="mt-3 text-sm font-semibold text-gray-700 group-hover:text-[#6300ff] transition-colors">Criar novo workspace</span>
            </div>
            )}

            {filteredWorkspaces.map((ws) => (
              <div
                key={ws.id}
                onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, workspace: ws }); }}
                className="relative flex flex-col justify-between p-6 bg-white border border-gray-100 rounded-2xl hover:border-gray-200/80 transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-[#6300ff]/5 text-[#6300ff]">
                      <HiOutlineOfficeBuilding size={22} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                        ws.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : ws.status === 'SUSPENDED' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {ws.status === 'ACTIVE' ? <><HiOutlineCheckCircle size={12} /> Ativo</> : ws.status === 'SUSPENDED' ? <><HiOutlineMinusCircle size={12} /> Suspenso</> : <><HiOutlineMinusCircle size={12} /> Inativo</>}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setContextMenu({ x: e.clientX, y: e.clientY, workspace: ws }); }}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <HiOutlineDotsVertical size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-[#6300ff] transition-colors duration-200 truncate">{ws.name}</h3>
                    <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed min-h-[32px]">{ws.description || 'Sem descricao'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400">
                    <HiOutlineCalendar size={14} />
                    <span>{formatDate(ws.createdAt)}</span>
                  </div>
                  <button
                    onClick={() => navigate(`/workspace/${user?.id}/dashboard?workspaceId=${ws.id}`)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#6300ff] bg-[#6300ff]/5 rounded-lg hover:bg-[#6300ff] hover:text-white transition-all duration-200"
                  >
                    Acessar <HiOutlineArrowRight size={12} className="mt-0.5" />
                  </button>
                </div>
              </div>
            ))}

            {filteredWorkspaces.length === 0 && workspaces.length > 0 && (
              <div className="col-span-full py-12 text-center bg-white border border-gray-100 rounded-2xl">
                <HiOutlineSearch size={24} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">Nenhum workspace encontrado para "{searchTerm}"</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* CONTEXT MENU */}
      {contextMenu && (
        <div ref={contextMenuRef} className="fixed z-50 bg-white border border-gray-200/60 rounded-xl py-1.5 min-w-[180px] shadow-lg" style={{ top: contextMenu.y, left: contextMenu.x }}>
          <button onClick={() => navigate(`/workspace/${user?.id}/dashboard?workspaceId=${contextMenu.workspace.id}`)} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 transition-colors">
            <HiOutlineArrowRight size={13} /> Acessar
          </button>
          <button onClick={() => openEdit(contextMenu.workspace)} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 transition-colors">
            <HiOutlinePencil size={13} /> Editar
          </button>
          <button onClick={() => openMembers(contextMenu.workspace)} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 transition-colors">
            <HiOutlineUsers size={13} /> Gerenciar membros
          </button>
          <div className="border-t border-gray-100 my-1" />
          <button onClick={() => { setConfirmDelete(contextMenu.workspace); setContextMenu(null); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors">
            <HiOutlineTrash size={13} /> Excluir
          </button>
        </div>
      )}

      {/* MODALS */}
      {isCreateOpen && (
        <Modal title="Novo Workspace" subtitle="Crie um novo ambiente isolado no Zelt.ai" onClose={() => setIsCreateOpen(false)} onSubmit={handleCreate} name={name} setName={setName} description={description} setDescription={setDescription} loading={creating} />
      )}
      {isEditOpen && (
        <Modal title="Editar Workspace" subtitle="Altere as informacoes do workspace" onClose={() => { setIsEditOpen(null); setName(''); setDescription(''); }} onSubmit={handleEdit} name={name} setName={setName} description={description} setDescription={setDescription} loading={false} />
      )}
      {confirmDelete && (
        <ConfirmModal
          title="Excluir workspace"
          message={`Tem certeza que deseja excluir "${confirmDelete.name}"? Esta acao nao pode ser desfeita.`}
          confirmLabel="Excluir"
          danger
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      {isMembersOpen && (
        <MemberManagementModal workspace={isMembersOpen} token={token} onClose={() => setIsMembersOpen(null)} />
      )}
    </div>
  );
}

function Modal({ title, subtitle, onClose, onSubmit, name, setName, description, setDescription, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200/60 shadow-xl" onClick={e => e.stopPropagation()} style={{ animation: 'scaleMember 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 text-gray-400 hover:text-red-600 transition">
            <HiOutlineX size={16} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Nome do workspace</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Suporte, Vendas, Operacoes..." className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#6300ff]/40 focus:ring-2 focus:ring-[#6300ff]/10 transition" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Descricao <span className="text-gray-400 font-normal">(opcional)</span></label>
            <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Descreva o proposito deste workspace..." className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#6300ff]/40 focus:ring-2 focus:ring-[#6300ff]/10 transition resize-none" />
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancelar</button>
            <button type="submit" disabled={loading || !name.trim()} className="px-4 py-2 text-sm font-medium text-white bg-[#6300ff] hover:bg-[#5200d6] rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
