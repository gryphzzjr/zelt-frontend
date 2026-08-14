import {
  LayoutGrid, MessageCircle, BookOpen, Zap, FileText, CheckSquare,
  Calendar, MessageSquare, FileSpreadsheet, Folder, Mail, Code,
  Settings, HelpCircle, Sparkles,
} from 'lucide-react';

export const HISTORY_KEY = 'zelt:search-history';
export const HISTORY_MAX = 8;

export function normalize(s = '') {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export const SEARCH_INDEX = [
  { id: 'dashboard', label: 'Visao geral', parent: 'Dashboard', icon: LayoutGrid, keywords: ['inicio', 'home', 'dashboard', 'principal', 'overview'] },
  { id: 'atendimentos/conversas', label: 'Conversas', parent: 'Atendimentos', icon: MessageCircle, keywords: ['atendimento', 'mensagem', 'cliente', 'contato', 'chat', 'inbox', 'contatos'] },
  { id: 'atendimentos/chat', label: 'Chat ao vivo', parent: 'Atendimentos', icon: Zap, keywords: ['ao vivo', 'tempo real', 'live', 'real time', 'wa', 'whatsapp'] },
  { id: 'ia/base-conhecimento', label: 'Base de conhecimento', parent: 'IA', icon: BookOpen, keywords: ['conhecimento', 'faq', 'artigo', 'saber', 'base'] },
  { id: 'ia/prompts', label: 'Prompts', parent: 'IA', icon: Sparkles, keywords: ['prompt', 'ia', 'inteligencia', 'ai', 'gpt'] },
  { id: 'ia/respostas-automaticas', label: 'Respostas rapidas', parent: 'IA', icon: Zap, keywords: ['automatica', 'resposta', 'auto', 'macros', 'atalhos'] },
  { id: 'ia/templates', label: 'Templates de treinamento', parent: 'IA', icon: FileText, keywords: ['template', 'treinamento', 'modelo', 'gabarito', 'treinar'] },
  { id: 'operacoes/tarefas', label: 'Lista de tarefas', parent: 'Operacoes', icon: CheckSquare, keywords: ['tarefa', 'pendencia', 'pendente', 'to do', 'task', 'atividade'] },
  { id: 'operacoes/agenda', label: 'Agenda', parent: 'Operacoes', icon: Calendar, keywords: ['compromisso', 'evento', 'reuniao', 'calendario'] },
  { id: 'operacoes/planilhas', label: 'Planilhas', parent: 'Operacoes', icon: FileSpreadsheet, keywords: ['planilha', 'sheets', 'tabela', 'spreadsheet', 'formula', 'excel', 'zelt sheets'] },
  { id: 'operacoes/arquivos', label: 'Arquivos', parent: 'Operacoes', icon: Folder, keywords: ['drive', 'arquivo', 'documento', 'nuvem', 'media', 'midia', 'upload', 'arquivos', 'zelt drive'] },
  { id: 'integracoes', label: 'Integracoes', parent: 'Visao geral', icon: LayoutGrid, keywords: ['conexoes', 'canais', 'apps', 'conectar'] },
  { id: 'integracoes/whatsapp', label: 'WhatsApp', parent: 'Integracoes', icon: MessageSquare, keywords: ['zap', 'whats', 'numero', 'evolucao', 'evolution api', 'qr code', 'qr'] },
  { id: 'integracoes/google-sheets', label: 'Google Sheets', parent: 'Integracoes', icon: FileSpreadsheet, keywords: ['planilha', 'sheets', 'tabela', 'spreadsheet', 'excel'] },
  { id: 'integracoes/google-drive', label: 'Google Drive', parent: 'Integracoes', icon: Folder, keywords: ['drive', 'arquivo', 'documento', 'nuvem', 'arquivos'] },
  { id: 'integracoes/google-calendar', label: 'Google Calendar', parent: 'Integracoes', icon: Calendar, keywords: ['calendario', 'evento', 'agenda'] },
  { id: 'integracoes/gmail', label: 'Gmail', parent: 'Integracoes', icon: Mail, keywords: ['email', 'mensagem', 'mail', 'inbox'] },
  { id: 'integracoes/api-webhooks', label: 'APIs', parent: 'Integracoes', icon: Code, keywords: ['api', 'webhook', 'webhooks', 'chave', 'token', 'endpoint'] },
  { id: 'configuracoes', label: 'Configuracoes', parent: 'Conta', icon: Settings, keywords: ['config', 'preferencias', 'perfil', 'plano', 'senha', 'conta'] },
  { id: 'ajuda', label: 'Ajuda', parent: 'Suporte', icon: HelpCircle, keywords: ['suporte', 'duvida', 'faq', 'tutorial', 'contato', 'ajudar'] },
];

export const RECOMMENDED_IDS = [
  'atendimentos/conversas',
  'atendimentos/chat',
  'integracoes/whatsapp',
  'operacoes/tarefas',
  'ia/templates',
  'ia/base-conhecimento',
];

export function getSuggested(entry, q) {
  const nq = normalize(q);
  if (!nq) return false;
  return normalize(entry.label).includes(nq) || entry.keywords.some((k) => normalize(k).includes(nq));
}

export function getSuggestions(query) {
  const q = normalize(query);
  if (!q) return [];
  return SEARCH_INDEX.filter((e) => getSuggested(e, q)).slice(0, 8);
}

export function getRecommended() {
  return RECOMMENDED_IDS.map((id) => SEARCH_INDEX.find((e) => e.id === id)).filter(Boolean);
}

export function loadHistory() {
  try {
    const raw = JSON.parse(localStorage.getItem(HISTORY_KEY));
    return Array.isArray(raw) ? raw.slice(0, HISTORY_MAX) : [];
  } catch {
    return [];
  }
}

export function saveHistory(list) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function pushHistory(prev, label, view) {
  const next = [
    { id: Date.now(), label, view },
    ...prev.filter((p) => p.label !== label),
  ].slice(0, HISTORY_MAX);
  saveHistory(next);
  return next;
}

export function Highlight({ text, q }) {
  const nq = normalize(q);
  if (!nq) return text;
  const idx = normalize(text).indexOf(nq);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-[var(--zelt-primary)] font-semibold">{text.slice(idx, idx + q.length)}</span>
      {text.slice(idx + q.length)}
    </>
  );
}
