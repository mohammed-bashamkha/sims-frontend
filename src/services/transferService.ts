import api from '../api/axios';

export type TransferStatus = 'pending' | 'approved' | 'rejected';
export type TransferType = 'transfer' | 'admission';

export interface Student {
  id: number;
  full_name: string;
  school_number: string;
  seat_number?: string;
  gender?: string;
  nationality?: string;
  date_of_birth?: string;
  place_of_birth?: string;
}

export interface School {
  id: number;
  name: string;
}

export interface SchoolClass {
  id: number;
  name: string;
}

export interface AcademicYear {
  id: number;
  year: string;
  name?: string;
}

export interface TransferAdmissionRecord {
  id: number;
  student_id: number;
  academic_year_id: number;
  from_school_id: number | null;
  from_external_school_name: string | null;
  to_school_id: number;
  class_id: number;
  type: TransferType;
  status: TransferStatus;
  request_date: string;
  approval_date: string | null;
  start_date: string | null;
  end_date: string | null;
  reason: string | null;
  based_on: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  student: Student;
  from_school: School | null;
  to_school: School;
  school_class: SchoolClass;
  academic_year: AcademicYear;
  created_by_user: { id: number; name: string };
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
  first_page_url: string;
  last_page_url: string;
  next_page_url: string | null;
  prev_page_url: string | null;
  path: string;
}

export const transferService = {
  getTransfers: async (params: {
    type?: TransferType;
    status?: TransferStatus;
    search?: string;
    page?: number;
    academic_year_id?: number;
    to_school_id?: number;
    school_id?: number;
    class_id?: number;
    gender?: string;
  }) => {
    const response = await api.get<PaginatedResponse<TransferAdmissionRecord>>('/transfers-admissions', { params });
    return response.data;
  },

  storeTransfer: async (data: {
    student_id: number;
    to_school_id: number;
    reason?: string;
    based_on?: string;
    request_date?: string;
    status?: TransferStatus;
  }) => {
    const response = await api.post<{ message: string; data: TransferAdmissionRecord }>('/transfers', data);
    return response.data;
  },

  storeAdmission: async (data: {
    student_id: number;
    to_school_id: number;
    request_date?: string;
    start_date?: string;
    end_date?: string;
    reason?: string;
    based_on?: string;
    status?: TransferStatus;
  }) => {
    const response = await api.post<{ message: string; data: TransferAdmissionRecord }>('/admissions', data);
    return response.data;
  },

  updateStatus: async (id: number, data: { status: TransferStatus; approval_date?: string; reason?: string; based_on?: string }) => {
    const response = await api.put<{ message: string; data: TransferAdmissionRecord }>(`/transfers-admissions/${id}`, data);
    return response.data;
  },

  deleteTransfer: async (id: number) => {
    const response = await api.delete<{ message: string }>(`/transfers-admissions/${id}`);
    return response.data;
  },

  registerExternalStudent: async (data: {
    full_name: string;
    school_number: string;
    seat_number: string;
    gender: string;
    nationality: string;
    date_of_birth: string;
    place_of_birth: string;
    to_school_id: number;
    class_id: number;
    academic_year_id: number;
    from_external_school_name: string;
    reason?: string;
    based_on?: string;
  }) => {
    const response = await api.post<{ message: string; data: any }>('/register-student-out-region', data);
    return response.data;
  },
  downloadTransferPdf: async (id: number) => {
    return transferService._downloadPdf(`/pdf/transfer/${id}`, `transfer-order-${id}.pdf`);
  },
  downloadAdmissionPdf: async (id: number) => {
    return transferService._downloadPdf(`/pdf/admission/${id}`, `admission-order-${id}.pdf`);
  },
  _downloadPdf: async (url: string, filename: string) => {
    try {
      const response = await api.get(url, {
        responseType: 'blob',
        timeout: 180000,
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
        link.remove();
      }, 100);
    } catch (error: any) {
      if (error.response?.data instanceof Blob) {
        const text = await error.response.data.text();
        const data = JSON.parse(text);
        throw { ...error, response: { ...error.response, data } };
      }
      throw error;
    }
  }
};
