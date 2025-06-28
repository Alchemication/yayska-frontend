import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Text,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Button,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { ChatMessageResponse, ChatMessageRole } from '../../types/chat';
import { colors } from '../../theme/colors';
import Markdown from 'react-native-markdown-display';

// MessageBubble Component
interface MessageBubbleProps {
  message: ChatMessageResponse;
  onFeedback: (messageId: string, vote: 1 | -1, text?: string) => Promise<void>;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onFeedback,
}) => {
  const isUser = message.role === ChatMessageRole.USER;
  const [feedbackGiven, setFeedbackGiven] = useState(
    message.feedback_thumbs !== null && message.feedback_thumbs !== undefined
  );
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedVote, setSelectedVote] = useState<1 | -1 | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenFeedbackModal = (vote: 1 | -1) => {
    if (feedbackGiven) return;
    setSelectedVote(vote);
    setShowFeedbackModal(true);
  };

  const handleCancelFeedback = () => {
    setShowFeedbackModal(false);
    setSelectedVote(null); // Reset the vote
  };

  const handleSendFeedback = async () => {
    if (!selectedVote) return;

    setIsSubmitting(true);
    try {
      await onFeedback(message.id, selectedVote, feedbackText.trim());
      setFeedbackGiven(true); // Mark as given only after successful submission
      setShowFeedbackModal(false);
    } catch (error) {
      // Error is handled in the parent component, but we can log it here too
      console.error('Feedback submission failed in bubble:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <View
        style={[
          styles.messageContainer,
          isUser
            ? styles.userMessageContainer
            : styles.assistantMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={styles.assistantAvatar}>
            <Text style={styles.avatarText}>Y</Text>
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userMessageBubble : styles.assistantMessageBubble,
          ]}
        >
          {isUser ? (
            <Text style={styles.userMessageText}>{message.content}</Text>
          ) : (
            <Markdown style={markdownStyles}>{message.content}</Markdown>
          )}
        </View>
        {!isUser && (
          <View style={styles.feedbackContainer}>
            <Pressable
              onPress={() => handleOpenFeedbackModal(1)}
              disabled={feedbackGiven}
              style={[
                styles.thumbButton,
                feedbackGiven &&
                  message.feedback_thumbs === 1 &&
                  styles.thumbButtonActive,
              ]}
            >
              <Ionicons
                name={
                  feedbackGiven && message.feedback_thumbs === 1
                    ? 'thumbs-up'
                    : 'thumbs-up-outline'
                }
                size={18}
                color={
                  feedbackGiven && message.feedback_thumbs === 1
                    ? colors.primary.green
                    : colors.text.secondary
                }
              />
            </Pressable>
            <Pressable
              onPress={() => handleOpenFeedbackModal(-1)}
              disabled={feedbackGiven}
              style={[
                styles.thumbButton,
                feedbackGiven &&
                  message.feedback_thumbs === -1 &&
                  styles.thumbButtonActive,
              ]}
            >
              <Ionicons
                name={
                  feedbackGiven && message.feedback_thumbs === -1
                    ? 'thumbs-down'
                    : 'thumbs-down-outline'
                }
                size={18}
                color={
                  feedbackGiven && message.feedback_thumbs === -1
                    ? colors.accent.error
                    : colors.text.secondary
                }
              />
            </Pressable>
          </View>
        )}
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showFeedbackModal}
        onRequestClose={handleCancelFeedback}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalBackdrop}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={handleCancelFeedback}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons
                name="chatbox-ellipses-outline"
                size={24}
                color={colors.text.primary}
              />
              <Text style={styles.modalTitle}>Help us improve!</Text>
            </View>
            <Text style={styles.modalSubtitle}>
              Your feedback helps us improve Yay for all parents.
            </Text>
            <TextInput
              style={styles.feedbackInput}
              onChangeText={setFeedbackText}
              value={feedbackText}
              placeholder="What did you like or dislike? (Optional)"
              placeholderTextColor={colors.text.secondary}
              multiline
              autoFocus={true}
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelFeedback}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalButton,
                  styles.sendButton,
                  isSubmitting && styles.sendButtonDisabled,
                ]}
                onPress={handleSendFeedback}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.sendButtonText}>Send Feedback</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

