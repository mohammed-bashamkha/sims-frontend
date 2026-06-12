import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ChevronLeft, Loader2 } from 'lucide-react';
import { StudentForm, type StudentFormData } from '@/components/students/StudentForm';
import api from '@/api/axios';
import { useFormErrors } from '@/hooks/useFormErrors';

export const CreateStudent: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { errors, clearErrors, handleApiError } = useFormErrors();
  
  const [options, setOptions] = useState<{
    schools: any[];
    classes: any[];
    years: any[];
  }>({ schools: [], classes: [], years: [] });

  useEffect(() => {
    const fetchOptions = async () => {
      setIsFetching(true);
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
        });
      } catch (error) {
        console.error('Error fetching options:', error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchOptions();
  }, []);

  const handleSubmit = async (data: StudentFormData) => {
    setIsLoading(true);
    clearErrors();
    try {
      await api.post('/students', data);
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
        <span className="text-slate-800 font-bold text-sm">طالب جديد</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <div className="bg-primary/10 text-primary p-2 rounded-lg">
            <UserPlus size={24} />
          </div>
          إضافة طالب جديد
        </h1>
        <p className="text-slate-500 mt-2">يرجى تعبئة كافة البيانات الأساسية للطالب والتحقق من صحتها قبل الحفظ.</p>
      </div>

      {isFetching ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <Loader2 className="animate-spin w-10 h-10 text-primary" />
          <p className="text-slate-500 font-medium">جاري تحميل خيارات النموذج...</p>
        </div>
      ) : (
        <StudentForm 
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
          schools={options.schools}
          classes={options.classes}
          years={options.years}
          errors={errors}
        />
      )}

    </div>
  );
};
