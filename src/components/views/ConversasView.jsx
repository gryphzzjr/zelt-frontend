import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, RefreshCw, X, Loader2, WifiOff, Inbox, Clock,
  ArrowDownToLine, ArrowUpFromLine, LayoutGrid, List,
  Plus, Tag, CheckCheck, Pencil,
} from 'lucide-react';
import { useWhatsAppStatus } from '../../hooks/useWhatsAppStatus';
import { useAuth } from '../../contexts/AuthContext';
import { evolutionApi, chatApi } from '../../lib/api';

function getPhone(chat) {
  const alt = chat.lastMessage?.key?.remoteJidAlt;
  if (alt && alt.includes('@s.whatsapp.net')) return alt.replace(/@.*/, '');
  const jid = chat.remoteJid || '';
  if (jid.includes('@s.whatsapp.net')) return jid.replace(/@.*/, '');
  return '';
}

function getDisplayPhone(chat) {
  const raw = getPhone(chat);
  if (!raw) {
    const jid = chat.remoteJid || '';
    const num = jid.replace(/@.*/, '');
    if (jid.includes('@lid') && num) return `ID: ${num}`;
    return '-';
  }
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length >= 12) {
    const ddd = digits.substring(2, 4);
    const num = digits.substring(4);
    if (num.length === 9) return `(${ddd}) ${num.substring(0, 5)}-${num.substring(5)}`;
    if (num.length === 8) return `(${ddd}) ${num.substring(0, 4)}-${num.substring(4)}`;
  }
  return digits || raw;
}

function getDisplayName(chat, contactMap) {
  const jid = chat.remoteJid || '';
  const contact = contactMap[jid];
  if (contact?.customName) return contact.customName;
  if (chat.pushName) return chat.pushName;
  return '';
}

function Avatar({ name, url, size = 36 }) {
  const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  if (url) {
    return <img src={url} alt="" className="rounded-full shrink-0 object-cover" style={{ width: size, height: size }} loading="lazy" />;
  }
  return (
    <div className="rounded-full shrink-0 bg-[var(--zelt-primary)]/10 flex items-center justify-center" style={{ width: size, height: size }}>
      <span className="text-[11px] font-medium text-[var(--zelt-primary)]">{initials}</span>
    </div>
  );
}

function EditableName({ jid, name, onSave }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const inputRef = useRef(null);

  useEffect(() => { setValue(name); }, [name]);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const save = () => {
    setEditing(false);
    const trimmed = value.trim();
    if (trimmed && trimmed !== name) {
      onSave(jid, trimmed);
    } else {
      setValue(name);
    }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setValue(name); setEditing(false); } }}
        className="text-sm text-gray-900 dark:text-[#ededed] bg-white dark:bg-[#141414] border border-[var(--zelt-primary)]/30 rounded px-1.5 py-0.5 outline-none w-full min-w-0"
        onClick={e => e.stopPropagation()}
      />
    );
  }

  return (
    <span
      className="text-sm text-gray-900 dark:text-[#ededed] truncate group/name cursor-pointer flex items-center gap-1 min-w-0"
      onClick={e => { e.stopPropagation(); setEditing(true); }}
    >
      {name || <span className="text-gray-300 dark:text-[#555] italic">Definir nome</span>}
      <Pencil size={10} className="text-gray-300 dark:text-[#555] opacity-0 group-hover/name:opacity-100 shrink-0 transition-opacity" />
    </span>
  );
}

