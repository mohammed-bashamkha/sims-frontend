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
}

export function isAdmin(user: AuthUser | null): boolean {
  if (!user) return false;
  return (user.roles ?? []).some(r => r.name === 'admin');
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
  // Fetch current user with roles after login
  const userResponse = await api.get('/user', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const user: AuthUser = userResponse.data;
  return { token, user };
}

// POST /api/logout
export async function logout(): Promise<void> {
  await api.post('/logout');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
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
