import React from 'react';
import { HiX } from 'react-icons/hi';

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className={`relative bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] w-full ${sizes[size]} max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-xl pb-[env(safe-area-inset-bottom)] z-10`}>
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-white/[0.12]" />
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/[0.06]">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-[#ededed]">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] text-gray-400 dark:text-[#666] hover:text-gray-600 dark:hover:text-[#ccc] transition-colors">
            <HiX />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