function EditableNameModal({ name, onSave }) {
  const [value, setValue] = useState(name);

  useEffect(() => { setValue(name); }, [name]);

  const save = () => {
    const trimmed = value.trim();
    onSave(trimmed || null);
  };

  return (
    <div>
      <label className="text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wide block mb-1">Nome do Contato</label>
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          onBlur={save}
          onKeyDown={e => { if (e.key === 'Enter') save(); }}
          placeholder="Definir nome..."
          className="flex-1 px-3 py-2 text-sm border border-gray-200/80 dark:border-white/[0.06] rounded-lg outline-none focus:border-[var(--zelt-primary)]/40 transition-all"
        />
      </div>
      <p className="text-[10px] text-gray-300 dark:text-[#555] mt-1">
        {name ? 'Nome definido manualmente' : 'Pressione Enter para salvar'}
      </p>
    </div>
  );
}

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(typeof ts === 'number' ? ts * 1000 : ts);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `${diffMin}min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function formatFullDate(ts) {
  if (!ts) return '-';
  const d = new Date(typeof ts === 'number' ? ts * 1000 : ts);
  return d.toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getLastMessageText(chat) {
  const msg = chat?.lastMessage;
  if (!msg) return '';
  const type = msg.messageType || '';
  const m = msg.message || {};
  if (type === 'conversation' && m.conversation) return m.conversation;
  if (type === 'extendedTextMessage' && m.extendedTextMessage?.text) return m.extendedTextMessage.text;
  if (type === 'imageMessage') return 'Foto';
  if (type === 'videoMessage') return 'Video';
  if (type === 'audioMessage') return 'Audio';
  if (type === 'documentMessage') return 'Documento';
  if (type === 'stickerMessage') return 'Figurinha';
  if (type === 'locationMessage') return 'Localizacao';
  if (type === 'contactMessage') return 'Contato';
  if (type === 'reactionMessage') return 'Reacao';
  if (m.conversation) return m.conversation;
  if (m.extendedTextMessage?.text) return m.extendedTextMessage.text;
  return type || 'Mensagem';
}

function TagBadge({ tag, small, onRemove }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border ${small ? 'px-1.5 py-0 text-[9px]' : 'px-2 py-0.5 text-[10px]'}`}
      style={{ color: tag.color, backgroundColor: `${tag.color}10`, borderColor: `${tag.color}20` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }}></span>
      {tag.label}
      {onRemove && (
        <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="ml-0.5 hover:opacity-60">
          <X size={8} />
        </button>
      )}
    </span>
  );
}

