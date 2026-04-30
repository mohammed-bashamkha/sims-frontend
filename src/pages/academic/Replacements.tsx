import React, { useState } from 'react';
import { FileQuestion, Search, Plus, Edit, Trash2, Calendar, FileText, Image as ImageIcon, School, GraduationCap, Eye, Printer, CheckCircle2, User } from 'lucide-react';
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
  student?: { id: number; name: string; school_number: string };
  school?: { id: number; name: string };
  school_class?: { id: number; name: string };
  academic_year?: { id: number; year: string };
}

// Mock Data for Dropdowns
const MOCK_STUDENTS = [
  { id: 1, name: 'محمد علي النمر', school_number: '1001' },
  { id: 2, name: 'أحمد صالح الكربي', school_number: '1002' },
  { id: 3, name: 'سالم عبدالله باوزير', school_number: '1003' },
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
    r.student?.name.includes(searchQuery) || 
    r.student?.school_number.includes(searchQuery) ||
    r.certificate_type.includes(searchQuery)
  );

  const handleOpenModal = (record?: CertificateReplacement) => {
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
        student_id: MOCK_STUDENTS[0].id,
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
  };

  const handleCloseView = () => {
    setViewingRecord(null);
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
  };

  const handleDelete = (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السجل؟ لن تتمكن من التراجع عن هذا الإجراء.')) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  return (
    <div className="space-y-6">
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
          onClick={() => handleOpenModal()}
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
            placeholder="بحث باسم الطالب أو رقم الجلوس..." 
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
                        <p className="font-bold text-slate-800">{record.student?.name}</p>
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
                        <p className="text-xs text-slate-500 mt-0.5">{record.school_class?.name} - {record.academic_year?.year}</p>
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

      {/* Modal for Create / Update */}
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
                      <label className="text-xs font-medium text-slate-500">الطالب <span className="text-red-500">*</span></label>
                      <select 
                        name="student_id"
                        value={formData.student_id}
                        onChange={handleInputChange}
                        required
                        className="w-full flex h-10 items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {MOCK_STUDENTS.map(student => (
                          <option key={student.id} value={student.id}>{student.name} (رقم: {student.school_number})</option>
                        ))}
                      </select>
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

      {/* View Modal */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" dir="rtl">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* View Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-primary text-white">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <CheckCircle2 size={22} className="text-primary-foreground/80" />
                تفاصيل شهادة / إفادة
              </h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.print()}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="طباعة"
                >
                  <Printer size={18} />
                </button>
              </div>
            </div>
            
            {/* View Content */}
            <div className="p-8 space-y-8 bg-[url('/pattern.png')] bg-repeat relative">
              
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-slate-100 pb-6 relative z-10">
                {/* Student Image Placeholder / Avatar */}
                <div className="shrink-0 w-24 h-24 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden relative">
                  {viewingRecord.student_image ? (
                    <img 
                      src={typeof viewingRecord.student_image === 'string' ? viewingRecord.student_image : URL.createObjectURL(viewingRecord.student_image as File)} 
                      alt="Student" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={40} className="text-slate-300" />
                  )}
                </div>

                <div className="text-center sm:text-right space-y-2 flex-1">
                  <div className="inline-block px-4 py-1.5 rounded-full text-sm font-bold bg-amber-50 text-amber-700 border border-amber-200 mb-1">
                    {viewingRecord.certificate_type}
                  </div>
                  <h2 className="text-2xl font-black text-slate-800">{viewingRecord.student?.name}</h2>
                  <p className="text-slate-500 font-mono text-lg flex items-center justify-center sm:justify-start gap-2" dir="ltr">
                    <span className="text-xs font-bold text-slate-400 uppercase">رقم:</span>
                    {viewingRecord.student?.school_number}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 relative z-10">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><School size={14} /> المدرسة</p>
                  <p className="font-semibold text-slate-800">{viewingRecord.school?.name}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><GraduationCap size={14} /> الصف الدراسي</p>
                  <p className="font-semibold text-slate-800">{viewingRecord.school_class?.name}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Calendar size={14} /> العام الدراسي</p>
                  <p className="font-semibold text-slate-800" dir="ltr">{viewingRecord.academic_year?.year}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Calendar size={14} /> تاريخ الطلب</p>
                  <p className="font-semibold text-slate-800" dir="ltr">{viewingRecord.request_date}</p>
                </div>
              </div>

              {viewingRecord.notes && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">ملاحظات الطلب</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{viewingRecord.notes}</p>
                </div>
              )}
            </div>

            {/* View Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
              <Button type="button" onClick={handleCloseView} className="bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl px-8">
                إغلاق
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
