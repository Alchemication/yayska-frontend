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
import { Child } from '../../src/types/child';
import { trackEvent } from '../../src/utils/analytics';

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

  // Track section changes
  const handleSectionChange = (section: string) => {
    const changeId = Math.random().toString(36).substr(2, 9);
    console.log(`[CONCEPT-${changeId}] 🔄 Section change triggered:`, {
      from: activeSection,
      to: section,
      conceptId: Number(id),
      conceptName: concept?.concept_name,
    });

    // Track the section switch
    trackEvent('CONCEPT_SECTION_SWITCHED', {
      concept_id: Number(id),
      concept_name: concept?.concept_name,
      from_section: activeSection,
      to_section: section,
    });

    console.log(
      `[CONCEPT-${changeId}] 🎯 trackEvent called, updating state...`
    );
    setActiveSection(section);
    console.log(`[CONCEPT-${changeId}] ✅ State updated to:`, section);
  };

  useEffect(() => {
    const loadConcept = async () => {
      try {
        setLoading(true);
        const data = await api.getConceptMetadata(Number(id));
        setConcept(data as ConceptMetadata);

        // Track concept view - only when concept is first loaded
        await trackEvent('CONCEPT_VIEW', {
          concept_id: Number(id),
          concept_name: data.concept_name,
          initial_section: activeSection,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load concept');

        // Track concept load error
        await trackEvent('CONCEPT_LOAD_ERROR', {
          concept_id: Number(id),
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      } finally {
        setLoading(false);
      }
    };

    loadConcept();
  }, [id]); // Only depend on id, not activeSection

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
            onSectionChange={handleSectionChange}
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
