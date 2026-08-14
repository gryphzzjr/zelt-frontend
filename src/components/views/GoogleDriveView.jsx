import { useState } from 'react';
import {
  Folder, FileText, File, ChevronRight, ChevronDown, Check,
  RefreshCw, Search, X, Download, Eye, HardDrive, Clock,
} from 'lucide-react';

const MOCK_FILES = [
  { id: 1, name: 'Documentos Comerciais', type: 'folder', children: [
    { id: 11, name: 'Apresentacao Zelt.pdf', type: 'pdf', size: '2.4 MB', modified: '2026-07-10' },
    { id: 12, name: 'Catalogo de Produtos 2026.pdf', type: 'pdf', size: '8.1 MB', modified: '2026-07-08' },
    { id: 13, name: 'Termos de Servico.docx', type: 'doc', size: '340 KB', modified: '2026-07-05' },
  ]},
  { id: 2, name: 'Suporte', type: 'folder', children: [
    { id: 21, name: 'Guia de Instalacao.pdf', type: 'pdf', size: '1.2 MB', modified: '2026-07-12' },
    { id: 22, name: 'FAQ.pdf', type: 'pdf', size: '560 KB', modified: '2026-07-11' },
    { id: 23, name: 'Manual do Usuario.pdf', type: 'pdf', size: '3.8 MB', modified: '2026-07-09' },
  ]},
  { id: 3, name: 'Marketing', type: 'folder', children: [
    { id: 31, name: 'Brand Guidelines.pdf', type: 'pdf', size: '5.2 MB', modified: '2026-07-01' },
    { id: 32, name: 'Campanha Julho.docx', type: 'doc', size: '120 KB', modified: '2026-07-14' },
  ]},
  { id: 4, name: 'Planilha de Precos.xlsx', type: 'file', size: '890 KB', modified: '2026-07-15' },
];

const FILE_ICONS = { folder: Folder, pdf: FileText, doc: FileText, file: File };
const FILE_COLORS = { folder: '#4285F4', pdf: '#EA4335', doc: '#4285F4', file: '#666' };

