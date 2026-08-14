import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Folder, FolderOpen, File, Image, Video, Music, FileText, FileSpreadsheet,
  Archive, Upload, Download, Trash2, Pencil, Plus, X, ChevronRight, Search,
  Home, HardDrive, Bot,
} from 'lucide-react';
import { driveApi } from '../../lib/api';

const MIME_STYLES = [
  { test: /^image\//, icon: Image, color: '#0EA5E9' },
  { test: /^video\//, icon: Video, color: '#EF4444' },
  { test: /^audio\//, icon: Music, color: '#10B981' },
  { test: /pdf/, icon: FileText, color: '#EF4444' },
  { test: /(sheet|excel|csv)/, icon: FileSpreadsheet, color: '#10B981' },
  { test: /(word|text|markdown)/, icon: FileText, color: '#3B82F6' },
  { test: /(zip|rar|7z|tar|gzip|compressed)/, icon: Archive, color: '#F59E0B' },
];
const DEFAULT_STYLE = { icon: File, color: '#9CA3AF' };

function fileStyle(asset) {
  const mime = (asset.mimeType || '').toLowerCase();
  const name = (asset.name || '').toLowerCase();
  const found = MIME_STYLES.find((s) => s.test.test(mime) || s.test.test(name));
  return found || DEFAULT_STYLE;
}

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function buildPath(folders, folderId) {
  const path = [];
  let current = folders.find((f) => f.id === folderId);
  let guard = 0;
  while (current && guard++ < 30) {
    path.unshift(current);
    current = folders.find((f) => f.id === current.parentId) || null;
  }
  return path;
}

export default function MediaView() {
  const [folders, setFolders] = useState([]);
  const [assets, setAssets] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameName, setRenameName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [preview, setPreview] = useState(null);
  const [stats, setStats] = useState({ files: 0, folders: 0, storage: 0, sentByAI: 0 });
  const [menuOpen, setMenuOpen] = useState(null);

  const fileInput = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const breadcrumb = useMemo(() => buildPath(folders, currentFolder), [folders, currentFolder]);
  const currentChildren = useMemo(() => folders.filter((f) => (f.parentId || null) === currentFolder), [folders, currentFolder]);

  const loadFolders = useCallback(async () => {
    try {
      const res = await driveApi.listFolders();
      setFolders(res.folders || []);
    } catch (err) {
      console.error('Failed to load folders:', err);
    }
  }, []);

  const loadAssets = useCallback(async (folderId, searchQuery = '') => {
    try {
      const params = {};
      if (folderId) params.folderId = folderId;
      if (searchQuery) params.search = searchQuery;
      const res = await driveApi.listAssets(params);
      setAssets(res.assets || []);
    } catch (err) {
      console.error('Failed to load assets:', err);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const res = await driveApi.stats();
      setStats({ files: res.files || 0, folders: res.folders || 0, storage: res.storage || 0, sentByAI: res.sentByAI || 0 });
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  useEffect(() => {
    Promise.all([loadFolders(), loadAssets(null), loadStats()]).then(() => setLoading(false));
  }, [loadFolders, loadAssets, loadStats]);

  const navigateTo = (folderId) => {
    setCurrentFolder(folderId);
    setSearch('');
    loadAssets(folderId);
  };

  const handleSearch = (q) => {
    setSearch(q);
    loadAssets(currentFolder, q);
  };

  // ---------- UPLOAD ----------

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        await driveApi.upload(file, currentFolder);
      }
      await loadAssets(currentFolder);
      await loadStats();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  // ---------- CRUD ----------

  const handleCreateFolder = async () => {
    try {
      await driveApi.createFolder({ name: newFolderName, parentId: currentFolder });
      setShowNewFolder(false);
      setNewFolderName('');
      await loadFolders();
      await loadStats();
    } catch (err) {
      console.error('Failed to create folder:', err);
    }
  };

  const handleRename = async () => {
    if (!renameTarget) return;
    try {
      if (renameTarget.type === 'folder') {
        await driveApi.renameFolder(renameTarget.id, renameName);
        await loadFolders();
      } else {
        await driveApi.renameAsset(renameTarget.id, renameName);
        await loadAssets(currentFolder);
      }
      setRenameTarget(null);
      setMenuOpen(null);
    } catch (err) {
      console.error('Failed to rename:', err);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      if (confirmDelete.type === 'folder') {
        await driveApi.deleteFolder(confirmDelete.id);
        if (currentFolder === confirmDelete.id) setCurrentFolder(null);
        await loadFolders();
      } else {
        await driveApi.deleteAsset(confirmDelete.id);
        await loadAssets(currentFolder);
      }
      await loadStats();
      setConfirmDelete(null);
      setMenuOpen(null);
      if (preview?.id === confirmDelete.id) setPreview(null);
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  // ---------- RENDER ----------

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300;1,9..40,400&display=swap');
        .media-view * { font-family: 'DM Sans', system-ui, sans-serif; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .fade-in { animation: fadeIn 0.15s ease-out; }
        @keyframes sheetIn { from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); } }
        .sheet-in { animation: sheetIn 0.25s ease-out; }
      `}</style>
      <div className="media-view">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-xl sm:text-2xl text-gray-900 dark:text-[#ededed]">Arquivos</h1>
            <p className="text-sm text-gray-400 dark:text-[#666] mt-1">Organize documentos, imagens e midias da sua empresa</p>
          </div>
          <div className="flex items-center gap-2.5">
            <button onClick={() => setShowNewFolder(true)}
              className="flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2.5 text-sm border border-gray-200 dark:border-white/[0.08] rounded-lg text-gray-600 dark:text-[#ccc] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
              <Plus size={16} /> Nova pasta
            </button>
            <button onClick={() => fileInput.current?.click()}
              className="flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2.5 bg-[var(--zelt-primary)] text-white rounded-lg text-sm hover:bg-[var(--zelt-primary-hover)] transition-colors">
              <Upload size={16} /> Enviar arquivo
            </button>
            <input ref={fileInput} type="file" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Arquivos', value: stats.files, icon: File, color: 'text-[var(--zelt-primary)]', bg: 'bg-[var(--zelt-primary)]/5', iconColor: 'text-[var(--zelt-primary)]' },
            { label: 'Pastas', value: stats.folders, icon: Folder, color: 'text-blue-600', bg: 'bg-blue-50', iconColor: 'text-blue-400' },
            { label: 'Armazenamento', value: formatSize(stats.storage), icon: HardDrive, color: 'text-emerald-600', bg: 'bg-emerald-50', iconColor: 'text-emerald-400' },
            { label: 'Enviados pela IA', value: stats.sentByAI, icon: Bot, color: 'text-purple-600', bg: 'bg-purple-50', iconColor: 'text-purple-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                <stat.icon size={18} className={stat.iconColor} />
              </div>
              <div className="min-w-0">
                <p className={`text-xl ${stat.color} truncate`}>{stat.value}</p>
                <p className="text-xs text-gray-400 dark:text-[#666] truncate">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* SEARCH + BREADCRUMB */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 mb-4">
          <div className="relative w-full sm:flex-1 sm:max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Buscar arquivos..." value={search} onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 dark:border-white/[0.08] rounded-lg bg-white dark:bg-[#141414] text-gray-900 dark:text-[#ededed] placeholder-gray-400 dark:placeholder-[#555] focus:border-[var(--zelt-primary)]/40 outline-none transition-colors" />
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-[#666] overflow-x-auto pb-0.5">
            <button onClick={() => navigateTo(null)} className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors shrink-0">
              <Home size={13} /> Raiz
            </button>
            {breadcrumb.map((f) => (
              <span key={f.id} className="flex items-center gap-1 shrink-0">
                <ChevronRight size={12} className="text-gray-300 dark:text-[#555]" />
                <button onClick={() => navigateTo(f.id)} className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors">
                  {f.name}
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* DRAG OVERLAY */}
        {dragOver && (
          <div className="fixed inset-0 z-40 bg-[var(--zelt-primary)]/10 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
            <div className="bg-white dark:bg-[#141414] border-2 border-dashed border-[var(--zelt-primary)] rounded-2xl px-8 py-6 text-center">
              <Upload size={28} className="mx-auto text-[var(--zelt-primary)] mb-2" />
              <p className="text-sm text-gray-900 dark:text-[#ededed]">Solte para enviar</p>
            </div>
          </div>
        )}

        {/* CONTENT */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={(e) => { if (e.currentTarget === e.target) setDragOver(false); }}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        >
          {!loading && (currentChildren.length > 0 || assets.length > 0) ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
              {currentChildren.map((folder) => (
                <div key={folder.id}
                  className="group relative bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-4 flex flex-col items-center text-center cursor-pointer hover:border-gray-300 dark:hover:border-white/[0.12] hover:shadow-sm transition-all"
                  onClick={() => navigateTo(folder.id)}>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-3">
                    <Folder size={24} className="text-amber-500 dark:text-amber-400" />
                  </div>
                  <p className="text-sm text-gray-800 dark:text-[#ddd] truncate w-full">{folder.name}</p>
                  <div className="relative mt-1" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setMenuOpen(menuOpen === folder.id ? null : folder.id)}
                      className="p-1.5 rounded-lg text-gray-400 dark:text-[#666] hover:bg-gray-100 dark:hover:bg-[#222] transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><circle cx="3" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="13" cy="8" r="1.5"/></svg>
                    </button>
                  </div>
                  {menuOpen === folder.id && (
                    <div ref={menuRef} className="absolute right-2 top-full mt-1 w-40 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/[0.08] rounded-lg py-1.5 z-30 shadow-sm fade-in">
                      <button onClick={() => { setRenameTarget({ type: 'folder', id: folder.id, name: folder.name }); setRenameName(folder.name); setMenuOpen(null); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 dark:text-[#ccc] hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                        <Pencil size={14} /> Renomear
                      </button>
                      <div className="border-t border-gray-100 dark:border-white/[0.06] my-1"></div>
                      <button onClick={() => { setConfirmDelete({ type: 'folder', id: folder.id, name: folder.name }); setMenuOpen(null); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <Trash2 size={14} /> Excluir
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {assets.map((asset) => {
                const style = fileStyle(asset);
                const isImage = /^image\//.test(asset.mimeType || '');
                const Icon = style.icon;
                return (
                  <div key={asset.id}
                    className="group relative bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-3 flex flex-col cursor-pointer hover:border-gray-300 dark:hover:border-white/[0.12] hover:shadow-sm transition-all"
                    onClick={() => setPreview(asset)}>
                    <div className="relative w-full h-24 rounded-lg mb-3 flex items-center justify-center overflow-hidden" style={{ background: `${style.color}12` }}>
                      {isImage ? (
                        <img src={driveApi.downloadUrl(asset.id)} alt={asset.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <Icon size={30} style={{ color: style.color }} />
                      )}
                      {uploading && <span className="absolute inset-0 bg-black/30 flex items-center justify-center"><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /></span>}
                    </div>
                    <p className="text-sm text-gray-800 dark:text-[#ddd] truncate">{asset.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-400 dark:text-[#666]">{formatSize(asset.size)}</span>
                      <span className="text-xs text-gray-400 dark:text-[#555]">{formatDate(asset.createdAt)}</span>
                    </div>
                    <div className="absolute right-2.5 top-2.5 z-20" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => setMenuOpen(menuOpen === asset.id ? null : asset.id)}
                        className="p-1.5 rounded-lg bg-white/90 dark:bg-[#1a1a1a]/90 shadow-sm border border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-[#aaa] hover:bg-gray-100 dark:hover:bg-[#222] transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><circle cx="3" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="13" cy="8" r="1.5"/></svg>
                      </button>
                      {menuOpen === asset.id && (
                        <div ref={menuRef} className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/[0.08] rounded-lg py-1.5 z-30 shadow-sm fade-in">
                          <a href={driveApi.downloadUrl(asset.id)} target="_blank" rel="noopener noreferrer"
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 dark:text-[#ccc] hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                            <Download size={14} /> Baixar
                          </a>
                          <button onClick={() => { setRenameTarget({ type: 'asset', id: asset.id, name: asset.name }); setRenameName(asset.name); setMenuOpen(null); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 dark:text-[#ccc] hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                            <Pencil size={14} /> Renomear
                          </button>
                          <div className="border-t border-gray-100 dark:border-white/[0.06] my-1"></div>
                          <button onClick={() => { setConfirmDelete({ type: 'asset', id: asset.id, name: asset.name }); setMenuOpen(null); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            <Trash2 size={14} /> Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : !loading ? (
            <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-12 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-[var(--zelt-primary)]/5 flex items-center justify-center text-[var(--zelt-primary)] mb-4">
                <FolderOpen size={24} />
              </div>
              <h3 className="text-sm text-gray-900 dark:text-[#ededed] mb-1">Pasta vazia</h3>
              <p className="text-sm text-gray-400 dark:text-[#666] max-w-[300px] leading-relaxed mb-5">Envie arquivos ou crie pastas para organizar.</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowNewFolder(true)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm border border-gray-200 dark:border-white/[0.08] rounded-lg text-gray-600 dark:text-[#ccc] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                  <Plus size={16} /> Nova pasta
                </button>
                <button onClick={() => fileInput.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[var(--zelt-primary)] text-white rounded-lg text-sm hover:bg-[var(--zelt-primary-hover)] transition-colors">
                  <Upload size={16} /> Enviar arquivo
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-12 flex justify-center">
              <div className="w-5 h-5 border-2 border-[var(--zelt-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* NEW FOLDER MODAL */}
      {showNewFolder && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20 fade-in p-0 sm:p-4" onClick={() => setShowNewFolder(false)}>
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-t-2xl sm:rounded-xl w-full max-w-[400px] p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sheet-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                <Folder size={18} className="text-amber-500 dark:text-amber-400" />
              </div>
              <h3 className="text-base text-gray-900 dark:text-[#ededed]">Nova pasta</h3>
            </div>
            <input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              autoFocus
              placeholder="Nome da pasta"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-white/[0.08] rounded-lg bg-white dark:bg-[#141414] text-gray-900 dark:text-[#ededed] placeholder-gray-400 focus:border-[var(--zelt-primary)]/40 outline-none mb-5"
            />
            <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
              <button onClick={() => setShowNewFolder(false)} className="px-4 py-2 text-sm border border-gray-200 dark:border-white/[0.08] rounded-lg text-gray-600 dark:text-[#ccc] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">Cancelar</button>
              <button onClick={handleCreateFolder} disabled={!newFolderName.trim()}
                className="px-4 py-2 text-sm bg-[var(--zelt-primary)] text-white rounded-lg hover:bg-[var(--zelt-primary-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Criar</button>
            </div>
          </div>
        </div>
      )}

      {/* RENAME MODAL */}
      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20 fade-in p-0 sm:p-4" onClick={() => setRenameTarget(null)}>
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-t-2xl sm:rounded-xl w-full max-w-[400px] p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sheet-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base text-gray-900 dark:text-[#ededed] mb-4">Renomear {renameTarget.type === 'folder' ? 'pasta' : 'arquivo'}</h3>
            <input
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              autoFocus
              placeholder="Nome"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-white/[0.08] rounded-lg bg-white dark:bg-[#141414] text-gray-900 dark:text-[#ededed] placeholder-gray-400 focus:border-[var(--zelt-primary)]/40 outline-none mb-5"
            />
            <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
              <button onClick={() => setRenameTarget(null)} className="px-4 py-2 text-sm border border-gray-200 dark:border-white/[0.08] rounded-lg text-gray-600 dark:text-[#ccc] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">Cancelar</button>
              <button onClick={handleRename} disabled={!renameName.trim()}
                className="px-4 py-2 text-sm bg-[var(--zelt-primary)] text-white rounded-lg hover:bg-[var(--zelt-primary-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20 fade-in p-0 sm:p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-t-2xl sm:rounded-xl w-full max-w-[400px] p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                <Trash2 size={18} className="text-red-500" />
              </div>
              <h3 className="text-base text-gray-900 dark:text-[#ededed]">Excluir {confirmDelete.type === 'folder' ? 'pasta' : 'arquivo'}</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-[#888] mb-5">
              Tem certeza que deseja excluir "{confirmDelete.name}"?{confirmDelete.type === 'folder' ? ' Todos os arquivos dentro dela serao excluidos.' : ''} Esta acao nao pode ser desfeita.
            </p>
            <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm border border-gray-200 dark:border-white/[0.08] rounded-lg text-gray-600 dark:text-[#ccc] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">Cancelar</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 fade-in p-4" onClick={() => setPreview(null)}>
          <div className="relative max-w-[90vw] max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-white/90 truncate max-w-[70vw]">{preview.name}</p>
              <div className="flex items-center gap-2">
                <a href={driveApi.downloadUrl(preview.id)} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">
                  <Download size={16} />
                </a>
                <button onClick={() => setPreview(null)} className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>
            {/^image\//.test(preview.mimeType || '') ? (
              <img src={driveApi.downloadUrl(preview.id)} alt={preview.name} className="max-w-full max-h-[75vh] rounded-xl object-contain" />
            ) : (
              <div className="bg-white/5 rounded-xl px-10 py-14 text-center text-white/70 text-sm flex flex-col items-center gap-3">
                {(() => { const s = fileStyle(preview); const Icon = s.icon; return <Icon size={40} style={{ color: s.color }} />; })()}
                <p>{preview.name}</p>
                <p className="text-white/40 text-xs">{formatSize(preview.size)} · {preview.mimeType}</p>
                <a href={driveApi.downloadUrl(preview.id)} target="_blank" rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-2 px-4 py-2 bg-[var(--zelt-primary)] text-white rounded-lg text-sm hover:bg-[var(--zelt-primary-hover)] transition-colors">
                  <Download size={15} /> Baixar arquivo
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
