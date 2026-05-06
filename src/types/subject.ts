export interface Level {
  id: number;
  name: string;
}

export interface SchoolClass {
  id: number;
  name: string;
  level_id: number;
}

export interface Subject {
  id: number;
  name: string;
  level_id: number;
  school_class_id?: number; // For compatibility
  school_classes?: SchoolClass[];
  level?: Level;
}

export interface SubjectFormData {
  name: string;
  level_id: number;
  school_class_id: number[]; // Backend expects array
}
