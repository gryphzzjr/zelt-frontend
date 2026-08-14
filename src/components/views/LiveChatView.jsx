import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Search, Info, Send, MessageSquare, Users, User, ChevronLeft, ArrowLeft,
  HelpCircle, Loader2, WifiOff, CheckCheck, Pencil,
  Copy, ExternalLink, X, Hash, MoreVertical, Trash2, Download,
  Play, Pause, UserPlus, AlertTriangle,
  FileText, MapPin, Image as ImageIcon, Film, Mic,
} from 'lucide-react';
import { useWhatsAppStatus } from '../../hooks/useWhatsAppStatus';
import { useAuth } from '../../contexts/AuthContext';
import { evolutionApi, chatApi } from '../../lib/api';

function getMediaUrl(mediaPath) {
  if (!mediaPath) return null;
  const token = localStorage.getItem('token');
  const base = import.meta.env.VITE_API_URL || '/api/v1';
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

function normalizePhone(raw) {
  let d = (raw || '').replace(/\D/g, '');
  if (d.startsWith('0')) d = d.slice(1);
  if (!d.startsWith('55')) d = `55${d}`;
  return d;
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
  if (type === 'documentMessage') return msg.messageText || 'Documento';
  if (type === 'imageMessage') return msg.messageText || 'Foto';
  if (type === 'videoMessage') return msg.messageText || 'Video';
  if (type === 'audioMessage') return msg.messageText || 'Audio';
  if (type === 'stickerMessage') return 'Figurinha';
  if (type === 'locationMessage') return 'Localizacao';
  if (type === 'contactMessage') return 'Contato';
  return type || 'Mensagem';
}

function isGroup(jid) {
  return jid?.endsWith('@g.us');
}

function msgTimeKey(m) {
  if (!m) return 0;
  if (m.receivedAt) return new Date(m.receivedAt).getTime();
  const ts = Number(m.messageTimestamp || 0);
  return ts > 1e12 ? ts : ts * 1000;
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

function MediaUnavailable({ label, icon, fromMe }) {
  return (
    <div className="flex items-center gap-2 mb-1 px-3 py-2 rounded min-w-[160px]"
      style={{ backgroundColor: fromMe ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)' }}>
      {icon || <FileText size={14} className={fromMe ? 'text-white/60' : 'text-gray-400'} />}
      <span className={`text-[11px] ${fromMe ? 'text-white/60' : 'text-gray-400'}`}>{label}</span>
    </div>
  );
}

function DocumentCard({ fileName, url, fromMe }) {
  const name = fileName || 'Documento';
  const inner = (
    <div className="flex items-center gap-2.5 mb-1 px-3 py-2 rounded min-w-[200px]"
      style={{ backgroundColor: fromMe ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)' }}>
      <div className="w-8 h-8 rounded flex items-center justify-center shrink-0"
        style={{ backgroundColor: fromMe ? 'rgba(255,255,255,0.2)' : 'rgba(37,211,102,0.15)' }}>
        <FileText size={15} className={fromMe ? 'text-white' : 'text-[#25D366]'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[11px] font-medium truncate ${fromMe ? 'text-white' : 'text-gray-900 dark:text-[#e4e4e7]'}`}>{name}</p>
        <p className={`text-[9px] ${fromMe ? 'text-white/60' : 'text-gray-400'}`}>{url ? 'Toque para baixar' : 'Download indisponivel'}</p>
      </div>
      {url && <Download size={13} className={`shrink-0 ${fromMe ? 'text-white/70' : 'text-gray-400'}`} />}
    </div>
  );
  return url ? (
    <a href={url} target="_blank" rel="noopener noreferrer" download className="block">{inner}</a>
  ) : inner;
}

function StickerImage({ url, fromMe }) {
  if (!url) return <MediaUnavailable label="Figurinha" fromMe={fromMe} />;
  return <img src={url} alt="Figurinha" className="w-32 h-32 object-contain mb-1" loading="lazy" />;
}

function LocationCard({ location, fromMe }) {
  const lat = location?.degreesLatitude;
  const lng = location?.degreesLongitude;
  const name = location?.name;
  const address = location?.address;
  const mapsUrl = (lat != null && lng != null)
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : (location?.url || null);
  const label = name || address || (lat != null && lng != null ? `${lat}, ${lng}` : 'Localizacao');
  const inner = (
    <div className="flex items-center gap-2.5 mb-1 px-3 py-2 rounded min-w-[200px]"
      style={{ backgroundColor: fromMe ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)' }}>
      <div className="w-8 h-8 rounded flex items-center justify-center shrink-0"
        style={{ backgroundColor: fromMe ? 'rgba(255,255,255,0.2)' : 'rgba(37,211,102,0.15)' }}>
        <MapPin size={15} className={fromMe ? 'text-white' : 'text-[#25D366]'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[11px] font-medium truncate ${fromMe ? 'text-white' : 'text-gray-900 dark:text-[#e4e4e7]'}`}>{label}</p>
        {address && name !== address && (
          <p className={`text-[9px] truncate ${fromMe ? 'text-white/60' : 'text-gray-400'}`}>{address}</p>
        )}
      </div>
      {mapsUrl && <ExternalLink size={12} className={`shrink-0 ${fromMe ? 'text-white/70' : 'text-gray-400'}`} />}
    </div>
  );
  return mapsUrl ? (
    <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="block">{inner}</a>
  ) : inner;
}

function ContactCard({ contact, fromMe }) {
  const vcardName = contact?.vcard?.split('\n').find(l => l.startsWith('FN:'))?.slice(3)?.trim() || '';
  const name = contact?.displayName || vcardName || 'Contato';
  const phone = contact?.vcard?.match(/TEL[^:]*:([+\d\s()-]+)/)?.[1]?.trim() || '';
  return (
    <div className="flex items-center gap-2.5 mb-1 px-3 py-2 rounded min-w-[200px]"
      style={{ backgroundColor: fromMe ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)' }}>
      <div className="w-8 h-8 rounded flex items-center justify-center shrink-0"
        style={{ backgroundColor: fromMe ? 'rgba(255,255,255,0.2)' : 'rgba(37,211,102,0.15)' }}>
        <User size={15} className={fromMe ? 'text-white' : 'text-[#25D366]'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[11px] font-medium truncate ${fromMe ? 'text-white' : 'text-gray-900 dark:text-[#e4e4e7]'}`}>{name}</p>
        {phone && <p className={`text-[9px] truncate ${fromMe ? 'text-white/60' : 'text-gray-400'}`}>{phone}</p>}
      </div>
    </div>
  );
}

export default function LiveChatView({ onNavigate, fullscreen = false, onBack }) {
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
  const [showNewContact, setShowNewContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', message: '' });
  const [newContactSaving, setNewContactSaving] = useState(false);
  const [newContactError, setNewContactError] = useState('');

  const { user } = useAuth();
  const instanceName = user?.instanceName;
  const { connected, instances, loading: waLoading } = useWhatsAppStatus();

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
        .filter(c => (c.pushName || c.customName) || (c.messages?.[0]))
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
            receivedAt: c.messages[0].receivedAt,
            message: { conversation: c.messages[0].messageText },
          } : null,
        }));

      list.sort((a, b) => msgTimeKey(b.lastMessage) - msgTimeKey(a.lastMessage));

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
        list.sort((a, b) => msgTimeKey(a) - msgTimeKey(b));

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
            receivedAt: msg.receivedAt,
          };
          if (map.has(jid)) {
            const existing = map.get(jid);
            map.set(jid, { ...existing, lastMessage: lastMsg, pushName: existing.pushName || (!msg.fromMe ? msg.pushName : null) });
          } else {
            const newContact = {
              remoteJid: jid,
              pushName: msg.fromMe ? (contact.pushName || null) : (msg.pushName || contact.pushName),
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
          return Array.from(map.values()).sort((a, b) => msgTimeKey(b.lastMessage) - msgTimeKey(a.lastMessage));
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

  const clientNumberMap = useMemo(() => {
    const map = {};
    let n = 1;
    for (const c of chats) {
      if (isGroup(c.remoteJid)) continue;
      const meta = dbMeta[c.remoteJid];
      if (!meta?.customName && !c.pushName) map[c.remoteJid] = n++;
    }
    return map;
  }, [chats, dbMeta]);

  const getContactName = (chat, meta) => {
    if (meta?.customName) return meta.customName;
    if (chat?.pushName) return chat.pushName;
    if (isGroup(chat?.remoteJid)) return 'Grupo';
    const num = clientNumberMap[chat?.remoteJid];
    return num ? `Cliente ${num}` : 'Desconhecido';
  };

  const displayName = selectedChat ? getContactName(selectedChat, selectedMeta) : '';
  const displayPhone = selectedChat ? formatPhone(selectedMeta?.phone || getPhone(selectedChat)) : '';

  const fetchMessages = useCallback(async (remoteJid) => {
    if (!instanceName || !remoteJid) return;
    try {
      const data = await chatApi.getMessages(instanceName, remoteJid, 500);
      const list = Array.isArray(data) ? data : [];
      const existing = messagesRef.current.get(remoteJid) || [];
      const existingIds = new Set(existing.map(m => m.keyId).filter(Boolean));
      const merged = [...list.filter(m => !existingIds.has(m.keyId)), ...existing];
      merged.sort((a, b) => msgTimeKey(a) - msgTimeKey(b));
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

  const handleCreateContact = async (e) => {
    if (e) e.preventDefault();
    const number = normalizePhone(newContact.phone);
    if (!number || number.replace(/\D/g, '').length < 12) {
      setNewContactError('Informe um numero de telefone valido com DDD.');
      return;
    }
    if (newContactSaving) return;

    setNewContactSaving(true);
    setNewContactError('');

    const name = newContact.name.trim();
    const msg = newContact.message.trim();
    const jid = `${number}@s.whatsapp.net`;

    try {
      await chatApi.createContact(instanceName, {
        phone: number,
        customName: name || null,
        pushName: name || null,
      });

      if (msg) {
        await evolutionApi.sendText(instanceName, number, msg);
        const now = BigInt(Math.floor(Date.now() / 1000));
        const keyId = `local-${Date.now()}`;
        const saved = {
          id: keyId,
          keyId,
          instanceName,
          remoteJid: jid,
          fromMe: true,
          pushName: 'Voce',
          messageType: 'conversation',
          messageText: msg,
          messageData: null,
          messageTimestamp: now.toString(),
          status: 'sent',
          receivedAt: new Date().toISOString(),
        };
        if (!messagesRef.current.has(jid)) messagesRef.current.set(jid, []);
        messagesRef.current.get(jid).push(saved);
        try {
          await chatApi.saveMessage({
            instanceName,
            remoteJid: jid,
            keyId,
            fromMe: true,
            pushName: 'Voce',
            messageType: 'conversation',
            messageText: msg,
            messageTimestamp: now.toString(),
            phone: number,
          });
        } catch (err) {
          console.warn('[LiveChat] createContact saveMessage error:', err);
        }
      }

      setShowNewContact(false);
      setNewContact({ name: '', phone: '', message: '' });
      setChatFilter('contacts');
      setSearchQuery('');
      setShowInfoPanel(false);
      setEditingName(false);
      setGroupMembers([]);
      setSelectedJid(jid);
      if (messagesRef.current.has(jid) && messagesRef.current.get(jid).length > 0) {
        setViewMessages([...messagesRef.current.get(jid)]);
      } else {
        setViewMessages([]);
        fetchMessages(jid);
      }
      await fetchChats();
    } catch (err) {
      console.error('[LiveChat] createContact error:', err);
      setNewContactError('Nao foi possivel criar o contato. Verifique o numero e tente novamente.');
    } finally {
      setNewContactSaving(false);
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
    const name = getContactName(c, meta);
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
        <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded p-12">
          <div className="flex flex-col items-center text-center max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-lg bg-amber-50 flex items-center justify-center mb-4">
              <WifiOff size={24} className="text-amber-500" />
            </div>
            <h3 className="text-base text-gray-900 dark:text-[#ededed] mb-1.5">WhatsApp nao conectado</h3>
            <p className="text-sm text-gray-400 dark:text-[#666] leading-relaxed mb-5">
              Conecte um numero do WhatsApp para visualizar conversas.
            </p>
            <button
              onClick={() => onNavigate?.('integracoes/whatsapp')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm text-white bg-[#25D366] hover:bg-[#1fb855] rounded transition-colors"
            >
              Conectar WhatsApp
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isGroupSelected = selectedChat && isGroup(selectedChat.remoteJid);
  const groupChatCount = chats.filter((c) => isGroup(c.remoteJid)).length;

  return (
    <>
      <style>{`
        .livechat-view .chat-scroll::-webkit-scrollbar { width: 5px; }
        .livechat-view .chat-scroll::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
        .livechat-view .msg-bubble { position: relative; }
        .livechat-view .msg-bubble:hover .msg-actions { opacity: 1; pointer-events: auto; }
        .livechat-view .msg-actions { opacity: 0; pointer-events: none; transition: opacity 150ms ease; }
        .dark .chat-scroll::-webkit-scrollbar-track { background: #111; }
        .dark .chat-scroll::-webkit-scrollbar-thumb { background: #333; }
      `}</style>
      {loading && chats.length === 0 ? (
        <div className={`livechat-view flex flex-col items-center justify-center gap-5 text-gray-800 dark:text-gray-200 view-enter ${fullscreen ? 'h-[100dvh]' : 'max-lg:h-[calc(100dvh-148px)] lg:h-[calc(100dvh-128px)]'}`}>
          <div className="flex flex-col items-center gap-3">
            <img src="/banner.png" alt="Zelt.ai" className="h-6" />
            <div className="relative w-11 h-11">
              <div className="absolute inset-0 rounded-full border-2 border-[var(--zelt-primary)]/10"></div>
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#25D366] border-r-[#25D366]/40"
                style={{ animation: 'orbit-spin 0.9s linear infinite' }}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#25D366]"></div>
              </div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900 dark:text-[#ededed]">Conectando ao chat ao vivo...</p>
            <p className="text-[11px] text-gray-400 dark:text-[#666] mt-1">Carregando conversas do WhatsApp</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${sseConnected ? 'bg-green-500' : 'bg-gray-300 dark:bg-[#555]'}`}></span>
            <span className="text-[10px] text-gray-400 dark:text-[#666]">{sseConnected ? 'Sincronizado' : 'Aguardando conexao'}</span>
          </div>
        </div>
      ) : (
      <div className={`livechat-view flex overflow-hidden text-gray-800 ${fullscreen ? 'h-[100dvh]' : '-mx-4 lg:-mx-8 max-lg:h-[calc(100dvh-148px)] lg:h-[calc(100dvh-128px)]'}`}>

        <section className={`${selectedChat ? 'hidden lg:flex' : 'flex'} w-full lg:w-[320px] h-full border-r border-gray-200 dark:border-white/[0.06] flex-col shrink-0 overflow-hidden`}>
          {fullscreen && (
            <div className="flex items-center gap-2 px-3 pt-3 pb-2 shrink-0 border-b border-gray-200 dark:border-white/[0.06]">
              {onBack && (
                <button onClick={onBack} className="p-1.5 -ml-1 rounded hover:bg-gray-100 dark:hover:bg-[#1a1a1a] text-gray-500 dark:text-[#808080] transition-colors" aria-label="Voltar">
                  <ArrowLeft size={16} />
                </button>
              )}
              <img src="/banner.png" alt="Zelt.ai" className="h-5" />
              <span className="text-[11px] font-semibold text-gray-900 dark:text-[#ededed]">Chat ao vivo</span>
              <div className="ml-auto flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${sseConnected ? 'bg-green-500' : 'bg-gray-300 dark:bg-[#555]'}`}></span>
                <span className="text-[9px] text-gray-400 dark:text-[#666]">{sseConnected ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          )}
          <div className="p-3 pb-2 flex items-center gap-1.5">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#666]" />
              <input type="text" placeholder="Buscar conversa..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-[11px] border border-gray-200 dark:border-white/[0.08] rounded bg-white dark:bg-[#141414] text-gray-900 dark:text-[#ededed] placeholder-gray-400 dark:placeholder-[#555] outline-none focus:border-[var(--zelt-primary)]/40 transition-colors" />
            </div>
            <button onClick={() => { setNewContact({ name: '', phone: '', message: '' }); setNewContactError(''); setShowNewContact(true); }}
              className="flex items-center gap-1.5 px-2.5 py-2 text-[11px] rounded shrink-0 transition-colors bg-[var(--zelt-primary)] text-white hover:bg-[var(--zelt-primary-hover)]">
              <UserPlus size={13} />
              <span className="hidden sm:inline">Novo contato</span>
            </button>
          </div>

          <div className="px-3 pb-2 flex items-center gap-1.5">
            <button onClick={() => setChatFilter('contacts')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] transition-colors border
                ${chatFilter === 'contacts' ? 'bg-[var(--zelt-primary)]/5 text-[var(--zelt-primary)] border-[var(--zelt-primary)]/10' : 'bg-white dark:bg-[#141414] text-gray-400 dark:text-[#666] border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'}`}>
              <User size={11} />
              Contatos
            </button>
            <button onClick={() => setChatFilter('groups')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] transition-colors border
                ${chatFilter === 'groups' ? 'bg-[var(--zelt-primary)]/5 text-[var(--zelt-primary)] border-[var(--zelt-primary)]/10' : 'bg-white dark:bg-[#141414] text-gray-400 dark:text-[#666] border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'}`}>
              <Users size={11} />
              Grupos
            </button>
            <div className="ml-auto flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${sseConnected ? 'bg-green-500' : 'bg-gray-300 dark:bg-[#555]'}`}></span>
              <span className="text-[9px] text-gray-400 dark:text-[#666]">{sseConnected ? 'Online' : 'Offline'}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto chat-scroll px-2 py-1 space-y-1">
            {loading && chats.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={16} className="text-gray-400 dark:text-[#666] animate-spin" />
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-full px-4 py-10 text-center">
                <div className="relative w-16 h-16 mb-4 shrink-0">
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-[var(--zelt-primary)]/20"></div>
                  <div className="absolute inset-1.5 rounded-full bg-[var(--zelt-primary)]/[0.06] flex items-center justify-center">
                    {searchQuery ? (
                      <Search size={18} className="text-[var(--zelt-primary)]/70" />
                    ) : chatFilter === 'groups' ? (
                      <Users size={18} className="text-[var(--zelt-primary)]/70" />
                    ) : (
                      <MessageSquare size={18} className="text-[var(--zelt-primary)]/70" />
                    )}
                  </div>
                </div>

                <h4 className="text-[12px] font-medium text-gray-900 dark:text-[#ededed] mb-1">
                  {searchQuery ? 'Nenhum resultado encontrado' : chatFilter === 'groups' ? 'Nenhum grupo ainda' : 'Nenhuma conversa ainda'}
                </h4>
                <p className="text-[10px] text-gray-400 dark:text-[#666] leading-relaxed max-w-[220px] mb-4">
                  {searchQuery
                    ? 'Nada encontrado para sua busca. Tente outro nome ou numero.'
                    : chatFilter === 'groups'
                      ? 'Os grupos aparecerao aqui automaticamente quando houver atividade.'
                      : 'As mensagens que voce receber aparecerao aqui em tempo real.'}
                </p>

                {searchQuery ? (
                  <button onClick={() => setSearchQuery('')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] border border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-[#808080] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                    <X size={11} />
                    Limpar busca
                  </button>
                ) : chatFilter === 'groups' ? (
                  <button onClick={() => setChatFilter('contacts')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] border border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-[#808080] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                    <User size={11} />
                    Ver contatos
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => { setNewContact({ name: '', phone: '', message: '' }); setNewContactError(''); setShowNewContact(true); }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded text-[10px] text-white bg-[var(--zelt-primary)] hover:bg-[var(--zelt-primary-hover)] transition-colors">
                      <UserPlus size={12} />
                      Novo contato
                    </button>
                    <div className="w-full max-w-[230px] space-y-1.5 mt-4 text-left">
                      <div className="flex items-start gap-2 p-2 rounded-lg bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06]">
                        <div className="w-5 h-5 rounded bg-[var(--zelt-primary)]/[0.06] flex items-center justify-center shrink-0">
                          <UserPlus size={10} className="text-[var(--zelt-primary)]" />
                        </div>
                        <p className="text-[10px] text-gray-500 dark:text-[#808080] leading-snug">Crie um contato para iniciar uma conversa.</p>
                      </div>
                      <div className="flex items-start gap-2 p-2 rounded-lg bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06]">
                        <div className="w-5 h-5 rounded bg-[var(--zelt-primary)]/[0.06] flex items-center justify-center shrink-0">
                          <MessageSquare size={10} className="text-[var(--zelt-primary)]" />
                        </div>
                        <p className="text-[10px] text-gray-500 dark:text-[#808080] leading-snug">Novas mensagens entram automaticamente na lista.</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              filteredChats.map((chat) => {
                const meta = dbMeta[chat.remoteJid];
                const isActive = selectedJid === chat.remoteJid;
                const name = getContactName(chat, meta);
                const phone = formatPhone(meta?.phone || getPhone(chat));
                const lastText = getLastText(chat);
                const lastFromMe = chat.lastMessage?.fromMe;
                const time = formatTime(chat.lastMessage?.messageTimestamp);
                const tags = (meta?.tags || []).map(t => t.tag).filter(Boolean);
                const isGrp = isGroup(chat.remoteJid);

                return (
                  <div key={chat.remoteJid} onClick={() => handleSelectContact(chat)}
                    className={`group p-2.5 rounded cursor-pointer transition-colors relative flex gap-2.5 items-start border
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

          <div className="mx-3 mb-3 p-2.5 rounded bg-[var(--zelt-primary)]/[0.03] border border-[var(--zelt-primary)]/10">
            <div className="flex items-center gap-1.5 mb-1">
              <HelpCircle size={10} className="text-[var(--zelt-primary)]" />
              <span className="text-[9px] text-[var(--zelt-primary)] uppercase tracking-wider">Chat ao vivo</span>
            </div>
            <p className="text-[9px] text-gray-500 dark:text-[#808080] leading-relaxed">
              Selecione uma conversa para atender o cliente em tempo real.
            </p>
          </div>
        </section>

        <section className={`${selectedChat ? 'flex' : 'hidden lg:flex'} flex-1 h-full flex-col overflow-hidden min-w-0`}>
          {!selectedChat ? (
            <div className="flex-1 h-full flex flex-col items-center justify-center p-6 relative">
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(99,0,255,0.05), transparent 65%)' }}></div>
              <div className="relative flex flex-col items-center text-center max-w-[300px]">
                <div className="relative mb-5">
                  <div className="absolute inset-0 rounded-2xl rotate-6 bg-[var(--zelt-primary)]/[0.06]"></div>
                  <div className="relative w-16 h-16 rounded-2xl bg-[var(--zelt-primary)]/5 border border-[var(--zelt-primary)]/10 flex items-center justify-center">
                    <MessageSquare size={26} className="text-[var(--zelt-primary)]" />
                  </div>
                </div>
                <h3 className="text-sm text-gray-900 dark:text-[#ededed] mb-1.5">Nenhuma conversa selecionada</h3>
                <p className="text-[11px] text-gray-400 dark:text-[#666] text-center leading-relaxed mb-5">
                  Escolha um contato ou grupo na lista ao lado para acompanhar e responder em tempo real.
                </p>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#141414]">
                    <div className="w-4 h-4 rounded bg-[var(--zelt-primary)]/5 flex items-center justify-center">
                      <User size={9} className="text-[var(--zelt-primary)]" />
                    </div>
                    <span className="text-[10px] text-gray-500 dark:text-[#808080]">{chats.length} contatos</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#141414]">
                    <div className="w-4 h-4 rounded bg-[var(--zelt-primary)]/5 flex items-center justify-center">
                      <Users size={9} className="text-[var(--zelt-primary)]" />
                    </div>
                    <span className="text-[10px] text-gray-500 dark:text-[#808080]">{groupChatCount} grupos</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <header className="h-[56px] border-b border-gray-200 dark:border-white/[0.06] px-4 lg:px-5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  {fullscreen && (
                    <button onClick={() => setSelectedJid(null)} className="lg:hidden p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#1a1a1a] text-gray-500 dark:text-[#808080] transition-colors" aria-label="Voltar para conversas">
                      <ArrowLeft size={16} />
                    </button>
                  )}
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
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] text-[#25D366] bg-[#25D366]/5 border border-[#25D366]/20 hover:bg-[#25D366]/10 transition-colors">
                      <ExternalLink size={12} />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>
                  )}
                  {isGroupSelected && (
                    <button onClick={handleShowGroupMembers}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] border transition-colors
                        ${showInfoPanel ? 'bg-[var(--zelt-primary)]/5 border-[var(--zelt-primary)]/10 text-[var(--zelt-primary)]' : 'border-gray-200 dark:border-white/[0.06] text-gray-400 dark:text-[#666] hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'}`}>
                      <Users size={12} />
                      Membros
                    </button>
                  )}
                  {!isGroupSelected && (
                    <button onClick={() => setShowInfoPanel(!showInfoPanel)}
                      className={`p-1.5 rounded border transition-colors ${showInfoPanel ? 'bg-[var(--zelt-primary)]/5 border-[var(--zelt-primary)]/10 text-[var(--zelt-primary)]' : 'border-gray-200 dark:border-white/[0.06] text-gray-400 dark:text-[#666] hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'}`}>
                      <Info size={14} />
                    </button>
                  )}
                  <div className="relative">
                    <button onClick={() => setShowChatMenu(!showChatMenu)}
                      className="p-1.5 rounded border border-gray-200 dark:border-white/[0.06] text-gray-400 dark:text-[#666] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                      <MoreVertical size={14} />
                    </button>
                    {showChatMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowChatMenu(false)} />
                        <div className="absolute right-0 top-full mt-1 z-50 w-52 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded py-1 overflow-hidden">
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
                  <div className="flex flex-col items-center justify-center py-14 text-center px-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--zelt-primary)]/[0.06] flex items-center justify-center mb-2.5">
                      <MessageSquare size={15} className="text-[var(--zelt-primary)]/70" />
                    </div>
                    <p className="text-[11px] text-gray-400 dark:text-[#666]">Nenhuma mensagem nesta conversa</p>
                    <p className="text-[10px] text-gray-400/80 dark:text-[#555] mt-1">Envie a primeira mensagem com o campo abaixo.</p>
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
                            <div className="max-w-[65%] rounded-lg px-3 py-2 bg-gray-100/60 dark:bg-[#1e2a33]/40">
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
                          <div className={`msg-bubble max-w-[65%] rounded-lg px-3 py-2 relative
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
                            {msg.messageType === 'imageMessage' && (
                              msg.messageData?.mediaPath ? (
                                <a href={getMediaUrl(msg.messageData.mediaPath)} target="_blank" rel="noopener noreferrer" className="block mb-1">
                                  <img src={getMediaUrl(msg.messageData.mediaPath)} alt="Foto" className="rounded max-w-full max-h-[280px] object-cover border border-white/10" loading="lazy" />
                                </a>
                              ) : (
                                <MediaUnavailable label="Foto indisponivel" icon={<ImageIcon size={14} className={fromMe ? 'text-white/60' : 'text-gray-400'} />} fromMe={fromMe} />
                              )
                            )}
                            {msg.messageType === 'videoMessage' && (
                              msg.messageData?.mediaPath ? (
                                <div className="mb-1">
                                  <video src={getMediaUrl(msg.messageData.mediaPath)} controls className="rounded max-w-full max-h-[280px] border border-white/10" preload="metadata" />
                                </div>
                              ) : (
                                <MediaUnavailable label="Video indisponivel" icon={<Film size={14} className={fromMe ? 'text-white/60' : 'text-gray-400'} />} fromMe={fromMe} />
                              )
                            )}
                            {msg.messageType === 'audioMessage' && (
                              msg.messageData?.mediaPath ? (
                                <div className="mb-1">
                                  <AudioPlayer src={getMediaUrl(msg.messageData.mediaPath)} fromMe={fromMe} />
                                </div>
                              ) : (
                                <MediaUnavailable label="Audio indisponivel" icon={<Mic size={14} className={fromMe ? 'text-white/60' : 'text-gray-400'} />} fromMe={fromMe} />
                              )
                            )}
                            {msg.messageType === 'documentMessage' && (
                              <DocumentCard fileName={msg.messageText} url={getMediaUrl(msg.messageData?.mediaPath)} fromMe={fromMe} />
                            )}
                            {msg.messageType === 'stickerMessage' && (
                              <StickerImage url={getMediaUrl(msg.messageData?.mediaPath)} fromMe={fromMe} />
                            )}
                            {msg.messageType === 'locationMessage' && (
                              <LocationCard location={msg.messageData?.locationMessage} fromMe={fromMe} />
                            )}
                            {msg.messageType === 'contactMessage' && (
                              <ContactCard contact={msg.messageData?.contactMessage} fromMe={fromMe} />
                            )}
                            {text && !['documentMessage', 'stickerMessage', 'locationMessage', 'contactMessage'].includes(msg.messageType) && (
                              <p className="text-[13px] leading-[1.4] whitespace-pre-wrap break-words">{text}</p>
                            )}
                            <div className={`flex items-center justify-end gap-1 mt-1 ${fromMe && msg.pushName !== 'Zelt.AI' ? 'text-white/50' : fromMe && msg.pushName === 'Zelt.AI' ? 'text-indigo-200' : 'text-gray-400 dark:text-[#666]'}`}>
                              <span className="text-[10px]">{time}</span>
                              {fromMe && <CheckCheck size={11} />}
                              {fromMe && msg.status === 'sending' && <Loader2 size={9} className="animate-spin" />}
                            </div>

                            <div className="msg-actions absolute top-0 -translate-y-1/2 flex items-center gap-0.5 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded px-0.5 py-0.5 z-10"
                              style={{ [fromMe ? 'right' : 'left']: '0' }}>
                              <button onClick={(e) => { e.stopPropagation(); handleCopyText(msg); }}
                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#222] text-gray-400 dark:text-[#666] hover:text-gray-600 dark:hover:text-[#ccc] transition-colors"
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
                    className="sticky bottom-2 left-1/2 -translate-x-1/2 ml-auto mr-auto z-10 w-8 h-8 rounded-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/[0.06] flex items-center justify-center text-gray-500 dark:text-[#808080] hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                    <ChevronLeft size={14} className="rotate-[-90deg]" />
                  </button>
                )}
              </div>

              <footer className={`p-3 border-t border-gray-200 dark:border-white/[0.06] shrink-0 ${fullscreen ? 'pb-[max(env(safe-area-inset-bottom),0.75rem)]' : ''}`}>
                <form onSubmit={handleSendMessage} className="border border-gray-200 dark:border-white/[0.06] rounded focus-within:border-[var(--zelt-primary)]/40 transition-colors bg-white dark:bg-[#141414] overflow-hidden p-2">
                  <textarea rows={2} placeholder="Digite uma mensagem..." value={inputMsg} onChange={(e) => setInputMsg(e.target.value)} onKeyDown={handleKeyDown}
                    className="w-full text-[11px] text-gray-900 dark:text-[#ededed] placeholder-gray-400 dark:placeholder-[#555] bg-transparent resize-none outline-none px-1.5 pt-0.5 leading-relaxed" />
                  <div className="flex items-center justify-end pt-1.5 border-t border-gray-50 dark:border-t-white/[0.06] mt-1 px-1">
                    <button type="submit" disabled={!inputMsg.trim() || sending}
                      className={`px-3 py-1.5 rounded text-[11px] flex items-center gap-1 transition-colors ${inputMsg.trim() && !sending ? 'bg-[var(--zelt-primary)] text-white hover:bg-[var(--zelt-primary-hover)]' : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-400 dark:text-[#666] cursor-not-allowed'}`}>
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
          <>
            <div className="fixed inset-0 z-40 lg:hidden bg-black/30 animate-[fadeIn_.2s_ease-out]" onClick={() => { setShowInfoPanel(false); setGroupMembers([]); }} />
            <aside className="fixed lg:static inset-y-0 right-0 z-50 w-[85vw] max-w-[300px] lg:w-[260px] h-full border-l border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#141414] flex flex-col shrink-0 overflow-hidden animate-[dropdownIn_.18s_ease-out] lg:animate-none">
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
                        <div key={member.id || i} className="flex items-center gap-2.5 px-2 py-2 rounded hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
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
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] text-[#25D366] bg-[#25D366]/5 border border-[#25D366]/20 hover:bg-[#25D366]/10 transition-colors">
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
                            className="inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[9px] transition-all"
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
          </>
        )}

        {showNewContact && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 animate-[fadeIn_.2s_ease-out] p-0 sm:p-4" onClick={() => setShowNewContact(false)}>
            <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-t-2xl sm:rounded-xl w-full sm:max-w-[440px] pb-[env(safe-area-inset-bottom)] animate-[dropdownIn_.18s_ease-out]" onClick={(e) => e.stopPropagation()}>
              <div className="sm:hidden flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-white/[0.12]" />
              </div>
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
                <h3 className="text-base text-gray-900 dark:text-[#ededed]">Novo contato</h3>
                <button onClick={() => setShowNewContact(false)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#1a1a1a] text-gray-400 dark:text-[#666] hover:text-gray-600 dark:hover:text-[#ccc] transition-colors">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleCreateContact} className="p-5 sm:p-6 space-y-4">
                {newContactError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/40 text-sm text-red-600 dark:text-red-400">
                    <AlertTriangle size={14} className="shrink-0" /> {newContactError}
                  </div>
                )}
                <div>
                  <label className="text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider block mb-1.5">Nome</label>
                  <input type="text" value={newContact.name} onChange={(e) => setNewContact(p => ({ ...p, name: e.target.value }))}
                    placeholder="Nome do contato"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#141414] text-gray-900 dark:text-[#ededed] placeholder-gray-400 dark:placeholder-[#555] focus:border-[var(--zelt-primary)]/40 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider block mb-1.5">Telefone com DDD *</label>
                  <input type="tel" value={newContact.phone} onChange={(e) => setNewContact(p => ({ ...p, phone: e.target.value }))}
                    placeholder="Ex: (11) 91234-5678" required autoFocus
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#141414] text-gray-900 dark:text-[#ededed] placeholder-gray-400 dark:placeholder-[#555] focus:border-[var(--zelt-primary)]/40 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider block mb-1.5">Mensagem inicial (opcional)</label>
                  <textarea rows={3} value={newContact.message} onChange={(e) => setNewContact(p => ({ ...p, message: e.target.value }))}
                    placeholder="Digite a primeira mensagem..."
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg bg-white dark:bg-[#141414] text-gray-900 dark:text-[#ededed] placeholder-gray-400 dark:placeholder-[#555] focus:border-[var(--zelt-primary)]/40 resize-none transition-colors" />
                </div>
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowNewContact(false)}
                    className="px-4 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-lg text-gray-600 dark:text-[#ccc] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={newContactSaving}
                    className="px-4 py-2.5 text-sm bg-[var(--zelt-primary)] text-white rounded-lg hover:bg-[var(--zelt-primary-hover)] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                    {newContactSaving ? <Loader2 size={14} className="animate-spin" /> : <Send size={13} />}
                    {newContactSaving ? 'Criando...' : 'Criar contato'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      )}
    </>
  );
}
