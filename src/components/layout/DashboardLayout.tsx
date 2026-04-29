import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, ArrowRightLeft, Clock,
  Building2, BookOpen, BarChart3, Settings,
  LogOut, Search, Bell, CalendarDays, User
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const DashboardLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen w-full bg-slate-50" dir="rtl">
      {/* Sidebar */}
      <aside className="w-[280px] bg-[#0f172a] text-slate-50 flex flex-col fixed inset-y-0 right-0 z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-primary/20 p-2 rounded-lg text-primary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">نظام إدارة بيانات الطلاب</h1>
            <p className="text-xs text-slate-400">وزارة التعليم - مكتب الامتحانات</p>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-6 scrollbar-hide">
          <div>
            <h2 className="text-xs font-semibold text-slate-500 mb-3 px-2">الرئيسية</h2>
            <Link 
              to="/dashboard" 
              className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 transition-colors font-medium hover:bg-slate-800 hover:text-white", location.pathname === '/dashboard' && "bg-primary text-white")}
            >
              <LayoutDashboard size={20} />
              <span>لوحة القيادة</span>
            </Link>
          </div>

          <div>
            <h2 className="text-xs font-semibold text-slate-500 mb-3 px-2">إدارة الطلاب</h2>
            <div className="space-y-1">
              <Link 
                to="/students" 
                className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 transition-colors font-medium hover:bg-slate-800 hover:text-white", location.pathname.startsWith('/students') && "bg-primary text-white")}
              >
                <Users size={20} />
                <span>سجل الطلاب</span>
              </Link>
              <Link 
                to="/transfers" 
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-300 transition-colors font-medium hover:bg-slate-800 hover:text-white"
              >
                <div className="flex items-center gap-3">
                  <ArrowRightLeft size={20} />
                  <span>تحويل الطلاب</span>
                </div>
                <span className="bg-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">18</span>
              </Link>
              <Link 
                to="/temporary-admission" 
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-300 transition-colors font-medium hover:bg-slate-800 hover:text-white"
              >
                <div className="flex items-center gap-3">
                  <Clock size={20} />
                  <span>القبول المؤقت</span>
                </div>
                <span className="bg-red-600/90 text-white text-xs font-bold px-2 py-0.5 rounded-full">22</span>
              </Link>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold text-slate-500 mb-3 px-2">المدارس و البيانات</h2>
            <div className="space-y-1">
              <Link to="/schools" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 transition-colors font-medium hover:bg-slate-800 hover:text-white">
                <Building2 size={20} />
                <span>إدارة المدارس</span>
              </Link>
              <Link to="/academic" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 transition-colors font-medium hover:bg-slate-800 hover:text-white">
                <BookOpen size={20} />
                <span>الشؤون الأكاديمية</span>
              </Link>
              <Link to="/reports" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 transition-colors font-medium hover:bg-slate-800 hover:text-white">
                <BarChart3 size={20} />
                <span>التقارير والإحصاءات</span>
              </Link>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold text-slate-500 mb-3 px-2">النظام</h2>
            <Link to="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 transition-colors font-medium hover:bg-slate-800 hover:text-white">
              <Settings size={20} />
              <span>إعدادات النظام</span>
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center overflow-hidden">
              <User size={20} className="text-slate-300" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">محمد بالسود</p>
              <p className="text-xs text-slate-400">مشرف النظام المركزي</p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-red-400 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col ml-0 mr-[280px] bg-slate-50/50 min-h-screen">
        {/* Header */}
        <header className="h-[72px] bg-white flex items-center justify-between px-8 border-b sticky top-0 z-10 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800">لوحة القيادة</h2>
          
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="بحث شامل — طالب، مدرسة..." 
                className="w-full bg-slate-100 border-transparent rounded-lg py-2.5 pr-10 pl-4 text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200 text-sm font-medium text-slate-600">
              <span dir="ltr">2025 / 2026</span>
              <span>·</span>
              <span>الفصل الثاني</span>
              <CalendarDays size={16} className="text-slate-400 mr-2" />
            </div>
            
            <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <button className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors">
              <User size={18} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

