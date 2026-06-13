import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, Layers, GraduationCap, FileQuestion, AlertTriangle, UserX, FileUp, FileDown, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { hasPermission } from '@/services/authService';

export const AcademicHome: React.FC = () => {
  const sections = [
    { name: 'السنة الدراسية', path: '/academic/years', icon: Calendar, desc: 'إدارة السنوات الدراسية، الفصول، التقويم الأكاديمي', color: 'text-blue-600', bgColor: 'bg-blue-100', permission: 'السنة_الدراسية.عرض' },
    { name: 'الصفوف الدراسية', path: '/academic/classes', icon: Layers, desc: 'إدارة وتشكيل الصفوف الدراسية والمستويات', color: 'text-indigo-600', bgColor: 'bg-indigo-100', permission: 'الصفوف.عرض' },
    { name: 'المواد الدراسية', path: '/academic/subjects', icon: BookOpen, desc: 'إعداد المواد الدراسية وربطها بالصفوف', color: 'text-purple-600', bgColor: 'bg-purple-100', permission: 'المواد.عرض' },
    { name: 'درجات الطلاب', path: '/academic/grades', icon: GraduationCap, desc: 'إدارة وتسجيل درجات الطلاب في المواد المختلفة', color: 'text-green-600', bgColor: 'bg-green-100', permission: 'الدرجات.عرض' },
    { name: 'بدل فاقد', path: '/academic/replacements', icon: FileQuestion, desc: 'إصدار وتتبع شهادات بدل فاقد للطلاب', color: 'text-amber-600', bgColor: 'bg-amber-100', permission: 'بدل_فاقد.عرض' },
    { name: 'أخطاء البيانات', path: '/academic/data-errors', icon: AlertTriangle, desc: 'مراجعة وتصحيح أخطاء وتعارضات بيانات الطلاب', color: 'text-red-600', bgColor: 'bg-red-100', permission: 'الاخطاء.عرض' },
    { name: 'الطلاب الموقوفين', path: '/academic/suspended', icon: UserX, desc: 'إدارة سجلات الطلاب الموقوفين أو المفصولين', color: 'text-slate-600', bgColor: 'bg-slate-100', permission: 'الطلاب.عرض' },
    { name: 'استيراد النتائج', path: '/academic/import-final-results', icon: FileUp, desc: 'استيراد نتائج الطلاب النهائية ومطابقتها', color: 'text-emerald-600', bgColor: 'bg-emerald-100', permission: 'النتائج.استيراد' },
    { name: 'تصدير النتائج', path: '/academic/export-final-results', icon: FileDown, desc: 'تصدير الدرجات النهائية للطلاب إلى ملف Excel', color: 'text-cyan-600', bgColor: 'bg-cyan-100', permission: 'النتائج.تصدير' },
    { name: 'تصدير بيانات الطلاب', path: '/academic/export-students', icon: FileDown, desc: 'تصدير بيانات الطلاب إلى ملف Excel حسب المدرسة والصف والسنة', color: 'text-teal-600', bgColor: 'bg-teal-100', permission: 'الطلاب.تصدير' },
  ].filter(section => hasPermission(section.permission));

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">نظرة عامة على الأقسام</h2>
        <p className="text-slate-500 mt-1">اختر القسم الذي تريد إدارته للوصول السريع إلى العمليات الأكاديمية</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <Link 
              key={index} 
              to={section.path}
              className="group flex flex-col bg-white border border-slate-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-xl transition-transform duration-300 group-hover:scale-110", section.bgColor, section.color)}>
                  <Icon size={24} />
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <ArrowLeft size={16} />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-primary transition-colors">{section.name}</h3>
              <p className="text-sm text-slate-500 leading-relaxed flex-1">
                {section.desc}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
