import React, { useState } from 'react';
import { User, Mail, Shield, Key, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const Profile: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock data for the logged-in user
  const [userData, setUserData] = useState({
    name: 'أحمد محمد عبدالله',
    email: 'ahmed@sims.edu.ye',
    roles: ['مدير النظام', 'مشرف المدارس'],
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('تم حفظ البيانات الشخصية بنجاح!');
    }, 1000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('كلمة المرور الجديدة غير متطابقة!');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('تم تغيير كلمة المرور بنجاح!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[800px] mx-auto pb-10">
      
      {/* Profile Header */}
      <div className="flex items-center gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <User size={40} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{userData.name}</h1>
          <div className="text-slate-500 mt-1 flex items-center gap-2">
            <Mail size={16} />
            <span>{userData.email}</span>
          </div>
          <div className="flex gap-2 mt-3">
            {userData.roles.map((role, idx) => (
              <span key={idx} className="bg-slate-100 text-slate-600 px-3 py-1 text-xs rounded-full font-medium border border-slate-200">
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Tabs defaultValue="info" className="w-full" dir="rtl">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="info" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">البيانات الشخصية</TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">الأمان وكلمة المرور</TabsTrigger>
        </TabsList>
        
        {/* Basic Info Tab */}
        <TabsContent value="info">
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center gap-2">
              <User className="text-primary" size={20} />
              <h3 className="font-bold text-slate-800">تحديث البيانات الأساسية</h3>
            </div>
            <CardContent className="p-6">
              <form onSubmit={handleInfoSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">الاسم الكامل</label>
                  <Input 
                    value={userData.name}
                    onChange={(e) => setUserData({...userData, name: e.target.value})}
                    className="h-12 rounded-xl border-slate-200 focus:bg-white focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">البريد الإلكتروني</label>
                  <Input 
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData({...userData, email: e.target.value})}
                    className="h-12 rounded-xl border-slate-200 focus:bg-white focus:ring-2 focus:ring-primary/20 text-left"
                    dir="ltr"
                  />
                </div>
                
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 h-12 font-bold shadow-sm">
                    {isLoading ? <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span> : <Save size={18} className="ml-2" />}
                    حفظ التغييرات
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center gap-2">
              <Shield className="text-primary" size={20} />
              <h3 className="font-bold text-slate-800">تغيير كلمة المرور</h3>
            </div>
            <CardContent className="p-6">
              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Key size={16} className="text-slate-400" />
                    كلمة المرور الحالية
                  </label>
                  <Input 
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="h-12 rounded-xl border-slate-200 focus:bg-white focus:ring-2 focus:ring-primary/20 text-left"
                    dir="ltr"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">كلمة المرور الجديدة</label>
                    <Input 
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="h-12 rounded-xl border-slate-200 focus:bg-white focus:ring-2 focus:ring-primary/20 text-left"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">تأكيد كلمة المرور الجديدة</label>
                    <Input 
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="h-12 rounded-xl border-slate-200 focus:bg-white focus:ring-2 focus:ring-primary/20 text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                {passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                  <p className="text-red-500 text-sm font-medium">كلمة المرور غير متطابقة!</p>
                )}

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <Button type="submit" disabled={isLoading || (passwordData.newPassword !== passwordData.confirmPassword)} className="bg-slate-800 hover:bg-slate-900 text-white rounded-xl px-8 h-12 font-bold shadow-sm">
                    {isLoading ? <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span> : <Key size={18} className="ml-2" />}
                    تحديث كلمة المرور
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
