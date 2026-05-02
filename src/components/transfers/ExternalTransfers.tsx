import React, { useState } from 'react';
import {
  Search, UserPlus, CheckCircle2, XCircle, Clock, Globe, ArrowRight,
  School, User, Calendar, MapPin, FileText, Eye, Trash2, RefreshCw, Building2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

type TransferStatus = 'pending' | 'approved' | 'rejected';

interface ExternalTransferRecord {
  id: number;
  student: {
    full_name: string; school_number: string; seat_number?: string;
    gender?: string; nationality?: string; date_of_birth?: string; place_of_birth?: string;
  };
  from_external_school_name: string;
  toSchool: { name: string };
  schoolClass: { name: string };
  academicYear: { year: string };
  status: TransferStatus;
  request_date: string;
  reason?: string;
}

const ALLOWED_TRANSITIONS: Record<TransferStatus, TransferStatus[]> = {
  pending:  ['approved', 'rejected'],
  rejected: ['pending', 'approved'],
  approved: ['rejected'],
};

const MOCK_EXTERNAL: ExternalTransferRecord[] = [
  {
    id: 1,
    student: {
      full_name: 'عمر خالد صالح',
      school_number: '2023099',
      seat_number: '9901',
      gender: 'ذكر',
      nationality: 'يمني',
      date_of_birth: '2010-03-15',
      place_of_birth: 'صنعاء',
    },
    from_external_school_name: 'مدرسة الوحدة الأساسية (صنعاء)',
    toSchool: { name: 'مدرسة التفوق' },
    schoolClass: { name: 'الصف الأول الثانوي' },
    academicYear: { year: '2025 / 2026' },
    status: 'approved',
    request_date: '2026-05-01',
    reason: 'انتقال الأسرة من المحافظة',
  },
  {
    id: 2,
    student: {
      full_name: 'ليلى أحمد باناجة',
      school_number: '2023110',
      seat_number: '9902',
      gender: 'أنثى',
      nationality: 'يمنية',
      date_of_birth: '2011-07-22',
      place_of_birth: 'عدن',
    },
    from_external_school_name: 'مدرسة الإصلاح بعدن',
    toSchool: { name: 'مدرسة الأمل' },
    schoolClass: { name: 'الصف الثاني الإعدادي' },
    academicYear: { year: '2025 / 2026' },
    status: 'pending',
    request_date: '2026-04-28',
  },
];

const StatusBadge: React.FC<{ status: TransferStatus }> = ({ status }) => {
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

// ─── Show View ───────────────────────────────────────────────────────────
const ShowExternal: React.FC<{ record: ExternalTransferRecord; onBack: () => void }> = ({ record, onBack }) => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <div className="flex items-center justify-between pb-4 border-b border-slate-200">
      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
        <Globe className="text-indigo-600" size={22} />
        تفاصيل طالب وافد من خارج المحافظة
      </h3>
      <Button onClick={onBack} variant="outline" className="gap-2 rounded-xl font-bold text-slate-600">
        رجوع للقائمة <ArrowRight size={16} />
      </Button>
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
        {/* Student Personal Info */}
        <div>
          <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><User size={15} />البيانات الشخصية للطالب</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'الاسم الكامل', value: record.student.full_name },
              { label: 'الرقم المدرسي', value: record.student.school_number, ltr: true },
              { label: 'رقم الجلوس', value: record.student.seat_number, ltr: true },
              { label: 'الجنس', value: record.student.gender },
              { label: 'الجنسية', value: record.student.nationality },
              { label: 'تاريخ الميلاد', value: record.student.date_of_birth, ltr: true },
              { label: 'مكان الميلاد', value: record.student.place_of_birth },
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                <p className={`font-bold text-slate-800 ${item.ltr ? 'font-mono' : ''}`} dir={item.ltr ? 'ltr' : undefined}>{item.value || '—'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Transfer Info */}
        <div>
          <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><Building2 size={15} />بيانات التحويل</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 md:col-span-3">
              <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Globe size={12} />المدرسة السابقة (خارجية)</p>
              <p className="font-bold text-slate-700">{record.from_external_school_name}</p>
            </div>
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
              <p className="text-xs text-indigo-400 mb-1 flex items-center gap-1"><School size={12} />موجه إلى مدرسة</p>
              <p className="font-bold text-indigo-700">{record.toSchool.name}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs text-slate-400 mb-1">الصف الدراسي</p>
              <p className="font-bold text-slate-700">{record.schoolClass.name}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Calendar size={12} />تاريخ الطلب</p>
              <p className="font-bold text-slate-700" dir="ltr">{record.request_date}</p>
            </div>
          </div>
        </div>

        {record.reason && (
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
            <p className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-2"><FileText size={13} />سبب التحويل</p>
            <p className="text-slate-700 leading-relaxed">{record.reason}</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────
export const ExternalTransfers: React.FC = () => {
  const [records, setRecords] = useState<ExternalTransferRecord[]>(MOCK_EXTERNAL);
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
  const [viewingRecord, setViewingRecord] = useState<ExternalTransferRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ record: ExternalTransferRecord; targetStatus: TransferStatus } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExternalTransferRecord | null>(null);

  const filtered = records.filter(r =>
    r.student.full_name.includes(searchQuery) || r.from_external_school_name.includes(searchQuery)
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

  if (viewingRecord) {
    return <ShowExternal record={viewingRecord} onBack={() => setViewingRecord(null)} />;
  }

  if (viewMode === 'create') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <UserPlus className="text-indigo-600" size={22} />
            تسجيل طالب وافد من خارج المحافظة
          </h3>
          <Button onClick={() => setViewMode('list')} variant="outline" className="gap-2 rounded-xl font-bold text-slate-600">
            رجوع للقائمة <ArrowRight size={16} />
          </Button>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <form className="space-y-8">
            <div>
              <h4 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-5"><User className="text-slate-400" size={18} />البيانات الأساسية للطالب</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  { label: 'الاسم الرباعي', placeholder: 'أدخل اسم الطالب رباعياً', required: true },
                  { label: 'الرقم المدرسي / الوطني', placeholder: 'أدخل الرقم', required: true },
                  { label: 'رقم الجلوس', placeholder: 'أدخل رقم الجلوس', required: true },
                  { label: 'الجنسية', placeholder: 'مثال: يمني', required: true, defaultValue: 'يمني' },
                  { label: 'مكان الميلاد', placeholder: 'مكان الميلاد', required: true },
                ].map((f, i) => (
                  <div key={i} className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">{f.label} {f.required && <span className="text-red-500">*</span>}</label>
                    <Input placeholder={f.placeholder} defaultValue={f.defaultValue} className="bg-slate-50" />
                  </div>
                ))}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الجنس <span className="text-red-500">*</span></label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-primary text-slate-700">
                    <option value="male">ذكر</option><option value="female">أنثى</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-1"><Calendar size={13} />تاريخ الميلاد <span className="text-red-500">*</span></label>
                  <Input type="date" className="bg-slate-50" />
                </div>
              </div>
            </div>
            <hr className="border-slate-100" />
            <div>
              <h4 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-5"><Globe className="text-slate-400" size={18} />بيانات التحويل</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-1"><MapPin size={13} />المدرسة السابقة (خارج المحافظة) <span className="text-red-500">*</span></label>
                  <Input placeholder="مثال: مدرسة الوحدة الأساسية بصنعاء" className="bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-1"><School size={13} />المدرسة الموجه إليها <span className="text-red-500">*</span></label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-primary text-slate-700">
                    <option value="">-- اختر المدرسة --</option>
                    <option value="1">مدرسة التفوق</option><option value="2">مدرسة الأمل</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الصف الدراسي <span className="text-red-500">*</span></label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-primary text-slate-700">
                    <option value="">-- اختر الصف --</option>
                    <option value="1">الصف الأول</option><option value="2">الصف الثاني</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-1"><FileText size={13} />سبب التحويل (اختياري)</label>
                  <textarea rows={3} placeholder="ملاحظات..." className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-primary text-slate-700 resize-none" />
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Button type="button" onClick={() => setViewMode('list')} variant="outline" className="px-8 font-bold h-12 rounded-xl text-slate-600">إلغاء</Button>
              <Button type="button" onClick={() => { setViewMode('list'); }} className="px-8 font-bold h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                <CheckCircle2 size={17} />تسجيل وحفظ البيانات
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input placeholder="بحث باسم الطالب أو المدرسة..." className="pr-10 bg-white" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <Button onClick={() => setViewMode('create')} className="w-full sm:w-auto gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm">
          <UserPlus size={18} /> تسجيل طالب وافد
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table dir="rtl">
            <TableHeader className="bg-slate-50 border-b border-slate-200">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-slate-700 text-right py-4 px-4">الطالب</TableHead>
                <TableHead className="font-bold text-slate-700 text-right py-4 px-4">المدرسة الخارجية</TableHead>
                <TableHead className="font-bold text-slate-700 text-right py-4 px-4">موجه إلى</TableHead>
                <TableHead className="font-bold text-slate-700 text-right py-4 px-4">الصف</TableHead>
                <TableHead className="font-bold text-slate-700 text-center py-4 px-4">الحالة</TableHead>
                <TableHead className="font-bold text-slate-700 text-center py-4 px-4 w-[200px]">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10 text-slate-500">لا توجد سجلات مطابقة.</TableCell></TableRow>
              ) : (
                filtered.map(t => {
                  const allowed = ALLOWED_TRANSITIONS[t.status];
                  const canDelete = t.status !== 'approved';
                  return (
                    <TableRow key={t.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="py-3 px-4">
                        <p className="font-bold text-slate-800">{t.student.full_name}</p>
                        <p className="text-xs text-slate-500 font-mono" dir="ltr">{t.student.school_number}</p>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <span className="flex items-center gap-1.5 text-slate-600 text-sm font-medium"><Globe size={13} className="text-slate-400" />{t.from_external_school_name}</span>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <span className="flex items-center gap-1.5 text-indigo-600 text-sm font-bold"><ArrowRight size={13} />{t.toSchool.name}</span>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-sm text-slate-700">{t.schoolClass.name}</TableCell>
                      <TableCell className="py-3 px-4 text-center"><StatusBadge status={t.status} /></TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => setViewingRecord(t)} title="عرض التفاصيل" className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                            <Eye size={15} />
                          </button>
                          {allowed.includes('approved') && (
                            <button onClick={() => setConfirmAction({ record: t, targetStatus: 'approved' })} title="قبول" className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                              <CheckCircle2 size={15} />
                            </button>
                          )}
                          {allowed.includes('rejected') && (
                            <button onClick={() => setConfirmAction({ record: t, targetStatus: 'rejected' })} title="رفض" className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                              <XCircle size={15} />
                            </button>
                          )}
                          {allowed.includes('pending') && (
                            <button onClick={() => setConfirmAction({ record: t, targetStatus: 'pending' })} title="إعادة فتح" className="p-1.5 rounded-lg bg-amber-50 text-amber-500 hover:bg-amber-100 transition-colors">
                              <RefreshCw size={15} />
                            </button>
                          )}
                          {/* حذف الزر عند approved — متوافق مع الكنترولر */}
                          {canDelete && (
                            <button onClick={() => setDeleteTarget(t)} title="حذف" className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                              <Trash2 size={15} />
                            </button>
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

      {confirmAction && (
        <ConfirmDialog
          message={`هل تريد <strong>${confirmAction.targetStatus === 'approved' ? 'قبول' : confirmAction.targetStatus === 'rejected' ? 'رفض' : 'إعادة فتح'}</strong> طلب الطالب <strong>${confirmAction.record.student.full_name}</strong>؟`}
          confirmLabel={confirmAction.targetStatus === 'approved' ? 'قبول' : confirmAction.targetStatus === 'rejected' ? 'رفض' : 'إعادة فتح'}
          confirmClass={confirmAction.targetStatus === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : confirmAction.targetStatus === 'rejected' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'}
          icon={confirmAction.targetStatus === 'approved' ? <CheckCircle2 size={22} className="text-emerald-600" /> : confirmAction.targetStatus === 'rejected' ? <XCircle size={22} className="text-red-500" /> : <RefreshCw size={22} className="text-amber-500" />}
          onConfirm={handleStatusUpdate}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`هل تريد حذف سجل الطالب الوافد <strong>${deleteTarget.student.full_name}</strong> نهائياً؟`}
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
