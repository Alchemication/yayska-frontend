// src/services/api.ts
import {
  SubjectLearningPath,
  LearningPathsResponse,
  ConceptMetadata,
} from '../types/curriculum';
import {
  SchoolYear,
  SchoolYearsResponse,
  EducationLevel,
  EducationLevelsResponse,
} from '../types/education';
import { CurriculumPlan } from '../components/Learning/MonthlyConceptsCarousel';
import {
  EDUCATION_LEVELS,
  SCHOOL_YEARS,
  getSchoolYearsByLevelId,
} from '../utils/schoolYearUtils';
import { fetchWithAuth, getAccessToken } from './authApi';
import Constants from 'expo-constants';

// Get environment variable helper
const getEnvVariable = (key: string, defaultValue: string = ''): string => {
  return (Constants.expoConfig?.extra as any)?.[key] || defaultValue;
};

// API base URL from environment variables with fallbacks
const API_BASE_URL = getEnvVariable(
  'API_URL',
  process.env.NODE_ENV === 'production'
    ? 'https://yayska-backend.vercel.app/api/v1'
    : 'http://localhost:8000/api/v1'
);

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Use fetchWithAuth for authenticated requests
  return fetchWithAuth<T>(endpoint, options);
}

// Monthly curriculum response type
interface MonthlyCurriculumResponse {
  curriculum_plans: CurriculumPlan[];
  is_summer_mode: boolean;
}

export const api = {
  getEducationLevels: async (): Promise<EducationLevel[]> => {
    console.log('Using static education levels data');
    return EDUCATION_LEVELS;
  },

  getSchoolYears: async (levelId: number): Promise<SchoolYear[]> => {
    console.log('Using static school years data');
    return getSchoolYearsByLevelId(levelId);
  },

  getConceptMetadata: (conceptId: number): Promise<ConceptMetadata> =>
    fetchAPI<ConceptMetadata>(`/concepts/${conceptId}/metadata`),

  getSubjectLearningPaths: async (
    yearId: number
  ): Promise<SubjectLearningPath[]> => {
    const response = await fetchAPI<LearningPathsResponse>(
      `/curriculum/subjects/${yearId}/learning_paths`
    );
    return response.subjects;
  },

  getMonthlyCurriculum: async (
    yearIds: number[],
    referenceMonth?: number
  ): Promise<MonthlyCurriculumResponse> => {
    const token = await getAccessToken();
    const yearIdsParam = yearIds.join(',');
    let url = `/concepts/monthly-curriculum?year_ids=${yearIdsParam}`;

    if (referenceMonth !== undefined) {
      url += `&reference_month=${referenceMonth}`;
    }

    try {
      return await fetchAPI<MonthlyCurriculumResponse>(url);
    } catch (error) {
      console.error('Failed to fetch monthly curriculum:', error);
      throw error;
    }
  },
};
