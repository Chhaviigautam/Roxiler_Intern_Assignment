import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
const ToastContext = createContext(null);
export const ToastProvider = ({
  children
}) => {
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, {
      id,
      message,
      type
    }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);
  return <ToastContext.Provider value={{
    showToast
  }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => <div key={t.id} className={`toast toast-${t.type}`}>
            {t.type === 'success' ? <CheckCircle size={16} color="var(--color-success)" /> : <XCircle size={16} color="var(--color-error)" />}
            <span>{t.message}</span>
          </div>)}
      </div>
    </ToastContext.Provider>;
};
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};