import React, { useState } from 'react';
import { ShieldCheck, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

export const RolesManagement: React.FC = () => {
  const [isAdding, setIsAdding] = useState(false);

  const mockRoles = [
    { id: 1, name: 'مدير النظام', permissionsCount: 45, usersCount: 2 },
    { id: 2, name: 'مدير مدرسة', permissionsCount: 15, usersCount: 12 },
    { id: 3, name: 'مدخل بيانات', permissionsCount: 8, usersCount: 30 },
  ];

  const availablePermissions = [
    'create_student', 'edit_student', 'delete_student', 'view_student',
    'create_school', 'edit_school', 'delete_school', 'view_school',
    'manage_users', 'manage_roles', 'export_reports'
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary p-2 rounded-lg">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">الأدوار والصلاحيات</h2>
            <p className="text-xs text-slate-500">تحكم بصلاحيات الوصول في النظام بناءً على Spatie Roles</p>
          </div>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="bg-primary hover:bg-primary/90 text-white rounded-xl">
          <Plus size={18} className="ml-2" />
          إنشاء دور جديد
        </Button>
      </div>

      {/* Add Role Form */}
      {isAdding && (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner">
          <h3 className="font-bold text-slate-800 mb-4">إنشاء دور وصلاحيات جديدة</h3>
          <div className="mb-6 max-w-md">
            <label className="text-sm font-medium text-slate-700 block mb-1">اسم الدور (Role Name)</label>
            <Input placeholder="مثال: مشرف إقليمي" className="bg-white border-slate-200" />
          </div>
          
          <div className="mb-4">
            <label className="text-sm font-bold text-slate-800 block mb-3 border-b border-slate-200 pb-2">الصلاحيات المتاحة (Permissions)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {availablePermissions.map(perm => (
                <div key={perm} className="flex items-center space-x-2 space-x-reverse bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                  <Checkbox id={perm} />
                  <label htmlFor={perm} className="text-sm font-medium text-slate-700 cursor-pointer">{perm}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={() => setIsAdding(false)}>إلغاء</Button>
            <Button className="bg-primary hover:bg-primary/90">حفظ الدور</Button>
          </div>
        </div>
      )}

      {/* Roles Table */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <Table className="text-right">
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead className="text-right font-bold w-12">#</TableHead>
              <TableHead className="text-right font-bold">اسم الدور</TableHead>
              <TableHead className="text-right font-bold">عدد الصلاحيات</TableHead>
              <TableHead className="text-right font-bold">المستخدمين المرتبطين</TableHead>
              <TableHead className="text-right font-bold">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockRoles.map(role => (
              <TableRow key={role.id}>
                <TableCell className="font-bold text-slate-500">{role.id}</TableCell>
                <TableCell className="font-bold text-slate-800">{role.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100">
                    {role.permissionsCount} صلاحية
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-600 font-medium">{role.usersCount} مستخدم</TableCell>
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
