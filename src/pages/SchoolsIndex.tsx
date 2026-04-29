import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Edit, MoreVertical, Building2, Users, MapPin, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const SchoolsIndex: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Adjust for grid

  // Mock data based on Laravel backend schema
  const mockSchools = [
    { id: 1, name: 'ثانوية المكلا النموذجية', school_type: 'public', capacity: 600, current_students: 580, address: 'المكلا - الديس' },
    { id: 2, name: 'مدرسة الجماهير للتعليم الأساسي', school_type: 'public', capacity: 850, current_students: 800, address: 'المكلا - الشرج' },
    { id: 3, name: 'مدارس النور الأهلية', school_type: 'private', capacity: 1200, current_students: 600, address: 'المكلا - فوه' },
    { id: 4, name: 'مدرسة بلقيس للبنات', school_type: 'public', capacity: 450, current_students: 445, address: 'المكلا - السلام' },
    { id: 5, name: 'أكاديمية الموهوبين', school_type: 'private', capacity: 300, current_students: 150, address: 'سيئون' },
    { id: 6, name: 'ثانوية بن شهاب', school_type: 'public', capacity: 700, current_students: 750, address: 'المكلا' },
    { id: 7, name: 'مدرسة الزهراء', school_type: 'public', capacity: 500, current_students: 400, address: 'الشحر' },
  ];

  const totalPages = Math.ceil(mockSchools.length / itemsPerPage);
  const currentSchools = mockSchools.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المدرسة؟ لن تتمكن من التراجع عن هذا الإجراء.')) {
      alert(`تم حذف المدرسة رقم ${id} بنجاح`);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
          <div className="bg-primary/10 text-primary p-2 rounded-lg">
            <Building2 size={24} />
          </div>
          إدارة المدارس
        </h1>
        <div className="flex gap-3">
          <Button className="font-bold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-sm px-6" onClick={() => navigate('/schools/create')}>
            <Plus className="mr-2" size={18} />
            إضافة مدرسة جديدة
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 min-w-[250px] max-w-sm">
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input 
            placeholder="البحث باسم المدرسة..." 
            className="pl-4 pr-10 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-primary/20 rounded-xl"
            dir="rtl"
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <select className="flex h-10 w-full sm:w-auto items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-600">
            <option value="">جميع الأنواع</option>
            <option value="public">حكومي</option>
            <option value="private">خاص / أهلي</option>
          </select>
          
          <Button variant="secondary" className="font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl">
            <Filter className="mr-2" size={18} />
            تصفية
          </Button>
        </div>
      </div>

      {/* Grid Layout for Schools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentSchools.map((school) => (
          <div key={school.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col group">
            <div className="p-5 border-b border-slate-50 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 mt-1">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg line-clamp-2 leading-tight">{school.name}</h3>
                  <div className="mt-2">
                    {school.school_type === 'public' ? (
                      <Badge variant="default" className="bg-blue-50 text-blue-700 hover:bg-blue-100 shadow-none border-none py-0.5 px-2.5 font-medium">حكومي</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100 shadow-none border-none py-0.5 px-2.5 font-medium">خاص</Badge>
                    )}
                  </div>
                </div>
              </div>
              <DropdownMenu dir="rtl">
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg -mr-2">
                    <MoreVertical size={16}/>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 rounded-xl border-slate-100 shadow-sm">
                  <DropdownMenuItem className="cursor-pointer flex items-center gap-2 text-slate-600 hover:text-primary focus:text-primary hover:bg-slate-50 focus:bg-slate-50">
                    <Building2 size={16} />
                    <span>التفاصيل</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(school.id)} className="cursor-pointer flex items-center gap-2 text-red-600 hover:text-red-700 focus:text-red-700 hover:bg-red-50 focus:bg-red-50">
                    <Trash2 size={16} />
                    <span>حذف المدرسة</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="p-5 flex-1 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 mt-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 flex items-center gap-1.5"><Users size={16} className="text-slate-400" /> الكثافة الطلابية</span>
                  <span className="font-bold text-slate-800">{school.current_students} <span className="text-slate-400 font-normal text-xs">/ {school.capacity}</span></span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${school.current_students / school.capacity >= 1 ? 'bg-red-500' : school.current_students / school.capacity > 0.8 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${Math.min((school.current_students / school.capacity) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin size={16} className="text-slate-400 shrink-0" />
                <span className="line-clamp-1">العنوان: <strong className="text-slate-800">{school.address || '—'}</strong></span>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl">
              <Button 
                variant="outline" 
                className="w-full text-slate-600 border-slate-200 hover:bg-white hover:text-primary hover:border-primary/30 transition-colors flex items-center justify-center gap-2 rounded-xl"
                onClick={() => navigate(`/schools/edit/${school.id}`)}
              >
                <Edit size={16}/>
                <span>تعديل بيانات المدرسة</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm mt-2">
          <div className="text-sm text-slate-500 font-medium">
            عرض {(currentPage - 1) * itemsPerPage + 1} إلى {Math.min(currentPage * itemsPerPage, mockSchools.length)} من {mockSchools.length} مدارس
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              السابق
            </Button>
            <div className="text-sm font-bold text-slate-700 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg shadow-sm">
              {currentPage}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              التالي
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
