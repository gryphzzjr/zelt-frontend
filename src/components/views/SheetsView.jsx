import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Plus, ArrowLeft, Download, Trash2, X, ChevronRight, Pencil, FileSpreadsheet,
  Columns3, Rows3, Save, CheckCircle2, AlertTriangle, MoreVertical,
  Database, Bot,
} from 'lucide-react';
import { sheetsApi } from '../../lib/api';

// ==================== FORMULA ENGINE ====================

function colName(c) {
  if (c < 26) return String.fromCharCode(65 + c);
  return String.fromCharCode(65 + Math.floor(c / 26) - 1) + String.fromCharCode(65 + (c % 26));
}

function refToCell(ref) {
  const m = String(ref).toUpperCase().match(/^([A-Z]+)(\d+)$/);
  if (!m) return null;
  let col = 0;
  for (let i = 0; i < m[1].length; i++) col = col * 26 + (m[1].charCodeAt(i) - 64);
  return [parseInt(m[2], 10) - 1, col - 1];
}

const FORMULA_FUNCS = {
  SUM: (vals) => vals.reduce((a, b) => a + b, 0),
  SOMA: (vals) => vals.reduce((a, b) => a + b, 0),
  AVERAGE: (vals) => (vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0),
  AVG: (vals) => (vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0),
  MEDIA: (vals) => (vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0),
  COUNT: (vals) => vals.filter((v) => Number.isFinite(v)).length,
  CONTAR: (vals) => vals.filter((v) => Number.isFinite(v)).length,
  MIN: (vals) => (vals.length ? Math.min(...vals) : 0),
  MAX: (vals) => (vals.length ? Math.max(...vals) : 0),
};

function cellRaw(cells, r, c) {
  const v = cells[`${r}:${c}`];
  return v === undefined || v === null ? '' : String(v);
}

function resolveCellValue(cells, r, c, selfR, selfC, stack) {
  const key = `${r}:${c}`;
  if (stack.includes(key)) throw new Error('circular');
  const raw = cellRaw(cells, r, c);
  if (raw === '') return 0;
  if (raw.startsWith('=')) {
    const val = evalFormula(raw.slice(1), cells, r, c, [...stack, key]);
    return typeof val === 'number' && Number.isFinite(val) ? val : 0;
  }
  const n = Number(String(raw).replace(',', '.').trim());
  return Number.isFinite(n) ? n : 0;
}

function evalArith(expr) {
  const ops = { '+': (a, b) => a + b, '-': (a, b) => a - b, '*': (a, b) => a * b, '/': (a, b) => a / b };
  const prec = { '+': 1, '-': 1, '*': 2, '/': 2 };
  const tokens = expr.match(/(\d+\.?\d*|[-+*/()])/g);
  if (!tokens) return 0;
  const output = [];
  const stack = [];
  for (const tok of tokens) {
    if (/^\d/.test(tok)) output.push(parseFloat(tok));
    else if (tok === '(') stack.push(tok);
    else if (tok === ')') {
      while (stack.length && stack[stack.length - 1] !== '(') output.push(stack.pop());
      stack.pop();
    } else {
      while (stack.length && prec[stack[stack.length - 1]] >= prec[tok]) output.push(stack.pop());
      stack.push(tok);
    }
  }
  while (stack.length) output.push(stack.pop());
  const ev = [];
  for (const tok of output) {
    if (typeof tok === 'number') ev.push(tok);
    else {
      const b = ev.pop();
      const a = ev.pop();
      if (a === undefined || b === undefined) throw new Error('expr invalida');
      ev.push(ops[tok](a, b));
    }
  }
  const result = ev[0] ?? 0;
  if (!Number.isFinite(result)) throw new Error('resultado invalido');
  return result;
}

