import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

export const ChangePassword: React.FC = () => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard'); // Mock success routing
  };

  return (
    <form onSubmit={handleUpdate} className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-center text-primary mb-2">تغيير كلمة المرور</h2>
      
      <div className="flex flex-col gap-2 relative">
        <Label className="text-right">كلمة المرور الحالية</Label>
        <div className="relative">
          <Input 
            type={showCurrent ? "text" : "password"}
            placeholder="أدخل كلمة المرور الحالية"
            dir="rtl"
            className="pl-10 text-right"
          />
          <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
            {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>
      
      <div className="flex flex-col gap-2 relative">
        <Label className="text-right">كلمة المرور الجديدة</Label>
        <div className="relative">
          <Input 
            type={showNew ? "text" : "password"}
            placeholder="أدخل 8 أحرف على الأقل"
            dir="rtl"
            className="pl-10 text-right"
          />
          <button type="button" onClick={() => setShowNew(!showNew)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
            {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 relative">
        <Label className="text-right">تأكيد كلمة المرور الجديدة</Label>
        <div className="relative">
          <Input 
            type={showConfirm ? "text" : "password"}
            placeholder="أعد إدخال كلمة المرور"
            dir="rtl"
            className="pl-10 text-right"
          />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
            {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div className="flex gap-4 mt-4">
        <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
          إلغاء
        </Button>
        <Button type="submit" className="flex-1 font-bold">تحديث كلمة المرور</Button>
      </div>
      
      <div className="text-center text-sm mt-4">
        <Link to="/auth/login" className="font-medium text-primary hover:underline">العودة لتسجيل الدخول</Link>
      </div>
    </form>
  );
};
