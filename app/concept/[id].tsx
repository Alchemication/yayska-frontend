// app/concept/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import {
  StyleSheet,
  ScrollView,
  Text,
  ActivityIndicator,
  View,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { ConceptDetailCard } from '../../src/components/Concept/ConceptDetailCard';
import { colors } from '../../src/theme/colors';
import { api } from '../../src/services/api';
import { ConceptMetadata } from '../../src/types/concept';
import { AppHeader } from '../../src/components/Navigation/AppHeader';
import { UserProfile } from '../../src/components/Auth/UserProfile';
import { Child } from '../../src/utils/storage';

export default function ConceptDetailScreen() {
  const { id } = useLocalSearchParams();
  const [activeSection, setActiveSection] = useState('why');
  const [concept, setConcept] = useState<ConceptMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [showChildrenMenu, setShowChildrenMenu] = useState(false);

  // Function to toggle children menu
  const toggleChildrenMenu = () => {
    setShowChildrenMenu(!showChildrenMenu);
  };

  // Function to select a child
  const selectChild = (child: Child) => {
    setSelectedChild(child);
    setShowChildrenMenu(false);
  };

  // Function to toggle user profile
  const toggleUserProfile = () => {
    setShowUserProfile(!showUserProfile);
  };

  useEffect(() => {
    const loadConcept = async () => {
      try {
        setLoading(true);
        const data = await api.getConceptMetadata(Number(id));
        setConcept(data as ConceptMetadata);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load concept');
      } finally {
        setLoading(false);
      }
    };

    loadConcept();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary.green} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background.primary }}
    >
      <View style={styles.container}>
        <AppHeader
          children={children}
          selectedChild={selectedChild}
          showChildrenMenu={showChildrenMenu}
          toggleChildrenMenu={toggleChildrenMenu}
          selectChild={selectChild}
          toggleUserProfile={toggleUserProfile}
          showBackButton={true}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
        >
          <ConceptDetailCard
            concept={concept}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
        </ScrollView>

        {showUserProfile && (
          <View style={styles.profileOverlay}>
            <UserProfile
              isVisible={showUserProfile}
              onClose={() => setShowUserProfile(false)}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  errorText: {
    color: colors.accent.error,
    textAlign: 'center',
    padding: 20,
  },
  profileOverlay: {
    position: 'absolute',
    top: 60,
    right: 16,
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  contentContainer: {
    padding: 0, // Reduced padding to let the ConceptDetailCard handle its own padding
  },
});
