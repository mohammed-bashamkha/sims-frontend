import React, { useState, useEffect } from 'react';
import api from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  FileDown,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Download,
  School,
  GraduationCap,
  Calendar,
} from 'lucide-react';

interface FormOptions {
  schools: { id: number; name: string }[];
  school_classes: { id: number; name: string }[];
  academicYears: { id: number; year: string; status: string }[];
}

export const ExportFinalResults: React.FC = () => {
  const [options, setOptions] = useState<FormOptions | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // Form State
  const [schoolId, setSchoolId] = useState<string>('');
  const [classId, setClassId] = useState<string>('');
  const [academicYearId, setAcademicYearId] = useState<string>('');

  // Fetch form options on mount
  useEffect(() => {
    setLoadingOptions(true);
    // Using the same endpoint as ImportFinalResults for dropdown options
    api.get('/students/import')
      .then(res => {
        const data = res.data.data || res.data;
        setOptions(data);
      })
      .catch(err => {
        setError('فشل تحميل بيانات النموذج. يرجى تحديث الصفحة والمحاولة مجدداً.');
        console.error('Error loading export form options', err);
      })
      .finally(() => setLoadingOptions(false));
  }, []);

  // Auto-select active academic year
  useEffect(() => {
    if (options?.academicYears) {
      const activeYear = options.academicYears.find(y => y.status === 'active');
      if (activeYear && !academicYearId) {
        setAcademicYearId(activeYear.id.toString());
      }
    }
  }, [options, academicYearId]);

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setValidationErrors({});

    // Client-side validation
    const errors: Record<string, string[]> = {};
    if (!schoolId) errors.school_id = ['يجب اختيار المدرسة'];
    if (!classId) errors.class_id = ['يجب اختيار الصف الدراسي'];
    if (!academicYearId) errors.academic_year_id = ['يجب اختيار السنة الدراسية'];

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const response = await api.get('/export/final-result', {
        params: {
          school_id: schoolId,
          class_id: classId,
          academic_year_id: academicYearId,
        },
        responseType: 'blob', // Important for file download
      });

      // Create a download link and trigger it
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Try to get filename from Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `Final_Results_${new Date().toISOString().slice(0, 10)}.xlsx`;
      if (contentDisposition) {
        // Try to match UTF-8 filename first: filename*=UTF-8''...
        const utf8FileNameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
        if (utf8FileNameMatch && utf8FileNameMatch[1]) {
          fileName = decodeURIComponent(utf8FileNameMatch[1]);
        } else {
          // Fallback to standard filename
          const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
          if (fileNameMatch && fileNameMatch[1]) {
            fileName = fileNameMatch[1];
          }
        }
      }

      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      if (err.response?.status === 422 || err.response?.status === 404) {
        // Server validation errors
        if (err.response.data instanceof Blob) {
          // Parse blob error response
          const text = await err.response.data.text();
          try {
            const json = JSON.parse(text);
            setValidationErrors(json.errors || {});
            setError(json.message || 'بيانات التصدير غير صحيحة.');
          } catch {
            setError('بيانات التصدير غير صحيحة.');
          }
        } else {
          setValidationErrors(err.response.data?.errors || {});
          setError(err.response.data?.message || 'بيانات التصدير غير صحيحة أو الخدمة غير متوفرة.');
        }
      } else {
        setError(err.response?.data?.message || 'حدث خطأ غير متوقع أثناء تصدير البيانات.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = schoolId && classId && academicYearId;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileDown className="text-primary" />
            تصدير النتائج النهائية
          </h2>
          <p className="text-slate-500 mt-1">
            تصدير درجات الطلاب النهائية إلى ملف Excel بناءً على المدرسة، الصف، والسنة الدراسية.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <Card className="lg:col-span-1 border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">إعدادات التصدير</CardTitle>
            <CardDescription>حدد المعايير لتصفية الدرجات المراد تصديرها</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingOptions ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                <p className="text-sm">جاري تحميل البيانات...</p>
              </div>
            ) : (
              <form onSubmit={handleExport} className="space-y-5">
                {/* Academic Year */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    السنة الدراسية
                  </Label>
                  <Select value={academicYearId} onValueChange={(v) => { setAcademicYearId(v); setValidationErrors(e => ({ ...e, academic_year_id: [] })); }}>
                    <SelectTrigger className={`w-full ${validationErrors.academic_year_id?.length ? 'border-red-400 ring-red-200' : ''}`}>
                      <SelectValue placeholder="اختر السنة الدراسية" />
                    </SelectTrigger>
                    <SelectContent>
                      {options?.academicYears.map(year => (
                        <SelectItem key={year.id} value={year.id.toString()}>
                          {year.year} {year.status === 'active' && '(الحالية)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.academic_year_id?.length > 0 && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {validationErrors.academic_year_id[0]}
                    </p>
                  )}
                </div>

                {/* School */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <School className="w-4 h-4 text-slate-400" />
                    المدرسة
                  </Label>
                  <Select value={schoolId} onValueChange={(v) => { setSchoolId(v); setValidationErrors(e => ({ ...e, school_id: [] })); }}>
                    <SelectTrigger className={`w-full ${validationErrors.school_id?.length ? 'border-red-400 ring-red-200' : ''}`}>
                      <SelectValue placeholder="اختر المدرسة" />
                    </SelectTrigger>
                    <SelectContent>
                      {options?.schools.map(school => (
                        <SelectItem key={school.id} value={school.id.toString()}>
                          {school.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.school_id?.length > 0 && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {validationErrors.school_id[0]}
                    </p>
                  )}
                </div>

                {/* Class */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-slate-400" />
                    الصف الدراسي
                  </Label>
                  <Select value={classId} onValueChange={(v) => { setClassId(v); setValidationErrors(e => ({ ...e, class_id: [] })); }}>
                    <SelectTrigger className={`w-full ${validationErrors.class_id?.length ? 'border-red-400 ring-red-200' : ''}`}>
                      <SelectValue placeholder="اختر الصف الدراسي" />
                    </SelectTrigger>
                    <SelectContent>
                      {options?.school_classes.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.class_id?.length > 0 && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {validationErrors.class_id[0]}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full mt-2 font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={loading || !isFormValid}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      جاري تصدير الملف...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      تصدير إلى Excel
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Status / Info Card */}
        <Card className="lg:col-span-2 border-slate-100 shadow-sm bg-slate-50/50">
          <CardHeader>
            <CardTitle className="text-lg">معلومات التصدير</CardTitle>
            <CardDescription>تفاصيل عملية تصدير ملف النتائج النهائية</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Idle State */}
            {!success && !error && !loading && (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center">
                  <FileDown className="w-12 h-12 opacity-40" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-slate-500">اختر المعايير وابدأ التصدير</p>
                  <p className="text-sm mt-1">سيتم تنزيل ملف Excel يحتوي على النتائج النهائية</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
                <div className="text-center">
                  <p className="font-medium">جاري تجهيز الملف...</p>
                  <p className="text-sm mt-1 text-slate-400">يتم الآن استخراج النتائج وتجهيز ملف التصدير</p>
                </div>
              </div>
            )}

            {/* Success State */}
            {success && !loading && (
              <div className="flex flex-col items-center justify-center h-64 gap-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-emerald-700">تم التصدير بنجاح!</p>
                  <p className="text-sm mt-2 text-slate-500">تم تنزيل ملف Excel يحتوي على الدرجات المحددة.</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="flex flex-col items-center justify-center h-64 gap-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-12 h-12 text-red-500" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-red-600">فشل التصدير</p>
                  <p className="text-sm mt-2 text-slate-500">{error}</p>
                </div>
              </div>
            )}

            {/* Info Cards */}
            {!loading && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-2 shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">السنة الدراسية</p>
                  <p className="text-xs text-slate-500">
                    {academicYearId
                      ? options?.academicYears.find(y => y.id.toString() === academicYearId)?.year || '—'
                      : 'لم يتم الاختيار'}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-2 shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <School className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">المدرسة</p>
                  <p className="text-xs text-slate-500">
                    {schoolId
                      ? options?.schools.find(s => s.id.toString() === schoolId)?.name || '—'
                      : 'لم يتم الاختيار'}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-2 shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">الصف الدراسي</p>
                  <p className="text-xs text-slate-500">
                    {classId
                      ? options?.school_classes.find(c => c.id.toString() === classId)?.name || '—'
                      : 'لم يتم الاختيار'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
