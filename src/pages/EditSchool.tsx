import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SchoolForm } from '@/components/schools/SchoolForm';
import { schoolService } from '@/services/schoolService';
import type { SchoolFormData } from '@/types/school';

export const EditSchool: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [initialData, setInitialData] = useState<Partial<SchoolFormData> | null>(null);

  useEffect(() => {
    const fetchSchool = async () => {
      if (!id) return;
      try {
        setIsFetching(true);
        const data = await schoolService.getSchool(id);
        setInitialData({
          name: data.name,
          school_type: data.school_type,
          capacity: data.capacity,
          address: data.address || '',
        });
      } catch (error) {
        console.error('Failed to fetch school details:', error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchSchool();
  }, [id]);

  const handleSubmit = async (data: SchoolFormData) => {
    if (!id) return;
    try {
      setIsLoading(true);
      await schoolService.updateSchool(id, data);
      navigate('/schools');
    } catch (error) {
      console.error('Failed to update school:', error);
    } finally {
      setIsLoading(false);
    }
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

      {isFetching ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-slate-100">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-slate-500 font-medium">جاري جلب بيانات المدرسة...</p>
        </div>
      ) : initialData ? (
        <SchoolForm 
          initialData={initialData} 
          onSubmit={handleSubmit} 
          isEditing={true} 
          isLoading={isLoading} 
        />
      ) : (
        <div className="bg-red-50 border border-red-100 p-8 rounded-3xl text-center">
          <p className="text-red-600 font-bold">عذراً، تعذر العثور على بيانات المدرسة.</p>
          <Button variant="link" onClick={() => navigate('/schools')} className="mt-2">
            العودة لقائمة المدارس
          </Button>
        </div>
      )}

    </div>
  );
};
