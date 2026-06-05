import { useState } from 'react';
import { toast } from '@/store/toastStore';

export const useFormErrors = () => {
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const handleApiError = (error: any, defaultMessage: string = 'حدث خطأ أثناء حفظ البيانات') => {
    if (error.response?.status === 422) {
      setErrors(error.response.data.errors || {});
      toast('يرجى التحقق من صحة البيانات المدخلة', 'error');
    } else {
      toast(error.response?.data?.message || defaultMessage, 'error');
    }
  };

  const clearErrors = () => setErrors({});

  return { errors, setErrors, handleApiError, clearErrors };
};
