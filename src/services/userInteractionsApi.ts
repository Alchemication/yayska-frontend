import { fetchWithAuth } from './authApi';
import { AnalyticsSession } from '../utils/analytics';

export enum InteractionType {
  CONCEPT_STUDIED = 'CONCEPT_STUDIED',
  AI_CHAT_ENGAGED = 'AI_CHAT_ENGAGED',
}

export interface InteractionContext {
  [key: string]: any;
}

interface UserInteractionPayload {
  interaction_type: InteractionType;
  interaction_context: InteractionContext;
  session_id: string;
}

class UserInteractionsAPI {
  async logInteraction(
    interactionType: InteractionType,
    context: InteractionContext = {}
  ): Promise<void> {
    const payload: UserInteractionPayload = {
      interaction_type: interactionType,
      interaction_context: context,
      session_id: AnalyticsSession.getActiveSessionId(),
    };

    try {
      await fetchWithAuth<void>('/user-interactions', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Failed to log user interaction:', error);
      // Decide if this should be a silent failure or not
    }
  }
}

export const userInteractionsApi = new UserInteractionsAPI();
