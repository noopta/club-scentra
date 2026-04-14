import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import StepIndicator from '@/components/StepIndicator';
import InputField from '@/components/InputField';
import RedButton from '@/components/RedButton';

const MOCK_ADDRESSES = [
  { address: '123 Queen St W', city: 'Toronto', province: 'ON', postal: 'M5H 2M9' },
  { address: '456 King St E', city: 'Toronto', province: 'ON', postal: 'M5A 1L1' },
  { address: '789 Yonge St', city: 'Toronto', province: 'ON', postal: 'M4W 2G8' },
  { address: '100 City Centre Dr', city: 'Mississauga', province: 'ON', postal: 'L5B 2C9' },
  { address: '300 Borough Dr', city: 'Scarborough', province: 'ON', postal: 'M1P 4P5' },
  { address: '2 Civic Centre Ct', city: 'Brampton', province: 'ON', postal: 'L6W 4V3' },
  { address: '55 Front St W', city: 'Toronto', province: 'ON', postal: 'M5J 1E6' },
  { address: '4141 Dixie Rd', city: 'Mississauga', province: 'ON', postal: 'L4W 1V5' },
  { address: '150 Eglinton Ave E', city: 'Toronto', province: 'ON', postal: 'M4P 1E8' },
  { address: '7777 Weston Rd', city: 'Vaughan', province: 'ON', postal: 'L4L 9J6' },
];

export default function CreateEventLocationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ title: string; description: string }>();

  const [searchAddress, setSearchAddress] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = searchAddress.length >= 2
    ? MOCK_ADDRESSES.filter(a =>
        `${a.address} ${a.city}`.toLowerCase().includes(searchAddress.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSelectAddress = (item: typeof MOCK_ADDRESSES[0]) => {
    setAddress(item.address);
    setCity(item.city);
    setProvince(item.province);
    setPostalCode(item.postal);
    setSearchAddress(`${item.address}, ${item.city}`);
    setShowSuggestions(false);
  };

  const handleNext = () => {
    if (!address.trim() || !city.trim()) {
      Alert.alert('Required', 'Please enter an address and city.');
      return;
    }
    router.push({
      pathname: '/create-event-schedule',
      params: {
        title: params.title,
        description: params.description,
        addressLine: address.trim(),
        city: city.trim(),
        region: province.trim(),
        postalCode: postalCode.trim(),
        additionalInfo: additionalInfo.trim(),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <StepIndicator totalSteps={4} currentStep={2} />

        <Text style={styles.title}>Location</Text>
        <Text style={styles.subtitle}>Add an address</Text>

        <View style={styles.searchWrapper}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={Theme.colors.textMuted} style={styles.searchIconLeft} />
            <InputField
              label="Search Address"
              value={searchAddress}
              onChangeText={(text) => { setSearchAddress(text); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              style={styles.searchInput}
            />
            {searchAddress.length > 0 && (
              <TouchableOpacity style={styles.clearSearch} onPress={() => { setSearchAddress(''); setShowSuggestions(false); }}>
                <Ionicons name="close-circle" size={18} color={Theme.colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
          {showSuggestions && suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {suggestions.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.suggestionItem, index < suggestions.length - 1 && styles.suggestionBorder]}
                  onPress={() => handleSelectAddress(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="location-outline" size={16} color={Theme.colors.primary} style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.suggestionAddress}>{item.address}</Text>
                    <Text style={styles.suggestionCity}>{item.city}, {item.province} {item.postal}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <InputField label="Address" required value={address} onChangeText={setAddress} />
        <InputField label="City" required value={city} onChangeText={setCity} />
        <InputField label="Province/State" value={province} onChangeText={setProvince} />
        <InputField label="Postal Code / Zip" value={postalCode} onChangeText={setPostalCode} />
        <InputField label="Additional Info" value={additionalInfo} onChangeText={setAdditionalInfo} multiline />

        <RedButton title="Next: Date and Time" onPress={handleNext} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  scrollContent: { paddingHorizontal: Theme.spacing.xl, paddingTop: Theme.spacing.xxl, paddingBottom: Theme.spacing.xxl },
  title: { fontSize: Theme.fontSize.xxxl, fontWeight: Theme.fontWeight.bold, color: Theme.colors.textPrimary, textAlign: 'center', marginBottom: Theme.spacing.xs },
  subtitle: { fontSize: Theme.fontSize.md, color: Theme.colors.textSecondary, textAlign: 'center', marginBottom: Theme.spacing.xxl },
  searchWrapper: { zIndex: 10, marginBottom: Theme.spacing.sm },
  searchContainer: { position: 'relative' },
  searchIconLeft: { position: 'absolute', left: 12, top: 38, zIndex: 1 },
  searchInput: { paddingLeft: 36 },
  clearSearch: { position: 'absolute', right: 12, top: 38, zIndex: 1 },
  suggestionsContainer: { backgroundColor: Theme.colors.white, borderRadius: Theme.borderRadius.md, borderWidth: 1, borderColor: Theme.colors.border, overflow: 'hidden', marginTop: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Theme.spacing.md, paddingVertical: 12 },
  suggestionBorder: { borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  suggestionAddress: { fontSize: Theme.fontSize.sm, fontWeight: Theme.fontWeight.medium, color: Theme.colors.textPrimary },
  suggestionCity: { fontSize: Theme.fontSize.xs, color: Theme.colors.textSecondary, marginTop: 2 },
});
