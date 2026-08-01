import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare, Plus, RefreshCw, QrCode, Wifi, WifiOff,
  Settings, Trash2, MoreHorizontal, X, Check, Copy,
  Send, Phone, PhoneOff, AlertTriangle, PowerOff, RotateCcw, Globe,
  Loader2, Eye, Pencil, User, Users, Shield, Hash, Calendar, Database,
  Camera, ArrowLeft, Save, BarChart3, Info, Bot,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { evolutionApi, onboardingApi, workspaceApi, geminiApi } from '../../lib/api';

const STATUS_MAP = {
  open: { label: 'Conectado', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-100 dark:border-emerald-500/30', dot: 'bg-emerald-500' },
  close: { label: 'Desconectado', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-100 dark:border-red-800/40', dot: 'bg-red-500' },
  connecting: { label: 'Conectando...', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-100 dark:border-amber-500/30', dot: 'bg-amber-500 animate-pulse' },
 qrcode: { label: 'Aguardando QR', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-100 dark:border-blue-500/30', dot: 'bg-blue-500 animate-pulse' },
};

export default function WhatsAppView() {
  const { workspace, selectWorkspaceById } = useAuth();
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(null);
  const [confirmDisconnect, setConfirmDisconnect] = useState(null);
  const [rowMenuOpen, setRowMenuOpen] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const [detailInstance, setDetailInstance] = useState(null);

  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setRowMenuOpen(null); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const fetchInstances = useCallback(async () => {
    try {
      setLoading(true);
      const res = await evolutionApi.listInstances(workspace?.id);
      const raw = Array.isArray(res) ? res
        : Array.isArray(res?.data) ? res.data
        : Array.isArray(res?.instances) ? res.instances
        : [];
      const data = raw.map(item => {
        const inst = item?.instance || item;
        return {
          instanceName: inst.instanceName || inst.name || item?.instanceName || item?.name || 'unknown',
          instanceId: inst.instanceId || inst.id || item?.instanceId || item?.id || '',
          status: inst.status || inst.connectionStatus?.state || inst.connectionStatus || item?.status || 'close',
          owner: inst.owner || inst.ownerJid || item?.owner || '',
          number: inst.number || item?.number || '',
          integration: inst.integration || item?.integration || 'BAILEYS',
          qrcode: inst.qrcode || item?.qrcode || null,
          token: inst.token || inst.apikey || item?.token || item?.apikey || '',
          profilePicUrl: inst.profilePicUrl || item?.profilePicUrl || '',
          profileName: inst.profileName || item?.profileName || '',
          setting: inst.Setting || inst.setting || item?.Setting || item?.setting || null,
          counts: inst._count || item?._count || { Message: 0, Contact: 0, Chat: 0 },
        };
      });
      setInstances(data);
    } catch (err) {
      console.error('Failed to fetch instances:', err);
      showToast('Erro ao carregar instancias', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, workspace?.id]);

  useEffect(() => { fetchInstances(); }, [fetchInstances]);

  const connectedCount = instances.filter(i => i.status === 'open').length;

  const handleCreateInstance = async (instanceName, webhookUrl) => {
    try {
      setActionLoading('create');
      const res = await evolutionApi.createInstance(instanceName, webhookUrl || undefined, workspace?.id);
      const generatedName = res?.generatedName || instanceName;
      if (workspace?.id) {
        await workspaceApi.update(workspace.id, { instanceName: generatedName, instanceDisplayName: instanceName });
        await selectWorkspaceById(null, workspace.id);
      }
      showToast('Instancia criada com sucesso');
      setShowCreateModal(false);
      await fetchInstances();
    } catch (err) {
      showToast(err.message || 'Erro ao criar instancia', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConnect = async (instanceName) => {
    try {
      setActionLoading(instanceName);
      const res = await evolutionApi.connectInstance(instanceName);
      const qrData = res?.data?.base64 || res?.base64 || res?.data?.qrcode?.base64 || null;
      setShowQRModal({ instanceName, qr: qrData });
      await fetchInstances();
    } catch (err) {
      showToast(err.message || 'Erro ao conectar', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = async (instanceName) => {
    try {
      setActionLoading(instanceName);
      await evolutionApi.logoutInstance(instanceName);
      showToast('Instancia desconectada');
      await fetchInstances();
    } catch (err) {
      showToast(err.message || 'Erro ao desconectar', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (instanceName) => {
    try {
      setActionLoading(instanceName);
      await evolutionApi.deleteInstance(instanceName);
      if (workspace?.id && workspace.instanceName === instanceName) {
        await workspaceApi.update(workspace.id, { instanceName: null });
        await selectWorkspaceById(null, workspace.id);
      }
      showToast('Instancia excluida');
      setConfirmDisconnect(null);
      await fetchInstances();
    } catch (err) {
      showToast(err.message || 'Erro ao excluir instancia', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatus = (instance) => {
    const st = instance.status || 'close';
    if (instance.qrcode && st !== 'open') return 'qrcode';
    return st;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300;1,9..40,400&display=swap');
        .whatsapp-view * { font-family: 'DM Sans', system-ui, sans-serif; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .fade-in { animation: fadeIn 0.15s ease-out; }
        .whatsapp-view select:focus, .whatsapp-view input:focus { outline: none; }
      `}</style>
      <div className="whatsapp-view space-y-5">
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm border fade-in ${
            toast.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 border-red-200 dark:border-red-500/40' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 border-emerald-200 dark:border-emerald-500/40'
          }`}>
            {toast.message}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-gray-900 dark:text-[#ededed]">WhatsApp</h1>
            <p className="text-sm text-gray-400 dark:text-[#666] mt-1">Gerencie suas instancias via Evolution API</p>
          </div>
          <div className="flex items-center gap-2.5">
            <button onClick={fetchInstances}
              className="flex items-center gap-2 px-3 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Atualizar
            </button>
            <button onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#25D366] text-white rounded-lg text-sm hover:bg-[#1fb855] transition-colors">
              <Plus size={16} /> Conectar Numero
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Instancias Totais', value: instances.length, color: 'text-gray-900 dark:text-[#ededed]', bg: 'bg-gray-50 dark:bg-[#111]', icon: Globe },
            { label: 'Conectadas', value: connectedCount, color: 'text-[#25D366]', bg: 'bg-[#25D366]/10', icon: Wifi },
            { label: 'Desconectadas', value: instances.length - connectedCount, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', icon: WifiOff },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                <stat.icon size={18} className={stat.color} />
              </div>
              <div>
                <p className={`text-xl ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-gray-400 dark:text-[#666]">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-sm text-gray-700 dark:text-[#ccc] mb-3">Instancias</h3>
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={20} className="text-gray-400 dark:text-[#666] animate-spin" />
                <span className="ml-2 text-sm text-gray-400 dark:text-[#666]">Carregando...</span>
              </div>
            ) : instances.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Globe size={40} className="text-gray-200 dark:text-[#444] mb-3" />
                <p className="text-sm text-gray-400 dark:text-[#666]">Nenhuma instancia encontrada</p>
                <p className="text-xs text-gray-300 dark:text-[#555] mt-1">Crie uma nova instancia para comecar</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-[#111] border-b border-gray-100 dark:border-white/[0.06]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider">Instancia</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider">Numero</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider">Canal</th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {instances.map((inst) => {
                    const statusKey = getStatus(inst);
                    const st = STATUS_MAP[statusKey] || STATUS_MAP.close;
                    const isLoading = actionLoading === inst.instanceName;
                    return (
                      <tr key={inst.instanceName || inst.instanceId}
                        className="hover:bg-gray-50/50 dark:hover:bg-[#1a1a1a]/50 transition-colors cursor-pointer"
                        onClick={() => { if (!rowMenuOpen) setDetailInstance(inst); }}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-[#25D366]/10 flex items-center justify-center">
                              <MessageSquare size={15} className="text-[#25D366]" />
                            </div>
                            <div>
                              <span className="text-sm text-gray-900 dark:text-[#ededed]">{workspace?.instanceDisplayName || inst.instanceName}</span>
                              <p className="text-xs text-gray-400 dark:text-[#666]">{inst.owner || '-'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-[#aaa]">{formatPhone(inst.owner) || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded border ${st.color} ${st.bg} ${st.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>
                            {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-[#808080] bg-gray-50 dark:bg-[#111] rounded">{inst.integration || 'BAILEYS'}</td>
                        <td className="px-4 py-3 relative" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => setRowMenuOpen(rowMenuOpen === inst.instanceName ? null : inst.instanceName)}
                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#1a1a1a] text-gray-400 dark:text-[#666] hover:text-gray-600 dark:hover:text-[#ccc] transition-colors"
                            disabled={isLoading}>
                            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <MoreHorizontal size={16} />}
                          </button>
                          {rowMenuOpen === inst.instanceName && (
                            <div ref={menuRef} className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg py-1.5 z-30 fade-in">
                              <button onClick={() => { setDetailInstance(inst); setRowMenuOpen(null); }}
                                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                                <Eye size={14} /> Visualizar
                              </button>
                              <button onClick={() => { setDetailInstance(inst); setRowMenuOpen(null); }}
                                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                                <Pencil size={14} /> Editar
                              </button>
                              <div className="border-t border-gray-100 dark:border-white/[0.06] my-1"></div>
                              {inst.status !== 'open' && (
                                <button onClick={() => { handleConnect(inst.instanceName); setRowMenuOpen(null); }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 dark:bg-emerald-900/20 transition-colors">
                                  <RotateCcw size={14} /> Conectar
                                </button>
                              )}
                              {inst.status === 'open' && (
                                <button onClick={() => { handleLogout(inst.instanceName); setRowMenuOpen(null); }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 dark:bg-amber-900/20 transition-colors">
                                  <PowerOff size={14} /> Desconectar
                                </button>
                              )}
                              <button onClick={() => { handleConnect(inst.instanceName); setRowMenuOpen(null); }}
                                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                                <QrCode size={14} /> Ver QR Code
                              </button>
                              <div className="border-t border-gray-100 dark:border-white/[0.06] my-1"></div>
                              <button onClick={() => { setConfirmDisconnect(inst); setRowMenuOpen(null); }}
                                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:bg-red-900/20 transition-colors">
                                <Trash2 size={14} /> Excluir Instancia
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {showCreateModal && (
          <CreateInstanceModal
            onClose={() => setShowCreateModal(false)}
            onConfirm={handleCreateInstance}
            loading={actionLoading === 'create'}
          />
        )}

        {showQRModal && (
          <QRCodeModal
            instanceName={showQRModal.instanceName}
            displayName={workspace?.instanceDisplayName || showQRModal.instanceName}
            qr={showQRModal.qr}
            onClose={() => setShowQRModal(null)}
            onRefresh={handleConnect}
            fetchInstances={fetchInstances}
            workspaceId={workspace?.id}
          />
        )}

        {confirmDisconnect && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 fade-in" onClick={() => setConfirmDisconnect(null)}>
            <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl w-[400px] p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center"><Trash2 size={18} className="text-red-500" /></div>
                <h3 className="text-base text-gray-900 dark:text-[#ededed]">Excluir instancia</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-[#808080] mb-5">
                Tem certeza que deseja excluir "{workspace?.instanceDisplayName || confirmDisconnect.instanceName}"? Esta acao e irreversivel.
              </p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setConfirmDisconnect(null)}
                  className="px-4 py-2 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                  Cancelar
                </button>
                <button onClick={() => handleDelete(confirmDisconnect.instanceName)}
                  disabled={actionLoading === confirmDisconnect.instanceName}
                  className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50">
                  {actionLoading === confirmDisconnect.instanceName ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
            </div>
          </div>
        )}

        {detailInstance && (
          <InstanceDetailModal
            instance={detailInstance}
            onClose={() => setDetailInstance(null)}
            onConnect={handleConnect}
            onLogout={handleLogout}
            onDelete={(name) => { setConfirmDisconnect(detailInstance); setDetailInstance(null); }}
            onRefresh={fetchInstances}
            actionLoading={actionLoading}
            showToast={showToast}
          />
        )}
      </div>
    </>
  );
}

function CreateInstanceModal({ onClose, onConfirm, loading }) {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) return;
    onConfirm(name.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl w-[480px] p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base text-gray-900 dark:text-[#ededed]">Nova Instancia</h3>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#1a1a1a] text-gray-400 dark:text-[#666] hover:text-gray-600 dark:hover:text-[#ccc] transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider block mb-1.5">Nome da instancia</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Ex: atendimento-principal"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#141414] text-gray-900 dark:text-[#ededed] placeholder-gray-400 dark:placeholder-[#555] focus:border-[var(--zelt-primary)]/40 transition-colors" />
            <p className="text-xs text-gray-400 dark:text-[#666] mt-1.5">Use apenas minusculos, numeros e hifens</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={!name.trim() || loading}
            className="px-4 py-2 text-sm bg-[#25D366] text-white rounded-lg hover:bg-[#1fb855] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? 'Criando...' : 'Criar Instancia'}
          </button>
        </div>
      </div>
    </div>
  );
}

function QRCodeModal({ instanceName, displayName, qr, onClose, onRefresh, fetchInstances, workspaceId }) {
  const [currentQR, setCurrentQR] = useState(qr);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const pollRef = useRef(null);

  const [activeMethod, setActiveMethod] = useState('qr');
  const [phoneInput, setPhoneInput] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  const [loadingPairing, setLoadingPairing] = useState(false);

  useEffect(() => {
    if (!instanceName) return;

    const pollStatus = async () => {
      try {
        const res = await evolutionApi.listInstances(workspaceId);
        const raw = Array.isArray(res) ? res
          : Array.isArray(res?.data) ? res.data
          : Array.isArray(res?.instances) ? res.instances
          : [];
        const data = raw.map(item => {
          const inst = item?.instance || item;
          return {
            instanceName: inst.instanceName || inst.name || item?.instanceName || item?.name || 'unknown',
            status: inst.status || inst.connectionStatus?.state || inst.connectionStatus || item?.status || 'close',
            qrcode: inst.qrcode || item?.qrcode || null,
          };
        });
        const inst = data.find(i => i.instanceName === instanceName);
        if (!inst) return;

        const status = inst.status || 'close';
        const newQR = inst.qrcode?.base64 || inst.qrcode || null;

        if (newQR && newQR !== currentQR) {
          setCurrentQR(newQR);
        }

        if (status === 'open') {
          clearInterval(pollRef.current);
          showToast('Instancia conectada com sucesso!');
          try { await onboardingApi.completeStep('whatsapp'); } catch {}
          await fetchInstances();
          setTimeout(onClose, 1500);
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    };

    pollRef.current = setInterval(pollStatus, 3000);
    return () => clearInterval(pollRef.current);
  }, [instanceName, onClose, fetchInstances]);

  const showToast = (msg) => {
    const el = document.createElement('div');
    el.className = 'fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm border bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 border-emerald-200 dark:border-emerald-500/40 fade-in';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh(instanceName);
    } catch (err) {}
    setRefreshing(false);
  };

  const handleRequestPairingCode = async () => {
    if (!phoneInput.trim()) return;
    setLoadingPairing(true);
    try {
      const res = await evolutionApi.connectInstance(instanceName, phoneInput.trim());
      const code = res?.data?.pairingCode || res?.pairingCode || res?.data?.code || res?.code || '';
      if (code) {
        setPairingCode(code);
      } else {
        showToast('Nao foi possível gerar o código', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Erro ao gerar código', 'error');
    } finally {
      setLoadingPairing(false);
    }
  };

  const handleCopyCode = () => {
    if (!pairingCode) return;
    navigator.clipboard.writeText(pairingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl w-[480px] p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base text-gray-900 dark:text-[#ededed]">Conectar - {displayName}</h3>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#1a1a1a] text-gray-400 dark:text-[#666] hover:text-gray-600 dark:hover:text-[#ccc] transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex border border-gray-200 dark:border-white/[0.06] rounded-lg overflow-hidden mb-5">
          <button onClick={() => setActiveMethod('qr')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm transition-colors ${activeMethod === 'qr' ? 'bg-[var(--zelt-primary)] text-white' : 'text-gray-500 dark:text-[#808080] hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'}`}>
            <QrCode size={15} /> QR Code
          </button>
          <button onClick={() => setActiveMethod('pairing')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm transition-colors ${activeMethod === 'pairing' ? 'bg-[var(--zelt-primary)] text-white' : 'text-gray-500 dark:text-[#808080] hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'}`}>
            <Phone size={15} /> Pareamento
          </button>
        </div>

        {activeMethod === 'qr' ? (
          <div className="text-center space-y-4">
            {currentQR ? (
              <>
                <div className="mx-auto bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-3 inline-block">
                  <img src={currentQR} alt="QR Code" className="w-56 h-56" />
                </div>
                <p className="text-sm text-gray-500 dark:text-[#808080]">Escaneie com o WhatsApp no seu celular</p>
                <p className="text-xs text-gray-400 dark:text-[#666]">{'WhatsApp > Aparelhos conectados > Conectar aparelho'}</p>
              </>
            ) : (
              <div className="py-12">
                <div className="w-12 h-12 border-2 border-[#25D366] border-t-transparent rounded-full mx-auto mb-3" style={{ animation: 'spin 1s linear infinite' }}></div>
                <p className="text-sm text-gray-500 dark:text-[#808080]">Aguardando QR Code...</p>
                <p className="text-xs text-gray-400 dark:text-[#666] mt-1">Pode levar alguns segundos</p>
              </div>
            )}

            <button onClick={handleRefresh} disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors disabled:opacity-50">
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> {refreshing ? 'Atualizando...' : 'Gerar novo QR'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {!pairingCode ? (
              <>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-[#aaa] mb-1.5">Número de telefone</label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value.replace(/[^0-9]/g, ''))}
                      onKeyDown={(e) => e.key === 'Enter' && handleRequestPairingCode()}
                      placeholder="5511999888777"
                      className="flex-1 px-3 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-[#ededed] placeholder-gray-300 dark:placeholder-[#555] outline-none focus:border-[var(--zelt-primary)] transition-colors"
                    />
                    <button onClick={handleRequestPairingCode} disabled={!phoneInput.trim() || loadingPairing}
                      className="px-4 py-2.5 text-sm bg-[var(--zelt-primary)] text-white rounded-lg hover:bg-[var(--zelt-primary-hover)] transition-colors disabled:opacity-50 whitespace-nowrap">
                      {loadingPairing ? <Loader2 size={14} className="animate-spin" /> : 'Gerar código'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-[#666] mt-1.5">Formato: código do país + DDD + número (ex: 5511999888777)</p>
                </div>
                <div className="bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-[#808080] text-center">
                    Digite o número do telefone que será conectado e clique em "Gerar código" para obter o código de pareamento de 8 dígitos.
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] rounded-xl p-6">
                  <p className="text-xs text-gray-400 dark:text-[#666] mb-2">Seu código de pareamento</p>
                  <p className="text-3xl font-mono font-semibold text-gray-900 dark:text-[#ededed] tracking-[0.3em]">{pairingCode}</p>
                </div>
                <p className="text-sm text-gray-500 dark:text-[#808080]">Abra o WhatsApp no celular</p>
                <p className="text-xs text-gray-400 dark:text-[#666]">{'Aparelhos conectados > Conectar aparelho > Conectar com número de telefone'}</p>
                <p className="text-xs text-gray-400 dark:text-[#666]">Digite o código de 8 dígitos acima no celular</p>

                <div className="flex gap-2 justify-center">
                  <button onClick={handleCopyCode}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    {copied ? 'Copiado!' : 'Copiar código'}
                  </button>
                  <button onClick={() => { setPairingCode(''); setPhoneInput(''); }}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                    <RefreshCw size={14} /> Gerar novo código
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InstanceDetailModal({ instance, onClose, onConnect, onLogout, onDelete, onRefresh, actionLoading, showToast }) {
  const { workspace } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [editingPic, setEditingPic] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const fileInputRef = useRef(null);

  const [settingsDraft, setSettingsDraft] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);

  const [aiAutoReply, setAiAutoReply] = useState(false);
  const [togglingAutoReply, setTogglingAutoReply] = useState(false);

  useEffect(() => {
    if (!workspace?.id) return;
    geminiApi.getAutoReply(workspace.id).then(res => {
      setAiAutoReply(res?.data?.aiAutoReply ?? false);
    }).catch(() => {});
  }, [workspace?.id]);

  const handleToggleAutoReply = async () => {
    if (!workspace?.id) return;
    const newState = !aiAutoReply;
    setTogglingAutoReply(true);
    try {
      await geminiApi.toggleAutoReply(workspace.id, newState);
      setAiAutoReply(newState);
      showToast(newState ? 'Auto-reply ativado' : 'Auto-reply desativado');
    } catch (err) {
      showToast(err.message || 'Erro ao alterar auto-reply', 'error');
    } finally {
      setTogglingAutoReply(false);
    }
  };

  const statusKey = instance?.status || 'close';
  const st = STATUS_MAP[statusKey] || STATUS_MAP.close;
  const maskedToken = instance?.token ? instance.token.substring(0, 6) + '****' : '****';

  const ownerJid = instance?.owner || '';
  const profilePic = instance?.profilePicUrl || '';
  const whatsName = instance?.profileName || '';
  const counts = instance?.counts || { Message: 0, Contact: 0, Chat: 0 };

  useEffect(() => {
    if (activeTab !== 'config') return;
    const s = instance?.setting || {};
    setSettingsDraft({
      rejectCall: s.rejectCall ?? false,
      groupsIgnore: s.groupsIgnore ?? false,
      alwaysOnline: s.alwaysOnline ?? false,
      readMessages: s.readMessages ?? false,
      syncFullHistory: s.syncFullHistory ?? false,
      readStatus: s.readStatus ?? false,
    });
  }, [activeTab, instance?.setting]);

  const handleUploadPic = async (file) => {
    if (!file) return;
    try {
      setUploadingPic(true);
      await evolutionApi.updateProfilePicture(instance.instanceName, file);
      showToast('Foto de perfil atualizada');
      setEditingPic(false);
      await onRefresh();
    } catch (err) {
      showToast(err.message || 'Erro ao atualizar foto', 'error');
    } finally {
      setUploadingPic(false);
    }
  };

  const handleToggleSetting = (key) => {
    if (!settingsDraft) return;
    setSettingsDraft((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const settingsOriginal = instance?.setting || {};
  const hasSettingsChanges = settingsDraft && (
    settingsOriginal.rejectCall !== settingsDraft.rejectCall ||
    settingsOriginal.groupsIgnore !== settingsDraft.groupsIgnore ||
    settingsOriginal.alwaysOnline !== settingsDraft.alwaysOnline ||
    settingsOriginal.readMessages !== settingsDraft.readMessages ||
    settingsOriginal.syncFullHistory !== settingsDraft.syncFullHistory ||
    settingsOriginal.readStatus !== settingsDraft.readStatus
  );
  const activeSettingsCount = settingsDraft ? Object.values(settingsDraft).filter(Boolean).length : 0;

  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      await evolutionApi.updateSettings(instance.instanceName, settingsDraft);
      showToast('Configuracoes salvas');
      await onRefresh();
    } catch (err) {
      showToast(err.message || 'Erro ao salvar', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleCancelSettings = () => {
    const s = instance?.setting || {};
    setSettingsDraft({
      rejectCall: s.rejectCall ?? false,
      groupsIgnore: s.groupsIgnore ?? false,
      alwaysOnline: s.alwaysOnline ?? false,
      readMessages: s.readMessages ?? false,
      syncFullHistory: s.syncFullHistory ?? false,
      readStatus: s.readStatus ?? false,
    });
  };

  const tabs = [
    { id: 'info', label: 'Informacoes', icon: Info },
    { id: 'config', label: 'Configuracoes', icon: Settings },
    { id: 'stats', label: 'Estatisticas', icon: BarChart3 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl w-[560px] max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#1a1a1a] text-gray-400 dark:text-[#666] hover:text-gray-600 dark:hover:text-[#ccc] transition-colors">
              <ArrowLeft size={16} />
            </button>
            <h3 className="text-sm text-gray-900 dark:text-[#ededed]">Detalhes da Instancia</h3>
          </div>
          <div className="flex items-center gap-2">
            {instance.status !== 'open' ? (
              <button onClick={() => onConnect(instance.instanceName)}
                disabled={actionLoading === instance.instanceName}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-white bg-[#25D366] hover:bg-[#1fb855] rounded-lg transition-colors disabled:opacity-40">
                {actionLoading === instance.instanceName ? <Loader2 size={11} className="animate-spin" /> : <Wifi size={11} />}
                Conectar
              </button>
            ) : (
              <button onClick={() => onLogout(instance.instanceName)}
                disabled={actionLoading === instance.instanceName}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/40 hover:bg-amber-100 rounded-lg transition-colors disabled:opacity-40">
                {actionLoading === instance.instanceName ? <Loader2 size={11} className="animate-spin" /> : <PowerOff size={11} />}
                Desconectar
              </button>
            )}
            <button onClick={() => onDelete(instance.instanceName)}
              className="p-1.5 rounded hover:bg-red-50 dark:bg-red-900/20 text-gray-400 dark:text-[#666] hover:text-red-500 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 px-5 py-5 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="relative group">
            <div className="w-16 h-16 rounded-full border-2 border-gray-100 dark:border-white/[0.06] overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-[#111] shrink-0">
              {profilePic ? (
                <img src={profilePic} alt="" className="w-full h-full object-cover" />
              ) : (
                <User size={28} className="text-gray-300 dark:text-[#555]" />
              )}
            </div>
            <button onClick={() => setEditingPic(!editingPic)}
              className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
              <Camera size={16} className="text-white" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) handleUploadPic(e.target.files[0]); }} />
            {editingPic && (
              <div className="absolute -bottom-1 -right-1 flex gap-1">
                <button onClick={() => fileInputRef.current?.click()} disabled={uploadingPic}
                  className="w-6 h-6 rounded-full bg-[var(--zelt-primary)] text-white flex items-center justify-center hover:bg-[var(--zelt-primary-hover)] transition-colors disabled:opacity-40 shadow">
                  {uploadingPic ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
                </button>
                <button onClick={() => setEditingPic(false)}
                  className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 dark:text-[#808080] flex items-center justify-center hover:bg-gray-300 transition-colors shadow">
                  <X size={10} />
                </button>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base text-gray-900 dark:text-[#ededed] truncate">{whatsName || workspace?.instanceDisplayName || instance.instanceName}</h4>
            <p className="text-[11px] text-gray-400 dark:text-[#666] mt-0.5">{formatPhone(ownerJid)}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded border ${st.color} ${st.bg} ${st.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>
                {st.label}
              </span>
              <span className="text-[11px] text-gray-400 dark:text-[#666]">{instance.integration || 'BAILEYS'}</span>
            </div>
          </div>
        </div>

        <div className="flex border-b border-gray-100 dark:border-white/[0.06] px-5">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[var(--zelt-primary)] text-[var(--zelt-primary)]'
                  : 'border-transparent text-gray-400 dark:text-[#666] hover:text-gray-600 dark:hover:text-[#ccc]'
              }`}>
              <tab.icon size={13} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {activeTab === 'info' && (
            <div className="space-y-1">
              <InfoRow icon={Phone} label="Numero" value={formatPhone(ownerJid)} />
              <InfoRow icon={User} label="Proprietario" value={instance.owner || '-'} />
              <InfoRow icon={Hash} label="ID da Instancia" value={instance.instanceId || '-'} copyable />
              <InfoRow icon={Shield} label="Token (API)" value={maskedToken} />
              <InfoRow icon={Database} label="Integracao" value={instance.integration || 'BAILEYS'} />
              <InfoRow icon={Globe} label="Status" value={st.label} />
            </div>
          )}

          {activeTab === 'config' && (
            <div>
              {settingsDraft ? (
                <>
                  <div className="mb-4">
                    <button onClick={handleToggleAutoReply} disabled={togglingAutoReply}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors text-left disabled:opacity-50 group border border-[var(--zelt-primary)]/20 bg-[var(--zelt-primary)]/5">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors" style={{ backgroundColor: aiAutoReply ? 'var(--zelt-primary)10' : 'rgb(243 244 246)' }}>
                        <Bot size={15} style={{ color: aiAutoReply ? 'var(--zelt-primary)' : '#9ca3af' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-gray-900 dark:text-[#ededed]">Auto-Reply IA (Gemini)</p>
                        <p className="text-[10px] text-gray-400 dark:text-[#666] mt-0.5">Responde automaticamente mensagens recebidas via WhatsApp usando IA</p>
                      </div>
                      {togglingAutoReply ? (
                        <Loader2 size={18} className="animate-spin text-[var(--zelt-primary)]" />
                      ) : (
                        <div className={`w-9 h-5 rounded-full relative transition-colors shrink-0 ${aiAutoReply ? 'bg-[var(--zelt-primary)]' : 'bg-gray-200'}`}>
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white dark:bg-[#141414] shadow transition-transform ${aiAutoReply ? 'left-[18px]' : 'left-0.5'}`} />
                        </div>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between mb-3 px-1">
                    <p className="text-[11px] text-gray-400 dark:text-[#666]">
                      {activeSettingsCount} de 6 opcoes selecionadas
                    </p>
                    {hasSettingsChanges && (
                      <p className="text-[11px] text-[var(--zelt-primary)]">Alteracoes pendentes</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <SettingToggle
                      icon={PhoneOff}
                      label="Rejeitar Chamadas"
                      desc="Rejeitar chamadas automaticamente"
                      value={settingsDraft.rejectCall}
                      onChange={() => handleToggleSetting('rejectCall')}
                      disabled={savingSettings}
                    />
                    <SettingToggle
                      icon={Users}
                      label="Ignorar Grupos"
                      desc="Ignorar mensagens de grupos"
                      value={settingsDraft.groupsIgnore}
                      onChange={() => handleToggleSetting('groupsIgnore')}
                      disabled={savingSettings}
                    />
                    <SettingToggle
                      icon={Wifi}
                      label="Sempre On-Line"
                      desc="Manter status online sempre ativo"
                      value={settingsDraft.alwaysOnline}
                      onChange={() => handleToggleSetting('alwaysOnline')}
                      disabled={savingSettings}
                    />
                    <SettingToggle
                      icon={Check}
                      label="Ler Todas as Mensagens"
                      desc="Marcar mensagens recebidas como lidas"
                      value={settingsDraft.readMessages}
                      onChange={() => handleToggleSetting('readMessages')}
                      disabled={savingSettings}
                    />
                    <SettingToggle
                      icon={RefreshCw}
                      label="Sincronizar Todo o Chat"
                      desc="Baixar historico completo ao conectar"
                      value={settingsDraft.syncFullHistory}
                      onChange={() => handleToggleSetting('syncFullHistory')}
                      disabled={savingSettings}
                    />
                    <SettingToggle
                      icon={Eye}
                      label="Ler Status (Stories)"
                      desc="Marcar todos os status como lidos"
                      value={settingsDraft.readStatus}
                      onChange={() => handleToggleSetting('readStatus')}
                      disabled={savingSettings}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-white/[0.06]">
                    <button onClick={handleCancelSettings}
                      disabled={!hasSettingsChanges || savingSettings}
                      className="px-4 py-2 text-[11px] border border-gray-200 dark:border-white/[0.06] rounded-lg text-gray-500 dark:text-[#808080] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                      Cancelar
                    </button>
                    <button onClick={handleSaveSettings}
                      disabled={!hasSettingsChanges || savingSettings}
                      className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-medium text-white bg-[var(--zelt-primary)] hover:bg-[var(--zelt-primary-hover)] rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                      {savingSettings ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
                      Salvar
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {activeTab === 'stats' && (
            <div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Mensagens', value: counts.Message || 0, icon: Send, color: '#25D366', bg: '#25D36610' },
                  { label: 'Contatos', value: counts.Contact || 0, icon: Users, color: '#0EA5E9', bg: '#0EA5E910' },
                  { label: 'Chats', value: counts.Chat || 0, icon: MessageSquare, color: 'var(--zelt-primary)', bg: 'var(--zelt-primary)10' },
                ].map((stat) => (
                  <div key={stat.label} className="border border-gray-200 dark:border-white/[0.06] rounded-xl p-4 text-center">
                    <div className="w-10 h-10 rounded-xl mx-auto mb-2.5 flex items-center justify-center" style={{ backgroundColor: stat.bg }}>
                      <stat.icon size={18} style={{ color: stat.color }} />
                    </div>
                    <p className="text-xl text-gray-900 dark:text-[#ededed]">{stat.value.toLocaleString('pt-BR')}</p>
                    <p className="text-[11px] text-gray-400 dark:text-[#666] mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatPhone(raw) {
  if (!raw) return 'Nao conectado';
  const digits = raw.replace(/@.*/, '').replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length >= 12) {
    const ddd = digits.substring(2, 4);
    const num = digits.substring(4);
    if (num.length === 9) return `(${ddd}) ${num.substring(0, 5)}-${num.substring(5)}`;
    if (num.length === 8) return `(${ddd}) ${num.substring(0, 4)}-${num.substring(4)}`;
  }
  return raw;
}

function SettingToggle({ icon: Icon, label, desc, value, onChange, disabled }) {
  return (
    <button onClick={onChange} disabled={disabled}
      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors text-left disabled:opacity-50 group">
      <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-[#111] flex items-center justify-center shrink-0 group-hover:bg-[var(--zelt-primary)]/5 transition-colors">
        <Icon size={15} className="text-gray-400 dark:text-[#666]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-gray-900 dark:text-[#ededed]">{label}</p>
        <p className="text-[10px] text-gray-400 dark:text-[#666] mt-0.5">{desc}</p>
      </div>
      <div className={`w-9 h-5 rounded-full relative transition-colors shrink-0 ${value ? 'bg-[var(--zelt-primary)]' : 'bg-gray-200'}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white dark:bg-[#141414] shadow transition-transform ${value ? 'left-[18px]' : 'left-0.5'}`} />
      </div>
    </button>
  );
}

function InfoRow({ icon: Icon, label, value, copyable = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!copyable || !value || value === '-') return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors group">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-[#111] flex items-center justify-center shrink-0">
          <Icon size={14} className="text-gray-400 dark:text-[#666]" />
        </div>
        <div>
          <p className="text-[11px] text-gray-400 dark:text-[#666] uppercase tracking-wider">{label}</p>
          <p className="text-[12px] text-gray-900 dark:text-[#ededed] mt-0.5 font-mono">{value}</p>
        </div>
      </div>
      {copyable && value && value !== '-' && (
        <button onClick={handleCopy}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#1a1a1a] text-gray-400 dark:text-[#666] hover:text-gray-600 dark:hover:text-[#ccc] transition-colors opacity-0 group-hover:opacity-100">
          {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
        </button>
      )}
    </div>
  );
}
