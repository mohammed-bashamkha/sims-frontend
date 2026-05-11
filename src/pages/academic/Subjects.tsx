import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit, Trash2, Search, Layers, GraduationCap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { subjectService } from '@/services/subjectService';
import type { Subject, Level, SchoolClass, SubjectFormData } from '@/types/subject';
import { DeleteConfirmationModal } from '@/components/common/DeleteConfirmationModal';
import { toast } from '@/store/toastStore';
import { Can } from '@/components/common/Can';

export const Subjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    level_id: 0,
    selected_classes: [] as number[],
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSubjects();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchSubjects();
  }, [selectedLevel]);

  const fetchInitialData = async () => {
    try {
      const [levelsData, classesData] = await Promise.all([
        subjectService.getLevels(),
        subjectService.getClasses()
      ]);
      setLevels(levelsData);
      setClasses(classesData);
      
      if (levelsData.length > 0 && formData.level_id === 0) {
        setFormData(prev => ({ 
          ...prev, 
          level_id: levelsData[0].id,
          selected_classes: []
        }));
      }
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      setIsLoading(true);
      const params = {
        search: searchQuery,
        level_id: selectedLevel === 'all' ? undefined : selectedLevel
      };
      const subjectsData = await subjectService.getSubjects(params);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSubjects = subjects; // API handles filtering now
  
  // Get available classes for the selected level

  // Automatic Level Detection
  useEffect(() => {
    if (formData.selected_classes.length > 0) {
      // Find levels of selected classes
      const selectedLevelIds = formData.selected_classes.map(id => {
        return classes.find(c => c.id === id)?.level_id;
      }).filter(Boolean) as number[];

      if (selectedLevelIds.length > 0) {
        // Count occurrences of each level
        const counts: Record<number, number> = {};
        selectedLevelIds.forEach(id => { counts[id] = (counts[id] || 0) + 1; });
        
        // Find level with most classes (the "Primary" one for the database)
        const sortedLevels = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        const primaryLevelId = Number(sortedLevels[0][0]);
        
        if (primaryLevelId !== formData.level_id) {
          setFormData(prev => ({ ...prev, level_id: primaryLevelId }));
        }
      }
    }
  }, [formData.selected_classes, classes]);

  // Helper to get display name of detected levels
  const getDetectedLevelsName = () => {
    if (formData.selected_classes.length === 0) return 'سيتم التحديد تلقائياً';
    
    const uniqueLevelIds = Array.from(new Set(
      formData.selected_classes.map(id => classes.find(c => c.id === id)?.level_id).filter(Boolean)
    ));
    
    if (uniqueLevelIds.length === 0) return 'سيتم التحديد تلقائياً';
    
    return uniqueLevelIds
      .map(id => levels.find(l => l.id === id)?.name)
      .filter(Boolean)
      .join(' - ');
  };

  const handleOpenModal = (subject?: Subject) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        name: subject.name,
        level_id: subject.level_id,
        selected_classes: subject.school_classes?.map(c => c.id) || [],
      });
    } else {
      setEditingSubject(null);
      setFormData({
        name: '',
        level_id: levels[0]?.id || 0,
        selected_classes: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSubject(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClassToggle = (classId: number) => {
    setFormData(prev => ({
      ...prev,
      selected_classes: prev.selected_classes.includes(classId)
        ? prev.selected_classes.filter(id => id !== classId)
        : [...prev.selected_classes, classId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast('الرجاء إدخال اسم المادة', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const submitData: SubjectFormData = {
        name: formData.name,
        level_id: formData.level_id,
        school_class_id: formData.selected_classes
      };

      if (editingSubject) {
        await subjectService.updateSubject(editingSubject.id, submitData);
      } else {
        await subjectService.createSubject(submitData);
      }
      
      await fetchSubjects();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save subject:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (subject: Subject) => {
    setSubjectToDelete(subject);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!subjectToDelete) return;

    try {
      setIsDeleting(true);
      await subjectService.deleteSubject(subjectToDelete.id);
      setSubjects(prev => prev.filter(s => s.id !== subjectToDelete.id));
      setIsDeleteModalOpen(false);
      setSubjectToDelete(null);
    } catch (error: any) {
      console.error('Failed to delete subject:', error);
      // Errors are handled by axios interceptor toast
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
            <BookOpen className="text-primary" size={24} />
            إدارة المواد الدراسية
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            إضافة وتعديل المواد الدراسية لكل مرحلة وصف دراسي.
          </p>
        </div>

        <Can permission="المواد.اضافة">
          <Button 
            onClick={() => handleOpenModal()}
            className="bg-primary hover:bg-primary/90 text-white font-bold gap-2 rounded-xl px-6"
          >
            <Plus size={18} />
            إضافة مادة جديدة
          </Button>
        </Can>
      </div>

      {/* Filter/Search */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="بحث عن مادة دراسية..." 
            className="pr-10 bg-white rounded-xl border-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-sm font-bold text-slate-500 shrink-0">تصفية حسب المرحلة:</span>
          <select 
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[150px] font-medium"
          >
            <option value="all">الكل</option>
            {levels.map(level => (
              <option key={level.id} value={level.id}>{level.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid view */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl border border-slate-100">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-slate-500 font-medium">جاري جلب المواد الدراسية...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSubjects.length === 0 ? (
            <div className="col-span-full py-20 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl">
              لا توجد مواد دراسية مسجلة حالياً.
            </div>
          ) : (
            filteredSubjects.map((subject) => (
              <div key={subject.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col relative group">
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-start">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{subject.name}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Can permission="المواد.تعديل">
                      <button 
                        onClick={() => handleOpenModal(subject)}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <Edit size={18} />
                      </button>
                    </Can>
                    <Can permission="المواد.حذف">
                      <button 
                        onClick={() => handleDeleteClick(subject)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 size={18} />
                      </button>
                    </Can>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 mt-2 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Layers size={16} className="text-slate-400 shrink-0" />
                    <span>المرحلة: <strong>
                      {subject.school_classes && subject.school_classes.length > 0
                        ? Array.from(new Set(subject.school_classes.map(c => {
                            const level = levels.find(l => l.id === c.level_id);
                            return level?.name;
                          }))).filter(Boolean).join(' - ')
                        : (subject.level?.name || 'غير محدد')
                      }
                    </strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <GraduationCap size={16} className="text-slate-400 shrink-0" />
                    <span>الصف: <strong>{subject.school_classes?.map(c => c.name).join('، ') || 'غير محدد'}</strong></span>
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
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">
                {editingSubject ? 'تعديل بيانات المادة' : 'إضافة مادة جديدة'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <Plus className="rotate-45" size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                {/* Right Column: Basic Info */}
                <div className="md:col-span-2 space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">اسم المادة <span className="text-red-500">*</span></label>
                    <Input 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="مثال: الرياضيات"
                      required
                      className="border-slate-200 focus:border-primary focus:ring-primary/20 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">المرحلة الدراسية</label>
                    <div className="w-full flex h-10 items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2 text-sm font-bold text-primary">
                      {getDetectedLevelsName()}
                      <Layers size={16} className="text-primary/40" />
                    </div>
                    <p className="text-[10px] text-slate-400">يتم تحديد المرحلة تلقائياً بناءً على الصفوف المختارة.</p>
                  </div>

                  <div className="hidden md:block p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <p className="text-xs text-primary leading-relaxed font-medium">
                      * يرجى تحديد الصفوف الدراسية المرتبطة بهذه المادة من القائمة المجاورة. يمكنك اختيار صف واحد أو أكثر.
                    </p>
                  </div>
                </div>

                {/* Left Column: Class Selection */}
                <div className="md:col-span-3 space-y-3">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <GraduationCap className="text-primary" size={18} /> الصفوف الدراسية المرتبطة <span className="text-red-500">*</span>
                  </label>
                  
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 pl-2 py-1 scrollbar-thin scrollbar-thumb-slate-200 bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                    {levels.map(level => {
                      const levelClasses = classes.filter(c => c.level_id === level.id);
                      if (levelClasses.length === 0) return null;
                      
                      return (
                        <div key={level.id} className="space-y-2">
                          <h4 className="text-[10px] uppercase tracking-wider font-black text-slate-400 border-b border-slate-200/50 pb-1">{level.name}</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {levelClasses.map(schoolClass => (
                              <label 
                                key={schoolClass.id} 
                                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                                  formData.selected_classes.includes(schoolClass.id) 
                                    ? 'bg-white border-primary shadow-sm ring-1 ring-primary/10' 
                                    : 'bg-white border-slate-100 hover:border-slate-200'
                                }`}
                              >
                                <span className={`text-xs font-bold ${formData.selected_classes.includes(schoolClass.id) ? 'text-primary' : 'text-slate-600'}`}>
                                  {schoolClass.name}
                                </span>
                                <Checkbox 
                                  checked={formData.selected_classes.includes(schoolClass.id)}
                                  onCheckedChange={() => handleClassToggle(schoolClass.id)}
                                  className="border-slate-300 w-4 h-4"
                                />
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {formData.selected_classes.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">يجب اختيار صف دراسي واحد على الأقل</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-6 mt-8 border-t border-slate-100">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl h-11"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (editingSubject ? 'حفظ التعديلات' : 'إضافة المادة')}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCloseModal} 
                  className="flex-1 rounded-xl text-slate-600 border-slate-200 hover:bg-slate-50 h-11"
                >
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
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSubjectToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="حذف المادة الدراسية"
        message="هل أنت متأكد من رغبتك في حذف هذه المادة؟ سيؤدي هذا الإجراء إلى إزالة كافة البيانات المرتبطة بها نهائياً."
        itemName={subjectToDelete?.name}
        isLoading={isDeleting}
      />
    </div>
  );
};
