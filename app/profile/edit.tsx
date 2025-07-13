// app/profile/edit.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { api } from '../../src/services/api';
import { colors, commonStyles } from '../../src/theme/colors';
import { PageHeader } from '../../src/components/Navigation/PageHeader';
import { CORE_SUBJECTS } from '../../src/constants/education';
import { SelectionGrid } from '../../src/components/Onboarding/SelectionGrid';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [challengingSubjects, setChallengingSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [magicRevealText, setMagicRevealText] = useState<string | null>(null);

  useEffect(() => {
    if (user?.memory?.learning_context?.challenge_subjects) {
      setChallengingSubjects(user.memory.learning_context.challenge_subjects);
    }
  }, [user]);

  const toggleSubject = (subjectId: string) => {
    const isAdding = !challengingSubjects.includes(subjectId);
    const newSubjects = isAdding
      ? [...challengingSubjects, subjectId]
      : challengingSubjects.filter((s) => s !== subjectId);
    setChallengingSubjects(newSubjects);

    if (newSubjects.length === 0) {
      setMagicRevealText(null);
    } else {
      const subjectToFeatureId = isAdding
        ? subjectId
        : newSubjects[newSubjects.length - 1];
      const subject = CORE_SUBJECTS.find((s) => s.id === subjectToFeatureId);
      if (subject) {
        setMagicRevealText(
          `No problem! We'll provide extra-clear parent guides and quick tips for ${subject.name}.`
        );
      }
    }
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      // Ensure memory and learning_context exist before spreading
      const existingMemory = user?.memory || {};
      const existingLearningContext = existingMemory.learning_context || {};

      const updatedMemory = {
        ...existingMemory,
        learning_context: {
          ...existingLearningContext,
          challenge_subjects: challengingSubjects,
        },
      };

      const updatedUser = await api.user.updateMe({ memory: updatedMemory });

      if (setUser) {
        setUser(updatedUser);
      }

      // Navigate back automatically on success
      router.back();
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      Alert.alert(
        'Error',
        'Could not save your preferences. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="Edit Preferences" />
      <ScrollView>
        <SelectionGrid
          title="My Challenging Subjects"
          subtitle="Select subjects where you'd like extra support. We'll provide clearer guides and quick tips for these."
          items={CORE_SUBJECTS.map((subject) => ({ ...subject, example: '' }))}
          selectedItems={challengingSubjects}
          onToggleItem={toggleSubject}
          magicRevealText={magicRevealText}
        />
      </ScrollView>
      <View style={styles.footer}>
        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSaveChanges}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.neutral.white} />
          ) : (
            <Text style={styles.buttonText}>Save Changes</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGrey,
    backgroundColor: colors.background.primary,
  },
  button: {
    backgroundColor: colors.primary.green,
    padding: 16,
    borderRadius: commonStyles.borderRadius.large,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.neutral.grey,
  },
  buttonText: {
    color: colors.neutral.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
