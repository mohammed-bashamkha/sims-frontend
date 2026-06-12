import axios from 'axios';
import { toast } from '@/store/toastStore';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Attach token automatically to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response interceptor for Toasts and Auth
api.interceptors.response.use(
  (response) => {
    // Show success toast ONLY for mutation requests (POST/PUT/PATCH/DELETE)
    // GET requests should never show toasts — messages like "تم جلب البيانات" are noise
    if (response.config.method !== 'get' && response.data?.message) {
      toast(response.data.message, 'success');
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;

    // Handle unauthorized (401) — session expired
    if (status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      
      if (!window.location.pathname.includes('/auth/login') && !error.config.url?.includes('/login')) {
        window.location.href = '/auth/login';
      }
      return Promise.reject(error);
    }

    // Ignore connection errors for PDF/Blob requests
    if (error.config?.responseType === 'blob' && !error.response) {
      return Promise.reject(error);
    }

    // Handle 403 (Forbidden) — silently ignore for GET requests
    // The UI already hides unauthorized sections via the <Can> component
    // Only show error toast for mutation requests (user explicitly tried an action)
    if (status === 403) {
      if (error.config.method !== 'get') {
        toast(error.response?.data?.message || 'غير مصرح بهذا الإجراء', 'error');
      }
      return Promise.reject(error);
    }

    // Handle validation errors (422) — show the message, field errors are handled by components
    // Handle other errors (500, etc.)
    const message = error.response?.data?.message;
    if (message) {
      toast(message, 'error');
    } else if (!error.response) {
      toast('تعذر الاتصال بالخادم. يرجى التحقق من اتصالك.', 'error');
    }

    return Promise.reject(error);
  }
);

export default api;
