import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, Building2, ArrowRightLeft, FileWarning, 
  AlertTriangle, RotateCw, ChevronLeft, UserPlus, 
  UploadCloud, Download, Edit3, XCircle, CheckCircle, 
  Activity, AlertCircle
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto pb-8">
      {/* Alert */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4">
        <div className="bg-amber-100 p-2 rounded-full text-amber-600 mt-0.5">
          <AlertTriangle size={20} />
        </div>
        <div>
          <h3 className="font-bold text-amber-800">تنبيه إداري — الموعد النهائي لتسليم كشوفات الدرجات</h3>
          <p className="text-amber-700 text-sm mt-1">يتبقى يومان فقط على إغلاق النظام المركزي للفصل الدراسي الأول</p>
        </div>
      </div>

      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">أهلاً، محمد بالسود</h1>
        <p className="text-slate-500 text-sm mt-1">الأحد، 19 أبريل 2026 · الفصل الدراسي الثاني</p>
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
              <h3 className="text-3xl font-bold text-slate-800 mt-1">45,230</h3>
              <p className="text-emerald-500 text-xs mt-2 font-medium" dir="ltr">+3.2% من العام الماضي</p>
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
              <h3 className="text-3xl font-bold text-slate-800 mt-1">124</h3>
              <p className="text-slate-500 text-xs mt-2 font-medium">98 حكومي · 26 أهلي</p>
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
              <h3 className="text-3xl font-bold text-amber-600 mt-1">30</h3>
              <p className="text-amber-500 text-xs mt-2 font-medium">بانتظار الموافقة !</p>
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
              <p className="text-slate-500 text-sm font-medium">نقص الوثائق</p>
              <h3 className="text-3xl font-bold text-red-600 mt-1">450</h3>
              <p className="text-red-500 text-xs mt-2 font-medium">ملفات غير مكتملة !</p>
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
            <button className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
              عرض الكل <ChevronLeft size={16} />
            </button>
          </div>
          
          <Card className="shadow-sm border-0 rounded-2xl overflow-hidden">
            <div className="divide-y divide-slate-100">
              <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-slate-400"><ArrowRightLeft size={20} /></div>
                  <span className="font-medium text-slate-700">طلب تحويل بانتظار مراجعتك</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-slate-800">18</span>
                  <span className="bg-blue-50 text-blue-600 text-xs px-4 py-1.5 rounded-lg font-medium cursor-pointer hover:bg-blue-100 transition-colors">عرض</span>
                </div>
              </div>
              
              <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-slate-400"><AlertCircle size={20} /></div>
                  <span className="font-medium text-slate-700">طالب مؤقت انتهت مهلتهم</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-slate-800">22</span>
                  <span className="bg-blue-50 text-blue-600 text-xs px-4 py-1.5 rounded-lg font-medium cursor-pointer hover:bg-blue-100 transition-colors">عرض</span>
                </div>
              </div>

              <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-slate-400"><FileWarning size={20} /></div>
                  <span className="font-medium text-slate-700">ملف ناقص وثائق</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-slate-800">7</span>
                  <span className="bg-blue-50 text-blue-600 text-xs px-4 py-1.5 rounded-lg font-medium cursor-pointer hover:bg-blue-100 transition-colors">عرض</span>
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
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => navigate('/students/create')}
              className="bg-[#3b82f6] hover:bg-blue-600 text-white rounded-2xl p-5 flex items-center justify-between transition-colors shadow-sm group border-0 text-right"
            >
              <div>
                <h3 className="font-bold text-lg">تسجيل طالب جديد</h3>
                <p className="text-blue-100 text-sm mt-1">إضافة ملف فردي</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 transition-transform">
                <UserPlus size={24} />
              </div>
            </button>

            <button className="bg-white border-slate-100 hover:border-slate-200 border rounded-2xl p-5 flex items-center justify-between transition-colors shadow-sm group text-right">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">استيراد بيانات</h3>
                <p className="text-slate-500 text-sm mt-1" dir="ltr">ملفات Excel / PDF</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-full text-blue-600 group-hover:scale-110 transition-transform">
                <UploadCloud size={24} />
              </div>
            </button>

            <button className="bg-white border-slate-100 hover:border-slate-200 border rounded-2xl p-5 flex items-center justify-between transition-colors shadow-sm group text-right">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">تصدير تقرير</h3>
                <p className="text-slate-500 text-sm mt-1" dir="ltr">ملفات Excel / PDF</p>
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
              سجل الأنشطة
            </h2>
            <button className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
              السجل الكامل <ChevronLeft size={16} />
            </button>
          </div>
          
          <Card className="shadow-sm border-0 rounded-2xl">
            <div className="divide-y divide-slate-100 p-2">
              <div className="p-4 flex items-center justify-between">
                <div className="flex gap-4">
                  <div className="mt-1"><Edit3 size={20} className="text-blue-500" /></div>
                  <div>
                    <p className="font-bold text-slate-800">تعديل بيانات الطالب #88192</p>
                    <p className="text-sm text-slate-500 mt-1">بواسطة: أحمد العمودي</p>
                  </div>
                </div>
                <div className="text-sm text-slate-500 font-medium">10:42 ص</div>
              </div>
              
              <div className="p-4 flex items-center justify-between">
                <div className="flex gap-4">
                  <div className="mt-1"><XCircle size={20} className="text-red-500" /></div>
                  <div>
                    <p className="font-bold text-slate-800">رفض طلب نقل الطالب #9921</p>
                    <p className="text-sm text-slate-500 mt-1">بواسطة: عبدالله العلي</p>
                  </div>
                </div>
                <div className="text-sm text-slate-500 font-medium">9:32 ص</div>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div className="flex gap-4">
                  <div className="mt-1"><CheckCircle size={20} className="text-emerald-500" /></div>
                  <div>
                    <p className="font-bold text-slate-800">اعتماد نتائج الصف التاسع</p>
                    <p className="text-sm text-slate-500 mt-1">بواسطة: أسامة باحشوان</p>
                  </div>
                </div>
                <div className="text-sm text-slate-500 font-medium">أمس</div>
              </div>
            </div>
          </Card>
        </div>

        {/* تنبيهات الكثافة الطلابية (Col 2) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle size={20} className="text-slate-500" />
              تنبيهات الكثافة الطلابية
            </h2>
            <button className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
              عرض الكل <ChevronLeft size={16} />
            </button>
          </div>
          
          <Card className="shadow-sm border-0 rounded-2xl p-6">
            <div className="space-y-6">
              
              <div className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium text-slate-700 text-right">الزهراء للبنات</div>
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-600 rounded-full" style={{ width: '100%' }}></div>
                </div>
                <div className="w-12 text-sm font-bold text-red-600 text-left">145%</div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium text-slate-700 text-right">المكلا النموذجية</div>
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <div className="w-12 text-sm font-bold text-amber-600 text-left">120%</div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium text-slate-700 text-right">ثانوية ابن سيناء</div>
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <div className="w-12 text-sm font-bold text-amber-500 text-left">115%</div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium text-slate-700 text-right">مجمع فوة التعليمي</div>
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#d4af37] rounded-full" style={{ width: '65%' }}></div>
                </div>
                <div className="w-12 text-sm font-bold text-[#d4af37] text-left">105%</div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium text-slate-700 text-right">مدرسة الجماهير</div>
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#d4af37] rounded-full" style={{ width: '60%' }}></div>
                </div>
                <div className="w-12 text-sm font-bold text-[#d4af37] text-left">102%</div>
              </div>

            </div>
          </Card>
        </div>

      </div>

    </div>
  );
};
