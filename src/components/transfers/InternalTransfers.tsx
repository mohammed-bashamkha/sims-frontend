import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, Plus, CheckCircle2, XCircle, Clock, ArrowLeft, ArrowRight,
  School, FileText, Trash2, RefreshCw, Eye, User, Calendar, Building2, FileDown,
  Loader2, Filter, ChevronRight, ChevronLeft
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { transferService, type TransferAdmissionRecord, type TransferStatus, type PaginatedResponse } from '@/services/transferService';
import { academicYearService, type AcademicYear } from '@/services/academicYearService';
import { schoolService } from '@/services/schoolService';
import { studentService } from '@/services/studentService';
import { type Student as StudentSearch } from '@/types/student';
import { type School as SchoolType } from '@/types/school';
import api from '@/api/axios';

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

// ─── Confirm Dialog ────────────────────────────────────────────────────
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

// ─── Show View ─────────────────────────────────────────────────────────
const ShowTransfer: React.FC<{
  record: TransferAdmissionRecord;
  onBack: () => void;
  onExportPdf: (id: number) => void;
  pdfLoadingId: number | null;
}> = ({ record, onBack, onExportPdf, pdfLoadingId }) => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <div className="flex items-center justify-between pb-4 border-b border-slate-200">
      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
        <ArrowLeft className="text-primary" size={22} />
        تفاصيل طلب التحويل الداخلي
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
      <div className={`px-8 py-4 flex items-center justify-between ${
        record.status === 'approved' ? 'bg-emerald-50 border-b border-emerald-100'
        : record.status === 'rejected' ? 'bg-red-50 border-b border-red-100'
        : 'bg-amber-50 border-b border-amber-100'
      }`}>
        <span className="text-sm font-bold text-slate-600">حالة الطلب</span>
        <StatusBadge status={record.status} />
      </div>

      <div className="p-8 space-y-8">
        {/* Student Personal Info */}
        <div>
          <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><User size={16} />البيانات الشخصية للطالب</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 col-span-2">
              <p className="text-xs text-slate-400 mb-1">اسم الطالب</p>
              <p className="font-bold text-slate-800 text-lg">{record.student?.full_name}</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p className="text-xs text-slate-400 mb-1">الرقم المدرسي</p>
              <p className="font-bold text-slate-800 font-mono" dir="ltr">{record.student?.school_number}</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p className="text-xs text-slate-400 mb-1">الجنس</p>
              <p className="font-bold text-slate-800">{record.student?.gender === 'male' ? 'ذكر' : record.student?.gender === 'female' ? 'أنثى' : record.student?.gender || '—'}</p>
            </div>
          </div>
        </div>

        {/* Transfer Info */}
        <div>
          <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><Building2 size={16} />بيانات التحويل</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p className="text-xs text-slate-400 mb-1">من مدرسة</p>
              <p className="font-bold text-slate-700 flex items-center gap-2"><School size={14} className="text-slate-400" />{record.from_school?.name}</p>
            </div>
            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
              <p className="text-xs text-primary/60 mb-1">إلى مدرسة</p>
              <p className="font-bold text-primary flex items-center gap-2"><School size={14} />{record.to_school?.name}</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p className="text-xs text-slate-400 mb-1">الصف الدراسي</p>
              <p className="font-bold text-slate-700">{record.school_class?.name}</p>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-400">العام الدراسي</p>
              <p className="font-bold text-slate-700" dir="ltr">{record.academic_year?.year || record.academic_year?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-400">تاريخ الطلب</p>
              <p className="font-bold text-slate-700" dir="ltr">{record.request_date}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center">
              <User size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-400">بواسطة</p>
              <p className="font-bold text-slate-700">{record.created_by_user?.name || 'النظام'}</p>
            </div>
          </div>
        </div>

        {record.reason && (
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
            <p className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-2"><FileText size={14} />سبب التحويل</p>
            <p className="text-slate-700 leading-relaxed">{record.reason}</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────
export const InternalTransfers: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'select_student'>('list');
  const [records, setRecords] = useState<TransferAdmissionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginatedResponse<TransferAdmissionRecord> | null>(null);
  const [searchParams] = useSearchParams();

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<number | string>('');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<string>('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<TransferAdmissionRecord | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ record: TransferAdmissionRecord; targetStatus: TransferStatus } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TransferAdmissionRecord | null>(null);

  // Options
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [classes, setClasses] = useState<any[]>([]);

  // Select Student states
  const [studentSearch, setStudentSearch] = useState('');
  const [studentPage, setStudentPage] = useState(1);
  const [studentTotalPages, setStudentTotalPages] = useState(1);
  const [studentTotalItems, setStudentTotalItems] = useState(0);
  const [studentFilters, setStudentFilters] = useState({
    school_id: '',
    class_id: '',
    academic_year_id: ''
  });
  const [students, setStudents] = useState<any[]>([]);

  // Create Form states
  const [selectedStudent, setSelectedStudent] = useState<StudentSearch | null>(null);
  const [targetSchoolId, setTargetSchoolId] = useState<string>('');
  const [transferReason, setTransferReason] = useState('');
  const [transferStatus, setTransferStatus] = useState<TransferStatus>('pending');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfLoadingId, setPdfLoadingId] = useState<number | null>(null);

  useEffect(() => {
    fetchAcademicYears();
    fetchSchools();
    fetchClasses();
  }, []);

  useEffect(() => {
    if (viewMode === 'list') {
      fetchTransfers();
    }
  }, [selectedYearId, selectedSchoolId, selectedClassId, selectedGender, currentPage, viewMode]);

  useEffect(() => {
    fetchStudents();
  }, [studentPage, studentSearch, studentFilters, viewMode]);

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

  // Auto-open student's transfer record when records are loaded
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

  const fetchTransfers = async () => {
    setIsLoading(true);
    try {
      const response = await transferService.getTransfers({
        type: 'transfer',
        search: searchQuery,
        academic_year_id: selectedYearId ? Number(selectedYearId) : undefined,
        school_id: selectedSchoolId ? Number(selectedSchoolId) : undefined,
        class_id: selectedClassId ? Number(selectedClassId) : undefined,
        gender: selectedGender || undefined,
        page: currentPage
      });
      const internalOnly = (response.data || []).filter(r => r.from_school_id !== null);
      setRecords(internalOnly);
      setPagination(response);
    } catch (error) {
      console.error('Error fetching transfers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTransfers();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleOpenModal = (student: any) => {
    setSelectedStudent(student);
    setTargetSchoolId('');
    setTransferReason('');
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async () => {
    if (!selectedStudent || !targetSchoolId) return;
    setIsSubmitting(true);
    try {
      await transferService.storeTransfer({
        student_id: selectedStudent.id,
        to_school_id: Number(targetSchoolId),
        reason: transferReason,
        status: transferStatus
      });
      setIsCreateOpen(false);
      setViewMode('list');
      resetCreateForm();
      fetchTransfers();
    } catch (error) {
      console.error('Error creating transfer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetCreateForm = () => {
    setSelectedStudent(null);
    setStudentSearch('');
    setTargetSchoolId('');
    setTransferReason('');
    setTransferStatus('pending');
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
      fetchTransfers();
      setConfirmAction(null);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await transferService.deleteTransfer(deleteTarget.id);
      fetchTransfers();
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting transfer:', error);
    }
  };

  let content;

  if (viewingRecord) {
    content = <ShowTransfer record={viewingRecord} onBack={() => setViewingRecord(null)} onExportPdf={handleExportPdf} pdfLoadingId={pdfLoadingId} />;
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
              <p className="text-sm text-slate-500">ابحث عن الطالب الذي ترغب في إنشاء تحويل داخلي له</p>
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
                          إنشاء تحويل داخلي
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
      <div className="space-y-6">
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="بحث باسم الطالب أو الرقم..." 
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
          <Button onClick={() => setViewMode('select_student')} className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-sm whitespace-nowrap">
            <Plus size={18} /> تسجيل تحويل جديد
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table dir="rtl">
            <TableHeader className="bg-slate-50 border-b border-slate-200">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-slate-700 text-right py-4 px-4">الطالب</TableHead>
                <TableHead className="font-bold text-slate-700 text-right py-4 px-4">من مدرسة</TableHead>
                <TableHead className="font-bold text-slate-700 text-right py-4 px-4">إلى مدرسة</TableHead>
                <TableHead className="font-bold text-slate-700 text-right py-4 px-4">الصف</TableHead>
                <TableHead className="font-bold text-slate-700 text-center py-4 px-4">الحالة</TableHead>
                <TableHead className="font-bold text-slate-700 text-center py-4 px-4 w-[230px]">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-primary" size={40} />
                      <span className="font-bold">جاري تحميل البيانات...</span>
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
                        <p className="font-bold text-slate-800">{t.student?.full_name}</p>
                        <p className="text-xs text-slate-500 font-mono" dir="ltr">{t.student?.school_number}</p>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-sm text-slate-600 font-medium">{t.from_school?.name}</TableCell>
                      <TableCell className="py-3 px-4">
                        <span className="flex items-center gap-1.5 text-primary text-sm font-bold"><ArrowLeft size={14} />{t.to_school?.name}</span>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-sm text-slate-700">{t.school_class?.name}</TableCell>
                      <TableCell className="py-3 px-4 text-center"><StatusBadge status={t.status} /></TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => setViewingRecord(t)} title="عرض التفاصيل" className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-primary/10 hover:text-primary transition-colors">
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
                        className={`w-9 h-9 p-0 rounded-lg ${currentPage === p ? 'shadow-md shadow-primary/20' : ''}`}
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
      </div>
    );
  }

  return (
    <>
      {content}

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" dir="rtl">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Plus className="text-primary" size={22} />تسجيل طلب تحويل داخلي</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-red-500"><XCircle size={22} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الطالب المحدد</label>
                {selectedStudent ? (
                  <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl border border-emerald-100 text-sm flex items-center justify-between">
                    <span><strong>{selectedStudent.full_name}</strong> - رقم: <span dir="ltr">{selectedStudent.school_number}</span></span>
                  </div>
                ) : (
                  <div className="text-sm text-red-500">لم يتم تحديد طالب. الرجاء إغلاق النافذة والمحاولة مرة أخرى.</div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><School size={15} className="text-slate-400" />المدرسة الموجه إليها <span className="text-red-500">*</span></label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-primary text-slate-700"
                  value={targetSchoolId}
                  onChange={e => setTargetSchoolId(e.target.value)}
                >
                  <option value="">-- اختر المدرسة --</option>
                  {schools
                    .filter(sch => 
                      sch.id !== selectedStudent?.current_enrollment?.school_id && 
                      sch.id !== selectedStudent?.enrollments?.[0]?.school_id &&
                      sch.name !== selectedStudent?.current_enrollment?.school_name &&
                      sch.name !== selectedStudent?.enrollments?.[0]?.school_name
                    )
                    .map(sch => (
                    <option key={sch.id} value={sch.id}>{sch.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">حالة الطلب <span className="text-red-500">*</span></label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-primary text-slate-700"
                  value={transferStatus}
                  onChange={e => setTransferStatus(e.target.value as TransferStatus)}
                >
                  <option value="pending">انتظار</option>
                  <option value="approved">موافقة</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><FileText size={15} className="text-slate-400" />سبب التحويل (اختياري)</label>
                <textarea 
                  rows={3} 
                  placeholder="أدخل السبب..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-primary text-slate-700 resize-none" 
                  value={transferReason}
                  onChange={e => setTransferReason(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button 
                  onClick={handleCreateSubmit} 
                  disabled={isSubmitting || !selectedStudent || !targetSchoolId}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'حفظ الطلب'}
                </Button>
                <Button 
                  onClick={() => { setIsCreateOpen(false); resetCreateForm(); }} 
                  variant="outline" 
                  className="flex-1 font-bold h-12 rounded-xl"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <ConfirmDialog
          message={`هل تريد <strong>${confirmAction.targetStatus === 'approved' ? 'قبول' : confirmAction.targetStatus === 'rejected' ? 'رفض' : 'إعادة فتح'}</strong> طلب تحويل الطالب <strong>${confirmAction.record.student?.full_name}</strong>؟${confirmAction.targetStatus === 'approved' ? '<br/><small class="text-amber-600">سيتم تحديث التسجيل الأكاديمي تلقائياً.</small>' : ''}`}
          confirmLabel={confirmAction.targetStatus === 'approved' ? 'قبول' : confirmAction.targetStatus === 'rejected' ? 'رفض' : 'إعادة فتح'}
          confirmClass={confirmAction.targetStatus === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : confirmAction.targetStatus === 'rejected' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'}
          icon={confirmAction.targetStatus === 'approved' ? <CheckCircle2 size={22} className="text-emerald-600" /> : confirmAction.targetStatus === 'rejected' ? <XCircle size={22} className="text-red-500" /> : <RefreshCw size={22} className="text-amber-500" />}
          onConfirm={handleStatusUpdate}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`هل تريد حذف طلب تحويل الطالب <strong>${deleteTarget.student?.full_name}</strong> نهائياً؟`}
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
