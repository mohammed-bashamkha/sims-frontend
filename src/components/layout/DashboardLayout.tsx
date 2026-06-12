import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, ArrowRightLeft, Clock,
  Building2, BookOpen, BarChart3, Settings,
  LogOut, Search, Bell, CalendarDays, User, History,
  GraduationCap, X, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logout, getStoredUser } from '@/services/authService';
import { transferService } from '@/services/transferService';
import { academicYearService, type AcademicYear } from '@/services/academicYearService';
import { Can } from '@/components/common/Can';
import api from '@/api/axios';
import medadLogo from '@/assets/medad-logo.png';

interface SearchResult {
  students: {
    id: number;
    full_name: string;
    school_number: string;
    gender: string;
    school_name: string | null;
    class_name: string | null;
  }[];
  schools: {
    id: number;
    name: string;
    school_type: string;
    capacity: number;
  }[];
}

export const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getStoredUser();

  const [pendingTransfers, setPendingTransfers] = useState(0);
  const [pendingAdmissions, setPendingAdmissions] = useState(0);

  // Academic year state
  const [activeYear, setActiveYear] = useState<AcademicYear | null>(null);

  // Global search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult>({ students: [], schools: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const transfersRes = await transferService.getTransfers({ type: 'transfer', status: 'pending', page: 1 });
        setPendingTransfers(transfersRes.total);
        const admissionsRes = await transferService.getTransfers({ type: 'admission', status: 'pending', page: 1 });
        setPendingAdmissions(admissionsRes.total);
      } catch (error) {
        console.error('Failed to fetch pending counts', error);
      }
    };
    fetchCounts();
  }, []);

  // Fetch active academic year once
  useEffect(() => {
    const fetchActiveYear = async () => {
      try {
        const years = await academicYearService.getAcademicYears();
        const active = years.find((y) => y.status === 'active');
        if (active) setActiveYear(active);
      } catch (e) {
        console.error(e);
      }
    };
    fetchActiveYear();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setShowDropdown(false);
    setSearchQuery('');
  }, [location.pathname]);

  const performSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSearchResults({ students: [], schools: [] });
      setShowDropdown(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await api.get('/search', { params: { q } });
      setSearchResults(res.data);
      setShowDropdown(true);
    } catch {
      setSearchResults({ students: [], schools: [] });
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => performSearch(val), 350);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults({ students: [], schools: [] });
    setShowDropdown(false);
  };

  const handleStudentClick = (id: number) => {
    navigate(`/students/${id}`);
    setShowDropdown(false);
    setSearchQuery('');
  };

  const handleSchoolClick = (_id: number) => {
    navigate(`/schools`);
    setShowDropdown(false);
    setSearchQuery('');
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
    navigate('/auth/login');
  };

  const hasResults = searchResults.students.length > 0 || searchResults.schools.length > 0;

  return (
    <div className="flex min-h-screen w-full bg-slate-50" dir="rtl">
      {/* Sidebar */}
      <aside className="w-[300px] bg-[#042C53] text-slate-50 flex flex-col fixed inset-y-0 right-0 z-20 font-readex">
        <div className="p-6 flex items-center gap-3 border-b border-slate-600">
          <img src={medadLogo} className="w-14 h-14 mr-[-8px] ml-1 object-contain" alt="Medad Logo" />
          <div>
            <h1 className="text-lg text-white leading-tight w-[200px] mb-[5px]">نظام إدارة بيانات الطلاب</h1>
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
              <Can permission="الطلاب.عرض">
                <Link
                  to="/students"
                  className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 transition-colors font-medium hover:bg-slate-800 hover:text-white", location.pathname.startsWith('/students') && "bg-primary text-white")}
                >
                  <Users size={20} />
                  <span>سجل الطلاب</span>
                </Link>
              </Can>
              
              <Can permission="التحويلات_القبول.عرض">
                <Link
                  to="/transfers"
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-300 transition-colors font-medium hover:bg-slate-800 hover:text-white"
                >
                  <div className="flex items-center gap-3">
                    <ArrowRightLeft size={20} />
                    <span>تحويل الطلاب</span>
                  </div>
                  {pendingTransfers > 0 && (
                    <span className="bg-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingTransfers}</span>
                  )}
                </Link>
                <Link
                  to="/temporary-admission"
                  className={cn("flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-300 transition-colors font-medium hover:bg-slate-800 hover:text-white", location.pathname.startsWith('/temporary-admission') && "bg-primary text-white")}
                >
                  <div className="flex items-center gap-3">
                    <Clock size={20} />
                    <span>القبول المؤقت</span>
                  </div>
                  {pendingAdmissions > 0 && (
                    <span className="bg-red-600/90 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingAdmissions}</span>
                  )}
                </Link>
              </Can>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold text-slate-500 mb-3 px-2">المدارس و البيانات</h2>
            <div className="space-y-1">
              <Can permission="المدارس.عرض">
                <Link to="/schools" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 transition-colors font-medium hover:bg-slate-800 hover:text-white">
                  <Building2 size={20} />
                  <span>إدارة المدارس</span>
                </Link>
              </Can>
              
              <Can permission="السنة_الدراسية.عرض">
                <Link to="/academic" className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 transition-colors font-medium hover:bg-slate-800 hover:text-white", location.pathname.startsWith('/academic') && "bg-primary text-white")}>
                  <BookOpen size={20} />
                  <span>الشؤون الأكاديمية</span>
                </Link>
              </Can>

              <Can permission="الطلاب.توليد_تقارير">
                <Link to="/reports" className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 transition-colors font-medium hover:bg-slate-800 hover:text-white", location.pathname.startsWith('/reports') && "bg-primary text-white")}>
                  <BarChart3 size={20} />
                  <span>التقارير والإحصاءات</span>
                </Link>
              </Can>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold text-slate-500 mb-3 px-2">النظام</h2>
            <Can permission="المستخدمين.ادارة">
              <Link to="/settings" className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 transition-colors font-medium hover:bg-slate-800 hover:text-white", location.pathname === '/settings' && "bg-primary text-white")}>
                <Settings size={20} />
                <span>إعدادات النظام</span>
              </Link>
              <Link to="/settings/activity-logs" className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 transition-colors font-medium hover:bg-slate-800 hover:text-white", location.pathname.startsWith('/settings/activity-logs') && "bg-primary text-white")}>
                <History size={20} />
                <span>سجلات النظام</span>
              </Link>
            </Can>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-600 flex items-center justify-between">
          <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center overflow-hidden">
              <User size={20} className="text-slate-300" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{user?.name || 'المستخدم'}</p>
              <p className="text-xs text-slate-400">{user?.email || ''}</p>
            </div>
          </Link>
          <button onClick={handleLogout} title="تسجيل الخروج" className="text-slate-400 hover:text-red-400 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col ml-0 mr-[300px] bg-slate-50/50 min-h-screen">
        {/* Header */}
        <header className="h-[72px] bg-white flex items-center justify-between px-8 border-b sticky top-0 z-10 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 hidden md:block">لوحة القيادة</h2>

          {/* ─── Global Search ─── */}
          <div className="flex-1 max-w-xl mx-6" ref={searchRef}>
            <div className="relative">
              {/* Search Icon */}
              {isSearching ? (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-primary animate-spin" size={18} />
              ) : (
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              )}

              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => {
                  if (hasResults) setShowDropdown(true);
                }}
                placeholder="بحث شامل — اسم الطالب، الرقم المدرسي، اسم المدرسة..."
                className="w-full bg-slate-100 border border-transparent rounded-xl py-2.5 pr-10 pl-9 text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />

              {/* Clear Button */}
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={16} />
                </button>
              )}

              {/* ─── Dropdown Results ─── */}
              {showDropdown && (
                <div className="absolute top-full mt-2 right-0 left-0 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {!hasResults && !isSearching ? (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                      <Search size={32} className="opacity-20 mb-2" />
                      <span className="text-sm">لا توجد نتائج لـ "{searchQuery}"</span>
                    </div>
                  ) : (
                    <div className="max-h-[420px] overflow-y-auto">
                      {/* Students Section */}
                      {searchResults.students.length > 0 && (
                        <div>
                          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 sticky top-0">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                              <GraduationCap size={13} />
                              الطلاب
                              <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full mr-1">
                                {searchResults.students.length}
                              </span>
                            </span>
                          </div>
                          {searchResults.students.map((student) => (
                            <button
                              key={student.id}
                              onClick={() => handleStudentClick(student.id)}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-colors border-b border-slate-50 text-right group"
                            >
                              {/* Avatar */}
                              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                <User size={16} className="text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 truncate">{student.full_name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded" dir="ltr">
                                    {student.school_number}
                                  </span>
                                  {student.school_name && (
                                    <span className="text-xs text-slate-400 truncate">
                                      {student.school_name}
                                      {student.class_name && ` · ${student.class_name}`}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                عرض الملف
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Schools Section */}
                      {searchResults.schools.length > 0 && (
                        <div>
                          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 sticky top-0">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                              <Building2 size={13} />
                              المدارس
                              <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full mr-1">
                                {searchResults.schools.length}
                              </span>
                            </span>
                          </div>
                          {searchResults.schools.map((school) => (
                            <button
                              key={school.id}
                              onClick={() => handleSchoolClick(school.id)}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors border-b border-slate-50 text-right group"
                            >
                              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-200 transition-colors">
                                <Building2 size={16} className="text-emerald-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 truncate">{school.name}</p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {school.school_type === 'public' ? 'مدرسة حكومية' : 'مدرسة أهلية'}
                                  {school.capacity ? ` · السعة: ${school.capacity}` : ''}
                                </p>
                              </div>
                              <span className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                عرض المدرسة
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer hint */}
                  <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/80">
                    <p className="text-[11px] text-slate-400 text-center">
                      اضغط على أي نتيجة للانتقال إليها مباشرة
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right-side actions */}
          <div className="flex items-center gap-4">
            {/* Active Academic Year Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium text-slate-600">
              <CalendarDays size={15} className="text-primary" />
              {activeYear ? (
                <span dir="ltr" className="font-bold text-slate-700">{activeYear.year}</span>
              ) : (
                <span className="text-slate-400">جاري التحميل...</span>
              )}
              {activeYear && (
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[11px] font-bold px-1.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  نشط
                </span>
              )}
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>

            {/* Profile */}
            <Link to="/profile" className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors">
              <User size={18} />
            </Link>
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
