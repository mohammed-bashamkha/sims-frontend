import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, Plus, CheckCircle2, XCircle, Clock, ArrowRight,
  School, FileText, Trash2, RefreshCw, Eye, User, Calendar,
  FileDown, Building2, CalendarRange, Loader2, Filter, ChevronRight, ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { transferService, type TransferAdmissionRecord, type TransferStatus, type PaginatedResponse } from '@/services/transferService';
import { academicYearService, type AcademicYear } from '@/services/academicYearService';
import { schoolService } from '@/services/schoolService';
import { studentService } from '@/services/studentService';
import { type Student as StudentType } from '@/types/student';
import { type School as SchoolType } from '@/types/school';
import api from '@/api/axios';
import { useToastStore } from '@/store/toastStore';

// Allowed transitions matching the backend logic exactly
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

const ShowAdmission: React.FC<{ record: TransferAdmissionRecord; onBack: () => void; onExport: (id: number) => void; isExporting: boolean }> = ({ record, onBack, onExport, isExporting }) => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <div className="flex items-center justify-between pb-4 border-b border-slate-200">
      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
        <CalendarRange className="text-primary" size={22} />
        تفاصيل طلب القبول المؤقت
      </h3>
      <div className="flex items-center gap-3">
        {record.status === 'approved' && (
          <Button
            onClick={() => onExport(record.id)}
            disabled={isExporting}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl shadow-sm transition-colors text-sm"
          >
            {isExporting ? <Loader2 className="animate-spin" size={16} /> : <FileDown size={16} />}
            تصدير PDF
          </Button>
        )}
        <Button onClick={onBack} variant="outline" className="gap-2 rounded-xl font-bold text-slate-600">
          رجوع للقائمة <ArrowRight size={16} />
        </Button>
      </div>
    </div>

    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className={`px-8 py-4 flex items-center justify-between border-b ${
        record.status === 'approved' ? 'bg-emerald-50 border-emerald-100'
        : record.status === 'rejected' ? 'bg-red-50 border-red-100'
        : 'bg-amber-50 border-amber-100'
      }`}>
        <span className="text-sm font-bold text-slate-600">حالة الطلب</span>
        <StatusBadge status={record.status} />
      </div>

      <div className="p-8 space-y-8">
        <div>
          <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><User size={15} />بيانات الطالب</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs text-slate-400 mb-1">اسم الطالب</p>
              <p className="font-bold text-slate-800 text-lg">{record.student?.full_name}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs text-slate-400 mb-1">الرقم المدرسي</p>
              <p className="font-bold text-slate-800 font-mono" dir="ltr">{record.student?.school_number}</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><Building2 size={15} />بيانات المدارس</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><School size={12} />المدرسة الأصلية</p>
              <p className="font-bold text-slate-700">{record.from_school?.name}</p>
            </div>
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
              <p className="text-xs text-primary/60 mb-1 flex items-center gap-1"><School size={12} />مدرسة القبول المؤقت</p>
              <p className="font-bold text-primary">{record.to_school?.name}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs text-slate-400 mb-1">الصف الدراسي</p>
              <p className="font-bold text-slate-700">{record.school_class?.name}</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><Calendar size={15} />التواريخ والمعلومات الإضافية</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs text-slate-400 mb-1">تاريخ الطلب</p>
              <p className="font-bold text-slate-700" dir="ltr">{record.request_date}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs text-slate-400 mb-1">تاريخ البداية</p>
              <p className="font-bold text-slate-700" dir="ltr">{record.start_date || '—'}</p>
            </div>
            <div className={`rounded-xl p-4 border ${record.end_date && new Date(record.end_date) < new Date() ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
              <p className="text-xs text-slate-400 mb-1">تاريخ الانتهاء</p>
              <p className={`font-bold ${record.end_date && new Date(record.end_date) < new Date() ? 'text-red-600' : 'text-slate-700'}`} dir="ltr">
                {record.end_date || '—'}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs text-slate-400 mb-1">سجل بواسطة</p>
              <p className="font-bold text-slate-700">{record.created_by_user?.name || 'النظام'}</p>
            </div>
          </div>
        </div>

        {(record.reason || record.based_on) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {record.reason && (
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <p className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1"><FileText size={13} />سبب القبول المؤقت</p>
                <p className="text-slate-700 leading-relaxed">{record.reason}</p>
              </div>
            )}
            {record.based_on && (
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <p className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1"><FileText size={13} />بناءً على</p>
                <p className="text-slate-700 leading-relaxed">{record.based_on}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);

export const TemporaryAdmissions: React.FC = () => {
  const { toast } = useToastStore();
  const [viewMode, setViewMode] = useState<'list' | 'select_student'>('list');
  const [records, setRecords] = useState<TransferAdmissionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginatedResponse<TransferAdmissionRecord> | null>(null);


  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<number | string>('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<TransferAdmissionRecord | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ record: TransferAdmissionRecord; targetStatus: TransferStatus } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TransferAdmissionRecord | null>(null);

  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  
  const [studentSearch, setStudentSearch] = useState(searchParams.get('search') || '');
  const [studentPage, setStudentPage] = useState(1);
  const [studentTotalPages, setStudentTotalPages] = useState(1);
  const [studentTotalItems, setStudentTotalItems] = useState(0);
  const [studentFilters, setStudentFilters] = useState({
    school_id: '',
    class_id: '',
    academic_year_id: ''
  });
  const [students, setStudents] = useState<any[]>([]);

  const [selectedStudent, setSelectedStudent] = useState<StudentType | null>(null);
  const [formData, setFormData] = useState({
    to_school_id: '',
    request_date: new Date().toISOString().split('T')[0],
    start_date: '',
    end_date: '',
    reason: '',
    based_on: '',
    status: 'pending' as TransferStatus
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfLoadingId, setPdfLoadingId] = useState<number | null>(null);

  useEffect(() => {
    fetchAcademicYears();
    fetchSchools();
    fetchClasses();
  }, []);

  useEffect(() => {
    if (viewMode === 'list') {
      fetchAdmissions();
    }
  }, [selectedYearId, currentPage, viewMode]);

  useEffect(() => {
    fetchStudents();
  }, [studentSearch, studentPage, studentFilters, viewMode]);

  useEffect(() => {
    const action = searchParams.get('action');
    const studentId = searchParams.get('student_id');
    if (!studentId) return;

    if (action === 'create') {
      studentService.getStudentById(Number(studentId)).then(res => {
        if (res.data) {
          handleOpenModal(res.data);
        }
      }).catch(console.error);
    }
  }, [searchParams]);

  // Auto-open student's admission record when records are loaded
  useEffect(() => {
    const action = searchParams.get('action');
    const studentId = searchParams.get('student_id');
    if (!studentId || action === 'create' || records.length === 0) return;
    const record = records.find(r => r.student?.id === Number(studentId));
    if (record) setViewingRecord(record);
  }, [records, searchParams]);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/school-classes');
      setClasses(res.data.data || res.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchStudents = async () => {
    if (viewMode !== 'select_student') return;
    setIsLoading(true);
    try {
      const res = await studentService.getStudents({
        page: studentPage,
        search: studentSearch || undefined,
        school_id: studentFilters.school_id || undefined,
        class_id: studentFilters.class_id || undefined,
        academic_year_id: studentFilters.academic_year_id || undefined
      });
      setStudents(res.data || []);
      setStudentTotalPages(res.meta?.last_page || res.last_page || 1);
      setStudentTotalItems(res.meta?.total || res.total || 0);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const fetchAdmissions = async () => {
    setIsLoading(true);
    try {
      const response = await transferService.getTransfers({
        type: 'admission',
        search: searchQuery,
        academic_year_id: selectedYearId ? Number(selectedYearId) : undefined,
        page: currentPage
      });
      setRecords(response.data || []);
      setPagination(response);
    } catch (error) {
      console.error('Error fetching admissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAdmissions();
  };

  const handleOpenModal = (student: any) => {
    setSelectedStudent(student);
    setFormData({
      to_school_id: '',
      request_date: new Date().toISOString().split('T')[0],
      start_date: '',
      end_date: '',
      reason: '',
      based_on: '',
      status: 'pending' as TransferStatus
    });
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async () => {
    if (!selectedStudent || !formData.to_school_id) return;
    setIsSubmitting(true);
    try {
      const res = await transferService.storeAdmission({
        student_id: selectedStudent.id,
        to_school_id: Number(formData.to_school_id),
        request_date: formData.request_date,
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason,
        based_on: formData.based_on,
        status: formData.status
      });
      toast(res.message, 'success');
      setIsCreateOpen(false);
      setViewMode('list');
      resetForm();
      fetchAdmissions();
    } catch (error: any) {
      toast(error.response?.data?.message || 'حدث خطأ أثناء حفظ الطلب', 'error');
      console.error('Error creating admission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedStudent(null);
    setStudentSearch('');
    setFormData({
      to_school_id: '',
      request_date: new Date().toISOString().split('T')[0],
      start_date: '',
      end_date: '',
      reason: '',
      based_on: '',
      status: 'pending' as TransferStatus
    });
  };

  const handleStatusUpdate = async () => {
    if (!confirmAction) return;
    try {
      const res = await transferService.updateStatus(confirmAction.record.id, {
        status: confirmAction.targetStatus,
        approval_date: confirmAction.targetStatus === 'approved' ? new Date().toISOString().split('T')[0] : undefined
      });
      toast(res.message, 'success');
      fetchAdmissions();
      setConfirmAction(null);
    } catch (error: any) {
      const errorMsg = error.response?.data?.errors?.status?.[0] || error.response?.data?.message || 'حدث خطأ أثناء تحديث الحالة';
      toast(errorMsg, 'error');
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await transferService.deleteTransfer(deleteTarget.id);
      fetchAdmissions();
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting admission:', error);
    }
  };

  const handleExportPdf = async (id: number) => {
    setPdfLoadingId(id);
    try {
      await transferService.downloadAdmissionPdf(id);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setPdfLoadingId(null);
    }
  };

  let content;

  if (viewingRecord) {
    content = <ShowAdmission record={viewingRecord} onBack={() => setViewingRecord(null)} onExport={handleExportPdf} isExporting={pdfLoadingId === viewingRecord.id} />;
  } else if (viewMode === 'select_student') {
    content = (
      <div className="space-y-6 animate-in slide-in-from-right duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">اختيار الطالب</h2>
              <p className="text-sm text-slate-500">ابحث عن الطالب الذي ترغب في إنشاء قبول مؤقت له</p>
            </div>
          </div>

          <Button 
            onClick={() => setViewMode('list')}
            variant="outline"
            className="text-slate-600 border-slate-200 hover:bg-slate-50 font-bold gap-2 rounded-xl px-6 shadow-sm"
          >
            إلغاء والرجوع
            <ArrowRight size={16} />
          </Button>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="بحث باسم الطالب أو الرقم المدرسي..." 
              className="pr-10 bg-white rounded-xl border-slate-200"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <select 
              className="h-10 bg-white border border-slate-200 rounded-xl px-3 text-sm min-w-[140px]"
              value={studentFilters.school_id}
              onChange={(e) => setStudentFilters({...studentFilters, school_id: e.target.value})}
            >
              <option value="">كل المدارس</option>
              {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            <select 
              className="h-10 bg-white border border-slate-200 rounded-xl px-3 text-sm min-w-[140px]"
              value={studentFilters.class_id}
              onChange={(e) => setStudentFilters({...studentFilters, class_id: e.target.value})}
            >
              <option value="">كل الصفوف</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select 
              className="h-10 bg-white border border-slate-200 rounded-xl px-3 text-sm min-w-[140px]"
              value={studentFilters.academic_year_id}
              onChange={(e) => setStudentFilters({...studentFilters, academic_year_id: e.target.value})}
            >
              <option value="">كل الأعوام</option>
              {academicYears.map(y => <option key={y.id} value={y.id}>{y.year}</option>)}
            </select>

            {(studentFilters.school_id || studentFilters.class_id || studentFilters.academic_year_id || studentSearch) && (
              <Button 
                variant="ghost" 
                className="text-red-500 hover:text-red-600 font-bold px-2"
                onClick={() => {
                  setStudentFilters({ school_id: '', class_id: '', academic_year_id: '' });
                  setStudentSearch('');
                }}
              >
                إعادة تعيين
              </Button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold">اسم الطالب</th>
                  <th className="px-6 py-4 font-bold">الرقم المدرسي</th>
                  <th className="px-6 py-4 font-bold">المدرسة الحالية</th>
                  <th className="px-6 py-4 font-bold text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-slate-500">
                      جاري البحث عن الطلاب...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                      لا يوجد طلاب مطابقين لمعايير البحث
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{student.full_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded" dir="ltr">{student.school_number}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {student.current_enrollment?.school_name || student.enrollments?.[0]?.school_name || 'غير محدد'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button 
                          onClick={() => handleOpenModal(student)}
                          className="bg-primary hover:bg-primary/90 text-white font-bold gap-2 rounded-lg px-4 shadow-sm h-9 text-xs"
                        >
                          <FileText size={14} />
                          إنشاء قبول مؤقت
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {studentTotalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <div className="text-sm text-slate-500">
                النتائج: {students.length} من {studentTotalItems} طالب
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setStudentPage(p => Math.max(1, p - 1))}
                  disabled={studentPage === 1}
                  className="rounded-lg h-9"
                >
                  السابق
                </Button>
                <div className="h-9 px-4 flex items-center bg-white border border-slate-200 rounded-lg text-sm font-bold">
                  {studentPage} / {studentTotalPages}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setStudentPage(p => Math.min(studentTotalPages, p + 1))}
                  disabled={studentPage === studentTotalPages}
                  className="rounded-lg h-9"
                >
                  التالي
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } else {
    content = (
      <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
            <CalendarRange size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              إدارة طلبات القبول المؤقت
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              قبول الطلاب مؤقتاً في مدارس أخرى لفترة زمنية محددة.
            </p>
          </div>
        </div>
        <Button onClick={() => setViewMode('select_student')} className="gap-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-sm h-11 px-6">
          <Plus size={18} /> تسجيل قبول مؤقت جديد
        </Button>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="بحث باسم الطالب أو الرقم المدرسي..." 
              className="pr-10 bg-white rounded-xl border-slate-200" 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
            />
          </div>
          <Button type="submit" variant="secondary" className="rounded-xl">بحث</Button>
        </form>

        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 text-sm">
          <Filter size={16} className="text-slate-400" />
          <span className="text-slate-600 font-medium">السنة الدراسية:</span>
          <select 
            className="bg-transparent border-none outline-none text-slate-800 font-bold pr-2 cursor-pointer"
            value={selectedYearId}
            onChange={(e) => {
              setSelectedYearId(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">كل السنوات</option>
            {academicYears.map(year => (
              <option key={year.id} value={year.id}>{year.year}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table dir="rtl">
            <TableHeader className="bg-slate-50 border-b border-slate-200">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-slate-700 text-right py-4 px-4">الطالب</TableHead>
                <TableHead className="font-bold text-slate-700 text-right py-4 px-4">المدرسة الأصلية</TableHead>
                <TableHead className="font-bold text-slate-700 text-right py-4 px-4">مدرسة القبول المؤقت</TableHead>
                <TableHead className="font-bold text-slate-700 text-right py-4 px-4">الصف</TableHead>
                <TableHead className="font-bold text-slate-700 text-right py-4 px-4">فترة القبول</TableHead>
                <TableHead className="font-bold text-slate-700 text-center py-4 px-4">الحالة</TableHead>
                <TableHead className="font-bold text-slate-700 text-center py-4 px-4 w-[220px]">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-20">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-primary" size={40} />
                      <span className="font-bold text-primary">جاري تحميل البيانات...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-10 text-slate-500">لا توجد سجلات مطابقة.</TableCell></TableRow>
              ) : (
                records.map(r => {
                  const allowed = ALLOWED_TRANSITIONS[r.status] || [];
                  const canDelete = r.status !== 'approved';
                  const isExpired = r.end_date && new Date(r.end_date) < new Date();
                  return (
                    <TableRow key={r.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="py-3 px-4">
                        <p className="font-bold text-slate-800">{r.student?.full_name}</p>
                        <p className="text-xs text-slate-500 font-mono" dir="ltr">{r.student?.school_number}</p>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-sm text-slate-600">{r.from_school?.name}</TableCell>
                      <TableCell className="py-3 px-4 text-sm font-bold text-primary">{r.to_school?.name}</TableCell>
                      <TableCell className="py-3 px-4 text-sm text-slate-600">{r.school_class?.name}</TableCell>
                      <TableCell className="py-3 px-4">
                        {r.start_date && r.end_date ? (
                          <div className={`text-xs font-mono rounded-lg px-2 py-1 inline-block ${isExpired ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-100 text-slate-600'}`} dir="ltr">
                            {r.start_date} → {r.end_date}
                            {isExpired && <span className="mr-2 font-sans font-bold text-red-500">(منتهي)</span>}
                          </div>
                        ) : <span className="text-slate-400 text-xs">—</span>}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center"><StatusBadge status={r.status} /></TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => setViewingRecord(r)} title="عرض" className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-primary/10 hover:text-primary transition-colors"><Eye size={15} /></button>
                          {r.status === 'approved' && (
                            <button
                              onClick={() => handleExportPdf(r.id)}
                              disabled={pdfLoadingId === r.id}
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                              title="تصدير PDF"
                            >
                              {pdfLoadingId === r.id ? <Loader2 className="animate-spin" size={15} /> : <FileDown size={15} />}
                            </button>
                          )}
                          {allowed.includes('approved') && (
                            <button onClick={() => setConfirmAction({ record: r, targetStatus: 'approved' })} title="قبول" className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"><CheckCircle2 size={15} /></button>
                          )}
                          {allowed.includes('rejected') && (
                            <button onClick={() => setConfirmAction({ record: r, targetStatus: 'rejected' })} title="رفض" className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"><XCircle size={15} /></button>
                          )}
                          {allowed.includes('pending') && (
                            <button onClick={() => setConfirmAction({ record: r, targetStatus: 'pending' })} title="إعادة فتح" className="p-1.5 rounded-lg bg-amber-50 text-amber-500 hover:bg-amber-100 transition-colors"><RefreshCw size={15} /></button>
                          )}
                          {canDelete && (
                            <button onClick={() => setDeleteTarget(r)} title="حذف" className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
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

        {pagination && pagination.last_page > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="text-sm text-slate-500">
              عرض {pagination.from} إلى {pagination.to} من إجمالي {pagination.total} سجل
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="gap-1 rounded-lg"
              >
                <ChevronRight size={16} />
                السابق
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
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
      </div>
    );
  }

  return (
    <>
      {content}

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" dir="rtl">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Plus className="text-primary" size={22} />تسجيل قبول مؤقت جديد</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-red-500"><XCircle size={22} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-1"><User size={14} />الطالب المحدد</label>
                {selectedStudent ? (
                  <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl border border-emerald-100 text-sm flex items-center justify-between">
                    <span><strong>{selectedStudent.full_name}</strong> - رقم: <span dir="ltr">{selectedStudent.school_number}</span></span>
                  </div>
                ) : (
                  <div className="text-sm text-red-500">لم يتم تحديد طالب. الرجاء إغلاق النافذة والمحاولة مرة أخرى.</div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-1"><School size={14} />مدرسة القبول المؤقت (الوجهة) <span className="text-red-500">*</span></label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-primary text-slate-700"
                  value={formData.to_school_id}
                  onChange={e => setFormData({ ...formData, to_school_id: e.target.value })}
                >
                  <option value="">-- اختر المدرسة --</option>
                  {schools
                    .filter(sch => 
                      sch.id !== (selectedStudent as any)?.current_enrollment?.school_id && 
                      sch.id !== (selectedStudent as any)?.enrollments?.[0]?.school_id &&
                      sch.name !== (selectedStudent as any)?.current_enrollment?.school_name &&
                      sch.name !== (selectedStudent as any)?.enrollments?.[0]?.school_name
                    )
                    .map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">حالة الطلب <span className="text-red-500">*</span></label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-primary text-slate-700"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as TransferStatus })}
                >
                  <option value="pending">انتظار</option>
                  <option value="approved">موافقة</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-1"><Calendar size={14} />تاريخ الطلب</label>
                  <Input 
                    type="date" 
                    className="bg-slate-50" 
                    value={formData.request_date}
                    onChange={e => setFormData({ ...formData, request_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">تاريخ البداية</label>
                  <Input 
                    type="date" 
                    className="bg-slate-50" 
                    value={formData.start_date}
                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">تاريخ الانتهاء</label>
                  <Input 
                    type="date" 
                    className="bg-slate-50" 
                    value={formData.end_date}
                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-1"><FileText size={14} />سبب القبول المؤقت</label>
                <textarea 
                  rows={3} 
                  placeholder="أدخل السبب..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-primary text-slate-700 resize-none" 
                  value={formData.reason}
                  onChange={e => setFormData({ ...formData, reason: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">بناءً على (قرار / وثيقة)</label>
                <Input 
                  placeholder="مثال: قرار طبي رقم 22" 
                  className="bg-slate-50" 
                  value={formData.based_on}
                  onChange={e => setFormData({ ...formData, based_on: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button 
                  onClick={handleCreateSubmit} 
                  disabled={isSubmitting || !selectedStudent || !formData.to_school_id}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'حفظ الطلب'}
                </Button>
                <Button onClick={() => { setIsCreateOpen(false); resetForm(); }} variant="outline" className="flex-1 font-bold h-12 rounded-xl">إلغاء</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <ConfirmDialog
          message={`هل تريد <strong>${confirmAction.targetStatus === 'approved' ? 'قبول' : confirmAction.targetStatus === 'rejected' ? 'رفض' : 'إعادة فتح'}</strong> طلب الطالب <strong>${confirmAction.record.student?.full_name}</strong>؟${confirmAction.targetStatus === 'approved' ? '<br/><small class="text-amber-600">سيتم تحديث بيانات التسجيل تلقائياً.</small>' : ''}`}
          confirmLabel={confirmAction.targetStatus === 'approved' ? 'قبول' : confirmAction.targetStatus === 'rejected' ? 'رفض' : 'إعادة فتح'}
          confirmClass={confirmAction.targetStatus === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : confirmAction.targetStatus === 'rejected' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'}
          icon={confirmAction.targetStatus === 'approved' ? <CheckCircle2 size={22} className="text-emerald-600" /> : confirmAction.targetStatus === 'rejected' ? <XCircle size={22} className="text-red-500" /> : <RefreshCw size={22} className="text-amber-500" />}
          onConfirm={handleStatusUpdate}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`هل تريد حذف طلب القبول المؤقت للطالب <strong>${deleteTarget.student?.full_name}</strong> نهائياً؟`}
          confirmLabel="حذف نهائياً"
          confirmClass="bg-red-600 hover:bg-red-700"
          icon={<Trash2 size={22} className="text-red-500" />}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
};
