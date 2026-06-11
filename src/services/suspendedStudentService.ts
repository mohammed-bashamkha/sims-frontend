import api from '../api/axios';

export interface Student {
  id: number;
  full_name: string;
  school_number: string;
}

export interface AcademicYear {
  id: number;
  year: string;
}

export interface SchoolClass {
  id: number;
  name: string;
}

export interface School {
  id: number;
  name: string;
}

export interface SuspendedEnrollment {
  id: number;
  student_id: number;
  status: string;
  academic_year_id: number;
  school_id: number;
  class_id: number;
  created_at: string;
  updated_at: string;
  student: Student;
  school: School;
  school_class: SchoolClass;
  academic_year: AcademicYear;
  original_school?: School;
  expired_admission?: any;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export const suspendedStudentService = {
  getSuspendedStudents: async (params: {
    search?: string;
    academic_year_id?: number;
    school_id?: number;
    page?: number;
  }) => {
    // The backend returns { message: string, data: PaginatedResponse }
    const response = await api.get<{ message: string; data: PaginatedResponse<SuspendedEnrollment> }>('/suspended-students', { params });
    return response.data.data;
  },

  restoreStudent: async (studentId: number, action: 'return_to_original' | 'permanent_transfer') => {
    const response = await api.post(`/suspended-students/${studentId}/restore`, { action });
    return response.data;
  }
};
