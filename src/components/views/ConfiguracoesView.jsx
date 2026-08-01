import { useState, useRef, useEffect } from 'react';
import { onboardingApi } from '../../lib/api';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Settings, Building2, Briefcase, User, Palette, Bell, Shield,
  CreditCard, ScrollText, Save, Upload, Trash2, Eye, EyeOff,
  LogOut, Check, X, AlertTriangle, Clock, Globe,
  ChevronRight, Lock, Key, Smartphone, Search, Filter,
  Download, ExternalLink, RefreshCw, Info, ToggleLeft, ToggleRight,
  Camera, FileText, DollarSign, Calendar, Users, MessageSquare,
  Zap, Database, Mail, Package,
} from 'lucide-react';

const TABS = [
  { id: 'geral',        label: 'Geral',          icon: Settings },
  { id: 'workspace',    label: 'Workspace',      icon: Briefcase },
  { id: 'perfil',       label: 'Perfil',         icon: User },
  { id: 'aparencia',    label: 'Aparencia',       icon: Palette },
  { id: 'notificacoes', label: 'Notificacoes',    icon: Bell },
  { id: 'seguranca',    label: 'Seguranca',       icon: Shield },
  { id: 'cobranca',     label: 'Cobranca',        icon: CreditCard },
  { id: 'logs',         label: 'Logs do Sistema', icon: ScrollText },
];

const MOCK_LOGS = [
  { id: 1, user: 'Lucas Silva', action: 'Entrou no sistema', timestamp: '16/07/2026 14:32', icon: LogOut, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 2, user: 'Lucas Silva', action: 'Adicionou membro Maria Oliveira', timestamp: '16/07/2026 13:15', icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 3, user: 'Sistema', action: 'Integracao WhatsApp reconectada', timestamp: '16/07/2026 12:48', icon: Zap, color: 'text-[#25D366]', bg: 'bg-[#25D366]/10' },
  { id: 4, user: 'Lucas Silva', action: 'Atualizou Base de Conhecimento', timestamp: '16/07/2026 11:30', icon: Database, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 5, user: 'Lucas Silva', action: 'Alterou prompt de atendimento', timestamp: '16/07/2026 10:05', icon: FileText, color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 6, user: 'Sistema', action: 'Integracao Google Sheets sincronizada', timestamp: '15/07/2026 18:30', icon: RefreshCw, color: 'text-[#0F9D58]', bg: 'bg-[#0F9D58]/10' },
  { id: 7, user: 'Lucas Silva', action: 'Removeu membro Pedro Costa', timestamp: '15/07/2026 16:20', icon: Trash2, color: 'text-red-500', bg: 'bg-red-50' },
  { id: 8, user: 'Sistema', action: 'Backup automático realizado', timestamp: '15/07/2026 03:00', icon: Shield, color: 'text-gray-400', bg: 'bg-gray-50' },
  { id: 9, user: 'Lucas Silva', action: 'Criou novo cargo Gerente de Vendas', timestamp: '14/07/2026 09:45', icon: Briefcase, color: 'text-[var(--zelt-primary)]', bg: 'bg-[var(--zelt-primary)]/10' },
  { id: 10, user: 'Lucas Silva', action: 'Configurou webhook Mercado Pago', timestamp: '14/07/2026 08:10', icon: CreditCard, color: 'text-[#009EE3]', bg: 'bg-[#009EE3]/10' },
];

const MOCK_SESSIONS = [
  { id: 1, device: 'Chrome no Windows', ip: '189.45.23.102', location: 'Recife, PE', lastActive: 'Agora', current: true },
  { id: 2, device: 'Safari no iPhone', ip: '189.45.23.102', location: 'Recife, PE', lastActive: '2h atras', current: false },
];

const MOCK_PAYMENTS = [
  { id: 1, date: '01/07/2026', amount: 'R$ 149,90', status: 'Pago', plan: 'Pro' },
  { id: 2, date: '01/06/2026', amount: 'R$ 149,90', status: 'Pago', plan: 'Pro' },
  { id: 3, date: '01/05/2026', amount: 'R$ 99,90', status: 'Pago', plan: 'Basico' },
];

