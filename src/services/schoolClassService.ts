import api from '../api/axios';

export interface SchoolClass {
  id: number;
  name: string;
}

export const schoolClassService = {
  getSchoolClasses: async () => {
    const response = await api.get<SchoolClass[]>('/school-classes');
    return response.data;
  },
};