export default function GoogleDriveView() {
  const [files, setFiles] = useState(MOCK_FILES);
  const [expandedFolders, setExpandedFolders] = useState({ 1: true });
  const [selectedFiles, setSelectedFiles] = useState([21, 22, 23]);
  const [search, setSearch] = useState('');
  const [syncing, setSyncing] = useState(false);

  const toggleFolder = (id) => setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleFile = (id) => setSelectedFiles(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const totalSelected = selectedFiles.length;

  const handleSync = () => { setSyncing(true); setTimeout(() => setSyncing(false), 2000); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300;1,9..40,400&display=swap');
        .gdrive-view * { font-family: 'DM Sans', system-ui, sans-serif; }
      `}</style>
      <div className="gdrive-view space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-gray-900 dark:text-[#ededed]">Google Drive</h1>
            <p className="text-sm text-gray-400 dark:text-[#666] mt-1">Importe documentos do Google Drive para a base de conhecimento</p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-white/[0.06] rounded-lg text-sm text-gray-500 dark:text-[#808080]">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              lucas@zelt.ai
            </div>
            <button onClick={handleSync} disabled={syncing || totalSelected === 0} className="flex items-center gap-2 px-4 py-2.5 bg-[#4285F4] text-white rounded-lg text-sm hover:bg-[#3a76e0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} /> Importar selecionados
            </button>
          </div>
        </div>

        <div className="cards-carousel">
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#4285F4]/10 flex items-center justify-center"><Folder size={18} className="text-[#4285F4]" /></div>
            <div><p className="text-xl text-gray-900 dark:text-[#ededed]">3</p><p className="text-xs text-gray-400 dark:text-[#666]">Pastas</p></div>
          </div>
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center"><FileText size={18} className="text-red-500" /></div>
            <div><p className="text-xl text-gray-900 dark:text-[#ededed]">6</p><p className="text-xs text-gray-400 dark:text-[#666]">PDFs</p></div>
          </div>
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--zelt-primary)]/10 flex items-center justify-center"><Check size={18} className="text-[var(--zelt-primary)]" /></div>
            <div><p className="text-xl text-gray-900 dark:text-[#ededed]">{totalSelected}</p><p className="text-xs text-gray-400 dark:text-[#666]">Selecionados</p></div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 flex items-center gap-2 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg px-3 py-2">
              <Search size={15} className="text-gray-400 dark:text-[#666]" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar arquivos..."
                className="flex-1 text-sm bg-transparent text-gray-900 dark:text-[#ededed] placeholder-gray-400 dark:placeholder-[#555]" />
              {search && <button onClick={() => setSearch('')} className="text-gray-400 dark:text-[#666] hover:text-gray-600 dark:hover:text-[#ccc]"><X size={14} /></button>}
            </div>
          </div>

          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl overflow-hidden">
            <div className="bg-gray-50 dark:bg-[#111] border-b border-gray-100 dark:border-white/[0.06] px-4 py-2.5 flex items-center justify-between">
              <span className="text-xs text-gray-400 dark:text-[#666] uppercase tracking-wider">Arquivos</span>
              <span className="text-xs text-gray-400 dark:text-[#666]">Tamanho</span>
            </div>
            <div className="divide-y divide-gray-50">
              {files.map(file => {
                const isFolder = file.type === 'folder';
                const isExpanded = expandedFolders[file.id];
                const IconComp = FILE_ICONS[file.type] || File;
                const color = FILE_COLORS[file.type] || '#666';
                return (
                  <div key={file.id}>
                    <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/50 dark:hover:bg-[#1a1a1a]/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {isFolder && (
                          <button onClick={() => toggleFolder(file.id)} className="text-gray-400 dark:text-[#666] hover:text-gray-600 dark:hover:text-[#ccc]">
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                        )}
                        {!isFolder && <div className="w-[14px]"></div>}
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                          <IconComp size={16} style={{ color }} />
                        </div>
                        <span className="text-sm text-gray-900 dark:text-[#ededed]">{file.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        {file.size && <span className="text-xs text-gray-400 dark:text-[#666]">{file.size}</span>}
                        {file.modified && <span className="text-xs text-gray-400 dark:text-[#666]">{file.modified}</span>}
                        {!isFolder && (
                          <div className="relative">
                            <input type="checkbox" checked={selectedFiles.includes(file.id)} onChange={() => toggleFile(file.id)} className="sr-only" />
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${selectedFiles.includes(file.id) ? 'bg-[#4285F4] border-[#4285F4]' : 'border-gray-300 dark:border-white/20 bg-white dark:bg-[#141414] hover:border-gray-400 dark:hover:border-white/30'}`}>
                              {selectedFiles.includes(file.id) && <Check size={12} className="text-white" />}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {isFolder && isExpanded && file.children && (
                      <div className="bg-gray-50/50 dark:bg-[#111]/50">
                        {file.children.map(child => {
                          const ChildIcon = FILE_ICONS[child.type] || File;
                          const childColor = FILE_COLORS[child.type] || '#666';
                          return (
                            <div key={child.id} className="flex items-center justify-between pl-12 pr-4 py-2.5 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${childColor}15` }}>
                                  <ChildIcon size={16} style={{ color: childColor }} />
                                </div>
                                <span className="text-sm text-gray-700 dark:text-[#ccc]">{child.name}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-xs text-gray-400 dark:text-[#666]">{child.size}</span>
                                <span className="text-xs text-gray-400 dark:text-[#666]">{child.modified}</span>
                                <div className="relative">
                                      <input type="checkbox" checked={selectedFiles.includes(child.id)} onChange={() => toggleFile(child.id)} className="sr-only" />
                                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${selectedFiles.includes(child.id) ? 'bg-[#4285F4] border-[#4285F4]' : 'border-gray-300 dark:border-white/20 bg-white dark:bg-[#141414] hover:border-gray-400 dark:hover:border-white/30'}`}>
                                    {selectedFiles.includes(child.id) && <Check size={12} className="text-white" />}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
