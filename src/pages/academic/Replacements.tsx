import React, { useState } from 'react';
import { FileQuestion, Search, Plus, Edit, Trash2, Calendar, FileText, Image as ImageIcon, School, GraduationCap, Eye, Printer, CheckCircle2, User, ArrowRight, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

// Mock Data for Dropdowns
const MOCK_STUDENTS = [
  { id: 1, name: 'محمد علي النمر', full_name: 'محمد علي النمر', school_number: '1001' },
  { id: 2, name: 'أحمد صالح الكربي', full_name: 'أحمد صالح الكربي', school_number: '1002' },
  { id: 3, name: 'سالم عبدالله باوزير', full_name: 'سالم عبدالله باوزير', school_number: '1003' },
];

const MOCK_SCHOOLS = [
  { id: 1, name: 'ثانوية المكلا النموذجية' },
  { id: 2, name: 'مدرسة الجماهير للتعليم الأساسي' },
];

const MOCK_CLASSES = [
  { id: 1, name: 'الصف الأول الأساسي' },
  { id: 4, name: 'الأول الثانوي' },
];

const MOCK_YEARS = [
  { id: 1, year: '2023/2024' },
  { id: 2, year: '2024/2025' },
];

const MOCK_CERT_TYPES = [
  'بدل فاقد شهادة أساسية',
  'بدل تالف شهادة أساسية',
  'بدل فاقد شهادة ثانوية',
  'بدل تالف شهادة ثانوية',
  'إفادة نجاح'
];

// Initial mock records
const INITIAL_RECORDS: CertificateReplacement[] = [
  {
    id: 1,
    student_id: 1,
    school_id: 1,
    class_id: 4,
    academic_year_id: 2,
    certificate_type: 'بدل فاقد شهادة ثانوية',
    request_date: '2024-05-15',
    notes: 'تم فقدان الشهادة الأصلية أثناء الانتقال.',
    student: MOCK_STUDENTS[0],
    school: MOCK_SCHOOLS[0],
    school_class: MOCK_CLASSES[1],
    academic_year: MOCK_YEARS[1]
  }
];

export const Replacements: React.FC = () => {
  const [records, setRecords] = useState<CertificateReplacement[]>(INITIAL_RECORDS);
  const [searchQuery, setSearchQuery] = useState('');
  
  // View states
  const [viewMode, setViewMode] = useState<'list' | 'view_record' | 'select_student'>('list');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CertificateReplacement | null>(null);
  const [viewingRecord, setViewingRecord] = useState<CertificateReplacement | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<CertificateReplacement>>({
    student_id: MOCK_STUDENTS[0].id,
    school_id: MOCK_SCHOOLS[0].id,
    class_id: MOCK_CLASSES[0].id,
    academic_year_id: MOCK_YEARS[0].id,
    certificate_type: MOCK_CERT_TYPES[0],
    request_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const filteredRecords = records.filter(r => 
    r.student?.name?.includes(searchQuery) || 
    r.student?.full_name?.includes(searchQuery) || 
    r.student?.school_number?.includes(searchQuery) ||
    r.certificate_type.includes(searchQuery)
  );

  const filteredStudents = MOCK_STUDENTS.filter(s => 
    s.name.includes(searchQuery) || 
    (s.full_name && s.full_name.includes(searchQuery)) || 
    s.school_number.includes(searchQuery)
  );

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
      setSelectedFile(null); // Reset file selection on edit initially
    } else {
      setEditingRecord(null);
      setFormData({
        student_id: studentId || MOCK_STUDENTS[0].id,
        school_id: MOCK_SCHOOLS[0].id,
        class_id: MOCK_CLASSES[0].id,
        academic_year_id: MOCK_YEARS[0].id,
        certificate_type: MOCK_CERT_TYPES[0],
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
    setSearchQuery('');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const studentObj = MOCK_STUDENTS.find(s => s.id === formData.student_id);
    const schoolObj = MOCK_SCHOOLS.find(s => s.id === formData.school_id);
    const classObj = MOCK_CLASSES.find(c => c.id === formData.class_id);
    const yearObj = MOCK_YEARS.find(y => y.id === formData.academic_year_id);

    const newRecordData = {
      ...formData as CertificateReplacement,
      student_image: selectedFile ? selectedFile.name : editingRecord?.student_image, // Mocking file upload
      student: studentObj,
      school: schoolObj,
      school_class: classObj,
      academic_year: yearObj
    };

    if (editingRecord) {
      setRecords(records.map(r => r.id === editingRecord.id ? { ...r, ...newRecordData, id: r.id } : r));
    } else {
      const newId = Math.max(0, ...records.map(r => r.id)) + 1;
      setRecords([{ ...newRecordData, id: newId }, ...records]);
    }
    
    handleCloseModal();
    setViewMode('list');
    setSearchQuery('');
  };

  const handleDelete = (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السجل؟ لن تتمكن من التراجع عن هذا الإجراء.')) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  // --------------------------------------------------------------------------------
  // VIEW: DETAILS RECORD
  // --------------------------------------------------------------------------------
  if (viewMode === 'view_record' && viewingRecord) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <h3 className="font-black text-2xl text-slate-800 flex items-center gap-3">
            <CheckCircle2 size={28} className="text-primary" />
            تفاصيل شهادة / إفادة
          </h3>
          <div className="flex items-center gap-3">
            {/* PDF للطالب — GET /api/pdf/certificate-replacement/{id}?type=student */}
            <a
              href={`/api/pdf/certificate-replacement/${viewingRecord.id}?type=student`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl shadow-sm transition-colors text-sm print:hidden"
            >
              <FileDown size={16} />
              PDF للطالب
            </a>
            {/* PDF للإدارة — GET /api/pdf/certificate-replacement/{id}?type=office */}
            <a
              href={`/api/pdf/certificate-replacement/${viewingRecord.id}?type=office`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl shadow-sm transition-colors text-sm print:hidden"
            >
              <FileDown size={16} />
              PDF للإدارة
            </a>
            <Button 
              onClick={() => window.print()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 rounded-xl px-6 shadow-sm print:hidden"
            >
              <Printer size={18} />
              طباعة
            </Button>
            <Button 
              onClick={handleCloseView} 
              variant="outline"
              className="text-slate-600 border-slate-300 hover:bg-slate-100 font-bold rounded-xl px-6 gap-2 print:hidden"
            >
              رجوع للطلبات
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative print:shadow-none print:border-none">
          <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-5 print:hidden"></div>
          
          <div className="p-8 md:p-12 relative z-10">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-10 border-b border-slate-100 pb-10">
              <div className="shrink-0 w-48 h-48 md:w-56 md:h-56 rounded-3xl bg-slate-50 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden relative">
                {viewingRecord.student_image ? (
                  <img 
                    src={typeof viewingRecord.student_image === 'string' ? viewingRecord.student_image : URL.createObjectURL(viewingRecord.student_image as File)} 
                    alt="Student" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={80} className="text-slate-300" />
                )}
              </div>

              <div className="text-center md:text-right space-y-4 flex-1 py-4">
                <div className="inline-block px-5 py-2 rounded-full text-base font-black bg-amber-50 text-amber-700 border border-amber-200 mb-2 shadow-sm">
                  {viewingRecord.certificate_type}
                </div>
                <h2 className="text-4xl font-black text-slate-800">{viewingRecord.student?.full_name || viewingRecord.student?.name}</h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-4">
                  <p className="text-slate-600 font-mono text-xl flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100" dir="ltr">
                    <span className="text-sm font-bold text-slate-400 uppercase">الرقم المدرسي:</span>
                    {viewingRecord.student?.school_number}
                  </p>
                  {(viewingRecord.student?.seat_number) && (
                    <p className="text-slate-600 font-mono text-xl flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100" dir="ltr">
                      <span className="text-sm font-bold text-slate-400 uppercase">رقم الجلوس:</span>
                      {viewingRecord.student?.seat_number}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-10">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <School size={24} />
                </div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">المدرسة</p>
                <p className="text-xl font-bold text-slate-800">{viewingRecord.school?.name}</p>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                  <GraduationCap size={24} />
                </div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">الصف الدراسي</p>
                <p className="text-xl font-bold text-slate-800">{viewingRecord.schoolClass?.name || viewingRecord.school_class?.name}</p>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                  <Calendar size={24} />
                </div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">العام الدراسي</p>
                <p className="text-xl font-bold text-slate-800" dir="ltr">{viewingRecord.academicYear?.year || viewingRecord.academicYear?.name || viewingRecord.academic_year?.year || viewingRecord.academic_year?.name}</p>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                  <FileText size={24} />
                </div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">تاريخ الطلب</p>
                <p className="text-xl font-bold text-slate-800" dir="ltr">{viewingRecord.request_date}</p>
              </div>
            </div>

            {viewingRecord.notes && (
              <div className="mt-10 bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileQuestion size={18} />
                  ملاحظات الطلب
                </p>
                <p className="text-lg text-slate-700 leading-relaxed">{viewingRecord.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------------
  // VIEW: SELECT STUDENT FOR CREATE
  // --------------------------------------------------------------------------------
  if (viewMode === 'select_student') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <User className="text-primary" size={24} />
              اختيار الطالب
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              اختر الطالب الذي ترغب في إنشاء طلب بدل فاقد أو تالف له.
            </p>
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

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="relative w-full max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="بحث باسم الطالب أو رقم الجلوس..." 
              className="pr-10 bg-white rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold">اسم الطالب</th>
                  <th className="px-6 py-4 font-bold">الرقم المدرسي</th>
                  <th className="px-6 py-4 font-bold text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center text-slate-500">
                      لا يوجد طلاب مطابقين لعملية البحث
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{student.full_name || student.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded" dir="ltr">{student.school_number}</span>
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
        </div>

        {/* Modal for Create (Only shown inside select_student or list view if state is preserved) */}
        {/* We moved the modal down to a shared location or render it here */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" dir="rtl">
            <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <FileText className="text-primary" size={20} />
                  تسجيل طلب بدل فاقد/تالف
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
                        {/* Readonly field for student name since it's pre-selected */}
                        <div className="w-full flex h-10 items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
                          {MOCK_STUDENTS.find(s => s.id === formData.student_id)?.full_name || MOCK_STUDENTS.find(s => s.id === formData.student_id)?.name}
                          <span className="text-xs font-normal text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200" dir="ltr">
                            رقم: {MOCK_STUDENTS.find(s => s.id === formData.student_id)?.school_number}
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
                          {MOCK_CERT_TYPES.map((type, i) => (
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
                          {MOCK_SCHOOLS.map(school => (
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
                          {MOCK_CLASSES.map(cls => (
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
                          {MOCK_YEARS.map(yr => (
                            <option key={yr.id} value={yr.id}>{yr.year}</option>
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
                          {editingRecord?.student_image && !selectedFile && (
                             <p className="text-xs text-slate-400 mt-1">يوجد صورة مرفقة مسبقاً.</p>
                          )}
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
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-6">
                    {editingRecord ? 'حفظ التعديلات' : 'تسجيل الطلب'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --------------------------------------------------------------------------------
  // VIEW: MAIN LIST
  // --------------------------------------------------------------------------------
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header and Actions */}
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
          تسجيل طلب جديد
        </Button>
      </div>

      {/* Filter/Search */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="بحث برقم الطلب أو اسم الطالب..." 
            className="pr-10 bg-white rounded-xl border-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table view for Replacements */}
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
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    لا توجد طلبات مسجلة أو مطابقة للبحث
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">#{record.id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-800">{record.student?.full_name || record.student?.name}</p>
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
                        <p className="text-xs text-slate-500 mt-0.5">{record.schoolClass?.name || record.school_class?.name} - {record.academicYear?.year || record.academicYear?.name || record.academic_year?.year || record.academic_year?.name}</p>
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
                          onClick={() => handleDelete(record.id)}
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
      </div>

      {/* Shared Form Modal for Edit/Create */}
      {/* We moved the modal here to render in MAIN LIST for edit mode */}
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
                      {/* Readonly field for student name since it's pre-selected (or we are editing) */}
                      <div className="w-full flex h-10 items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
                        {MOCK_STUDENTS.find(s => s.id === formData.student_id)?.full_name || MOCK_STUDENTS.find(s => s.id === formData.student_id)?.name}
                        <span className="text-xs font-normal text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200" dir="ltr">
                          رقم: {MOCK_STUDENTS.find(s => s.id === formData.student_id)?.school_number}
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
                        {MOCK_CERT_TYPES.map((type, i) => (
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
                        {MOCK_SCHOOLS.map(school => (
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
                        {MOCK_CLASSES.map(cls => (
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
                        {MOCK_YEARS.map(yr => (
                          <option key={yr.id} value={yr.id}>{yr.year}</option>
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
                        {editingRecord?.student_image && !selectedFile && (
                           <p className="text-xs text-slate-400 mt-1">يوجد صورة مرفقة مسبقاً.</p>
                        )}
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
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-6">
                  {editingRecord ? 'حفظ التعديلات' : 'تسجيل الطلب'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
