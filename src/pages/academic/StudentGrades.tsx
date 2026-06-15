import React, { useState, useEffect } from 'react';
import { GraduationCap, Search, Plus, Edit, Trash2, Eye, ArrowRight, Save, User, Calendar, Loader2, FileDown, FileUp } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { useFormErrors } from '@/hooks/useFormErrors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/api/axios';
import { hasPermission } from '@/services/authService';
import { DeleteConfirmationModal } from '@/components/common/DeleteConfirmationModal';
import { gradeService } from '@/services/gradeService';

// Interfaces
interface Student {
  id: number;
  full_name: string;
  school_number: string;
  current_enrollment?: {
    school_id?: number;
    class_id: number;
    academic_year_id: number;
  };
  enrollments?: Array<{
    school_id?: number;
    class_id: number;
    academic_year_id: number;
  }>;
}

interface Subject {
  id: number;
  name: string;
  school_classes?: Array<{ id: number; name: string }>;
}

interface AcademicYear {
  id: number;
  year: string;
  is_current?: boolean;
  status?: string;
}

interface GradeEntry {
  subject_id: number;
  first_semester: number | '';
  second_semester: number | '';
}

interface StudentGradeRecord {
  id: number;
  student_id: number;
  academic_year_id: number;
  grades: GradeEntry[];
}

