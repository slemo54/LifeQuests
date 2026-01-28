
import React, { useEffect } from 'react';
import { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-24 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
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
    }, 5000); // Auto close after 5s
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const getColors = () => {
    switch(toast.type) {
      case 'level-up': return 'bg-yellow-900/90 border-yellow-500 text-yellow-100';
      case 'success': return 'bg-emerald-900/90 border-emerald-500 text-emerald-100';
      case 'warning': return 'bg-orange-900/90 border-orange-500 text-orange-100';
      default: return 'bg-slate-800/90 border-slate-500 text-slate-100';
    }
  };

  return (
    <div className={`pointer-events-auto p-4 rounded-xl border shadow-xl backdrop-blur-md animate-in slide-in-from-right fade-in duration-300 ${getColors()}`}>
      <div className="flex justify-between items-start gap-3">
        <div>
          <h4 className="font-bold text-sm uppercase tracking-wide opacity-90">{toast.title}</h4>
          <p className="text-sm mt-1">{toast.message}</p>
        </div>
        <button onClick={() => onRemove(toast.id)} className="text-white/50 hover:text-white">✕</button>
      </div>
    </div>
  );
};

export default ToastContainer;
