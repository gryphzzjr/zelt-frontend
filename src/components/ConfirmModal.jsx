import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { HiOutlineX } from 'react-icons/hi';

export default function ConfirmModal({ title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', danger = false, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20" onClick={onCancel}>
            <style>{`@keyframes fadeConfirm { from { opacity: 0; } to { opacity: 1; } } @keyframes scaleConfirm { from { transform: scale(0.97); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
            <div
                className="w-full max-w-sm bg-white rounded-2xl border border-gray-200/60 shadow-xl"
                onClick={e => e.stopPropagation()}
                style={{ animation: 'scaleConfirm 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
            >
                <div className="flex items-start gap-3 p-5 pb-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${danger ? 'bg-red-50' : 'bg-amber-50'}`}>
                        <FaExclamationTriangle size={20} className={danger ? 'text-red-500' : 'text-amber-500'} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{message}</p>
                    </div>
                    <button onClick={onCancel} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition shrink-0">
                        <HiOutlineX size={15} />
                    </button>
                </div>

                <div className="flex items-center gap-2 p-4 mt-4 border-t border-gray-100">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200/60 rounded-lg hover:bg-gray-100 transition"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 px-3 py-2 text-xs font-medium text-white rounded-lg transition ${
                            danger ? 'bg-red-500 hover:bg-red-600' : 'bg-[#6300ff] hover:bg-[#5200d6]'
                        }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
