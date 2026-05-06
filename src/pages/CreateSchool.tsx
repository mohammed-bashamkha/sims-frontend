import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ChevronLeft } from 'lucide-react';
import { SchoolForm } from '@/components/schools/SchoolForm';
import { schoolService } from '@/services/schoolService';
import type { SchoolFormData } from '@/types/school';

export const CreateSchool: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: SchoolFormData) => {
    try {
      setIsLoading(true);
      await schoolService.createSchool(data);
      navigate('/schools');
    } catch (error) {
      console.error('Failed to create school:', error);
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
        <span className="text-slate-800 font-bold text-sm">إضافة مدرسة</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <div className="bg-primary/10 text-primary p-2 rounded-lg">
            <Building2 size={24} />
          </div>
          تسجيل مدرسة جديدة
        </h1>
        <p className="text-slate-500 mt-2">قم بإدخال بيانات المدرسة الجديدة ليتم إضافتها إلى النظام.</p>
      </div>

      <SchoolForm 
        onSubmit={handleSubmit} 
        isLoading={isLoading} 
      />

    </div>
  );
};
