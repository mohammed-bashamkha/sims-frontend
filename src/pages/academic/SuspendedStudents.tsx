import React, { useState } from 'react';
import { UserX, Search, CheckCircle, AlertTriangle, PlayCircle, School, GraduationCap } from 'lucide-react';
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

// Interfaces based on backend schema in SuspendedStudentController
interface SuspendedEnrollment {
  id: number;
  student_id: number;
  status: string;
  student: {
    id: number;
    full_name: string;
    school_number: string;
  };
  school: {
    name: string;
  };
  schoolClass: {
    name: string;
  };
  academicYear: {
    year: string;
  };
  original_school?: {
    name: string;
  };
}

// Mock Data representing the API response
const MOCK_SUSPENDED: SuspendedEnrollment[] = [
  {
    id: 1,
    student_id: 101,
    status: 'suspended',
    student: {
      id: 101,
      full_name: 'محمد سالم العمودي',
      school_number: '2023001',
    },
    school: { name: 'مدرسة النهضة (قبول مؤقت)' },
    schoolClass: { name: 'الصف الأول الثانوي' },
    academicYear: { year: '2023 / 2024' },
    original_school: { name: 'ثانوية المكلا النموذجية' },
  },
  {
    id: 2,
    student_id: 102,
    status: 'suspended',
    student: {
      id: 102,
      full_name: 'علي حسن العطاس',
      school_number: '2023055',
    },
    school: { name: 'مدرسة الجيل الصاعد (قبول مؤقت)' },
    schoolClass: { name: 'الصف الثامن الأساسي' },
    academicYear: { year: '2023 / 2024' },
    original_school: { name: 'مدرسة الجماهير' },
  }
];

export const SuspendedStudents: React.FC = () => {
  const [records, setRecords] = useState<SuspendedEnrollment[]>(MOCK_SUSPENDED);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Confirmation Modal State
  const [confirmingRecord, setConfirmingRecord] = useState<SuspendedEnrollment | null>(null);
  const [isActivating, setIsActivating] = useState(false);

  const filteredRecords = records.filter(r => 
    r.student.full_name.includes(searchQuery) || 
    r.student.school_number.includes(searchQuery)
  );

  const handleOpenConfirm = (record: SuspendedEnrollment) => {
    setConfirmingRecord(record);
  };

  const handleCloseConfirm = () => {
    setConfirmingRecord(null);
  };

  const handleActivate = () => {
    if (!confirmingRecord) return;
    
    // Simulate API Call to /suspended-students/{id}/restore
    setIsActivating(true);
    
    setTimeout(() => {
      setRecords(records.filter(r => r.student_id !== confirmingRecord.student_id));
      setIsActivating(false);
      setConfirmingRecord(null);
      
      // In a real app, you would show a toast notification here
      alert(`تم بنجاح تفعيل الطالب "${confirmingRecord.student.full_name}" وإعادته إلى "${confirmingRecord.original_school?.name || 'مدرسته الأساسية'}"`);
    }, 800);
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
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="بحث باسم الطالب أو الرقم المدرسي..." 
            className="pr-10 bg-white rounded-xl border-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
              {filteredRecords.length === 0 ? (
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
                filteredRecords.map((record) => (
                  <TableRow key={record.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="py-4 px-6">
                      <div>
                        <p className="font-bold text-slate-800">{record.student.full_name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">رقم: <span dir="ltr">{record.student.school_number}</span></p>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                        <School size={14} />
                        {record.school.name}
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
                        {record.schoolClass.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-center py-4 px-6">
                      <Button 
                        onClick={() => handleOpenConfirm(record)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 rounded-xl px-4 shadow-sm h-9"
                      >
                        <PlayCircle size={16} />
                        تفعيل وإعادة للطبيعي
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-8">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <PlayCircle size={32} />
              </div>
              
              <h3 className="text-2xl font-black text-center text-slate-800 mb-2">تأكيد تفعيل الطالب</h3>
              <p className="text-center text-slate-500 mb-6 leading-relaxed">
                هل أنت متأكد من رغبتك في تفعيل الطالب الموقوف <span className="font-bold text-slate-800">{confirmingRecord.student.full_name}</span>؟
                <br />
                سيتم إلغاء القبول المؤقت وإعادته إلى مدرسته الأصلية.
              </p>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3 mb-8">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">المدرسة الأصلية (الوجهة):</span>
                  <span className="font-bold text-emerald-700">{confirmingRecord.original_school?.name || 'غير محدد'}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-3">
                  <span className="text-slate-500">الصف الدراسي:</span>
                  <span className="font-bold text-slate-700">{confirmingRecord.schoolClass.name}</span>
                </div>
              </div>

              {(!confirmingRecord.original_school || !confirmingRecord.original_school.name) && (
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
