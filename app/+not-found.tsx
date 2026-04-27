import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/lib/ThemeContext';

export default function NotFoundScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const router = useRouter();

  return (
    <View style={styles.container}>
      <Ionicons name="warning-outline" size={80} color={Theme.colors.primary} />
      <Text style={styles.errorCode}>404</Text>
      <Text style={styles.title}>Page Not Found</Text>
      <Text style={styles.subtitle}>
        The page you're looking for doesn't exist or has been moved.
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace('/(tabs)/explore')}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Go to Explore</Text>
      </TouchableOpacity>
    </View>
  );
}

const makeStyles = (c: typeof Theme.colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.xl,
  },
  errorCode: {
    fontSize: 72,
    fontWeight: Theme.fontWeight.extrabold,
    color: c.textPrimary,
    marginTop: Theme.spacing.md,
  },
  title: {
    fontSize: Theme.fontSize.xxl,
    fontWeight: Theme.fontWeight.bold,
    color: c.textPrimary,
    marginTop: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: Theme.fontSize.md,
    color: c.textSecondary,
    textAlign: 'center',
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.xl,
  },
  button: {
    backgroundColor: c.primary,
    borderRadius: Theme.borderRadius.xl,
    paddingVertical: 16,
    paddingHorizontal: Theme.spacing.xxl,
  },
  buttonText: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
    color: c.white,
  },
});
