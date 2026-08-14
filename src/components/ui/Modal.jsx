import { X } from 'lucide-react';

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  tone = 'default',
  size = 'md',
  footer,
  bodyClassName,
  children,
}) {
  if (!open) return null;

  const chipClass =
    tone === 'danger'
      ? 'bg-red-50 dark:bg-red-900/20'
      : tone === 'success'
        ? 'bg-emerald-50 dark:bg-emerald-900/20'
        : 'bg-[var(--zelt-primary)]/8';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${SIZES[size]} bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] rounded-t-2xl sm:rounded-xl shadow-xl flex flex-col max-h-[92vh] overflow-hidden animate-in slide-in-from-bottom-3 fade-in duration-200 pb-[env(safe-area-inset-bottom)]`}
      >
        <div className="sm:hidden flex justify-center pt-2.5 pb-0 shrink-0">
          <span className="w-10 h-1 rounded-full bg-gray-200 dark:bg-white/[0.08]" />
        </div>
        {(title || icon) && (
          <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-100 dark:border-white/[0.06] shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {icon && (
                <div className={`w-9 h-9 rounded-lg ${chipClass} flex items-center justify-center shrink-0`}>
                  {icon}
                </div>
              )}
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-[#ededed]">{title}</h3>
                {subtitle && <p className="text-[11px] text-gray-400 dark:text-[#666] mt-0.5 truncate">{subtitle}</p>}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 dark:text-[#666] hover:text-gray-600 dark:hover:text-[#ccc] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className={`flex-1 min-h-0 ${bodyClassName || 'overflow-y-auto p-5'}`}>{children}</div>
        {footer && (
          <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-gray-100 dark:border-white/[0.06] shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