function evalFormula(expr, cells, selfR, selfC, stack = []) {
  let e = String(expr).toUpperCase().replace(/\s+/g, '');
  const fnRe = /([A-Z]+)\(([^()]*)\)/;
  let guard = 0;
  while (fnRe.test(e) && guard++ < 50) {
    e = e.replace(fnRe, (_, fnName, inner) => {
      const fn = fnName.trim();
      if (!FORMULA_FUNCS[fn]) throw new Error(`funcao ${fn} desconhecida`);
      const parts = inner.split(',');
      const values = [];
      for (const part of parts) {
        const p = part.trim();
        if (!p) continue;
        if (/^[A-Z]+\d+:[A-Z]+\d+$/.test(p)) {
          const [aRef, bRef] = p.split(':');
          const a = refToCell(aRef);
          const b = refToCell(bRef);
          const r1 = Math.min(a[0], b[0]);
          const r2 = Math.max(a[0], b[0]);
          const c1 = Math.min(a[1], b[1]);
          const c2 = Math.max(a[1], b[1]);
          for (let r = r1; r <= r2; r++) {
            for (let c = c1; c <= c2; c++) values.push(resolveCellValue(cells, r, c, selfR, selfC, stack));
          }
        } else if (/^[A-Z]+\d+$/.test(p)) {
          const cell = refToCell(p);
          values.push(resolveCellValue(cells, cell[0], cell[1], selfR, selfC, stack));
        } else {
          const n = Number(p);
          values.push(Number.isFinite(n) ? n : 0);
        }
      }
      return String(FORMULA_FUNCS[fn](values));
    });
  }
  e = e.replace(/\$?([A-Z]+\d+)/g, (_, ref) => {
    const cell = refToCell(ref);
    if (cell[0] === selfR && cell[1] === selfC) throw new Error('circular');
    return String(resolveCellValue(cells, cell[0], cell[1], selfR, selfC, stack));
  });
  return evalArith(e);
}

function displayCell(cells, r, c) {
  const raw = cellRaw(cells, r, c);
  if (raw === '') return '';
  if (!raw.startsWith('=')) return raw;
  try {
    const val = evalFormula(raw.slice(1), cells, r, c);
    if (typeof val === 'number') {
      return Number.isInteger(val) ? String(val) : String(Math.round(val * 1e6) / 1e6);
    }
    return String(val);
  } catch {
    return '#ERRO';
  }
}

// ==================== HELPERS ====================

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'ontem';
  if (days < 30) return `${days} dias`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

