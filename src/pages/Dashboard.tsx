import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, Building2, ArrowRightLeft, FileWarning, 
  AlertTriangle, RotateCw, UserPlus, 
  UploadCloud, Download, Edit3, XCircle, CheckCircle, 
  Activity, AlertCircle, Loader2
} from 'lucide-react';
import api from '@/api/axios';

// TypeScript interfaces for Dashboard Data
interface DashboardData {
  active_academic_year: {
    id: number;
    year: string;
    status: string;
  } | null;
  kpis: {
    total_students: number;
    active_schools: number;
    schools_breakdown: {
      government: number;
      private: number;
    };
    pending_transfers: number;
    certificate_replacements: number;
  };
  needs_attention: {
    transfers_awaiting_review: number;
    expired_temporary_admissions: number;
    suspended_students: number;
  };
  student_density_alerts: Array<{
    id: number;
    name: string;
    density_percentage: number;
  }>;
  activity_log: Array<{
    id: number;
    description: string;
    user: string;
    time: string;
    type: string;
  }>;
  navigation_badges: {
    student_transfers: number;
    temporary_admissions: number;
  };
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const user = JSON.parse(localStorage.getItem('auth_user') || '{}');

  useEffect(() => {
    api.get('/dashboard')
      .then(res => {
        setData(res.data);
      })
      .catch(err => {
        console.error('Error loading dashboard', err);
        setError('تعذر تحميل بيانات لوحة التحكم');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-slate-500 font-medium">جاري تحميل البيانات...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertTriangle className="w-12 h-12 text-red-400" />
        <p className="text-red-500 font-medium">{error}</p>
        <button onClick={() => window.location.reload()} className="text-primary hover:underline mt-2">إعادة المحاولة</button>
      </div>
    );
  }

  const currentDate = new Intl.DateTimeFormat('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());

  const getActivityIcon = (description: string) => {
    if (description.includes('تعديل') || description.includes('تحديث')) return <Edit3 size={20} className="text-blue-500" />;
    if (description.includes('رفض') || description.includes('حذف') || description.includes('إيقاف')) return <XCircle size={20} className="text-red-500" />;
    return <CheckCircle size={20} className="text-emerald-500" />;
  };

  const getDensityColor = (percentage: number) => {
    if (percentage > 120) return 'bg-red-600';
    if (percentage > 100) return 'bg-amber-500';
    if (percentage > 85) return 'bg-[#d4af37]';
    return 'bg-emerald-500';
  };

  const getDensityTextColor = (percentage: number) => {
    if (percentage > 120) return 'text-red-600';
    if (percentage > 100) return 'text-amber-600';
    if (percentage > 85) return 'text-[#d4af37]';
    return 'text-emerald-600';
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto pb-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">أهلاً، {user.name || 'المستخدم'}</h1>
        <p className="text-slate-500 text-sm mt-1">{currentDate} {data.active_academic_year ? `· العام الدراسي ${data.active_academic_year.year}` : ''}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border-0 rounded-2xl overflow-hidden relative">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-[#3b82f6]"></div>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                <Users size={24} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-slate-500 text-sm font-medium">إجمالي الطلاب</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{data.kpis.total_students.toLocaleString('en-US')}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 rounded-2xl overflow-hidden relative">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-emerald-500"></div>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
                <Building2 size={24} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-slate-500 text-sm font-medium">المدارس الفعالة</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{data.kpis.active_schools.toLocaleString('en-US')}</h3>
              <p className="text-slate-500 text-xs mt-2 font-medium">{data.kpis.schools_breakdown.government} حكومي · {data.kpis.schools_breakdown.private} أهلي</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 rounded-2xl overflow-hidden relative">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-amber-500"></div>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
                <ArrowRightLeft size={24} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-slate-500 text-sm font-medium">طلبات النقل المعلقة</p>
              <h3 className="text-3xl font-bold text-amber-600 mt-1">{data.kpis.pending_transfers}</h3>
              {data.kpis.pending_transfers > 0 && <p className="text-amber-500 text-xs mt-2 font-medium">بانتظار الموافقة !</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 rounded-2xl overflow-hidden relative">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-red-500"></div>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="bg-red-100 p-3 rounded-xl text-red-600">
                <FileWarning size={24} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-slate-500 text-sm font-medium">طلبات بدل فاقد</p>
              <h3 className="text-3xl font-bold text-red-600 mt-1">{data.kpis.certificate_replacements}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* تحتاج متابعة الآن (Col 3) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <RotateCw size={20} className="text-slate-500" />
              تحتاج متابعة الآن
            </h2>
          </div>
          
          <Card className="shadow-sm border-0 rounded-2xl overflow-hidden h-full">
            <div className="divide-y divide-slate-100 h-full flex flex-col justify-center">
              <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-slate-400"><ArrowRightLeft size={20} /></div>
                  <span className="font-medium text-slate-700">طلبات النقل المعلقة بانتظار مراجعتك</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-slate-800">{data.needs_attention.transfers_awaiting_review}</span>
                  <button onClick={() => navigate('/transfers')} className="bg-blue-50 text-blue-600 text-xs px-4 py-1.5 rounded-lg font-medium cursor-pointer hover:bg-blue-100 transition-colors">عرض</button>
                </div>
              </div>
              
              <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-slate-400"><AlertCircle size={20} /></div>
                  <span className="font-medium text-slate-700">طلاب مقيدون بشكل مؤقت وبحاجة للاعتماد</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-slate-800">{data.needs_attention.expired_temporary_admissions}</span>
                  <button onClick={() => navigate('/temporary-admission')} className="bg-blue-50 text-blue-600 text-xs px-4 py-1.5 rounded-lg font-medium cursor-pointer hover:bg-blue-100 transition-colors">عرض</button>
                </div>
              </div>

              <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-slate-400"><AlertCircle size={20} className="text-red-500" /></div>
                  <span className="font-medium text-slate-700">الطلاب الموقوفين</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-slate-800">{data.needs_attention.suspended_students}</span>
                  <button onClick={() => navigate('/academic/suspended')} className="bg-red-50 text-red-600 text-xs px-4 py-1.5 rounded-lg font-medium cursor-pointer hover:bg-red-100 transition-colors">عرض</button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* إجراءات سريعة (Col 2) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Activity size={20} className="text-slate-500" />
            إجراءات سريعة
          </h2>
          
          <div className="flex flex-col gap-3 h-full">
            <button 
              onClick={() => navigate('/students/create')}
              className="bg-[#3b82f6] hover:bg-blue-600 text-white rounded-2xl p-5 flex items-center justify-between transition-colors shadow-sm group border-0 text-right flex-1"
            >
              <div>
                <h3 className="font-bold text-lg">تسجيل طالب جديد</h3>
                <p className="text-blue-100 text-sm mt-1">إضافة ملف فردي</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 transition-transform">
                <UserPlus size={24} />
              </div>
            </button>

            <button onClick={() => navigate('/students/import')} className="bg-white border-slate-100 hover:border-slate-200 border rounded-2xl p-5 flex items-center justify-between transition-colors shadow-sm group text-right flex-1">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">استيراد بيانات</h3>
                <p className="text-slate-500 text-sm mt-1" dir="ltr">ملفات Excel</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-full text-blue-600 group-hover:scale-110 transition-transform">
                <UploadCloud size={24} />
              </div>
            </button>

            <button onClick={() => navigate('/academic')} className="bg-white border-slate-100 hover:border-slate-200 border rounded-2xl p-5 flex items-center justify-between transition-colors shadow-sm group text-right flex-1">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">الشؤون الأكاديمية</h3>
                <p className="text-slate-500 text-sm mt-1" dir="ltr">نتائج وفصول</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-full text-blue-600 group-hover:scale-110 transition-transform">
                <Download size={24} />
              </div>
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-2">
        
        {/* سجل الأنشطة (Col 3) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <RotateCw size={20} className="text-slate-500" />
              سجل الأنشطة الأخير
            </h2>
          </div>
          
          <Card className="shadow-sm border-0 rounded-2xl h-full">
            <div className="divide-y divide-slate-100 p-2 h-full">
              {data.activity_log.length === 0 ? (
                <div className="p-6 text-center text-slate-500">لا يوجد أنشطة مسجلة بعد.</div>
              ) : (
                data.activity_log.map(activity => (
                  <div key={activity.id} className="p-4 flex items-center justify-between">
                    <div className="flex gap-4">
                      <div className="mt-1">{getActivityIcon(activity.description)}</div>
                      <div>
                        <p className="font-bold text-slate-800">{activity.description}</p>
                        <p className="text-sm text-slate-500 mt-1">بواسطة: {activity.user}</p>
                      </div>
                    </div>
                    <div className="text-sm text-slate-500 font-medium" dir="ltr">{activity.time}</div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* تنبيهات الكثافة الطلابية (Col 2) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle size={20} className="text-slate-500" />
              أعلى المدارس كثافة للطلاب
            </h2>
          </div>
          
          <Card className="shadow-sm border-0 rounded-2xl p-6 h-full">
            <div className="space-y-6">
              {data.student_density_alerts.length === 0 ? (
                <div className="text-center text-slate-500 py-4">لا توجد تنبيهات للكثافة الطلابية.</div>
              ) : (
                data.student_density_alerts.map(school => (
                  <div key={school.id} className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium text-slate-700 text-right truncate" title={school.name}>{school.name}</div>
                    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${getDensityColor(school.density_percentage)} rounded-full`} style={{ width: `${Math.min(school.density_percentage, 100)}%` }}></div>
                    </div>
                    <div className={`w-12 text-sm font-bold ${getDensityTextColor(school.density_percentage)} text-left`}>
                      {school.density_percentage}%
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

      </div>

    </div>
  );
};
