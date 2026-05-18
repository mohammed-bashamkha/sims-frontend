export interface StudentEnrollment {
  id: number;
  school_id: number;
  class_id: number;
  academic_year_id: number;
  status: string | null;
  school_name: string | null;
  class_name: string | null;
  academic_year: string | null;
  has_transfer: boolean;
  has_temporary_admission: boolean;
  has_data_errors: boolean;
  has_replacement: boolean;
  has_final_result: boolean;
}

export interface Student {
  id: number;
  school_number: string;
  seat_number: string;
  full_name: string;
  nationality: string | null;
  gender: string;
  date_of_birth: string | null;
  place_of_birth: string | null;
  registration_date: string | null;
  current_enrollment: StudentEnrollment | null;
  enrollments: StudentEnrollment[];
}

export interface ShowStudentResponse {
  message: string;
  data: Student;
}
