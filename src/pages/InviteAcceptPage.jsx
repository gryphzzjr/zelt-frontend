import React, { useState, useEffect } from 'react';
import {
  HiOutlineUser, HiOutlineEnvelope, HiOutlinePhone, HiOutlinePencil,
  HiOutlineShieldCheck, HiOutlineKey, HiOutlineDevicePhoneMobile,
  HiOutlineGlobeAlt, HiOutlineClock, HiOutlineBell, HiOutlineInbox,
  HiOutlineArrowRight, HiOutlineCheckCircle,
  HiOutlineExclamationTriangle, HiOutlineArrowRightOnRectangle,
  HiOutlineEye, HiOutlineEyeSlash,
  HiOutlineComputerDesktop,
} from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

const ROLE_LABELS = {
  OWNER: 'Proprietário',
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  AGENT: 'Atendente',
  VIEWER: 'Visualizador',
};

function parseDevice(device) {
  if (!device) return null;
  const parts = [];
  if (device.includes('Windows')) parts.push({ os: 'Windows', icon: 'desktop' });
  else if (device.includes('Mac')) parts.push({ os: 'macOS', icon: 'desktop' });
  else if (device.includes('Linux')) parts.push({ os: 'Linux', icon: 'desktop' });
  else if (device.includes('iPhone') || device.includes('iPad')) parts.push({ os: 'iOS', icon: 'mobile' });
  else if (device.includes('Android')) parts.push({ os: 'Android', icon: 'mobile' });

  const browserMatch = device.match(/(Chrome|Firefox|Safari|Edge|Opera|Brave)\/[\d.]+/);
  if (browserMatch) parts.push({ browser: browserMatch[1] });

  return parts.length > 0 ? parts : [{ raw: device }];
}

