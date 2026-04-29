import React from 'react';
import { UserX } from 'lucide-react';

export const SuspendedStudents: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <UserX size={64} className="mb-4 opacity-20 text-red-500" />
      <h3 className="text-xl font-bold text-slate-700">الطلاب الموقوفين</h3>
      <p className="text-sm mt-2 max-w-md text-center text-slate-500">
        عرض وإدارة سجلات الطلاب الموقوفين أكاديمياً أو إدارياً، والتحكم في حالات إيقافهم.
      </p>
    </div>
  );
};
