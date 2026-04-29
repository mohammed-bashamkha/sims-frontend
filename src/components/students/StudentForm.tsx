import React, { useState, useEffect } from 'react';
import { Save, User, Building2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// Mock Data for Dropdowns
const MOCK_SCHOOLS = [
  { id: 1, name: 'الزهراء للبنات' },
  { id: 2, name: 'المكلا النموذجية' },
  { id: 3, name: 'ثانوية ابن سيناء' },
];

const MOCK_CLASSES = [
  { id: 1, name: 'الصف الأول الثانوي' },
  { id: 2, name: 'الصف الثاني الثانوي' },
  { id: 3, name: 'الصف الثالث الثانوي' },
];

const MOCK_YEARS = [
  { id: 1, name: '2025/2026' },
  { id: 2, name: '2024/2025' },
];

export interface StudentFormData {
  school_number: string;
  seat_number: string;
  full_name: string;
  nationality: string;
  gender: string;
  date_of_birth: string;
  place_of_birth: string;
  registration_date: string;
  school_id: string;
  class_id: string;
  academic_year_id: string;
  reason?: string; // for edit mode
}

interface StudentFormProps {
  initialData?: Partial<StudentFormData>;
  onSubmit: (data: StudentFormData) => void;
  isEditing?: boolean;
  isLoading?: boolean;
}

export const StudentForm: React.FC<StudentFormProps> = ({ 
  initialData, 
  onSubmit, 
  isEditing = false,
  isLoading = false 
}) => {
  const [formData, setFormData] = useState<StudentFormData>({
    school_number: '',
    seat_number: '',
    full_name: '',
    nationality: 'يمني',
    gender: 'male',
    date_of_birth: '',
    place_of_birth: '',
    registration_date: new Date().toISOString().split('T')[0],
    school_id: '',
    class_id: '',
    academic_year_id: MOCK_YEARS[0].id.toString(),
    reason: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* البيانات الشخصية */}
        <Card className="lg:col-span-2 shadow-sm border-0 rounded-2xl overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center gap-2">
            <User className="text-primary" size={20} />
            <h3 className="font-bold text-slate-800">البيانات الشخصية</h3>
          </div>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="md:col-span-2 space-y-1">
              <label className="text-sm font-medium text-slate-700">الاسم الرباعي <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required 
                placeholder="الاسم الأول، اسم الأب، الجد، اللقب"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">الجنسية</label>
              <input 
                type="text" 
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">الجنس <span className="text-red-500">*</span></label>
              <select 
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">مكان الميلاد</label>
              <input 
                type="text" 
                name="place_of_birth"
                value={formData.place_of_birth}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">تاريخ الميلاد</label>
              <input 
                type="date" 
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            
          </CardContent>
        </Card>

        {/* البيانات الأكاديمية */}
        <div className="flex flex-col gap-6">
          <Card className="shadow-sm border-0 rounded-2xl overflow-hidden flex-1">
            <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center gap-2">
              <Building2 className="text-primary" size={20} />
              <h3 className="font-bold text-slate-800">بيانات القيد والتسجيل</h3>
            </div>
            <CardContent className="p-6 space-y-4">
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">الرقم المدرسي <span className="text-red-500">*</span></label>
                <input 
                  type="number" 
                  name="school_number"
                  value={formData.school_number}
                  onChange={handleChange}
                  required 
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">رقم الجلوس <span className="text-red-500">*</span></label>
                <input 
                  type="number" 
                  name="seat_number"
                  value={formData.seat_number}
                  onChange={handleChange}
                  required 
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">المدرسة <span className="text-red-500">*</span></label>
                <select 
                  name="school_id"
                  value={formData.school_id}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">اختر المدرسة...</option>
                  {MOCK_SCHOOLS.map(school => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">الصف <span className="text-red-500">*</span></label>
                <select 
                  name="class_id"
                  value={formData.class_id}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">اختر الصف...</option>
                  {MOCK_CLASSES.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">العام الدراسي <span className="text-red-500">*</span></label>
                <select 
                  name="academic_year_id"
                  value={formData.academic_year_id}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50"
                >
                  {MOCK_YEARS.map(year => (
                    <option key={year.id} value={year.id}>{year.name}</option>
                  ))}
                </select>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>

      {isEditing && (
        <Card className="shadow-sm border border-amber-200 bg-amber-50/30 rounded-2xl overflow-hidden">
          <div className="bg-amber-100/50 border-b border-amber-200 p-4 flex items-center gap-2">
            <AlertCircle className="text-amber-600" size={20} />
            <h3 className="font-bold text-amber-800">تأكيد التعديل</h3>
          </div>
          <CardContent className="p-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-amber-900">الرجاء إدخال سبب التعديل (مطلوب لحفظ السجل) <span className="text-red-500">*</span></label>
              <textarea 
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required={isEditing}
                rows={2}
                placeholder="مثال: تصحيح خطأ إملائي في اسم الطالب..."
                className="w-full border border-amber-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
              />
            </div>
          </CardContent>
        </Card>
      )}

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
          {isEditing ? 'حفظ التعديلات' : 'تسجيل الطالب'}
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
