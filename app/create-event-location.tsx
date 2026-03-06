import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import StepIndicator from '@/components/StepIndicator';
import InputField from '@/components/InputField';
import RedButton from '@/components/RedButton';

export default function CreateEventLocationScreen() {
  const router = useRouter();
  const [searchAddress, setSearchAddress] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <StepIndicator totalSteps={4} currentStep={2} />

        <Text style={styles.title}>Location</Text>
        <Text style={styles.subtitle}>Add an address</Text>

        <View style={styles.searchContainer}>
          <InputField
            label="Search Address"
            value={searchAddress}
            onChangeText={setSearchAddress}
          />
          <View style={styles.searchIcon}>
            <Ionicons name="search" size={20} color={Theme.colors.textMuted} />
          </View>
        </View>

        <InputField
          label="Address"
          required
          value={address}
          onChangeText={setAddress}
        />

        <InputField
          label="City"
          required
          value={city}
          onChangeText={setCity}
        />

        <InputField
          label="Province/State"
          required
          value={province}
          onChangeText={setProvince}
        />

        <InputField
          label="Postal Code/Zip Code"
          value={postalCode}
          onChangeText={setPostalCode}
        />

        <InputField
          label="Additional info"
          value={additionalInfo}
          onChangeText={setAdditionalInfo}
          multiline
        />

        <RedButton
          title="Next: Date and Time"
          onPress={() => router.push('/create-event-schedule')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Theme.spacing.xxl,
    paddingBottom: Theme.spacing.xxl,
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
  searchContainer: {
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    right: 16,
    top: 38,
  },
});
