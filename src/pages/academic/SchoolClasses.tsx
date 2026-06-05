import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit, Trash2, Search, GraduationCap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/api/axios';
import { hasPermission } from '@/services/authService';
import { DeleteConfirmationModal } from '@/components/common/DeleteConfirmationModal';

interface Level {
  id: number;
  name: string;
}

interface SchoolClass {
  id: number;
  name: string;
  level_id: number;
  level?: Level;
  students_count?: number;
  subjects_count?: number;
}

export const SchoolClasses: React.FC = () => {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  
  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<SchoolClass | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    level_id: '',
  });

  const canManage = hasPermission('الصفوف.ادارة');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [classesRes, levelsRes] = await Promise.all([
        api.get('/school-classes'),
        api.get('/levels')
      ]);
      setClasses(classesRes.data);
      setLevels(levelsRes.data);
      
      // Set default level if creating and levels exist
      if (levelsRes.data.length > 0 && !formData.level_id) {
        setFormData(prev => ({ ...prev, level_id: levelsRes.data[0].id.toString() }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = classes.filter(c => c.name.includes(searchQuery));

  const handleOpenModal = (schoolClass?: SchoolClass) => {
    if (schoolClass) {
      setEditingClass(schoolClass);
      setFormData({
        name: schoolClass.name,
        level_id: schoolClass.level_id.toString(),
      });
    } else {
      setEditingClass(null);
      setFormData({
        name: '',
        level_id: levels.length > 0 ? levels[0].id.toString() : '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClass(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.level_id) {
      return;
    }

    setSubmitting(true);
    try {
      if (editingClass) {
        await api.put(`/school-classes/${editingClass.id}`, formData);
      } else {
        await api.post('/school-classes', formData);
      }
      await fetchData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving class:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (schoolClass: SchoolClass) => {
    setClassToDelete(schoolClass);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!classToDelete) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/school-classes/${classToDelete.id}`);
      setClasses(classes.filter(c => c.id !== classToDelete.id));
      setIsDeleteModalOpen(false);
      setClassToDelete(null);
    } catch (error) {
      console.error('Error deleting class:', error);
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
            <Layers className="text-primary" size={24} />
            إدارة الصفوف الدراسية
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            إضافة وتعديل الصفوف الدراسية التابعة لكل مرحلة.
          </p>
        </div>

        {canManage && (
          <Button 
            onClick={() => handleOpenModal()}
            className="bg-primary hover:bg-primary/90 text-white font-bold gap-2 rounded-xl px-6"
          >
            <Plus size={18} />
            إضافة صف جديد
          </Button>
        )}
      </div>

      {/* Filter/Search */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="بحث عن صف دراسي..." 
            className="pr-10 bg-white rounded-xl border-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grid view */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
          <p>جاري تحميل الصفوف الدراسية...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClasses.length === 0 ? (
            <div className="col-span-full py-20 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl">
              لا توجد صفوف دراسية مطابقة للبحث.
            </div>
          ) : (
            filteredClasses.map((schoolClass) => (
              <div key={schoolClass.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col relative group">
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-start">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">
                      <Layers size={20} />
                    </div>
                    <div>
                    <h3 className="text-lg font-bold text-slate-800">{schoolClass.name}</h3>
                  </div>
                </div>
                {canManage && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleOpenModal(schoolClass)}
                      className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="تعديل"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(schoolClass)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="حذف"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>

                <div className="grid grid-cols-1 gap-3 mt-2 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                  <GraduationCap size={16} className="text-slate-400 shrink-0" />
                  <span>المرحلة: <strong>{schoolClass.level?.name || 'غير محدد'}</strong></span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    {schoolClass.students_count || 0} طالب
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                    {schoolClass.subjects_count || 0} مادة
                  </span>
                </div>
              </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal for Create / Update */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" dir="rtl">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">
                {editingClass ? 'تعديل بيانات الصف' : 'إضافة صف جديد'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">اسم الصف <span className="text-red-500">*</span></label>
                <Input 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="مثال: الصف الأول"
                  className="border-slate-200 focus:border-primary focus:ring-primary/20 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">المرحلة الدراسية <span className="text-red-500">*</span></label>
                  <select 
                    name="level_id"
                    value={formData.level_id}
                    onChange={handleInputChange}
                    className="w-full flex h-10 items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="" disabled>اختر المرحلة</option>
                    {levels.map(level => (
                      <option key={level.id} value={level.id}>{level.name}</option>
                    ))}
                  </select>
              </div>

              <div className="flex items-center gap-3 pt-6 mt-6 border-t border-slate-100">
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    editingClass ? 'حفظ التعديلات' : 'إضافة'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1 rounded-xl text-slate-600 border-slate-200 hover:bg-slate-50">
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="حذف الصف الدراسي"
        message="هل أنت متأكد من رغبتك في حذف هذا الصف؟"
        itemName={classToDelete?.name}
        isLoading={isDeleting}
      />
    </div>
  );
};
