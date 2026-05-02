import React, { useState } from 'react';
import {
  Search, Plus, CheckCircle2, XCircle, Clock, ArrowRight,
  School, FileText, Trash2, RefreshCw, Eye, User, Calendar,
  FileDown, Building2, CalendarRange
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// ─── Types ──────────────────────────────────────────────────────────────
type AdmissionStatus = 'pending' | 'approved' | 'rejected';

interface AdmissionRecord {
  id: number;
  student: { id: number; full_name: string; school_number: string };
  fromSchool: { name: string };
  toSchool: { name: string };
  schoolClass: { name: string };
  academicYear: { year: string };
  status: AdmissionStatus;
  request_date: string;
  start_date?: string;
  end_date?: string;
  reason?: string;
  based_on?: string;
}

// Allowed transitions — mirrors TransferAdmissionController@update
const ALLOWED: Record<AdmissionStatus, AdmissionStatus[]> = {
  pending:  ['approved', 'rejected'],
  rejected: ['pending', 'approved'],
  approved: ['rejected'],
};

const MOCK: AdmissionRecord[] = [
  {
    id: 1,
    student: { id: 101, full_name: 'أحمد محمود صالح', school_number: '2023001' },
    fromSchool: { name: 'مدرسة النور الابتدائية' },
    toSchool: { name: 'مدرسة الأمل' },
    schoolClass: { name: 'الصف الخامس' },
    academicYear: { year: '2025 / 2026' },
    status: 'pending',
    request_date: '2026-05-01',
    start_date: '2026-05-01',
    end_date: '2026-07-01',
    reason: 'لأسباب صحية مؤقتة',
    based_on: 'قرار طبي رقم 22',
  },
  {
    id: 2,
    student: { id: 102, full_name: 'فاطمة علي أحمد', school_number: '2023005' },
    fromSchool: { name: 'مدرسة الجيل الصاعد' },
    toSchool: { name: 'مدرسة التفوق' },
    schoolClass: { name: 'الصف الثامن' },
    academicYear: { year: '2025 / 2026' },
    status: 'approved',
    request_date: '2026-04-20',
    start_date: '2026-04-25',
    end_date: '2026-06-30',
  },
  {
    id: 3,
    student: { id: 103, full_name: 'خالد سعيد باعمر', school_number: '2023012' },
    fromSchool: { name: 'مدرسة الوحدة' },
    toSchool: { name: 'مدرسة النهضة' },
    schoolClass: { name: 'الصف الثالث' },
    academicYear: { year: '2025 / 2026' },
    status: 'rejected',
    request_date: '2026-04-15',
  },
];

// ─── Status Badge ────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: AdmissionStatus }> = ({ status }) => {
  if (status === 'approved') return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700"><CheckCircle2 size={13} />مقبول</span>;
  if (status === 'rejected') return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700"><XCircle size={13} />مرفوض</span>;
  return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700"><Clock size={13} />قيد الانتظار</span>;
};

