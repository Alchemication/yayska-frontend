import { fetchWithAuth } from './authApi';
import {
  ChatSessionFindOrCreateRequest,
  ChatSessionResponse,
  ChatMessageResponse,
  UserMessageCreate,
  MessageFeedbackUpdate,
} from '../types/chat';

const BASE_URL = '/chats';

export const chatApi = {
  findOrCreateSession: (
    data: ChatSessionFindOrCreateRequest
  ): Promise<ChatSessionResponse> => {
    return fetchWithAuth<ChatSessionResponse>(`${BASE_URL}/find-or-create`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  getMessages: (chatId: string): Promise<ChatMessageResponse[]> => {
    return fetchWithAuth<ChatMessageResponse[]>(
      `${BASE_URL}/${chatId}/messages?limit=100`
    );
  },

  sendMessage: (
    chatId: string,
    message: UserMessageCreate
  ): Promise<ChatMessageResponse> => {
    return fetchWithAuth<ChatMessageResponse>(
      `${BASE_URL}/${chatId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify(message),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  },

  updateMessageFeedback: (
    chatId: string,
    messageId: string,
    data: MessageFeedbackUpdate
  ): Promise<ChatMessageResponse> => {
    return fetchWithAuth<ChatMessageResponse>(
      `${BASE_URL}/${chatId}/messages/${messageId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  },
};
