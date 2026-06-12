import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Download, UserPlus, MoreVertical, Eye, Edit, Trash2, UploadCloud, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Can } from '@/components/common/Can';
import { DeleteConfirmationModal } from '@/components/common/DeleteConfirmationModal';
import api from '@/api/axios';
import { toast } from '@/store/toastStore';

export const StudentRecord: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [students, setStudents] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch filter options (schools and classes)
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [schoolsRes, classesRes] = await Promise.all([
          api.get('/schools'),
          api.get('/school-classes')
        ]);
        setSchools(schoolsRes.data.data || schoolsRes.data);
        setClasses(classesRes.data.data || classesRes.data);
      } catch (error) {
        console.error('Error fetching filters:', error);
      }
    };
    fetchFilters();
  }, []);

  // Fetch students data
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/students', {
        params: {
          page: currentPage,
          search: searchQuery,
          school_id: selectedSchool || undefined,
          class_id: selectedClass || undefined
        }
      });
      setStudents(res.data.data);
      setTotalPages(res.data.meta?.last_page || 1);
      setTotalItems(res.data.meta?.total || res.data.data.length);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, selectedSchool, selectedClass]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleDeleteClick = (student: any) => {
    setStudentToDelete(student);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/students/${studentToDelete.id}`);
      toast('تم حذف الطالب بنجاح', 'success');
      fetchStudents();
    } catch (error: any) {
      toast(error.response?.data?.message || 'حدث خطأ أثناء حذف الطالب', 'error');
      console.error('Error deleting student:', error);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
    }
  };

  const handleFilter = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleFilter();
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold tracking-tight">سجل الطلاب</h1>
        <div className="flex gap-3">
          <Can permission="الطلاب.تصدير">
            <Button 
              variant="outline" 
              className="text-emerald-600 border-emerald-600 hover:bg-emerald-50 font-bold"
              onClick={() => navigate('/academic/export-students')}
            >
              <Download className="mr-2" size={18} />
              تصدير (Excel)
            </Button>
          </Can>
          <Can permission="الطلاب.استيراد">
            <Button variant="secondary" className="font-bold bg-slate-100 hover:bg-slate-200 text-slate-700" onClick={() => navigate('/students/import')}>
              <UploadCloud className="mr-2 text-primary" size={18} />
              استيراد بيانات
            </Button>
          </Can>
          <Can permission="الطلاب.انشاء">
            <Button className="font-bold" onClick={() => navigate('/students/create')}>
              <UserPlus className="mr-2" size={18} />
              تسجيل طالب جديد
            </Button>
          </Can>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 min-w-[250px] max-w-sm">
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="البحث باسم الطالب أو رقم الهوية..." 
            className="pl-4 pr-10 bg-background"
            dir="rtl"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <select 
            className="flex h-10 w-full sm:w-auto items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm mr-auto outline-none focus:ring-1 focus:ring-ring"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">جميع المراحل</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select 
            className="flex h-10 w-full sm:w-auto items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
          >
            <option value="">جميع المدارس</option>
            {schools.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <Button variant="secondary" className="font-medium bg-muted" onClick={handleFilter}>
            <Filter className="mr-2" size={18} />
            تصفية
          </Button>
        </div>
      </div>

      <div className="rounded-xl border shadow-sm bg-card overflow-hidden">
        <Table className="text-right whitespace-nowrap min-w-[800px]">
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50 text-right">
              <TableHead className="w-[50px] text-right"><Checkbox /></TableHead>
              <TableHead className="text-right cursor-pointer hover:text-foreground">رقم الهوية</TableHead>
              <TableHead className="text-right cursor-pointer hover:text-foreground">الاسم الرباعي</TableHead>
              <TableHead className="text-right cursor-pointer hover:text-foreground">المرحلة</TableHead>
              <TableHead className="text-right cursor-pointer hover:text-foreground">المدرسة</TableHead>
              <TableHead className="text-right cursor-pointer hover:text-foreground">تاريخ الميلاد</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                    <span className="text-muted-foreground">جاري تحميل الطلاب...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  لا يوجد طلاب مطابقين للبحث.
                </TableCell>
              </TableRow>
            ) : (
              students.map((s) => (
                <TableRow key={s.id} className="cursor-pointer transition-colors hover:bg-muted/30">
                  <TableCell><Checkbox /></TableCell>
                  <TableCell className="font-medium" dir="ltr">{s.school_number}</TableCell>
                  <TableCell className="text-primary hover:underline cursor-pointer font-medium" onClick={(e) => { e.stopPropagation(); navigate(`/students/${s.id}`); }}>
                    {s.full_name}
                  </TableCell>
                  <TableCell>{s.current_enrollment?.class_name || 'غير مسجل'}</TableCell>
                  <TableCell>{s.current_enrollment?.school_name || '-'}</TableCell>
                  <TableCell dir="ltr">{s.date_of_birth || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1.5 items-center">
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); navigate(`/students/${s.id}`); }} className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-muted"><Eye size={16}/></Button>
                      <DropdownMenu dir="rtl">
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-muted">
                            <MoreVertical size={16}/>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <Can permission="الطلاب.تحديث">
                            <DropdownMenuItem onClick={() => navigate(`/students/edit/${s.id}`)} className="cursor-pointer flex items-center gap-2">
                              <Edit size={16} />
                              <span>تعديل الطالب</span>
                            </DropdownMenuItem>
                          </Can>
                          <Can permission="الطلاب.حذف">
                            <DropdownMenuItem onClick={() => handleDeleteClick(s)} className="cursor-pointer text-red-600 focus:text-red-600 flex items-center gap-2">
                              <Trash2 size={16} />
                              <span>حذف الطالب</span>
                            </DropdownMenuItem>
                          </Can>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              عرض {students.length > 0 ? (currentPage - 1) * students.length + 1 : 0} إلى {Math.min(currentPage * (students.length > 0 ? students.length : 10), totalItems)} من {totalItems} طلاب
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                السابق
              </Button>
              <div className="text-sm font-medium px-2">
                {currentPage} / {totalPages}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                التالي
              </Button>
            </div>
          </div>
        )}
      </div>

      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="حذف سجل طالب"
        message="هل أنت متأكد من رغبتك في حذف سجل الطالب"
        itemName={studentToDelete?.full_name}
        isLoading={isDeleting}
      />
    </div>
  );
};

