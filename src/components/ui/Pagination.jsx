import { ChevronLeft, ChevronRight } from 'lucide-react';

function getPageItems(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push('...');
  for (let p = start; p <= end; p++) items.push(p);
  if (end < total - 1) items.push('...');
  items.push(total);
  return items;
}

export default function Pagination({ page, totalPages, onPageChange, total, pageSize, label }) {
  if (!total) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const items = getPageItems(page, totalPages);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-3 border-t border-gray-100 dark:border-white/[0.06]">
      <span className="text-xs text-gray-400 dark:text-[#666]">
        {`Mostrando ${from}–${to} de ${total}`}{label ? ` ${label}` : ''}
      </span>

      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-white/[0.06] text-gray-400 dark:text-[#666] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] disabled:opacity-30 transition-colors"
            aria-label="Pagina anterior"
          >
            <ChevronLeft size={14} />
          </button>

          {items.map((item, i) =>
            item === '...' ? (
              <span key={`ellipsis-${i}`} className="px-1 text-xs text-gray-400 dark:text-[#666]">
                ...
              </span>
            ) : (
              <button
                key={item}
                onClick={() => onPageChange(item)}
                className={`min-w-8 h-8 px-2 rounded-lg text-xs transition-colors ${
                  item === page
                    ? 'bg-[var(--zelt-primary)] text-white'
                    : 'text-gray-500 dark:text-[#808080] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] border border-gray-200 dark:border-white/[0.06]'
                }`}
              >
                {item}
              </button>
            )
          )}

          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-white/[0.06] text-gray-400 dark:text-[#666] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] disabled:opacity-30 transition-colors"
            aria-label="Proxima pagina"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
