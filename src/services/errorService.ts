import api from '../api/axios';

export interface Student {
  id: number;
  full_name: string;
  school_number: string;
}

export interface User {
  id: number;
  name: string;
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

export interface StudentError {
  id: number;
  student_id: number;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  reason: string | null;
  academic_year_id: number;
  school_id: number;
  class_id: number;
  createdBy: number;
  created_at: string;
  updated_at: string;
  student: Student;
  created_by?: User;
  academic_year: AcademicYear;
  school_class: SchoolClass;
  school: School;
  all_errors?: StudentError[];
}

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

export const errorService = {
  getErrors: async (params: {
    search?: string;
    academic_year_id?: number;
    school_id?: number;
    class_id?: number;
    page?: number;
  }) => {
    const response = await api.get<PaginatedResponse<StudentError>>('/errors', { params });
    return response.data;
  },

  getErrorById: async (id: string | number) => {
    const response = await api.get<{ data: StudentError }>(`/errors/${id}`);
    return response.data.data;
  },

  deleteError: async (id: string | number) => {
    const response = await api.delete(`/errors/${id}`);
    return response.data;
  },

  exportErrors: async (academic_year_id: number) => {
    const response = await api.post('/errors/export', { academic_year_id }, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Student_Errors_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};
