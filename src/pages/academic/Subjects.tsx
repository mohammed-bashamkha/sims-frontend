import React from 'react';
import { BookOpen } from 'lucide-react';

export const Subjects: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <BookOpen size={64} className="mb-4 opacity-20" />
      <h3 className="text-xl font-bold text-slate-700">إدارة المواد الدراسية</h3>
      <p className="text-sm mt-2 max-w-md text-center text-slate-500">
        إعداد وتخصيص المواد الدراسية لكل صف دراسي، وتحديد الدرجات العظمى والصغرى.
      </p>
    </div>
  );
};
