import React from 'react';
import { GraduationCap } from 'lucide-react';

export const StudentGrades: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <GraduationCap size={64} className="mb-4 opacity-20" />
      <h3 className="text-xl font-bold text-slate-700">رصد درجات الطلاب</h3>
      <p className="text-sm mt-2 max-w-md text-center text-slate-500">
        شاشة لإدخال وتعديل واعتماد درجات الطلاب في مختلف المواد الدراسية.
      </p>
    </div>
  );
};
