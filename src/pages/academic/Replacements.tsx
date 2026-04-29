import React from 'react';
import { FileQuestion } from 'lucide-react';

export const Replacements: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <FileQuestion size={64} className="mb-4 opacity-20" />
      <h3 className="text-xl font-bold text-slate-700">طلبات بدل فاقد</h3>
      <p className="text-sm mt-2 max-w-md text-center text-slate-500">
        إدارة ومعالجة طلبات استخراج المستندات (بدل فاقد/بدل تالف) للطلاب.
      </p>
    </div>
  );
};
