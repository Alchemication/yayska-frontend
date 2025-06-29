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
import { AppHeader } from '../../src/components/Navigation/AppHeader';
import { UserProfile } from '../../src/components/Auth/UserProfile';
import { Child, getChildren } from '../../src/utils/storage';
import { resolveActiveChild } from '../../src/utils/activeChild';
import { crossPlatformAlert } from '../../src/utils/crossPlatformAlert';

const ConceptHeader = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <View style={styles.conceptHeader}>
    <Text style={styles.conceptTitle}>{title}</Text>
    <Text style={styles.conceptDescription}>
      Let's explore how to best help your child with this.
    </Text>
  </View>
);

export default function ChatScreen() {
  const { id, conceptName, conceptDescription } = useLocalSearchParams<{
    id: string;
    conceptName?: string;
    conceptDescription?: string;
  }>();
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null);

  // State for the AppHeader
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [showChildrenMenu, setShowChildrenMenu] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);

  // Handlers for AppHeader
  const toggleChildrenMenu = () => setShowChildrenMenu(!showChildrenMenu);
  const selectChild = (child: Child) => {
    setSelectedChild(child);
    setShowChildrenMenu(false);
  };
  const toggleUserProfile = () => setShowUserProfile(!showUserProfile);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const childrenData = await getChildren();
        setChildren(childrenData);
        if (childrenData.length > 0) {
          const activeChild = await resolveActiveChild(childrenData);
          setSelectedChild(activeChild);
        }
      } catch (error) {
        console.error('Failed to load children for header:', error);
      }
    };
    fetchChildren();
  }, []);

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

  // Track when user leaves chat (component unmount)
  useEffect(() => {
    return () => {
      if (id && messages.length > 0) {
        trackEvent('CHAT_SESSION_ENDED', {
          session_id: id,
          final_message_count: messages.length,
          session_duration_estimate: 'unknown', // Could calculate if we tracked start time
        });
      }
    };
  }, [id, messages.length]);

  const handleSendMessage = async (
    text: string,
    metadata?: { source: string; prompt_text?: string }
  ) => {
    if (!id || isSending) return;

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
        source: metadata?.source || 'user_typed',
        prompt_text: metadata?.prompt_text,
      });

      await chatApi.streamMessage(id, { content: text }, (chunk) => {
        // Sanitize chunk if it comes with quotes
        const cleanedChunk = chunk.replace(/^"|"$/g, '');
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessagePlaceholder.id
              ? { ...m, content: m.content + cleanedChunk }
              : m
          )
        );
      });

      // After stream is done, we could fetch the final message object
      // from the backend if we need its definitive ID or created_at time.
      // For now, the placeholder becomes the final message.
    } catch (error: any) {
      console.error('Failed to send or stream message:', error);
      crossPlatformAlert(
        'Error',
        'Could not get a response from Yay. Please try again.'
      );

      // Remove the user message and the placeholder on failure
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

      // Optimistically update UI
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, feedback_thumbs: vote } : m
        )
      );

      // Track feedback given
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

      // Track feedback error
      await trackEvent('CHAT_FEEDBACK_ERROR', {
        session_id: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // Re-throw the error so the calling component knows it failed
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
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary.green} />
          <Text style={styles.loaderText}>Loading your conversation...</Text>
        </View>
      ) : (
        <>
          {conceptName && (
            <ConceptHeader
              title={conceptName}
              description={conceptDescription || ''}
            />
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
            onClose={() => setShowUserProfile(false)}
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    color: colors.text.secondary,
  },
  profileOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
  conceptHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGrey,
    backgroundColor: colors.background.secondary,
  },
  conceptTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  conceptDescription: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});
