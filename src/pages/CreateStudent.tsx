import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ChevronLeft } from 'lucide-react';
import { StudentForm, type StudentFormData } from '@/components/students/StudentForm';

export const CreateStudent: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: StudentFormData) => {
    setIsLoading(true);
    // محاكاة إرسال البيانات للباك إند
    setTimeout(() => {
      console.log('Sending to API: POST /api/students', data);
      setIsLoading(false);
      alert('تم إنشاء الطالب بنجاح!');
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

      <StudentForm onSubmit={handleSubmit} isLoading={isLoading} />

    </div>
  );
};
