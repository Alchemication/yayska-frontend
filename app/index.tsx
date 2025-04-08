// app/index.tsx
import React from 'react';
import { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '../src/theme/colors';
import { getChildren, ensureChildrenHaveYearNames } from '../src/utils/storage';
import { useAuth } from '../src/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading, login } = useAuth();
  const [checkingRedirect, setCheckingRedirect] = useState(false);

  useEffect(() => {
    // Log authentication state changes
    console.log('Welcome screen - Auth state changed:', {
      isAuthenticated,
      isLoading,
    });
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    // Ensure all stored children have year names
    ensureChildrenHaveYearNames();

    const checkExistingChildren = async () => {
      try {
        setCheckingRedirect(true);

        if (isAuthenticated) {
          console.log('User is authenticated, checking for existing children');
          const savedChildren = await getChildren();

          if (savedChildren && savedChildren.length > 0) {
            console.log('Found existing children, redirecting to home');
            router.push('/home');
          } else {
            console.log('No children found for authenticated user');
          }
        } else {
          console.log('User is not authenticated, staying on welcome screen');
        }
      } catch (error) {
        console.error('Error checking for redirect:', error);
      } finally {
        setCheckingRedirect(false);
      }
    };

    if (!isLoading) {
      checkExistingChildren();
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading || checkingRedirect) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary.green} />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.outerContainer}>
      {/* Irish flag colors top bar */}
      <View style={styles.flagStripe}>
        <View
          style={[
            styles.stripeSegment,
            { backgroundColor: colors.primary.green },
          ]}
        />
        <View
          style={[
            styles.stripeSegment,
            { backgroundColor: colors.neutral.white },
          ]}
        />
        <View
          style={[
            styles.stripeSegment,
            { backgroundColor: colors.primary.orange },
          ]}
        />
      </View>

      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Subtle background pattern */}
          <View style={styles.backgroundPattern} />

          {/* Logo with subtle shadow */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Parent's Guide to School Success</Text>
          <Text style={styles.subtitle}>
            <Text style={styles.brandName}>Know more. Help better.</Text>
          </Text>

          {/* Brief value proposition */}
          <View style={styles.valueProps}>
            <Text style={styles.valueProp}>
              • Understand your child's curriculum
            </Text>
            <Text style={styles.valueProp}>
              • Get tailored learning resources
            </Text>
            <Text style={styles.valueProp}>• Practice with your child</Text>
          </View>

          <View style={styles.authButtons}>
            {/* Sign-in option */}
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={login}
            >
              <Ionicons
                name="logo-google"
                size={22}
                color="#fff"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Continue with Google</Text>
            </Pressable>

            {/* Browser-specific instructions */}
            <Text style={styles.browserInstructions}>
              {Platform.OS === 'web' && (
                <>
                  {/^((?!chrome|android).)*safari/i.test(navigator.userAgent)
                    ? 'Using Safari? Please allow popups for this site to enable Google Sign-In.'
                    : /iPhone|iPad|iPod/i.test(navigator.userAgent)
                    ? 'On iOS, you may need to accept the popup to continue with Google Sign-In.'
                    : null}
                </>
              )}
            </Text>

            {/* Future auth providers will go here */}
            <Text style={styles.comingSoon}>
              More sign in options coming soon...
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
  },
  // Irish flag colors at top
  flagStripe: {
    flexDirection: 'row',
    height: 4, // Very subtle height
    width: '100%',
  },
  stripeSegment: {
    flex: 1,
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.03,
    backgroundColor: colors.primary.green,
    borderRadius: 100,
    transform: [{ scale: 1.5 }],
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    position: 'relative',
  },
  logoContainer: {
    ...commonStyles.shadow,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 10,
    marginBottom: 20,
  },
  logo: {
    width: 220,
    height: 100,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  brandName: {
    fontSize: 22,
    color: colors.primary.green,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  valueProps: {
    marginBottom: 30,
    alignItems: 'center',
  },
  valueProp: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  authButtons: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary.green,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonIcon: {
    marginRight: 12,
  },
  buttonText: {
    color: colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loginInfo: {
    color: colors.text.secondary,
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  comingSoon: {
    color: colors.text.secondary,
    fontSize: 14,
    marginTop: 16,
    fontStyle: 'italic',
  },
  titleAccent: {
    color: colors.primary.orange,
    fontWeight: 'bold',
  },
  subtitleAccent: {
    color: colors.primary.orange,
    fontWeight: 'bold',
  },
  browserInstructions: {
    marginTop: 10,
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
