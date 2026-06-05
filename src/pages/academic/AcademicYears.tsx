import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit, Trash2, Search, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { academicYearService } from '@/services/academicYearService';
import type { AcademicYear, AcademicYearFormData } from '@/services/academicYearService';
import { DeleteConfirmationModal } from '@/components/common/DeleteConfirmationModal';
import { toast } from '@/store/toastStore';
import { Can } from '@/components/common/Can';
import { useFormErrors } from '@/hooks/useFormErrors';

export const AcademicYears: React.FC = () => {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [yearToDelete, setYearToDelete] = useState<AcademicYear | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const { errors, handleApiError, clearErrors } = useFormErrors();
  const [formData, setFormData] = useState<AcademicYearFormData>({
    year: '',
    start_date: '',
    end_date: '',
    status: 'inactive',
  });

  useEffect(() => {
    fetchYears();
  }, []);

  const fetchYears = async () => {
    try {
      setIsLoading(true);
      const data = await academicYearService.getAcademicYears();
      setYears(data);
    } catch (error) {
      console.error('Failed to fetch academic years:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredYears = years.filter(y => y.year.includes(searchQuery));

  const handleOpenModal = (year?: AcademicYear) => {
    if (year) {
      setEditingYear(year);
      setFormData({
        year: year.year,
        start_date: year.start_date,
        end_date: year.end_date,
        status: year.status,
      });
    } else {
      setEditingYear(null);
      setFormData({
        year: '',
        start_date: '',
        end_date: '',
        status: 'active', // Default new year to active
      });
    }
    clearErrors();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingYear(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      if (editingYear) {
        await academicYearService.updateAcademicYear(editingYear.id, formData);
        toast('تم تحديث السنة الدراسية بنجاح');
      } else {
        await academicYearService.createAcademicYear(formData);
        toast('تم إضافة السنة الدراسية بنجاح');
      }
      await fetchYears();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save academic year:', error);
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (year: AcademicYear) => {
    setYearToDelete(year);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!yearToDelete) return;
    try {
      setIsDeleting(true);
      await academicYearService.deleteAcademicYear(yearToDelete.id);
      toast('تم حذف السنة الدراسية بنجاح');
      setYears(prev => prev.filter(y => y.id !== yearToDelete.id));
      setIsDeleteModalOpen(false);
      setYearToDelete(null);
    } catch (error) {
      console.error('Failed to delete academic year:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="text-primary" size={24} />
            إدارة السنوات الدراسية
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            إضافة وتعديل السنوات الدراسية وتحديد السنة النشطة حالياً.
          </p>
        </div>

        <Can permission="السنوات_الدراسية.ادارة">
          <Button 
            onClick={() => handleOpenModal()}
            className="bg-primary hover:bg-primary/90 text-white font-bold gap-2 rounded-xl px-6"
          >
            <Plus size={18} />
            إضافة سنة جديدة
          </Button>
        </Can>
      </div>

      {/* Filter/Search */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="بحث عن سنة دراسية (مثال: 2025)..." 
            className="pr-10 bg-white rounded-xl border-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grid view */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl border border-slate-100">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-slate-500 font-medium">جاري جلب السنوات الدراسية...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredYears.length === 0 ? (
            <div className="col-span-full py-20 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl">
              لا توجد سنوات دراسية مطابقة للبحث.
            </div>
          ) : (
            filteredYears.map((year) => (
              <div key={year.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col relative overflow-hidden group">
                
                {/* Active Indicator Strip */}
                <div className={`absolute top-0 right-0 bottom-0 w-1.5 ${year.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>

                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight" dir="ltr">{year.year}</h3>
                    <div className="mt-2">
                      {year.status === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700">
                          <CheckCircle size={14} /> السنة الحالية (نشطة)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-600">
                          <XCircle size={14} /> غير نشطة
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Can permission="السنوات_الدراسية.ادارة">
                      <button 
                        onClick={() => handleOpenModal(year)}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(year)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 size={18} />
                      </button>
                    </Can>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-slate-50">
                  <div>
                    <span className="block text-xs font-medium text-slate-500 mb-1">تاريخ البداية</span>
                    <span className="text-sm font-bold text-slate-700" dir="ltr">{year.start_date}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-slate-500 mb-1">تاريخ النهاية</span>
                    <span className="text-sm font-bold text-slate-700" dir="ltr">{year.end_date}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Custom Modal for Create / Update */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" dir="rtl">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">
                {editingYear ? 'تعديل السنة الدراسية' : 'إضافة سنة دراسية جديدة'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">السنة الدراسية <span className="text-red-500">*</span></label>
                <Input 
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  placeholder="مثال: 2025/2026"
                  dir="ltr"
                  className="text-right border-slate-200 focus:border-primary focus:ring-primary/20 rounded-xl"
                />
                {errors.year && <span className="text-xs text-red-500 font-medium">{errors.year[0]}</span>}
                <p className="text-xs text-slate-500">الحد الأقصى 9 أحرف وتكون بصيغة YYYY/YYYY</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">تاريخ البداية <span className="text-red-500">*</span></label>
                  <Input 
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="border-slate-200 focus:border-primary focus:ring-primary/20 rounded-xl"
                  />
                  {errors.start_date && <span className="text-xs text-red-500 font-medium">{errors.start_date[0]}</span>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">تاريخ النهاية <span className="text-red-500">*</span></label>
                  <Input 
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="border-slate-200 focus:border-primary focus:ring-primary/20 rounded-xl"
                  />
                  {errors.end_date && <span className="text-xs text-red-500 font-medium">{errors.end_date[0]}</span>}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium text-slate-700">حالة السنة الدراسية</label>
                <select 
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full flex h-10 items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 font-medium"
                >
                  <option value="active">نشطة (السنة الحالية)</option>
                  <option value="inactive">غير نشطة (أرشيف)</option>
                </select>
                {formData.status === 'active' && (
                  <p className="text-xs font-medium text-emerald-600 bg-emerald-50 p-2 rounded-lg mt-2">
                    تفعيل هذه السنة سيجعلها السنة الافتراضية لجميع العمليات في النظام.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-6 mt-6 border-t border-slate-100">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl h-11"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : (editingYear ? 'حفظ التعديلات' : 'إضافة')}
                </Button>
                <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1 rounded-xl text-slate-600 border-slate-200 hover:bg-slate-50 h-11">
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="حذف السنة الدراسية"
        message={`هل أنت متأكد من حذف السنة الدراسية ${yearToDelete?.year}؟ لا يمكن التراجع عن هذا الإجراء.`}
        isLoading={isDeleting}
      />
    </div>
  );
};
