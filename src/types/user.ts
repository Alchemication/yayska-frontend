// src/types/user.ts
// This matches the user model from the backend
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  picture_url?: string;
  memory: Record<string, any>;
  created_at: string;
  updated_at: string | null;
  last_login_at: string | null;
}

export interface UpdateUserRequest {
  memory?: Record<string, any>;
  first_name?: string;
  last_name?: string;
}
