import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search, ArrowLeft, X, Clock, TrendingUp, Sparkles, ChevronRight,
} from 'lucide-react';
import {
  SEARCH_INDEX, getSuggestions, getRecommended,
  loadHistory, pushHistory, saveHistory, Highlight,
} from '../../lib/searchIndex';

function SectionHeader({ icon: Icon, title, action, onAction }) {
  return (
    <div className="flex items-center justify-between mb-2 px-1">
      <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-[#666]">
        <Icon size={12} />
        {title}
      </span>
      {action && (
        <button
          onClick={onAction}
          className="text-[10px] font-medium text-[var(--zelt-primary)] hover:underline"
        >
          {action}
        </button>
      )}
    </div>
  );
}

function EntryRow({ entry, q, onClick, right }) {
  const Icon = entry.icon;
  return (
    <button
      onClick={onClick}
      className="group w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
    >
      <span className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 flex items-center justify-center shrink-0 group-hover:bg-[var(--zelt-primary)]/10 group-hover:text-[var(--zelt-primary)] transition-colors">
        <Icon size={16} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[13px] font-medium text-gray-900 dark:text-[#ededed] truncate">
          <Highlight text={entry.label} q={q} />
        </span>
        <span className="block text-[10px] text-gray-400 dark:text-[#666] truncate">{entry.parent}</span>
      </span>
      {right || <ChevronRight size={14} className="text-gray-300 dark:text-[#555] shrink-0" />}
    </button>
  );
}

export default function SearchView({ onNavigate, onBack, fullscreen = true }) {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState(loadHistory);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const suggestions = useMemo(() => getSuggestions(query), [query]);

  const recommended = useMemo(() => getRecommended(), []);

  const addHistory = (label, view) => {
    setHistory((prev) => pushHistory(prev, label, view));
  };

  const removeHistory = (id) => {
    setHistory((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveHistory(next);
      return next;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  const select = (entry) => {
    addHistory(entry.label, entry.id);
    onNavigate?.(entry.id);
  };

  const selectHistory = (item) => {
    addHistory(item.label, item.view);
    onNavigate?.(item.view);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      select(suggestions[0]);
    } else if (e.key === 'Escape') {
      onBack?.();
    }
  };

  return (
    <div className={`flex flex-col bg-gray-50/60 dark:bg-[#050505] text-gray-800 ${fullscreen ? 'h-[100dvh]' : 'h-[calc(100dvh-108px)]'}`}>
      <div className="shrink-0 bg-white/85 dark:bg-[#0a0a0a]/85 backdrop-blur-xl border-b border-gray-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5 px-3 sm:px-4 h-16">
          <button
            onClick={onBack}
            className="p-2 -ml-1 rounded border border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#666]" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              type="text"
              placeholder="Buscar conversas, contatos ou relatorios..."
              className="w-full py-2.5 pl-9 pr-9 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/[0.08] rounded-lg focus:outline-none focus:border-[var(--zelt-primary)]/50 focus:bg-white dark:focus:bg-white/5 transition-all duration-200 text-gray-900 dark:text-[#ededed] placeholder-gray-400 dark:placeholder-[#555]"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded text-gray-400 dark:text-[#666] hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                aria-label="Limpar busca"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-5 w-full max-w-2xl mx-auto">
        {query.trim() ? (
          <div className="view-enter">
            <SectionHeader
              icon={Sparkles}
              title={`Sugestoes (${suggestions.length})`}
            />
            {suggestions.length > 0 ? (
              <>
                <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.08] rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-white/[0.06]">
                  {suggestions.map((entry) => (
                    <EntryRow key={entry.id} entry={entry} q={query} onClick={() => select(entry)} />
                  ))}
                </div>
                <p className="text-center text-[10px] text-gray-400 dark:text-[#666] mt-4">
                  Pressione <kbd className="px-1 py-0.5 rounded border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/5">Enter</kbd> para abrir &quot;{suggestions[0].label}&quot;
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                  <Search size={22} className="text-gray-300 dark:text-[#555]" />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-[#ccc]">
                  Nenhum resultado para &quot;{query.trim()}&quot;
                </p>
                <p className="text-xs text-gray-400 dark:text-[#666] mt-1">
                  Tente buscar por conversas, integracoes ou tarefas
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="view-enter space-y-7">
            {history.length > 0 && (
              <section>
                <SectionHeader icon={Clock} title="Buscas recentes" action="Limpar" onAction={clearHistory} />
                <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.08] rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-white/[0.06]">
                  {history.map((item) => {
                    const entry = SEARCH_INDEX.find((e) => e.id === item.view);
                    return (
                      <button
                        key={item.id}
                        onClick={() => selectHistory(item)}
                        className="group w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                      >
                        <span className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 flex items-center justify-center shrink-0 group-hover:text-[var(--zelt-primary)] transition-colors">
                          <Clock size={15} />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-[13px] font-medium text-gray-900 dark:text-[#ededed] truncate">{item.label}</span>
                          <span className="block text-[10px] text-gray-400 dark:text-[#666] truncate">{entry?.parent || 'Busca'}</span>
                        </span>
                        <span
                          role="button"
                          tabIndex={-1}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeHistory(item.id);
                          }}
                          className="p-1.5 rounded text-gray-300 dark:text-[#555] max-md:opacity-100 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                          aria-label="Remover da busca"
                        >
                          <X size={14} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            <section>
              <SectionHeader icon={TrendingUp} title="Recomendados" />
              <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.08] rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-white/[0.06]">
                {recommended.map((entry) => (
                  <EntryRow key={entry.id} entry={entry} onClick={() => select(entry)} />
                ))}
              </div>
            </section>

            <p className="text-center text-[10px] text-gray-400 dark:text-[#666]">
              Busca rapida no painel. Digite para ver sugestoes automaticas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
