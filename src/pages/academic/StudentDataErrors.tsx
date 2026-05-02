import React, { useState } from 'react';
import { Download, Search, AlertTriangle, Filter, Eye, ArrowRight, User, FileText, Calendar, School, Clock } from 'lucide-react';
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
    school_number: '100101',
    seat_number: '5501',
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
    school_number: '100102',
    seat_number: '5502',
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
  
  const [viewMode, setViewMode] = useState<'list' | 'view_record'>('list');
  const [viewingRecord, setViewingRecord] = useState<any>(null);

  const handleExportExcel = () => {
    console.log('Exporting data for year:', selectedYear);
    alert('سيتم تصدير البيانات إلى ملف Excel قريباً');
  };

  const handleView = (record: any) => {
    setViewingRecord(record);
    setViewMode('view_record');
  };

  const handleCloseView = () => {
    setViewingRecord(null);
    setViewMode('list');
  };

  const filteredErrors = MOCK_ERRORS.filter(error => 
    error.student_name.includes(searchQuery) || 
    error.school_number.includes(searchQuery) ||
    error.seat_number.includes(searchQuery)
  );

  // --------------------------------------------------------------------------------
  // VIEW: DETAILS RECORD
  // --------------------------------------------------------------------------------
  if (viewMode === 'view_record' && viewingRecord) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <h3 className="font-black text-2xl text-slate-800 flex items-center gap-3">
            <AlertTriangle size={28} className="text-amber-500" />
            تفاصيل خطأ بيانات الطالب
          </h3>
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleCloseView} 
              variant="outline"
              className="text-slate-600 border-slate-300 hover:bg-slate-100 font-bold rounded-xl px-6 gap-2"
            >
              رجوع لسجل الأخطاء
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
          
          <div className="p-8 md:p-12 relative z-10">
            {/* Header: Student Info */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 border-b border-slate-100 pb-10">
              <div className="shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-slate-50 border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                <User size={48} className="text-slate-300" />
              </div>

              <div className="text-center md:text-right space-y-4 flex-1 py-2">
                <h2 className="text-3xl font-black text-slate-800">{viewingRecord.student_name}</h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                  <p className="text-slate-600 font-mono text-lg flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100" dir="ltr">
                    <span className="text-sm font-bold text-slate-400 uppercase">الرقم المدرسي:</span>
                    {viewingRecord.school_number}
                  </p>
                  <p className="text-slate-600 font-mono text-lg flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100" dir="ltr">
                    <span className="text-sm font-bold text-slate-400 uppercase">رقم الجلوس:</span>
                    {viewingRecord.seat_number}
                  </p>
                </div>
              </div>
            </div>

            {/* Error Details */}
            <div className="pt-10">
              <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <FileText className="text-primary" size={20} />
                تفاصيل التعديل / الخطأ
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <p className="text-sm font-bold text-slate-400 uppercase mb-2">الحقل المعدل</p>
                  <p className="text-lg font-bold text-slate-800">{viewingRecord.field_name}</p>
                </div>
                
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                  <p className="text-sm font-bold text-red-400 uppercase mb-2">القيمة القديمة (الخاطئة)</p>
                  <p className="text-lg font-bold text-red-700 line-through opacity-80">{viewingRecord.old_value || '—'}</p>
                </div>

                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                  <p className="text-sm font-bold text-emerald-500 uppercase mb-2">القيمة الجديدة (الصحيحة)</p>
                  <p className="text-lg font-bold text-emerald-700">{viewingRecord.new_value || '—'}</p>
                </div>
              </div>

              <div className="mt-6 bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <p className="text-sm font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-amber-500" />
                  سبب التعديل
                </p>
                <p className="text-lg text-slate-700 leading-relaxed">{viewingRecord.reason}</p>
              </div>
            </div>

            {/* Metadata Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-10 mt-10 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  <School size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">المدرسة / الصف</p>
                  <p className="font-bold text-slate-700 text-sm">{viewingRecord.school_name} - {viewingRecord.class_name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">العام الدراسي</p>
                  <p className="font-bold text-slate-700 text-sm" dir="ltr">{viewingRecord.academic_year}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">تم التعديل بواسطة</p>
                  <p className="font-bold text-slate-700 text-sm">{viewingRecord.created_by}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">تاريخ التعديل</p>
                  <p className="font-bold text-slate-700 text-sm" dir="ltr">{viewingRecord.created_at}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------------
  // VIEW: MAIN LIST
  // --------------------------------------------------------------------------------
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <AlertTriangle className="text-amber-500" size={24} />
            سجل الأخطاء في بيانات الطلاب
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            عرض الأخطاء والتعديلات التي تمت على بيانات الطلاب.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={handleExportExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 rounded-xl shadow-sm"
          >
            <Download size={18} />
            تصدير Excel
          </Button>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="بحث باسم الطالب أو الرقم..." 
              className="pr-10 bg-white rounded-xl border-slate-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 text-sm">
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

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table dir="rtl">
            <TableHeader className="bg-slate-50 border-b border-slate-200">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-slate-700 text-right py-4 px-6">اسم الطالب</TableHead>
                <TableHead className="font-bold text-slate-700 text-right py-4 px-6">الرقم المدرسي</TableHead>
                <TableHead className="font-bold text-slate-700 text-right py-4 px-6">رقم الجلوس</TableHead>
                <TableHead className="font-bold text-slate-700 text-center py-4 px-6 w-[160px]">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {filteredErrors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-slate-500">
                    لا توجد سجلات مطابقة للبحث أو السنة المحددة
                  </TableCell>
                </TableRow>
              ) : (
                filteredErrors.map((error) => (
                  <TableRow key={error.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-bold text-slate-800 py-4 px-6">{error.student_name}</TableCell>
                    <TableCell className="py-4 px-6">
                      <span className="font-mono text-slate-600 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100" dir="ltr">
                        {error.school_number}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <span className="font-mono text-slate-600 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100" dir="ltr">
                        {error.seat_number}
                      </span>
                    </TableCell>
                    <TableCell className="text-center py-4 px-6">
                      <Button 
                        onClick={() => handleView(error)}
                        variant="ghost"
                        className="text-primary hover:bg-primary/10 hover:text-primary gap-2 font-bold"
                      >
                        <Eye size={18} />
                        عرض التفاصيل
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
