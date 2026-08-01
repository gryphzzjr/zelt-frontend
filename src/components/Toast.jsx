import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlineInformationCircle, HiOutlineX } from 'react-icons/hi';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success', duration = 3000) => {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, message, type }]);
        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const success = useCallback((msg, dur) => addToast(msg, 'success', dur), [addToast]);
    const error = useCallback((msg, dur) => addToast(msg, 'error', dur), [addToast]);
    const info = useCallback((msg, dur) => addToast(msg, 'info', dur), [addToast]);
    const warning = useCallback((msg, dur) => addToast(msg, 'warning', dur), [addToast]);

    return (
        <ToastContext.Provider value={{ addToast, removeToast, success, error, info, warning }}>
            {children}
            {/* Toast container */}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function ToastItem({ toast, onRemove }) {
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setExiting(true), 2700);
        return () => clearTimeout(t);
    }, []);

    const icons = {
        success: HiOutlineCheckCircle,
        error: HiOutlineExclamationCircle,
        info: HiOutlineInformationCircle,
        warning: HiOutlineExclamationCircle,
    };
    const colors = {
        success: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: 'text-emerald-500' },
        error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-500' },
        info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-500' },
        warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'text-amber-500' },
    };

    const Icon = icons[toast.type] || icons.info;
    const c = colors[toast.type] || colors.info;

    return (
        <div
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border ${c.bg} ${c.border} shadow-lg min-w-[280px] max-w-[380px] transition-all duration-300 ${
                exiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
            }`}
            style={{ animation: 'slideIn 0.2s ease-out forwards' }}
        >
            <Icon size={18} className={c.icon} />
            <span className={`text-xs font-medium ${c.text} flex-1`}>{toast.message}</span>
            <button onClick={() => onRemove(toast.id)} className={`p-0.5 ${c.icon} opacity-50 hover:opacity-100 transition`}>
                <HiOutlineX size={14} />
            </button>
            <style>{`@keyframes slideIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }`}</style>
        </div>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
