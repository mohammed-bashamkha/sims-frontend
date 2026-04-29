import React from 'react';
import { Layers } from 'lucide-react';

export const SchoolClasses: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <Layers size={64} className="mb-4 opacity-20" />
      <h3 className="text-xl font-bold text-slate-700">إدارة الصفوف الدراسية</h3>
      <p className="text-sm mt-2 max-w-md text-center text-slate-500">
        واجهة للتحكم بالصفوف والشعب الدراسية التابعة لكل مدرسة، وتوزيع الطلاب عليها.
      </p>
    </div>
  );
};
