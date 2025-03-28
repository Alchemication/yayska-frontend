import { SchoolYear, EducationLevel } from '../types/education';

// Hard-coded education levels
export const EDUCATION_LEVELS: EducationLevel[] = [
  {
    id: 1,
    name: 'Primary School',
    description: 'Ages 4-12, from Junior Infants through Sixth Class',
  },
];

// Hard-coded school years
export const SCHOOL_YEARS: SchoolYear[] = [
  {
    id: 1,
    year_name: 'Junior Infants',
    year_order: 1,
  },
  {
    id: 2,
    year_name: 'Senior Infants',
    year_order: 2,
  },
  {
    id: 3,
    year_name: 'First Class',
    year_order: 3,
  },
  {
    id: 4,
    year_name: 'Second Class',
    year_order: 4,
  },
  {
    id: 5,
    year_name: 'Third Class',
    year_order: 5,
  },
  {
    id: 6,
    year_name: 'Fourth Class',
    year_order: 6,
  },
  {
    id: 7,
    year_name: 'Fifth Class',
    year_order: 7,
  },
  {
    id: 8,
    year_name: 'Sixth Class',
    year_order: 8,
  },
];

// Helper function to get school years by education level id
export const getSchoolYearsByLevelId = (levelId: number): SchoolYear[] => {
  return SCHOOL_YEARS; // All years belong to the primary level
};

// Helper function to get a school year by id
export const getSchoolYearById = (yearId: number): SchoolYear | undefined => {
  return SCHOOL_YEARS.find((year) => year.id === yearId);
};

// Helper function to get a year name by id
export const getYearNameById = (yearId: number | null | undefined): string => {
  if (!yearId) return '';
  const year = getSchoolYearById(yearId);
  return year ? year.year_name : '';
};
