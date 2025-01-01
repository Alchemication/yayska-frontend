// app/index.tsx
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '../src/theme/colors';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Optional: Decorative element using Irish colors */}
        <View style={styles.decorativeStripe}>
          <View
            style={[styles.stripe, { backgroundColor: colors.primary.green }]}
          />
          <View
            style={[styles.stripe, { backgroundColor: colors.neutral.white }]}
          />
          <View
            style={[styles.stripe, { backgroundColor: colors.primary.orange }]}
          />
        </View>

        <Text style={styles.title}>Fáilte go Yayska!</Text>
        <Text style={styles.subtitle}>
          Supporting Irish parents with primary school subjects (with Yay!)
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push('/onboarding')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  decorativeStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    height: 4,
  },
  stripe: {
    flex: 1,
    height: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: colors.text.secondary,
    marginBottom: 40,
    maxWidth: '80%',
  },
  button: {
    backgroundColor: colors.primary.green,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: commonStyles.borderRadius.medium,
    ...commonStyles.shadow,
  },
  buttonPressed: {
    backgroundColor: colors.primary.greenDark,
  },
  buttonText: {
    color: colors.neutral.white,
    fontSize: 18,
    fontWeight: '600',
  },
});
