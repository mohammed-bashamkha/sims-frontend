import React, { useState } from 'react';
import { GraduationCap, Search, Plus, Edit, Trash2, Eye, ArrowRight, Save, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Interfaces
interface Student {
  id: number;
  name: string;
  school_number: string;
  class_id: number;
}

interface Subject {
  id: number;
  name: string;
  class_id: number;
}

interface AcademicYear {
  id: number;
  year: string;
  is_current: boolean;
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

// Mock Data
const MOCK_ACADEMIC_YEARS: AcademicYear[] = [
  { id: 1, year: '2023/2024', is_current: false },
  { id: 2, year: '2024/2025', is_current: true },
];

const MOCK_STUDENTS: Student[] = [
  { id: 1, name: 'محمد علي النمر', school_number: '1001', class_id: 1 },
  { id: 2, name: 'أحمد صالح الكربي', school_number: '1002', class_id: 1 },
  { id: 3, name: 'سالم عبدالله باوزير', school_number: '1003', class_id: 2 },
];

const MOCK_SUBJECTS: Subject[] = [
  { id: 1, name: 'القرآن الكريم', class_id: 1 },
  { id: 2, name: 'التربية الإسلامية', class_id: 1 },
  { id: 3, name: 'اللغة العربية', class_id: 1 },
  { id: 4, name: 'الرياضيات', class_id: 1 },
  { id: 5, name: 'اللغة العربية', class_id: 2 },
  { id: 6, name: 'الرياضيات', class_id: 2 },
];

const INITIAL_RECORDS: StudentGradeRecord[] = [
  {
    id: 1,
    student_id: 1,
    academic_year_id: 1,
    grades: [
      { subject_id: 1, first_semester: 40, second_semester: 45 },
      { subject_id: 2, first_semester: 38, second_semester: 42 },
      { subject_id: 3, first_semester: 35, second_semester: 40 },
      { subject_id: 4, first_semester: 42, second_semester: 48 },
    ]
  },
  {
    id: 2,
    student_id: 1,
    academic_year_id: 2,
    grades: [
      { subject_id: 1, first_semester: 45, second_semester: 48 },
      { subject_id: 2, first_semester: 40, second_semester: 45 },
      { subject_id: 3, first_semester: 35, second_semester: 42 },
      { subject_id: 4, first_semester: 48, second_semester: 50 },
    ]
  }
];

export const StudentGrades: React.FC = () => {
  const [records, setRecords] = useState<StudentGradeRecord[]>(INITIAL_RECORDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYearFilter, setSelectedYearFilter] = useState<number>(2); // Default to current year (id: 2)
  
  // View states: 'index' | 'create' | 'edit' | 'read'
  const [currentView, setCurrentView] = useState<'index' | 'create' | 'edit' | 'read'>('index');
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null);
  
  // Form state for grades
  const [gradeForm, setGradeForm] = useState<GradeEntry[]>([]);
  const [formAcademicYearId, setFormAcademicYearId] = useState<number>(2);

  // Helpers
  const getStudent = (id: number) => MOCK_STUDENTS.find(s => s.id === id);
  const getSubjectsForClass = (classId: number) => MOCK_SUBJECTS.filter(s => s.class_id === classId);
  const getAcademicYear = (id: number) => MOCK_ACADEMIC_YEARS.find(y => y.id === id);
  const getRecord = (studentId: number, yearId: number) => records.find(r => r.student_id === studentId && r.academic_year_id === yearId);

  // Filter students based on search
  const filteredStudents = MOCK_STUDENTS.filter(s => 
    s.name.includes(searchQuery) || s.school_number.includes(searchQuery)
  );

  const handleCreate = (studentId: number) => {
    setSelectedStudentId(studentId);
    setFormAcademicYearId(selectedYearFilter); // Default to filtered year
    const student = getStudent(studentId);
    if (!student) return;

    const subjects = getSubjectsForClass(student.class_id);
    setGradeForm(subjects.map(sub => ({
      subject_id: sub.id,
      first_semester: '',
      second_semester: ''
    })));
    setCurrentView('create');
  };

  const handleEdit = (recordId: number) => {
    const record = records.find(r => r.id === recordId);
    if (!record) return;
    
    setSelectedStudentId(record.student_id);
    setEditingRecordId(recordId);
    setFormAcademicYearId(record.academic_year_id);
    
    const student = getStudent(record.student_id);
    if (!student) return;

    const subjects = getSubjectsForClass(student.class_id);
    
    setGradeForm(subjects.map(sub => {
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

  const handleDelete = (recordId: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذه النتيجة بالكامل؟')) {
      setRecords(records.filter(r => r.id !== recordId));
    }
  };

  const handleGradeChange = (subjectId: number, field: 'first_semester' | 'second_semester', value: string) => {
    const numValue = value === '' ? '' : Number(value);
    
    if (typeof numValue === 'number' && numValue > 50) return;
    
    setGradeForm(prev => prev.map(g => 
      g.subject_id === subjectId ? { ...g, [field]: numValue } : g
    ));
  };

  const handleSaveGrades = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    // Check if record already exists for this student + academic year (when creating)
    if (currentView === 'create') {
      const exists = records.some(r => r.student_id === selectedStudentId && r.academic_year_id === formAcademicYearId);
      if (exists) {
        alert('يوجد سجل درجات مسجل مسبقاً لهذا الطالب في نفس السنة الدراسية المحددة.');
        return;
      }
    }

    if (currentView === 'edit' && editingRecordId) {
      setRecords(records.map(r => r.id === editingRecordId ? {
        ...r,
        academic_year_id: formAcademicYearId,
        grades: gradeForm
      } : r));
    } else {
      const newId = Math.max(0, ...records.map(r => r.id)) + 1;
      setRecords([...records, {
        id: newId,
        student_id: selectedStudentId,
        academic_year_id: formAcademicYearId,
        grades: gradeForm
      }]);
    }
    
    setCurrentView('index');
    setSelectedStudentId(null);
    setEditingRecordId(null);
  };

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
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="البحث باسم الطالب أو الرقم المدرسي..." 
              className="pr-10 bg-white rounded-xl border-slate-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="text-slate-400" size={18} />
            <select 
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              value={selectedYearFilter}
              onChange={(e) => setSelectedYearFilter(Number(e.target.value))}
            >
              {MOCK_ACADEMIC_YEARS.map(y => (
                <option key={y.id} value={y.id}>{y.year}</option>
              ))}
            </select>
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
                            <span className="font-bold text-slate-800">{student.name}</span>
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
                                  onClick={() => handleEdit(recordForSelectedYear!.id)}
                                  className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                  title="تعديل نتيجة هذه السنة"
                                >
                                  <Edit size={18} />
                                </button>
                                <button 
                                  onClick={() => handleDelete(recordForSelectedYear!.id)}
                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="حذف نتيجة هذه السنة"
                                >
                                  <Trash2 size={18} />
                                </button>
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
                                <Button 
                                  size="sm"
                                  onClick={() => handleCreate(student.id)}
                                  className="bg-primary hover:bg-primary/90 text-white gap-1 rounded-lg h-8"
                                >
                                  <Plus size={14} /> رصد الدرجات
                                </Button>
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
        </div>
      </div>
    );
  }

  // Render Form (Create / Edit) View
  if (currentView === 'create' || currentView === 'edit') {
    const student = getStudent(selectedStudentId!);
    const subjects = getSubjectsForClass(student!.class_id);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setCurrentView('index'); setSelectedStudentId(null); setEditingRecordId(null); }}
            className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <ArrowRight size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {currentView === 'create' ? 'رصد درجات طالب جديد' : 'تعديل درجات الطالب'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              إدخال درجات جميع المواد للطالب: <strong className="text-primary">{student?.name}</strong> (رقم: {student?.school_number})
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
                  {MOCK_ACADEMIC_YEARS.map(y => (
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
                {subjects.map((subject) => {
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
                          required
                          value={grade?.first_semester === '' ? '' : grade?.first_semester}
                          onChange={(e) => handleGradeChange(subject.id, 'first_semester', e.target.value)}
                          className="text-center font-bold font-mono"
                          dir="ltr"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Input 
                          type="number"
                          min="0"
                          max="50"
                          required
                          value={grade?.second_semester === '' ? '' : grade?.second_semester}
                          onChange={(e) => handleGradeChange(subject.id, 'second_semester', e.target.value)}
                          className="text-center font-bold font-mono"
                          dir="ltr"
                        />
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
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-white font-bold gap-2 rounded-xl px-8">
              <Save size={18} />
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
    const subjects = getSubjectsForClass(student!.class_id);

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
              <strong className="text-primary">{student?.name}</strong> (رقم: {student?.school_number})
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
              
              // Calculate overall result for the year
              let totalScore = 0;
              let maxPossibleScore = subjects.length * 100;
              let hasFailedSubject = false;
              
              subjects.forEach(subject => {
                const grade = record.grades.find(g => g.subject_id === subject.id);
                const first = typeof grade?.first_semester === 'number' ? grade.first_semester : 0;
                const second = typeof grade?.second_semester === 'number' ? grade.second_semester : 0;
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
                        {subjects.map((subject) => {
                          const grade = record.grades.find(g => g.subject_id === subject.id);
                          const first = typeof grade?.first_semester === 'number' ? grade.first_semester : 0;
                          const second = typeof grade?.second_semester === 'number' ? grade.second_semester : 0;
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
      </div>
    );
  }

  return null;
};
