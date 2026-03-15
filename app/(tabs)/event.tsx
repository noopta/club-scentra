import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/Theme';
import StepIndicator from '@/components/StepIndicator';
import InputField from '@/components/InputField';
import RedButton from '@/components/RedButton';

export default function CreateEventScreen() {
  const router = useRouter();
  const [eventName, setEventName] = useState('');
  const [aboutEvent, setAboutEvent] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <StepIndicator totalSteps={4} currentStep={1} />

        <Text style={styles.title}>Create Event</Text>
        <Text style={styles.subtitle}>Name your meet</Text>

        <View style={styles.formContainer}>
          <InputField
            label="Event Name"
            value={eventName}
            onChangeText={setEventName}
          />

          <InputField
            label="About Event"
            value={aboutEvent}
            onChangeText={setAboutEvent}
            placeholder="Tell people what to expect..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            containerStyle={styles.aboutContainer}
          />

          <RedButton
            title="Next: Location"
            onPress={() => router.push('/create-event-location')}
          />
        </View>
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
  formContainer: {
    gap: Theme.spacing.md,
  },
  aboutContainer: {
    marginBottom: 0,
  },
});
