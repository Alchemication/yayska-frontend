// src/components/Onboarding/ChildInput.tsx
import { StyleSheet, View, TextInput, Pressable, Text } from 'react-native';
import { colors, commonStyles } from '../../theme/colors';

type ChildInputProps = {
  childName: string;
  onNameChange: (text: string) => void;
  onRemove: () => void;
  showRemove?: boolean; // Add this prop definition
};

export function ChildInput({
  childName,
  onNameChange,
  onRemove,
  showRemove = true, // Default value
}: ChildInputProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={childName}
        onChangeText={onNameChange}
        placeholder="Child's name (optional)"
        placeholderTextColor={colors.text.tertiary}
      />
      {showRemove && (
        <Pressable style={styles.removeButton} onPress={onRemove}>
          <Text style={styles.removeButtonText}>Remove</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: 12,
    borderRadius: commonStyles.borderRadius.medium,
    fontSize: 16,
    color: colors.text.primary,
    ...commonStyles.shadow,
  },
  removeButton: {
    marginLeft: 12,
    padding: 8,
  },
  removeButtonText: {
    color: colors.accent.error,
    fontSize: 14,
  },
});
