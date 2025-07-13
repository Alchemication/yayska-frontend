import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { ProfileAvatar } from './ProfileAvatar';

interface UserProfileProps {
  isVisible: boolean;
  onClose: () => void;
}

export function UserProfile({ isVisible, onClose }: UserProfileProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isVisible) return null;

  const handleEditProfile = () => {
    onClose(); // Close the modal first
    router.push('/profile/edit');
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log('Starting logout from profile...');

      // Close the profile modal first
      onClose();

      // Call the logout function from AuthContext
      await logout();

      console.log('Logout completed successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      alert('Logout failed. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Profile</Text>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.text.secondary} />
        </Pressable>
      </View>

      <View style={styles.profileContent}>
        <View style={styles.avatarContainer}>
          <ProfileAvatar size={80} />
        </View>
        <Text style={styles.userName}>
          {user ? `${user.first_name} ${user.last_name}` : 'User'}
        </Text>
        <Text style={styles.userEmail}>
          {user?.email || 'No email available'}
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.editButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleEditProfile}
      >
        <Ionicons
          name="pencil"
          size={20}
          color={colors.neutral.offWhite}
          style={styles.buttonIcon}
        />
        <Text style={styles.editButtonText}>Edit My Preferences</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && styles.buttonPressed,
          isLoggingOut && styles.disabledButton,
        ]}
        onPress={handleLogout}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          <Text style={styles.logoutButtonText}>Logging out...</Text>
        ) : (
          <>
            <Ionicons
              name="log-out-outline"
              size={20}
              color={colors.text.primary}
              style={styles.buttonIcon}
            />
            <Text style={styles.logoutButtonText}>Sign out</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  profileContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.green,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
  },
  editButtonText: {
    color: colors.neutral.offWhite,
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.secondary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  logoutButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
