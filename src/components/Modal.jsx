import React from 'react';
import { HiX } from 'react-icons/hi';

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className={`relative bg-white border border-gray-200 w-full ${sizes[size]} z-10`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <HiX />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
