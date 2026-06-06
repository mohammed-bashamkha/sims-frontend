import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, User, ShieldCheck, ShieldAlert, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import api from '@/api/axios';
import { History } from 'lucide-react';
import { ActivityLogsTable } from '@/components/settings/ActivityLogsTable';
import { getActivityLogs } from '@/services/activityLogService';

export const ShowUser: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/users/${id}`);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <span className="animate-spin w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full"></span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 text-slate-500">
        <User size={48} className="mx-auto mb-4 opacity-20" />
        <h2 className="text-xl font-bold">المستخدم غير موجود</h2>
        <button onClick={() => navigate('/settings')} className="mt-4 text-primary hover:underline">
          العودة للإعدادات
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto pb-12 flex flex-col gap-6">
      
      {/* Header and Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-slate-500">
            <button onClick={() => navigate('/settings')} className="hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium">
              إعدادات النظام
            </button>
            <ChevronLeft size={16} />
            <span className="text-slate-800 font-bold text-sm">تفاصيل المستخدم</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <User size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                {user.name}
              </h1>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setShowLogs(!showLogs)} 
            variant="outline" 
            className="gap-2 border-slate-200 text-slate-700 font-bold rounded-xl h-11 px-5"
          >
            <History size={18} className={showLogs ? "text-primary" : "text-slate-400"} /> 
            {showLogs ? 'إخفاء سجلات النشاط' : 'عرض سجلات النشاط'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* User Details */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <Card className="shadow-sm border border-slate-100 rounded-2xl overflow-hidden">
            <div className="bg-slate-50/50 border-b border-slate-100 p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="text-primary" size={20} />
                <h2 className="font-bold text-slate-800 text-lg">البيانات الأساسية</h2>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5"><User size={14}/> الاسم الكامل</p>
                  <p className="font-semibold text-slate-800 text-lg">{user.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5"><Mail size={14}/> البريد الإلكتروني</p>
                  <p className="font-semibold text-slate-800 text-lg">{user.email}</p>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5"><ShieldAlert size={14}/> حالة كلمة المرور</p>
                  <div className="mt-2">
                    {user.must_change_password ? (
                      <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 px-3 py-1 text-sm gap-1">
                        <ShieldAlert size={16} /> المستخدم مطالب بتغيير كلمة المرور
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 px-3 py-1 text-sm gap-1">
                        <ShieldCheck size={16} /> كلمة المرور صالحة (لا تتطلب تغيير)
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Roles Details */}
        <div className="flex flex-col gap-6">
          <Card className="shadow-sm border-2 border-primary/20 rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-primary"></div>
            <div className="bg-primary/5 border-b border-primary/10 p-5 flex items-center gap-2">
              <ShieldCheck className="text-primary" size={20} />
              <h2 className="font-bold text-primary text-lg">الأدوار الممنوحة</h2>
            </div>
            <CardContent className="p-6">
              {user.roles && user.roles.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {user.roles.map((role: any) => (
                    <div key={role.id} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary">
                        <ShieldCheck size={16} />
                      </div>
                      <span className="font-bold text-slate-700">{role.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400">
                  <p>لا توجد أدوار ممنوحة لهذا المستخدم</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

      {showLogs && (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <Card className="shadow-sm border border-slate-100 rounded-2xl overflow-hidden">
            <div className="bg-slate-50/50 border-b border-slate-100 p-5 flex items-center gap-2">
              <History className="text-primary" size={20} />
              <h2 className="font-bold text-slate-800 text-lg">سجلات النشاط - {user.name}</h2>
            </div>
            <CardContent className="p-6">
              <ActivityLogsTable fetchLogs={(page) => getActivityLogs(page, id)} />
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
};
