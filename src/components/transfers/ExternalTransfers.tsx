import React, { useState, useEffect } from 'react';
import {
  Search, UserPlus, CheckCircle2, XCircle, Clock, Globe, ArrowRight,
  School, User, Calendar, MapPin, FileText, Eye, Trash2, RefreshCw, Building2,
  Loader2, Filter, ChevronRight, ChevronLeft, FileDown
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { transferService, type TransferAdmissionRecord, type TransferStatus, type PaginatedResponse } from '@/services/transferService';
import { academicYearService, type AcademicYear } from '@/services/academicYearService';
import { schoolService } from '@/services/schoolService';
import { schoolClassService, type SchoolClass } from '@/services/schoolClassService';
import { type School as SchoolType } from '@/types/school';
import { useFormErrors } from '@/hooks/useFormErrors';

const ALLOWED_TRANSITIONS: Record<TransferStatus, TransferStatus[]> = {
  pending:  ['approved', 'rejected'],
  rejected: ['pending', 'approved'],
  approved: ['rejected'],
};

const StatusBadge: React.FC<{ status: TransferStatus }> = ({ status }) => {
  if (status === 'approved') return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700"><CheckCircle2 size={13} />مقبول</span>;
  if (status === 'rejected') return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700"><XCircle size={13} />مرفوض</span>;
  return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700"><Clock size={13} />قيد الانتظار</span>;
};

// ─── Confirm Dialog ──────────────────────────────────────────────────────
const ConfirmDialog: React.FC<{
  message: string; confirmLabel: string; confirmClass: string;
  icon: React.ReactNode; onConfirm: () => void; onCancel: () => void;
}> = ({ message, confirmLabel, confirmClass, icon, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" dir="rtl">
    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 text-center space-y-5 animate-in zoom-in-95">
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto">{icon}</div>
      <p className="text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: message }} />
      <div className="flex gap-3">
        <Button onClick={onCancel} variant="outline" className="flex-1 h-11 rounded-xl font-bold">إلغاء</Button>
        <Button onClick={onConfirm} className={`flex-1 h-11 rounded-xl font-bold text-white gap-2 ${confirmClass}`}>
          {icon}{confirmLabel}
        </Button>
      </div>
    </div>
  </div>
);

// ─── Show View ───────────────────────────────────────────────────────────
const ShowExternal: React.FC<{
  record: TransferAdmissionRecord;
  onBack: () => void;
  onExportPdf: (id: number) => void;
  pdfLoadingId: number | null;
}> = ({ record, onBack, onExportPdf, pdfLoadingId }) => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <div className="flex items-center justify-between pb-4 border-b border-slate-200">
      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
        <Globe className="text-indigo-600" size={22} />
        تفاصيل طالب وافد من خارج المحافظة
      </h3>
      <div className="flex items-center gap-3">
        {record.status === 'approved' && (
          <Button
            onClick={() => onExportPdf(record.id)}
            disabled={pdfLoadingId === record.id}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl shadow-sm transition-colors text-sm"
          >
            {pdfLoadingId === record.id ? <Loader2 className="animate-spin" size={16} /> : <FileDown size={16} />}
            تصدير PDF
          </Button>
        )}
        <Button onClick={onBack} variant="outline" className="gap-2 rounded-xl font-bold text-slate-600">
          رجوع للقائمة <ArrowRight size={16} />
        </Button>
      </div>
    </div>

    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Status Banner */}
      <div className={`px-8 py-4 flex items-center justify-between border-b ${
        record.status === 'approved' ? 'bg-emerald-50 border-emerald-100'
        : record.status === 'rejected' ? 'bg-red-50 border-red-100'
        : 'bg-amber-50 border-amber-100'
      }`}>
        <span className="text-sm font-bold text-slate-600">حالة الطلب</span>
        <StatusBadge status={record.status} />
      </div>

      <div className="p-8 space-y-8">
        {/* Student Personal Info */}
        <div>
          <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><User size={15} />البيانات الشخصية للطالب</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'الاسم الكامل', value: record.student?.full_name },
              { label: 'الرقم المدرسي', value: record.student?.school_number, ltr: true },
              { label: 'رقم الجلوس', value: record.student?.seat_number, ltr: true },
              { label: 'الجنس', value: record.student?.gender },
              { label: 'الجنسية', value: record.student?.nationality },
              { label: 'تاريخ الميلاد', value: record.student?.date_of_birth, ltr: true },
              { label: 'مكان الميلاد', value: record.student?.place_of_birth },
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                <p className={`font-bold text-slate-800 ${item.ltr ? 'font-mono' : ''}`} dir={item.ltr ? 'ltr' : undefined}>{item.value || '—'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Transfer Info */}
        <div>
          <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><Building2 size={15} />بيانات التحويل</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 md:col-span-3">
              <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Globe size={12} />المدرسة السابقة (خارجية)</p>
              <p className="font-bold text-slate-700">{record.from_external_school_name}</p>
            </div>
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
              <p className="text-xs text-indigo-400 mb-1 flex items-center gap-1"><School size={12} />موجه إلى مدرسة</p>
              <p className="font-bold text-indigo-700">{record.to_school?.name}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs text-slate-400 mb-1">الصف الدراسي</p>
              <p className="font-bold text-slate-700">{record.school_class?.name}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Calendar size={12} />تاريخ الطلب</p>
              <p className="font-bold text-slate-700" dir="ltr">{record.request_date}</p>
            </div>
          </div>
        </div>

        {record.reason && (
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
            <p className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-2"><FileText size={13} />سبب التحويل</p>
            <p className="text-slate-700 leading-relaxed">{record.reason}</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────
export const ExternalTransfers: React.FC = () => {
  const [records, setRecords] = useState<TransferAdmissionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
  const [viewingRecord, setViewingRecord] = useState<TransferAdmissionRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginatedResponse<TransferAdmissionRecord> | null>(null);

  const { errors, handleApiError, clearErrors } = useFormErrors();

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<number | string>('');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<string>('');

  const [confirmAction, setConfirmAction] = useState<{ record: TransferAdmissionRecord; targetStatus: TransferStatus } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TransferAdmissionRecord | null>(null);

  // For Registration Form
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfLoadingId, setPdfLoadingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    school_number: '',
    seat_number: '',
    nationality: 'يمني',
    gender: 'male',
    date_of_birth: '',
    place_of_birth: '',
    from_external_school_name: '',
    to_school_id: '',
    class_id: '',
    reason: ''
  });

  useEffect(() => {
    fetchAcademicYears();
    fetchSchools();
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchExternalTransfers();
  }, [selectedYearId, selectedSchoolId, selectedClassId, selectedGender, currentPage]);

  const fetchAcademicYears = async () => {
    try {
      const data = await academicYearService.getAcademicYears();
      setAcademicYears(data);
      const activeYear = data.find(y => y.status === 'active');
      if (activeYear) setSelectedYearId(activeYear.id);
    } catch (error) {
      console.error('Error fetching academic years:', error);
    }
  };

  const fetchSchools = async () => {
    try {
      const data = await schoolService.getSchools();
      setSchools(data);
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const data = await schoolClassService.getSchoolClasses();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchExternalTransfers = async () => {
    setIsLoading(true);
    try {
      // Backend Distinguishes external transfers by from_school_id being null and external name being present
      const response = await transferService.getTransfers({
        type: 'transfer',
        search: searchQuery,
        academic_year_id: selectedYearId ? Number(selectedYearId) : undefined,
        school_id: selectedSchoolId ? Number(selectedSchoolId) : undefined,
        class_id: selectedClassId ? Number(selectedClassId) : undefined,
        gender: selectedGender || undefined,
        page: currentPage
      });
      
      // Filter only external ones (from_school_id is null)
      // Actually, it might be better to just let the backend handle the type=admission or similar
      // but based on the provided backend logic, type='transfer' with from_school_id=null is used for out region.
      // Let's filter here for now if the API returns everything.
      const externalOnly = (response.data || []).filter(r => r.from_school_id === null && r.from_external_school_name !== null);
      setRecords(externalOnly);
      setPagination(response);
    } catch (error) {
      console.error('Error fetching external transfers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchExternalTransfers();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    setIsSubmitting(true);
    try {
      await transferService.registerExternalStudent({
        ...formData,
        academic_year_id: Number(selectedYearId),
        to_school_id: Number(formData.to_school_id),
        class_id: Number(formData.class_id)
      });
      setViewMode('list');
      fetchExternalTransfers();
      resetForm();
    } catch (error) {
      console.error('Error registering student:', error);
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      school_number: '',
      seat_number: '',
      nationality: 'يمني',
      gender: 'male',
      date_of_birth: '',
      place_of_birth: '',
      from_external_school_name: '',
      to_school_id: '',
      class_id: '',
      reason: ''
    });
  };

  const handleExportPdf = async (id: number) => {
    setPdfLoadingId(id);
    try {
      await transferService.downloadTransferPdf(id);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setPdfLoadingId(null);
    }
  };

  const handleStatusUpdate = async () => {
    if (!confirmAction) return;
    try {
      await transferService.updateStatus(confirmAction.record.id, {
        status: confirmAction.targetStatus,
        approval_date: confirmAction.targetStatus === 'approved' ? new Date().toISOString().split('T')[0] : undefined
      });
      fetchExternalTransfers();
      setConfirmAction(null);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await transferService.deleteTransfer(deleteTarget.id);
      fetchExternalTransfers();
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting transfer:', error);
    }
  };

  if (viewingRecord) {
    return <ShowExternal record={viewingRecord} onBack={() => setViewingRecord(null)} onExportPdf={handleExportPdf} pdfLoadingId={pdfLoadingId} />;
  }

  if (viewMode === 'create') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <UserPlus className="text-indigo-600" size={22} />
            تسجيل طالب وافد من خارج المحافظة
          </h3>
          <Button onClick={() => setViewMode('list')} variant="outline" className="gap-2 rounded-xl font-bold text-slate-600">
            رجوع للقائمة <ArrowRight size={16} />
          </Button>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <form className="space-y-8" onSubmit={handleRegisterSubmit}>
            <div>
              <h4 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-5"><User className="text-slate-400" size={18} />البيانات الأساسية للطالب</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الاسم الرباعي <span className="text-red-500">*</span></label>
                  <Input 
                    placeholder="أدخل اسم الطالب رباعياً" 
                    className="bg-slate-50" 
                    value={formData.full_name}
                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                  />
                  {errors.full_name && <span className="text-xs text-red-500 font-medium">{errors.full_name[0]}</span>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الرقم المدرسي / الوطني <span className="text-red-500">*</span></label>
                  <Input 
                    placeholder="أدخل الرقم" 
                    className="bg-slate-50" 
                    value={formData.school_number}
                    onChange={e => setFormData({ ...formData, school_number: e.target.value })}
                  />
                  {errors.school_number && <span className="text-xs text-red-500 font-medium">{errors.school_number[0]}</span>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">رقم الجلوس <span className="text-red-500">*</span></label>
                  <Input 
                    placeholder="أدخل رقم الجلوس" 
                    className="bg-slate-50" 
                    value={formData.seat_number}
                    onChange={e => setFormData({ ...formData, seat_number: e.target.value })}
                  />
                  {errors.seat_number && <span className="text-xs text-red-500 font-medium">{errors.seat_number[0]}</span>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الجنسية <span className="text-red-500">*</span></label>
                  <Input 
                    placeholder="مثال: يمني" 
                    className="bg-slate-50" 
                    value={formData.nationality}
                    onChange={e => setFormData({ ...formData, nationality: e.target.value })}
                  />
                  {errors.nationality && <span className="text-xs text-red-500 font-medium">{errors.nationality[0]}</span>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">مكان الميلاد <span className="text-red-500">*</span></label>
                  <Input 
                    placeholder="مكان الميلاد" 
                    className="bg-slate-50" 
                    value={formData.place_of_birth}
                    onChange={e => setFormData({ ...formData, place_of_birth: e.target.value })}
                  />
                  {errors.place_of_birth && <span className="text-xs text-red-500 font-medium">{errors.place_of_birth[0]}</span>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الجنس <span className="text-red-500">*</span></label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-primary text-slate-700"
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-1"><Calendar size={13} />تاريخ الميلاد <span className="text-red-500">*</span></label>
                  <Input 
                    type="date" 
                    className="bg-slate-50" 
                    value={formData.date_of_birth}
                    onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })}
                  />
                  {errors.date_of_birth && <span className="text-xs text-red-500 font-medium">{errors.date_of_birth[0]}</span>}
                </div>
              </div>
            </div>
            <hr className="border-slate-100" />
            <div>
              <h4 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-5"><Globe className="text-slate-400" size={18} />بيانات التحويل</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-1"><MapPin size={13} />المدرسة السابقة (خارج المحافظة) <span className="text-red-500">*</span></label>
                  <Input 
                    placeholder="مثال: مدرسة الوحدة الأساسية بصنعاء" 
                    className="bg-slate-50" 
                    value={formData.from_external_school_name}
                    onChange={e => setFormData({ ...formData, from_external_school_name: e.target.value })}
                  />
                  {errors.from_external_school_name && <span className="text-xs text-red-500 font-medium">{errors.from_external_school_name[0]}</span>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-1"><School size={13} />المدرسة الموجه إليها <span className="text-red-500">*</span></label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-primary text-slate-700"
                    value={formData.to_school_id}
                    onChange={e => setFormData({ ...formData, to_school_id: e.target.value })}
                  >
                    <option value="">-- اختر المدرسة --</option>
                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  {errors.to_school_id && <span className="text-xs text-red-500 font-medium">{errors.to_school_id[0]}</span>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الصف الدراسي <span className="text-red-500">*</span></label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-primary text-slate-700"
                    value={formData.class_id}
                    onChange={e => setFormData({ ...formData, class_id: e.target.value })}
                  >
                    <option value="">-- اختر الصف --</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.class_id && <span className="text-xs text-red-500 font-medium">{errors.class_id[0]}</span>}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-1"><FileText size={13} />سبب التحويل (اختياري)</label>
                  <textarea 
                    rows={3} 
                    placeholder="ملاحظات..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-primary text-slate-700 resize-none" 
                    value={formData.reason}
                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Button type="button" onClick={() => { setViewMode('list'); resetForm(); }} variant="outline" className="px-8 font-bold h-12 rounded-xl text-slate-600">إلغاء</Button>
              <Button type="submit" disabled={isSubmitting} className="px-8 font-bold h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={17} />}
                {isSubmitting ? 'جاري التسجيل...' : 'تسجيل وحفظ البيانات'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="بحث باسم الطالب أو المدرسة..." 
              className="pr-10 bg-white rounded-xl border-slate-200" 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
            />
          </div>
          <Button type="submit" variant="secondary" className="rounded-xl">بحث</Button>
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto mt-4 md:mt-0">
          <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 text-sm w-full xl:w-auto">
            <Filter size={16} className="text-slate-400 hidden sm:block" />
            
            <select 
              className="bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700 font-medium px-2 py-1.5 flex-1 sm:flex-none"
              value={selectedYearId}
              onChange={(e) => { setSelectedYearId(e.target.value); setCurrentPage(1); }}
            >
              <option value="">كل السنوات</option>
              {academicYears.map(year => <option key={year.id} value={year.id}>{year.year}</option>)}
            </select>

            <select 
              className="bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700 font-medium px-2 py-1.5 flex-1 sm:flex-none"
              value={selectedSchoolId}
              onChange={(e) => { setSelectedSchoolId(e.target.value); setCurrentPage(1); }}
            >
              <option value="">كل المدارس</option>
              {schools.map(school => <option key={school.id} value={school.id}>{school.name}</option>)}
            </select>

            <select 
              className="bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700 font-medium px-2 py-1.5 flex-1 sm:flex-none"
              value={selectedClassId}
              onChange={(e) => { setSelectedClassId(e.target.value); setCurrentPage(1); }}
            >
              <option value="">كل الصفوف</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select 
              className="bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700 font-medium px-2 py-1.5 flex-1 sm:flex-none"
              value={selectedGender}
              onChange={(e) => { setSelectedGender(e.target.value); setCurrentPage(1); }}
            >
              <option value="">الجنس (الكل)</option>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
          </div>
          <Button onClick={() => setViewMode('create')} className="w-full sm:w-auto gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm whitespace-nowrap">
            <UserPlus size={18} /> تسجيل طالب وافد
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table dir="rtl">
            <TableHeader className="bg-slate-50 border-b border-slate-200">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-slate-700 text-right py-4 px-4">الطالب</TableHead>
                <TableHead className="font-bold text-slate-700 text-right py-4 px-4">المدرسة الخارجية</TableHead>
                <TableHead className="font-bold text-slate-700 text-right py-4 px-4">موجه إلى</TableHead>
                <TableHead className="font-bold text-slate-700 text-right py-4 px-4">الصف</TableHead>
                <TableHead className="font-bold text-slate-700 text-center py-4 px-4">الحالة</TableHead>
                <TableHead className="font-bold text-slate-700 text-center py-4 px-4 w-[200px]">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-indigo-600" size={40} />
                      <span className="font-bold text-indigo-600">جاري تحميل البيانات...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10 text-slate-500">لا توجد سجلات مطابقة.</TableCell></TableRow>
              ) : (
                records.map(t => {
                  const allowed = ALLOWED_TRANSITIONS[t.status];
                  const canDelete = t.status !== 'approved';
                  return (
                    <TableRow key={t.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="py-3 px-4">
                        <p className="font-bold text-slate-800">{t.student.full_name}</p>
                        <p className="text-xs text-slate-500 font-mono" dir="ltr">{t.student.school_number}</p>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <span className="flex items-center gap-1.5 text-slate-600 text-sm font-medium"><Globe size={13} className="text-slate-400" />{t.from_external_school_name}</span>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <span className="flex items-center gap-1.5 text-indigo-600 text-sm font-bold"><ArrowRight size={13} />{t.to_school?.name}</span>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-sm text-slate-700">{t.school_class?.name}</TableCell>
                      <TableCell className="py-3 px-4 text-center"><StatusBadge status={t.status} /></TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => setViewingRecord(t)} title="عرض التفاصيل" className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                            <Eye size={15} />
                          </button>
                          {t.status === 'approved' && (
                            <button
                              onClick={() => handleExportPdf(t.id)}
                              disabled={pdfLoadingId === t.id}
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                              title="تصدير PDF"
                            >
                              {pdfLoadingId === t.id ? <Loader2 className="animate-spin" size={15} /> : <FileDown size={15} />}
                            </button>
                          )}
                          {allowed.includes('approved') && (
                            <button onClick={() => setConfirmAction({ record: t, targetStatus: 'approved' })} title="قبول" className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                              <CheckCircle2 size={15} />
                            </button>
                          )}
                          {allowed.includes('rejected') && (
                            <button onClick={() => setConfirmAction({ record: t, targetStatus: 'rejected' })} title="رفض" className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                              <XCircle size={15} />
                            </button>
                          )}
                          {allowed.includes('pending') && (
                            <button onClick={() => setConfirmAction({ record: t, targetStatus: 'pending' })} title="إعادة فتح" className="p-1.5 rounded-lg bg-amber-50 text-amber-500 hover:bg-amber-100 transition-colors">
                              <RefreshCw size={15} />
                            </button>
                          )}
                          {/* حذف الزر عند approved — متوافق مع الكنترولر */}
                          {canDelete && (
                            <button onClick={() => setDeleteTarget(t)} title="حذف" className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="text-sm text-slate-500">
              عرض {pagination.from} إلى {pagination.to} من إجمالي {pagination.total} سجل
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="gap-1 rounded-lg"
              >
                <ChevronRight size={16} />
                السابق
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === pagination.last_page || Math.abs(p - currentPage) <= 1)
                  .map((p, i, arr) => (
                    <React.Fragment key={p}>
                      {i > 0 && arr[i-1] !== p - 1 && <span className="px-2 text-slate-400">...</span>}
                      <Button
                        variant={currentPage === p ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(p)}
                        className={`w-9 h-9 p-0 rounded-lg ${currentPage === p ? 'shadow-md shadow-indigo/20' : ''}`}
                      >
                        {p}
                      </Button>
                    </React.Fragment>
                  ))
                }
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.last_page}
                className="gap-1 rounded-lg"
              >
                التالي
                <ChevronLeft size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {confirmAction && (
        <ConfirmDialog
          message={`هل تريد <strong>${confirmAction.targetStatus === 'approved' ? 'قبول' : confirmAction.targetStatus === 'rejected' ? 'رفض' : 'إعادة فتح'}</strong> طلب الطالب <strong>${confirmAction.record.student.full_name}</strong>؟`}
          confirmLabel={confirmAction.targetStatus === 'approved' ? 'قبول' : confirmAction.targetStatus === 'rejected' ? 'رفض' : 'إعادة فتح'}
          confirmClass={confirmAction.targetStatus === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : confirmAction.targetStatus === 'rejected' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'}
          icon={confirmAction.targetStatus === 'approved' ? <CheckCircle2 size={22} className="text-emerald-600" /> : confirmAction.targetStatus === 'rejected' ? <XCircle size={22} className="text-red-500" /> : <RefreshCw size={22} className="text-amber-500" />}
          onConfirm={handleStatusUpdate}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`هل تريد حذف سجل الطالب الوافد <strong>${deleteTarget.student.full_name}</strong> نهائياً؟`}
          confirmLabel="حذف نهائياً"
          confirmClass="bg-red-600 hover:bg-red-700"
          icon={<Trash2 size={22} className="text-red-500" />}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
