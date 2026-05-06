import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, Check, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/api/axios';

export const ShowRole: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<any>(null);

  useEffect(() => {
    fetchRole();
  }, [id]);

  const fetchRole = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/roles/${id}`);
      setRole(response.data);
    } catch (error) {
      console.error('Failed to fetch role:', error);
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

  if (!role) {
    return (
      <div className="text-center py-20 text-slate-500">
        <ShieldCheck size={48} className="mx-auto mb-4 opacity-20" />
        <h2 className="text-xl font-bold">الدور غير موجود</h2>
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
            <span className="text-slate-800 font-bold text-sm">تفاصيل الدور</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                {role.name}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Role Details & Permissions */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <Card className="shadow-sm border border-slate-100 rounded-2xl overflow-hidden">
            <div className="bg-slate-50/50 border-b border-slate-100 p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-primary" size={20} />
                <h2 className="font-bold text-slate-800 text-lg">الصلاحيات المرتبطة بالدور</h2>
              </div>
            </div>
            <CardContent className="p-6">
              {role.permissions && role.permissions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {role.permissions.map((perm: any) => (
                    <div key={perm.id} className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                      <div className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center flex-shrink-0">
                        <Check size={14} strokeWidth={3} />
                      </div>
                      <span className="font-semibold text-emerald-800">{perm.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400">
                  <p>لا توجد صلاحيات محددة لهذا الدور</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-6">
          <Card className="shadow-sm border-2 border-primary/20 rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-primary"></div>
            <div className="bg-primary/5 border-b border-primary/10 p-5 flex items-center gap-2">
              <Users className="text-primary" size={20} />
              <h2 className="font-bold text-primary text-lg">إحصائيات الدور</h2>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">عدد الصلاحيات الممنوحة</p>
                  <p className="font-bold text-slate-800 text-2xl">{role.permissions ? role.permissions.length : 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
};