export const StudentGrades: React.FC = () => {
  const [records, setRecords] = useState<StudentGradeRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const canManage = hasPermission('الدرجات.ادارة');
  const canImport = hasPermission('النتائج.استيراد');
  const canExport = hasPermission('النتائج.تصدير');

  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedYearFilter, setSelectedYearFilter] = useState<number>(0);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<string>('');

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [schools, setSchools] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  
  // View states: 'index' | 'create' | 'edit' | 'read'
  const [currentView, setCurrentView] = useState<'index' | 'create' | 'edit' | 'read'>('index');
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  
  // Form state for grades
  const [gradeForm, setGradeForm] = useState<GradeEntry[]>([]);
  const [formAcademicYearId, setFormAcademicYearId] = useState<number>(0);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<StudentGradeRecord | null>(null);

  const { errors, handleApiError, clearErrors } = useFormErrors();
  const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null); // composite key like 'studentId-yearId'



  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  // Auto-open student record when student_id is in the URL
  useEffect(() => {
    const studentId = searchParams.get('student_id');
    if (studentId && students.length > 0) {
      const id = Number(studentId);
      const student = students.find(s => s.id === id);
      if (student) {
        setSelectedStudentId(id);
        setCurrentView('read');
      }
    }
  }, [searchParams, students]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subjectsRes, yearsRes, schoolsRes, classesRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/academic-years'),
        api.get('/schools'),
        api.get('/school-classes')
      ]);

      let yearsData: AcademicYear[] = yearsRes.data.data || yearsRes.data;
      
      // Sort yearsData to put active year first
      yearsData.sort((a, b) => {
        const aActive = a.is_current || a.status === 'active';
        const bActive = b.is_current || b.status === 'active';
        if (aActive && !bActive) return -1;
        if (!aActive && bActive) return 1;
        return b.id - a.id;
      });

      const subjectsData = subjectsRes.data.data || subjectsRes.data;

      setSubjects(subjectsData);
      setAcademicYears(yearsData);
      setSchools(schoolsRes.data.data || schoolsRes.data || []);
      setClasses(classesRes.data.data || classesRes.data || []);

      const currentYear = yearsData[0]; // Active year is now first
      if (currentYear && selectedYearFilter === 0) {
        setSelectedYearFilter(currentYear.id);
      } else if (yearsData.length > 0 && selectedYearFilter === 0) {
        setSelectedYearFilter(yearsData[0].id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helpers
  const getRecord = (studentId: number, yearId: number) => records.find(r => r.student_id === studentId && r.academic_year_id === yearId);
  const getAcademicYear = (id: number) => academicYears.find(y => y.id === id);
  const getStudent = (id: number) => students.find(s => s.id === id);
  const getSubjectsForClass = (classId: number) => subjects.filter(s => 
    s.school_classes?.some((c: any) => c.id === classId)
  );
  const fetchStudentsList = async () => {
    try {
      setLoading(true);
      const params: any = { page: currentPage };
      if (searchQuery) params.search = searchQuery;
      if (selectedYearFilter) params.academic_year_id = selectedYearFilter;
      if (selectedSchoolId) params.school_id = selectedSchoolId;
      if (selectedClassId) params.class_id = selectedClassId;
      if (selectedGender) params.gender = selectedGender;

      const res = await api.get('/students', { params });
      const data = res.data.data || res.data;
      const meta = res.data.meta || res.data;
      
      setStudents(data);
      setLastPage(meta.last_page || 1);
      setTotalRecords(meta.total || data.length);

      // Fetch grades for these students
      if (data.length > 0) {
        const studentIds = data.map((s: Student) => s.id);
        const gradesRes = await api.get('/grades', {
          params: { student_ids: studentIds } // Fetch all grades for these students across all years
        });
        
        const flatGrades = gradesRes.data;
        const grouped = new Map<string, StudentGradeRecord>();
        
        flatGrades.forEach((grade: any) => {
          const key = `${grade.student_id}-${grade.academic_year_id}`;
          if (!grouped.has(key)) {
            grouped.set(key, {
              id: grade.id,
              student_id: grade.student_id,
              academic_year_id: grade.academic_year_id,
              grades: []
            });
          }
          
          grouped.get(key)!.grades.push({
            subject_id: grade.subject_id,
            first_semester: grade.first_semester_total !== null ? Number(grade.first_semester_total) : '',
            second_semester: grade.second_semester_total !== null ? Number(grade.second_semester_total) : ''
          });
        });
        
        setRecords(Array.from(grouped.values()));
      } else {
        setRecords([]);
      }

    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedYearFilter === 0) return;
    const timer = setTimeout(() => {
      fetchStudentsList();
    }, 300);
    return () => clearTimeout(timer);
  }, [currentPage, searchQuery, selectedYearFilter, selectedSchoolId, selectedClassId, selectedGender]);

  const handleFilterChange = (setter: any, value: any) => {
    setter(value);
    setCurrentPage(1);
  };

  // Filter students based on search and filters (now mostly handled by backend, but kept for local overrides if needed)
  const filteredStudents = students;

  const handleCreate = (studentId: number) => {
    setSelectedStudentId(studentId);
    setFormAcademicYearId(selectedYearFilter); // Default to filtered year
    const student = getStudent(studentId);
    if (!student) return;

    // Determine the class_id from enrollments
    const enrollment = student.enrollments?.find(e => e.academic_year_id === selectedYearFilter) 
                    || student.current_enrollment;
    
    if (!enrollment) {
      alert('الطالب غير مسجل في أي صف لهذه السنة الدراسية.');
      return;
    }

    const subjects = getSubjectsForClass(enrollment.class_id);
    setGradeForm(subjects.map(sub => ({
      subject_id: sub.id,
      first_semester: '',
      second_semester: ''
    })));
    setCurrentView('create');
  };

  const handleEdit = (studentId: number, academicYearId: number) => {
    // Use the composite key (student_id + academic_year_id) — more reliable than a single grade's DB id
    const record = getRecord(studentId, academicYearId);
    if (!record) return;

    setSelectedStudentId(studentId);
    setFormAcademicYearId(academicYearId);

    const student = getStudent(studentId);
    if (!student) return;

    const enrollment = student.enrollments?.find(e => e.academic_year_id === academicYearId)
                    || student.current_enrollment;

    if (!enrollment) return;

    const subjectList = getSubjectsForClass(enrollment.class_id);

    setGradeForm(subjectList.map(sub => {
      const existing = record.grades.find(g => g.subject_id === sub.id);
      return {
        subject_id: sub.id,
        first_semester: existing ? existing.first_semester : '',
        second_semester: existing ? existing.second_semester : ''
      };
    }));
    setCurrentView('edit');
  };

  const handleRead = (studentId: number) => {
    setSelectedStudentId(studentId);
    setCurrentView('read');
  };

  const handleDelete = (record: StudentGradeRecord) => {
    setRecordToDelete(record);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;
    
    setSubmitting(true);
    try {
      await api.delete(`/grades/bulk/${recordToDelete.student_id}/${recordToDelete.academic_year_id}`);
      await fetchStudentsList();
      setIsDeleteModalOpen(false);
      setRecordToDelete(null);
    } catch (error) {
      console.error('Error deleting grades:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGradeChange = (subjectId: number, field: 'first_semester' | 'second_semester', value: string) => {
    const numValue = value === '' ? '' : Number(value);
    
    if (typeof numValue === 'number' && numValue > 50) return;
    
    setGradeForm(prev => prev.map(g => 
      g.subject_id === subjectId ? { ...g, [field]: numValue } : g
    ));
  };

  const handleSaveGrades = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    clearErrors();
    setSubmitting(true);
    try {
      const payload = {
        student_id: selectedStudentId,
        academic_year_id: formAcademicYearId,
        grades: gradeForm.map(g => ({
          subject_id: g.subject_id,
          first_semester: g.first_semester === '' ? null : g.first_semester,
          second_semester: g.second_semester === '' ? null : g.second_semester
        }))
      };

      await api.post('/grades/bulk', payload);
      // Re-fetch students and grades to update the UI
      await fetchStudentsList();
      
      setCurrentView('index');
      setSelectedStudentId(null);
    } catch (error: any) {
      handleApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportPdf = async (studentId: number, academicYearId: number, studentName: string) => {
    const loadingKey = `${studentId}-${academicYearId}`;
    setPdfLoadingId(loadingKey);
    try {
      await gradeService.downloadResultPdf(studentId, academicYearId, studentName);
    } catch (error: any) {
      console.error('Error exporting PDF:', error);
      const message = error.response?.data?.message || 'حدث خطأ أثناء تصدير ملف الـ PDF. يرجى التأكد من رصد جميع الدرجات.';
      alert(message);
    } finally {
      setPdfLoadingId(null);
    }
  };

  // Global Delete Confirmation Modal — must be outside any conditional view block
  const deleteModal = (
    <DeleteConfirmationModal
      isOpen={isDeleteModalOpen}
      onClose={() => setIsDeleteModalOpen(false)}
      onConfirm={confirmDelete}
      title="حذف درجات الطالب"
      message="هل أنت متأكد من رغبتك في حذف جميع درجات هذا الطالب للعام الدراسي المحدد؟ سيعتبر الطالب في حكم (الغير مرصود)."
      itemName={recordToDelete ? getStudent(recordToDelete.student_id)?.full_name : undefined}
      isLoading={submitting}
    />
  );

  // Render Index View
  if (currentView === 'index') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <GraduationCap className="text-primary" size={24} />
              درجات الطلاب
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              إدارة رصد درجات الطلاب للمواد الدراسية وعرض النتائج.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {canExport && (
              <Link to="/academic/export-final-results">
                <Button variant="outline" className="gap-2 font-medium">
                  <FileDown size={16} className="text-cyan-600" />
                  تصدير النتائج
                </Button>
              </Link>
            )}
            {canImport && (
              <Link to="/academic/import-final-results">
                <Button className="gap-2 font-medium bg-emerald-600 hover:bg-emerald-700 text-white">
                  <FileUp size={16} />
                  استيراد النتائج
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="البحث باسم الطالب أو الرقم المدرسي..." 
              className="pr-10 bg-white rounded-xl border-slate-200"
              value={searchQuery}
              onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <select 
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              value={selectedSchoolId}
              onChange={(e) => handleFilterChange(setSelectedSchoolId, e.target.value)}
            >
              <option value="">كل المدارس</option>
              {schools.map(school => <option key={school.id} value={school.id}>{school.name}</option>)}
            </select>

            <select 
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              value={selectedClassId}
              onChange={(e) => handleFilterChange(setSelectedClassId, e.target.value)}
            >
              <option value="">كل الصفوف</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select 
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              value={selectedGender}
              onChange={(e) => handleFilterChange(setSelectedGender, e.target.value)}
            >
              <option value="">الجنس (الكل)</option>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>

            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
              <Calendar className="text-slate-400" size={18} />
              <select 
                className="bg-transparent text-sm outline-none font-bold text-slate-700"
                value={selectedYearFilter}
                onChange={(e) => handleFilterChange(setSelectedYearFilter, Number(e.target.value))}
              >
                {academicYears.map((y: AcademicYear) => {
                  const isActive = y.is_current || y.status === 'active';
                  return (
                    <option key={y.id} value={y.id}>
                      {y.year} {isActive ? '(النشطة)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold">الرقم المدرسي</th>
                  <th className="px-6 py-4 font-bold">اسم الطالب</th>
                  <th className="px-6 py-4 font-bold">السنة الدراسية</th>
                  <th className="px-6 py-4 font-bold">حالة الدرجات</th>
                  <th className="px-6 py-4 font-bold text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                      لا يوجد طلاب مطابقين للبحث
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    const recordForSelectedYear = getRecord(student.id, selectedYearFilter);
                    const hasGrades = !!recordForSelectedYear;
                    const academicYearObj = getAcademicYear(selectedYearFilter);

                    return (
                      <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-600" dir="ltr">{student.school_number}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                              <User size={14} />
                            </div>
                            <span className="font-bold text-slate-800">{student.full_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700" dir="ltr">
                          {academicYearObj?.year}
                        </td>
                        <td className="px-6 py-4">
                          {hasGrades ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                              تم الرصد
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                              غير مرصود
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {hasGrades ? (
                              <>
                                <button 
                                  onClick={() => handleRead(student.id)}
                                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="عرض جميع النتائج للطالب"
                                >
                                  <Eye size={18} />
                                </button>
                                <button 
                                  onClick={() => handleExportPdf(student.id, selectedYearFilter, student.full_name)}
                                  disabled={pdfLoadingId === `${student.id}-${selectedYearFilter}`}
                                  className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="تصدير النتيجة PDF"
                                >
                                  {pdfLoadingId === `${student.id}-${selectedYearFilter}` ? (
                                    <Loader2 size={18} className="animate-spin text-emerald-600" />
                                  ) : (
                                    <FileDown size={18} />
                                  )}
                                </button>
                                {canManage && (
                                  <>
                                    <button 
                                      onClick={() => handleEdit(student.id, selectedYearFilter)}
                                      className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                      title="تعديل نتيجة هذه السنة"
                                    >
                                      <Edit size={18} />
                                    </button>
                                    <button 
                                      onClick={() => handleDelete(recordForSelectedYear!)}
                                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="حذف نتيجة هذه السنة"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </>
                                )}
                              </>
                            ) : (
                              <>
                                <button 
                                  onClick={() => handleRead(student.id)}
                                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="عرض جميع النتائج للطالب"
                                >
                                  <Eye size={18} />
                                </button>
                                {canManage && (
                                  <Button 
                                    size="sm"
                                    onClick={() => handleCreate(student.id)}
                                    className="bg-primary hover:bg-primary/90 text-white gap-1 rounded-lg h-8"
                                  >
                                    <Plus size={14} /> رصد الدرجات
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {loading && students.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 bg-white border-t border-slate-100">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-slate-500 font-medium">جاري تحميل البيانات...</p>
            </div>
          )}
          {lastPage > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
              <div className="text-sm text-slate-500">
                إجمالي {totalRecords} طالب
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1 || loading}
                  className="gap-1"
                >
                  <ArrowRight size={16} /> السابق
                </Button>
                <div className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700">
                  {currentPage} / {lastPage}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.min(lastPage, p + 1))} 
                  disabled={currentPage === lastPage || loading}
                  className="gap-1"
                >
                  التالي <ArrowRight size={16} className="rotate-180" />
                </Button>
              </div>
            </div>
          )}
        </div>
        {deleteModal}
      </div>
    );
  }

  // Render Form (Create / Edit) View
  if (currentView === 'create' || currentView === 'edit') {
    const student = getStudent(selectedStudentId!);
    const enrollment = student?.enrollments?.find(e => e.academic_year_id === formAcademicYearId) 
                    || student?.current_enrollment;
    const subjects = enrollment ? getSubjectsForClass(enrollment.class_id) : [];

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setCurrentView('index'); setSelectedStudentId(null); }}
            className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <ArrowRight size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {currentView === 'create' ? 'رصد درجات طالب جديد' : 'تعديل درجات الطالب'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              إدخال درجات جميع المواد للطالب: <strong className="text-primary">{student?.full_name}</strong> (رقم: {student?.school_number})
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveGrades} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-4 items-center justify-between">
             <div className="flex items-center gap-3">
               <span className="font-bold text-slate-700">السنة الدراسية:</span>
               <select 
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  value={formAcademicYearId}
                  onChange={(e) => setFormAcademicYearId(Number(e.target.value))}
                  disabled={currentView === 'edit'} // Don't allow changing year during edit to prevent conflicts
                >
                  {academicYears.map((y: AcademicYear) => (
                    <option key={y.id} value={y.id}>{y.year}</option>
                  ))}
                </select>
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold">المادة الدراسية</th>
                  <th className="px-6 py-4 font-bold w-48 text-center">الفصل الأول (50)</th>
                  <th className="px-6 py-4 font-bold w-48 text-center">الفصل الثاني (50)</th>
                  <th className="px-6 py-4 font-bold w-32 text-center">المجموع (100)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((subject, index) => {
                  const grade = gradeForm.find(g => g.subject_id === subject.id);
                  const total = (typeof grade?.first_semester === 'number' ? grade.first_semester : 0) + 
                               (typeof grade?.second_semester === 'number' ? grade.second_semester : 0);
                  
                  return (
                    <tr key={subject.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-700">{subject.name}</td>
                      <td className="px-6 py-4">
                        <Input 
                          type="number"
                          min="0"
                          max="50"
                          value={grade?.first_semester === '' ? '' : grade?.first_semester}
                          onChange={(e) => handleGradeChange(subject.id, 'first_semester', e.target.value)}
                          className="text-center font-bold font-mono"
                          dir="ltr"
                        />
                        {errors[`grades.${index}.first_semester`] && <div className="text-xs text-red-500 font-medium mt-1">{errors[`grades.${index}.first_semester`][0]}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <Input 
                          type="number"
                          min="0"
                          max="50"
                          value={grade?.second_semester === '' ? '' : grade?.second_semester}
                          onChange={(e) => handleGradeChange(subject.id, 'second_semester', e.target.value)}
                          className="text-center font-bold font-mono"
                          dir="ltr"
                        />
                        {errors[`grades.${index}.second_semester`] && <div className="text-xs text-red-500 font-medium mt-1">{errors[`grades.${index}.second_semester`][0]}</div>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center justify-center w-12 h-8 rounded-lg font-bold ${
                          total >= 50 ? 'bg-emerald-100 text-emerald-800' : 
                          total > 0 ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {total}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
            <Button 
              type="submit" 
              disabled={submitting}
              className="bg-primary hover:bg-primary/90 text-white font-bold gap-2 rounded-xl px-8"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={18} />}
              حفظ درجات الطالب
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Render Read View
  if (currentView === 'read') {
    const student = getStudent(selectedStudentId!);
    const studentRecords = records.filter(r => r.student_id === selectedStudentId);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setCurrentView('index'); setSelectedStudentId(null); }}
            className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <ArrowRight size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              سجل درجات الطالب الشامل
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              <strong className="text-primary">{student?.full_name}</strong> (رقم: {student?.school_number})
            </p>
          </div>
        </div>

        {studentRecords.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <GraduationCap size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-700">لا توجد درجات مرصودة</h3>
            <p className="text-slate-500 mt-2">لم يتم رصد أي درجات لهذا الطالب في أي سنة دراسية حتى الآن.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {studentRecords.map((record) => {
              const academicYear = getAcademicYear(record.academic_year_id);
              const enrollment = student?.enrollments?.find(e => e.academic_year_id === record.academic_year_id) 
                              || student?.current_enrollment;
              const yearSubjects = enrollment ? getSubjectsForClass(enrollment.class_id) : [];
              
              // Calculate overall result for the year
              let totalScore = 0;
              let maxPossibleScore = yearSubjects.length * 100;
              let hasFailedSubject = false;
              
              yearSubjects.forEach(subject => {
                const grade = record.grades.find(g => g.subject_id === subject.id);
                const first = (grade?.first_semester !== '' && grade?.first_semester !== undefined) ? Number(grade.first_semester) : 0;
                const second = (grade?.second_semester !== '' && grade?.second_semester !== undefined) ? Number(grade.second_semester) : 0;
                const total = first + second;
                totalScore += total;
                if (total < 50) hasFailedSubject = true;
              });

              const percentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
              
              return (
                <div key={record.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary text-white p-2 rounded-lg">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg">نتيجة العام الدراسي</h3>
                        <p className="text-primary font-black tracking-widest text-sm mt-0.5" dir="ltr">{academicYear?.year}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="text-center px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                        <span className="block text-xs text-slate-500 font-medium mb-1">النسبة المئوية</span>
                        <span className="font-black text-slate-800" dir="ltr">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="text-center px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold ${
                          hasFailedSubject ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {hasFailedSubject ? 'راسب' : 'ناجح'}
                        </span>
                        <Button 
                          onClick={() => handleExportPdf(student!.id, record.academic_year_id, student!.full_name)}
                          disabled={pdfLoadingId === `${student?.id}-${record.academic_year_id}`}
                          variant="outline"
                          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 gap-2 rounded-xl"
                        >
                          {pdfLoadingId === `${student?.id}-${record.academic_year_id}` ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <FileDown size={16} />
                          )}
                          تصدير PDF
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                      <thead className="bg-white text-slate-500 border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-3 font-bold">المادة الدراسية</th>
                          <th className="px-6 py-3 font-bold text-center">الفصل الأول</th>
                          <th className="px-6 py-3 font-bold text-center">الفصل الثاني</th>
                          <th className="px-6 py-3 font-bold text-center">المجموع النهائي</th>
                          <th className="px-6 py-3 font-bold text-center">التقدير</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {yearSubjects.map((subject) => {
                          const grade = record.grades.find(g => g.subject_id === subject.id);
                          const first = (grade?.first_semester !== '' && grade?.first_semester !== undefined) ? Number(grade.first_semester) : 0;
                          const second = (grade?.second_semester !== '' && grade?.second_semester !== undefined) ? Number(grade.second_semester) : 0;
                          const total = first + second;
                          
                          // Simple grading scale
                          let gradeLetter = 'ممتاز';
                          if (total < 50) gradeLetter = 'ضعيف';
                          else if (total < 65) gradeLetter = 'مقبول';
                          else if (total < 80) gradeLetter = 'جيد';
                          else if (total < 90) gradeLetter = 'جيد جداً';

                          return (
                            <tr key={subject.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4 font-bold text-slate-700">{subject.name}</td>
                              <td className="px-6 py-4 text-center font-mono font-bold text-slate-600">{first}</td>
                              <td className="px-6 py-4 text-center font-mono font-bold text-slate-600">{second}</td>
                              <td className="px-6 py-4 text-center font-mono font-black text-slate-800 text-base">{total}</td>
                              <td className="px-6 py-4 text-center font-bold text-slate-600">
                                {gradeLetter}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {deleteModal}
      </div>
    );
  }

  return null;
};
