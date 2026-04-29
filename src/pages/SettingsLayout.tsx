import React from 'react';
import { Settings as SettingsIcon, Users, ShieldCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UsersManagement } from '@/components/settings/UsersManagement';
import { RolesManagement } from '@/components/settings/RolesManagement';

export const SettingsLayout: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
          <div className="bg-slate-100 text-slate-600 p-2 rounded-lg">
            <SettingsIcon size={24} />
          </div>
          إعدادات النظام
        </h1>
        <p className="text-slate-500 mt-2">إدارة المستخدمين، الأدوار والصلاحيات، والإعدادات العامة للنظام.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <Tabs defaultValue="users" className="w-full" dir="rtl">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 mb-8 bg-slate-100 p-1.5 rounded-xl h-auto">
            <TabsTrigger value="users" className="rounded-lg py-3 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm flex items-center gap-2">
              <Users size={18} /> إدارة المستخدمين
            </TabsTrigger>
            <TabsTrigger value="roles" className="rounded-lg py-3 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm flex items-center gap-2">
              <ShieldCheck size={18} /> الأدوار والصلاحيات
            </TabsTrigger>
            <TabsTrigger value="general" className="rounded-lg py-3 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm flex items-center gap-2">
              <SettingsIcon size={18} /> إعدادات عامة
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="mt-0 outline-none">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="roles" className="mt-0 outline-none">
            <RolesManagement />
          </TabsContent>
          
          <TabsContent value="general" className="mt-0 outline-none">
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <SettingsIcon size={64} className="mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-slate-600">الإعدادات العامة</h3>
              <p className="text-sm mt-2 max-w-md text-center">سيتم توفير خيارات التحكم باسم النظام، وتغيير الشعار، والنسخ الاحتياطي في هذا القسم قريباً.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
    </div>
  );
};
