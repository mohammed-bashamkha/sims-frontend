import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from 'lucide-react';
import { changePassword } from '@/services/authService';
import { useFormErrors } from '@/hooks/useFormErrors';

export const ChangePassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { errors, handleApiError, clearErrors } = useFormErrors();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    clearErrors();

    if (newPassword !== confirmPassword) {
      setError('كلمة المرور الجديدة وتأكيدها غير متطابقتين');
      return;
    }
    if (newPassword.length < 8) {
      setError('كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    setIsLoading(true);
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });

      // Update stored user — mark must_change_password as false
      const raw = localStorage.getItem('auth_user');
      if (raw) {
        const user = JSON.parse(raw);
        user.must_change_password = false;
        localStorage.setItem('auth_user', JSON.stringify(user));
      }

      navigate('/dashboard');
    } catch (err: any) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpdate} className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-primary mb-1">تغيير كلمة المرور</h2>
        <p className="text-sm text-muted-foreground">يجب عليك تغيير كلمة المرور قبل المتابعة</p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm animate-in fade-in">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Password strength hint */}
      {newPassword && (
        <div className={`flex items-center gap-2 text-xs px-4 py-2 rounded-lg ${newPassword.length >= 8 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
          <CheckCircle2 size={14} />
          {newPassword.length >= 8 ? 'قوة كلمة المرور مقبولة ✓' : `تحتاج ${8 - newPassword.length} أحرف إضافية`}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label className="text-right font-bold text-slate-700">كلمة المرور الحالية</Label>
        <div className="relative">
          <Input
            type={showCurrent ? 'text' : 'password'}
            placeholder="أدخل كلمة المرور الحالية"
            dir="rtl"
            className="pl-10 text-right"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
          />
          <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
            {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.current_password && <span className="text-xs text-red-500 font-medium">{errors.current_password[0]}</span>}
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-right font-bold text-slate-700">كلمة المرور الجديدة</Label>
        <div className="relative">
          <Input
            type={showNew ? 'text' : 'password'}
            placeholder="8 أحرف على الأقل"
            dir="rtl"
            className="pl-10 text-right"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
          <button type="button" onClick={() => setShowNew(!showNew)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
            {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.new_password && <span className="text-xs text-red-500 font-medium">{errors.new_password[0]}</span>}
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-right font-bold text-slate-700">تأكيد كلمة المرور الجديدة</Label>
        <div className="relative">
          <Input
            type={showConfirm ? 'text' : 'password'}
            placeholder="أعد إدخال كلمة المرور"
            dir="rtl"
            className="pl-10 text-right"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
            {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full font-bold h-12 rounded-xl" disabled={isLoading}>
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin" />
            جاري الحفظ...
          </span>
        ) : 'تحديث كلمة المرور'}
      </Button>
    </form>
  );
};
