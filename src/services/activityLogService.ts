import api from '../api/axios';

export interface ActivityLog {
  id: number;
  log_name: string;
  description: string;
  event: string;
  subject_type: string | null;
  subject_id: number | null;
  causer_id: number | null;
  properties: any;
  created_at: string;
  updated_at: string;
  causer?: {
    id: number;
    name: string;
    email: string;
  } | null;
  subject?: any | null;
}

export interface ActivityLogsResponse {
  current_page: number;
  data: ActivityLog[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

/**
 * Get all activity logs for admins, optionally filtered by user_id
 */
export async function getActivityLogs(page: number = 1, userId?: string | number): Promise<ActivityLogsResponse> {
  const params: any = { page };
  if (userId) {
    params.user_id = userId;
  }
  const response = await api.get('/activity-logs', { params });
  return response.data;
}

/**
 * Get activity logs for the currently authenticated user
 */
export async function getMyActivityLogs(page: number = 1): Promise<ActivityLogsResponse> {
  const response = await api.get('/my-activity-logs', { params: { page } });
  return response.data;
}
