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
    // Show success toast for non-GET requests if backend returns a message
    if (response.config.method !== 'get' && response.data?.message) {
      toast(response.data.message, 'success');
    }
    return response;
  },
  (error) => {
    // Handle unauthorized (401)
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      
      // Don't redirect if we are already on login page or trying to login
      if (!window.location.pathname.includes('/auth/login') && !error.config.url?.includes('/login')) {
        window.location.href = '/auth/login';
      }
    }

    // Ignore connection errors for PDF/Blob requests if they already succeeded or if it's a timeout
    if (error.config?.responseType === 'blob' && !error.response) {
      return Promise.reject(error);
    }

    const message = error.response?.data?.message;

    // Handle global error toasts
    if (error.response?.status === 422) {
      // For validation errors, we show a general message, field specific errors are handled by components
      toast(message || 'يرجى التحقق من صحة البيانات المدخلة', 'error');
    } else if (message && error.response?.status !== 401) {
      toast(message, 'error');
    } else if (!error.response) {
      toast('تعذر الاتصال بالخادم. يرجى التحقق من اتصالك.', 'error');
    }

    return Promise.reject(error);
  }
);

export default api;
