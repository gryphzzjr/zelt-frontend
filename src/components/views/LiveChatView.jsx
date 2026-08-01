import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Search, Info, Send, MessageSquare, Users, User, ChevronLeft,
  HelpCircle, Loader2, WifiOff, CheckCheck, Pencil,
  Copy, ExternalLink, X, Hash, MoreVertical, Trash2, Download,
  Play, Pause,
} from 'lucide-react';
import { useWhatsAppStatus } from '../../hooks/useWhatsAppStatus';
import { useAuth } from '../../contexts/AuthContext';
import { evolutionApi, chatApi } from '../../lib/api';

function getMediaUrl(mediaPath) {
  if (!mediaPath) return null;
  const token = localStorage.getItem('token');
  const base = import.meta.env.VITE_API_URL || 'https://zelt-backend-production.up.railway.app/api/v1';
  return `${base}${mediaPath}?token=${token}`;
}

function getPhone(chat) {
  const alt = chat.lastMessage?.key?.remoteJidAlt;
  if (alt && alt.includes('@s.whatsapp.net')) return alt.replace(/@.*/, '');
  const jid = chat.remoteJid || '';
  if (jid.includes('@s.whatsapp.net')) return jid.replace(/@.*/, '');
  return chat.phone || '';
}

function formatPhone(raw) {
  if (!raw) return '-';
  const d = raw.replace(/\D/g, '');
  if (d.startsWith('55') && d.length >= 12) {
    const ddd = d.substring(2, 4);
    const num = d.substring(4);
    if (num.length === 9) return `(${ddd}) ${num.substring(0, 5)}-${num.substring(5)}`;
    if (num.length === 8) return `(${ddd}) ${num.substring(0, 4)}-${num.substring(4)}`;
  }
  return d || raw;
}

function Avatar({ name, url, size = 36 }) {
  const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  if (url) return <img src={url} alt="" className="rounded-full shrink-0 object-cover" style={{ width: size, height: size }} loading="lazy" />;
  return (
    <div className="rounded-full shrink-0 bg-[var(--zelt-primary)]/10 flex items-center justify-center" style={{ width: size, height: size }}>
      <span className="text-[11px] font-medium text-[var(--zelt-primary)]">{initials}</span>
    </div>
  );
}

