import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Search, AlertTriangle, Filter, Eye, ArrowRight, User, FileText, Calendar, School, Clock, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
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
import { errorService, type StudentError, type PaginatedResponse } from '@/services/errorService';
import { academicYearService, type AcademicYear } from '@/services/academicYearService';

export const StudentDataErrors: React.FC = () => {
  const [errors, setErrors] = useState<StudentError[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<number | string>('');
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginatedResponse<StudentError>['meta'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  
  const [viewMode, setViewMode] = useState<'list' | 'view_record'>('list');
  const [viewingRecord, setViewingRecord] = useState<StudentError | null>(null);


  useEffect(() => {
    fetchAcademicYears();
  }, []);

  useEffect(() => {
    fetchErrors();
  }, [selectedYearId, currentPage]);

  // Auto-open specific student's error when student_id is in the URL
  useEffect(() => {
    const studentId = searchParams.get('student_id');
    if (studentId && errors.length > 0 && viewMode === 'list') {
      const error = errors.find(e => e.student?.id === Number(studentId));
      if (error) handleView(error);
    }
  }, [searchParams, errors]);

  const fetchAcademicYears = async () => {
    try {
      const data = await academicYearService.getAcademicYears();
      setAcademicYears(data);
      // Set active year by default if available
      const activeYear = data.find(y => y.status === 'active');
      if (activeYear) {
        setSelectedYearId(activeYear.id);
      }
    } catch (error) {
      console.error('Error fetching academic years:', error);
    }
  };

  const fetchErrors = async () => {
    setIsLoading(true);
    try {
      const response = await errorService.getErrors({
        search: searchQuery,
        academic_year_id: selectedYearId ? Number(selectedYearId) : undefined,
        page: currentPage
      });
      setErrors(response.data);
      setPagination(response.meta);
    } catch (error) {
      console.error('Error fetching errors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchErrors();
  };

  const handleExportExcel = async () => {
    if (!selectedYearId) {
      alert('يرجى تحديد السنة الدراسية للتصدير');
      return;
    }
    setIsExporting(true);
    try {
      await errorService.exportErrors(Number(selectedYearId));
    } catch (error) {
      console.error('Error exporting errors:', error);
      alert('حدث خطأ أثناء تصدير البيانات');
    } finally {
      setIsExporting(false);
    }
  };

  const handleView = async (record: StudentError) => {
    setIsLoading(true);
    try {
      const details = await errorService.getErrorById(record.id);
      setViewingRecord(details);
      setViewMode('view_record');
    } catch (error) {
      console.error('Error fetching details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseView = () => {
    setViewingRecord(null);
    setViewMode('list');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // --------------------------------------------------------------------------------
  // VIEW: DETAILS RECORD
  // --------------------------------------------------------------------------------
  if (viewMode === 'view_record' && viewingRecord) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <h3 className="font-black text-2xl text-slate-800 flex items-center gap-3">
            <AlertTriangle size={28} className="text-amber-500" />
            سجل أخطاء الطالب
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
                <h2 className="text-3xl font-black text-slate-800">{viewingRecord.student.full_name}</h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                  <p className="text-slate-600 font-mono text-lg flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100" dir="ltr">
                    <span className="text-sm font-bold text-slate-400 uppercase">الرقم المدرسي:</span>
                    {viewingRecord.student.school_number}
                  </p>
                </div>
              </div>
            </div>

            {/* Multiple Errors Details */}
            <div className="pt-10 space-y-10">
              <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText className="text-primary" size={20} />
                الأخطاء المسجلة ({viewingRecord.all_errors?.length || 1})
              </h4>
              
              <div className="space-y-8">
                {(viewingRecord.all_errors || [viewingRecord]).map((error, idx) => (
                  <div key={error.id} className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 space-y-6">
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                      <span className="bg-slate-200 text-slate-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                        {idx + 1}
                      </span>
                      خطأ في حقل: {error.field_name}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">الحقل المعدل</p>
                        <p className="text-lg font-bold text-slate-800">{error.field_name}</p>
                      </div>
                      
                      <div className="bg-red-50/50 p-5 rounded-2xl border border-red-100 shadow-sm">
                        <p className="text-xs font-bold text-red-400 uppercase mb-2">قبل التصحيح</p>
                        <p className="text-lg font-bold text-red-700 line-through opacity-80">{error.old_value || '—'}</p>
                      </div>

                      <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 shadow-sm">
                        <p className="text-xs font-bold text-emerald-500 uppercase mb-2">بعد التصحيح</p>
                        <p className="text-lg font-bold text-emerald-700">{error.new_value || '—'}</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                      <p className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-amber-500" />
                        سبب التعديل
                      </p>
                      <p className="text-md text-slate-700 leading-relaxed">{error.reason || 'لا يوجد سبب مسجل'}</p>
                    </div>

                    <div className="flex items-center gap-6 pt-2 text-xs text-slate-400 font-bold border-t border-slate-50 mt-4">
                      <div className="flex items-center gap-2">
                        <User size={14} />
                        بواسطة: {error.created_by?.name || 'النظام'}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        بتاريخ: {new Intl.DateTimeFormat('ar-SA', { 
                          year: 'numeric', 
                          month: '2-digit', 
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        }).format(new Date(error.created_at))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Metadata Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-10 mt-10 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  <School size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">المدرسة / الصف</p>
                  <p className="font-bold text-slate-700 text-sm">
                    {viewingRecord.school?.name} - {viewingRecord.school_class?.name}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">العام الدراسي</p>
                  <p className="font-bold text-slate-700 text-sm" dir="ltr">{viewingRecord.academic_year?.year}</p>
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
            disabled={isExporting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 rounded-xl shadow-sm disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
            {isExporting ? 'جاري التصدير...' : 'تصدير Excel'}
          </Button>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="بحث باسم الطالب أو الرقم..." 
              className="pr-10 bg-white rounded-xl border-slate-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary" className="rounded-xl">
            بحث
          </Button>
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 text-sm w-full md:w-auto">
            <Filter size={16} className="text-slate-400" />
            <span className="text-slate-600 font-medium whitespace-nowrap">السنة الدراسية:</span>
            <select 
              className="bg-transparent border-none outline-none text-slate-800 font-bold pr-2 cursor-pointer w-full"
              value={selectedYearId}
              onChange={(e) => {
                setSelectedYearId(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">كل السنوات</option>
              {academicYears.map(year => (
                <option key={year.id} value={year.id}>{year.year}</option>
              ))}
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
                <TableHead className="font-bold text-slate-700 text-right py-4 px-6">المدرسة / الصف</TableHead>
                <TableHead className="font-bold text-slate-700 text-center py-4 px-6 w-[160px]">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20 text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-primary" size={40} />
                      <span className="font-bold">جاري تحميل البيانات...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : errors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-slate-500">
                    لا توجد سجلات مطابقة للبحث أو السنة المحددة
                  </TableCell>
                </TableRow>
              ) : (
                errors.map((error) => (
                  <TableRow key={error.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-bold text-slate-800 py-4 px-6">{error.student?.full_name}</TableCell>
                    <TableCell className="py-4 px-6">
                      <span className="font-mono text-slate-600 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100" dir="ltr">
                        {error.student?.school_number}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-6 font-medium text-slate-700">
                      {error.school?.name} - {error.school_class?.name}
                    </TableCell>
                    <TableCell className="text-center py-4 px-6">
                      <Button 
                        onClick={() => handleView(error)}
                        variant="ghost"
                        className="text-primary hover:bg-primary/10 hover:text-primary gap-2 font-bold"
                      >
                        <Eye size={18} />
                        عرض الأخطاء
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="text-sm text-slate-500">
              عرض {pagination.from} إلى {pagination.to} من إجمالي {pagination.total} سجل
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="gap-1 rounded-lg"
              >
                <ChevronRight size={16} />
                السابق
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === pagination.last_page || Math.abs(p - currentPage) <= 1)
                  .map((p, i, arr) => (
                    <React.Fragment key={p}>
                      {i > 0 && arr[i-1] !== p - 1 && <span className="px-2 text-slate-400">...</span>}
                      <Button
                        variant={currentPage === p ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(p)}
                        className={`w-9 h-9 p-0 rounded-lg ${currentPage === p ? 'shadow-md shadow-primary/20' : ''}`}
                      >
                        {p}
                      </Button>
                    </React.Fragment>
                  ))
                }
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.last_page}
                className="gap-1 rounded-lg"
              >
                التالي
                <ChevronLeft size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
