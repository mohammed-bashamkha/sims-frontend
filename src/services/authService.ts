import api from '../api/axios';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  must_change_password: boolean;
  roles?: Array<{ name: string }>;
  permissions_list?: string[];
}

export function isAdmin(user: AuthUser | null): boolean {
  if (!user) return false;
  return (user.roles ?? []).some(r => r.name === 'admin');
}

/**
 * hasPermission — checks if the currently stored user has a given permission.
 * Admins automatically bypass all permission checks.
 */
export function hasPermission(permission: string): boolean {
  const user = getStoredUser();
  if (!user) return false;
  if (isAdmin(user)) return true; // Admin bypasses all
  
  const permissions = user.permissions_list ?? [];
  
  // Check exact match
  if (permissions.includes(permission)) return true;
  
  // Check for 'ادارة' fallback (e.g., if checking 'المدارس.تعديل', also check 'المدارس.ادارة')
  if (permission.includes('.')) {
    const module = permission.split('.')[0];
    if (permissions.includes(`${module}.ادارة`)) return true;
  }
  
  return false;
}

export function hasAnyPermission(permissions: string[]): boolean {
  return permissions.some(hasPermission);
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

// POST /api/login
export async function login(payload: LoginPayload): Promise<{ token: string; user: AuthUser }> {
  const response = await api.post('/login', payload);
  const token: string = response.data.access_token;
  
  // Important: Store token immediately so subsequent user fetch uses it
  localStorage.setItem('auth_token', token);

  try {
    // Fetch current user with roles AND permissions after login
    const userResponse = await api.get('/user');
    const user: AuthUser = userResponse.data;
    localStorage.setItem('auth_user', JSON.stringify(user));
    return { token, user };
  } catch (error) {
    // If fetching user fails, clean up token
    localStorage.removeItem('auth_token');
    throw error;
  }
}

// POST /api/logout
export async function logout(): Promise<void> {
  try {
    await api.post('/logout');
  } finally {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
}

// POST /api/change-password
export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await api.post('/change-password', payload);
}

// Helpers
export function getStoredToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem('auth_user');
  return raw ? JSON.parse(raw) : null;
}

export function isAuthenticated(): boolean {
  return !!getStoredToken();
}
