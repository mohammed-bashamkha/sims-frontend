import api from '../api/axios';

export const gradeService = {
  downloadResultPdf: async (studentId: number, academicYearId: number, studentName: string) => {
    try {
      const response = await api.get(`/pdf/final-result/student/${studentId}/year/${academicYearId}`, {
        responseType: 'blob',
        timeout: 70000,
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `نتيجة-${studentName}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
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
