import { SchoolYear, EducationLevel } from '../types/education';

export const CORE_SUBJECTS = [
  { id: 'english', name: 'English', emoji: '📚' },
  { id: 'gaeilge', name: 'Gaeilge', emoji: '🇮🇪' },
  { id: 'mathematics', name: 'Mathematics', emoji: '➗' },
  { id: 'history', name: 'History', emoji: '📜' },
  { id: 'geography', name: 'Geography', emoji: '🌍' },
  { id: 'science', name: 'Science', emoji: '🔬' },
  { id: 'visual_arts', name: 'Visual Arts', emoji: '🖼️' },
  { id: 'music', name: 'Music', emoji: '🎵' },
  { id: 'drama', name: 'Drama', emoji: '🎭' },
  { id: 'physical_education', name: 'Physical Education', emoji: '🏃‍♀️' },
  {
    id: 'sphe',
    name: 'Social, Personal and Health Education',
    emoji: '❤️',
  },
];

export const CHILD_INTERESTS = [
  {
    id: 'sports',
    name: 'Sports',
    emoji: '⚽️',
    example: 'explain fractions using minutes in a match.',
  },
  {
    id: 'animals',
    name: 'Animals',
    emoji: '🐾',
    example: 'practice counting by comparing different animals.',
  },
  {
    id: 'art',
    name: 'Art & Crafts',
    emoji: '🎨',
    example: 'learn shapes and colors while talking about a painting.',
  },
  {
    id: 'building',
    name: 'Building & LEGO',
    emoji: '🧱',
    example: 'explore geometry by building different structures.',
  },
  {
    id: 'fantasy',
    name: 'Fantasy & Magic',
    emoji: '🦄',
    example: 'write fun stories to improve grammar.',
  },
  {
    id: 'space',
    name: 'Space',
    emoji: '🚀',
    example: 'use planets and rockets to make numbers exciting.',
  },
  {
    id: 'nature',
    name: 'Nature & Outdoors',
    emoji: '🌳',
    example: 'learn about seasons on a walk in the park.',
  },
];

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
export const getYearNameById = (yearId: number): string => {
  const year = getSchoolYearById(yearId);
  return year ? year.year_name : '';
};
