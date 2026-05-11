import api from '../api/axios';

export interface AcademicYear {
  id: number;
  year: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'inactive';
}

export interface AcademicYearFormData {
  year: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'inactive';
}

export const academicYearService = {
  getAcademicYears: async () => {
    const response = await api.get<{ data: AcademicYear[] }>('/academic-years');
    return response.data.data;
  },

  createAcademicYear: async (data: AcademicYearFormData) => {
    const response = await api.post<{ data: AcademicYear }>('/academic-years', data);
    return response.data.data;
  },

  updateAcademicYear: async (id: number, data: AcademicYearFormData) => {
    const response = await api.put<{ data: AcademicYear }>(`/academic-years/${id}`, data);
    return response.data.data;
  },

  deleteAcademicYear: async (id: number) => {
    const response = await api.delete(`/academic-years/${id}`);
    return response.data;
  }
};
