
import React, { useEffect } from 'react';
import { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

const Toast: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const getStyles = () => {
    switch(toast.type) {
      case 'level-up': return 'border-orange-500 bg-orange-500/10';
      case 'success': return 'border-emerald-500 bg-emerald-500/10';
      case 'warning': return 'border-red-500 bg-red-500/10';
      default: return 'border-neutral-700 bg-neutral-900';
    }
  };

  const getAccentColor = () => {
    switch(toast.type) {
      case 'level-up': return 'text-orange-500';
      case 'success': return 'text-emerald-500';
      case 'warning': return 'text-red-500';
      default: return 'text-neutral-400';
    }
  };

  return (
    <div className={`pointer-events-auto p-4 rounded-lg border backdrop-blur-md animate-in slide-in-from-right fade-in duration-300 ${getStyles()}`}>
      <div className="flex justify-between items-start gap-3">
        <div>
          <h4 className={`font-medium text-sm mono ${getAccentColor()}`}>{toast.title}</h4>
          <p className="text-sm text-neutral-400 mt-0.5">{toast.message}</p>
        </div>
        <button onClick={() => onRemove(toast.id)} className="text-neutral-600 hover:text-neutral-400 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
  );
};

export default ToastContainer;
