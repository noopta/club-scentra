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
  const [errorMsg, setErrorMsg] = useState('');

  const handleNext = () => {
    setErrorMsg('');
    if (!eventName.trim()) {
      setErrorMsg('Please enter an event name to continue.');
      return;
    }
    router.push({
      pathname: '/create-event-location',
      params: { title: eventName.trim(), description: aboutEvent.trim() },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <StepIndicator totalSteps={4} currentStep={1} />

        <Text style={styles.title}>Create Event</Text>
        <Text style={styles.subtitle}>Name your meet</Text>

        {errorMsg ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        <View style={styles.formContainer}>
          <InputField
            label="Event Name"
            value={eventName}
            onChangeText={setEventName}
            placeholder="e.g. Downtown Drive"
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

          <RedButton title="Next: Location" onPress={handleNext} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: { flex: 1, paddingHorizontal: Theme.spacing.xl, paddingTop: Theme.spacing.xxl },
  title: { fontSize: Theme.fontSize.xxxl, fontWeight: Theme.fontWeight.bold, color: Theme.colors.textPrimary, textAlign: 'center', marginBottom: Theme.spacing.xs },
  subtitle: { fontSize: Theme.fontSize.md, color: Theme.colors.textSecondary, textAlign: 'center', marginBottom: Theme.spacing.xxl },
  formContainer: { gap: Theme.spacing.md },
  aboutContainer: { marginBottom: 0 },
  errorBanner: { backgroundColor: '#FFF0F0', borderRadius: Theme.borderRadius.md, borderWidth: 1, borderColor: '#FFCDD2', padding: Theme.spacing.md, marginBottom: Theme.spacing.md },
  errorText: { fontSize: Theme.fontSize.sm, color: Theme.colors.primary, textAlign: 'center' },
});
