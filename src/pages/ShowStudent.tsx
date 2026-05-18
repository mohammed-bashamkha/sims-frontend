import React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft, User, Building2, Calendar, Edit,
  FileText, CheckCircle, ArrowRightLeft, Clock,
  AlertTriangle, FileQuestion, GraduationCap, MapPin, Flag,
  WifiOff,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { studentService } from '@/services/studentService';
import type { StudentEnrollment } from '@/types/student';

// ======================================================
// Helpers
// ======================================================

function statusBadge(status: string | null) {
  if (!status) return null;
  const map: Record<string, { label: string; className: string }> = {
    active:    { label: 'نشط',    className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    suspended: { label: 'موقوف', className: 'bg-red-100 text-red-700 border-red-200' },
    graduated: { label: 'متخرج', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  };
  const config = map[status] ?? { label: status, className: 'bg-slate-100 text-slate-700 border-slate-200' };
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${config.className}`}>
      {config.label}
    </span>
  );
}

// ======================================================
// EnrollmentRow – used in "Previous Enrollments"
// ======================================================

interface EnrollmentRowProps {
  enrollment: StudentEnrollment;
  studentId: string;
}

const EnrollmentRow: React.FC<EnrollmentRowProps> = ({ enrollment, studentId }) => (
  <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-sm">
          {enrollment.academic_year ?? '—'}
        </span>
        <span className="font-semibold text-slate-800">{enrollment.class_name ?? '—'}</span>
      </div>
      <p className="text-slate-500 text-sm flex items-center gap-1.5 mt-2">
        <Building2 size={14} />
        {enrollment.school_name ?? '—'}
      </p>
    </div>
    <div className="flex items-center gap-2 flex-wrap justify-end mt-3 md:mt-0">
      <Link
        to={`/students/${studentId}/result/${enrollment.academic_year_id}`}
        className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-primary hover:border-primary/30 transition-all flex items-center gap-2"
      >
        <GraduationCap size={16} />
        النتيجة النهائية
      </Link>
      {enrollment.has_data_errors && (
        <Link
          to={`/errors?student_id=${studentId}&academic_year_id=${enrollment.academic_year_id}`}
          className="px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-all flex items-center gap-2"
        >
          <AlertTriangle size={16} />
          سجل الأخطاء
        </Link>
      )}
      {enrollment.has_replacement && (
        <Link
          to={`/certificates?student_id=${studentId}&academic_year_id=${enrollment.academic_year_id}`}
          className="px-4 py-2 bg-orange-50 border border-orange-200 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-100 transition-all flex items-center gap-2"
        >
          <FileQuestion size={16} />
          بدل فاقد
        </Link>
      )}
    </div>
  </div>
);

// ======================================================
// Main Component
// ======================================================

export const ShowStudent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentService.getStudentById(id!),
    enabled: !!id,
  });

  const student = data?.data;

  // ——— Loading ———
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <span className="animate-spin w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full" />
      </div>
    );
  }

  // ——— Error ———
  if (isError || !student) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-slate-500">
        <WifiOff size={48} className="text-slate-300" />
        <p className="text-lg font-semibold">تعذّر تحميل بيانات الطالب</p>
        <button
          onClick={() => navigate('/students')}
          className="text-primary underline text-sm"
        >
          العودة إلى سجل الطلاب
        </button>
      </div>
    );
  }

  const currentEnrollment = student.current_enrollment;
  const previousEnrollments = student.enrollments.filter(
    (e) => e.id !== currentEnrollment?.id
  );

  return (
    <div className="max-w-[1400px] mx-auto pb-12 flex flex-col gap-6">

      {/* ——— Header / Breadcrumb ——— */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-slate-500">
            <button
              onClick={() => navigate('/students')}
              className="hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium"
            >
              سجل الطلاب
            </button>
            <ChevronLeft size={16} />
            <span className="text-slate-800 font-bold text-sm">ملف الطالب</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <User size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                {student.full_name}
                {statusBadge(currentEnrollment?.status ?? null)}
              </h1>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/students/edit/${id}`}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-medium transition-colors"
          >
            <Edit size={18} />
            <span>تعديل بيانات الطالب</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ——— Right Column: Personal Info + Previous Enrollments ——— */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* البيانات الشخصية */}
          <Card className="shadow-sm border border-slate-100 rounded-2xl overflow-hidden">
            <div className="bg-slate-50/50 border-b border-slate-100 p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="text-primary" size={20} />
                <h2 className="font-bold text-slate-800 text-lg">البيانات الشخصية والأساسية</h2>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5"><FileText size={14} /> الرقم المدرسي</p>
                  <p className="font-semibold text-slate-800 text-lg">{student.school_number}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5"><CheckCircle size={14} /> رقم الجلوس</p>
                  <p className="font-semibold text-slate-800 text-lg">{student.seat_number}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5"><Flag size={14} /> الجنسية</p>
                  <p className="font-semibold text-slate-800 text-lg">{student.nationality ?? '—'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5"><User size={14} /> الجنس</p>
                  <p className="font-semibold text-slate-800 text-lg">{student.gender === 'male' ? 'ذكر' : student.gender === 'female' ? 'أنثى' : student.gender ?? '—'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5"><Calendar size={14} /> تاريخ الميلاد</p>
                  <p className="font-semibold text-slate-800 text-lg">{student.date_of_birth ?? '—'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5"><MapPin size={14} /> مكان الميلاد</p>
                  <p className="font-semibold text-slate-800 text-lg">{student.place_of_birth ?? '—'}</p>
                </div>
                <div className="space-y-1 sm:col-span-2 md:col-span-3 pt-4 border-t border-slate-100 mt-2">
                  <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5"><Calendar size={14} /> تاريخ التسجيل الأول في النظام</p>
                  <p className="font-semibold text-slate-800 text-lg">{student.registration_date ?? '—'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* التسجيلات السابقة */}
          {previousEnrollments.length > 0 && (
            <Card className="shadow-sm border border-slate-100 rounded-2xl overflow-hidden">
              <div className="bg-slate-50/50 border-b border-slate-100 p-5 flex items-center gap-2">
                <Clock className="text-slate-500" size={20} />
                <h2 className="font-bold text-slate-800 text-lg">التسجيلات السابقة</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {previousEnrollments.map((enrollment) => (
                  <EnrollmentRow key={enrollment.id} enrollment={enrollment} studentId={id!} />
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* ——— Left Column: Current Enrollment + Actions ——— */}
        <div className="flex flex-col gap-6">

          {currentEnrollment ? (
            <Card className="shadow-sm border-2 border-primary/20 rounded-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-1.5 h-full bg-primary" />
              <div className="bg-primary/5 border-b border-primary/10 p-5 flex items-center gap-2">
                <Building2 className="text-primary" size={20} />
                <h2 className="font-bold text-primary text-lg">التسجيل الحالي</h2>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">العام الدراسي</p>
                    <p className="font-bold text-slate-800">{currentEnrollment.academic_year ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">المدرسة</p>
                    <p className="font-bold text-slate-800">{currentEnrollment.school_name ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">الصف</p>
                    <p className="font-bold text-slate-800">{currentEnrollment.class_name ?? '—'}</p>
                  </div>
                </div>

                {/* Show section only if at least one link is visible */}
                {(currentEnrollment.has_final_result ||
                  currentEnrollment.has_transfer ||
                  currentEnrollment.has_temporary_admission ||
                  currentEnrollment.has_data_errors ||
                  currentEnrollment.has_replacement) && (
                  <div className="space-y-2 pt-4 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">الإجراءات والروابط</p>

                    {currentEnrollment.has_final_result && (
                      <Link
                        to={`/academic/grades?student_id=${id}&academic_year_id=${currentEnrollment.academic_year_id}`}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-primary/5 text-slate-700 hover:text-primary transition-colors border border-transparent hover:border-primary/20 group"
                      >
                        <div className="flex items-center gap-3 font-medium">
                          <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary">
                            <GraduationCap size={16} />
                          </div>
                          النتيجة النهائية
                        </div>
                        <ChevronLeft size={16} className="text-slate-300 group-hover:text-primary" />
                      </Link>
                    )}

                    {currentEnrollment.has_transfer && (
                      <Link
                        to={`/transfers?student_id=${id}&academic_year_id=${currentEnrollment.academic_year_id}`}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors border border-transparent hover:border-amber-200 group"
                      >
                        <div className="flex items-center gap-3 font-medium">
                          <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-amber-500">
                            <ArrowRightLeft size={16} />
                          </div>
                          سجل التحويلات
                        </div>
                        <ChevronLeft size={16} className="text-amber-300 group-hover:text-amber-500" />
                      </Link>
                    )}

                    {currentEnrollment.has_temporary_admission && (
                      <Link
                        to={`/temporary-admission?student_id=${id}&academic_year_id=${currentEnrollment.academic_year_id}`}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 transition-colors border border-transparent hover:border-sky-200 group"
                      >
                        <div className="flex items-center gap-3 font-medium">
                          <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-sky-500">
                            <Clock size={16} />
                          </div>
                          القبول المؤقت
                        </div>
                        <ChevronLeft size={16} className="text-sky-300 group-hover:text-sky-500" />
                      </Link>
                    )}

                    {currentEnrollment.has_data_errors && (
                      <Link
                        to={`/academic/data-errors?student_id=${id}&academic_year_id=${currentEnrollment.academic_year_id}`}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 transition-colors border border-transparent hover:border-red-200 group"
                      >
                        <div className="flex items-center gap-3 font-medium">
                          <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-red-500">
                            <AlertTriangle size={16} />
                          </div>
                          عرض أخطاء البيانات
                        </div>
                        <ChevronLeft size={16} className="text-red-300 group-hover:text-red-500" />
                      </Link>
                    )}

                    {currentEnrollment.has_replacement && (
                      <Link
                        to={`/academic/replacements?student_id=${id}&academic_year_id=${currentEnrollment.academic_year_id}`}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 transition-colors border border-transparent hover:border-orange-200 group"
                      >
                        <div className="flex items-center gap-3 font-medium">
                          <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-orange-500">
                            <FileQuestion size={16} />
                          </div>
                          عرض بدل فاقد
                        </div>
                        <ChevronLeft size={16} className="text-orange-300 group-hover:text-orange-500" />
                      </Link>
                    )}
                  </div>
                )}

              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-sm border border-slate-100 rounded-2xl overflow-hidden">
              <CardContent className="p-6 text-center text-slate-400">
                <Building2 size={32} className="mx-auto mb-2 text-slate-200" />
                <p className="text-sm">لا يوجد تسجيل حالي لهذا الطالب</p>
              </CardContent>
            </Card>
          )}

          {/* إجراءات إضافية */}
          <Card className="shadow-sm border border-slate-100 rounded-2xl overflow-hidden bg-slate-50">
            <div className="p-5">
              <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wider">إجراءات إضافية</h3>
              <div className="space-y-3">
                <Link
                  to={`/academic/replacements?student_id=${id}&action=create`}
                  className="w-full flex items-center gap-3 p-3.5 bg-white border border-slate-200 rounded-xl hover:border-orange-300 hover:shadow-sm transition-all text-slate-700 hover:text-orange-600 font-medium group"
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 group-hover:bg-orange-100 flex items-center justify-center">
                    <FileQuestion size={18} />
                  </div>
                  إصدار بدل فاقد
                </Link>
                <Link
                  to={`/transfers?student_id=${id}&action=create`}
                  className="w-full flex items-center gap-3 p-3.5 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all text-slate-700 hover:text-blue-600 font-medium group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 group-hover:bg-blue-100 flex items-center justify-center">
                    <ArrowRightLeft size={18} />
                  </div>
                  إنشاء تحويل طالب
                </Link>
                <Link
                  to={`/temporary-admission?student_id=${id}&action=create`}
                  className="w-full flex items-center gap-3 p-3.5 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:shadow-sm transition-all text-slate-700 hover:text-emerald-600 font-medium group"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 group-hover:bg-emerald-100 flex items-center justify-center">
                    <Clock size={18} />
                  </div>
                  إنشاء قبول مؤقت
                </Link>
              </div>
            </div>
          </Card>

        </div>
      </div>

    </div>
  );
};
