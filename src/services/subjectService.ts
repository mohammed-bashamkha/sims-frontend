import api from '@/api/axios';
import type { Subject, SubjectFormData, Level, SchoolClass } from '@/types/subject';

export const subjectService = {
  getSubjects: async (params?: { search?: string; level_id?: string | number }) => {
    const response = await api.get<Subject[]>('/subjects', { params });
    return response.data;
  },

  getSubject: async (id: number | string) => {
    const response = await api.get<Subject>(`/subjects/${id}`);
    return response.data;
  },

  createSubject: async (data: SubjectFormData) => {
    const response = await api.post<Subject>('/subjects', data);
    return response.data;
  },

  updateSubject: async (id: number | string, data: SubjectFormData) => {
    const response = await api.put<Subject>(`/subjects/${id}`, data);
    return response.data;
  },

  deleteSubject: async (id: number | string) => {
    const response = await api.delete(`/subjects/${id}`);
    return response.data;
  },

  getLevels: async () => {
    const response = await api.get<Level[]>('/levels');
    return response.data;
  },

  getClasses: async () => {
    const response = await api.get<SchoolClass[]>('/school-classes');
    // If backend returns paginated, handle it
    if ((response.data as any).data) {
        return (response.data as any).data;
    }
    return response.data;
  },
};
