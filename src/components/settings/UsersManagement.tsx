import React, { useState } from 'react';
import { Plus, Edit, Trash2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

export const UsersManagement: React.FC = () => {
  const [isAdding, setIsAdding] = useState(false);

  const mockUsers = [
    { id: 1, name: 'أحمد محمد', email: 'admin@sims.com', roles: ['مدير النظام'], mustChangePassword: false },
    { id: 2, name: 'صالح سعيد', email: 'saleh@school.com', roles: ['مدير مدرسة'], mustChangePassword: true },
    { id: 3, name: 'فاطمة علي', email: 'fatima@edu.com', roles: ['مدخل بيانات'], mustChangePassword: false },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative w-72">
          <Input placeholder="البحث عن مستخدم..." className="bg-slate-50 border-slate-200" dir="rtl" />
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="bg-primary hover:bg-primary/90 text-white rounded-xl">
          <Plus size={18} className="ml-2" />
          إضافة مستخدم جديد
        </Button>
      </div>

      {/* Add User Form (Simplified) */}
      {isAdding && (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Plus size={18} className="text-primary"/> بيانات المستخدم الجديد</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">الاسم الكامل</label>
              <Input placeholder="اسم المستخدم" className="bg-white border-slate-200" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">البريد الإلكتروني</label>
              <Input type="email" placeholder="email@example.com" className="bg-white border-slate-200 text-left" dir="ltr" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">كلمة المرور</label>
              <Input type="password" placeholder="******" className="bg-white border-slate-200 text-left" dir="ltr" />
            </div>
          </div>

          <div className="mt-5">
            <label className="text-sm font-bold text-slate-800 block mb-3 border-b border-slate-200 pb-2">الأدوار الممنوحة (Roles)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {['مدير النظام', 'مدير مدرسة', 'مدخل بيانات', 'مشرف نظام'].map(role => (
                <div key={role} className="flex items-center space-x-2 space-x-reverse bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm transition-colors hover:border-primary/30">
                  <Checkbox id={`role-${role}`} />
                  <label htmlFor={`role-${role}`} className="text-sm font-medium text-slate-700 cursor-pointer flex-1 select-none">{role}</label>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAdding(false)}>إلغاء</Button>
            <Button className="bg-primary hover:bg-primary/90">حفظ المستخدم</Button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <Table className="text-right">
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead className="text-right font-bold">الاسم</TableHead>
              <TableHead className="text-right font-bold">البريد الإلكتروني</TableHead>
              <TableHead className="text-right font-bold">الأدوار</TableHead>
              <TableHead className="text-right font-bold">حالة كلمة المرور</TableHead>
              <TableHead className="text-right font-bold">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockUsers.map(user => (
              <TableRow key={user.id}>
                <TableCell className="font-bold text-slate-800">{user.name}</TableCell>
                <TableCell className="text-slate-500 font-medium">{user.email}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {user.roles.map(role => (
                      <Badge key={role} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">{role}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {user.mustChangePassword ? (
                    <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 gap-1">
                      <ShieldAlert size={14} /> يطلب التغيير
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">آمن</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-primary/10">
                      <Edit size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
