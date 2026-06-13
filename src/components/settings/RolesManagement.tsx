import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Edit, Trash2, Eye, Loader2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';
import api from '@/api/axios';
import { useToastStore } from '@/store/toastStore';
import { DeleteConfirmationModal } from '@/components/common/DeleteConfirmationModal';

interface Permission {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
  permissions: Permission[];
  users_count?: number;
}

export const RolesManagement: React.FC = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToastStore();

  // Form State
  const [roleName, setRoleName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  
  // Delete State
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, role: Role | null}>({
    isOpen: false,
    role: null
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/roles');
      setRoles(response.data);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await api.get('/permissions');
      setPermissions(response.data);
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    }
  };

  const handlePermissionToggle = (permName: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permName) 
        ? prev.filter(p => p !== permName) 
        : [...prev, permName]
    );
  };

  const handleSaveRole = async () => {
    if (!roleName.trim()) {
      toast('يرجى إدخال اسم الدور', 'warning');
      return;
    }

    if (selectedPermissions.length === 0) {
      toast('يرجى اختيار صلاحية واحدة على الأقل', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/roles', {
        name: roleName,
        permissions: selectedPermissions
      });
      
      setIsAdding(false);
      setRoleName('');
      setSelectedPermissions([]);
      fetchRoles();
    } catch (error: any) {
      // Axios interceptor handles global errors
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = (role: Role) => {
    setDeleteModal({ isOpen: true, role });
  };

  const confirmDelete = async () => {
    if (!deleteModal.role) return;
    setIsDeleting(true);
    try {
      await api.delete(`/roles/${deleteModal.role.id}`);
      setDeleteModal({ isOpen: false, role: null });
      fetchRoles();
    } catch (error: any) {
      // Axios interceptor handles global errors
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 text-right">
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
          {isAdding ? 'إغلاق النموذج' : 'إنشاء دور جديد'}
        </Button>
      </div>

      {/* Add Role Form */}
      {isAdding && (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Plus size={18} className="text-primary"/> إنشاء دور وصلاحيات جديدة
          </h3>
          
          <div className="mb-6 max-w-md text-right">
            <label className="text-sm font-bold text-slate-700 block mb-1">اسم الدور (Role Name)</label>
            <Input 
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="مثال: مشرف إقليمي" 
              className="bg-white border-slate-200" 
            />
          </div>
          
          <div className="mb-4">
            <label className="text-sm font-bold text-slate-800 block mb-3 border-b border-slate-200 pb-2 text-right">
              الصلاحيات المتاحة (Permissions)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {permissions.length > 0 ? (
                permissions.map(perm => (
                  <label 
                    key={perm.id} 
                    htmlFor={perm.name}
                    className={`flex items-center space-x-2 space-x-reverse p-3 rounded-lg border transition-all cursor-pointer select-none ${
                      selectedPermissions.includes(perm.name) 
                        ? 'bg-primary/5 border-primary/30' 
                        : 'bg-white border-slate-100 shadow-sm hover:border-slate-200'
                    }`}
                  >
                    <Checkbox 
                      id={perm.name} 
                      checked={selectedPermissions.includes(perm.name)}
                      onCheckedChange={() => handlePermissionToggle(perm.name)}
                    />
                    <span className={`text-xs font-medium ${selectedPermissions.includes(perm.name) ? 'text-primary' : 'text-slate-700'}`}>
                      {perm.name}
                    </span>
                  </label>
                ))
              ) : (
                <p className="text-sm text-slate-400 col-span-full py-4 text-center">جاري تحميل الصلاحيات...</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 mt-6">
            <Button variant="outline" onClick={() => setIsAdding(false)} disabled={isSubmitting}>
              <X size={18} className="ml-2" /> إلغاء
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90 min-w-[120px]" 
              onClick={handleSaveRole}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save size={18} className="ml-2" />
                  حفظ الدور
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Roles Table */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden min-h-[200px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="animate-spin text-slate-400 w-8 h-8" />
          </div>
        ) : (
          <Table className="text-right">
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="text-right font-bold w-12">#</TableHead>
                <TableHead className="text-right font-bold">اسم الدور</TableHead>
                <TableHead className="text-right font-bold">الصلاحيات</TableHead>
                <TableHead className="text-right font-bold">المستخدمين</TableHead>
                <TableHead className="text-right font-bold">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">لا توجد أدوار</TableCell>
                </TableRow>
              ) : (
                roles.map(role => (
                  <TableRow key={role.id}>
                    <TableCell className="font-bold text-slate-400">{role.id}</TableCell>
                    <TableCell className="font-bold text-slate-800">{role.name}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap max-w-md">
                        {role.permissions && role.permissions.length > 0 ? (
                          role.permissions.map((p, idx) => (
                            idx < 3 ? (
                              <Badge key={p.id} variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100 text-[10px]">
                                {p.name}
                              </Badge>
                            ) : idx === 3 ? (
                              <Badge key="more" variant="outline" className="text-[10px]">
                                +{role.permissions.length - 3} أخرى
                              </Badge>
                            ) : null
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">بدون صلاحيات</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 font-medium">
                      <Badge variant="outline" className="bg-blue-50/50 text-blue-600 border-blue-100">
                        {role.users_count || 0} مستخدم
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link to={`/settings/roles/${role.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-primary/10">
                            <Eye size={16} />
                          </Button>
                        </Link>
                        <Link to={`/settings/roles/edit/${role.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-primary/10">
                            <Edit size={16} />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteRole(role)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <DeleteConfirmationModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, role: null })}
        onConfirm={confirmDelete}
        title="حذف دور"
        message="هل أنت متأكد من رغبتك في حذف هذا الدور؟ قد يؤثر ذلك على وصول المستخدمين المرتبطين به."
        itemName={deleteModal.role?.name}
        isLoading={isDeleting}
      />
    </div>
  );
};
