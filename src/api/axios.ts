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
    // Also show toast for GET requests if they explicitly have a message (e.g. some custom actions)
    else if (response.config.method === 'get' && response.data?.message && response.status === 200) {
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

    // Handle global error toasts
    const message = error.response?.data?.message;

    // Ignore connection errors for PDF/Blob requests if they already succeeded or if it's a timeout
    if (error.config?.responseType === 'blob' && !error.response) {
      return Promise.reject(error);
    }

    if (message && error.response?.status !== 401) {
      toast(message, 'error');
    } else if (!error.response) {
      toast('تعذر الاتصال بالخادم. يرجى التحقق من اتصالك.', 'error');
    }

    return Promise.reject(error);
  }
);

export default api;