export default function InviteAcceptPage() {
  const { user, token, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState('profile');
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);
  const [accepted, setAccepted] = useState(null);

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.companyPhone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const fetchInvites = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/workspace/invites/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setInvites(data.invites || []);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { fetchInvites(); }, [token]);

  const handleAccept = async (invite) => {
    setAccepting(invite.inviteId);
    try {
      const res = await fetch(`${API_URL}/workspace/invite/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ token: invite.token })
      });
      const data = await res.json();
      if (data.success) {
        setAccepted(invite);
        toast.success(`Você agora faz parte de "${invite.workspace.name}"!`);
      } else {
        toast.error(data.message || 'Erro ao aceitar convite.');
        setAccepting(null);
      }
    } catch {
      toast.error('Erro ao aceitar convite.');
      setAccepting(null);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch(`${API_URL}/auth/set-account-type`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ accountType: 'EMPLOYEE' })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Perfil atualizado!');
        setEditingProfile(false);
      } else {
        toast.error(data.message || 'Erro ao salvar.');
      }
    } catch {
      toast.error('Erro ao salvar perfil.');
    }
    setSavingProfile(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Preencha todos os campos.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Senha alterada com sucesso!');
        setChangingPassword(false);
        setCurrentPassword('');
        setNewPassword('');
      } else {
        toast.error(data.message || 'Erro ao alterar senha.');
      }
    } catch {
      toast.error('Erro ao alterar senha. Tente novamente.');
    }
    setSavingPassword(false);
  };

  const lastLoginDate = user?.lastLoginAt ? new Date(user.lastLoginAt) : null;
  const lastLoginDateFormatted = lastLoginDate
    ? lastLoginDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null;
  const deviceInfo = parseDevice(user?.lastLoginDevice);

  // ---------- ACCEPTED SUCCESS ----------
  if (accepted) {
    return (
      <div className="min-h-screen w-full bg-[#fafafa] flex items-center justify-center p-4 font-sans antialiased">
        <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden border border-gray-200">
          <div className="px-8 pt-10 pb-8 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-5">
              <HiOutlineCheckCircle size={28} className="text-emerald-500" />
            </div>
            <h1 className="text-lg font-medium text-gray-900 mb-1.5">Bem-vindo ao time!</h1>
            <p className="text-sm text-gray-500 mb-7 leading-relaxed">
              Você agora faz parte do workspace{' '}
              <span className="font-medium text-gray-700">"{accepted.workspace.name}"</span>.
            </p>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                {accepted.workspace.logo ? (
                  <img src={accepted.workspace.logo} alt="" className="w-9 h-9 rounded-lg object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-[#6300ff]/10 flex items-center justify-center text-[#6300ff] font-semibold text-xs">
                    {accepted.workspace.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-gray-900 truncate">{accepted.workspace.name}</p>
                  <p className="text-[11px] text-gray-400">{ROLE_LABELS[accepted.role] || accepted.role}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate(`/workspace/${user?.id}/dashboard`)}
              className="w-full py-2.5 text-sm font-medium text-white bg-[#6300ff] hover:bg-[#5200d6] rounded-xl transition-colors"
            >
              Acessar workspace
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- MAIN PANEL ----------
  return (
    <div className="min-h-screen w-full bg-[#fafafa] font-sans antialiased">
      {/* Header */}
      <header className="sticky top-0 z-10 w-full h-14 bg-white border-b border-gray-200 px-6 md:px-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/icon.png" className="h-8 object-contain" alt="Zelt" />
          <div className="hidden md:block w-px h-5 bg-gray-200" />
          <span className="hidden md:block text-sm font-medium text-gray-900">Meu Perfil</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border border-gray-200 bg-white">
            <div className="w-7 h-7 rounded-full bg-[#6300ff] flex items-center justify-center text-white text-xs font-medium">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block leading-tight">
              <span className="text-xs font-medium text-gray-900 block">{user?.name || 'Usuario'}</span>
              <span className="text-[10px] text-gray-400 block">Funcionário</span>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Sair">
            <HiOutlineArrowRightOnRectangle size={16} />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 md:px-10 py-8 space-y-6">
        {/* Tabs */}
        <div className="flex items-center gap-0.5 bg-white rounded-xl border border-gray-200 p-0.5 w-fit">
          {[
            { key: 'profile', label: 'Perfil', icon: HiOutlineUser },
            { key: 'inbox', label: 'Inbox', icon: HiOutlineInbox, badge: invites.length },
            { key: 'security', label: 'Segurança', icon: HiOutlineShieldCheck },
          ].map(({ key, label, icon: Icon, badge }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                tab === key ? 'bg-[#6300ff]/8 text-[#6300ff]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon size={13} />
              {label}
              {badge > 0 && (
                <span className="ml-0.5 w-4 h-4 rounded-full bg-[#6300ff] text-white text-[9px] font-bold flex items-center justify-center">{badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* ========== PROFILE TAB ========== */}
        {tab === 'profile' && (
          <div className="space-y-5">
            {/* Avatar + Identity */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-sm font-semibold text-gray-900">Informações pessoais</h2>
                {!editingProfile && (
                  <button onClick={() => setEditingProfile(true)} className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[#6300ff] bg-[#6300ff]/5 rounded-md hover:bg-[#6300ff]/10 transition-colors">
                    <HiOutlinePencil size={11} /> Editar
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-[#6300ff] flex items-center justify-center text-white text-lg font-medium overflow-hidden border-2 border-white">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0)?.toUpperCase() || 'U'
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded border border-[#6300ff]/20 text-[#6300ff] font-medium bg-[#6300ff]/5">Funcionário</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Nome</label>
                  {editingProfile ? (
                    <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#6300ff]/40 transition-colors" />
                  ) : (
                    <p className="text-sm text-gray-700">{user?.name || '—'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">E-mail</label>
                  <p className="text-sm text-gray-700">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Telefone</label>
                  {editingProfile ? (
                    <input type="text" value={profilePhone} onChange={e => setProfilePhone(e.target.value)} placeholder="(00) 00000-0000"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#6300ff]/40 transition-colors" />
                  ) : (
                    <p className="text-sm text-gray-700">{user?.companyPhone || '—'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Tipo de conta</label>
                  <p className="text-sm text-gray-700">Funcionário</p>
                </div>
              </div>

              {editingProfile && (
                <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-100">
                  <button onClick={() => { setEditingProfile(false); setProfileName(user?.name || ''); setProfilePhone(user?.companyPhone || ''); }}
                    className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                    Cancelar
                  </button>
                  <button onClick={handleSaveProfile} disabled={savingProfile}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-[#6300ff] hover:bg-[#5200d6] rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5">
                    {savingProfile && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    Salvar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========== INBOX TAB ========== */}
        {tab === 'inbox' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Convites pendentes</h2>
              <p className="text-xs text-gray-400 mt-0.5">Convites de workspace enviados para o seu e-mail.</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-5 h-5 border-2 border-gray-200 border-t-[#6300ff] rounded-full animate-spin" />
              </div>
            ) : invites.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-3">
                  <HiOutlineBell size={20} className="text-gray-300" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Nenhum convite</h3>
                <p className="text-xs text-gray-400 max-w-[240px] mx-auto leading-relaxed">
                  Quando um administrador te convidar para um workspace, ele aparecerá aqui.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {invites.map(invite => (
                  <div key={invite.inviteId} className="bg-white border border-gray-200 rounded-2xl p-5 transition-colors hover:border-gray-300">
                    <div className="flex items-start gap-3.5 mb-3">
                      {invite.workspace.logo ? (
                        <img src={invite.workspace.logo} alt="" className="w-10 h-10 rounded-xl object-cover border border-gray-100" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-[#6300ff]/8 border border-[#6300ff]/10 flex items-center justify-center text-[#6300ff] font-semibold text-sm shrink-0">
                          {invite.workspace.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{invite.workspace.name}</p>
                        {invite.workspace.description && (
                          <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">{invite.workspace.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] px-1.5 py-0.5 rounded border border-[#6300ff]/20 text-[#6300ff] font-medium bg-[#6300ff]/5">
                            {ROLE_LABELS[invite.role] || invite.role}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            Expira em {new Date(invite.expiresAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-100">
                      <p className="text-[10px] text-gray-400 leading-relaxed">
                        Ao aceitar, você concorda em integrar-se ao workspace e seguir as políticas definidas pelo administrador.
                        Seus dados de perfil (nome, e-mail) serão compartilhados com os membros.
                      </p>
                    </div>

                    <button
                      onClick={() => handleAccept(invite)}
                      disabled={accepting !== null}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#6300ff] hover:bg-[#5200d6] rounded-lg transition-colors disabled:opacity-50"
                    >
                      {accepting === invite.inviteId ? (
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>Aceitar <HiOutlineArrowRight size={11} /></>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========== SECURITY TAB ========== */}
        {tab === 'security' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Segurança</h2>
              <p className="text-xs text-gray-400 mt-0.5">Gerencie sua senha e visualize a atividade da conta.</p>
            </div>

            {/* Last Login */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <HiOutlineClock size={14} className="text-gray-400" />
                <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Último acesso</h3>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                {deviceInfo && deviceInfo[0]?.icon === 'mobile' ? (
                  <HiOutlineDevicePhoneMobile size={18} className="text-gray-400 shrink-0" />
                ) : (
                  <HiOutlineComputerDesktop size={18} className="text-gray-400 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.lastLoginDevice || 'Dispositivo desconhecido'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {user?.lastLoginIp && (
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <HiOutlineGlobeAlt size={10} /> {user.lastLoginIp}
                      </span>
                    )}
                    {lastLoginDateFormatted && (
                      <span className="text-[11px] text-gray-400">
                        {lastLoginDateFormatted}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <HiOutlineKey size={14} className="text-gray-400" />
                  <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Senha</h3>
                </div>
                {!changingPassword && (
                  <button onClick={() => setChangingPassword(true)}
                    className="text-[11px] font-medium text-[#6300ff] hover:text-[#5200d6] transition-colors">
                    Alterar senha
                  </button>
                )}
              </div>

              {changingPassword ? (
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type={showCurrentPw ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="Senha atual"
                      className="w-full px-3 py-2 pr-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#6300ff]/40 transition-colors"
                    />
                    <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showCurrentPw ? <HiOutlineEyeSlash size={14} /> : <HiOutlineEye size={14} />}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Nova senha (mínimo 8 caracteres)"
                      className="w-full px-3 py-2 pr-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#6300ff]/40 transition-colors"
                    />
                    <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showNewPw ? <HiOutlineEyeSlash size={14} /> : <HiOutlineEye size={14} />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button onClick={() => { setChangingPassword(false); setCurrentPassword(''); setNewPassword(''); }}
                      className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                      Cancelar
                    </button>
                    <button onClick={handleChangePassword} disabled={savingPassword}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-[#6300ff] hover:bg-[#5200d6] rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5">
                      {savingPassword && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                      Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <HiOutlineKey size={14} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 font-medium">••••••••••••</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Última alteração desconhecida</p>
                  </div>
                </div>
              )}
            </div>

            {/* Security Alerts */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <HiOutlineExclamationTriangle size={14} className="text-gray-400" />
                <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Alertas de segurança</h3>
              </div>

              <div className="space-y-2">
                {/* Registration info */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                  <div className="w-7 h-7 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center mt-0.5 shrink-0">
                    <HiOutlineCheckCircle size={13} className="text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900">Conta criada</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Conta criada em {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'data desconhecida'}
                      {user?.country && ` de ${user.country}${user.state ? '/' + user.state : ''}`}
                    </p>
                  </div>
                </div>

                {/* Location */}
                {user?.country && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                    <div className="w-7 h-7 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center mt-0.5 shrink-0">
                      <HiOutlineGlobeAlt size={13} className="text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900">Localização</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {[user.city, user.state, user.country].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Email verified */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center mt-0.5 shrink-0 ${
                    user?.emailVerified ? 'bg-emerald-50 border border-emerald-100' : 'bg-amber-50 border border-amber-100'
                  }`}>
                    <HiOutlineEnvelope size={13} className={user?.emailVerified ? 'text-emerald-500' : 'text-amber-500'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900">E-mail verificado</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {user?.emailVerified ? 'Seu e-mail está verificado e confirmado.' : 'Seu e-mail ainda não foi verificado.'}
                    </p>
                  </div>
                </div>

                {/* Two-factor notice */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                  <div className="w-7 h-7 rounded-md bg-amber-50 border border-amber-100 flex items-center justify-center mt-0.5 shrink-0">
                    <HiOutlineShieldCheck size={13} className="text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900">Autenticação de dois fatores</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Adicione uma camada extra de segurança à sua conta com 2FA.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
