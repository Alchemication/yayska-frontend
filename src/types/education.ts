// src/types/education.ts
export interface EducationLevel {
  id: number;
  name: string;
  description?: string;
}

export interface SchoolYear {
  id: number;
  year_name: string;
  year_order: number;
}

export interface EducationLevelsResponse {
  levels: EducationLevel[];
}

export interface SchoolYearsResponse {
  school_years: SchoolYear[];
}
