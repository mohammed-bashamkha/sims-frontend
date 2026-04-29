import React from 'react';
import { Outlet } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_center,_#1565C0_0%,_#0D47A1_100%)] p-4">
      <div className="bg-card w-full max-w-[440px] p-10 rounded-xl shadow-lg text-center">
        <div className="mb-8 items-center flex flex-col">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-4">
            <ShieldCheck size={48} />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-1">نظام إدارة بيانات الطلاب الإلكتروني</h1>
          <p className="text-muted-foreground text-sm">وزارة التربية والتعليم</p>
        </div>
        <div className="mb-8 text-right">
          <Outlet />
        </div>
        <div className="text-xs text-muted-foreground border-t pt-4 leading-relaxed">
          <p>هذا النظام مخصص للموظفين المصرح لهم فقط. يرجى الحفاظ على سرية بيانات الدخول.</p>
        </div>
      </div>
    </div>
  );
};
