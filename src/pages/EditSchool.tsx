import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, ChevronLeft } from 'lucide-react';
import { SchoolForm, type SchoolFormData } from '@/components/schools/SchoolForm';

export const EditSchool: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [initialData, setInitialData] = useState<Partial<SchoolFormData> | null>(null);

  useEffect(() => {
    // محاكاة جلب بيانات المدرسة من الباك إند
    const fetchSchool = async () => {
      // setTimeout لمؤثر التحميل
      setTimeout(() => {
        setInitialData({
          name: 'ثانوية المكلا النموذجية',
          school_type: 'public',
          capacity: 600,
          address: 'المكلا - الديس',
        });
      }, 500);
    };

    fetchSchool();
  }, [id]);

  const handleSubmit = async (data: SchoolFormData) => {
    setIsLoading(true);
    // محاكاة الإرسال للباك إند
    setTimeout(() => {
      console.log(`Sending to API: PUT /api/schools/${id}`, data);
      setIsLoading(false);
      alert('تم تعديل بيانات المدرسة بنجاح!');
      navigate('/schools');
    }, 1500);
  };

  return (
    <div className="max-w-[1000px] mx-auto pb-8 flex flex-col gap-6 w-full">
      
      {/* Header */}
      <div className="flex items-center gap-2 text-slate-500 mb-2">
        <button onClick={() => navigate('/schools')} className="hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium">
          إدارة المدارس
        </button>
        <ChevronLeft size={16} />
        <span className="text-slate-800 font-bold text-sm">تعديل مدرسة</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <div className="bg-amber-100 text-amber-600 p-2 rounded-lg">
            <Building2 size={24} />
          </div>
          تعديل بيانات المدرسة #{id}
        </h1>
        <p className="text-slate-500 mt-2">قم بتحديث بيانات المدرسة الحالية وحفظ التعديلات.</p>
      </div>

      {initialData ? (
        <SchoolForm 
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
