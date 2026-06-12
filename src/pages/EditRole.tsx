import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, Loader2, Save, X, Key } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import api from '@/api/axios';
import { useToastStore } from '@/store/toastStore';

interface Permission {
  id: number;
  name: string;
}

export const EditRole: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToastStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  
  const [roleName, setRoleName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [roleRes, permsRes] = await Promise.all([
        api.get(`/roles/${id}`),
        api.get('/permissions')
      ]);
      
      const role = roleRes.data;
      setRoleName(role.name);
      setSelectedPermissions(role.permissions.map((p: any) => p.name));
      setAvailablePermissions(permsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      navigate('/settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionToggle = (permName: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permName) 
        ? prev.filter(p => p !== permName) 
        : [...prev, permName]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roleName.trim()) {
      toast('اسم الدور مطلوب', 'warning');
      return;
    }

    if (selectedPermissions.length === 0) {
      toast('يجب اختيار صلاحية واحدة على الأقل', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.put(`/roles/${id}`, {
        name: roleName,
        permissions: selectedPermissions
      });
      navigate('/settings');
    } catch (error: any) {
      console.error('Failed to update role:', error);
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
    <div className="max-w-[1000px] mx-auto pb-12 flex flex-col gap-6" dir="rtl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col gap-3 text-right">
          <div className="flex items-center gap-2 text-slate-500">
            <button onClick={() => navigate('/settings')} className="hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium">
              إعدادات النظام
            </button>
            <ChevronLeft size={16} />
            <span className="text-slate-800 font-bold text-sm">تعديل الدور</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                تعديل صلاحيات {roleName}
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* Role Name Card */}
        <Card className="shadow-sm border border-slate-100 rounded-2xl overflow-hidden">
          <div className="bg-slate-50/50 border-b border-slate-100 p-5">
            <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <ShieldCheck className="text-primary" size={20} /> اسم الدور الأساسي
            </h2>
          </div>
          <CardContent className="p-6">
            <div className="max-w-md space-y-2 text-right">
              <label className="text-sm font-bold text-slate-700">اسم الدور (Role Name)</label>
              <div className="relative">
                <Key className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input 
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="pr-10 bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
                  placeholder="أدخل اسم الدور"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permissions Grid Card */}
        <Card className="shadow-sm border-2 border-primary/20 rounded-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1.5 h-full bg-primary"></div>
          <div className="bg-primary/5 border-b border-primary/10 p-5">
            <h2 className="font-bold text-primary text-lg flex items-center gap-2">
              <Key className="text-primary" size={20} /> الصلاحيات المرتبطة
            </h2>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availablePermissions.map(perm => (
                <label 
                  key={perm.id} 
                  htmlFor={perm.name}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                    selectedPermissions.includes(perm.name) 
                      ? 'bg-primary/5 border-primary/30 shadow-sm' 
                      : 'bg-slate-50/50 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <span className={`text-xs font-bold ${selectedPermissions.includes(perm.name) ? 'text-primary' : 'text-slate-600'}`}>
                    {perm.name}
                  </span>
                  <Checkbox 
                    id={perm.name}
                    checked={selectedPermissions.includes(perm.name)}
                    onCheckedChange={() => handlePermissionToggle(perm.name)}
                    className="border-slate-300 w-4 h-4"
                  />
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

      </form>

    </div>
  );
};
