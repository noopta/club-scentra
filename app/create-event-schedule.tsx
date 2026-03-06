import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import StepIndicator from '@/components/StepIndicator';
import InputField from '@/components/InputField';
import RedButton from '@/components/RedButton';

export default function CreateEventScheduleScreen() {
  const router = useRouter();
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <StepIndicator totalSteps={4} currentStep={3} />

        <Text style={styles.title}>Schedule</Text>
        <Text style={styles.subtitle}>Add a date and time</Text>

        <View style={styles.formContainer}>
          <View style={styles.dateContainer}>
            <InputField
              label="Date"
              value={date}
              onChangeText={setDate}
              placeholder="Select a date"
            />
            <TouchableOpacity style={styles.dropdownIcon}>
              <Ionicons name="chevron-down" size={20} color={Theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <InputField
            label="Start Time"
            value={startTime}
            onChangeText={setStartTime}
            placeholder="e.g. 3:00 PM"
          />

          <InputField
            label="End Time"
            value={endTime}
            onChangeText={setEndTime}
            placeholder="e.g. 8:00 PM"
          />

          <RedButton
            title="Next: Add a picture"
            onPress={() => router.push('/create-event-photo')}
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
    gap: Theme.spacing.sm,
  },
  dateContainer: {
    position: 'relative',
  },
  dropdownIcon: {
    position: 'absolute',
    right: 16,
    top: 38,
  },
});
