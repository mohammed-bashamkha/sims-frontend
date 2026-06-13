import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, User, ShieldCheck, Mail, Loader2, Save, X, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import api from '@/api/axios';
import { useToastStore } from '@/store/toastStore';

interface Role {
  id: number;
  name: string;
}

export const EditUser: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToastStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [userRes, rolesRes] = await Promise.all([
        api.get(`/users/${id}`),
        api.get('/roles')
      ]);
      
      const user = userRes.data;
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: ''
      });
      setSelectedRoles(user.roles ? user.roles.map((r: any) => r.name) : []);
      setAvailableRoles(rolesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      navigate('/settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleToggle = (roleName: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleName) 
        ? prev.filter(r => r !== roleName) 
        : [...prev, roleName]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast('الاسم والبريد الإلكتروني مطلوبان', 'warning');
      return;
    }

    if (formData.password && formData.password !== formData.password_confirmation) {
      toast('كلمات المرور غير متطابقة', 'warning');
      return;
    }

    if (selectedRoles.length === 0) {
      toast('يجب اختيار دور واحد على الأقل', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        roles: selectedRoles
      };

      if (formData.password) {
        payload.password = formData.password;
        payload.password_confirmation = formData.password_confirmation;
      }

      await api.put(`/users/${id}`, payload);
      navigate('/settings');
    } catch (error: any) {
      // Axios interceptor will handle the error toast
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin w-10 h-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto pb-12 flex flex-col gap-6" dir="rtl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col gap-3 text-right">
          <div className="flex items-center gap-2 text-slate-500">
            <button onClick={() => navigate('/settings')} className="hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium">
              إعدادات النظام
            </button>
            <ChevronLeft size={16} />
            <span className="text-slate-800 font-bold text-sm">تعديل المستخدم</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <User size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                تعديل بيانات {formData.name}
              </h1>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/settings')} className="rounded-xl">
            <X size={18} className="ml-2" /> إلغاء
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 text-white rounded-xl min-w-[120px]"
          >
            {isSubmitting ? (
              <Loader2 size={18} className="ml-2 animate-spin" />
            ) : (
              <Save size={18} className="ml-2" />
            )}
            حفظ التغييرات
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Details */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <Card className="shadow-sm border border-slate-100 rounded-2xl overflow-hidden">
            <div className="bg-slate-50/50 border-b border-slate-100 p-5">
              <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <User className="text-primary" size={20} /> البيانات الأساسية
              </h2>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2 text-right">
                  <label className="text-sm font-bold text-slate-700">الاسم الكامل</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pr-10 bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
                      placeholder="أدخل الاسم الكامل"
                    />
                  </div>
                </div>
                <div className="space-y-2 text-right">
                  <label className="text-sm font-bold text-slate-700">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input 
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pr-10 bg-slate-50/50 border-slate-200 focus:bg-white transition-all text-left"
                      dir="ltr"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-amber-600 font-bold text-sm mb-4 flex items-center gap-2">
                  <Lock size={16} /> تغيير كلمة المرور (اختياري)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2 text-right">
                    <label className="text-sm font-bold text-slate-700">كلمة المرور الجديدة</label>
                    <Input 
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="bg-slate-50/50 border-slate-200 text-left"
                      dir="ltr"
                      placeholder="******"
                    />
                  </div>
                  <div className="space-y-2 text-right">
                    <label className="text-sm font-bold text-slate-700">تأكيد كلمة المرور</label>
                    <Input 
                      name="password_confirmation"
                      type="password"
                      value={formData.password_confirmation}
                      onChange={handleInputChange}
                      className="bg-slate-50/50 border-slate-200 text-left"
                      dir="ltr"
                      placeholder="******"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">اتركه فارغاً إذا كنت لا ترغب في تغيير كلمة المرور</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Roles */}
        <div className="flex flex-col gap-6">
          <Card className="shadow-sm border-2 border-primary/20 rounded-2xl overflow-hidden relative h-fit">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-primary"></div>
            <div className="bg-primary/5 border-b border-primary/10 p-5">
              <h2 className="font-bold text-primary text-lg flex items-center gap-2">
                <ShieldCheck className="text-primary" size={20} /> الأدوار الممنوحة
              </h2>
            </div>
            <CardContent className="p-6">
              <div className="flex flex-col gap-2">
                {availableRoles.map(role => (
                  <label 
                    key={role.id} 
                    htmlFor={`role-${role.id}`}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                      selectedRoles.includes(role.name) 
                        ? 'bg-primary/5 border-primary/30 shadow-sm' 
                        : 'bg-slate-50/50 border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        selectedRoles.includes(role.name) ? 'bg-primary text-white shadow-sm' : 'bg-white text-slate-400 border border-slate-100'
                      }`}>
                        <ShieldCheck size={14} />
                      </div>
                      <span className={`text-sm font-bold ${selectedRoles.includes(role.name) ? 'text-primary' : 'text-slate-600'}`}>
                        {role.name}
                      </span>
                    </div>
                    <Checkbox 
                      id={`role-${role.id}`}
                      checked={selectedRoles.includes(role.name)}
                      onCheckedChange={() => handleRoleToggle(role.name)}
                      className="border-slate-300 w-4 h-4"
                    />
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </form>

    </div>
  );
};
