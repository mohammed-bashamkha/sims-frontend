import React from 'react';
import { History, ShieldAlert } from 'lucide-react';
import { ActivityLogsTable } from '@/components/settings/ActivityLogsTable';
import { getActivityLogs } from '@/services/activityLogService';

export const AllActivityLogs: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
            <History size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">سجلات النظام الشاملة</h1>
            <p className="text-slate-500 mt-1 text-sm flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-amber-500" />
              سجل بجميع العمليات والأنشطة التي تمت على النظام
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <ActivityLogsTable fetchLogs={(page) => getActivityLogs(page)} showUserColumn={true} />
      </div>
      
    </div>
  );
};
