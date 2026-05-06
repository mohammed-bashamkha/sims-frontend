import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  isLoading?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-red-50 overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Header decoration */}
        <div className="h-2 w-full bg-red-500" />
        
        <div className="p-8">
          <div className="flex flex-col items-center text-center gap-4">
            {/* Warning Icon */}
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                <AlertTriangle size={32} className="text-red-600" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
              <p className="text-slate-500 leading-relaxed">
                {message}
                {itemName && <span className="block mt-1 font-bold text-red-600">"{itemName}"</span>}
              </p>
            </div>
            
            <div className="w-full bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3 mt-2 text-right">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle size={16} className="text-amber-700" />
              </div>
              <p className="text-xs text-amber-800 font-medium leading-relaxed">
                هذا الإجراء نهائي ولا يمكن التراجع عنه. سيتم حذف كافة البيانات المرتبطة بهذا السجل من النظام بشكل دائم.
              </p>
            </div>
            
            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 w-full mt-6">
              <Button 
                variant="outline" 
                onClick={onClose}
                disabled={isLoading}
                className="rounded-2xl h-12 border-slate-200 hover:bg-slate-50 font-bold"
              >
                <X size={18} className="ml-2" /> إلغاء
              </Button>
              <Button 
                onClick={onConfirm}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-white rounded-2xl h-12 font-bold shadow-lg shadow-red-200 transition-all active:scale-95"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 size={18} className="ml-2" /> حذف السجل
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Close button (top right) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};