// ChatInput Component
interface ChatInputProps {
  onSend: (text: string) => void;
  isSending: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, isSending }) => {
  const [text, setText] = useState('');
  const buttonScale = useSharedValue(0);

  const handleSend = () => {
    if (text.trim().length > 0 && !isSending) {
      onSend(text.trim());
      setText('');
    }
  };

  useEffect(() => {
    if (text.trim().length > 0) {
      buttonScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    } else {
      buttonScale.value = withTiming(0, { duration: 150 });
    }
  }, [text]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
      opacity: buttonScale.value,
    };
  });

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Ask a question..."
        placeholderTextColor={colors.text.tertiary}
        multiline
      />
      <Animated.View style={[styles.sendButtonContainer, animatedStyle]}>
        <Pressable
          onPress={handleSend}
          style={({ pressed }) => [
            styles.sendButton,
            isSending && styles.sendButtonDisabled,
            pressed && styles.sendButtonPressed,
          ]}
          disabled={isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="arrow-up" size={20} color="white" />
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
};

// Typing Indicator Component
const TypingIndicator: React.FC = () => (
  <View style={styles.typingContainer}>
    <ActivityIndicator size="small" color={colors.text.secondary} />
    <Text style={styles.typingText}>Yay is typing...</Text>
  </View>
);

// Main ChatView Component
interface ChatViewProps {
  messages: ChatMessageResponse[];
  onSendMessage: (text: string) => void;
  onFeedback: (messageId: string, vote: 1 | -1, text?: string) => Promise<void>;
  isSendingMessage: boolean;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  onFeedback,
  isSendingMessage,
}) => {
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100
      );
    }
  }, [messages]);

  const renderMessageItem = ({ item }: { item: ChatMessageResponse }) => (
    <MessageBubble message={item} onFeedback={onFeedback} />
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={isSendingMessage ? <TypingIndicator /> : null}
      />
      <ChatInput onSend={onSendMessage} isSending={isSendingMessage} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '85%',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  assistantMessageContainer: {
    alignSelf: 'flex-start',
  },
  assistantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 2,
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    flex: 1,
  },
  userMessageBubble: {
    backgroundColor: colors.primary.green,
    borderBottomRightRadius: 4,
    marginLeft: 8,
  },
  assistantMessageBubble: {
    backgroundColor: colors.background.secondary,
    borderBottomLeftRadius: 4,
  },
  userMessageText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
  },
  assistantMessageText: {
    color: colors.text.primary,
    fontSize: 16,
    lineHeight: 22,
  },
  feedbackContainer: {
    flexDirection: 'row',
    marginTop: 8,
    marginLeft: 40, // Align with message bubble
  },
  thumbButton: {
    marginHorizontal: 4,
    padding: 8,
    borderRadius: 16,
  },
  thumbButtonActive: {
    backgroundColor: colors.background.tertiary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: colors.background.secondary,
    backgroundColor: colors.background.primary,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: colors.background.secondary,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text.primary,
    marginRight: 8,
    textAlignVertical: 'center',
  },
  sendButtonContainer: {
    // This container will be animated
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.primary.greenLight,
  },
  sendButtonPressed: {
    backgroundColor: colors.primary.greenDark,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateAvatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '600',
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  emptyStateMessage: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  emptyStateSubMessage: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: colors.text.primary,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  feedbackInput: {
    width: '100%',
    backgroundColor: colors.background.secondary,
    borderColor: colors.background.tertiary,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 120,
    marginBottom: 24,
    fontSize: 16,
    color: colors.text.primary,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.background.secondary,
    marginRight: 8,
  },
  cancelButtonText: {
    color: colors.text.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

const markdownStyles = StyleSheet.create({
  // General text
  body: {
    fontSize: 16,
    color: colors.text.primary,
  },
  // Headings
  heading1: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary.green,
    marginTop: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGrey,
    paddingBottom: 4,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 12,
    marginBottom: 6,
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 10,
    marginBottom: 4,
  },
  // Emphasis
  strong: {
    fontWeight: 'bold',
  },
  em: {
    fontStyle: 'italic',
  },
  // Lists
  bullet_list: {
    marginTop: 8,
    marginBottom: 8,
  },
  ordered_list: {
    marginTop: 8,
    marginBottom: 8,
  },
  list_item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  // Links
  link: {
    color: colors.primary.green,
    textDecorationLine: 'underline',
  },
  // Blockquotes
  blockquote: {
    backgroundColor: colors.background.secondary,
    padding: 10,
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary.green,
    marginVertical: 8,
  },
  // Code
  code_inline: {
    backgroundColor: colors.neutral.lightGrey,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  code_block: {
    backgroundColor: colors.neutral.lightGrey,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    padding: 10,
    borderRadius: 4,
    marginVertical: 8,
  },
});
