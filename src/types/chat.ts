// src/types/chat.ts

export enum ChatMessageRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
}

export enum EntryPointType {
  CONCEPT_COACH = 'CONCEPT_COACH',
}

export interface ChatSessionFindOrCreateRequest {
  child_id: number;
  entry_point_type: EntryPointType;
  context_data: {
    concept_id: number;
    concept_name?: string;
    section?: string;
  };
}

export interface ChatSessionResponse {
  id: string; // uuid
  user_id: number;
  child_id: number;
  title: string;
  entry_point_type: string;
  entry_point_context: object;
  created_at: string; // date-time
  updated_at: string | null; // date-time
}

export interface ChatMessageResponse {
  id: string; // uuid
  session_id: string; // uuid
  role: ChatMessageRole;
  content: string;
  feedback_thumbs?: number | null; // -1 for down, 1 for up
  created_at: string; // date-time
}

export interface UserMessageCreate {
  content: string;
}

export interface MessageFeedbackUpdate {
  feedback: {
    vote: 1 | -1;
    text?: string;
  };
}
