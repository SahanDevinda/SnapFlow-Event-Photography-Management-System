import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = `${Date.now()}-${Math.random()}`;
    const text = typeof message === 'string' ? message : String(message ?? '');
    setToasts((prev) => [...prev, { id, message: text, type }]);

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }, [removeToast]);

  const showSuccess = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const showError = useCallback((msg) => addToast(msg, 'error', 5000), [addToast]);
  const showWarning = useCallback((msg) => addToast(msg, 'warning', 5000), [addToast]);
  const showInfo = useCallback((msg) => addToast(msg, 'info'), [addToast]);

  // Pages use both `toast.success(...)` and `const { showSuccess } = useToast()`,
  // so the context exposes both naming styles.
  const value = useMemo(() => ({
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo
  }), [addToast, removeToast, showSuccess, showError, showWarning, showInfo]);

  const styles = {
    success: 'bg-emerald-800 text-white',
    error: 'bg-rose-800 text-white',
    warning: 'bg-amber-700 text-white',
    info: 'bg-navy-900 text-white border border-navy-700'
  };

  const icons = {
    success: <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-200 shrink-0" />,
    info: <Info className="w-4 h-4 text-gold-400 shrink-0" />
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-lg shadow-lg text-sm animate-slide-in ${styles[toast.type] || styles.info}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {icons[toast.type] || icons.info}
              <span className="break-words">{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              className="p-1 hover:bg-white/20 rounded transition shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside a <ToastProvider>');
  }
  return ctx;
};
