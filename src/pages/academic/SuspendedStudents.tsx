import React, { useState, useEffect } from 'react';
import { UserX, Search, CheckCircle, AlertTriangle, UserCheck, School, GraduationCap, Loader2, ChevronRight, ChevronLeft, Filter } from 'lucide-react';
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
import { suspendedStudentService, type SuspendedEnrollment } from '@/services/suspendedStudentService';
import { academicYearService, type AcademicYear } from '@/services/academicYearService';
import { type PaginatedResponse } from '@/services/suspendedStudentService';

export const SuspendedStudents: React.FC = () => {
  const [records, setRecords] = useState<SuspendedEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginatedResponse<SuspendedEnrollment> | null>(null);
  
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<number | string>('');

  // Confirmation Modal State
  const [confirmingRecord, setConfirmingRecord] = useState<SuspendedEnrollment | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [restoreAction, setRestoreAction] = useState<'return_to_original' | 'permanent_transfer'>('return_to_original');

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  useEffect(() => {
    fetchSuspendedStudents();
  }, [selectedYearId, currentPage]);

  const fetchAcademicYears = async () => {
    try {
      const data = await academicYearService.getAcademicYears();
      setAcademicYears(data);
      const activeYear = data.find(y => y.status === 'active');
      if (activeYear) {
        setSelectedYearId(activeYear.id);
      }
    } catch (error) {
      console.error('Error fetching academic years:', error);
    }
  };

  const fetchSuspendedStudents = async () => {
    setIsLoading(true);
    try {
      const response = await suspendedStudentService.getSuspendedStudents({
        search: searchQuery,
        academic_year_id: selectedYearId ? Number(selectedYearId) : undefined,
        page: currentPage
      });
      setRecords(response.data);
      setPagination(response);
    } catch (error) {
      console.error('Error fetching suspended students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchSuspendedStudents();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleOpenConfirm = (record: SuspendedEnrollment) => {
    setConfirmingRecord(record);
    setRestoreAction('return_to_original');
  };

  const handleCloseConfirm = () => {
    setConfirmingRecord(null);
  };

  const handleActivate = async () => {
    if (!confirmingRecord) return;
    
    setIsActivating(true);
    try {
      await suspendedStudentService.restoreStudent(confirmingRecord.student_id, restoreAction);
      // Success toast is handled by axios interceptor
      setRecords(records.filter(r => r.student_id !== confirmingRecord.student_id));
      setConfirmingRecord(null);
      
      // If list becomes empty and we're not on page 1, go to previous page
      if (records.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchSuspendedStudents();
      }
    } catch (error) {
      console.error('Error restoring student:', error);
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <UserX className="text-red-500" size={24} />
            الطلاب الموقوفين (انتهاء القبول المؤقت)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            إدارة الطلاب الموقوفين بسبب انتهاء فترة قبولهم المؤقت، وإمكانية إعادتهم لمدارسهم الأصلية.
          </p>
        </div>
      </div>

      {/* Filter/Search */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="بحث باسم الطالب أو الرقم المدرسي..." 
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

      {/* Table view for Suspended Students */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table dir="rtl">
            <TableHeader className="bg-slate-50 border-b border-slate-200">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-slate-700 text-right py-4 px-6">اسم الطالب</TableHead>
                <TableHead className="font-bold text-slate-700 text-right py-4 px-6">المدرسة الحالية (المؤقتة)</TableHead>
                <TableHead className="font-bold text-slate-700 text-right py-4 px-6">المدرسة الأصلية</TableHead>
                <TableHead className="font-bold text-slate-700 text-right py-4 px-6">الصف الدراسي</TableHead>
                <TableHead className="font-bold text-slate-700 text-center py-4 px-6 w-[200px]">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-primary" size={40} />
                      <span className="font-bold">جاري تحميل البيانات...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16 text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <CheckCircle size={48} className="text-emerald-400 mb-4 opacity-50" />
                      <p className="text-lg font-bold text-slate-600">لا يوجد طلاب موقوفين</p>
                      <p className="text-sm">جميع سجلات الطلاب سليمة أو لم يتم العثور على نتائج للبحث.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow key={record.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="py-4 px-6">
                      <div>
                        <p className="font-bold text-slate-800">{record.student?.full_name || 'غير معروف'}</p>
                        <p className="text-xs text-slate-500 mt-0.5">رقم: <span dir="ltr">{record.student?.school_number || '-'}</span></p>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                        <School size={14} />
                        {record.school?.name || 'غير محدد'}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <School size={14} />
                        {record.original_school?.name || 'غير محدد'}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <span className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                        <GraduationCap size={16} className="text-slate-400" />
                        {record.school_class?.name || 'غير محدد'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center py-4 px-6">
                      <Button 
                        onClick={() => handleOpenConfirm(record)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 rounded-xl px-4 shadow-sm h-9"
                      >
                        <UserCheck size={16} />
                        تفعيل الطالب
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

      {/* Confirmation Modal */}
      {confirmingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-8">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <UserCheck size={32} />
              </div>
              
              <h3 className="text-2xl font-black text-center text-slate-800 mb-2">تأكيد تفعيل الطالب</h3>
              <p className="text-center text-slate-500 mb-6 leading-relaxed">
                يرجى تحديد الإجراء المناسب لتفعيل الطالب الموقوف <span className="font-bold text-slate-800">{confirmingRecord.student?.full_name}</span>
              </p>

              <div className="flex flex-col gap-3 mb-6">
                <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${restoreAction === 'return_to_original' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:border-emerald-200'}`}>
                  <input
                    type="radio"
                    name="restoreAction"
                    value="return_to_original"
                    checked={restoreAction === 'return_to_original'}
                    onChange={() => setRestoreAction('return_to_original')}
                    className="mt-1 w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="block font-bold text-slate-800 mb-1">إرجاع للمدرسة الأصلية</span>
                    <span className="text-sm text-slate-500">سيتم إلغاء القبول المؤقت وإعادته إلى مدرسته الأصلية.</span>
                  </div>
                </label>
                
                <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${restoreAction === 'permanent_transfer' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-blue-200'}`}>
                  <input
                    type="radio"
                    name="restoreAction"
                    value="permanent_transfer"
                    checked={restoreAction === 'permanent_transfer'}
                    onChange={() => setRestoreAction('permanent_transfer')}
                    className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="block font-bold text-slate-800 mb-1">تحويل دائم للمدرسة الحالية</span>
                    <span className="text-sm text-slate-500">سيتم تفعيل الطالب في مدرسته الحالية كتحويل دائم.</span>
                  </div>
                </label>
              </div>

              {restoreAction === 'return_to_original' && (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3 mb-8">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">المدرسة المؤقتة (الحالية):</span>
                    <span className="font-bold text-slate-700">{confirmingRecord.school?.name || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-3">
                    <span className="text-slate-500">المدرسة الأصلية (الوجهة):</span>
                    <span className="font-bold text-emerald-700">{confirmingRecord.original_school?.name || 'غير محدد'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-3">
                    <span className="text-slate-500">الصف الدراسي:</span>
                    <span className="font-bold text-slate-700">{confirmingRecord.school_class?.name || '-'}</span>
                  </div>
                </div>
              )}

              {restoreAction === 'permanent_transfer' && (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3 mb-8">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">المدرسة الحالية:</span>
                    <span className="font-bold text-blue-700">{confirmingRecord.school?.name || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-3">
                    <span className="text-slate-500">الصف الدراسي:</span>
                    <span className="font-bold text-slate-700">{confirmingRecord.school_class?.name || '-'}</span>
                  </div>
                </div>
              )}

              {restoreAction === 'return_to_original' && (!confirmingRecord.original_school || !confirmingRecord.original_school.name) && (
                <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm flex items-start gap-3 mb-8">
                  <AlertTriangle size={20} className="shrink-0 mt-0.5 text-amber-600" />
                  <p>
                    تنبيه: لا يمكن تحديد المدرسة الأصلية لهذا الطالب في السجلات. قد يؤدي تفعيله إلى مشاكل في التسجيل، يُنصح بمراجعة بياناته قبل التفعيل.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3 w-full">
                <Button 
                  onClick={handleCloseConfirm}
                  variant="outline"
                  className="flex-1 rounded-xl border-slate-200 text-slate-600 font-bold h-12"
                  disabled={isActivating}
                >
                  إلغاء
                </Button>
                <Button 
                  onClick={handleActivate}
                  className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 gap-2"
                  disabled={isActivating}
                >
                  {isActivating ? (
                    <span className="animate-pulse">جاري التفعيل...</span>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      تأكيد التفعيل
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
