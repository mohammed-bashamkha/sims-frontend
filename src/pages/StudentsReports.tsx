import React, { useState, useEffect } from 'react';
import {
  Users, TrendingUp, MapPin, AlertCircle,
  Filter, Search, ChevronDown, ChevronUp,
  Printer, FileSpreadsheet, FileText, Eye,
  Loader2, ChevronRight, ChevronLeft,
  Building2, AlertTriangle, PauseCircle,
  ArrowLeftRight, CheckCircle2, XCircle, Clock,
  GraduationCap, BarChart3, Award, XOctagon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { academicYearService, type AcademicYear } from '@/services/academicYearService';
import { schoolService } from '@/services/schoolService';

import type { School } from '@/types/school';
import api from '@/api/axios';

type ReportTab = 'students' | 'schools' | 'transfers' | 'results';

const TABS: { id: ReportTab; label: string }[] = [
  { id: 'students', label: 'تقارير الطلاب' },
  { id: 'schools', label: 'تقارير للمدارس' },
  { id: 'transfers', label: 'تقارير التنقلات' },
  { id: 'results', label: 'تقارير النتائج' },
];

const StatCard: React.FC<{
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  iconBg: string;
  valueColor?: string;
}> = ({ title, value, sub, icon, iconBg, valueColor = 'text-slate-800' }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
      <p className={`text-2xl font-black ${valueColor}`} dir="ltr">{typeof value === 'number' ? value.toLocaleString('en') : value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

export const StudentsReports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('students');
  const [showFilters, setShowFilters] = useState(true);

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<string>('');
  const [schools, setSchools] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);

  // Schools tab state
  const [schoolsData, setSchoolsData] = useState<School[]>([]);
  const [isSchoolsLoading, setIsSchoolsLoading] = useState(false);
  const [schoolsSearchTerm, setSchoolsSearchTerm] = useState('');
  const [schoolTypeFilter, setSchoolTypeFilter] = useState('');
  const [schoolStats, setSchoolStats] = useState({
    total: 0,
    overcrowded: 0,
    suspended: 0,
    totalStudents: 0,
  });

  // Transfers tab state
  const [transfers, setTransfers] = useState<any[]>([]);
  const [isTransfersLoading, setIsTransfersLoading] = useState(false);
  const [transferStatusFilter, setTransferStatusFilter] = useState('');
  const [transfersPage, setTransfersPage] = useState(1);
  const [transfersLastPage, setTransfersLastPage] = useState(1);
  const [transfersTotal, setTransfersTotal] = useState(0);
  const [transfersStats, setTransfersStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // Results tab state
  const [results, setResults] = useState<any[]>([]);
  const [isResultsLoading, setIsResultsLoading] = useState(false);
  const [resultsPage, setResultsPage] = useState(1);
  const [resultsLastPage, setResultsLastPage] = useState(1);
  const [resultsTotal, setResultsTotal] = useState(0);
  const [resultsSchoolFilter, setResultsSchoolFilter] = useState('');
  const [resultsClassFilter, setResultsClassFilter] = useState('');
  const [resultsStats, setResultsStats] = useState({
    passRate: 0,
    average: 0,
    topCount: 0,
    failRate: 0,
    previousYearPassRate: 0,
  });

  const [filters, setFilters] = useState({
    school_id: '',
    stage: '',
    class_id: '',
    gender: '',
    status: '',
    date_from: '',
    date_to: '',
  });

  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);

  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    villages: 0,
    repeaters: 0,
  });

  useEffect(() => {
    fetchAcademicYears();
    fetchSchools();
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [page, selectedYearId]);

  useEffect(() => {
    if (activeTab === 'schools') {
      const timer = setTimeout(() => {
        fetchSchoolsData();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [activeTab, schoolsSearchTerm, schoolTypeFilter]);

  useEffect(() => {
    if (activeTab === 'transfers') fetchTransfers();
    if (activeTab === 'results') fetchResults();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'transfers') fetchTransfers();
  }, [transfersPage, transferStatusFilter]);

  useEffect(() => {
    if (activeTab === 'results') fetchResults();
  }, [resultsPage, resultsSchoolFilter, resultsClassFilter]);

  const fetchAcademicYears = async () => {
    try {
      const data = await academicYearService.getAcademicYears();
      setAcademicYears(data);
      const active = data.find(y => y.status === 'active');
      if (active) setSelectedYearId(String(active.id));
    } catch (e) { console.error(e); }
  };

  const fetchSchools = async () => {
    try {
      const data = await schoolService.getSchools();
      setSchools(Array.isArray(data) ? data : (data as any).data || []);
    } catch (e) { console.error(e); }
  };

  const fetchClasses = async () => {
    try {
      const res = await api.get('/school-classes');
      setClasses(res.data.data || res.data || []);
    } catch (e) { console.error(e); }
  };

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const params: any = { page };
      if (selectedYearId) params.academic_year_id = selectedYearId;
      if (filters.school_id) params.school_id = filters.school_id;
      if (filters.class_id) params.class_id = filters.class_id;
      if (filters.gender) params.gender = filters.gender;
      if (filters.status) params.status = filters.status;

      const res = await api.get('/reports/students', { params });
      
      if (res.data.stats) {
        setStats(res.data.stats);
      }
      
      const studentsData = res.data.students || res.data;
      const arr = Array.isArray(studentsData) ? studentsData : studentsData.data || [];
      setStudents(arr);
      
      const meta = studentsData.meta || studentsData;
      setLastPage(meta.last_page || 1);
      setTotal(meta.total || arr.length);
      setFrom(meta.from || 1);
      setTo(meta.to || arr.length);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSchoolsData = async () => {
    setIsSchoolsLoading(true);
    try {
      const res = await api.get('/reports/schools', {
        params: { search: schoolsSearchTerm, type: schoolTypeFilter }
      });
      const data = res.data;
      if (data.stats) setSchoolStats(data.stats);
      setSchoolsData(data.schools || []);
    } catch (e) { console.error(e); }
    finally { setIsSchoolsLoading(false); }
  };

  const fetchTransfers = async () => {
    setIsTransfersLoading(true);
    try {
      const params: any = { page: transfersPage, type: 'transfer' };
      if (selectedYearId) params.academic_year_id = selectedYearId;
      if (transferStatusFilter) params.status = transferStatusFilter;
      const res = await api.get('/reports/transfers', { params });
      
      const data = res.data;
      if (data.stats) setTransfersStats(data.stats);

      const transfersData = data.transfers || data;
      const arr = Array.isArray(transfersData) ? transfersData : transfersData.data || [];
      setTransfers(arr);
      const meta = transfersData.meta || transfersData;
      setTransfersLastPage(meta.last_page || 1);
      setTransfersTotal(meta.total || arr.length);
    } catch (e) { console.error(e); }
    finally { setIsTransfersLoading(false); }
  };

  const fetchResults = async () => {
    setIsResultsLoading(true);
    try {
      const params: any = { page: resultsPage };
      if (selectedYearId) params.academic_year_id = selectedYearId;
      if (resultsSchoolFilter) params.school_id = resultsSchoolFilter;
      if (resultsClassFilter) params.class_id = resultsClassFilter;
      
      const res = await api.get('/reports/results', { params });
      const data = res.data;
      
      if (data.stats) {
        setResultsStats(data.stats);
      }
      
      const resultsData = data.results || data;
      const arr = Array.isArray(resultsData) ? resultsData : resultsData.data || [];
      setResults(arr);
      
      // Parse pagination metadata
      const lastPageVal = resultsData.last_page || (resultsData.meta && resultsData.meta.last_page) || 1;
      const totalVal = resultsData.total || (resultsData.meta && resultsData.meta.total) || arr.length;
      setResultsLastPage(lastPageVal);
      setResultsTotal(totalVal);
      
    } catch (e) { console.error(e); }
    finally { setIsResultsLoading(false); }
  };

  const handleApplyFilter = () => {
    setPage(1);
    fetchStudents();
  };

  const filteredSchools = schoolsData;



  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800">التقارير والإحصائيات للمركزية</h1>
            <p className="text-sm text-slate-500 mt-1">نظام إدارة بيانات الطلاب - وزارة التربية والتعليم - مكتب الامتحانات</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Year Selector */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <ChevronDown size={16} className="text-slate-400" />
              <select
                className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 cursor-pointer"
                value={selectedYearId}
                onChange={e => { setSelectedYearId(e.target.value); setPage(1); }}
              >
                {academicYears.map(y => (
                  <option key={y.id} value={y.id}>العام الدراسي {y.year}</option>
                ))}
                {academicYears.length === 0 && <option>العام الدراسي 2026 / 2025</option>}
              </select>
            </div>
            <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm px-4 py-2 rounded-xl transition-colors border border-slate-200">
              <Printer size={16} />
              طباعة
            </button>
            <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-4 py-2 rounded-xl transition-colors shadow-sm">
              <FileSpreadsheet size={16} />
              تصدير Excel
            </button>
            <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-4 py-2 rounded-xl transition-colors shadow-sm">
              <FileText size={16} />
              PDF رسمي
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2 text-slate-700 font-bold">
            <Filter size={18} className="text-primary" />
            بحث متقدم وتصفية
          </div>
          {showFilters ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
        </button>

        {showFilters && (
          <div className="px-6 pb-6 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {/* School */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">اختر المدرسة (مديرية للكل)</label>
                <div className="relative">
                  <select
                    className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm text-slate-700 appearance-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    value={filters.school_id}
                    onChange={e => setFilters({ ...filters, school_id: e.target.value })}
                  >
                    <option value="">اختر المدرسة</option>
                    {schools.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Class */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">الصف الدراسي</label>
                <div className="relative">
                  <select
                    className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm text-slate-700 appearance-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    value={filters.class_id}
                    onChange={e => setFilters({ ...filters, class_id: e.target.value })}
                  >
                    <option value="">الكل</option>
                    {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">الجنس</label>
                <div className="relative">
                  <select
                    className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm text-slate-700 appearance-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    value={filters.gender}
                    onChange={e => setFilters({ ...filters, gender: e.target.value })}
                  >
                    <option value="">الكل</option>
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                  <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">حالة القيد</label>
                <div className="relative">
                  <select
                    className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm text-slate-700 appearance-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    value={filters.status}
                    onChange={e => setFilters({ ...filters, status: e.target.value })}
                  >
                    <option value="">الكل</option>
                    <option value="active">مستمر</option>
                    <option value="suspended">موقوف</option>
                    <option value="withdrawn">منسحب</option>
                  </select>
                  <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Date From */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">النطاق الزمني (اختياري)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    className="flex-1 h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm text-slate-700 outline-none focus:border-primary"
                    value={filters.date_from}
                    onChange={e => setFilters({ ...filters, date_from: e.target.value })}
                  />
                  <span className="text-slate-400 font-bold">—</span>
                  <input
                    type="date"
                    className="flex-1 h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm text-slate-700 outline-none focus:border-primary"
                    value={filters.date_to}
                    onChange={e => setFilters({ ...filters, date_to: e.target.value })}
                  />
                </div>
              </div>

              {/* Apply Button */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 opacity-0">تطبيق</label>
                <button
                  onClick={handleApplyFilter}
                  className="w-full h-10 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold text-sm rounded-lg transition-colors shadow-sm"
                >
                  <Search size={16} />
                  تطبيق الفلترة
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab.id === 'students' && <Users size={16} />}
              {tab.id === 'schools' && <MapPin size={16} />}
              {tab.id === 'transfers' && <TrendingUp size={16} />}
              {tab.id === 'results' && <GraduationCap size={16} />}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stats Cards - conditional by tab */}
        <div className="p-6 border-b border-slate-100">
          {activeTab === 'results' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                title="نسبة النجاح العامة"
                value={`${resultsStats.passRate || 0}%`}
                sub={`مقارنة بـ ${resultsStats.previousYearPassRate || 0}% العام الماضي`}
                icon={<GraduationCap size={22} className="text-emerald-600" />}
                iconBg="bg-emerald-100"
                valueColor="text-emerald-700"
              />
              <StatCard
                title="متوسط الدرجات"
                value={resultsStats.average || 76.4}
                sub="جميع المواد"
                icon={<BarChart3 size={22} className="text-primary" />}
                iconBg="bg-primary/10"
              />
              <StatCard
                title="أوائل المحافظة"
                value={resultsStats.topCount || 24}
                sub="طالب حاصل على 95%+"
                icon={<Award size={22} className="text-amber-600" />}
                iconBg="bg-amber-100"
                valueColor="text-amber-700"
              />
              <StatCard
                title="نسبة الرسوب"
                value={`${resultsStats.failRate || 0}%`}
                sub="تحسن ملحوظ"
                icon={<XOctagon size={22} className="text-red-500" />}
                iconBg="bg-red-100"
                valueColor="text-red-600"
              />
            </div>
          ) : activeTab === 'transfers' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                title="طلبات النقل الواردة"
                value={transfersStats.total}
                sub="خلال العام الحالي"
                icon={<ArrowLeftRight size={22} className="text-primary" />}
                iconBg="bg-primary/10"
              />
              <StatCard
                title="طلبات قيد الانتظار"
                value={transfersStats.pending}
                sub="تنتظر موافقة المديرية"
                icon={<Clock size={22} className="text-amber-600" />}
                iconBg="bg-amber-100"
                valueColor="text-amber-700"
              />
              <StatCard
                title="طلبات مكتملة"
                value={transfersStats.approved}
                sub="تم النقل / التحويل بنجاح"
                icon={<CheckCircle2 size={22} className="text-emerald-600" />}
                iconBg="bg-emerald-100"
                valueColor="text-emerald-700"
              />
              <StatCard
                title="طلبات مرفوضة"
                value={transfersStats.rejected}
                sub="تم الرفض / الإلغاء عليها"
                icon={<XCircle size={22} className="text-red-500" />}
                iconBg="bg-red-100"
                valueColor="text-red-600"
              />
            </div>
          ) : activeTab === 'schools' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                title="عدد المدارس"
                value={schoolStats.total}
                sub="في المديرية الكلية"
                icon={<Building2 size={22} className="text-primary" />}
                iconBg="bg-primary/10"
              />
              <StatCard
                title="إجمالي الطلاب"
                value={schoolStats.totalStudents}
                sub="متوسط 25 طالب لكل معلم"
                icon={<Users size={22} className="text-emerald-600" />}
                iconBg="bg-emerald-100"
                valueColor="text-emerald-700"
              />
              <StatCard
                title="مدارس مكتظة"
                value={schoolStats.overcrowded}
                sub="تجاوزت الطاقة الاستيعابية"
                icon={<AlertTriangle size={22} className="text-amber-600" />}
                iconBg="bg-amber-100"
                valueColor="text-amber-700"
              />
              <StatCard
                title="مدارس موقوفة مؤقتاً"
                value={schoolStats.suspended}
                sub="قيد التطوير والأصلاح"
                icon={<PauseCircle size={22} className="text-red-500" />}
                iconBg="bg-red-100"
                valueColor="text-red-600"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                title="إجمالي الطلاب"
                value={stats.total}
                sub="‎+3.2% عن العام الثاني"
                icon={<Users size={22} className="text-primary" />}
                iconBg="bg-primary/10"
              />
              <StatCard
                title="الطلاب الجدد"
                value={stats.new}
                sub="تم تسجيلهم هذا العام"
                icon={<TrendingUp size={22} className="text-emerald-600" />}
                iconBg="bg-emerald-100"
                valueColor="text-emerald-700"
              />
              <StatCard
                title="المنقولين"
                value={stats.villages}
                sub="بين المدارس"
                icon={<MapPin size={22} className="text-amber-600" />}
                iconBg="bg-amber-100"
                valueColor="text-amber-700"
              />
              <StatCard
                title="الراسبين / المُعيدين"
                value={stats.repeaters}
                sub="يحتاجون متابعة خاصة"
                icon={<AlertCircle size={22} className="text-red-500" />}
                iconBg="bg-red-100"
                valueColor="text-red-600"
              />
            </div>
          )}
        </div>

        {/* Results Table */}
        {activeTab === 'results' && (
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <h3 className="text-base font-black text-slate-800 flex-1">ملخص النتائج حسب المدارس</h3>
              <div className="relative">
                <select
                  className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary"
                  value={resultsSchoolFilter}
                  onChange={e => { setResultsSchoolFilter(e.target.value); setResultsPage(1); }}
                >
                  <option value="">جميع المدارس</option>
                  {schools.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <select
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary"
                value={resultsClassFilter}
                onChange={e => { setResultsClassFilter(e.target.value); setResultsPage(1); }}
              >
                <option value="">جميع الصفوف</option>
                {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 font-bold text-slate-600">اسم الطالب</th>
                      <th className="px-5 py-3.5 font-bold text-slate-600">المدرسة</th>
                      <th className="px-5 py-3.5 font-bold text-slate-600">الصف</th>
                      <th className="px-5 py-3.5 font-bold text-slate-600 text-center">عدد المتقدمين</th>
                      <th className="px-5 py-3.5 font-bold text-slate-600 text-center">نسبة النجاح</th>
                      <th className="px-5 py-3.5 font-bold text-slate-600 text-center">متوسط الدرجات</th>
                      <th className="px-5 py-3.5 font-bold text-slate-600">التاريخ</th>
                      <th className="px-5 py-3.5 font-bold text-slate-600">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isResultsLoading ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <Loader2 className="animate-spin text-primary" size={36} />
                            <span className="text-slate-500 font-medium">جاري تحميل بيانات النتائج...</span>
                          </div>
                        </td>
                      </tr>
                    ) : results.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-16 text-center text-slate-400">
                          <div className="flex flex-col items-center gap-2">
                            <GraduationCap size={40} className="opacity-20" />
                            <span>لا توجد نتائج مطابقة للفلتر المحدد</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      results.map((r: any) => {
                        const isPassed = r.status === 'passed' || r.is_passed === true || r.passed === true;
                        const isConditional = r.status === 'conditional' || r.status === 'مشروط';
                        const score = Number(r.total_score) || Number(r.average) || Number(r.final_score) || 0;
                        const passRate = r.pass_rate != null ? `${r.pass_rate}%` : isPassed ? '100%' : '—';
                        return (
                          <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="font-bold text-slate-800">{r.student?.full_name || r.student_name || '—'}</div>
                              <div className="text-xs text-slate-400 font-mono" dir="ltr">{r.student?.school_number || ''}</div>
                            </td>
                            <td className="px-5 py-3.5 text-slate-600 text-sm">{r.school?.name || r.school_name || r.enrollment?.school_name || '—'}</td>
                            <td className="px-5 py-3.5 text-slate-600 text-sm">{r.school_class?.name || r.class_name || r.enrollment?.class_name || '—'}</td>
                            <td className="px-5 py-3.5 text-center">
                              <span className="font-bold text-slate-700" dir="ltr">{r.total_students || 1}</span>
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <span className={`font-black text-sm ${
                                isPassed ? 'text-emerald-600' : isConditional ? 'text-amber-600' : 'text-red-600'
                              }`} dir="ltr">{passRate}</span>
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden min-w-[60px]">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      score >= 85 ? 'bg-emerald-500' : score >= 65 ? 'bg-amber-400' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${Math.min(score, 100)}%` }}
                                  />
                                </div>
                                <span className={`text-xs font-black w-8 ${
                                  score >= 85 ? 'text-emerald-600' : score >= 65 ? 'text-amber-600' : 'text-red-600'
                                }`} dir="ltr">{score}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-slate-500 text-sm" dir="ltr">
                              {r.created_at ? new Date(r.created_at).toLocaleDateString('ar-SA') : '—'}
                            </td>
                            <td className="px-5 py-3.5">
                              {isPassed ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                                  <CheckCircle2 size={11} />ناجح
                                </span>
                              ) : isConditional ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                                  <Clock size={11} />مشروط
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                  <XCircle size={11} />راسب
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              {resultsLastPage > 1 && (
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
                  <div className="text-sm text-slate-500">إجمالي {resultsTotal.toLocaleString('en')} نتيجة</div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setResultsPage(p => Math.max(1, p - 1))} disabled={resultsPage === 1} className="gap-1 rounded-lg h-9">
                      <ChevronRight size={15} />السابق
                    </Button>
                    <div className="h-9 px-4 flex items-center bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700">{resultsPage} / {resultsLastPage}</div>
                    <Button variant="outline" size="sm" onClick={() => setResultsPage(p => Math.min(resultsLastPage, p + 1))} disabled={resultsPage === resultsLastPage} className="gap-1 rounded-lg h-9">
                      التالي<ChevronLeft size={15} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transfers Table */}
        {activeTab === 'transfers' && (
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <h3 className="text-base font-black text-slate-800 flex-1">حركة تنقلات الطلاب الأخيرة</h3>
              <select
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary"
                value={transferStatusFilter}
                onChange={e => { setTransferStatusFilter(e.target.value); setTransfersPage(1); }}
              >
                <option value="">جميع الحالات</option>
                <option value="pending">قيد الانتظار</option>
                <option value="approved">مكتملة</option>
                <option value="rejected">مرفوضة</option>
              </select>
            </div>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 font-bold text-slate-600">اسم الطالب</th>
                      <th className="px-5 py-3.5 font-bold text-slate-600">من مدرسة</th>
                      <th className="px-5 py-3.5 font-bold text-slate-600">إلى مدرسة</th>
                      <th className="px-5 py-3.5 font-bold text-slate-600">نوع النقل</th>
                      <th className="px-5 py-3.5 font-bold text-slate-600">المنفذ</th>
                      <th className="px-5 py-3.5 font-bold text-slate-600">التاريخ</th>
                      <th className="px-5 py-3.5 font-bold text-slate-600">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isTransfersLoading ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <Loader2 className="animate-spin text-primary" size={36} />
                            <span className="text-slate-500 font-medium">جاري تحميل بيانات التنقلات...</span>
                          </div>
                        </td>
                      </tr>
                    ) : transfers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-16 text-center text-slate-400">
                          <div className="flex flex-col items-center gap-2">
                            <ArrowLeftRight size={40} className="opacity-20" />
                            <span>لا توجد تنقلات مطابقة للفلتر المحدد</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      transfers.map((t: any) => {
                        const statusMap: Record<string, { label: string; cls: string }> = {
                          approved: { label: 'مكتملة', cls: 'bg-emerald-100 text-emerald-700' },
                          pending:  { label: 'قيد الانتظار', cls: 'bg-amber-100 text-amber-700' },
                          rejected: { label: 'مرفوضة', cls: 'bg-red-100 text-red-700' },
                        };
                        const st = statusMap[t.status] || { label: t.status || '—', cls: 'bg-slate-100 text-slate-600' };
                        return (
                          <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="font-bold text-slate-800">{t.student?.full_name || t.student_name || '—'}</div>
                              <div className="text-xs text-slate-400 font-mono" dir="ltr">{t.student?.school_number || ''}</div>
                            </td>
                            <td className="px-5 py-3.5 text-slate-600 text-sm">{t.from_school?.name || t.from_external_school_name || '—'}</td>
                            <td className="px-5 py-3.5 text-slate-600 text-sm">{t.to_school?.name || '—'}</td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                t.from_school_id !== null ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                              }`}>
                                {t.from_school_id !== null ? 'داخلي' : 'خارجي'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-slate-600 text-sm">{t.created_by_user?.name || '—'}</td>
                            <td className="px-5 py-3.5 text-slate-500 text-sm" dir="ltr">
                              {t.created_at ? new Date(t.created_at).toLocaleDateString('ar-SA') : '—'}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${st.cls}`}>
                                {st.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              {transfersLastPage > 1 && (
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
                  <div className="text-sm text-slate-500">إجمالي {transfersTotal.toLocaleString('en')} طلب تنقل</div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setTransfersPage(p => Math.max(1, p - 1))} disabled={transfersPage === 1} className="gap-1 rounded-lg h-9">
                      <ChevronRight size={15} />السابق
                    </Button>
                    <div className="h-9 px-4 flex items-center bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700">{transfersPage} / {transfersLastPage}</div>
                    <Button variant="outline" size="sm" onClick={() => setTransfersPage(p => Math.min(transfersLastPage, p + 1))} disabled={transfersPage === transfersLastPage} className="gap-1 rounded-lg h-9">
                      التالي<ChevronLeft size={15} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Schools Capacity Table */}
        {activeTab === 'schools' && (
          <div className="p-6">
            {/* Search & Filter Row */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <h3 className="text-base font-black text-slate-800 flex-1">تحليل الطاقة الاستيعابية للمدارس</h3>
              <div className="relative">
                <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ابحث باسم المدرسة..."
                  className="h-9 pr-9 pl-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 w-56"
                  value={schoolsSearchTerm}
                  onChange={e => setSchoolsSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary"
                value={schoolTypeFilter}
                onChange={e => setSchoolTypeFilter(e.target.value)}
              >
                <option value="">جميع الأنواع</option>
                <option value="public">حكومي</option>
                <option value="private">خاص</option>
              </select>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 font-bold text-slate-600">اسم المدرسة</th>
                      <th className="px-5 py-3.5 font-bold text-slate-600">المنطقة</th>
                      <th className="px-5 py-3.5 font-bold text-slate-600">النوع</th>
                      <th className="px-5 py-3.5 font-bold text-slate-600 text-center">الطاقة الاستيعابية</th>
                      <th className="px-5 py-3.5 font-bold text-slate-600 text-center">العدد الفعلي</th>
                      <th className="px-5 py-3.5 font-bold text-slate-600">نسبة الإشغال</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isSchoolsLoading ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <Loader2 className="animate-spin text-primary" size={36} />
                            <span className="text-slate-500 font-medium">جاري تحميل بيانات المدارس...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredSchools.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-16 text-center text-slate-400">
                          <div className="flex flex-col items-center gap-2">
                            <Building2 size={40} className="opacity-20" />
                            <span>لا توجد مدارس مطابقة للبحث</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredSchools.map((school) => {
                        const pct = school.capacity > 0 ? (school.current_students / school.capacity) * 100 : 0;
                        const barColor = pct >= 100 ? 'bg-red-500' : pct >= 90 ? 'bg-amber-500' : pct >= 70 ? 'bg-yellow-400' : 'bg-emerald-500';
                        const pctColor = pct >= 100 ? 'text-red-600' : pct >= 90 ? 'text-amber-600' : 'text-emerald-600';
                        return (
                          <tr key={school.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">
                                  <Building2 size={15} />
                                </div>
                                <span className="font-bold text-slate-800">{school.name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-slate-500 text-sm">{school.address || '—'}</td>
                            <td className="px-5 py-3.5">
                              {school.school_type === 'public' ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">حكومي</span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">خاص</span>
                              )}
                            </td>
                            <td className="px-5 py-3.5 text-center font-bold text-slate-700" dir="ltr">{school.capacity.toLocaleString('en')}</td>
                            <td className="px-5 py-3.5 text-center font-bold text-slate-800" dir="ltr">{school.current_students.toLocaleString('en')}</td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden min-w-[80px]">
                                  <div
                                    className={`h-full rounded-full transition-all ${barColor}`}
                                    style={{ width: `${Math.min(pct, 100)}%` }}
                                  />
                                </div>
                                <span className={`text-xs font-black w-10 text-right ${pctColor}`} dir="ltr">
                                  {Math.round(pct)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Students Table */}
        {activeTab === 'students' && (
        <div className="p-6">
          <h3 className="text-base font-black text-slate-800 mb-4">بيانات الطالب التفصيلية</h3>
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5 font-bold text-slate-600">اسم الطالب</th>
                    <th className="px-5 py-3.5 font-bold text-slate-600">المدرسة</th>
                    <th className="px-5 py-3.5 font-bold text-slate-600">المرحلة</th>
                    <th className="px-5 py-3.5 font-bold text-slate-600">الصف</th>
                    <th className="px-5 py-3.5 font-bold text-slate-600">الجنس</th>
                    <th className="px-5 py-3.5 font-bold text-slate-600">الحالة</th>
                    <th className="px-5 py-3.5 font-bold text-slate-600 text-center">إجراءات سريعة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="animate-spin text-primary" size={36} />
                          <span className="text-slate-500 font-medium">جاري تحميل البيانات...</span>
                        </div>
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <Users size={40} className="opacity-20" />
                          <span>لا توجد بيانات مطابقة للفلاتر المحددة</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    students.map((s: any) => (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-800">{s.full_name}</div>
                          <div className="text-xs text-slate-400 font-mono" dir="ltr">{s.school_number}</div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 text-sm">
                          {s.current_enrollment?.school_name || s.enrollments?.[0]?.school_name || '—'}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 text-sm">
                          {s.current_enrollment?.stage || '—'}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 text-sm">
                          {s.current_enrollment?.class_name || s.enrollments?.[0]?.class_name || '—'}
                        </td>
                        <td className="px-5 py-3.5 text-sm">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            s.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                          }`}>
                            {s.gender === 'male' ? 'ذكر' : s.gender === 'female' ? 'أنثى' : '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm">
                          {(() => {
                            const status = s.current_enrollment?.status || s.enrollments?.[0]?.status || s.status;
                            if (status === 'active') {
                              return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">نشط</span>;
                            }
                            if (status === 'suspended') {
                              return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">موقوف</span>;
                            }
                            if (status === 'graduated') {
                              return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">متخرج</span>;
                            }
                            return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">{status || '—'}</span>;
                          })()}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <a
                            href={`/students/${s.id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <Eye size={13} />
                            عرض الملف
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
                <div className="text-sm text-slate-500">
                  عرض {from} إلى {to} من إجمالي {total.toLocaleString('en')} طالب
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="gap-1 rounded-lg h-9"
                  >
                    <ChevronRight size={15} />
                    السابق
                  </Button>
                  <div className="h-9 px-4 flex items-center bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700">
                    {page} / {lastPage}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(lastPage, p + 1))}
                    disabled={page === lastPage}
                    className="gap-1 rounded-lg h-9"
                  >
                    التالي
                    <ChevronLeft size={15} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};
