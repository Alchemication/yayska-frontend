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

const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://yayska-backend.vercel.app/api/v1'
    : 'http://localhost:8000/api/v1';

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
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new APIError(response.status, `API Error: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new Error('Network error: Unable to connect to the server');
  }
}

export const api = {
  getEducationLevels: async (): Promise<EducationLevel[]> => {
    const response = await fetchAPI<EducationLevelsResponse>(
      '/education/education-levels'
    );
    return response.levels;
  },

  getSchoolYears: async (levelId: number): Promise<SchoolYear[]> => {
    const response = await fetchAPI<SchoolYearsResponse>(
      `/education/education-levels/${levelId}/years`
    );
    return response.school_years;
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
};
