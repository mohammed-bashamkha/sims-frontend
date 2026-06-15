import React, { useState, useEffect } from 'react';
import type { ActivityLog, ActivityLogsResponse } from '@/services/activityLogService';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  History, 
  PlusCircle, 
  Edit, 
  Trash2, 
  User as UserIcon, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ActivityLogsTableProps {
  fetchLogs: (page: number) => Promise<ActivityLogsResponse>;
  showUserColumn?: boolean;
}

export const ActivityLogsTable: React.FC<ActivityLogsTableProps> = ({ fetchLogs, showUserColumn = false }) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<{
    current_page: number;
    last_page: number;
    total: number;
  }>({
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  const loadLogs = async (page: number) => {
    setIsLoading(true);
    try {
      const data = await fetchLogs(page);
      setLogs(data.data);
      setPagination({
        current_page: data.current_page,
        last_page: data.last_page,
        total: data.total,
      });
    } catch (error) {
      console.error('Failed to load activity logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs(1);
  }, []);

  const getEventBadge = (event: string) => {
    switch (event) {
      case 'created':
      case 'create':
        return (
          <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 gap-1 hover:bg-emerald-100 px-3 py-1 text-xs">
            <PlusCircle size={14} /> إضافة
          </Badge>
        );
      case 'updated':
      case 'update':
        return (
          <Badge className="bg-blue-50 text-blue-600 border-blue-200 gap-1 hover:bg-blue-100 px-3 py-1 text-xs">
            <Edit size={14} /> تعديل
          </Badge>
        );
      case 'deleted':
      case 'delete':
        return (
          <Badge className="bg-red-50 text-red-600 border-red-200 gap-1 hover:bg-red-100 px-3 py-1 text-xs">
            <Trash2 size={14} /> حذف
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-50 text-slate-600 border-slate-200 gap-1 hover:bg-slate-100 px-3 py-1 text-xs">
            <Info size={14} /> {event}
          </Badge>
        );
    }
  };

  const formatLogDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy - hh:mm a", { locale: ar });
    } catch {
      return dateString;
    }
  };

  if (isLoading && logs.length === 0) {
    return (
      <div className="flex justify-center items-center h-40">
        <span className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full"></span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {logs.length === 0 ? (
        <Card className="border-dashed border-2 bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-slate-500">
            <History size={48} className="opacity-20 mb-4" />
            <p className="text-lg font-medium text-slate-600">لا توجد سجلات نشاط متاحة</p>
            <p className="text-sm mt-1">لم يتم تسجيل أي أنشطة حتى الآن.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">الحدث</th>
                  <th className="px-6 py-4">الوصف</th>
                  <th className="px-6 py-4">التصنيف</th>
                  {showUserColumn && <th className="px-6 py-4">بواسطة (المستخدم)</th>}
                  <th className="px-6 py-4">التاريخ والوقت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-center">
                        {getEventBadge(log.event)}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top font-medium text-slate-700">
                      {log.description}
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg inline-flex text-xs font-semibold">
                        {log.log_name}
                      </div>
                    </td>
                    {showUserColumn && (
                      <td className="px-6 py-4 align-top">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <UserIcon size={14} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-700 text-xs">{log.causer?.name || 'غير معروف'}</p>
                            <p className="text-[10px] text-slate-500">{log.causer?.email}</p>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                        <Clock size={14} />
                        <span dir="ltr">{formatLogDate(log.created_at)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/50">
              <span className="text-sm text-slate-500">
                إجمالي السجلات: <span className="font-bold text-slate-700">{pagination.total}</span>
              </span>
              
              {pagination.last_page > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadLogs(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1 || isLoading}
                    className="gap-1 rounded-lg"
                  >
                    <ChevronRight size={16} />
                    السابق
                  </Button>
                  
                  <div className="flex items-center gap-1 hidden sm:flex">
                    {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === pagination.last_page || Math.abs(p - pagination.current_page) <= 1)
                      .map((p, i, arr) => (
                        <React.Fragment key={p}>
                          {i > 0 && arr[i-1] !== p - 1 && <span className="px-2 text-slate-400">...</span>}
                          <Button
                            variant={pagination.current_page === p ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => loadLogs(p)}
                            className={`w-9 h-9 p-0 rounded-lg ${pagination.current_page === p ? 'shadow-md shadow-primary/20' : ''}`}
                            disabled={isLoading}
                          >
                            {p}
                          </Button>
                        </React.Fragment>
                      ))
                    }
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadLogs(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.last_page || isLoading}
                    className="gap-1 rounded-lg"
                  >
                    التالي
                    <ChevronLeft size={16} />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
