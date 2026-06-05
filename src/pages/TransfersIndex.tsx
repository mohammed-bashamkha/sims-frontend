import React, { useState } from 'react';
import { ArrowRightLeft, Globe } from 'lucide-react';
import { InternalTransfers } from '../components/transfers/InternalTransfers';
import { ExternalTransfers } from '../components/transfers/ExternalTransfers';
import { cn } from '../lib/utils';

export const TransfersIndex: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'internal' | 'external'>('internal');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <ArrowRightLeft className="text-primary" size={28} />
            إدارة تحويل الطلاب
          </h2>
          <p className="text-slate-500 mt-2">
            إدارة طلبات التحويل الداخلي بين المدارس، وتسجيل وقبول الطلاب الوافدين من خارج المحافظة.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('internal')}
            className={cn(
              "flex-1 py-4 px-6 text-center font-bold text-sm md:text-base transition-all flex items-center justify-center gap-2 border-b-2 outline-none",
              activeTab === 'internal' 
                ? "border-primary text-primary bg-white shadow-sm" 
                : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            )}
          >
            <ArrowRightLeft size={18} />
            التحويل الداخلي (بين المدارس)
          </button>
          <button
            onClick={() => setActiveTab('external')}
            className={cn(
              "flex-1 py-4 px-6 text-center font-bold text-sm md:text-base transition-all flex items-center justify-center gap-2 border-b-2 outline-none",
              activeTab === 'external' 
                ? "border-orange-400 text-orange-400 bg-white shadow-sm" 
                : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            )}
          >
            <Globe size={18} />
            تسجيل وافد (من خارج المحافظة)
          </button>
        </div>
        
        <div className="p-0 sm:p-6 bg-slate-50/30">
          {activeTab === 'internal' ? <InternalTransfers /> : <ExternalTransfers />}
        </div>
      </div>
    </div>
  );
};
