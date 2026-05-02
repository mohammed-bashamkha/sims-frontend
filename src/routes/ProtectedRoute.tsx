import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated, getStoredUser, isAdmin } from '@/services/authService';

/**
 * ProtectedRoute — يمنع الوصول إلى الصفحات المحمية إذا لم يكن المستخدم مسجلاً.
 * إذا كان must_change_password = true يوجه لصفحة تغيير كلمة المرور.
 */
export const ProtectedRoute: React.FC = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/auth/login" replace />;
  } 

  const user = getStoredUser();
  // Admin يتجاهل must_change_password — نفس منطق EnsurePasswordIsChanged
  if (user?.must_change_password && !isAdmin(user)) {
    return <Navigate to="/auth/change-password" replace />;
  }

  return <Outlet />;
};

/**
 * GuestRoute — يمنع المستخدم المسجل من الوصول لصفحات المصادقة (login).
 */
export const GuestRoute: React.FC = () => {
  if (isAuthenticated()) {
    const user = getStoredUser();
    if (user?.must_change_password) {
      return <Navigate to="/auth/change-password" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
