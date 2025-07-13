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
import {
  ApiChild,
  CreateChildRequest,
  UpdateChildRequest,
  ChildrenResponse,
  DeleteChildResponse,
  Child,
} from '../types/child';
import { CurriculumPlan } from '../components/Learning/MonthlyConceptsCarousel';
import {
  EDUCATION_LEVELS,
  SCHOOL_YEARS,
  getSchoolYearsByLevelId,
} from '../utils/schoolYearUtils';
import { fetchWithAuth, getAccessToken } from './authApi';
import Constants from 'expo-constants';
import { AnalyticsEvent, setEventSender } from '../utils/analytics';

import { User, UpdateUserRequest } from '../types/user';

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

// Helper function to convert API child to app format
export const convertApiChildToLocal = (apiChild: ApiChild): Child => ({
  id: apiChild.id,
  name: apiChild.name,
  yearId: apiChild.school_year_id,
  year: apiChild.school_year_name,
  userId: apiChild.user_id,
  memory: apiChild.memory,
  createdAt: apiChild.created_at,
  updatedAt: apiChild.updated_at,
});

export const api = {
  // Analytics tracking
  trackEvent: async (event: AnalyticsEvent): Promise<void> => {
    const apiCallId = Math.random().toString(36).substr(2, 9);

    try {
      console.log(
        `[API-${apiCallId}] 🚀 SENDING to backend:`,
        event.event_type,
        event.session_id.substring(0, 8) + '...',
        'Payload keys:',
        Object.keys(event.payload).join(', ')
      );

      const response = await fetchAPI<void>('/events/', {
        method: 'POST',
        body: JSON.stringify(event),
      });

      console.log(
        `[API-${apiCallId}] ✅ SUCCESS backend response:`,
        event.event_type
      );
    } catch (error) {
      console.error(
        `[API-${apiCallId}] ❌ FAILED backend call:`,
        event.event_type,
        error
      );
      // Don't throw - analytics failures shouldn't break the app
    }
  },

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
      `/curriculum/subjects/${yearId}/learning-paths`
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

  // Children API endpoints
  children: {
    // GET /api/v1/children/
    getAll: async (): Promise<Child[]> => {
      const response = await fetchAPI<ChildrenResponse>('/children/');
      return response.children.map(convertApiChildToLocal);
    },

    // POST /api/v1/children/
    create: async (childData: CreateChildRequest): Promise<Child> => {
      const apiChild = await fetchAPI<ApiChild>('/children/', {
        method: 'POST',
        body: JSON.stringify(childData),
      });
      return convertApiChildToLocal(apiChild);
    },

    // PUT /api/v1/children/{id}
    update: async (
      id: number,
      childData: UpdateChildRequest
    ): Promise<Child> => {
      const apiChild = await fetchAPI<ApiChild>(`/children/${id}`, {
        method: 'PUT',
        body: JSON.stringify(childData),
      });
      return convertApiChildToLocal(apiChild);
    },

    // DELETE /api/v1/children/{id}
    delete: async (id: number): Promise<DeleteChildResponse> => {
      return fetchAPI<DeleteChildResponse>(`/children/${id}`, {
        method: 'DELETE',
      });
    },
  },

  user: {
    updateMe: async (userData: UpdateUserRequest): Promise<User> => {
      // The API now returns the user object at the root, so we expect type User directly.
      return fetchAPI<User>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(userData),
      });
    },
  },
};

// Set up the analytics event sender
setEventSender(api.trackEvent);
