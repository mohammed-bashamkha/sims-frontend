import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { BookOpen, ChevronLeft, Home } from 'lucide-react';

export const AcademicLayout: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const routeNames: Record<string, string> = {
    'academic': 'الشؤون الأكاديمية',
    'years': 'السنة الدراسية',
    'classes': 'الصفوف الدراسية',
    'subjects': 'المواد الدراسية',
    'grades': 'درجات الطلاب',
    'replacements': 'بدل فاقد',
    'data-errors': 'أخطاء البيانات',
    'suspended': 'الطلاب الموقوفين',
    'import-final-results': 'استيراد النتائج',
    'export-final-results': 'تصدير النتائج النهائية',
    'export-students': 'تصدير بيانات الطلاب',
  };

  return (
    <div className="flex flex-col gap-4 w-full pb-10">
      
      {/* Breadcrumbs */}
      <nav className="flex text-sm text-slate-500" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 space-x-reverse md:space-x-2">
          <li className="inline-flex items-center">
            <Link to="/dashboard" className="inline-flex items-center hover:text-primary transition-colors">
              <Home size={14} className="ml-1.5" />
              لوحة التحكم
            </Link>
          </li>
          
          {pathnames.map((value, index) => {
            const isLast = index === pathnames.length - 1;
            const to = `/${pathnames.slice(0, index + 1).join('/')}`;
            const name = routeNames[value] || value;

            return (
              <li key={to}>
                <div className="flex items-center">
                  <ChevronLeft size={14} className="text-slate-400 mx-1" />
                  {isLast ? (
                    <span className="font-medium text-slate-800">{name}</span>
                  ) : (
                    <Link to={to} className="hover:text-primary transition-colors">
                      {name}
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </nav>

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

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col min-h-[500px] mt-2">
        {/* Sub-page Content */}
        <div className="flex-1 outline-none">
          <Outlet />
        </div>
      </div>
      
    </div>
  );
};
