import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ShieldAlert, Eye, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';
import api from '@/api/axios';
import { useToastStore } from '@/store/toastStore';
import { DeleteConfirmationModal } from '@/components/common/DeleteConfirmationModal';

interface User {
  id: number;
  name: string;
  email: string;
  must_change_password: boolean;
  roles: { id: number; name: string }[];
}

interface Role {
  id: number;
  name: string;
}

export const UsersManagement: React.FC = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, user: User | null}>({
    isOpen: false,
    user: null
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToastStore();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast('فشل في جلب المستخدمين', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      setAvailableRoles(response.data);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
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

  const handleSaveUser = async () => {
    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      toast('يرجى ملء جميع الحقول المطلوبة', 'warning');
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      toast('كلمات المرور غير متطابقة', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/users', {
        ...formData,
        roles: selectedRoles
      });
      
      toast('تم إنشاء المستخدم بنجاح', 'success');
      setIsAdding(false);
      setFormData({ name: '', email: '', password: '', password_confirmation: '' });
      setSelectedRoles([]);
      fetchUsers();
    } catch (error: any) {
      const message = error.response?.data?.message || 'فشل في إنشاء المستخدم';
      toast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = (user: User) => {
    setDeleteModal({
      isOpen: true,
      user
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.user) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/users/${deleteModal.user.id}`);
      toast('تم حذف المستخدم بنجاح', 'success');
      setDeleteModal({ isOpen: false, user: null });
      fetchUsers();
    } catch (error: any) {
      toast('فشل في حذف المستخدم', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative w-72">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="البحث عن مستخدم..." 
            className="bg-slate-50 border-slate-200 pr-10" 
            dir="rtl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="bg-primary hover:bg-primary/90 text-white rounded-xl">
          <Plus size={18} className="ml-2" />
          {isAdding ? 'إغلاق النموذج' : 'إضافة مستخدم جديد'}
        </Button>
      </div>

      {/* Add User Form */}
      {isAdding && (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Plus size={18} className="text-primary"/> بيانات المستخدم الجديد
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">الاسم الكامل</label>
              <Input 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="اسم المستخدم" 
                className="bg-white border-slate-200" 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">البريد الإلكتروني</label>
              <Input 
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="email@example.com" 
                className="bg-white border-slate-200 text-left" 
                dir="ltr" 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">كلمة المرور</label>
              <Input 
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="******" 
                className="bg-white border-slate-200 text-left" 
                dir="ltr" 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">تأكيد كلمة المرور</label>
              <Input 
                name="password_confirmation"
                type="password"
                value={formData.password_confirmation}
                onChange={handleInputChange}
                placeholder="******" 
                className="bg-white border-slate-200 text-left" 
                dir="ltr" 
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="text-sm font-bold text-slate-800 block mb-3 border-b border-slate-200 pb-2">
              الأدوار الممنوحة (Roles)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {availableRoles.length > 0 ? (
                availableRoles.map(role => (
                  <div key={role.id} className="flex items-center space-x-2 space-x-reverse bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm transition-colors hover:border-primary/30">
                    <Checkbox 
                      id={`role-${role.id}`} 
                      checked={selectedRoles.includes(role.name)}
                      onCheckedChange={() => handleRoleToggle(role.name)}
                    />
                    <label 
                      htmlFor={`role-${role.id}`} 
                      className="text-sm font-medium text-slate-700 cursor-pointer flex-1 select-none"
                    >
                      {role.name}
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">جاري تحميل الأدوار...</p>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end gap-2 border-t border-slate-200 pt-4">
            <Button variant="outline" onClick={() => setIsAdding(false)} disabled={isSubmitting}>
              إلغاء
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90 min-w-[120px]" 
              onClick={handleSaveUser}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                'حفظ المستخدم'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden min-h-[200px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="animate-spin text-slate-400 w-8 h-8" />
          </div>
        ) : (
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
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">لا يوجد مستخدمين</TableCell>
                </TableRow>
              ) : (
                filteredUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-bold text-slate-800">{user.name}</TableCell>
                    <TableCell className="text-slate-500 font-medium">{user.email}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {user.roles?.map(role => (
                          <Badge key={role.id} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                            {role.name}
                          </Badge>
                        ))}
                        {(!user.roles || user.roles.length === 0) && <span className="text-xs text-slate-400">لا توجد أدوار</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.must_change_password ? (
                        <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 gap-1">
                          <ShieldAlert size={14} /> يطلب التغيير
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">آمن</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link to={`/settings/users/${user.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-primary/10">
                            <Eye size={16} />
                          </Button>
                        </Link>
                        <Link to={`/settings/users/edit/${user.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-primary/10">
                            <Edit size={16} />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteUser(user)}
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
        onClose={() => setDeleteModal({ isOpen: false, user: null })}
        onConfirm={confirmDelete}
        title="حذف مستخدم"
        message="هل أنت متأكد من رغبتك في حذف هذا المستخدم؟"
        itemName={deleteModal.user?.name}
        isLoading={isDeleting}
      />
    </div>
  );
};