export default function ConfiguracoesView() {
  const [activeTab, setActiveTab] = useState('geral');

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300;1,9..40,400&display=swap');
        .config-view * { font-family: 'DM Sans', system-ui, sans-serif; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .config-fade { animation: fadeIn 0.2s ease-out; }
      `}</style>
      <div className="config-view">
        <div className="flex gap-6 min-h-[calc(100vh-120px)]">

          <div className="w-56 shrink-0">
            <h1 className="text-2xl text-gray-900 dark:text-[#ededed] mb-1">Configuracoes</h1>
            <p className="text-xs text-gray-400 dark:text-[#666] mb-5">Gerencie preferencias da plataforma</p>
            <nav className="space-y-0.5">
              {TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${activeTab === tab.id ? 'bg-[var(--zelt-primary)]/5 text-[var(--zelt-primary)]' : 'text-gray-500 dark:text-[#808080] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] hover:text-gray-700 dark:hover:text-[#ccc]'}`}>
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex-1 min-w-0 config-fade" key={activeTab}>
            {activeTab === 'geral' && <GeralTab />}
            {activeTab === 'workspace' && <WorkspaceTab />}
            {activeTab === 'perfil' && <PerfilTab />}
            {activeTab === 'aparencia' && <AparenciaTab />}
            {activeTab === 'notificacoes' && <NotificacoesTab />}
            {activeTab === 'seguranca' && <SegurancaTab />}
            {activeTab === 'cobranca' && <CobrancaTab />}
            {activeTab === 'logs' && <LogsTab />}
          </div>

        </div>
      </div>
    </>
  );
}

