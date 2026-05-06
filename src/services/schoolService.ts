import api from '@/api/axios';
import type { School, SchoolFormData } from '@/types/school';

export const schoolService = {
  getSchools: async (search?: string, schoolType?: string) => {
    const response = await api.get<School[]>('/schools', {
      params: { search, school_type: schoolType }
    });
    return response.data;
  },

  getSchool: async (id: number | string) => {
    const response = await api.get<School>(`/schools/${id}`);
    return response.data;
  },

  createSchool: async (data: SchoolFormData) => {
    const response = await api.post<School>('/schools', data);
    return response.data;
  },

  updateSchool: async (id: number | string, data: SchoolFormData) => {
    const response = await api.put<School>(`/schools/${id}`, data);
    return response.data;
  },

  deleteSchool: async (id: number | string) => {
    const response = await api.delete(`/schools/${id}`);
    return response.data;
  },
};
