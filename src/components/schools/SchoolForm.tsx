import React, { useState, useEffect } from 'react';
import { Save, Building2, MapPin, Users, Settings2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface SchoolFormData {
  name: string;
  school_type: 'public' | 'private';
  capacity: number;
  address: string;
}

interface SchoolFormProps {
  initialData?: Partial<SchoolFormData>;
  onSubmit: (data: SchoolFormData) => void;
  isEditing?: boolean;
  isLoading?: boolean;
}

export const SchoolForm: React.FC<SchoolFormProps> = ({ 
  initialData, 
  onSubmit, 
  isEditing = false,
  isLoading = false 
}) => {
  const [formData, setFormData] = useState<SchoolFormData>({
    name: '',
    school_type: 'public',
    capacity: 500,
    address: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'capacity' ? (value === '' ? '' : Number(value)) : value 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* البيانات الأساسية */}
        <Card className="shadow-sm border-0 rounded-2xl overflow-hidden md:col-span-2">
          <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center gap-2">
            <Building2 className="text-primary" size={20} />
            <h3 className="font-bold text-slate-800">البيانات الأساسية للمدرسة</h3>
          </div>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-slate-700">اسم المدرسة <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required 
                placeholder="أدخل اسم المدرسة كاملاً"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Settings2 size={16} className="text-slate-400" />
                نوع المدرسة <span className="text-red-500">*</span>
              </label>
              <select 
                name="school_type"
                value={formData.school_type}
                onChange={handleChange}
                required
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
              >
                <option value="public">حكومية</option>
                <option value="private">خاصة / أهلية</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Users size={16} className="text-slate-400" />
                السعة الاستيعابية <span className="text-red-500">*</span>
              </label>
              <input 
                type="number" 
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                required 
                min="1"
                placeholder="عدد الطلاب الأقصى"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <MapPin size={16} className="text-slate-400" />
                العنوان
              </label>
              <input 
                type="text" 
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="المدينة - المديرية - الشارع"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            
          </CardContent>
        </Card>

      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
        <button 
          type="submit" 
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
        >
          {isLoading ? (
            <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span>
          ) : (
            <Save size={20} />
          )}
          {isEditing ? 'حفظ التعديلات' : 'تسجيل المدرسة'}
        </button>
        <button 
          type="button" 
          onClick={() => window.history.back()}
          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-2.5 rounded-xl font-medium transition-colors"
        >
          إلغاء
        </button>
      </div>

    </form>
  );
};
