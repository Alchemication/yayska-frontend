// API response types matching your backend
export interface ApiChild {
  id: number;
  name: string;
  school_year_id: number;
  school_year_name: string;
  user_id: number;
  memory: Record<string, any>;
  created_at: string;
  updated_at: string | null;
}

// Request types
export interface CreateChildRequest {
  name: string;
  school_year_id: number;
}

export interface UpdateChildRequest {
  name: string;
  school_year_id: number;
}

// Response types
export interface ChildrenResponse {
  children: ApiChild[];
}

export interface DeleteChildResponse {
  status: string;
  message: string;
}

// Simplified Child interface for the app (matches API structure)
export interface Child {
  id: number;
  name: string;
  yearId: number; // school_year_id
  year: string; // school_year_name
  userId: number;
  memory: Record<string, any>;
  createdAt: string;
  updatedAt: string | null;
}
