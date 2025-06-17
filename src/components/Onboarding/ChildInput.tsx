// src/components/Onboarding/ChildInput.tsx
import { StyleSheet, View, TextInput, Pressable, Text } from 'react-native';
import { colors, commonStyles } from '../../theme/colors';

type ChildInputProps = {
  childName: string;
  onNameChange: (text: string) => void;
  onRemove: () => void;
  showRemove?: boolean;
  disabled?: boolean;
};

export function ChildInput({
  childName,
  onNameChange,
  onRemove,
  showRemove = true,
  disabled = false,
}: ChildInputProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, disabled && styles.inputDisabled]}
        value={childName}
        onChangeText={onNameChange}
        placeholder="Child's name (optional)"
        placeholderTextColor={colors.text.tertiary}
        autoCapitalize="words"
        editable={!disabled}
      />
      {showRemove && (
        <Pressable
          style={[styles.removeButton, disabled && styles.removeButtonDisabled]}
          onPress={onRemove}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          disabled={disabled}
        >
          <Text
            style={[
              styles.removeButtonText,
              disabled && styles.removeButtonTextDisabled,
            ]}
          >
            Remove
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: 10,
    borderRadius: commonStyles.borderRadius.small,
    fontSize: 15,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.neutral.lightGrey,
  },
  removeButton: {
    marginLeft: 10,
    padding: 6,
  },
  removeButtonText: {
    color: colors.accent.error,
    fontSize: 13,
    fontWeight: '500',
  },
  inputDisabled: {
    backgroundColor: colors.neutral.lightGrey,
    opacity: 0.6,
  },
  removeButtonDisabled: {
    opacity: 0.5,
  },
  removeButtonTextDisabled: {
    color: colors.neutral.grey,
  },
});
