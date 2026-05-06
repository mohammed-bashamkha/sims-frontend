export interface School {
  id: number;
  name: string;
  school_type: 'public' | 'private';
  capacity: number;
  current_students: number;
  address: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SchoolFormData {
  name: string;
  school_type: 'public' | 'private';
  capacity: number;
  address: string;
}