// ─── Confirm Dialog ──────────────────────────────────────────────────────
const ConfirmDialog: React.FC<{
  message: string; confirmLabel: string; confirmClass: string;
  icon: React.ReactNode; onConfirm: () => void; onCancel: () => void;
}> = ({ message, confirmLabel, confirmClass, icon, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" dir="rtl">
    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 text-center space-y-5 animate-in zoom-in-95">
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto">{icon}</div>
      <p className="text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: message }} />
      <div className="flex gap-3">
        <Button onClick={onCancel} variant="outline" className="flex-1 h-11 rounded-xl font-bold">إلغاء</Button>
        <Button onClick={onConfirm} className={`flex-1 h-11 rounded-xl font-bold text-white gap-2 ${confirmClass}`}>
          {icon}{confirmLabel}
        </Button>
      </div>
    </div>
  </div>
);

// ─── Show View — تفاصيل القبول المؤقت ───────────────────────────────────
const ShowAdmission: React.FC<{ record: AdmissionRecord; onBack: () => void }> = ({ record, onBack }) => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <div className="flex items-center justify-between pb-4 border-b border-slate-200">
      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
        <CalendarRange className="text-primary" size={22} />
        تفاصيل طلب القبول المؤقت
      </h3>
      <div className="flex items-center gap-3">
        {/* PDF — فقط عند approved — GET /api/pdf/admission/{id} */}
        {record.status === 'approved' && (
          <a
            href={`/api/pdf/admission/${record.id}`}
            target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl shadow-sm transition-colors text-sm"
          >
            <FileDown size={16} />تصدير PDF
          </a>
        )}
        <Button onClick={onBack} variant="outline" className="gap-2 rounded-xl font-bold text-slate-600">
          رجوع للقائمة <ArrowRight size={16} />
        </Button>
      </div>
    </div>

    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Status Banner */}
      <div className={`px-8 py-4 flex items-center justify-between border-b ${
        record.status === 'approved' ? 'bg-emerald-50 border-emerald-100'
        : record.status === 'rejected' ? 'bg-red-50 border-red-100'
        : 'bg-amber-50 border-amber-100'
      }`}>
        <span className="text-sm font-bold text-slate-600">حالة الطلب</span>
        <StatusBadge status={record.status} />
      </div>

      <div className="p-8 space-y-8">
        {/* Student */}
        <div>
          <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><User size={15} />بيانات الطالب</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs text-slate-400 mb-1">اسم الطالب</p>
              <p className="font-bold text-slate-800 text-lg">{record.student.full_name}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs text-slate-400 mb-1">الرقم المدرسي</p>
              <p className="font-bold text-slate-800 font-mono" dir="ltr">{record.student.school_number}</p>
            </div>
          </div>
        </div>

        {/* Schools */}
        <div>
          <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><Building2 size={15} />بيانات المدارس</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><School size={12} />المدرسة الأصلية</p>
              <p className="font-bold text-slate-700">{record.fromSchool.name}</p>
            </div>
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
              <p className="text-xs text-primary/60 mb-1 flex items-center gap-1"><School size={12} />مدرسة القبول المؤقت</p>
              <p className="font-bold text-primary">{record.toSchool.name}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs text-slate-400 mb-1">الصف الدراسي</p>
              <p className="font-bold text-slate-700">{record.schoolClass.name}</p>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div>
          <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><Calendar size={15} />التواريخ</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs text-slate-400 mb-1">تاريخ الطلب</p>
              <p className="font-bold text-slate-700" dir="ltr">{record.request_date}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs text-slate-400 mb-1">تاريخ البداية</p>
              <p className="font-bold text-slate-700" dir="ltr">{record.start_date || '—'}</p>
            </div>
            <div className={`rounded-xl p-4 border ${record.end_date && new Date(record.end_date) < new Date() ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
              <p className="text-xs text-slate-400 mb-1">تاريخ الانتهاء</p>
              <p className={`font-bold ${record.end_date && new Date(record.end_date) < new Date() ? 'text-red-600' : 'text-slate-700'}`} dir="ltr">
                {record.end_date || '—'}
                {record.end_date && new Date(record.end_date) < new Date() && <span className="text-xs mr-2 font-normal">(منتهي)</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Reason / Based On */}
        {(record.reason || record.based_on) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {record.reason && (
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <p className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1"><FileText size={13} />سبب القبول المؤقت</p>
                <p className="text-slate-700 leading-relaxed">{record.reason}</p>
              </div>
            )}
            {record.based_on && (
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <p className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1"><FileText size={13} />بناءً على</p>
                <p className="text-slate-700 leading-relaxed">{record.based_on}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────
export const TemporaryAdmissions: React.FC = () => {
  const [records, setRecords] = useState<AdmissionRecord[]>(MOCK);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<AdmissionRecord | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ record: AdmissionRecord; targetStatus: AdmissionStatus } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdmissionRecord | null>(null);

  const filtered = records.filter(r =>
    r.student.full_name.includes(searchQuery) || r.student.school_number.includes(searchQuery)
  );

  const handleStatusUpdate = () => {
    if (!confirmAction) return;
    setRecords(prev => prev.map(r => r.id === confirmAction.record.id ? { ...r, status: confirmAction.targetStatus } : r));
    setConfirmAction(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setRecords(prev => prev.filter(r => r.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  if (viewingRecord) return <ShowAdmission record={viewingRecord} onBack={() => setViewingRecord(null)} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarRange className="text-primary" size={24} />
            إدارة طلبات القبول المؤقت
          </h2>
          <p className="text-sm text-slate-500 mt-1">قبول الطلاب مؤقتاً في مدارس أخرى لفترة زمنية محددة.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-sm">
          <Plus size={18} /> تسجيل قبول مؤقت جديد
        </Button>
      </div>

      {/* Search */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="relative w-full max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input placeholder="بحث باسم الطالب أو الرقم المدرسي..." className="pr-10 bg-white" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table dir="rtl">
            <TableHeader className="bg-slate-50 border-b border-slate-200">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-slate-700 text-right py-4 px-4">الطالب</TableHead>
                <TableHead className="font-bold text-slate-700 text-right py-4 px-4">المدرسة الأصلية</TableHead>
                <TableHead className="font-bold text-slate-700 text-right py-4 px-4">مدرسة القبول المؤقت</TableHead>
                <TableHead className="font-bold text-slate-700 text-right py-4 px-4">فترة القبول</TableHead>
                <TableHead className="font-bold text-slate-700 text-center py-4 px-4">الحالة</TableHead>
                <TableHead className="font-bold text-slate-700 text-center py-4 px-4 w-[220px]">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10 text-slate-500">لا توجد سجلات مطابقة.</TableCell></TableRow>
              ) : (
                filtered.map(r => {
                  const allowed = ALLOWED[r.status];
                  const canDelete = r.status !== 'approved';
                  const isExpired = r.end_date && new Date(r.end_date) < new Date();
                  return (
                    <TableRow key={r.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="py-3 px-4">
                        <p className="font-bold text-slate-800">{r.student.full_name}</p>
                        <p className="text-xs text-slate-500 font-mono" dir="ltr">{r.student.school_number}</p>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-sm text-slate-600">{r.fromSchool.name}</TableCell>
                      <TableCell className="py-3 px-4 text-sm font-bold text-primary">{r.toSchool.name}</TableCell>
                      <TableCell className="py-3 px-4">
                        {r.start_date && r.end_date ? (
                          <div className={`text-xs font-mono rounded-lg px-2 py-1 inline-block ${isExpired ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-100 text-slate-600'}`} dir="ltr">
                            {r.start_date} → {r.end_date}
                            {isExpired && <span className="mr-2 font-sans font-bold text-red-500">(منتهي)</span>}
                          </div>
                        ) : <span className="text-slate-400 text-xs">—</span>}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center"><StatusBadge status={r.status} /></TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => setViewingRecord(r)} title="عرض" className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-primary/10 hover:text-primary transition-colors"><Eye size={15} /></button>
                          {allowed.includes('approved') && (
                            <button onClick={() => setConfirmAction({ record: r, targetStatus: 'approved' })} title="قبول" className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"><CheckCircle2 size={15} /></button>
                          )}
                          {allowed.includes('rejected') && (
                            <button onClick={() => setConfirmAction({ record: r, targetStatus: 'rejected' })} title="رفض" className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"><XCircle size={15} /></button>
                          )}
                          {allowed.includes('pending') && (
                            <button onClick={() => setConfirmAction({ record: r, targetStatus: 'pending' })} title="إعادة فتح" className="p-1.5 rounded-lg bg-amber-50 text-amber-500 hover:bg-amber-100 transition-colors"><RefreshCw size={15} /></button>
                          )}
                          {/* حذف مخفي عند approved — متوافق مع destroy() في الكنترولر */}
                          {canDelete && (
                            <button onClick={() => setDeleteTarget(r)} title="حذف" className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create Modal — POST /api/admissions */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" dir="rtl">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Plus className="text-primary" size={22} />تسجيل قبول مؤقت جديد</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-red-500"><XCircle size={22} /></button>
            </div>
            <div className="p-6 space-y-5">
              {/* student_id */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-1"><User size={14} />ابحث عن الطالب <span className="text-red-500">*</span></label>
                <div className="relative"><Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><Input placeholder="اسم الطالب أو الرقم المدرسي..." className="pr-10" /></div>
              </div>
              {/* to_school_id */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-1"><School size={14} />مدرسة القبول المؤقت (الوجهة) <span className="text-red-500">*</span></label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-primary text-slate-700">
                  <option value="">-- اختر المدرسة --</option>
                  <option value="1">مدرسة التفوق</option>
                  <option value="2">مدرسة الأمل</option>
                </select>
              </div>
              {/* dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-1"><Calendar size={14} />تاريخ الطلب</label>
                  <Input type="date" className="bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">تاريخ البداية</label>
                  <Input type="date" className="bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">تاريخ الانتهاء</label>
                  <Input type="date" className="bg-slate-50" />
                </div>
              </div>
              {/* reason */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-1"><FileText size={14} />سبب القبول المؤقت</label>
                <textarea rows={3} placeholder="أدخل السبب..." className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-primary text-slate-700 resize-none" />
              </div>
              {/* based_on */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">بناءً على (قرار / وثيقة)</label>
                <Input placeholder="مثال: قرار طبي رقم 22" className="bg-slate-50" />
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button onClick={() => setIsCreateOpen(false)} className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl">حفظ الطلب</Button>
                <Button onClick={() => setIsCreateOpen(false)} variant="outline" className="flex-1 font-bold h-12 rounded-xl">إلغاء</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Confirm */}
      {confirmAction && (
        <ConfirmDialog
          message={`هل تريد <strong>${confirmAction.targetStatus === 'approved' ? 'قبول' : confirmAction.targetStatus === 'rejected' ? 'رفض' : 'إعادة فتح'}</strong> طلب الطالب <strong>${confirmAction.record.student.full_name}</strong>؟${confirmAction.targetStatus === 'approved' ? '<br/><small class="text-amber-600">سيتم تحديث بيانات التسجيل تلقائياً.</small>' : ''}`}
          confirmLabel={confirmAction.targetStatus === 'approved' ? 'قبول' : confirmAction.targetStatus === 'rejected' ? 'رفض' : 'إعادة فتح'}
          confirmClass={confirmAction.targetStatus === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : confirmAction.targetStatus === 'rejected' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'}
          icon={confirmAction.targetStatus === 'approved' ? <CheckCircle2 size={22} className="text-emerald-600" /> : confirmAction.targetStatus === 'rejected' ? <XCircle size={22} className="text-red-500" /> : <RefreshCw size={22} className="text-amber-500" />}
          onConfirm={handleStatusUpdate}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <ConfirmDialog
          message={`هل تريد حذف طلب القبول المؤقت للطالب <strong>${deleteTarget.student.full_name}</strong> نهائياً؟`}
          confirmLabel="حذف نهائياً"
          confirmClass="bg-red-600 hover:bg-red-700"
          icon={<Trash2 size={22} className="text-red-500" />}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
