import React, { useState } from 'react';
import { BookOpen, Plus, Edit, Trash2, Search, Layers, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Level {
  id: number;
  name: string;
}

interface SchoolClass {
  id: number;
  name: string;
  level_id: number;
}

interface Subject {
  id: number;
  name: string;
  level_id: number;
  school_class_id: number;
  school_class?: SchoolClass; // Relationship from backend
}

// Mock Data
const MOCK_LEVELS: Level[] = [
  { id: 1, name: 'التعليم الأساسي' },
  { id: 2, name: 'التعليم الثانوي' },
];

const MOCK_CLASSES: SchoolClass[] = [
  { id: 1, name: 'الصف الأول', level_id: 1 },
  { id: 2, name: 'الصف الثاني', level_id: 1 },
  { id: 3, name: 'الصف الثالث', level_id: 1 },
  { id: 4, name: 'الأول الثانوي', level_id: 2 },
  { id: 5, name: 'الثاني الثانوي', level_id: 2 },
];

const INITIAL_SUBJECTS: Subject[] = [
  { id: 1, name: 'القرآن الكريم', level_id: 1, school_class_id: 1, school_class: MOCK_CLASSES[0] },
  { id: 2, name: 'التربية الإسلامية', level_id: 1, school_class_id: 1, school_class: MOCK_CLASSES[0] },
  { id: 3, name: 'اللغة العربية', level_id: 1, school_class_id: 2, school_class: MOCK_CLASSES[1] },
  { id: 4, name: 'الرياضيات', level_id: 2, school_class_id: 4, school_class: MOCK_CLASSES[3] },
  { id: 5, name: 'الفيزياء', level_id: 2, school_class_id: 4, school_class: MOCK_CLASSES[3] },
];

export const Subjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    level_id: MOCK_LEVELS[0].id,
    school_class_id: MOCK_CLASSES.find(c => c.level_id === MOCK_LEVELS[0].id)?.id || 1,
  });

  const filteredSubjects = subjects.filter(s => s.name.includes(searchQuery));
  
  // Get available classes for the selected level
  const availableClasses = MOCK_CLASSES.filter(c => c.level_id === formData.level_id);

  const handleOpenModal = (subject?: Subject) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        name: subject.name,
        level_id: subject.level_id,
        school_class_id: subject.school_class_id,
      });
    } else {
      setEditingSubject(null);
      setFormData({
        name: '',
        level_id: MOCK_LEVELS[0].id,
        school_class_id: MOCK_CLASSES.find(c => c.level_id === MOCK_LEVELS[0].id)?.id || 1,
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
    
    if (name === 'level_id') {
      const newLevelId = Number(value);
      // Auto-select the first class of the new level
      const firstClassForLevel = MOCK_CLASSES.find(c => c.level_id === newLevelId);
      setFormData(prev => ({ 
        ...prev, 
        level_id: newLevelId,
        school_class_id: firstClassForLevel ? firstClassForLevel.id : prev.school_class_id
      }));
    } else if (name === 'school_class_id') {
      setFormData(prev => ({ ...prev, school_class_id: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('الرجاء إدخال اسم المادة');
      return;
    }

    const schoolClassObj = MOCK_CLASSES.find(c => c.id === formData.school_class_id);

    if (editingSubject) {
      // Update
      setSubjects(subjects.map(s => 
        s.id === editingSubject.id 
          ? { ...s, ...formData, school_class: schoolClassObj } 
          : s
      ));
    } else {
      // Create
      const newId = Math.max(0, ...subjects.map(s => s.id)) + 1;
      setSubjects([...subjects, { id: newId, ...formData, school_class: schoolClassObj }]);
    }
    
    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المادة الدراسية؟')) {
      setSubjects(subjects.filter(s => s.id !== id));
    }
  };

  // Helper to get level name
  const getLevelName = (levelId: number) => {
    return MOCK_LEVELS.find(l => l.id === levelId)?.name || 'غير محدد';
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

        <Button 
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-primary/90 text-white font-bold gap-2 rounded-xl px-6"
        >
          <Plus size={18} />
          إضافة مادة جديدة
        </Button>
      </div>

      {/* Filter/Search */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="بحث عن مادة دراسية..." 
            className="pr-10 bg-white rounded-xl border-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grid view */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSubjects.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl">
            لا توجد مواد دراسية مطابقة للبحث.
          </div>
        ) : (
          filteredSubjects.map((subject) => (
            <div key={subject.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col relative group">
              
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
                  <button 
                    onClick={() => handleOpenModal(subject)}
                    className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="تعديل"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(subject.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="حذف"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 mt-2 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Layers size={16} className="text-slate-400 shrink-0" />
                  <span>المرحلة: <strong>{getLevelName(subject.level_id)}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <GraduationCap size={16} className="text-slate-400 shrink-0" />
                  <span>الصف: <strong>{subject.school_class?.name || 'غير محدد'}</strong></span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for Create / Update */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" dir="rtl">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">
                {editingSubject ? 'تعديل بيانات المادة' : 'إضافة مادة جديدة'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">اسم المادة <span className="text-red-500">*</span></label>
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
                <label className="text-sm font-medium text-slate-700">المرحلة الدراسية <span className="text-red-500">*</span></label>
                <select 
                  name="level_id"
                  value={formData.level_id}
                  onChange={handleInputChange}
                  required
                  className="w-full flex h-10 items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {MOCK_LEVELS.map(level => (
                    <option key={level.id} value={level.id}>{level.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">الصف الدراسي <span className="text-red-500">*</span></label>
                <select 
                  name="school_class_id"
                  value={formData.school_class_id}
                  onChange={handleInputChange}
                  required
                  className="w-full flex h-10 items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  disabled={availableClasses.length === 0}
                >
                  {availableClasses.map(schoolClass => (
                    <option key={schoolClass.id} value={schoolClass.id}>{schoolClass.name}</option>
                  ))}
                </select>
                {availableClasses.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">لا توجد صفوف دراسية لهذه المرحلة</p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-6 mt-6 border-t border-slate-100">
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl">
                  {editingSubject ? 'حفظ التعديلات' : 'إضافة'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1 rounded-xl text-slate-600 border-slate-200 hover:bg-slate-50">
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