const WORKBOOK_COLORS = ['#6300ff', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

export default function SheetsView() {
  const [workbooks, setWorkbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ workbooks: 0, sheets: 0, itens: 0, consulted: 0 });
  const [active, setActive] = useState(null);
  const [cells, setCells] = useState({});
  const [rows, setRows] = useState(50);
  const [cols, setCols] = useState(26);
  const [edit, setEdit] = useState(null);
  const [draft, setDraft] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newData, setNewData] = useState({ title: '', description: '', color: '#6300ff' });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameName, setRenameName] = useState('');
  const [saveState, setSaveState] = useState('saved');
  const [menuOpen, setMenuOpen] = useState(null);

  const saveTimer = useRef(null);
  const skipSave = useRef(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadWorkbooks = useCallback(async () => {
    try {
      const res = await sheetsApi.listWorkbooks();
      setWorkbooks(res.workbooks || []);
    } catch (err) {
      console.error('Failed to load workbooks:', err);
    }
  }, []);

  useEffect(() => {
    loadWorkbooks().then(() => setLoading(false));
  }, [loadWorkbooks]);

  useEffect(() => {
    sheetsApi.stats()
      .then((res) => setStats({
        workbooks: res.workbooks || 0,
        sheets: res.sheets || 0,
        itens: res.itens || 0,
        consulted: res.consulted || 0,
      }))
      .catch(() => {});
  }, []);

  const flushSave = useCallback(async () => {
    if (!active) return;
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    try {
      await sheetsApi.saveCells(active.sheetId, cells);
      setSaveState('saved');
    } catch (err) {
      console.error('Failed to save cells:', err);
      setSaveState('error');
    }
  }, [active, cells]);

  useEffect(() => {
    if (!active) return;
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveState('saving');
    saveTimer.current = setTimeout(() => {
      sheetsApi.saveCells(active.sheetId, cells)
        .then(() => setSaveState('saved'))
        .catch(() => setSaveState('error'));
    }, 900);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [cells, active]);

  // ---------- OPEN / NAVIGATE ----------

  const openWorkbook = async (workbookId) => {
    try {
      const res = await sheetsApi.getWorkbook(workbookId);
      const wb = res.workbook;
      const first = wb.sheets?.[0];
      if (!first) return;
      setActive({ workbook: wb, sheets: wb.sheets, sheetId: first.id });
      skipSave.current = true;
      setCells(first.cells || {});
      setRows(first.rows || 50);
      setCols(first.cols || 26);
      setSaveState('saved');
    } catch (err) {
      console.error('Failed to open workbook:', err);
    }
  };

  const switchSheet = async (sheetId) => {
    if (!active) return;
    await flushSave();
    try {
      const res = await sheetsApi.getSheet(sheetId);
      const sheet = res.sheet;
      setActive((prev) => ({ ...prev, sheetId }));
      skipSave.current = true;
      setCells(sheet.cells || {});
      setRows(sheet.rows || 50);
      setCols(sheet.cols || 26);
      setEdit(null);
      setSaveState('saved');
    } catch (err) {
      console.error('Failed to switch sheet:', err);
    }
  };

  const backToList = async () => {
    await flushSave();
    setActive(null);
    setEdit(null);
    await loadWorkbooks();
  };

  // ---------- CELL EDITING ----------

  const startEdit = (r, c) => {
    setEdit({ r, c });
    setDraft(cellRaw(cells, r, c));
  };

  const commitEdit = () => {
    if (!edit) return;
    const { r, c } = edit;
    setCells((prev) => {
      const next = { ...prev };
      if (draft === '') delete next[`${r}:${c}`];
      else next[`${r}:${c}`] = draft;
      return next;
    });
    setEdit(null);
  };

  const cancelEdit = () => setEdit(null);

  const handleCellKeyDown = (e) => {
    if (!edit) return;
    if (e.key === 'Escape') {
      cancelEdit();
      return;
    }
    if (e.key === 'Enter') {
      const { r, c } = edit;
      commitEdit();
      const nr = Math.min(r + 1, rows - 1);
      setEdit({ r: nr, c });
      setDraft(cellRaw(cells, nr, c));
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const { r, c } = edit;
      commitEdit();
      const nc = Math.min(c + 1, cols - 1);
      setEdit({ r, c: nc });
      setDraft(cellRaw(cells, r, nc));
    }
  };

  // ---------- WORKBOOK / SHEET CRUD ----------

  const handleCreateWorkbook = async () => {
    try {
      const res = await sheetsApi.createWorkbook(newData);
      setShowNew(false);
      setNewData({ title: '', description: '', color: '#6300ff' });
      await loadWorkbooks();
      await openWorkbook(res.workbook.id);
    } catch (err) {
      console.error('Failed to create workbook:', err);
    }
  };

  const handleAddSheet = async () => {
    if (!active) return;
    try {
      await sheetsApi.createSheet(active.workbook.id, {});
      const res = await sheetsApi.getWorkbook(active.workbook.id);
      setActive((prev) => ({ ...prev, workbook: res.workbook, sheets: res.workbook.sheets }));
    } catch (err) {
      console.error('Failed to create sheet:', err);
    }
  };

  const handleRename = async () => {
    if (!renameTarget) return;
    try {
      if (renameTarget.type === 'workbook') {
        await sheetsApi.updateWorkbook(renameTarget.id, { title: renameName });
        setActive((prev) => ({ ...prev, workbook: { ...prev.workbook, title: renameName } }));
      } else {
        await sheetsApi.updateSheet(renameTarget.id, { name: renameName });
        setActive((prev) => ({
          ...prev,
          sheets: prev.sheets.map((s) => (s.id === renameTarget.id ? { ...s, name: renameName } : s)),
        }));
      }
      setRenameTarget(null);
    } catch (err) {
      console.error('Failed to rename:', err);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      if (confirmDelete.type === 'workbook') {
        await sheetsApi.deleteWorkbook(confirmDelete.id);
        await backToList();
      } else {
        await sheetsApi.deleteSheet(confirmDelete.id);
        const res = await sheetsApi.getWorkbook(active.workbook.id);
        const sheets = res.workbook.sheets;
        const nextId = sheets.find((s) => s.id !== confirmDelete.id)?.id || sheets[0]?.id;
        setActive((prev) => ({ ...prev, workbook: res.workbook, sheets, sheetId: nextId }));
        if (nextId) {
          const sheetRes = await sheetsApi.getSheet(nextId);
          skipSave.current = true;
          setCells(sheetRes.sheet.cells || {});
          setRows(sheetRes.sheet.rows || 50);
          setCols(sheetRes.sheet.cols || 26);
        }
      }
      setConfirmDelete(null);
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const addRow = () => setRows((r) => Math.min(r + 10, 500));
  const addCol = () => setCols((c) => Math.min(c + 5, 52));

  const saveIndicator = useMemo(() => {
    if (saveState === 'saving') return { icon: Save, text: 'Salvando...', cls: 'text-amber-500' };
    if (saveState === 'error') return { icon: AlertTriangle, text: 'Falha ao salvar', cls: 'text-red-500' };
    return { icon: CheckCircle2, text: 'Salvo', cls: 'text-emerald-500' };
  }, [saveState]);

  // ---------- RENDER: EDITOR ----------

  if (active) {
    const SaveIcon = saveIndicator.icon;
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300;1,9..40,400&display=swap');
          .sheets-view * { font-family: 'DM Sans', system-ui, sans-serif; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .fade-in { animation: fadeIn 0.15s ease-out; }
          .sheet-grid th { position: sticky; top: 0; z-index: 10; background: #f9fafb; }
          .dark .sheet-grid th { background: #161616; }
          .sheet-grid th.row-head { left: 0; z-index: 20; }
          .sheet-grid td.row-head { position: sticky; left: 0; z-index: 5; }
        `}</style>
        <div className="sheets-view min-h-full">
          {/* EDITOR HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <button onClick={backToList}
                className="p-2 rounded-lg border border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-[#aaa] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors shrink-0">
                <ArrowLeft size={16} />
              </button>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl text-gray-900 dark:text-[#ededed] truncate">{active.workbook.title}</h1>
                <p className="text-sm text-gray-400 dark:text-[#666] flex items-center gap-1.5">
                  <span className="flex items-center gap-1.5"><SaveIcon size={12} className={saveIndicator.cls} />{saveIndicator.text}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a href={sheetsApi.exportUrl(active.workbook.id)} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-3.5 py-2.5 text-sm border border-gray-200 dark:border-white/[0.08] rounded-lg text-gray-600 dark:text-[#ccc] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                <Download size={15} /> Exportar CSV
              </a>
              <div className="relative" ref={menuRef}>
                <button onClick={() => setMenuOpen(menuOpen === 'wb' ? null : 'wb')}
                  className="p-2.5 rounded-lg border border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-[#aaa] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                  <MoreVertical size={16} />
                </button>
                {menuOpen === 'wb' && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/[0.08] rounded-lg py-1.5 z-30 shadow-sm fade-in">
                    <button onClick={() => { setRenameTarget({ type: 'workbook', id: active.workbook.id, name: active.workbook.title }); setRenameName(active.workbook.title); setMenuOpen(null); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 dark:text-[#ccc] hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                      <Pencil size={14} /> Renomear
                    </button>
                    <div className="border-t border-gray-100 dark:border-white/[0.06] my-1"></div>
                    <button onClick={() => { setConfirmDelete({ type: 'workbook', id: active.workbook.id, name: active.workbook.title }); setMenuOpen(null); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <Trash2 size={14} /> Excluir
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SHEET TABS */}
          <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
            {active.sheets.map((s) => (
              <button key={s.id} onClick={() => switchSheet(s.id)}
                className={`group flex items-center gap-1.5 px-3.5 py-2 text-sm rounded-lg border transition-colors shrink-0 ${
                  s.id === active.sheetId
                    ? 'bg-[var(--zelt-primary)] text-white border-[var(--zelt-primary)]'
                    : 'bg-white dark:bg-[#141414] text-gray-600 dark:text-[#ccc] border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'
                }`}>
                <FileSpreadsheet size={13} />
                {s.name}
                {s.id !== active.sheetId && (
                  <button onClick={(e) => { e.stopPropagation(); setConfirmDelete({ type: 'sheet', id: s.id, name: s.name }); }}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity p-0.5">
                    <X size={11} />
                  </button>
                )}
              </button>
            ))}
            <button onClick={handleAddSheet}
              className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-dashed border-gray-300 dark:border-white/[0.15] text-gray-500 dark:text-[#aaa] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors shrink-0">
              <Plus size={14} /> Aba
            </button>
          </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Planilhas', value: stats.workbooks, icon: FileSpreadsheet, color: 'text-[var(--zelt-primary)]', bg: 'bg-[var(--zelt-primary)]/5', iconColor: 'text-[var(--zelt-primary)]' },
            { label: 'Abas', value: stats.sheets, icon: Columns3, color: 'text-blue-600', bg: 'bg-blue-50', iconColor: 'text-blue-400' },
            { label: 'Itens cadastrados', value: stats.itens, icon: Database, color: 'text-emerald-600', bg: 'bg-emerald-50', iconColor: 'text-emerald-400' },
            { label: 'Consultas pela IA', value: stats.consulted, icon: Bot, color: 'text-purple-600', bg: 'bg-purple-50', iconColor: 'text-purple-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-lg p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                <stat.icon size={18} className={stat.iconColor} />
              </div>
              <div className="min-w-0">
                <p className={`text-xl ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-gray-400 dark:text-[#666] truncate">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* GRID */}
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl overflow-hidden">
            <div className="overflow-auto max-h-[62vh] sheet-grid">
              <table className="border-collapse w-max min-w-full">
                <thead>
                  <tr>
                    <th className="row-head text-xs font-medium text-gray-400 dark:text-[#666] border-b border-r border-gray-200 dark:border-white/[0.06] p-0 h-9 w-11 text-center">#</th>
                    {Array.from({ length: cols }, (_, c) => (
                      <th key={c} className="text-xs font-medium text-gray-400 dark:text-[#666] border-b border-r border-gray-200 dark:border-white/[0.06] p-0 h-9 min-w-[90px] text-center">{colName(c)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: rows }, (_, r) => (
                    <tr key={r}>
                      <td className="row-head text-xs text-gray-400 dark:text-[#666] border-b border-r border-gray-200 dark:border-white/[0.06] p-0 h-9 w-11 text-center bg-gray-50/70 dark:bg-[#161616]/70">{r + 1}</td>
                      {Array.from({ length: cols }, (_, c) => {
                        const isEditing = edit && edit.r === r && edit.c === c;
                        const isSelected = edit && edit.r === r && edit.c === c;
                        const shown = isEditing ? draft : displayCell(cells, r, c);
                        return (
                          <td key={c} className="border-b border-r border-gray-200 dark:border-white/[0.06] p-0 h-9 min-w-[90px]">
                            {isEditing ? (
                              <input
                                autoFocus
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                onBlur={commitEdit}
                                onKeyDown={handleCellKeyDown}
                                className="w-full h-9 px-2.5 text-sm text-gray-900 dark:text-[#ededed] bg-[var(--zelt-primary)]/5 outline-none ring-2 ring-[var(--zelt-primary)]/50"
                              />
                            ) : (
                              <div
                                onClick={() => startEdit(r, c)}
                                className={`w-full h-9 px-2.5 flex items-center text-sm truncate cursor-text transition-colors ${
                                  isSelected
                                    ? 'bg-[var(--zelt-primary)]/5 text-gray-900 dark:text-[#ededed]'
                                    : shown === '#ERRO'
                                      ? 'text-red-500 bg-red-50/40 dark:bg-red-900/10'
                                      : 'text-gray-900 dark:text-[#ededed]'
                                }`}
                                title={cellRaw(cells, r, c)}
                              >
                                {shown}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-2 p-2.5 border-t border-gray-100 dark:border-white/[0.06] flex-wrap">
              <button onClick={addRow} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-500 dark:text-[#aaa] border border-gray-200 dark:border-white/[0.08] rounded-lg hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                <Rows3 size={13} /> + Linhas
              </button>
              <button onClick={addCol} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-500 dark:text-[#aaa] border border-gray-200 dark:border-white/[0.08] rounded-lg hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                <Columns3 size={13} /> + Colunas
              </button>
              <span className="text-xs text-gray-400 dark:text-[#666] ml-auto">{rows} linhas x {cols} colunas</span>
            </div>
          </div>
        </div>

        {/* RENAME MODAL */}
        {renameTarget && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20 fade-in p-0 sm:p-4" onClick={() => setRenameTarget(null)}>
            <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-t-2xl sm:rounded-xl w-full max-w-[400px] p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-base text-gray-900 dark:text-[#ededed] mb-4">{renameTarget.type === 'workbook' ? 'Renomear planilha' : 'Renomear aba'}</h3>
              <input
                value={renameName}
                onChange={(e) => setRenameName(e.target.value)}
                autoFocus
                placeholder="Nome"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-white/[0.08] rounded-lg bg-white dark:bg-[#141414] text-gray-900 dark:text-[#ededed] placeholder-gray-400 focus:border-[var(--zelt-primary)]/40 outline-none mb-5"
              />
              <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                <button onClick={() => setRenameTarget(null)} className="px-4 py-2 text-sm border border-gray-200 dark:border-white/[0.08] rounded-lg text-gray-600 dark:text-[#ccc] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">Cancelar</button>
                <button onClick={handleRename} className="px-4 py-2 text-sm bg-[var(--zelt-primary)] text-white rounded-lg hover:bg-[var(--zelt-primary-hover)] transition-colors">Salvar</button>
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
                <h3 className="text-base text-gray-900 dark:text-[#ededed]">Excluir {confirmDelete.type === 'workbook' ? 'planilha' : 'aba'}</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-[#888] mb-5">Tem certeza que deseja excluir "{confirmDelete.name}"? Esta acao nao pode ser desfeita.</p>
              <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm border border-gray-200 dark:border-white/[0.08] rounded-lg text-gray-600 dark:text-[#ccc] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">Cancelar</button>
                <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Excluir</button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ---------- RENDER: WORKBOOK LIST ----------

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300;1,9..40,400&display=swap');
        .sheets-view * { font-family: 'DM Sans', system-ui, sans-serif; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .fade-in { animation: fadeIn 0.15s ease-out; }
        @keyframes sheetIn { from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); } }
        .sheet-in { animation: sheetIn 0.25s ease-out; }
      `}</style>
      <div className="sheets-view">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-xl sm:text-2xl text-gray-900 dark:text-[#ededed]">Planilhas</h1>
            <p className="text-sm text-gray-400 dark:text-[#666] mt-1">Crie planilhas, use formulas e exporte dados</p>
          </div>
          <button onClick={() => setShowNew(true)}
            className="flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2.5 bg-[var(--zelt-primary)] text-white rounded-lg text-sm hover:bg-[var(--zelt-primary-hover)] transition-colors">
            <Plus size={16} /> Nova Planilha
          </button>
        </div>

        {/* GRID */}
        {!loading && workbooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {workbooks.map((wb) => (
              <button key={wb.id} onClick={() => openWorkbook(wb.id)}
                className="group text-left bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-5 hover:border-gray-300 dark:hover:border-white/[0.12] hover:shadow-sm transition-all">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${wb.color}14`, color: wb.color }}>
                  <FileSpreadsheet size={20} />
                </div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-[#ededed] truncate mb-1">{wb.title}</h3>
                <p className="text-xs text-gray-400 dark:text-[#666] truncate mb-3">
                  {wb.description || (wb._count?.sheets ? `${wb._count.sheets} aba(s)` : 'Sem descricao')}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 dark:text-[#555]">{timeAgo(wb.updatedAt)}</span>
                  <ChevronRight size={15} className="text-gray-300 dark:text-[#555] group-hover:text-[var(--zelt-primary)] group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            ))}
          </div>
        ) : !loading ? (
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-12 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-[var(--zelt-primary)]/5 flex items-center justify-center text-[var(--zelt-primary)] mb-4">
              <FileSpreadsheet size={24} />
            </div>
            <h3 className="text-sm text-gray-900 dark:text-[#ededed] mb-1">Nenhuma planilha</h3>
            <p className="text-sm text-gray-400 dark:text-[#666] max-w-[300px] leading-relaxed mb-5">Crie sua primeira planilha para organizar leads, vendas e dados.</p>
            <button onClick={() => setShowNew(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[var(--zelt-primary)] text-white rounded-lg text-sm hover:bg-[var(--zelt-primary-hover)] transition-colors">
              <Plus size={16} /> Criar planilha
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-xl p-12 flex justify-center">
            <div className="w-5 h-5 border-2 border-[var(--zelt-primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* NEW WORKBOOK MODAL */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20 fade-in p-0 sm:p-4" onClick={() => setShowNew(false)}>
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-t-2xl sm:rounded-xl w-full max-w-[420px] p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sheet-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base text-gray-900 dark:text-[#ededed]">Nova planilha</h3>
              <button onClick={() => setShowNew(false)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#1a1a1a] text-gray-400 dark:text-[#666] transition-colors">
                <X size={16} />
              </button>
            </div>

            <label className="block text-xs font-medium text-gray-500 dark:text-[#888] mb-1.5">Titulo</label>
            <input
              value={newData.title}
              onChange={(e) => setNewData((d) => ({ ...d, title: e.target.value }))}
              autoFocus
              placeholder="Ex: Controle de vendas"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-white/[0.08] rounded-lg bg-white dark:bg-[#141414] text-gray-900 dark:text-[#ededed] placeholder-gray-400 focus:border-[var(--zelt-primary)]/40 outline-none mb-4"
            />

            <label className="block text-xs font-medium text-gray-500 dark:text-[#888] mb-1.5">Descricao (opcional)</label>
            <input
              value={newData.description}
              onChange={(e) => setNewData((d) => ({ ...d, description: e.target.value }))}
              placeholder="Ex: Controle mensal de orcamentos"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-white/[0.08] rounded-lg bg-white dark:bg-[#141414] text-gray-900 dark:text-[#ededed] placeholder-gray-400 focus:border-[var(--zelt-primary)]/40 outline-none mb-4"
            />

            <label className="block text-xs font-medium text-gray-500 dark:text-[#888] mb-2">Cor</label>
            <div className="flex items-center gap-2 mb-6">
              {WORKBOOK_COLORS.map((color) => (
                <button key={color} onClick={() => setNewData((d) => ({ ...d, color }))}
                  className={`w-7 h-7 rounded-lg transition-transform ${newData.color === color ? 'ring-2 ring-offset-2 dark:ring-offset-[#141414] scale-110' : 'hover:scale-105'}`}
                  style={{ background: color, ...(newData.color === color ? { boxShadow: `0 0 0 2px ${color}` } : {}) }}>
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
              <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm border border-gray-200 dark:border-white/[0.08] rounded-lg text-gray-600 dark:text-[#ccc] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">Cancelar</button>
              <button onClick={handleCreateWorkbook} disabled={!newData.title.trim()}
                className="px-4 py-2 text-sm bg-[var(--zelt-primary)] text-white rounded-lg hover:bg-[var(--zelt-primary-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
