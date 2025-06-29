import { fetchWithAuth, getAccessToken, API_BASE_URL } from './authApi';
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

  streamMessage: async (
    chatId: string,
    message: UserMessageCreate,
    onChunk: (chunk: string) => void
  ): Promise<void> => {
    const accessToken = await getAccessToken();
    const url = `${API_BASE_URL}${BASE_URL}/${chatId}/messages/stream`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Request failed with status ${response.status}: ${errorText}`
        );
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          onChunk(chunk);
        }
      }
    } catch (error) {
      console.error('Error during streaming:', error);
      throw error;
    }
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
