import React, { useState } from 'react';
import { Download, Search, AlertTriangle, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Mock data based on the provided schema
const MOCK_ERRORS = [
  {
    id: 1,
    student_name: 'أحمد محمود صالح',
    field_name: 'تاريخ الميلاد',
    old_value: '2010-05-12',
    new_value: '2010-06-12',
    reason: 'خطأ مطبعي في السجل الورقي',
    academic_year: '2025 / 2026',
    school_name: 'مدرسة النور الابتدائية',
    class_name: 'الصف الخامس',
    created_by: 'محمد بالسود',
    created_at: '2026-04-29',
  },
  {
    id: 2,
    student_name: 'فاطمة علي أحمد',
    field_name: 'الرقم الوطني',
    old_value: '112233445566',
    new_value: '112233445577',
    reason: 'تحديث بيانات من السجل المدني',
    academic_year: '2025 / 2026',
    school_name: 'مدرسة الأمل الإعدادية',
    class_name: 'الصف الثامن',
    created_by: 'سالم عبدالله',
    created_at: '2026-04-28',
  }
];

export const StudentDataErrors: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState('2025 / 2026');
  const [searchQuery, setSearchQuery] = useState('');

  const handleExportExcel = () => {
    // Logic for exporting to excel would go here
    console.log('Exporting data for year:', selectedYear);
    alert('سيتم تصدير البيانات إلى ملف Excel قريباً');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <AlertTriangle className="text-amber-500" size={24} />
            سجل الأخطاء في بيانات الطلاب
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            عرض وتصدير سجل التعديلات والأخطاء المصححة في بيانات الطلاب حسب السنة الدراسية.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={handleExportExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
          >
            <Download size={18} />
            تصدير Excel
          </Button>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="بحث باسم الطالب أو الحقل..." 
              className="pr-10 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 text-sm">
            <Filter size={16} className="text-slate-400" />
            <span className="text-slate-600 font-medium">السنة الدراسية:</span>
            <select 
              className="bg-transparent border-none outline-none text-slate-800 font-bold pr-2 cursor-pointer"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="2025 / 2026">2025 / 2026</option>
              <option value="2024 / 2025">2024 / 2025</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <Table dir="rtl">
          <TableHeader className="bg-slate-50/80">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-bold text-slate-700 text-right w-[200px]">الطالب</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">الحقل المعدل</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">القيمة القديمة</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">القيمة الجديدة</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">السبب</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">المدرسة / الصف</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">بواسطة</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">التاريخ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_ERRORS.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-slate-500">
                  لا توجد سجلات أخطاء مطابقة للبحث أو السنة المحددة
                </TableCell>
              </TableRow>
            ) : (
              MOCK_ERRORS.map((error) => (
                <TableRow key={error.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium text-slate-800">{error.student_name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                      {error.field_name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-red-500 line-through text-sm opacity-70 block max-w-[120px] truncate" title={error.old_value}>
                      {error.old_value || '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-emerald-600 font-medium text-sm block max-w-[120px] truncate" title={error.new_value}>
                      {error.new_value || '—'}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm max-w-[150px] truncate" title={error.reason}>
                    {error.reason || '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-700">{error.school_name}</span>
                      <span className="text-xs text-slate-500">{error.class_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                        {error.created_by.substring(0, 1)}
                      </div>
                      <span className="text-sm text-slate-600">{error.created_by}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500" dir="ltr">
                    {error.created_at}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
