import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Download, UserPlus, MoreVertical, Eye, ArrowRightLeft, Edit, Trash2, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Can } from '@/components/common/Can';

export const StudentRecord: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const mockStudents = [
    { id: 1, name: 'محمد أحمد محمود', idNumber: '1098765432', level: 'الصف الأول', school: 'مدرسة النهضة', status: 'نشط' },
    { id: 2, name: 'علي حسن علي', idNumber: '1098765433', level: 'الصف الثاني', school: 'مدرسة النور', status: 'نواقص في الملفات' },
    { id: 3, name: 'فاطمة إبراهيم خليل', idNumber: '1098765434', level: 'الصف الثالث', school: 'مدرسة النهضة', status: 'نشط' },
    { id: 4, name: 'خالد سعيد عبد الله', idNumber: '1098765435', level: 'الصف الرابع', school: 'مدرسة السلام', status: 'معلق' },
    { id: 5, name: 'عمر فهد عبد الرحمن', idNumber: '1098765436', level: 'الصف الأول', school: 'مدرسة النهضة', status: 'نشط' },
    { id: 6, name: 'نورة سالم محمد', idNumber: '1098765437', level: 'الصف الأول', school: 'مدرسة النور', status: 'نشط' },
    { id: 7, name: 'هند صالح سعد', idNumber: '1098765438', level: 'الصف الثاني', school: 'مدرسة السلام', status: 'نواقص في الملفات' },
    { id: 8, name: 'سعد عبد العزيز فهد', idNumber: '1098765439', level: 'الصف الثالث', school: 'مدرسة النهضة', status: 'نشط' },
    { id: 9, name: 'ياسر خالد حسن', idNumber: '1098765440', level: 'الصف الرابع', school: 'مدرسة النور', status: 'نشط' },
    { id: 10, name: 'ريما عبد الله سالم', idNumber: '1098765441', level: 'الصف الأول', school: 'مدرسة السلام', status: 'معلق' },
    { id: 11, name: 'عبد الرحمن محمد علي', idNumber: '1098765442', level: 'الصف الثاني', school: 'مدرسة النهضة', status: 'نشط' },
    { id: 12, name: 'سارة إبراهيم عمر', idNumber: '1098765443', level: 'الصف الثالث', school: 'مدرسة النور', status: 'نشط' },
  ];

  const totalPages = Math.ceil(mockStudents.length / itemsPerPage);
  const currentStudents = mockStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
      alert(`تم حذف الطالب رقم ${id}`);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold tracking-tight">سجل الطلاب</h1>
        <div className="flex gap-3">
          <Button variant="outline" className="text-emerald-600 border-emerald-600 hover:bg-emerald-50 font-bold">
            <Download className="mr-2" size={18} />
            تصدير (Excel)
          </Button>
          <Can permission="create_student">
            <Button variant="secondary" className="font-bold bg-slate-100 hover:bg-slate-200 text-slate-700" onClick={() => navigate('/students/import')}>
              <UploadCloud className="mr-2 text-primary" size={18} />
              استيراد بيانات
            </Button>
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
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <select className="flex h-10 w-full sm:w-auto items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm mr-auto outline-none focus:ring-1 focus:ring-ring">
            <option>جميع المراحل</option>
            <option>الصف الأول</option>
            <option>الصف الثاني</option>
          </select>
          <select className="flex h-10 w-full sm:w-auto items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring">
            <option>جميع المدارس</option>
            <option>مدرسة النهضة</option>
          </select>
          <select className="flex h-10 w-full sm:w-auto items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring">
            <option>الحالة</option>
            <option>نشط</option>
            <option>نواقص في الملفات</option>
            <option>معلق</option>
          </select>
          <Button variant="secondary" className="font-medium bg-muted">
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
              <TableHead className="text-right cursor-pointer hover:text-foreground">الحالة</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentStudents.map((s) => (
              <TableRow key={s.id} className="cursor-pointer transition-colors hover:bg-muted/30">
                <TableCell><Checkbox /></TableCell>
                <TableCell className="font-medium">{s.idNumber}</TableCell>
                <TableCell className="text-primary hover:underline cursor-pointer font-medium" onClick={(e) => { e.stopPropagation(); navigate(`/students/${s.id}`); }}>{s.name}</TableCell>
                <TableCell>{s.level}</TableCell>
                <TableCell>{s.school}</TableCell>
                <TableCell>
                  {s.status === 'نشط' && <Badge variant="default" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80 shadow-none border-none py-1">نشط</Badge>}
                  {s.status === 'نواقص في الملفات' && <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100/80 shadow-none border-none py-1">نواقص في الملفات</Badge>}
                  {s.status === 'معلق' && <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100/80 shadow-none border-none py-1">معلق</Badge>}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1.5 items-center">
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); navigate(`/students/${s.id}`); }} className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-muted"><Eye size={16}/></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-muted"><ArrowRightLeft size={16}/></Button>
                    <DropdownMenu dir="rtl">
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-muted">
                          <MoreVertical size={16}/>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <Can permission="edit_student">
                          <DropdownMenuItem onClick={() => navigate(`/students/edit/${s.id}`)} className="cursor-pointer flex items-center gap-2">
                            <Edit size={16} />
                            <span>تعديل الطالب</span>
                          </DropdownMenuItem>
                        </Can>
                        <Can permission="delete_student">
                          <DropdownMenuItem onClick={() => handleDelete(s.id)} className="cursor-pointer text-red-600 focus:text-red-600 flex items-center gap-2">
                            <Trash2 size={16} />
                            <span>حذف الطالب</span>
                          </DropdownMenuItem>
                        </Can>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              عرض {(currentPage - 1) * itemsPerPage + 1} إلى {Math.min(currentPage * itemsPerPage, mockStudents.length)} من {mockStudents.length} طلاب
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
    </div>
  );
};
