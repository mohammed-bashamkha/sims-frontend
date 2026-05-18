import api from '../api/axios';
import type { ShowStudentResponse } from '../types/student';

export const studentService = {
  getStudents: async (params: { search?: string; page?: number; school_id?: string | number; class_id?: string | number; academic_year_id?: string | number }) => {
    const response = await api.get('/students', { params });
    return response.data;
  },

  getStudentById: async (id: string | number): Promise<ShowStudentResponse> => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },
};