export default function Conversas({ onNavigate }) {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [contactMap, setContactMap] = useState({});
  const [showTagManager, setShowTagManager] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#0EA5E9');
  const [taggingChat, setTaggingChat] = useState(null);

  const { workspace } = useAuth();
  const instanceName = workspace?.instanceName;
  const { connected, instances, loading: waLoading } = useWhatsAppStatus(workspace?.id);

  const fetchChats = useCallback(async () => {
    if (!instanceName) return;
    try {
      setLoading(true);
      const res = await evolutionApi.findChats(instanceName);
      const list = Array.isArray(res) ? res : [];
      const sorted = list.sort((a, b) => {
        const aTs = a.lastMessage?.messageTimestamp || 0;
        const bTs = b.lastMessage?.messageTimestamp || 0;
        return bTs - aTs;
      });
      setChats(sorted);
    } catch (err) {
      console.error('Failed to fetch chats:', err);
      setChats([]);
    } finally {
      setLoading(false);
    }
  }, [instanceName]);

  const fetchContacts = useCallback(async () => {
    if (!instanceName) return;
    try {
      const data = await chatApi.getContacts(instanceName);
      const map = {};
      (Array.isArray(data) ? data : []).forEach(c => { map[c.remoteJid] = c; });
      setContactMap(map);
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    }
  }, [instanceName]);

  const fetchTags = useCallback(async () => {
    if (!instanceName) return;
    try {
      const data = await chatApi.getTags(instanceName);
      setAllTags(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch tags:', err);
    }
  }, [instanceName]);

  useEffect(() => {
    if (connected && instanceName) {
      fetchChats();
      fetchContacts();
      fetchTags();
    }
  }, [connected, instanceName, fetchChats, fetchContacts, fetchTags]);

  const saveChatName = async (jid, name) => {
    const contact = contactMap[jid];
    if (!contact) return;
    try {
      await chatApi.updateContactName(contact.id, name);
      setContactMap(prev => ({
        ...prev,
        [jid]: { ...prev[jid], customName: name },
      }));
    } catch (err) {
      console.error('Failed to update name:', err);
    }
  };

  const saveChatTag = async (jid, tagId) => {
    const contact = contactMap[jid];
    if (!contact) return;
    const currentTagIds = (contact.tags || []).map(t => t.tagId);
    if (currentTagIds.includes(tagId)) return;
    const next = [...currentTagIds, tagId];
    try {
      await chatApi.setContactTags(contact.id, next);
      const updatedTags = allTags.filter(t => next.includes(t.id));
      setContactMap(prev => ({
        ...prev,
        [jid]: { ...prev[jid], tags: updatedTags.map(t => ({ tagId: t.id, tag: t })) },
      }));
    } catch (err) {
      console.error('Failed to set tag:', err);
    }
  };

  const removeChatTag = async (jid, tagId) => {
    const contact = contactMap[jid];
    if (!contact) return;
    const currentTagIds = (contact.tags || []).map(t => t.tagId);
    const next = currentTagIds.filter(id => id !== tagId);
    try {
      await chatApi.setContactTags(contact.id, next);
      const updatedTags = allTags.filter(t => next.includes(t.id));
      setContactMap(prev => ({
        ...prev,
        [jid]: { ...prev[jid], tags: updatedTags.map(t => ({ tagId: t.id, tag: t })) },
      }));
    } catch (err) {
      console.error('Failed to remove tag:', err);
    }
  };

  const addCustomTag = async () => {
    if (!newTagName.trim()) return;
    try {
      await chatApi.createTag(instanceName, { label: newTagName.trim(), color: newTagColor });
      await fetchTags();
      setNewTagName('');
      setShowTagManager(false);
    } catch (err) {
      console.error('Failed to create tag:', err);
    }
  };

  const deleteCustomTag = async (tagId) => {
    try {
      await chatApi.deleteTag(tagId);
      await fetchTags();
    } catch (err) {
      console.error('Failed to delete tag:', err);
    }
  };

  const filtered = chats.filter(c => {
    const q = search.toLowerCase();
    const name = getDisplayName(c, contactMap).toLowerCase();
    const jid = (c.remoteJid || '').toLowerCase();
    const phone = getPhone(c).toLowerCase();
    const pushName = (c.pushName || '').toLowerCase();
    const contact = contactMap[c.remoteJid];
    const tags = (contact?.tags || []).map(t => t.tag?.label?.toLowerCase() || '').join(' ');
    return name.includes(q) || jid.includes(q) || phone.includes(q) || pushName.includes(q) || tags.includes(q);
  });

  const totalUnread = chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  if (waLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={20} className="text-gray-400 dark:text-[#666] animate-spin" />
        <span className="ml-2 text-sm text-gray-400 dark:text-[#666]">Verificando conexao...</span>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-xl text-gray-900 dark:text-[#ededed]">Conversas</h1>
          <p className="text-xs text-gray-400 dark:text-[#666] mt-0.5">Gerencie as conversas dos seus clientes</p>
        </div>
        <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-12">
          <div className="flex flex-col items-center text-center max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
              <WifiOff size={24} className="text-amber-500" />
            </div>
            <h3 className="text-base text-gray-900 dark:text-[#ededed] mb-1.5">WhatsApp nao conectado</h3>
            <p className="text-sm text-gray-400 dark:text-[#666] leading-relaxed mb-5">
              Para visualizar conversas, conecte um numero do WhatsApp primeiro.
            </p>
            <button
              onClick={() => onNavigate?.('integracoes/whatsapp')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm text-white bg-[#25D366] hover:bg-[#1fb855] rounded-lg transition-colors"
            >
              Conectar WhatsApp
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.97); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fade { animation: fadeIn 0.15s ease-out forwards; }
        .animate-scale { animation: scaleUp 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      <div className="flex flex-col h-[calc(100vh-64px)] p-6 overflow-y-auto">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl text-gray-900 dark:text-[#ededed]">Conversas</h1>
            <p className="text-xs text-gray-400 dark:text-[#666] mt-0.5">
              {chats.length > 0
                ? `${chats.length} conversas - ${totalUnread} nao lidas`
                : 'Conversas aparecem aqui quando clientes enviam mensagens'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#666]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nome, numero ou tag..."
                className="pl-8 pr-3 py-2 text-xs border border-gray-200/80 dark:border-white/[0.06] rounded-xl bg-white dark:bg-[#141414] text-gray-700 dark:text-[#ccc] placeholder-gray-400 dark:placeholder-[#555] outline-none focus:border-[var(--zelt-primary)]/40 transition-all w-56"
              />
            </div>
            <button
              onClick={() => setShowTagManager(true)}
              className="flex items-center gap-1 px-2.5 py-2 text-xs bg-white dark:bg-[#141414] text-gray-600 dark:text-[#aaa] border border-gray-200/80 dark:border-white/[0.06] rounded-xl hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-all"
            >
              <Tag size={13} /> Tags
            </button>
            <div className="flex border border-gray-200/80 dark:border-white/[0.06] rounded-xl overflow-hidden bg-white dark:bg-[#141414]">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 transition-colors ${viewMode === 'table' ? 'bg-[var(--zelt-primary)]/10 text-[var(--zelt-primary)]' : 'text-gray-400 dark:text-[#666] hover:text-gray-600 dark:hover:text-[#ccc]'}`}
              >
                <List size={13} />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 transition-colors ${viewMode === 'cards' ? 'bg-[var(--zelt-primary)]/10 text-[var(--zelt-primary)]' : 'text-gray-400 dark:text-[#666] hover:text-gray-600 dark:hover:text-[#ccc]'}`}
              >
                <LayoutGrid size={13} />
              </button>
            </div>
            <button
              onClick={() => { fetchChats(); fetchContacts(); fetchTags(); }}
              disabled={loading}
              className="flex items-center gap-1 px-2.5 py-2 text-xs bg-white dark:bg-[#141414] text-gray-600 dark:text-[#aaa] border border-gray-200/80 dark:border-white/[0.06] rounded-xl hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-all disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        <div className="flex-1">
          {loading && chats.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={18} className="text-gray-400 dark:text-[#666] animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white dark:bg-[#141414] rounded-xl border border-gray-200/60 dark:border-white/[0.06] flex flex-col items-center justify-center min-h-[300px] gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/[0.06] flex items-center justify-center">
                <Inbox size={24} className="text-gray-300 dark:text-[#555]" />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-[#808080] mb-0.5">
                  {search ? 'Nenhum resultado' : 'Nenhuma conversa ainda'}
                </p>
                <p className="text-xs text-gray-300 dark:text-[#555]">
                  {search ? 'Tente outro termo' : 'As conversas serao listadas aqui automaticamente'}
                </p>
              </div>
            </div>
          ) : viewMode === 'table' ? (
            <div className="bg-white dark:bg-[#141414] rounded-xl border border-gray-200/60 dark:border-white/[0.06] overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/[0.06]">
                    <th className="px-5 py-3 text-left text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wide">Contato</th>
                    <th className="px-5 py-3 text-left text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wide">Tags</th>
                    <th className="px-5 py-3 text-left text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wide">Ultima Mensagem</th>
                    <th className="px-5 py-3 text-left text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wide">Horario</th>
                    <th className="px-5 py-3 text-center text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wide">Nao Lidas</th>
                    <th className="px-5 py-3 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/80 dark:divide-white/[0.06]">
                  {filtered.map((chat) => {
                    const displayName = getDisplayName(chat, contactMap);
                    const phone = getDisplayPhone(chat);
                    const lastText = getLastMessageText(chat);
                    const fromMe = chat.lastMessage?.key?.fromMe;
                    const time = formatTime(chat.lastMessage?.messageTimestamp);
                    const unread = chat.unreadCount || 0;
                    const contact = contactMap[chat.remoteJid];
                    const tags = (contact?.tags || []).map(t => t.tag).filter(Boolean);

                    return (
                      <tr
                        key={chat.id || chat.remoteJid}
                        onClick={() => setSelectedChat(chat)}
                        className="hover:bg-[var(--zelt-primary)]/[0.02] cursor-pointer transition-colors duration-150"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar name={displayName || chat.pushName} url={chat.profilePicUrl} size={38} />
                              {unread > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[var(--zelt-primary)] text-white text-[9px] font-medium flex items-center justify-center">
                                  {unread > 99 ? '99+' : unread}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <EditableName jid={chat.remoteJid} name={displayName} onSave={saveChatName} />
                              <p className="text-[11px] text-gray-400 dark:text-[#666] truncate">{phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {tags.map(t => <TagBadge key={t.id} tag={t} small />)}
                            {tags.length === 0 && <span className="text-[10px] text-gray-300 dark:text-[#555]">-</span>}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 max-w-[240px]">
                          <div className="flex items-center gap-1.5">
                            {fromMe === false ? (
                              <ArrowDownToLine size={11} className="text-gray-300 dark:text-[#555] shrink-0" />
                            ) : fromMe === true ? (
                              <ArrowUpFromLine size={11} className="text-[var(--zelt-primary)] shrink-0" />
                            ) : null}
                            <p className={`text-xs truncate ${unread > 0 ? 'text-gray-800' : 'text-gray-500 dark:text-[#808080]'}`}>
                              {lastText || 'Sem mensagens'}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-400 dark:text-[#666] whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Clock size={11} className="text-gray-300 dark:text-[#555]" />
                            {time}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          {unread > 0 ? (
                            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[var(--zelt-primary)]/10 text-[var(--zelt-primary)] text-[10px] font-medium">
                              {unread > 99 ? '99+' : unread}
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-300 dark:text-[#555]">-</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 relative" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => setTaggingChat(taggingChat === chat.remoteJid ? null : chat.remoteJid)}
                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#1a1a1a] text-gray-400 dark:text-[#666] hover:text-gray-600 dark:hover:text-[#ccc] transition-colors"
                          >
                            <Tag size={13} />
                          </button>
                          {taggingChat === chat.remoteJid && (
                            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl shadow-lg p-2 z-20 w-44 animate-scale">
                              <p className="text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wide px-2 mb-1">Classificar com</p>
                              {allTags.map(tag => {
                                const active = (contact?.tags || []).some(t => t.tagId === tag.id);
                                return (
                                  <button
                                    key={tag.id}
                                    onClick={() => active ? removeChatTag(chat.remoteJid, tag.id) : saveChatTag(chat.remoteJid, tag.id)}
                                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors ${active ? 'bg-gray-50 dark:bg-[#111]' : 'hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'}`}
                                  >
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: tag.color }}></span>
                                    <span className="text-gray-700 dark:text-[#ccc] flex-1 text-left">{tag.label}</span>
                                    {active && <CheckCheck size={12} className="text-[var(--zelt-primary)]" />}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((chat) => {
                const displayName = getDisplayName(chat, contactMap);
                const phone = getDisplayPhone(chat);
                const lastText = getLastMessageText(chat);
                const fromMe = chat.lastMessage?.key?.fromMe;
                const time = formatTime(chat.lastMessage?.messageTimestamp);
                const unread = chat.unreadCount || 0;
                const contact = contactMap[chat.remoteJid];
                const tags = (contact?.tags || []).map(t => t.tag).filter(Boolean);

                return (
                  <div
                    key={chat.id || chat.remoteJid}
                    onClick={() => setSelectedChat(chat)}
                    className="bg-white dark:bg-[#141414] border border-gray-200/60 dark:border-white/[0.06] rounded-xl p-4 hover:border-[var(--zelt-primary)]/20 cursor-pointer transition-all relative group"
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); setTaggingChat(taggingChat === chat.remoteJid ? null : chat.remoteJid); }}
                      className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-300 dark:text-[#555] hover:text-gray-500 dark:hover:text-[#808080] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Tag size={12} />
                    </button>
                    {taggingChat === chat.remoteJid && (
                      <div className="absolute right-3 top-full mt-1 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl shadow-lg p-2 z-20 w-44 animate-scale">
                        <p className="text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wide px-2 mb-1">Classificar com</p>
                        {allTags.map(tag => {
                          const active = (contact?.tags || []).some(t => t.tagId === tag.id);
                          return (
                            <button
                              key={tag.id}
                              onClick={(e) => { e.stopPropagation(); active ? removeChatTag(chat.remoteJid, tag.id) : saveChatTag(chat.remoteJid, tag.id); }}
                              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors ${active ? 'bg-gray-50 dark:bg-[#111]' : 'hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'}`}
                            >
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: tag.color }}></span>
                              <span className="text-gray-700 dark:text-[#ccc] flex-1 text-left">{tag.label}</span>
                              {active && <CheckCheck size={12} className="text-[var(--zelt-primary)]" />}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex items-start gap-3 mb-3">
                      <div className="relative">
                        <Avatar name={displayName || chat.pushName} url={chat.profilePicUrl} size={42} />
                        {unread > 0 && (
                          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[var(--zelt-primary)] text-white text-[9px] font-medium flex items-center justify-center">
                            {unread > 99 ? '99+' : unread}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <EditableName jid={chat.remoteJid} name={displayName} onSave={saveChatName} />
                        <p className="text-[11px] text-gray-400 dark:text-[#666] truncate">{phone}</p>
                      </div>
                    </div>

                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2.5">
                        {tags.map(t => <TagBadge key={t.id} tag={t} small />)}
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      {fromMe === false ? (
                        <ArrowDownToLine size={11} className="text-gray-300 dark:text-[#555] shrink-0" />
                      ) : fromMe === true ? (
                        <ArrowUpFromLine size={11} className="text-[var(--zelt-primary)] shrink-0" />
                      ) : null}
                      <p className={`text-xs truncate flex-1 ${unread > 0 ? 'text-gray-800' : 'text-gray-400 dark:text-[#666]'}`}>
                        {lastText || 'Sem mensagens'}
                      </p>
                      <span className="text-[10px] text-gray-300 dark:text-[#555] shrink-0 flex items-center gap-0.5">
                        <Clock size={9} /> {time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {filtered.length > 0 && (
          <div className="flex items-center justify-between pt-3">
            <span className="text-[10px] text-gray-400 dark:text-[#666]">{filtered.length} conversas</span>
          </div>
        )}

        {selectedChat && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 animate-fade">
            <div className="bg-white dark:bg-[#141414] rounded-xl w-full max-w-md overflow-hidden border border-gray-200/60 dark:border-white/[0.06] animate-scale relative">
              <div className="p-5">
                <button
                  onClick={() => setSelectedChat(null)}
                  className="absolute top-3 right-3 p-1 text-gray-400 dark:text-[#666] hover:text-gray-600 dark:hover:text-[#ccc] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] rounded-lg transition-colors"
                >
                  <X size={15} />
                </button>

                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
                  <Avatar name={getDisplayName(selectedChat, contactMap) || selectedChat.pushName} url={selectedChat.profilePicUrl} size={48} />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm text-gray-900 dark:text-[#ededed] truncate">{getDisplayName(selectedChat, contactMap) || 'Desconhecido'}</h3>
                    <p className="text-[11px] text-gray-400 dark:text-[#666] mt-0.5">{getDisplayPhone(selectedChat)}</p>
                  </div>
                </div>

                <div className="mb-5">
                  <EditableNameModal
                    name={getDisplayName(selectedChat, contactMap)}
                    onSave={(name) => saveChatName(selectedChat.remoteJid, name)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-gray-50 dark:bg-[#111] rounded-xl p-3 text-center">
                    <p className="text-lg text-gray-900 dark:text-[#ededed]">{selectedChat.unreadCount || 0}</p>
                    <p className="text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wide">Nao lidas</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-[#111] rounded-xl p-3 text-center">
                    <p className="text-lg text-gray-900 dark:text-[#ededed]">{selectedChat.isSaved ? 'Sim' : 'Nao'}</p>
                    <p className="text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wide">Salva</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-[#111] rounded-xl p-3 text-center">
                    <p className="text-lg text-gray-900 dark:text-[#ededed]">{selectedChat.windowActive ? 'Ativa' : 'Inativa'}</p>
                    <p className="text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wide">Janela</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-[#111] rounded-xl p-3 text-center">
                    <p className="text-[11px] text-gray-900 dark:text-[#ededed]">{formatTime(selectedChat.lastMessage?.messageTimestamp)}</p>
                    <p className="text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wide">Ultima msg</p>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wide block mb-2">Tags</label>
                  <div className="flex flex-wrap gap-1.5">
                    {allTags.map(tag => {
                      const contact = contactMap[selectedChat.remoteJid];
                      const active = (contact?.tags || []).some(t => t.tagId === tag.id);
                      return (
                        <button
                          key={tag.id}
                          onClick={() => active ? removeChatTag(selectedChat.remoteJid, tag.id) : saveChatTag(selectedChat.remoteJid, tag.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] transition-all"
                          style={{
                            color: active ? tag.color : '#9CA3AF',
                            backgroundColor: active ? `${tag.color}10` : 'transparent',
                            borderColor: active ? `${tag.color}20` : '#E5E7EB',
                          }}
                        >
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }}></span>
                          {tag.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedChat.lastMessage && (
                  <div className="bg-gray-50 dark:bg-[#111] rounded-xl p-3 mb-5">
                    <label className="text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wide block mb-1.5">Ultima mensagem</label>
                    <p className="text-xs text-gray-700 dark:text-[#ccc] mb-1">{getLastMessageText(selectedChat) || '-'}</p>
                    <div className="flex items-center gap-3 text-[10px] text-gray-300 dark:text-[#555]">
                      <span>{selectedChat.lastMessage.key?.fromMe ? 'Enviada por voce' : 'Recebida'}</span>
                      <span>{formatFullDate(selectedChat.lastMessage.messageTimestamp)}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2 mb-5">
                  <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-white/[0.06]">
                    <span className="text-[11px] text-gray-400 dark:text-[#666]">Telefone</span>
                    <span className="text-[11px] text-gray-700 dark:text-[#ccc]">{getDisplayPhone(selectedChat)}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-white/[0.06]">
                    <span className="text-[11px] text-gray-400 dark:text-[#666]">Remote JID</span>
                    <span className="text-[11px] text-gray-700 dark:text-[#ccc] font-mono">{selectedChat.remoteJid}</span>
                  </div>
                  {selectedChat.lastMessage?.key?.remoteJidAlt && (
                    <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-white/[0.06]">
                      <span className="text-[11px] text-gray-400 dark:text-[#666]">JID Alternativo</span>
                      <span className="text-[11px] text-gray-700 dark:text-[#ccc] font-mono">{selectedChat.lastMessage.key.remoteJidAlt}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-[11px] text-gray-400 dark:text-[#666]">Janela expira em</span>
                    <span className="text-[11px] text-gray-700 dark:text-[#ccc]">{formatFullDate(selectedChat.windowExpires)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-gray-100 dark:border-white/[0.06] px-5 py-3">
                <button
                  onClick={() => setSelectedChat(null)}
                  className="flex-1 px-3 py-2 text-xs text-gray-500 dark:text-[#808080] bg-gray-50 dark:bg-[#111] border border-gray-200/60 dark:border-white/[0.06] rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-all"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {showTagManager && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 animate-fade">
            <div className="bg-white dark:bg-[#141414] rounded-xl w-full max-w-sm overflow-hidden border border-gray-200/60 dark:border-white/[0.06] animate-scale p-5 relative">
              <button
                onClick={() => setShowTagManager(false)}
                className="absolute top-3 right-3 p-1 text-gray-400 dark:text-[#666] hover:text-gray-600 dark:hover:text-[#ccc] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] rounded-lg transition-colors"
              >
                <X size={15} />
              </button>

              <h3 className="text-sm text-gray-900 dark:text-[#ededed] mb-4">Gerenciar Tags</h3>

              {allTags.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wide mb-2">Tags existentes</p>
                  <div className="flex flex-wrap gap-1.5">
                    {allTags.map(tag => (
                      <span key={tag.id} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px]"
                        style={{ color: tag.color, backgroundColor: `${tag.color}10`, borderColor: `${tag.color}20` }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }}></span>
                        {tag.label}
                        {tag.isPreset ? null : (
                          <button onClick={() => deleteCustomTag(tag.id)} className="ml-0.5 hover:opacity-60">
                            <X size={10} />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-100 dark:border-white/[0.06] pt-4">
                <p className="text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wide mb-2">Criar nova tag</p>
                <div className="flex items-center gap-2">
                  <input
                    value={newTagName}
                    onChange={e => setNewTagName(e.target.value)}
                    placeholder="Nome da tag"
                    className="flex-1 px-3 py-2 text-xs border border-gray-200/80 dark:border-white/[0.06] rounded-lg outline-none focus:border-[var(--zelt-primary)]/40 transition-all"
                    onKeyDown={e => e.key === 'Enter' && addCustomTag()}
                  />
                  <input
                    type="color"
                    value={newTagColor}
                    onChange={e => setNewTagColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-gray-200 dark:border-white/[0.06] cursor-pointer"
                  />
                  <button
                    onClick={addCustomTag}
                    disabled={!newTagName.trim()}
                    className="px-3 py-2 text-xs text-white bg-[var(--zelt-primary)] rounded-lg hover:bg-[var(--zelt-primary-hover)] transition-colors disabled:opacity-40"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