function Section({ title, description, children, footer }) {
  return (
    <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-6">
      <div className="mb-5">
        <h3 className="text-base text-gray-900 dark:text-[#ededed]">{title}</h3>
        {description && <p className="text-sm text-gray-400 dark:text-[#808080] mt-1">{description}</p>}
      </div>
      {children}
      {footer && <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-white/[0.06]">{footer}</div>}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs text-gray-400 dark:text-[#808080] uppercase tracking-wider block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text', readOnly, ...props }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
      className={`w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-[#ededed] placeholder-gray-400 dark:placeholder-[#555] focus:border-[var(--zelt-primary)]/40 transition-colors ${readOnly ? 'bg-gray-50 dark:bg-[#111] text-gray-500 dark:text-[#666]' : ''}`} {...props} />
  );
}

function Select({ value, onChange, children }) {
  return (
    <select value={value} onChange={onChange}
      className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#1a1a1a] text-gray-600 dark:text-[#ccc] focus:border-[var(--zelt-primary)]/40 transition-colors">
      {children}
    </select>
  );
}

function Toggle({ enabled, onChange, label, description }) {
  return (
    <label className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-white/[0.06] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors cursor-pointer">
      <div>
        <p className="text-sm text-gray-700 dark:text-[#ddd]">{label}</p>
        {description && <p className="text-xs text-gray-400 dark:text-[#666] mt-0.5">{description}</p>}
      </div>
      <button type="button" onClick={() => onChange(!enabled)}>
        {enabled ? <ToggleRight size={26} className="text-[var(--zelt-primary)]" /> : <ToggleLeft size={26} className="text-gray-300 dark:text-[#555]" />}
      </button>
    </label>
  );
}

function SaveButton({ onClick, saving }) {
  return (
    <button onClick={onClick} disabled={saving}
      className="flex items-center gap-2 px-5 py-2.5 bg-[var(--zelt-primary)] text-white text-sm rounded-lg hover:opacity-90 transition-colors disabled:opacity-50">
      {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
      {saving ? 'Salvando...' : 'Salvar Alteracoes'}
    </button>
  );
}

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg border text-sm config-fade ${type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 text-red-600 dark:text-red-400'}`}>
      {type === 'success' ? <Check size={15} /> : <AlertTriangle size={15} />}
      {message}
    </div>
  );
}

function ConfirmModal({ title, message, onConfirm, onCancel, danger }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/[0.06] rounded-xl w-[420px] p-6 config-fade" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${danger ? 'bg-red-50 dark:bg-red-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
            <AlertTriangle size={18} className={danger ? 'text-red-500' : 'text-amber-500'} />
          </div>
          <h3 className="text-base text-gray-900 dark:text-[#ededed]">{title}</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-[#808080] mb-5">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg text-gray-600 dark:text-[#ccc] hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">Cancelar</button>
          <button onClick={onConfirm} className={`px-4 py-2 text-sm text-white rounded-lg transition-colors ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-[var(--zelt-primary)] hover:opacity-90'}`}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}

function GeralTab() {
  const [form, setForm] = useState({ empresa: 'Zelt.AI', workspace: 'Workspace Principal', fusoHorario: 'America/Sao_Paulo', idioma: 'pt-BR', formatoData: 'DD/MM/YYYY', formatoHora: '24h' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [logo, setLogo] = useState(null);
  const logoRef = useRef(null);

  const handleSave = () => { setSaving(true); setTimeout(() => { setSaving(false); setToast('Configuracoes salvas com sucesso'); }, 1200); };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg text-gray-900 dark:text-[#ededed]">Geral</h2>
        <p className="text-sm text-gray-400 dark:text-[#666] mt-0.5">Configuracoes gerais do workspace</p>
      </div>

      <Section title="Dados da Empresa" description="Informacoes basicas da organizacao">
        <div className="space-y-4">
          <Field label="Nome da Empresa">
            <Input value={form.empresa} onChange={(e) => setForm(p => ({ ...p, empresa: e.target.value }))} placeholder="Nome da empresa" />
          </Field>
          <Field label="Nome do Workspace">
            <Input value={form.workspace} onChange={(e) => setForm(p => ({ ...p, workspace: e.target.value }))} placeholder="Nome do workspace" />
          </Field>
          <Field label="Logotipo da Empresa">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl border border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-[#1a1a1a] flex items-center justify-center overflow-hidden shrink-0">
                {logo ? <img src={logo} alt="Logo" className="w-full h-full object-cover" /> : <Building2 size={24} className="text-gray-300 dark:text-[#555]" />}
              </div>
              <div className="flex items-center gap-2">
                <input type="file" ref={logoRef} accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => setLogo(ev.target.result); r.readAsDataURL(f); } }} className="hidden" />
                <button onClick={() => logoRef.current?.click()} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg text-gray-600 dark:text-[#ccc] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                  <Upload size={14} /> Enviar logo
                </button>
                {logo && (
                  <button onClick={() => setLogo(null)} className="flex items-center gap-2 px-3 py-2 text-sm border border-red-200 dark:border-red-800/40 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors my-3">
                    <Trash2 size={14} /> Remover
                  </button>
                )}
              </div>
            </div>
          </Field>
        </div>
        {<SaveButton onClick={handleSave} saving={saving} />}
      </Section>

      <Section title="Localizacao e Idioma">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Fuso Horario">
            <Select value={form.fusoHorario} onChange={(e) => setForm(p => ({ ...p, fusoHorario: e.target.value }))}>
              <option value="America/Sao_Paulo">America/Sao_Paulo (GMT-3)</option>
              <option value="America/Manaus">America/Manaus (GMT-4)</option>
              <option value="America/Belem">America/Belem (GMT-3)</option>
              <option value="America/Fortaleza">America/Fortaleza (GMT-3)</option>
            </Select>
          </Field>
          <Field label="Idioma">
            <Select value={form.idioma} onChange={(e) => setForm(p => ({ ...p, idioma: e.target.value }))}>
              <option value="pt-BR">Portugues (Brasil)</option>
              <option value="en-US">English (US)</option>
              <option value="es">Espanol</option>
            </Select>
          </Field>
          <Field label="Formato de Data">
            <Select value={form.formatoData} onChange={(e) => setForm(p => ({ ...p, formatoData: e.target.value }))}>
              <option value="DD/MM/YYYY">DD/MM/AAAA</option>
              <option value="MM/DD/YYYY">MM/DD/AAAA</option>
              <option value="YYYY-MM-DD">AAAA-MM-DD</option>
            </Select>
          </Field>
          <Field label="Formato de Hora">
            <Select value={form.formatoHora} onChange={(e) => setForm(p => ({ ...p, formatoHora: e.target.value }))}>
              <option value="24h">24 horas (14:30)</option>
              <option value="12h">12 horas (2:30 PM)</option>
            </Select>
          </Field>
        </div>
        {<SaveButton onClick={handleSave} saving={saving} />}
      </Section>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

function WorkspaceTab() {
  const [form, setForm] = useState({ nome: 'Workspace Principal', identificador: 'ws_lucas_zelt_01' });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSave = () => { setSaving(true); setTimeout(async () => { setSaving(false); setToast('Workspace atualizado'); try { await onboardingApi.completeStep('settings'); } catch {} }, 1000); };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg text-gray-900 dark:text-[#ededed]">Workspace</h2>
        <p className="text-sm text-gray-400 dark:text-[#666] mt-0.5">Informacoes e configuracoes do workspace</p>
      </div>

      <Section title="Informacoes do Workspace" description="Dados gerais e identificacao">
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="p-3 rounded-lg border border-gray-100 dark:border-white/[0.06]">
            <p className="text-xs text-gray-400 dark:text-[#666]">Nome</p>
            <p className="text-sm text-gray-700 dark:text-[#ccc] mt-0.5">{form.nome}</p>
          </div>
          <div className="p-3 rounded-lg border border-gray-100 dark:border-white/[0.06]">
            <p className="text-xs text-gray-400 dark:text-[#666]">Identificador</p>
            <code className="text-sm text-gray-700 dark:text-[#ccc] mt-0.5 block font-mono">{form.identificador}</code>
          </div>
          <div className="p-3 rounded-lg border border-gray-100 dark:border-white/[0.06]">
            <p className="text-xs text-gray-400 dark:text-[#666]">Criado em</p>
            <p className="text-sm text-gray-700 dark:text-[#ccc] mt-0.5">10/07/2026</p>
          </div>
          <div className="p-3 rounded-lg border border-gray-100 dark:border-white/[0.06]">
            <p className="text-xs text-gray-400 dark:text-[#666]">Plano atual</p>
            <p className="text-sm text-[var(--zelt-primary)] mt-0.5">Pro</p>
          </div>
          <div className="p-3 rounded-lg border border-gray-100 dark:border-white/[0.06]">
            <p className="text-xs text-gray-400 dark:text-[#666]">Membros</p>
            <p className="text-sm text-gray-700 dark:text-[#ccc] mt-0.5">4</p>
          </div>
          <div className="p-3 rounded-lg border border-gray-100 dark:border-white/[0.06]">
            <p className="text-xs text-gray-400 dark:text-[#666]">Clientes</p>
            <p className="text-sm text-gray-700 dark:text-[#ccc] mt-0.5">127</p>
          </div>
        </div>
        {<SaveButton onClick={handleSave} saving={saving} />}
      </Section>

      <Section title="Editar Workspace">
        <div className="space-y-4">
          <Field label="Nome do Workspace">
            <Input value={form.nome} onChange={(e) => setForm(p => ({ ...p, nome: e.target.value }))} />
          </Field>
          <Field label="Logotipo">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl border border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-[#1a1a1a] flex items-center justify-center">
                <Briefcase size={20} className="text-gray-300 dark:text-[#555]" />
              </div>
              <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg text-gray-600 dark:text-[#ccc] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                <Upload size={14} /> Alterar logotipo
              </button>
            </div>
          </Field>
        </div>
        {<SaveButton onClick={handleSave} saving={saving} />}
      </Section>

      <div className="bg-white dark:bg-[#141414] border border-red-200 dark:border-red-800/40 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base text-red-600 dark:text-red-400">Zona de perigo</h3>
            <p className="text-sm text-gray-400 dark:text-[#666] mt-0.5">Acoes irreversiveis do workspace</p>
          </div>
          <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-2 px-4 py-2 text-sm border border-red-200 dark:border-red-800/40 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
            <Trash2 size={14} /> Excluir Workspace
          </button>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmModal title="Excluir Workspace" danger
          message="Tem certeza que deseja excluir este Workspace? Todos os dados, membros e configuracoes serao perdidos permanentemente. Esta acao nao pode ser desfeita."
          onConfirm={() => { setConfirmDelete(false); setToast('Workspace excluido'); }} onCancel={() => setConfirmDelete(false)} />
      )}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

function PerfilTab() {
  const [form, setForm] = useState({ nome: 'Lucas Silva', email: 'lucas@zelt.ai', telefone: '(81) 99999-1111', cargo: 'Administrador', idioma: 'pt-BR' });
  const [avatar, setAvatar] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const fileRef = useRef(null);

  const handleSave = () => { setSaving(true); setTimeout(() => { setSaving(false); setToast('Perfil atualizado'); }, 1000); };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg text-gray-900 dark:text-[#ededed]">Perfil</h2>
        <p className="text-sm text-gray-400 dark:text-[#666] mt-0.5">Gerencie seus dados pessoais</p>
      </div>

      <Section title="Foto de Perfil">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/[0.06] flex items-center justify-center overflow-hidden shrink-0">
            {avatar ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover" /> : <User size={32} className="text-gray-300 dark:text-[#555]" />}
          </div>
          <div className="flex items-center gap-2">
            <input type="file" ref={fileRef} accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => setAvatar(ev.target.result); r.readAsDataURL(f); } }} className="hidden" />
            <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg text-gray-600 dark:text-[#ccc] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
              <Camera size={14} /> Alterar foto
            </button>
            {avatar && (
              <button onClick={() => setAvatar(null)} className="flex items-center gap-2 px-4 py-2 text-sm border border-red-200 dark:border-red-800/40 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                <Trash2 size={14} /> Remover
              </button>
            )}
          </div>
        </div>
      </Section>

      <Section title="Dados Pessoais" footer={<SaveButton onClick={handleSave} saving={saving} />}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nome completo">
            <Input value={form.nome} onChange={(e) => setForm(p => ({ ...p, nome: e.target.value }))} />
          </Field>
          <Field label="E-mail">
            <Input value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} type="email" />
          </Field>
          <Field label="Telefone">
            <Input value={form.telefone} onChange={(e) => setForm(p => ({ ...p, telefone: e.target.value }))} />
          </Field>
          <Field label="Cargo">
            <Input value={form.cargo} readOnly />
          </Field>
          <Field label="Idioma">
            <Select value={form.idioma} onChange={(e) => setForm(p => ({ ...p, idioma: e.target.value }))}>
              <option value="pt-BR">Portugues (Brasil)</option>
              <option value="en-US">English (US)</option>
              <option value="es">Espanol</option>
            </Select>
          </Field>
        </div>
      </Section>

      <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base text-gray-900 dark:text-[#ededed]">Senha</h3>
            <p className="text-sm text-gray-400 dark:text-[#666] mt-0.5">Ultima alteracao: 10/07/2026</p>
          </div>
          <button onClick={() => setShowChangePassword(true)} className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg text-gray-600 dark:text-[#ccc] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
            <Key size={14} /> Alterar senha
          </button>
        </div>
      </div>

      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} onDone={() => { setShowChangePassword(false); setToast('Senha alterada com sucesso'); }} />}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

function ChangePasswordModal({ onClose, onDone }) {
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
  const [show, setShow] = useState({ current: false, newPass: false, confirm: false });
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!form.current || !form.newPass || !form.confirm) { setError('Preencha todos os campos'); return; }
    if (form.newPass.length < 8) { setError('A nova senha deve ter no minimo 8 caracteres'); return; }
    if (form.newPass !== form.confirm) { setError('As senhas nao coincidem'); return; }
    onDone();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/[0.06] rounded-xl w-[440px] p-6 config-fade" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base text-gray-900 dark:text-[#ededed]">Alterar senha</h3>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#222] text-gray-400 hover:text-gray-600 dark:hover:text-[#ccc] transition-colors"><X size={16} /></button>
        </div>
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/40 text-sm text-red-600 dark:text-red-400 mb-4">
            <AlertTriangle size={14} /> {error}
          </div>
        )}
        <div className="space-y-4">
          {[
            { key: 'current', label: 'Senha atual' },
            { key: 'newPass', label: 'Nova senha' },
            { key: 'confirm', label: 'Confirmar nova senha' },
          ].map(f => (
            <Field key={f.key} label={f.label}>
              <div className="relative">
                <input type={show[f.key] ? 'text' : 'password'} value={form[f.key]} onChange={(e) => { setForm(p => ({ ...p, [f.key]: e.target.value })); setError(''); }}
                  className="w-full px-4 py-2.5 pr-10 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-[#ededed] placeholder-gray-400 focus:border-[var(--zelt-primary)]/40 transition-colors" />
                <button type="button" onClick={() => setShow(p => ({ ...p, [f.key]: !p[f.key] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show[f.key] ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg text-gray-600 dark:text-[#ccc] hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">Cancelar</button>
          <button onClick={handleSubmit} className="px-4 py-2 text-sm bg-[var(--zelt-primary)] text-white rounded-lg hover:opacity-90 transition-colors">Alterar senha</button>
        </div>
      </div>
    </div>
  );
}

function AparenciaTab() {
  const { primaryColor, setPrimaryColor } = useTheme();
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const COLORS = ['var(--zelt-primary)', '#2563EB', '#0F9D58', '#EA4335', '#FF8C00', '#E91E63', '#009EE3', '#635BFF'];

  const handleSave = () => { setSaving(true); setTimeout(() => { setSaving(false); setToast('Aparencia atualizada'); }, 1000); };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg text-gray-900">Aparencia</h2>
        <p className="text-sm text-gray-400 mt-0.5">Personalize a cor da interface</p>
      </div>

      <Section title="Cor Principal" description="Selecione a cor predominante da interface">
        <div className="flex items-center gap-3">
          {COLORS.map(c => (
            <button key={c} onClick={() => setPrimaryColor(c)}
              className={`w-10 h-10 rounded-xl transition-all ${primaryColor === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'}`}
              style={{ backgroundColor: c }}>
              {primaryColor === c && <Check size={16} className="text-white mx-auto" />}
            </button>
          ))}
          <div className="relative ml-2">
            <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer appearance-none" />
          </div>
        </div>
        <div className="mt-4 p-4 rounded-xl border border-gray-100">
          <p className="text-xs text-gray-400 mb-2">Preview</p>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm text-white rounded-lg" style={{ backgroundColor: primaryColor }}>Botao Principal</button>
            <button className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600">Botao Secundario</button>
            <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: `${primaryColor}20` }}>
              <div className="w-full h-full rounded-lg flex items-center justify-center"><div className="w-3 h-3 rounded" style={{ backgroundColor: primaryColor }}></div></div>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <SaveButton onClick={handleSave} saving={saving} />
        </div>
      </Section>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

function NotificacoesTab() {
  const [prefs, setPrefs] = useState({
    novasConversas: true, novasTarefas: true, convites: true,
    atualizacoes: true, errosIntegracao: true,
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));
  const handleSave = () => { setSaving(true); setTimeout(() => { setSaving(false); setToast('Notificacoes atualizadas'); }, 1000); };

  const items = [
    { key: 'novasConversas', label: 'Novas conversas', description: 'Receber alerta quando um cliente iniciar uma conversa' },
    { key: 'novasTarefas', label: 'Novas tarefas', description: 'Receber notificacao quando uma tarefa for atribuida a voce' },
    { key: 'convites', label: 'Convites', description: 'Receber alerta quando for convidado para um workspace' },
    { key: 'atualizacoes', label: 'Atualizacoes importantes', description: 'Notificacoes sobre atualizacoes da plataforma e novos recursos' },
    { key: 'errosIntegracao', label: 'Erros de integracao', description: 'Alertas quando uma integracao falhar ou perder conexao' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg text-gray-900 dark:text-[#ededed]">Notificacoes</h2>
        <p className="text-sm text-gray-400 dark:text-[#666] mt-0.5">Controle quais notificacoes deseja receber</p>
      </div>

      <Section title="Preferencias de Notificacoes" footer={<SaveButton onClick={handleSave} saving={saving} />}>
        <div className="space-y-3">
          {items.map(item => (
            <Toggle key={item.key} enabled={prefs[item.key]} onChange={() => toggle(item.key)} label={item.label} description={item.description} />
          ))}
        </div>
      </Section>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

function SegurancaTab() {
  const [sessions, setSessions] = useState(MOCK_SESSIONS);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [confirmEndAll, setConfirmEndAll] = useState(false);
  const [toast, setToast] = useState(null);
  const [twoFactor, setTwoFactor] = useState(false);

  const endSession = (id) => setSessions(p => p.filter(s => s.id !== id));
  const endAllOther = () => { setSessions(p => p.filter(s => s.current)); setConfirmEndAll(false); setToast('Outras sessoes encerradas'); };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg text-gray-900 dark:text-[#ededed]">Seguranca</h2>
        <p className="text-sm text-gray-400 dark:text-[#666] mt-0.5">Protecao da sua conta e dados</p>
      </div>

      <Section title="Senha">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-[#ccc]">Alterar senha de acesso</p>
            <p className="text-xs text-gray-400 dark:text-[#666] mt-0.5">Ultima alteracao: 10/07/2026</p>
          </div>
          <button onClick={() => setShowChangePassword(true)} className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg text-gray-600 dark:text-[#ccc] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
            <Key size={14} /> Alterar senha
          </button>
        </div>
      </Section>

      <Section title="Sessoes Ativas" description="Dispositivos conectados a sua conta">
        <div className="space-y-3">
          {sessions.map(s => (
            <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#1a1a1a] flex items-center justify-center">
                  <Smartphone size={18} className="text-gray-400 dark:text-[#666]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-700 dark:text-[#ccc]">{s.device}</p>
                    {s.current && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 px-1.5 py-0.5 rounded-full">Atual</span>}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-[#666]">{s.ip} | {s.location} | {s.lastActive}</p>
                </div>
              </div>
              {!s.current && (
                <button onClick={() => endSession(s.id)} className="text-xs text-red-500 hover:text-red-600 transition-colors">Encerrar</button>
              )}
            </div>
          ))}
        </div>
        {sessions.length > 1 && (
          <div className="mt-4 flex justify-end">
            <button onClick={() => setConfirmEndAll(true)} className="text-sm text-red-500 hover:text-red-600 transition-colors">Encerrar todas as outras sessoes</button>
          </div>
        )}
      </Section>

      <Section title="Autenticacao em Dois Fatores" description="Adicione uma camada extra de seguranca">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-[#ccc]">{twoFactor ? 'Ativada' : 'Desativada'}</p>
            <p className="text-xs text-gray-400 dark:text-[#666] mt-0.5">{twoFactor ? 'Sua conta esta protegida por 2FA' : 'Recomendamos ativar a autenticacao em dois fatores'}</p>
          </div>
          <button onClick={() => setTwoFactor(!twoFactor)}>
            {twoFactor ? <ToggleRight size={28} className="text-[var(--zelt-primary)]" /> : <ToggleLeft size={28} className="text-gray-300 dark:text-[#555]" />}
          </button>
        </div>
      </Section>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-4">
          <p className="text-xs text-gray-400 dark:text-[#666] mb-1">Ultimo acesso</p>
          <p className="text-sm text-gray-700 dark:text-[#ccc]">16/07/2026 14:32</p>
        </div>
        <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-4">
          <p className="text-xs text-gray-400 dark:text-[#666] mb-1">Ultimo IP</p>
          <code className="text-sm text-gray-700 dark:text-[#ccc] font-mono">189.45.23.102</code>
        </div>
      </div>

      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} onDone={() => { setShowChangePassword(false); setToast('Senha alterada com sucesso'); }} />}
      {confirmEndAll && <ConfirmModal title="Encerrar outras sessoes" message="Todas as outras sessoes ativas serao encerradas. Voce precisara fazer login novamente nesses dispositivos." onConfirm={endAllOther} onCancel={() => setConfirmEndAll(false)} />}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

function CobrancaTab() {
  const [toast, setToast] = useState(null);

  return (
    <div className="space-5">
      <style>{`.space-5 > * + * { margin-top: 1.25rem; }`}</style>
      <div>
        <h2 className="text-lg text-gray-900 dark:text-[#ededed]">Cobranca</h2>
        <p className="text-sm text-gray-400 dark:text-[#666] mt-0.5">Gerencie assinatura e pagamentos</p>
      </div>

      <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base text-gray-900 dark:text-[#ededed]">Plano Atual</h3>
            <p className="text-sm text-gray-400 dark:text-[#666] mt-0.5">Seu plano e renovado automaticamente</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--zelt-primary)]/10 text-[var(--zelt-primary)] border border-[var(--zelt-primary)]/20">Pro</span>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="p-3 rounded-lg border border-gray-100 dark:border-white/[0.06]">
            <p className="text-xs text-gray-400 dark:text-[#666]">Valor mensal</p>
            <p className="text-lg text-gray-900 dark:text-[#ededed] mt-0.5">R$ 149,90</p>
          </div>
          <div className="p-3 rounded-lg border border-gray-100 dark:border-white/[0.06]">
            <p className="text-xs text-gray-400 dark:text-[#666]">Proxima cobranca</p>
            <p className="text-sm text-gray-700 dark:text-[#ccc] mt-0.5">01/08/2026</p>
          </div>
          <div className="p-3 rounded-lg border border-gray-100 dark:border-white/[0.06]">
            <p className="text-xs text-gray-400 dark:text-[#666]">Status</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">Ativa</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm bg-[var(--zelt-primary)] text-white rounded-lg hover:opacity-90 transition-colors">
            <Zap size={14} /> Alterar Plano
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg text-gray-600 dark:text-[#ccc] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
            <CreditCard size={14} /> Atualizar Forma de Pagamento
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
          <h3 className="text-base text-gray-900 dark:text-[#ededed]">Historico de Pagamentos</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-[#111] border-b border-gray-100 dark:border-white/[0.06]">
            <tr>
              <th className="px-6 py-3 text-left text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider">Data</th>
              <th className="px-6 py-3 text-left text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider">Plano</th>
              <th className="px-6 py-3 text-left text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider">Valor</th>
              <th className="px-6 py-3 text-left text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-white/[0.06]">
            {MOCK_PAYMENTS.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a]/50 transition-colors">
                <td className="px-6 py-3 text-sm text-gray-700 dark:text-[#ccc]">{p.date}</td>
                <td className="px-6 py-3 text-sm text-gray-600 dark:text-[#aaa]">{p.plan}</td>
                <td className="px-6 py-3 text-sm text-gray-700 dark:text-[#ccc]">{p.amount}</td>
                <td className="px-6 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40">{p.status}</span>
                </td>
                <td className="px-6 py-3">
                  <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#222] text-gray-400 hover:text-gray-600 transition-colors">
                    <Download size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

function LogsTab() {
  const [logs] = useState(MOCK_LOGS);
  const [filterUser, setFilterUser] = useState('all');
  const [filterDate, setFilterDate] = useState('all');

  const users = [...new Set(logs.map(l => l.user))];

  const filtered = logs.filter(l => {
    const matchUser = filterUser === 'all' || l.user === filterUser;
    return matchUser;
  });

  return (
    <div className="space-5">
      <style>{`.space-5 > * + * { margin-top: 1.25rem; }`}</style>
      <div>
        <h2 className="text-lg text-gray-900 dark:text-[#ededed]">Logs do Sistema</h2>
        <p className="text-sm text-gray-400 dark:text-[#666] mt-0.5">Historico de acoes realizadas no workspace</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg p-1">
          <div className="relative">
            <select value={filterUser} onChange={(e) => setFilterUser(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#1a1a1a] text-gray-600 dark:text-[#ccc] focus:border-[var(--zelt-primary)]/40 transition-colors cursor-pointer">
              <option value="all">Todos os usuarios</option>
              {users.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <Users size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#666] pointer-events-none" />
          </div>
          <div className="relative">
            <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#1a1a1a] text-gray-600 dark:text-[#ccc] focus:border-[var(--zelt-primary)]/40 transition-colors cursor-pointer">
              <option value="all">Todos os periodos</option>
              <option value="today">Hoje</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
            </select>
            <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#666] pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl overflow-hidden">
        <div className="divide-y divide-gray-50 dark:divide-white/[0.06]">
          {filtered.map(log => {
            const Icon = log.icon;
            return (
              <div key={log.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-[#1a1a1a]/50 transition-colors">
                <div className={`w-9 h-9 rounded-lg ${log.bg} flex items-center justify-center shrink-0`}>
                  <Icon size={16} className={log.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-[#ccc] truncate">{log.action}</p>
                  <p className="text-xs text-gray-400 dark:text-[#666] mt-0.5">por {log.user}</p>
                </div>
                <span className="text-xs text-gray-400 dark:text-[#666] shrink-0">{log.timestamp}</span>
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-10">
            <ScrollText size={28} className="mx-auto text-gray-300 dark:text-[#444] mb-2" />
            <p className="text-sm text-gray-500 dark:text-[#666]">Nenhum log encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
