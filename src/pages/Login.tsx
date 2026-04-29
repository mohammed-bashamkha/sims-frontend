import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard'); // Mock login navigation for now
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 relative">
        <Label htmlFor="username" className="text-right">اسم المستخدم</Label>
        <Input 
          id="username"
          placeholder="أدخل اسم المستخدم"
          defaultValue="admin"
          dir="rtl"
          className="bg-background"
        />
      </div>
      
      <div className="flex flex-col gap-2 relative">
        <Label htmlFor="password" className="text-right">كلمة المرور</Label>
        <div className="relative">
          <Input 
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="أدخل كلمة المرور"
            dir="rtl"
            className="pl-10 pr-3 bg-background text-right"
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>
      
      <div className="text-right -mt-2 text-sm">
        <button type="button" className="font-medium text-primary hover:underline transition-all">نسيت كلمة المرور؟</button>
      </div>
      
      <Button type="submit" size="lg" className="w-full font-bold">تسجيل الدخول</Button>
    </form>
  );
};
