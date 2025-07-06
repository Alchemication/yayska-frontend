import React, { useState } from 'react';
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
  if (!user?.picture || imageError) {
    return (
      <Ionicons name="person-circle" size={size} color={colors.primary.green} />
    );
  }

  // Show profile picture
  return (
    <Image
      source={{ uri: user.picture }}
      style={[
        styles.profileAvatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
      onError={() => setImageError(true)}
    />
  );
};

const styles = StyleSheet.create({
  profileAvatar: {
    borderWidth: 1,
    borderColor: colors.primary.green,
  },
});
