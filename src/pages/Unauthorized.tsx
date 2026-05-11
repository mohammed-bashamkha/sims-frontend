import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with Blur */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={() => navigate('/dashboard')}
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Top Decorative Banner */}
        <div className="h-2 bg-red-500 w-full" />
        
        <div className="p-8 text-center">
          {/* Visual Element */}
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <Lock size={40} />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
              <ShieldAlert size={18} className="text-red-500" />
            </div>
          </div>

          {/* Content */}
          <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">تنبيه: وصول مقيد</h2>
          <p className="text-slate-500 mb-8 leading-relaxed font-medium px-4">
            عذراً، لا تمتلك الصلاحيات اللازمة للوصول إلى هذا القسم. يرجى مراجعة الإدارة لتعديل صلاحيات حسابك.
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/dashboard')}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 rounded-2xl shadow-lg transition-all active:scale-95 gap-2"
            >
              <Home size={18} />
              الذهاب للرئيسية
            </Button>
            
            <Button 
              variant="ghost"
              onClick={() => navigate(-1)}
              className="w-full text-slate-500 font-bold h-12 rounded-2xl hover:bg-slate-50 hover:text-primary transition-all gap-2"
            >
              <span>العودة للخلف</span>
              <ArrowRight size={18} />
            </Button>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="bg-slate-50 py-4 px-8 border-t border-slate-100 flex justify-center items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SIMS Security Guard Active</span>
        </div>
      </div>
    </div>
  );
};
