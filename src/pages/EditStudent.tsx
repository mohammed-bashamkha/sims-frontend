import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserCog, ChevronLeft } from 'lucide-react';
import { StudentForm, type StudentFormData } from '@/components/students/StudentForm';

export const EditStudent: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [initialData, setInitialData] = useState<Partial<StudentFormData> | null>(null);

  useEffect(() => {
    // محاكاة جلب بيانات الطالب من الباك إند
    const fetchStudent = async () => {
      // setTimeout لمؤثر التحميل
      setTimeout(() => {
        setInitialData({
          school_number: '102930',
          seat_number: '99201',
          full_name: 'أحمد محمد علي سعيد',
          nationality: 'يمني',
          gender: 'male',
          date_of_birth: '2010-05-15',
          place_of_birth: 'المكلا',
          registration_date: '2025-08-01',
          school_id: '1',
          class_id: '1',
          academic_year_id: '1',
        });
      }, 500);
    };

    fetchStudent();
  }, [id]);

  const handleSubmit = async (data: StudentFormData) => {
    setIsLoading(true);
    // محاكاة الإرسال للباك إند
    setTimeout(() => {
      console.log(`Sending to API: PUT /api/students/${id}`, data);
      setIsLoading(false);
      alert('تم تعديل بيانات الطالب بنجاح!');
      navigate('/students');
    }, 1500);
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-8 flex flex-col gap-6">
      
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
          تعديل بيانات الطالب #{id}
        </h1>
        <p className="text-slate-500 mt-2">قم بتحديث بيانات الطالب. تذكر أن أي تغيير في الحقول الأساسية سيتطلب كتابة سبب التعديل ليتم حفظه في السجل.</p>
      </div>

      {initialData ? (
        <StudentForm 
          initialData={initialData} 
          onSubmit={handleSubmit} 
          isEditing={true} 
          isLoading={isLoading} 
        />
      ) : (
        <div className="flex justify-center p-12">
          <span className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full"></span>
        </div>
      )}

    </div>
  );
};
