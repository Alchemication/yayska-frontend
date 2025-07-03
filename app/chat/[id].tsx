import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Platform,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatView } from '../../src/components/Chat/ChatView';
import { chatApi } from '../../src/services/chatApi';
import { ChatMessageResponse, ChatMessageRole } from '../../src/types/chat';
import { colors } from '../../src/theme/colors';
import { trackEvent } from '../../src/utils/analytics';
import { AppHeader, PageHeader } from '../../src/components/Navigation';
import { UserProfile } from '../../src/components/Auth/UserProfile';
import { crossPlatformAlert } from '../../src/utils/crossPlatformAlert';
import { useAppHeader } from '../../src/hooks/useAppHeader';
import {
  userInteractionsApi,
  InteractionType as UserInteractionType,
} from '../../src/services/userInteractionsApi';

export default function ChatScreen() {
  const { id, conceptName, conceptDescription, conceptId } =
    useLocalSearchParams<{
      id: string;
      conceptName?: string;
      conceptDescription?: string;
      conceptId?: string;
    }>();
  const {
    children,
    selectedChild,
    showChildrenMenu,
    showUserProfile,
    toggleChildrenMenu,
    selectChild,
    toggleUserProfile,
  } = useAppHeader();
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null);

  const loadMessages = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const fetchedMessages = await chatApi.getMessages(id);
      setMessages(fetchedMessages);
      await trackEvent('CHAT_SESSION_LOADED', {
        session_id: id,
        message_count: fetchedMessages.length,
      });
    } catch (error) {
      console.error('Failed to load messages:', error);
      crossPlatformAlert(
        'Error',
        'Could not load chat history. Please try again.'
      );
      await trackEvent('CHAT_LOAD_ERROR', {
        session_id: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    return () => {
      if (id && messages.length > 0) {
        trackEvent('CHAT_SESSION_ENDED', {
          session_id: id,
          final_message_count: messages.length,
          session_duration_estimate: 'unknown',
        });
      }
    };
  }, [id, messages.length]);

  const handleSendMessage = async (
    text: string,
    metadata?: { source: string; prompt_text?: string }
  ) => {
    if (!id || isSending) return;

    const source = metadata?.source || 'user_typed';

    if (source === 'user_typed') {
      userInteractionsApi.logInteraction(UserInteractionType.AI_CHAT_ENGAGED, {
        session_id: id,
        concept_id: conceptId ? Number(conceptId) : undefined,
      });
    }

    const userMessage: ChatMessageResponse = {
      id: `user-${Date.now()}`,
      session_id: id,
      role: ChatMessageRole.USER,
      content: text,
      created_at: new Date().toISOString(),
    };

    const assistantMessagePlaceholder: ChatMessageResponse = {
      id: `assistant-${Date.now()}`,
      session_id: id,
      role: ChatMessageRole.ASSISTANT,
      content: '',
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessagePlaceholder]);
    setIsSending(true);

    try {
      await trackEvent('CHAT_MESSAGE_SENT', {
        session_id: id,
        message_length: text.length,
        source: source,
        prompt_text: metadata?.prompt_text,
      });

      await chatApi.streamMessage(id, { content: text }, (chunk) => {
        const cleanedChunk = chunk.replace(/^"|"$/g, '');
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessagePlaceholder.id
              ? { ...m, content: m.content + cleanedChunk }
              : m
          )
        );
      });
    } catch (error: any) {
      console.error('Failed to send or stream message:', error);
      crossPlatformAlert(
        'Error',
        'Could not get a response from Yay. Please try again.'
      );

      setMessages((prev) =>
        prev.filter(
          (m) =>
            m.id !== userMessage.id && m.id !== assistantMessagePlaceholder.id
        )
      );

      await trackEvent('CHAT_STREAM_ERROR', {
        session_id: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleFeedback = async (
    messageId: string,
    vote: 1 | -1,
    text?: string
  ): Promise<void> => {
    if (!id) return;
    try {
      await chatApi.updateMessageFeedback(id, messageId, {
        feedback: { vote, text },
      });

      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, feedback_thumbs: vote } : m
        )
      );

      await trackEvent('CHAT_FEEDBACK_GIVEN', {
        session_id: id,
        message_id: messageId,
        vote: vote,
        has_text: !!text && text.length > 0,
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      crossPlatformAlert(
        'Error',
        'Could not submit feedback. Please try again.'
      );

      await trackEvent('CHAT_FEEDBACK_ERROR', {
        session_id: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          header: () => (
            <AppHeader
              children={children}
              selectedChild={selectedChild}
              showChildrenMenu={showChildrenMenu}
              toggleChildrenMenu={toggleChildrenMenu}
              selectChild={selectChild}
              toggleUserProfile={toggleUserProfile}
              showBackButton={true}
            />
          ),
          headerShown: true,
        }}
      />
      {isLoading ? (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={colors.primary.green} />
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      ) : (
        <>
          {conceptName && (
            <PageHeader title={conceptName} subtitle="Chat with Yay" />
          )}
          <ChatView
            messages={messages}
            onSendMessage={handleSendMessage}
            onFeedback={handleFeedback}
            isSendingMessage={isSending}
            conceptName={conceptName}
          />
        </>
      )}
      {showUserProfile && (
        <View style={styles.profileOverlay}>
          <UserProfile
            isVisible={showUserProfile}
            onClose={toggleUserProfile}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.text.secondary,
  },
  profileOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
});
