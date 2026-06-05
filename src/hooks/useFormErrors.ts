import { useState } from 'react';
import { toast } from '@/store/toastStore';

export const useFormErrors = (options: { showToastOn422?: boolean } = { showToastOn422: false }) => {
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const handleApiError = (error: any, defaultMessage: string = 'حدث خطأ أثناء حفظ البيانات') => {
    if (error.response?.status === 422) {
      setErrors(error.response.data.errors || {});
      if (options.showToastOn422) {
        const backendMessage = error.response?.data?.message;
        toast(backendMessage || 'يرجى التحقق من صحة البيانات المدخلة', 'error');
      }
    } else {
      toast(error.response?.data?.message || defaultMessage, 'error');
    }
  };

  const clearErrors = () => setErrors({});

  return { errors, setErrors, handleApiError, clearErrors };
};
