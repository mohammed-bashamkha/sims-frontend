import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileQuestion, Search, Plus, Edit, Trash2, Calendar, FileText, Image as ImageIcon, School, GraduationCap, Eye, CheckCircle2, User, ArrowRight, FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DeleteConfirmationModal } from '@/components/common/DeleteConfirmationModal';
import api from '@/api/axios';
import { toast } from '@/store/toastStore';

// Interfaces based on backend schema
interface CertificateReplacement {
  id: number;
  student_id: number;
  school_id: number;
  class_id: number;
  academic_year_id: number;
  certificate_type: string;
  request_date: string;
  notes?: string;
  student_image?: string | File | null;
  // Relations
  student?: { id: number; name?: string; full_name?: string; school_number: string; seat_number?: string };
  school?: { id: number; name: string };
  school_class?: { id: number; name: string };
  schoolClass?: { id: number; name: string };
  academic_year?: { id: number; year?: string; name?: string };
  academicYear?: { id: number; year?: string; name?: string };
}

export const Replacements: React.FC = () => {
  const [records, setRecords] = useState<CertificateReplacement[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // Options for form
  const [options, setOptions] = useState<{
    schools: any[];
    classes: any[];
    years: any[];
    students: any[];
  }>({
    schools: [],
    classes: [],
    years: [],
    students: []
  });

  // Pagination for main records
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // States for student selection view
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
  
  // View states
  const [viewMode, setViewMode] = useState<'list' | 'view_record' | 'select_student'>('list');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CertificateReplacement | null>(null);
  const [viewingRecord, setViewingRecord] = useState<CertificateReplacement | null>(null);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<any>(null);

  // Filters state
  const [filters, setFilters] = useState({
    school_id: '',
    class_id: '',
    academic_year_id: ''
  });
  
  // Form state
  const [formData, setFormData] = useState<Partial<CertificateReplacement>>({
    student_id: 0,
    school_id: 0,
    class_id: 0,
    academic_year_id: 0,
    certificate_type: 'بدل فاقد شهادة أساسية',
    request_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch records from backend
  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/certificate-replacements', {
        params: {
          page: currentPage,
          search: searchQuery || undefined,
          school_id: filters.school_id || undefined,
          class_id: filters.class_id || undefined,
          academic_year_id: filters.academic_year_id || undefined
        }
      });
      setRecords(res.data.data);
      setTotalPages(res.data.last_page || 1);
      setTotalItems(res.data.total || 0);
    } catch (error) {
      console.error('Error fetching replacements:', error);
      toast('فشل في تحميل السجلات', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch students for selection
  const fetchStudents = async () => {
    if (viewMode !== 'select_student') return;
    setIsLoading(true);
    try {
      const res = await api.get('/students', {
        params: {
          page: studentPage,
          search: studentSearch || undefined,
          school_id: studentFilters.school_id || undefined,
          class_id: studentFilters.class_id || undefined,
          academic_year_id: studentFilters.academic_year_id || undefined
        }
      });
      setStudents(res.data.data);
      setStudentTotalPages(res.data.meta?.last_page || res.data.last_page || 1);
      setStudentTotalItems(res.data.meta?.total || res.data.total || 0);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch options
  const fetchOptions = async () => {
    try {
      const [schoolsRes, classesRes, yearsRes] = await Promise.all([
        api.get('/schools'),
        api.get('/school-classes'),
        api.get('/academic-years')
      ]);
      setOptions({
        schools: schoolsRes.data.data || schoolsRes.data,
        classes: classesRes.data.data || classesRes.data,
        years: yearsRes.data.data || yearsRes.data,
        students: []
      });
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  const [searchParams] = useSearchParams();

  React.useEffect(() => {
    fetchRecords();
  }, [currentPage, searchQuery, filters]);

  React.useEffect(() => {
    const action = searchParams.get('action');
    const studentId = searchParams.get('student_id');
    if (!studentId) return;

    if (action === 'create' && options.schools.length > 0) {
      // Open create modal with pre-filled student
      handleOpenModal(undefined, Number(studentId));
    } else if (!action && records.length > 0) {
      // Open existing record for this student directly
      const record = records.find(r => r.student_id === Number(studentId));
      if (record) handleView(record);
    }
  }, [searchParams, options, records]);

  React.useEffect(() => {
    fetchStudents();
  }, [studentPage, studentSearch, studentFilters, viewMode]);

  React.useEffect(() => {
    fetchOptions();
  }, []);

  const handleDeleteClick = (record: any) => {
    setRecordToDelete(record);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;
    setIsActionLoading(true);
    try {
      await api.delete(`/certificate-replacements/${recordToDelete.id}`);
      toast('تم حذف السجل بنجاح', 'success');
      fetchRecords();
    } catch (error: any) {
      toast(error.response?.data?.message || 'حدث خطأ أثناء الحذف', 'error');
    } finally {
      setIsActionLoading(false);
      setIsDeleteModalOpen(false);
      setRecordToDelete(null);
    }
  };

  const handleOpenModal = (record?: CertificateReplacement, studentId?: number) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        student_id: record.student_id,
        school_id: record.school_id,
        class_id: record.class_id,
        academic_year_id: record.academic_year_id,
        certificate_type: record.certificate_type,
        request_date: record.request_date,
        notes: record.notes || '',
      });
      setSelectedFile(null);
    } else {
      setEditingRecord(null);
      setFormData({
        student_id: studentId || 0,
        school_id: options.schools[0]?.id || 0,
        class_id: options.classes[0]?.id || 0,
        academic_year_id: options.years.find(y => y.status === 'active')?.id || options.years[0]?.id || 0,
        certificate_type: 'بدل فاقد شهادة أساسية',
        request_date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      setSelectedFile(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    setSelectedFile(null);
  };

  const handleView = (record: CertificateReplacement) => {
    setViewingRecord(record);
    setViewMode('view_record');
  };

  const handleCloseView = () => {
    setViewingRecord(null);
    setViewMode('list');
  };

  const handleStartCreate = () => {
    setViewMode('select_student');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'file') {
      const fileInput = e.target as HTMLInputElement;
      if (fileInput.files && fileInput.files.length > 0) {
        setSelectedFile(fileInput.files[0]);
      }
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: name.endsWith('_id') ? Number(value) : value 
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      const value = (formData as any)[key];
      if (value !== undefined && value !== null) {
        data.append(key, value);
      }
    });

    if (selectedFile) {
      data.append('student_image', selectedFile);
    }

    if (editingRecord) {
      data.append('_method', 'PUT');
    }

    try {
      if (editingRecord) {
        await api.post(`/certificate-replacements/${editingRecord.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast('تم تحديث البيانات بنجاح', 'success');
      } else {
        await api.post('/certificate-replacements', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast('تم تسجيل الطلب بنجاح', 'success');
      }
      
      fetchRecords();
      handleCloseModal();
      setViewMode('list');
    } catch (error: any) {
      console.error('Error saving record:', error);
      toast(error.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // --------------------------------------------------------------------------------
  // RENDER CONTENT
  // --------------------------------------------------------------------------------
  let content;

  if (viewMode === 'view_record' && viewingRecord) {
    content = (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <h3 className="font-black text-2xl text-slate-800 flex items-center gap-3">
            <CheckCircle2 size={28} className="text-primary" />
            تفاصيل شهادة / إفادة
          </h3>
          <div className="flex items-center gap-3">
            <a
              href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/pdf/certificate-replacement/${viewingRecord.id}?type=student`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl shadow-sm transition-colors text-sm print:hidden"
            >
              <FileDown size={16} />
              PDF للطالب
            </a>
            <a
              href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/pdf/certificate-replacement/${viewingRecord.id}?type=office`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl shadow-sm transition-colors text-sm print:hidden"
            >
              <FileDown size={16} />
              PDF للإدارة
            </a>
            <Button 
              onClick={handleCloseView}
              variant="outline"
              className="text-slate-600 border-slate-200 hover:bg-slate-50 font-bold gap-2 rounded-xl px-4 shadow-sm"
            >
              إغلاق
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="relative overflow-hidden">
                {/* Decorative Background Pattern */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/10 via-primary to-primary/10"></div>
                
                <div className="p-8 md:p-10">
                  {/* Top Profile Header */}
                  <div className="flex flex-col md:flex-row items-center gap-8 mb-10 pb-8 border-b border-slate-100">
                    <div className="relative">
                      <div className="w-28 h-28 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl flex items-center justify-center border-2 border-white shadow-xl rotate-3 hover:rotate-0 transition-transform duration-500">
                        <User size={48} className="text-primary animate-pulse" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg border border-slate-100">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      </div>
                    </div>

                    <div className="text-center md:text-right space-y-3">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10">
                        <FileText size={12} /> طلب {viewingRecord.certificate_type}
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-none">
                        {viewingRecord.student?.full_name}
                      </h2>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                        <span className="flex items-center gap-1.5 text-slate-500 text-sm font-bold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                          <GraduationCap size={14} className="text-slate-400" />
                          رقم القيد: <span className="font-mono text-slate-700">{viewingRecord.student?.school_number}</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-500 text-sm font-bold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                          <CheckCircle2 size={14} className="text-slate-400" />
                          رقم الجلوس: <span className="font-mono text-slate-700">{viewingRecord.student?.seat_number || '---'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info Grid Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="group bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors"></div>
                        تاريخ تقديم الطلب
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-700">{viewingRecord.request_date}</p>
                        <Calendar size={20} className="text-slate-200 group-hover:text-primary/20 transition-colors" />
                      </div>
                    </div>

                    <div className="group bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400/40 group-hover:bg-amber-400 transition-colors"></div>
                        رقم المرجع (ID)
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="font-black text-slate-700 font-mono">#{viewingRecord.id}</p>
                        <FileQuestion size={20} className="text-slate-200 group-hover:text-amber-400/20 transition-colors" />
                      </div>
                    </div>

                    <div className="group bg-gradient-to-br from-primary to-primary/80 p-5 rounded-3xl shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all duration-300">
                      <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                        نوع المستند المطلوب
                      </p>
                      <div className="flex items-center justify-between text-white">
                        <p className="font-bold text-sm truncate pr-2">{viewingRecord.certificate_type}</p>
                        <FileDown size={20} className="text-white/20" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h4 className="font-bold text-slate-700 flex items-center gap-2">
                  <School size={18} /> البيانات الأكاديمية والمدرسة
                </h4>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 font-medium">المدرسة</p>
                  <p className="font-bold text-slate-800">{viewingRecord.school?.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 font-medium">الصف الدراسي</p>
                  <p className="font-bold text-slate-800">{viewingRecord.schoolClass?.name || viewingRecord.school_class?.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 font-medium">العام الدراسي</p>
                  <p className="font-bold text-slate-800">{viewingRecord.academicYear?.year || viewingRecord.academicYear?.name || viewingRecord.academic_year?.year || viewingRecord.academic_year?.name}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h4 className="font-bold text-slate-700 flex items-center gap-2">
                  <FileText size={18} /> ملاحظات إضافية
                </h4>
              </div>
              <div className="p-6">
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {viewingRecord.notes || 'لا توجد ملاحظات إضافية مسجلة لهذا الطلب.'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h4 className="font-bold text-slate-700 flex items-center gap-2">
                  <ImageIcon size={18} /> صورة الطالب
                </h4>
              </div>
              <div className="p-8 flex flex-col items-center">
                <div className="w-64 h-80 bg-slate-50 rounded-[2.5rem] border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center group relative transition-transform duration-500 hover:scale-[1.02]">
                  {viewingRecord.student_image ? (
                    <>
                      <img 
                        src={`${import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage'}/${viewingRecord.student_image}`} 
                        alt="Student" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-slate-300">
                      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                        <User size={48} strokeWidth={1} />
                      </div>
                      <p className="text-xs font-black uppercase tracking-widest">لا توجد صورة</p>
                    </div>
                  )}
                </div>
                <div className="mt-8 text-center space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">المستند الرسمي</p>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-[200px]">
                    يتم اعتماد هذه الصورة في طباعة بدل الفاقد الرسمي للطالب.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
              <p className="text-sm text-slate-500">ابحث عن الطالب الذي ترغب في استخراج بدل فاقد/تالف له</p>
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
              {options.schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            <select 
              className="h-10 bg-white border border-slate-200 rounded-xl px-3 text-sm min-w-[140px]"
              value={studentFilters.class_id}
              onChange={(e) => setStudentFilters({...studentFilters, class_id: e.target.value})}
            >
              <option value="">كل الصفوف</option>
              {options.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select 
              className="h-10 bg-white border border-slate-200 rounded-xl px-3 text-sm min-w-[140px]"
              value={studentFilters.academic_year_id}
              onChange={(e) => setStudentFilters({...studentFilters, academic_year_id: e.target.value})}
            >
              <option value="">كل الأعوام</option>
              {options.years.map(y => <option key={y.id} value={y.id}>{y.year || y.name}</option>)}
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
                          onClick={() => handleOpenModal(undefined, student.id)}
                          className="bg-primary hover:bg-primary/90 text-white font-bold gap-2 rounded-lg px-4 shadow-sm h-9 text-xs"
                        >
                          <FileText size={14} />
                          إنشاء بدل فاقد
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileQuestion className="text-primary" size={24} />
              طلبات بدل فاقد / تالف
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              إدارة ومعالجة طلبات استخراج المستندات المفقودة أو التالفة للطلاب.
            </p>
          </div>

          <Button 
            onClick={handleStartCreate}
            className="bg-primary hover:bg-primary/90 text-white font-bold gap-2 rounded-xl px-6 shadow-sm"
          >
            <Plus size={18} />
            إنشاء بدل فاقد
          </Button>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="بحث باسم الطالب أو رقم الطلب..." 
              className="pr-10 bg-white rounded-xl border-slate-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <select 
              className="h-10 bg-white border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[150px]"
              value={filters.school_id}
              onChange={(e) => setFilters({...filters, school_id: e.target.value})}
            >
              <option value="">كل المدارس</option>
              {options.schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            <select 
              className="h-10 bg-white border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[150px]"
              value={filters.class_id}
              onChange={(e) => setFilters({...filters, class_id: e.target.value})}
            >
              <option value="">كل الصفوف</option>
              {options.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select 
              className="h-10 bg-white border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[150px]"
              value={filters.academic_year_id}
              onChange={(e) => setFilters({...filters, academic_year_id: e.target.value})}
            >
              <option value="">كل الأعوام</option>
              {options.years.map(y => <option key={y.id} value={y.id}>{y.year || y.name}</option>)}
            </select>

            {(filters.school_id || filters.class_id || filters.academic_year_id || searchQuery) && (
              <Button 
                variant="ghost" 
                className="text-red-500 hover:text-red-600 hover:bg-red-50 font-bold px-2 rounded-xl"
                onClick={() => {
                  setFilters({ school_id: '', class_id: '', academic_year_id: '' });
                  setSearchQuery('');
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
                  <th className="px-6 py-4 font-bold">رقم الطلب</th>
                  <th className="px-6 py-4 font-bold">الطالب</th>
                  <th className="px-6 py-4 font-bold">نوع الشهادة</th>
                  <th className="px-6 py-4 font-bold">المدرسة (الصف)</th>
                  <th className="px-6 py-4 font-bold">تاريخ الطلب</th>
                  <th className="px-6 py-4 font-bold text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 size={40} className="animate-spin text-primary" />
                        <p className="text-slate-500 font-bold">جاري تحميل السجلات...</p>
                      </div>
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                      لا توجد طلبات مسجلة أو مطابقة للبحث
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-700">#{record.id}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-800">{record.student?.full_name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">رقم: <span dir="ltr">{record.student?.school_number}</span></p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                          {record.certificate_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-700 truncate max-w-[200px]">{record.school?.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{record.schoolClass?.name || record.school_class?.name} - {record.academicYear?.name || record.academic_year?.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-xs" dir="ltr">
                        {record.request_date}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => handleView(record)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="عرض التفاصيل والطباعة"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => handleOpenModal(record)}
                            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="تعديل"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(record)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="حذف"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <div className="text-sm text-slate-500 font-medium">
                عرض {records.length} من {totalItems} سجل
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border-slate-200 text-slate-600 font-bold h-9"
                >
                  السابق
                </Button>
                <div className="flex items-center justify-center min-w-[32px] h-9 rounded-lg bg-white border border-slate-200 text-sm font-bold text-primary px-3 shadow-sm">
                  {currentPage} / {totalPages}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border-slate-200 text-slate-600 font-bold h-9"
                >
                  التالي
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4" dir="rtl">
      {content}

      {/* Shared Form Modal for Edit/Create */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" dir="rtl">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <FileText className="text-primary" size={20} />
                {editingRecord ? 'تعديل طلب بدل فاقد/تالف' : 'تسجيل طلب بدل فاقد/تالف'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-6">
                
                {/* Student Info Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <GraduationCap size={16} /> بيانات الطالب المطلوبة
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-500">الطالب</label>
                      <div className="w-full flex h-10 items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
                        {editingRecord ? editingRecord.student?.full_name : (students.find(s => s.id === formData.student_id)?.full_name || 'طالب غير معروف')}
                        <span className="text-xs font-normal text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200" dir="ltr">
                          رقم: {editingRecord ? editingRecord.student?.school_number : (students.find(s => s.id === formData.student_id)?.school_number || '-')}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-500">نوع الشهادة المطلوبة <span className="text-red-500">*</span></label>
                      <select 
                        name="certificate_type"
                        value={formData.certificate_type}
                        onChange={handleInputChange}
                        required
                        className="w-full flex h-10 items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {['بدل فاقد شهادة أساسية', 'بدل تالف شهادة أساسية', 'بدل فاقد شهادة ثانوية', 'بدل تالف شهادة ثانوية', 'إفادة نجاح'].map((type, i) => (
                          <option key={i} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Academic Info Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <School size={16} /> البيانات الأكاديمية والمدرسة
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-500">المدرسة <span className="text-red-500">*</span></label>
                      <select 
                        name="school_id"
                        value={formData.school_id}
                        onChange={handleInputChange}
                        required
                        className="w-full flex h-10 items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {options.schools.map(school => (
                          <option key={school.id} value={school.id}>{school.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-500">الصف <span className="text-red-500">*</span></label>
                      <select 
                        name="class_id"
                        value={formData.class_id}
                        onChange={handleInputChange}
                        required
                        className="w-full flex h-10 items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {options.classes.map(cls => (
                          <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-500">العام الدراسي <span className="text-red-500">*</span></label>
                      <select 
                        name="academic_year_id"
                        value={formData.academic_year_id}
                        onChange={handleInputChange}
                        required
                        className="w-full flex h-10 items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {options.years.map(yr => (
                          <option key={yr.id} value={yr.id}>{yr.year || yr.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Additional Info Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Calendar size={16} /> تفاصيل إضافية
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-500">تاريخ الطلب <span className="text-red-500">*</span></label>
                        <Input 
                          type="date"
                          name="request_date"
                          value={formData.request_date}
                          onChange={handleInputChange}
                          required
                          className="border-slate-200 focus:border-primary focus:ring-primary/20 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-500">صورة الطالب (اختياري)</label>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center justify-center w-full h-10 px-4 border border-dashed border-slate-300 rounded-xl bg-slate-50 text-sm cursor-pointer hover:bg-slate-100 transition-colors">
                            <span className="flex items-center gap-2 text-slate-500">
                              <ImageIcon size={16} />
                              {selectedFile ? selectedFile.name : editingRecord?.student_image ? 'تغيير الصورة' : 'إرفاق صورة شخصية'}
                            </span>
                            <input 
                              type="file" 
                              name="student_image"
                              accept="image/*"
                              onChange={handleInputChange}
                              className="hidden" 
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-500">ملاحظات (أسباب الطلب)</label>
                      <textarea 
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange as any}
                        placeholder="أدخل أي ملاحظات حول الطلب..."
                        className="w-full flex min-h-[110px] items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      />
                    </div>
                  </div>
                </div>

              </div>
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleCloseModal} className="rounded-xl text-slate-600 border-slate-200 hover:bg-white">
                  إلغاء
                </Button>
                <Button type="submit" disabled={isActionLoading} className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-6">
                  {isActionLoading ? <Loader2 className="animate-spin" size={18} /> : (editingRecord ? 'حفظ التعديلات' : 'تسجيل الطلب')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="حذف طلب بدل فاقد/تالف"
        message="هل أنت متأكد من رغبتك في حذف هذا الطلب؟"
        itemName={recordToDelete?.student?.full_name}
        isLoading={isActionLoading}
      />
    </div>
  );
};
