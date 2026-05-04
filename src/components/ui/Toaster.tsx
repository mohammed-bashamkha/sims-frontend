import React from 'react';
import { useToastStore } from '@/store/toastStore';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

export const Toaster: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 w-full max-w-md pointer-events-none" dir="rtl">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';
        
        return (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-center justify-between gap-3 w-full p-4 rounded-2xl shadow-lg border animate-in slide-in-from-top-5 fade-in duration-300
              ${isSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : ''}
              ${isError ? 'bg-red-50 border-red-200 text-red-800' : ''}
              ${isWarning ? 'bg-amber-50 border-amber-200 text-amber-800' : ''}
              ${!isSuccess && !isError && !isWarning ? 'bg-blue-50 border-blue-200 text-blue-800' : ''}
            `}
          >
            <div className="flex items-center gap-3">
              {isSuccess && <CheckCircle2 className="text-emerald-500 shrink-0" size={22} />}
              {isError && <XCircle className="text-red-500 shrink-0" size={22} />}
              {isWarning && <AlertCircle className="text-amber-500 shrink-0" size={22} />}
              {!isSuccess && !isError && !isWarning && <Info className="text-blue-500 shrink-0" size={22} />}
              
              <p className="font-bold text-sm leading-tight">{toast.message}</p>
            </div>
            
            <button 
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-black/5 transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
