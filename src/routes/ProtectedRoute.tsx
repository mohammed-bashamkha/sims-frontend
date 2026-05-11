import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated, getStoredUser, isAdmin, hasPermission } from '@/services/authService';

interface ProtectedRouteProps {
  /** If provided, the user must have this Spatie permission to access the route.
   *  Admins bypass this check automatically.
   */
  allowedPermission?: string;
}

/**
 * ProtectedRoute — يمنع الوصول إلى الصفحات المحمية إذا لم يكن المستخدم مسجلاً.
 * إذا كان must_change_password = true يوجه لصفحة تغيير كلمة المرور.
 * إذا تم تحديد allowedPermission ولم يمتلكه المستخدم، يعاد توجيهه للداشبورد مع رسالة خطأ.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedPermission }) => {

  if (!isAuthenticated()) {
    return <Navigate to="/auth/login" replace />;
  }

  const user = getStoredUser();

  // Admin يتجاهل must_change_password — نفس منطق EnsurePasswordIsChanged
  if (user?.must_change_password && !isAdmin(user)) {
    return <Navigate to="/auth/change-password" replace />;
  }

  // فحص الصلاحية إذا تم تحديدها
  if (allowedPermission && !hasPermission(allowedPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

/**
 * GuestRoute — يمنع المستخدم المسجل من الوصول لصفحات المصادقة (login).
 */
export const GuestRoute: React.FC = () => {
  if (isAuthenticated()) {
    const user = getStoredUser();
    if (user?.must_change_password && !isAdmin(user)) {
      return <Navigate to="/auth/change-password" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
