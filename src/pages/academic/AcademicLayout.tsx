import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { BookOpen, Calendar, Layers, GraduationCap, FileQuestion, AlertTriangle, UserX, FileUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export const AcademicLayout: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { name: 'السنة الدراسية', path: '/academic/years', icon: Calendar },
    { name: 'الصفوف الدراسية', path: '/academic/classes', icon: Layers },
    { name: 'المواد الدراسية', path: '/academic/subjects', icon: BookOpen },
    { name: 'درجات الطلاب', path: '/academic/grades', icon: GraduationCap },
    { name: 'بدل فاقد', path: '/academic/replacements', icon: FileQuestion },
    { name: 'أخطاء البيانات', path: '/academic/data-errors', icon: AlertTriangle },
    { name: 'الطلاب الموقوفين', path: '/academic/suspended', icon: UserX },
    { name: 'استيراد النتائج', path: '/academic/import-final-results', icon: FileUp },
  ];

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
          <div className="bg-slate-100 text-slate-600 p-2 rounded-lg">
            <BookOpen size={24} />
          </div>
          الشؤون الأكاديمية
        </h1>
        <p className="text-slate-500 mt-2">إدارة الفصول، المواد الدراسية، الدرجات، والعمليات الأكاديمية للطلاب.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col min-h-[500px]">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-8 bg-slate-50 p-1.5 rounded-xl border border-slate-100 w-full" dir="rtl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-white text-primary shadow-sm border border-slate-200/60" 
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                )}
              >
                <Icon size={18} className={cn("transition-colors", isActive ? "text-primary" : "text-slate-400")} /> 
                <span className="whitespace-nowrap">{item.name}</span>
              </NavLink>
            );
          })}
        </div>
        
        {/* Sub-page Content */}
        <div className="flex-1 outline-none">
          <Outlet />
        </div>
      </div>
      
    </div>
  );
};
