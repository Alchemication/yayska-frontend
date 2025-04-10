// src/components/Onboarding/ChildInput.tsx
import { StyleSheet, View, TextInput, Pressable, Text } from 'react-native';
import { colors, commonStyles } from '../../theme/colors';

type ChildInputProps = {
  childName: string;
  onNameChange: (text: string) => void;
  onRemove: () => void;
  showRemove?: boolean;
};

export function ChildInput({
  childName,
  onNameChange,
  onRemove,
  showRemove = true,
}: ChildInputProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={childName}
        onChangeText={onNameChange}
        placeholder="Child's name (optional)"
        placeholderTextColor={colors.text.tertiary}
        autoCapitalize="words"
      />
      {showRemove && (
        <Pressable
          style={styles.removeButton}
          onPress={onRemove}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
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
});
