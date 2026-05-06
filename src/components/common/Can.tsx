import React from 'react';
import { hasPermission } from '@/services/authService';

interface CanProps {
  permission: string;
  children: React.ReactNode;
  /** Optional fallback element to show when access is denied (default: nothing) */
  fallback?: React.ReactNode;
}

/**
 * <Can permission="create_student"> ... </Can>
 *
 * Renders children only if the currently logged-in user has the specified
 * Spatie permission. Admins always pass through regardless of the permission.
 *
 * Usage example:
 *   <Can permission="delete_student">
 *     <Button onClick={handleDelete}>حذف الطالب</Button>
 *   </Can>
 */
export const Can: React.FC<CanProps> = ({ permission, children, fallback = null }) => {
  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
};
