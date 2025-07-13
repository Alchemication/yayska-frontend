import React, { useState, useEffect } from 'react';
import { Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

interface ProfileAvatarProps {
  size?: number;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ size = 24 }) => {
  const { user, isAuthenticated } = useAuth();
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (user) {
      console.log(
        '[ProfileAvatar] User object updated:',
        JSON.stringify({
          isAuthenticated,
          userId: user.id,
          picture_url: user.picture_url,
        })
      );
    }
    // Reset image error state if user or picture_url changes
    setImageError(false);
  }, [user, user?.picture_url, isAuthenticated]);

  // If not authenticated, show outline icon
  if (!isAuthenticated) {
    return (
      <Ionicons
        name="person-circle-outline"
        size={size}
        color={colors.text.secondary}
      />
    );
  }

  // If no profile picture or image error, show filled green icon
  if (!user?.picture_url || imageError) {
    if (!imageError) {
      console.log(
        '[ProfileAvatar] Rendering fallback icon: No picture_url found.'
      );
    }
    return (
      <Ionicons name="person-circle" size={size} color={colors.primary.green} />
    );
  }

  // Show profile picture
  console.log('[ProfileAvatar] Attempting to render image:', user.picture_url);
  return (
    <Image
      source={{ uri: user.picture_url }}
      style={[
        styles.profileAvatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
      onError={(e) => {
        console.error(
          '[ProfileAvatar] Image failed to load:',
          e.nativeEvent.error
        );
        setImageError(true);
      }}
    />
  );
};

const styles = StyleSheet.create({
  profileAvatar: {
    borderWidth: 1,
    borderColor: colors.primary.green,
  },
});