function formatTime(ts) {
  if (!ts) return '';
  const num = Number(ts);
  const d = new Date(num > 1e12 ? num : num * 1000);
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

function formatMsgDate(ts) {
  if (!ts) return '';
  const num = Number(ts);
  const d = new Date(num > 1e12 ? num : num * 1000);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.floor((today - msgDay) / 86400000);
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function formatMsgTime(ts) {
  if (!ts) return '';
  const num = Number(ts);
  const d = new Date(num > 1e12 ? num : num * 1000);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function getMsgText(msg) {
  if (!msg) return '';
  if (msg.isDeleted) return '';
  if (msg.messageText) return msg.messageText;
  const type = msg.messageType || '';
  const m = msg.messageData || {};
  if (type === 'conversation' && m.conversation) return m.conversation;
  if (type === 'extendedTextMessage' && m.extendedTextMessage?.text) return m.extendedTextMessage.text;
  if (type === 'imageMessage') return m.mediaPath ? '' : 'Foto';
  if (type === 'videoMessage') return m.mediaPath ? '' : 'Video';
  if (type === 'audioMessage') return m.mediaPath ? '' : 'Audio';
  if (type === 'documentMessage') return 'Documento';
  if (type === 'stickerMessage') return 'Figurinha';
  if (type === 'locationMessage') return 'Localizacao';
  if (type === 'contactMessage') return 'Contato';
  if (type === 'reactionMessage') return 'Reacao';
  if (type === 'protocolMessage') return '';
  return type || 'Mensagem';
}

function getLastText(chat) {
  const msg = chat.lastMessage;
  if (!msg) return '';
  const type = msg.messageType || '';
  const m = msg.message || {};
  if (m.conversation) return m.conversation;
  if (m.extendedTextMessage?.text) return m.extendedTextMessage.text;
  if (msg.messageData?.mediaPath) {
    if (type === 'imageMessage') return msg.messageText || '[Foto]';
    if (type === 'videoMessage') return msg.messageText || '[Video]';
    if (type === 'audioMessage') return msg.messageText || '[Audio]';
  }
  if (type === 'imageMessage') return 'Foto';
  if (type === 'videoMessage') return 'Video';
  if (type === 'audioMessage') return 'Audio';
  if (type === 'documentMessage') return 'Documento';
  if (type === 'stickerMessage') return 'Figurinha';
  return type || 'Mensagem';
}

function isGroup(jid) {
  return jid?.endsWith('@g.us');
}

function AudioPlayer({ src, fromMe }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const barRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      setProgress(audio.currentTime);
    };
    const onMeta = () => {
      setDuration(audio.duration || 0);
      setLoading(false);
    };
    const onEnd = () => {
      setPlaying(false);
      setProgress(0);
    };
    const onCanPlay = () => setLoading(false);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnd);
    audio.addEventListener('canplay', onCanPlay);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnd);
      audio.removeEventListener('canplay', onCanPlay);
    };
  }, []);

  const togglePlay = (e) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  };

  const seek = (e) => {
    e.stopPropagation();
    const audio = audioRef.current;
    const bar = barRef.current;
    if (!audio || !bar) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * (audio.duration || 0);
  };

  const fmt = (sec) => {
    if (!sec || !isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-2.5 min-w-[200px]">
      <audio ref={audioRef} src={src} preload="metadata" />

      <button onClick={togglePlay}
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors"
        style={{ backgroundColor: fromMe ? 'rgba(255,255,255,0.2)' : 'rgba(37,211,102,0.15)' }}>
        {playing ? (
          <Pause size={14} className={fromMe ? 'text-white' : 'text-[#25D366]'} />
        ) : (
          <Play size={14} className={fromMe ? 'text-white ml-0.5' : 'text-[#25D366] ml-0.5'} />
        )}
      </button>

      <div className="flex-1 flex flex-col gap-1">
        <div ref={barRef} onClick={seek}
          className="relative h-1.5 rounded-full cursor-pointer group"
          style={{ backgroundColor: fromMe ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)' }}>
          <div className="absolute inset-y-0 left-0 rounded-full transition-all"
            style={{
              width: `${pct}%`,
              backgroundColor: fromMe ? '#fff' : '#25D366',
            }} />
          <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              left: `calc(${pct}% - 6px)`,
              backgroundColor: fromMe ? '#fff' : '#25D366',
            }} />
        </div>
        <div className="flex justify-between">
          <span className={`text-[9px] ${fromMe ? 'text-white/60' : 'text-gray-400'}`}>
            {loading ? '...' : fmt(progress)}
          </span>
          <span className={`text-[9px] ${fromMe ? 'text-white/60' : 'text-gray-400'}`}>
            {loading ? '...' : fmt(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function LiveChatView({ onNavigate }) {
  const [chats, setChats] = useState([]);
  const [dbMeta, setDbMeta] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedJid, setSelectedJid] = useState(null);
  const [viewMessages, setViewMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [allTags, setAllTags] = useState([]);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [sseConnected, setSseConnected] = useState(false);
  const [chatFilter, setChatFilter] = useState('contacts');
  const [groupMembers, setGroupMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [searchInChat, setSearchInChat] = useState('');
  const [clearingChat, setClearingChat] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const { workspace } = useAuth();
  const instanceName = workspace?.instanceName;
  const { connected, instances, loading: waLoading } = useWhatsAppStatus(workspace?.id);

  const chatEndRef = useRef(null);
  const chatScrollRef = useRef(null);
  const sseRef = useRef(null);
  const selectedJidRef = useRef(null);
  const messagesRef = useRef(new Map());
  const chatsMapRef = useRef(new Map());
  const [, forceRender] = useState(0);

  useEffect(() => { selectedJidRef.current = selectedJid; }, [selectedJid]);

  const fetchProfilePics = useCallback(async (instName, contacts) => {
    const CONCURRENCY = 5;
    const toFetch = [...contacts];
    const dbUpdates = [];

    const processOne = async (contact) => {
      const phone = (contact.phone || contact.remoteJid.replace(/@.*/, '')).replace(/\D/g, '');
      if (!phone) return;
      try {
        const data = await evolutionApi.fetchProfilePicture(instName, phone);
        const url = data?.profilePictureUrl || data?.url || data?.base64 || (typeof data === 'string' ? data : null);
        if (url) {
          setChats(prev => prev.map(c => c.remoteJid === contact.remoteJid ? { ...c, profilePicUrl: url } : c));
          dbUpdates.push({ contactId: contact.id, profilePicUrl: url });
        }
      } catch (err) {
        console.warn('[LiveChat] fetchProfilePic failed for', phone, err?.message);
      }
    };

    while (toFetch.length > 0) {
      const batch = toFetch.splice(0, CONCURRENCY);
      await Promise.allSettled(batch.map(processOne));
    }

    if (dbUpdates.length > 0) {
      chatApi.batchUpdateProfilePics(dbUpdates).catch(() => {});
    }
  }, []);

  const fetchChats = useCallback(async () => {
    if (!instanceName) return;
    try {
      setLoading(true);

      const dbContacts = await chatApi.getContacts(instanceName).catch(() => []);
      const dbList = Array.isArray(dbContacts) ? dbContacts : [];

      const meta = {};
      dbList.forEach(c => { meta[c.remoteJid] = c; });
      setDbMeta(meta);

      const list = dbList
        .filter(c => c.pushName || c.customName)
        .map(c => ({
          id: c.id,
          remoteJid: c.remoteJid,
          pushName: c.pushName || null,
          profilePicUrl: c.profilePicUrl || null,
          phone: c.phone || null,
          customName: c.customName || null,
          tags: c.tags || [],
          lastMessage: c.messages?.[0] ? {
            remoteJid: c.remoteJid,
            messageType: c.messages[0].messageType,
            messageTimestamp: c.messages[0].messageTimestamp.toString(),
            fromMe: c.messages[0].fromMe,
            message: { conversation: c.messages[0].messageText },
          } : null,
        }));

      list.sort((a, b) => (b.lastMessage?.messageTimestamp || 0) - (a.lastMessage?.messageTimestamp || 0));

      const map = new Map();
      list.forEach(c => map.set(c.remoteJid, c));
      chatsMapRef.current = map;
      setChats(list);

      const withoutPic = list.filter(c => !c.profilePicUrl && c.remoteJid.includes('@s.whatsapp.net'));
      if (withoutPic.length > 0) {
        fetchProfilePics(instanceName, withoutPic);
      }
    } catch (err) {
      console.error('[LiveChat] fetchChats error:', err);
    } finally {
      setLoading(false);
    }
  }, [instanceName]);

  const fetchTags = useCallback(async () => {
    if (!instanceName) return;
    try {
      const data = await chatApi.getTags(instanceName);
      setAllTags(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[LiveChat] fetchTags error:', err);
    }
  }, [instanceName]);

  useEffect(() => {
    if (connected && instanceName) {
      fetchChats();
      fetchTags();
    }
  }, [connected, instanceName, fetchChats, fetchTags]);

  useEffect(() => {
    if (!instanceName) return;
    if (sseRef.current) sseRef.current.close();

    const es = chatApi.connectSSE(instanceName, (event, data) => {
      if (event === 'message.upsert') {
        const msg = data.message;
        const contact = data.contact;
        const jid = msg.remoteJid;

        if (!messagesRef.current.has(jid)) {
          messagesRef.current.set(jid, []);
        }
        const list = messagesRef.current.get(jid);

        const existingIdx = list.findIndex(m => m.keyId === msg.keyId);
        const realMsg = {
          id: msg.id,
          instanceName: msg.instanceName,
          remoteJid: msg.remoteJid,
          keyId: msg.keyId,
          fromMe: msg.fromMe,
          pushName: msg.pushName,
          messageType: msg.messageType,
          messageText: msg.messageText,
          messageData: msg.messageData || null,
          messageTimestamp: msg.messageTimestamp,
          status: msg.status,
          receivedAt: msg.receivedAt,
          isDeleted: msg.isDeleted || false,
        };

        if (existingIdx >= 0) {
          list[existingIdx] = realMsg;
        } else {
          list.push(realMsg);
        }
        list.sort((a, b) => Number(a.messageTimestamp || 0) - Number(b.messageTimestamp || 0));

        setDbMeta(prev => {
          const existing = prev[jid];
          return {
            ...prev,
            [jid]: {
              id: existing?.id || contact.id,
              remoteJid: jid,
              phone: existing?.phone || contact.phone,
              pushName: existing?.pushName || contact.pushName,
              customName: existing?.customName || contact.customName,
              profilePicUrl: existing?.profilePicUrl || contact.profilePicUrl,
              tags: existing?.tags || [],
            },
          };
        });

        setChats(prev => {
          const map = new Map(prev.map(c => [c.remoteJid, c]));
          const lastMsg = {
            remoteJid: jid,
            keyId: msg.keyId,
            fromMe: msg.fromMe,
            pushName: msg.pushName,
            messageType: msg.messageType,
            messageText: msg.messageText,
            messageTimestamp: msg.messageTimestamp,
          };
          if (map.has(jid)) {
            const existing = map.get(jid);
            map.set(jid, { ...existing, lastMessage: lastMsg, pushName: existing.pushName || msg.pushName });
          } else if (contact.pushName || contact.customName) {
            const newContact = {
              remoteJid: jid,
              pushName: msg.pushName || contact.pushName,
              profilePicUrl: contact.profilePicUrl,
              phone: contact.phone,
              customName: contact.customName,
              lastMessage: lastMsg,
            };
            map.set(jid, newContact);
            if (!contact.profilePicUrl && jid.includes('@s.whatsapp.net')) {
              const phone = (contact.phone || jid.replace(/@.*/, '')).replace(/\D/g, '');
              if (phone) {
                evolutionApi.fetchProfilePicture(instanceName, phone).then(data => {
                  const url = data?.profilePictureUrl || data?.url || data?.base64 || (typeof data === 'string' ? data : null);
                  if (url) {
                    setChats(prev => prev.map(c => c.remoteJid === jid ? { ...c, profilePicUrl: url } : c));
                  }
                }).catch(() => {});
              }
            }
          }
          return Array.from(map.values()).sort((a, b) => (b.lastMessage?.messageTimestamp || 0) - (a.lastMessage?.messageTimestamp || 0));
        });

        if (selectedJidRef.current === jid) {
          setViewMessages([...messagesRef.current.get(jid)]);
        }
      }

      if (event === 'message.status') {
        const { keyId, status } = data;
        for (const [jid, list] of messagesRef.current) {
          const idx = list.findIndex(m => m.keyId === keyId);
          if (idx >= 0) {
            list[idx] = { ...list[idx], status };
            if (selectedJidRef.current === jid) {
              setViewMessages([...list]);
            }
            break;
          }
        }
      }

      if (event === 'connection.update') {
        setSseConnected(data.state === 'open');
        if (data.state === 'open') fetchChats();
      }
    });

    sseRef.current = es;
    return () => es.close();
  }, [instanceName, fetchChats]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [viewMessages]);

  const selectedChat = chats.find(c => c.remoteJid === selectedJid);
  const selectedMeta = selectedJid ? dbMeta[selectedJid] : null;

  const displayName = selectedChat ? (selectedMeta?.customName || selectedChat.pushName || '') : '';
  const displayPhone = selectedChat ? formatPhone(selectedMeta?.phone || getPhone(selectedChat)) : '';

  const fetchMessages = useCallback(async (remoteJid) => {
    if (!instanceName || !remoteJid) return;
    try {
      const data = await chatApi.getMessages(instanceName, remoteJid, 500);
      const list = Array.isArray(data) ? data : [];
      const existing = messagesRef.current.get(remoteJid) || [];
      const existingIds = new Set(existing.map(m => m.keyId).filter(Boolean));
      const merged = [...list.filter(m => !existingIds.has(m.keyId)), ...existing];
      merged.sort((a, b) => Number(a.messageTimestamp) - Number(b.messageTimestamp));
      messagesRef.current.set(remoteJid, merged);
      setViewMessages([...merged]);
    } catch (err) {
      console.error('[LiveChat] fetchMessages error:', err);
    }
  }, [instanceName]);

  const fetchGroupMembers = useCallback(async (groupJid) => {
    if (!instanceName || !groupJid) return;
    try {
      setLoadingMembers(true);
      const data = await evolutionApi.findGroupParticipants(instanceName, groupJid);
      setGroupMembers(Array.isArray(data) ? data : data?.participants || []);
    } catch (err) {
      console.error('[LiveChat] fetchGroupMembers error:', err);
      setGroupMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  }, [instanceName]);

  const handleSelectContact = (chat) => {
    setSelectedJid(chat.remoteJid);
    setShowInfoPanel(false);
    setEditingName(false);
    setGroupMembers([]);
    const cached = messagesRef.current.get(chat.remoteJid);
    if (cached && cached.length > 0) {
      setViewMessages([...cached]);
    } else {
      setViewMessages([]);
      fetchMessages(chat.remoteJid);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMsg.trim() || !selectedChat || !instanceName) return;
    const phone = getPhone(selectedChat);
    const jid = selectedChat.remoteJid;
    if (!phone && !isGroup(jid)) return;
    const msgText = inputMsg.trim();
    const now = BigInt(Math.floor(Date.now() / 1000));
    const optId = `local-${Date.now()}`;
    const optimisticMsg = {
      id: optId,
      keyId: optId,
      instanceName,
      remoteJid: jid,
      fromMe: true,
      pushName: 'Voce',
      messageType: 'conversation',
      messageText: msgText,
      messageData: null,
      messageTimestamp: now.toString(),
      status: 'sending',
      receivedAt: new Date().toISOString(),
      _optimistic: true,
    };

    if (!messagesRef.current.has(jid)) {
      messagesRef.current.set(jid, []);
    }
    messagesRef.current.get(jid).push(optimisticMsg);
    setViewMessages([...messagesRef.current.get(jid)]);
    setInputMsg('');

    try {
      setSending(true);
      if (isGroup(jid)) {
        await evolutionApi.sendText(instanceName, jid, msgText);
      } else {
        await evolutionApi.sendText(instanceName, phone, msgText);
      }
      await chatApi.saveMessage({
        instanceName,
        remoteJid: jid,
        keyId: optId,
        fromMe: true,
        pushName: 'Voce',
        messageType: 'conversation',
        messageText: msgText,
        messageTimestamp: now.toString(),
        phone: phone || undefined,
      });
    } catch (err) {
      console.error('[LiveChat] sendText error:', err);
      const list = messagesRef.current.get(jid);
      if (list) {
        const idx = list.findIndex(m => m.id === optId);
        if (idx >= 0) list.splice(idx, 1);
        setViewMessages([...list]);
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  const handleChatScroll = () => {
    const el = chatScrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    setShowScrollBtn(!atBottom);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollBtn(false);
  };

  const handleClearChat = async () => {
    if (!selectedJid || !instanceName) return;
    setClearingChat(true);
    try {
      await chatApi.deleteMessages(instanceName, selectedJid);
      messagesRef.current.set(selectedJid, []);
      setViewMessages([]);
      setShowChatMenu(false);
    } catch (err) {
      console.error('[LiveChat] clearChat error:', err);
    } finally {
      setClearingChat(false);
    }
  };

  const handleExportChat = () => {
    const msgs = messagesRef.current.get(selectedJid) || [];
    const lines = msgs.map(m => {
      const time = new Date(Number(m.messageTimestamp) * 1000).toLocaleString('pt-BR');
      const sender = m.fromMe ? (m.pushName === 'Zelt.AI' ? 'Zelt.AI' : 'Voce') : (m.pushName || 'Cliente');
      const text = m.messageText || m.messageType || '';
      return `[${time}] ${sender}: ${text}`;
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversa_${selectedJid.replace(/@.*/, '')}_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setShowChatMenu(false);
  };

  const handleSaveName = async () => {
    if (!selectedMeta?.id) return;
    try {
      const val = nameInput.trim() || null;
      await chatApi.updateContactName(selectedMeta.id, val);
      setDbMeta(prev => ({ ...prev, [selectedJid]: { ...prev[selectedJid], customName: val } }));
      setEditingName(false);
    } catch (err) {
      console.error('[LiveChat] updateName error:', err);
    }
  };

  const handleToggleTag = async (tagId) => {
    if (!selectedMeta?.id) return;
    const current = (selectedMeta.tags || []).map(t => t.tagId);
    const next = current.includes(tagId) ? current.filter(id => id !== tagId) : [...current, tagId];
    try {
      await chatApi.setContactTags(selectedMeta.id, next);
      const tags = allTags.filter(t => next.includes(t.id)).map(t => ({ tagId: t.id, tag: t }));
      setDbMeta(prev => ({ ...prev, [selectedJid]: { ...prev[selectedJid], tags } }));
    } catch (err) {
      console.error('[LiveChat] setContactTags error:', err);
    }
  };

  const handleCopyText = (msg) => {
    const text = getMsgText(msg);
    if (text) navigator.clipboard.writeText(text);
  };

  const getWhatsAppLink = () => {
    if (!selectedChat) return null;
    if (isGroup(selectedChat.remoteJid)) return null;
    const phone = getPhone(selectedChat);
    if (!phone) return null;
    return `https://wa.me/${phone}`;
  };

  const filteredChats = chats.filter(c => {
    if (chatFilter === 'contacts' && isGroup(c.remoteJid)) return false;
    if (chatFilter === 'groups' && !isGroup(c.remoteJid)) return false;

    const meta = dbMeta[c.remoteJid];
    const name = (meta?.customName || c.pushName || '');
    if (chatFilter === 'contacts' && !name) return false;

    const q = searchQuery.toLowerCase();
    if (!q) return true;
    const phone = (meta?.phone || getPhone(c)).toLowerCase();
    const jid = (c.remoteJid || '').toLowerCase();
    return name.toLowerCase().includes(q) || phone.includes(q) || jid.includes(q);
  });

  const handleShowGroupMembers = () => {
    if (selectedChat && isGroup(selectedChat.remoteJid)) {
      setShowInfoPanel(true);
      fetchGroupMembers(selectedChat.remoteJid);
    }
  };

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
          <h1 className="text-xl text-gray-900 dark:text-[#ededed]">Live Chat</h1>
          <p className="text-xs text-gray-400 dark:text-[#666] mt-0.5">Atenda seus clientes em tempo real</p>
        </div>
        <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-12">
          <div className="flex flex-col items-center text-center max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
              <WifiOff size={24} className="text-amber-500" />
            </div>
            <h3 className="text-base text-gray-900 dark:text-[#ededed] mb-1.5">WhatsApp nao conectado</h3>
            <p className="text-sm text-gray-400 dark:text-[#666] leading-relaxed mb-5">
              Conecte um numero do WhatsApp para visualizar conversas.
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

  const isGroupSelected = selectedChat && isGroup(selectedChat.remoteJid);

  return (
    <>
      <style>{`
        .livechat-view * { font-family: 'DM Sans', system-ui, sans-serif; }
        .livechat-view .chat-scroll::-webkit-scrollbar { width: 4px; }
        .livechat-view .chat-scroll::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
        .livechat-view .msg-bubble { position: relative; }
        .livechat-view .msg-bubble:hover .msg-actions { opacity: 1; pointer-events: auto; }
        .livechat-view .msg-actions { opacity: 0; pointer-events: none; transition: opacity 150ms ease; }
        .dark .chat-scroll::-webkit-scrollbar-track { background: #111; }
        .dark .chat-scroll::-webkit-scrollbar-thumb { background: #333; }
      `}</style>
      <div className="livechat-view flex overflow-hidden text-gray-800 -m-8" style={{ width: 'calc(100vw - 256px)', height: 'calc(100vh - 128px)' }}>

        <section className="w-[340px] h-full border-r border-gray-200 dark:border-white/[0.06] flex flex-col shrink-0 overflow-hidden">
          <div className="p-3 pb-2">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#666]" />
              <input type="text" placeholder="Buscar conversa..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-[11px] border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#141414] text-gray-900 dark:text-[#ededed] placeholder-gray-400 dark:placeholder-[#555] outline-none focus:border-[var(--zelt-primary)]/40 transition-colors" />
            </div>
          </div>

          <div className="px-3 pb-2 flex items-center gap-1">
            <button onClick={() => setChatFilter('contacts')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] transition-colors border
                ${chatFilter === 'contacts' ? 'bg-[var(--zelt-primary)]/5 text-[var(--zelt-primary)] border-[var(--zelt-primary)]/10' : 'bg-white dark:bg-[#141414] text-gray-400 dark:text-[#666] border-gray-200 dark:border-white/[0.06] hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'}`}>
              <User size={11} />
              Contatos
            </button>
            <button onClick={() => setChatFilter('groups')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] transition-colors border
                ${chatFilter === 'groups' ? 'bg-[var(--zelt-primary)]/5 text-[var(--zelt-primary)] border-[var(--zelt-primary)]/10' : 'bg-white dark:bg-[#141414] text-gray-400 dark:text-[#666] border-gray-200 dark:border-white/[0.06] hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'}`}>
              <Users size={11} />
              Grupos
            </button>
            <div className="ml-auto flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${sseConnected ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              <span className="text-[8px] text-gray-400 dark:text-[#666]">{sseConnected ? 'Online' : 'Offline'}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto chat-scroll px-2 py-1 space-y-0.5">
            {loading && chats.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={16} className="text-gray-400 dark:text-[#666] animate-spin" />
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="text-center py-12 text-gray-400 dark:text-[#666] text-[11px]">
                {searchQuery ? 'Nenhum resultado' : chatFilter === 'groups' ? 'Nenhum grupo' : 'Nenhuma conversa'}
              </div>
            ) : (
              filteredChats.map((chat) => {
                const meta = dbMeta[chat.remoteJid];
                const isActive = selectedJid === chat.remoteJid;
                const name = meta?.customName || chat.pushName || 'Desconhecido';
                const phone = formatPhone(meta?.phone || getPhone(chat));
                const lastText = getLastText(chat);
                const lastFromMe = chat.lastMessage?.fromMe;
                const time = formatTime(chat.lastMessage?.messageTimestamp);
                const tags = (meta?.tags || []).map(t => t.tag).filter(Boolean);
                const isGrp = isGroup(chat.remoteJid);

                return (
                  <div key={chat.remoteJid} onClick={() => handleSelectContact(chat)}
                    className={`group p-2.5 rounded-lg cursor-pointer transition-colors relative flex gap-2.5 items-start border
                      ${isActive ? 'bg-[var(--zelt-primary)]/[0.03] border-[var(--zelt-primary)]/10' : 'border-transparent hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'}`}>
                    <div className="relative shrink-0">
                      {isGrp ? (
                        <div className="w-9 h-9 rounded-full bg-[var(--zelt-primary)]/10 flex items-center justify-center">
                          <Users size={14} className="text-[var(--zelt-primary)]" />
                        </div>
                      ) : (
                        <Avatar name={name} url={meta?.profilePicUrl || chat.profilePicUrl} size={36} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="text-[11px] text-gray-900 dark:text-[#ededed] truncate">{name}</h4>
                        <span className="text-[9px] text-gray-400 dark:text-[#666] shrink-0">{time}</span>
                      </div>
                      <p className="text-[10px] truncate mb-1.5 text-gray-400 dark:text-[#666]">
                        {lastFromMe && <span className="text-[var(--zelt-primary)]">Voce: </span>}
                        {lastText || 'Sem mensagens'}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] text-gray-400 dark:text-[#666] truncate">{isGrp ? `${chat.participantCount || ''}` : phone}</span>
                        <div className="flex items-center gap-1">
                          {tags.slice(0, 2).map(t => (
                            <span key={t.id} className="text-[7px] px-1 py-0.5 rounded border"
                              style={{ color: t.color, backgroundColor: `${t.color}10`, borderColor: `${t.color}20` }}>
                              {t.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mx-3 mb-3 p-2.5 rounded-lg bg-[var(--zelt-primary)]/[0.03] border border-[var(--zelt-primary)]/10">
            <div className="flex items-center gap-1.5 mb-1">
              <HelpCircle size={10} className="text-[var(--zelt-primary)]" />
              <span className="text-[9px] text-[var(--zelt-primary)] uppercase tracking-wider">Chat ao vivo</span>
            </div>
            <p className="text-[9px] text-gray-500 dark:text-[#808080] leading-relaxed">
              Selecione uma conversa para atender o cliente em tempo real.
            </p>
          </div>
        </section>

        <section className="flex-1 h-full flex flex-col overflow-hidden min-w-0">
          {!selectedChat ? (
            <div className="flex-1 h-full flex flex-col items-center justify-center p-8">
              <div className="w-14 h-14 rounded-2xl bg-[var(--zelt-primary)]/5 flex items-center justify-center text-[var(--zelt-primary)] mb-4">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-sm text-gray-900 dark:text-[#ededed] mb-1">Nenhuma conversa selecionada</h3>
              <p className="text-[11px] text-gray-400 dark:text-[#666] text-center max-w-[280px] leading-relaxed mb-5">
                Selecione um contato na lista ao lado.
              </p>
              <div className="flex items-center gap-5 text-[10px] text-gray-400 dark:text-[#666]">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-md bg-[var(--zelt-primary)]/5 flex items-center justify-center"><Users size={11} className="text-[var(--zelt-primary)]" /></div>
                  <span>{chats.length} contatos</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              <header className="h-[56px] border-b border-gray-200 dark:border-white/[0.06] px-5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  {isGroupSelected ? (
                    <div className="w-8 h-8 rounded-full bg-[var(--zelt-primary)]/10 flex items-center justify-center shrink-0">
                      <Users size={14} className="text-[var(--zelt-primary)]" />
                    </div>
                  ) : (
                    <Avatar name={displayName} url={selectedMeta?.profilePicUrl || selectedChat.profilePicUrl} size={32} />
                  )}
                  <div className="min-w-0">
                    {editingName ? (
                      <div className="flex items-center gap-1">
                        <input autoFocus value={nameInput} onChange={e => setNameInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                          className="text-[12px] text-gray-900 dark:text-[#ededed] border-b border-[var(--zelt-primary)]/40 outline-none bg-transparent px-0 py-0.5" />
                        <button onClick={handleSaveName} className="text-[10px] text-[var(--zelt-primary)]">Ok</button>
                        <button onClick={() => setEditingName(false)} className="text-[10px] text-gray-400 dark:text-[#666]">X</button>
                      </div>
                    ) : (
                      <h2 className="text-[12px] text-gray-900 dark:text-[#ededed] truncate flex items-center gap-1 cursor-pointer" onClick={() => { setEditingName(true); setNameInput(displayName); }}>
                        {displayName || 'Definir nome'}
                        {!isGroupSelected && <Pencil size={10} className="text-gray-400 dark:text-[#666] shrink-0" />}
                      </h2>
                    )}
                    <p className="text-[10px] text-gray-400 dark:text-[#666] truncate">{isGroupSelected ? 'Grupo' : displayPhone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {getWhatsAppLink() && (
                    <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] text-[#25D366] bg-[#25D366]/5 border border-[#25D366]/20 hover:bg-[#25D366]/10 transition-colors">
                      <ExternalLink size={12} />
                      WhatsApp
                    </a>
                  )}
                  {isGroupSelected && (
                    <button onClick={handleShowGroupMembers}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] border transition-colors
                        ${showInfoPanel ? 'bg-[var(--zelt-primary)]/5 border-[var(--zelt-primary)]/10 text-[var(--zelt-primary)]' : 'border-gray-200 dark:border-white/[0.06] text-gray-400 dark:text-[#666] hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'}`}>
                      <Users size={12} />
                      Membros
                    </button>
                  )}
                  {!isGroupSelected && (
                    <button onClick={() => setShowInfoPanel(!showInfoPanel)}
                      className={`p-1.5 rounded-lg border transition-colors ${showInfoPanel ? 'bg-[var(--zelt-primary)]/5 border-[var(--zelt-primary)]/10 text-[var(--zelt-primary)]' : 'border-gray-200 dark:border-white/[0.06] text-gray-400 dark:text-[#666] hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'}`}>
                      <Info size={14} />
                    </button>
                  )}
                  <div className="relative">
                    <button onClick={() => setShowChatMenu(!showChatMenu)}
                      className="p-1.5 rounded-lg border border-gray-200 dark:border-white/[0.06] text-gray-400 dark:text-[#666] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                      <MoreVertical size={14} />
                    </button>
                    {showChatMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowChatMenu(false)} />
                        <div className="absolute right-0 top-full mt-1 z-50 w-52 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl shadow-lg py-1 overflow-hidden">
                          <button onClick={() => { setSearchInChat(searchInChat ? '' : '__OPEN__'); setShowChatMenu(false); }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[11px] text-gray-700 dark:text-[#ccc] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                            <Search size={13} />
                            Buscar na conversa
                          </button>
                          <button onClick={handleExportChat}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[11px] text-gray-700 dark:text-[#ccc] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                            <Download size={13} />
                            Exportar conversa
                          </button>
                          <div className="border-t border-gray-100 dark:border-white/[0.06] my-1" />
                          <button onClick={handleClearChat} disabled={clearingChat}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[11px] text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50">
                            {clearingChat ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                            Limpar historico
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </header>

              {searchInChat !== '' && (
                <div className="px-5 py-2 border-b border-gray-200 dark:border-white/[0.06] flex items-center gap-2">
                  <Search size={13} className="text-gray-400 dark:text-[#666] shrink-0" />
                  <input autoFocus type="text" placeholder="Buscar mensagem..." value={searchInChat === '__OPEN__' ? '' : searchInChat}
                    onChange={(e) => setSearchInChat(e.target.value || '__OPEN__')}
                    className="flex-1 text-[11px] text-gray-900 dark:text-[#ededed] placeholder-gray-400 dark:placeholder-[#555] bg-transparent outline-none" />
                  <button onClick={() => setSearchInChat('')} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#1a1a1a] text-gray-400 dark:text-[#666]">
                    <X size={13} />
                  </button>
                </div>
              )}

              <div ref={chatScrollRef} onScroll={handleChatScroll} className="flex-1 overflow-y-auto chat-scroll px-5 py-3 space-y-2.5 relative">
                {viewMessages.length === 0 ? (
                  <div className="flex items-center justify-center py-12 text-gray-400 dark:text-[#666] text-[11px]">
                    Nenhuma mensagem nesta conversa
                  </div>
                ) : (
                  viewMessages
                    .filter(msg => {
                      if (!searchInChat || searchInChat === '__OPEN__') return true;
                      const text = getMsgText(msg) || '';
                      return text.toLowerCase().includes(searchInChat.toLowerCase());
                    })
                    .map((msg, index, arr) => {
                    const fromMe = msg.fromMe;
                    const isDeleted = msg.isDeleted;
                    const text = getMsgText(msg);
                    if (!text && !isDeleted && msg.messageType === 'protocolMessage') return null;
                    const time = formatMsgTime(msg.messageTimestamp);
                    const date = formatMsgDate(msg.messageTimestamp);
                    const isFirstOfGroup = index === 0 || formatMsgDate(arr[index - 1].messageTimestamp) !== date;

                    if (isDeleted) {
                      return (
                        <div key={msg.id || msg.keyId || index} className="w-full flex flex-col">
                          {isFirstOfGroup && (
                            <div className="flex items-center justify-center my-3">
                              <span className="bg-gray-100 dark:bg-[#1a1a1a] text-gray-500 dark:text-[#808080] text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">{date}</span>
                            </div>
                          )}
                          <div className={`flex w-full mb-0.5 ${fromMe ? 'justify-end' : 'justify-start'}`}>
                            <div className="max-w-[65%] rounded-2xl px-3 py-2 bg-gray-100/60 dark:bg-[#1e2a33]/40">
                              <p className="text-[12px] italic text-gray-400 dark:text-[#555] text-center">Mensagem excluida</p>
                              <div className="flex items-center justify-end gap-1 mt-1">
                                <span className="text-[10px] text-gray-300 dark:text-[#444]">{time}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={msg.id || msg.keyId || index} className="w-full flex flex-col">
                        {isFirstOfGroup && (
                          <div className="flex items-center justify-center my-3">
                            <span className="bg-gray-100 dark:bg-[#1a1a1a] text-gray-500 dark:text-[#808080] text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">{date}</span>
                          </div>
                        )}
                        <div className={`flex w-full mb-0.5 ${fromMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`msg-bubble max-w-[65%] rounded-2xl px-3 py-2 relative
                            ${!fromMe ? 'bg-gray-100 dark:bg-[#1e2a33] text-gray-900 dark:text-[#e4e4e7] rounded-bl-sm' : ''}
                            ${fromMe && msg.pushName !== 'Zelt.AI' ? 'bg-[var(--zelt-primary)] text-white rounded-br-sm' : ''}
                            ${fromMe && msg.pushName === 'Zelt.AI' ? 'bg-indigo-500 text-white rounded-br-sm' : ''}`}
                          >
                            {!fromMe && isGroupSelected && (
                              <p className="text-[10px] text-[var(--zelt-primary)] font-medium mb-0.5">{msg.pushName || 'Membro'}</p>
                            )}
                            {!fromMe && !isGroupSelected && (
                              <p className="text-[10px] text-gray-400 dark:text-[#666] mb-0.5">{msg.pushName || 'Cliente'}</p>
                            )}
                            {fromMe && msg.pushName === 'Zelt.AI' && (
                              <div className="flex items-center gap-1 mb-0.5">
                                <span className="text-[9px] font-medium text-indigo-200 uppercase tracking-wide">Zelt.AI</span>
                              </div>
                            )}
                            {fromMe && msg.pushName !== 'Zelt.AI' && (
                              <div className="text-[9px] text-white/50 uppercase tracking-wide mb-0.5">Voce</div>
                            )}
                            {msg.messageData?.mediaPath && msg.messageType === 'imageMessage' && (
                              <a href={getMediaUrl(msg.messageData.mediaPath)} target="_blank" rel="noopener noreferrer" className="block mb-1">
                                <img src={getMediaUrl(msg.messageData.mediaPath)} alt="Foto" className="rounded-lg max-w-full max-h-[280px] object-cover border border-white/10" loading="lazy" />
                              </a>
                            )}
                            {msg.messageData?.mediaPath && msg.messageType === 'videoMessage' && (
                              <div className="mb-1">
                                <video src={getMediaUrl(msg.messageData.mediaPath)} controls className="rounded-lg max-w-full max-h-[280px] border border-white/10" preload="metadata" />
                              </div>
                            )}
                            {msg.messageData?.mediaPath && msg.messageType === 'audioMessage' && (
                              <div className="mb-1">
                                <AudioPlayer src={getMediaUrl(msg.messageData.mediaPath)} fromMe={fromMe} />
                              </div>
                            )}
                            {text && <p className="text-[13px] leading-[1.4] whitespace-pre-wrap break-words">{text}</p>}
                            <div className={`flex items-center justify-end gap-1 mt-1 ${fromMe && msg.pushName !== 'Zelt.AI' ? 'text-white/50' : fromMe && msg.pushName === 'Zelt.AI' ? 'text-indigo-200' : 'text-gray-400 dark:text-[#666]'}`}>
                              <span className="text-[10px]">{time}</span>
                              {fromMe && <CheckCheck size={11} />}
                              {fromMe && msg.status === 'sending' && <Loader2 size={9} className="animate-spin" />}
                            </div>

                            <div className="msg-actions absolute top-0 -translate-y-1/2 flex items-center gap-0.5 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg px-0.5 py-0.5 z-10 shadow-sm"
                              style={{ [fromMe ? 'right' : 'left']: '0' }}>
                              <button onClick={(e) => { e.stopPropagation(); handleCopyText(msg); }}
                                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-[#222] text-gray-400 dark:text-[#666] hover:text-gray-600 dark:hover:text-[#ccc] transition-colors"
                                title="Copiar">
                                <Copy size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
                {showScrollBtn && (
                  <button onClick={scrollToBottom}
                    className="sticky bottom-2 left-1/2 -translate-x-1/2 ml-auto mr-auto z-10 w-8 h-8 rounded-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/[0.06] shadow-md flex items-center justify-center text-gray-500 dark:text-[#808080] hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                    <ChevronLeft size={14} className="rotate-[-90deg]" />
                  </button>
                )}
              </div>

              <footer className="p-3 border-t border-gray-200 dark:border-white/[0.06] shrink-0">
                <form onSubmit={handleSendMessage} className="border border-gray-200 dark:border-white/[0.06] rounded-xl focus-within:border-[var(--zelt-primary)]/40 transition-colors bg-white dark:bg-[#141414] overflow-hidden p-2">
                  <textarea rows={2} placeholder="Digite uma mensagem..." value={inputMsg} onChange={(e) => setInputMsg(e.target.value)} onKeyDown={handleKeyDown}
                    className="w-full text-[11px] text-gray-900 dark:text-[#ededed] placeholder-gray-400 dark:placeholder-[#555] bg-transparent resize-none outline-none px-1.5 pt-0.5 leading-relaxed" />
                  <div className="flex items-center justify-end pt-1.5 border-t border-gray-50 dark:border-t-white/[0.06] mt-1 px-1">
                    <button type="submit" disabled={!inputMsg.trim() || sending}
                      className={`px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1 transition-colors ${inputMsg.trim() && !sending ? 'bg-[var(--zelt-primary)] text-white hover:bg-[var(--zelt-primary-hover)]' : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-400 dark:text-[#666] cursor-not-allowed'}`}>
                      {sending ? <Loader2 size={10} className="animate-spin" /> : <Send size={10} />}
                      Enviar
                    </button>
                  </div>
                </form>
              </footer>
            </>
          )}
        </section>

        {selectedChat && showInfoPanel && (
          <aside className="w-[260px] h-full border-l border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#141414] flex flex-col shrink-0 overflow-hidden">
            <div className="p-3 border-b border-gray-100 dark:border-white/[0.06] flex items-center justify-between">
              <h3 className="text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-wider">
                {isGroupSelected ? 'Membros do grupo' : 'Informacoes'}
              </h3>
              <button onClick={() => { setShowInfoPanel(false); setGroupMembers([]); }} className="text-gray-400 dark:text-[#666] hover:text-gray-600 dark:hover:text-[#ccc] p-0.5"><X size={12} /></button>
            </div>

            {isGroupSelected ? (
              <div className="flex-1 overflow-y-auto">
                {loadingMembers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={14} className="text-gray-400 dark:text-[#666] animate-spin" />
                  </div>
                ) : groupMembers.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 dark:text-[#666] text-[11px]">
                    Nenhum membro encontrado
                  </div>
                ) : (
                  <div className="p-2">
                    <p className="px-2 py-1 text-[9px] text-gray-400 dark:text-[#666] uppercase tracking-wider">{groupMembers.length} membros</p>
                    {groupMembers.map((member, i) => {
                      const phone = member.id?.replace(/@.*/, '') || '';
                      const name = member.pushName || member.name || formatPhone(phone);
                      return (
                        <div key={member.id || i} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                          <Avatar name={name} size={30} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-gray-900 dark:text-[#ededed] truncate">{name}</p>
                            <p className="text-[9px] text-gray-400 dark:text-[#666] truncate">{formatPhone(phone)}</p>
                          </div>
                          {member.admin === 'admin' && (
                            <span className="text-[7px] px-1.5 py-0.5 rounded bg-[var(--zelt-primary)]/10 text-[var(--zelt-primary)]">Admin</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="p-4 flex flex-col items-center text-center border-b border-gray-50 dark:border-b-white/[0.06]">
                  <Avatar name={displayName} url={selectedMeta?.profilePicUrl || selectedChat.profilePicUrl} size={48} />
                  <h4 className="text-[11px] text-gray-900 dark:text-[#ededed] mt-2">{displayName || 'Desconhecido'}</h4>
                  <p className="text-[10px] text-gray-400 dark:text-[#666] mt-0.5">{displayPhone}</p>
                  {getWhatsAppLink() && (
                    <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] text-[#25D366] bg-[#25D366]/5 border border-[#25D366]/20 hover:bg-[#25D366]/10 transition-colors">
                      <ExternalLink size={10} />
                      Abrir no WhatsApp
                    </a>
                  )}
                </div>

                <div className="p-3 space-y-3 text-[11px] overflow-y-auto flex-1">
                  <div>
                    <span className="text-[8px] text-gray-400 dark:text-[#666] uppercase block mb-1">Tags</span>
                    <div className="flex flex-wrap gap-1">
                      {allTags.map(tag => {
                        const active = (selectedMeta?.tags || []).some(t => t.tagId === tag.id);
                        return (
                          <button key={tag.id} onClick={() => handleToggleTag(tag.id)}
                            className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[9px] transition-all"
                            style={{
                              color: active ? tag.color : '#9CA3AF',
                              backgroundColor: active ? `${tag.color}10` : 'transparent',
                              borderColor: active ? `${tag.color}20` : '#E5E7EB',
                            }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }}></span>
                            {tag.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-white/[0.06]">
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[9px] text-gray-400 dark:text-[#666]">Telefone</span>
                      <span className="text-[9px] text-gray-700 dark:text-[#ccc]">{displayPhone}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[9px] text-gray-400 dark:text-[#666]">Remote JID</span>
                      <span className="text-[9px] text-gray-700 dark:text-[#ccc] font-mono truncate max-w-[140px]">{selectedChat.remoteJid}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </aside>
        )}
      </div>
    </>
  );
}
