import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserCog, ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import { StudentForm, type StudentFormData } from '@/components/students/StudentForm';
import api from '@/api/axios';
import { toast } from '@/store/toastStore';
import { useFormErrors } from '@/hooks/useFormErrors';

export const EditStudent: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [initialData, setInitialData] = useState<Partial<StudentFormData> | null>(null);
  const [options, setOptions] = useState<{
    schools: any[];
    classes: any[];
    years: any[];
  }>({ schools: [], classes: [], years: [] });
  const { errors, clearErrors, handleApiError } = useFormErrors();

  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      try {
        // Fetch options and student data in parallel
        const [studentRes, schoolsRes, classesRes, yearsRes] = await Promise.all([
          api.get(`/students/${id}`),
          api.get('/schools'),
          api.get('/school-classes'),
          api.get('/academic-years')
        ]);

        const student = studentRes.data.data;
        
        setInitialData({
          school_number: student.school_number,
          seat_number: student.seat_number,
          full_name: student.full_name,
          nationality: student.nationality,
          gender: student.gender,
          date_of_birth: student.date_of_birth,
          place_of_birth: student.place_of_birth,
          registration_date: student.registration_date,
          school_id: student.current_enrollment?.school_id?.toString() || '',
          class_id: student.current_enrollment?.class_id?.toString() || '',
          academic_year_id: student.current_enrollment?.academic_year_id?.toString() || '',
          reason: '',
        });

        setOptions({
          schools: schoolsRes.data.data || schoolsRes.data,
          classes: classesRes.data.data || classesRes.data,
          years: yearsRes.data.data || yearsRes.data,
        });
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast('فشل في تحميل بيانات الطالب أو خيارات النموذج', 'error');
        navigate('/students');
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleSubmit = async (data: StudentFormData) => {
    setIsLoading(true);
    clearErrors();
    try {
      await api.put(`/students/${id}`, data);
      toast('تم تعديل بيانات الطالب بنجاح!', 'success');
      navigate('/students');
    } catch (error: any) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-8 flex flex-col gap-6" dir="rtl">
      
      {/* Header */}
      <div className="flex items-center gap-2 text-slate-500 mb-2">
        <button onClick={() => navigate('/students')} className="hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium">
          سجل الطلاب
        </button>
        <ChevronLeft size={16} />
        <span className="text-slate-800 font-bold text-sm">تعديل طالب</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <div className="bg-amber-100 text-amber-600 p-2 rounded-lg">
            <UserCog size={24} />
          </div>
          تعديل بيانات الطالب #{initialData?.full_name || id}
        </h1>
        <p className="text-slate-500 mt-2">قم بتحديث بيانات الطالب. تذكر أن أي تغيير في الحقول الأساسية سيتطلب كتابة سبب التعديل ليتم حفظه في السجل.</p>
      </div>

      {isFetching ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <Loader2 className="animate-spin w-10 h-10 text-primary" />
          <p className="text-slate-500 font-medium">جاري تحميل بيانات الطالب...</p>
        </div>
      ) : initialData ? (
        <StudentForm 
          initialData={initialData} 
          onSubmit={handleSubmit} 
          isEditing={true} 
          isLoading={isLoading}
          schools={options.schools}
          classes={options.classes}
          years={options.years}
          errors={errors}
        />
      ) : (
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl flex items-center gap-3 text-red-700">
          <AlertCircle size={24} />
          <p>تعذر تحميل بيانات الطالب. يرجى المحاولة مرة أخرى لاحقاً.</p>
        </div>
      )}

    </div>
  );
};
