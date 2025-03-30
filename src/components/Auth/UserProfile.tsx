import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

interface UserProfileProps {
  isVisible: boolean;
  onClose: () => void;
}

export function UserProfile({ isVisible, onClose }: UserProfileProps) {
  const { user, logout } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Reset error state when user changes
  useEffect(() => {
    setImageError(false);
  }, [user]);

  // Debug user object to see what's happening
  useEffect(() => {
    if (user) {
      console.log('User object:', JSON.stringify(user));
      console.log('Profile picture URL:', user.picture);
    } else {
      console.log('No user object available');
    }
  }, [user]);

  if (!isVisible) return null;

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

  // Default avatar if no profile picture
  const defaultAvatar = (
    <View style={styles.defaultAvatar}>
      <Ionicons name="person" size={32} color={colors.neutral.white} />
    </View>
  );

  // User avatar handling
  const renderUserAvatar = () => {
    if (!user || !user.picture || imageError) {
      return defaultAvatar;
    }

    // Make sure the URL is valid
    const imageUrl = user.picture;
    console.log('Attempting to load image from URL:', imageUrl);

    // Handle different URL formats
    let validUrl = imageUrl;
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      validUrl = `https://${imageUrl}`;
      console.log('URL modified to:', validUrl);
    }

    return (
      <Image
        source={{ uri: validUrl }}
        style={styles.avatar}
        onError={(e) => {
          console.log('Image loading error:', e.nativeEvent.error);
          setImageError(true);
        }}
      />
    );
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
        {renderUserAvatar()}
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.userEmail}>
          {user?.email || 'No email available'}
        </Text>
      </View>

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
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  defaultAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary.green,
    justifyContent: 'center',
    alignItems: 'center',
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
