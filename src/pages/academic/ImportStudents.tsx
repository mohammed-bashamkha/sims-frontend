import React, { useState, useEffect } from 'react';
import api from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { UploadCloud, AlertTriangle, FileUp, Loader2, CheckCircle2 } from 'lucide-react';

interface FormOptions {
  schools: { id: number; name: string }[];
  school_classes: { id: number; name: string }[];
  academicYears: { id: number; year: string; status: string }[];
}

export const ImportStudents: React.FC = () => {
  const [options, setOptions] = useState<FormOptions | null>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [sampleData, setSampleData] = useState<any[]>([]);

  // Form State
  const [schoolId, setSchoolId] = useState<string>('');
  const [classId, setClassId] = useState<string>('');
  const [academicYearId, setAcademicYearId] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<boolean>(true); // default to true for safety

  useEffect(() => {
    api.get('/students/import')
      .then(res => {
        // Handle both wrapped and unwrapped data
        const data = res.data.data || res.data;
        setOptions(data);
      })
      .catch(err => console.error("Error loading form options", err));
  }, []);

  useEffect(() => {
    // Auto-select active year
    if (options?.academicYears) {
      const activeYear = options.academicYears.find(y => y.status === 'active');
      if (activeYear && !academicYearId) {
        setAcademicYearId(activeYear.id.toString());
      }
    }
  }, [options, academicYearId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setReport(null);
      setSampleData([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent, forceImport = false) => {
    e.preventDefault();
    if (!schoolId || !classId || !academicYearId || !file) {
      return;
    }

    setLoading(true);
    setReport(null);
    setSampleData([]);

    const formData = new FormData();
    formData.append('school_id', schoolId);
    formData.append('class_id', classId);
    formData.append('academic_year_id', academicYearId);
    formData.append('file', file);
    
    const isPreview = preview && !forceImport;
    if (isPreview) {
      formData.append('preview', '1');
    }

    try {
      const res = await api.post('/students/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const resReport = res.data.import_report || res.data.report;
      setReport({ ...resReport, isPreview, message: res.data.message });
      if (res.data.sample_data) {
        setSampleData(res.data.sample_data);
      }
    } catch (err: any) {
      if (err.response?.status === 422) {
         setReport({ failures: err.response.data.failures, message: err.response.data.message });
      } else if (err.response?.data?.import_report) {
         setReport(err.response.data.import_report);
      } else {
         setReport({ message: err.response?.data?.message || 'حدث خطأ غير متوقع أثناء المعالجة' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileUp className="text-primary" />
            استيراد بيانات الطلاب
          </h2>
          <p className="text-slate-500">رفع ملف Excel لإضافة طلاب جدد أو تحديث بيانات الطلاب الحاليين.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">إعدادات الاستيراد</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
              {/* Academic Year */}
              <div className="space-y-2">
                <Label>السنة الدراسية</Label>
                <Select value={academicYearId} onValueChange={setAcademicYearId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر السنة الدراسية" />
                  </SelectTrigger>
                  <SelectContent>
                    {options?.academicYears.map(year => (
                      <SelectItem key={year.id} value={year.id.toString()}>
                        {year.year} {year.status === 'active' && "(الحالية)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* School */}
              <div className="space-y-2">
                <Label>المدرسة</Label>
                <Select value={schoolId} onValueChange={setSchoolId}>
                  <SelectTrigger className="w-full">
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
              </div>

              {/* Class */}
              <div className="space-y-2">
                <Label>الصف الدراسي</Label>
                <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر الصف" />
                  </SelectTrigger>
                  <SelectContent>
                    {options?.school_classes.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* File Input */}
              <div className="space-y-2">
                <Label>ملف البيانات (Excel/CSV)</Label>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors">
                  <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600 mb-2">اسحب وأفلت الملف هنا أو</p>
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                    اختر ملف
                    <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
                  </label>
                  {file && <p className="text-xs text-green-600 mt-2 font-medium">{file.name}</p>}
                </div>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse pt-2">
                <Checkbox id="preview" checked={preview} onCheckedChange={(checked) => {
                  setPreview(checked as boolean);
                  setReport(null); // Clear previous reports when changing mode
                }} />
                <label htmlFor="preview" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  وضع المعاينة (مراجعة البيانات قبل الحفظ)
                </label>
              </div>

              <Button type="submit" variant={preview ? "secondary" : "default"} className="w-full mt-4 font-bold" disabled={loading || !file || !schoolId || !classId || !academicYearId}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 ml-2 h-4 w-4 animate-spin" />
                    جاري المعالجة...
                  </>
                ) : (
                  preview ? 'معاينة البيانات' : 'بدء الاستيراد المباشر'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Report Area */}
        <Card className="lg:col-span-2 border-slate-100 shadow-sm bg-slate-50/50">
          <CardHeader>
            <CardTitle className="text-lg">تقرير العملية</CardTitle>
            <CardDescription>نتائج عملية رفع ومعالجة ملف الطلاب</CardDescription>
          </CardHeader>
          <CardContent>
            {!report && !loading && (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <FileUp className="w-16 h-16 mb-4 opacity-20" />
                <p>قم باختيار البيانات ورفع الملف لرؤية التقرير هنا.</p>
              </div>
            )}
            
            {loading && (
              <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                <Loader2 className="w-12 h-12 mb-4 animate-spin text-primary" />
                <p>يتم الآن معالجة الملف واستخراج البيانات، يرجى الانتظار...</p>
              </div>
            )}

            {report && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                
                {report.message && (
                  <div className={`p-4 rounded-lg flex items-start gap-3 ${report.isPreview ? 'bg-amber-50 text-amber-700' : report.failures ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
                    {report.isPreview ? <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" /> : report.failures ? <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                    <div>
                      <h4 className="font-bold">{report.isPreview ? 'هذه معاينة فقط. لم يتم حفظ البيانات في النظام بعد.' : report.message}</h4>
                    </div>
                  </div>
                )}

                {report.summary && (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-sm">
                        <p className="text-slate-500 text-xs mb-1">إجمالي الصفوف</p>
                        <p className="text-2xl font-bold text-slate-800">{report.summary.total_rows}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center shadow-sm">
                        <p className="text-green-600 text-xs mb-1">ناجح</p>
                        <p className="text-2xl font-bold text-green-700">{report.summary.successful}</p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center shadow-sm">
                        <p className="text-red-600 text-xs mb-1">فشل</p>
                        <p className="text-2xl font-bold text-red-700">{report.summary.failed}</p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-center shadow-sm">
                        <p className="text-orange-600 text-xs mb-1">متخطي</p>
                        <p className="text-2xl font-bold text-orange-700">{report.summary.skipped}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
                          <span className="text-blue-800 text-sm font-medium">طلاب سيتم إنشاؤهم:</span>
                          <span className="bg-blue-200 text-blue-900 px-3 py-1 rounded-full font-bold text-sm">{report.summary.students_created}</span>
                       </div>
                       <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex justify-between items-center">
                          <span className="text-indigo-800 text-sm font-medium">طلاب سيتم تحديثهم:</span>
                          <span className="bg-indigo-200 text-indigo-900 px-3 py-1 rounded-full font-bold text-sm">{report.summary.students_updated}</span>
                       </div>
                    </div>

                    {/* Sample Data display for Preview Mode */}
                    {report.isPreview && sampleData.length > 0 && (
                      <div className="mt-4 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-100">
                          <h3 className="font-bold text-slate-700">عينة من البيانات المقروءة (أول {sampleData.length} صفوف)</h3>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-right">
                            <thead className="bg-slate-50 text-slate-600 border-b">
                              <tr>
                                <th className="px-4 py-2 font-bold">الرقم المدرسي</th>
                                <th className="px-4 py-2 font-bold">الاسم الرباعي</th>
                                <th className="px-4 py-2 font-bold">الجنسية</th>
                                <th className="px-4 py-2 font-bold">الإجراء المتوقع</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {sampleData.map((s: any, idx: number) => (
                                <tr key={idx} className="hover:bg-slate-50">
                                  <td className="px-4 py-2 font-medium" dir="ltr">{s.school_number}</td>
                                  <td className="px-4 py-2 text-primary">{s.full_name}</td>
                                  <td className="px-4 py-2">{s.nationality}</td>
                                  <td className="px-4 py-2">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${s.status === 'طالب جديد' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                      {s.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Confirmation Button */}
                    {report.isPreview && (
                      <div className="mt-8 pt-4 border-t border-slate-200 flex justify-end">
                        <Button 
                          onClick={(e) => handleSubmit(e, true)} 
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 shadow-md"
                          size="lg"
                          disabled={loading}
                        >
                          <CheckCircle2 className="ml-2 h-5 w-5" />
                          تأكيد واعتماد الاستيراد
                        </Button>
                      </div>
                    )}
                  </>
                )}

                {/* Validation Failures (Excel specific) */}
                {report.failures && report.failures.length > 0 && (
                  <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
                    <div className="bg-red-50 px-4 py-3 border-b border-red-100 flex items-center gap-2 text-red-700 font-semibold">
                      <AlertTriangle className="w-5 h-5" />
                      أخطاء في تركيبة البيانات ({report.failures.length})
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full text-sm text-right">
                        <thead className="bg-slate-50 text-slate-600">
                          <tr>
                            <th className="px-4 py-2 font-medium">الصف</th>
                            <th className="px-4 py-2 font-medium">العمود</th>
                            <th className="px-4 py-2 font-medium">الخطأ</th>
                            <th className="px-4 py-2 font-medium">القيمة المدخلة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {report.failures.map((f: any, i: number) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="px-4 py-2">{f.row}</td>
                              <td className="px-4 py-2">{f.attribute}</td>
                              <td className="px-4 py-2 text-red-600">{f.errors.join(', ')}</td>
                              <td className="px-4 py-2 text-slate-500 font-mono text-xs">{JSON.stringify(f.values[f.attribute])}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Processing Errors */}
                {report.errors && report.errors.length > 0 && (
                  <div className="bg-white rounded-xl border border-red-200 overflow-hidden mt-4">
                    <div className="bg-red-50 px-4 py-3 border-b border-red-100 flex items-center gap-2 text-red-700 font-semibold">
                      <AlertTriangle className="w-5 h-5" />
                      أخطاء أثناء المعالجة ({report.errors.length})
                    </div>
                    <div className="max-h-64 overflow-y-auto p-4 space-y-2">
                      {report.errors.map((err: any, i: number) => (
                        <div key={i} className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100">
                          <strong>الصف {err.row}:</strong> {err.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

