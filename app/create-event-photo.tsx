import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import StepIndicator from '@/components/StepIndicator';
import RedButton from '@/components/RedButton';

export default function CreateEventPhotoScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <StepIndicator totalSteps={4} currentStep={4} />

        <Text style={styles.title}>Add a Pic</Text>
        <Text style={styles.subtitle}>Upload a picture for your event</Text>

        <TouchableOpacity style={styles.uploadArea} activeOpacity={0.7}>
          <Ionicons name="cloud-upload-outline" size={48} color={Theme.colors.textMuted} />
          <Text style={styles.uploadText}>Tap to upload</Text>
          <Text style={styles.uploadSubtext}>JPG, PNG up to 10MB</Text>
        </TouchableOpacity>

        <RedButton
          title="Create Event"
          onPress={() => {
            router.replace('/(tabs)/explore');
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Theme.spacing.xxl,
  },
  title: {
    fontSize: Theme.fontSize.xxxl,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
  },
  subtitle: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xxl,
  },
  uploadArea: {
    backgroundColor: Theme.colors.inputBackground,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    marginBottom: Theme.spacing.xl,
  },
  uploadText: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.sm,
  },
  uploadSubtext: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.textMuted,
    marginTop: Theme.spacing.xs,
  },
});
