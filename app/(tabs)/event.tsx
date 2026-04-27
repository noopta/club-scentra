import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/lib/ThemeContext';
import StepIndicator from '@/components/StepIndicator';
import InputField from '@/components/InputField';
import RedButton from '@/components/RedButton';
import WizardHeader from '@/components/WizardHeader';

export default function CreateEventScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

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
      <WizardHeader
        title="Step 1 of 4"
        cancelTo="/(tabs)/meets"
        backBehavesAsCancel
        onCancelConfirm={() => { setEventName(''); setAboutEvent(''); }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (c: typeof Theme.colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  content: { paddingHorizontal: Theme.spacing.xl, paddingTop: Theme.spacing.lg, paddingBottom: Theme.spacing.xxl },
  title: { fontSize: Theme.fontSize.xxxl, fontWeight: Theme.fontWeight.bold, color: c.textPrimary, textAlign: 'center', marginTop: Theme.spacing.md, marginBottom: Theme.spacing.xs },
  subtitle: { fontSize: Theme.fontSize.md, color: c.textSecondary, textAlign: 'center', marginBottom: Theme.spacing.xl },
  formContainer: { gap: Theme.spacing.md },
  aboutContainer: { marginBottom: 0 },
  errorBanner: { backgroundColor: '#FFF0F0', borderRadius: Theme.borderRadius.md, borderWidth: 1, borderColor: '#FFCDD2', padding: Theme.spacing.md, marginBottom: Theme.spacing.md },
  errorText: { fontSize: Theme.fontSize.sm, color: c.primary, textAlign: 'center' },
});
