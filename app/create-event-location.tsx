import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import StepIndicator from '@/components/StepIndicator';
import InputField from '@/components/InputField';
import RedButton from '@/components/RedButton';
import WizardHeader from '@/components/WizardHeader';

type Suggestion = {
  display: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
};

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export default function CreateEventLocationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ title: string; description: string }>();

  const [searchQuery, setSearchQuery] = useState('');
  const [picked, setPicked] = useState<Suggestion | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 3) { setSuggestions([]); setShowSuggestions(false); return; }
    setSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en', 'User-Agent': 'ClubScentra/1.0' } });
      const data = await res.json();
      const mapped: Suggestion[] = data.map((item: Record<string, unknown>) => {
        const a = (item.address ?? {}) as Record<string, string>;
        const road = a.road ?? a.pedestrian ?? a.path ?? '';
        const houseNumber = a.house_number ?? '';
        const streetLine = [houseNumber, road].filter(Boolean).join(' ');
        return {
          display: String(item.display_name ?? ''),
          address: streetLine || String(item.display_name ?? '').split(',')[0],
          city: a.city ?? a.town ?? a.village ?? a.municipality ?? '',
          region: a.state ?? a.province ?? '',
          postalCode: a.postcode ?? '',
        };
      });
      setSuggestions(mapped);
      setShowSuggestions(mapped.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (picked) setPicked(null);
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fetchSuggestions(text), 400);
  };

  const handleSelect = (item: Suggestion) => {
    setPicked(item);
    const display = item.address
      ? `${item.address}${item.city ? ', ' + item.city : ''}${item.region ? ', ' + item.region : ''}`
      : item.display.split(',').slice(0, 2).join(',');
    setSearchQuery(display);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleClearPick = () => {
    setPicked(null);
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleNext = () => {
    setErrorMsg('');

    let address = picked?.address?.trim() ?? '';
    let city = picked?.city?.trim() ?? '';
    let region = picked?.region?.trim() ?? '';
    let postalCode = picked?.postalCode?.trim() ?? '';

    if (!picked && searchQuery.trim()) {
      const parts = searchQuery.split(',').map(p => p.trim()).filter(Boolean);
      address = parts[0] ?? '';
      city = parts[1] ?? '';
      region = parts[2] ?? '';
    }

    if (!address || !city) {
      setErrorMsg('Pick an address from the list, or include at least "Street, City" in your search.');
      return;
    }

    router.push({
      pathname: '/create-event-schedule',
      params: {
        title: params.title,
        description: params.description,
        addressLine: address,
        city,
        region,
        postalCode,
        additionalInfo: additionalInfo.trim(),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <WizardHeader title="New Event" />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <StepIndicator totalSteps={4} currentStep={2} />

        <Text style={styles.title}>Location</Text>
        <Text style={styles.subtitle}>Search for your meet's address</Text>

        {errorMsg ? <View style={styles.errorBanner}><Text style={styles.errorText}>{errorMsg}</Text></View> : null}

        <View style={styles.searchWrapper}>
          <Text style={styles.inputLabel}>Address</Text>
          <View style={styles.searchRow}>
            <Ionicons name="search" size={18} color={Theme.colors.textMuted} style={styles.searchIcon} />
            <TextInput
              value={searchQuery}
              onChangeText={handleSearchChange}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              style={styles.searchInput}
              placeholder="Start typing an address..."
              placeholderTextColor={Theme.colors.textMuted}
              autoCapitalize="words"
            />
            {searching && <ActivityIndicator size="small" color={Theme.colors.primary} style={styles.searchTrailingIcon} />}
            {searchQuery.length > 0 && !searching && (
              <TouchableOpacity style={styles.searchTrailingIcon} onPress={handleClearPick} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color={Theme.colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
          {showSuggestions && suggestions.length > 0 && (
            <View style={styles.suggestionsBox}>
              {suggestions.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.suggestion, i < suggestions.length - 1 && styles.suggestionBorder]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="location-outline" size={16} color={Theme.colors.primary} style={{ marginRight: 10, marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.suggestionMain} numberOfLines={1}>
                      {item.address || item.display.split(',')[0]}
                    </Text>
                    <Text style={styles.suggestionSub} numberOfLines={1}>
                      {[item.city, item.region, item.postalCode].filter(Boolean).join(', ')}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {picked ? (
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Ionicons name="checkmark-circle" size={18} color={Theme.colors.primary} />
              <Text style={styles.summaryTitle}>Selected location</Text>
              <TouchableOpacity onPress={handleClearPick} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.summaryChange}>Change</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.summaryAddress}>{picked.address}</Text>
            <Text style={styles.summaryMeta}>
              {[picked.city, picked.region, picked.postalCode].filter(Boolean).join(', ')}
            </Text>
          </View>
        ) : (
          <Text style={styles.helperText}>
            Tip: pick a result from the dropdown so we can fill in city, region, and postal code automatically.
          </Text>
        )}

        <InputField
          label="Additional Info"
          value={additionalInfo}
          onChangeText={setAdditionalInfo}
          placeholder="Parking, entry instructions, etc. (optional)"
          multiline
        />

        <RedButton title="Next: Date and Time" onPress={handleNext} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  scrollContent: { paddingHorizontal: Theme.spacing.xl, paddingTop: Theme.spacing.md, paddingBottom: Theme.spacing.xxl, gap: Theme.spacing.sm },
  title: { fontSize: Theme.fontSize.xxxl, fontWeight: Theme.fontWeight.bold, color: Theme.colors.textPrimary, textAlign: 'center', marginBottom: Theme.spacing.xs },
  subtitle: { fontSize: Theme.fontSize.md, color: Theme.colors.textSecondary, textAlign: 'center', marginBottom: Theme.spacing.md },
  errorBanner: { backgroundColor: '#FFF0F0', borderRadius: Theme.borderRadius.md, borderWidth: 1, borderColor: '#FFCDD2', padding: Theme.spacing.md },
  errorText: { fontSize: Theme.fontSize.sm, color: Theme.colors.primary, textAlign: 'center' },
  searchWrapper: { zIndex: 10, marginBottom: Theme.spacing.xs },
  inputLabel: { fontSize: Theme.fontSize.sm, fontWeight: Theme.fontWeight.medium, color: Theme.colors.textPrimary, marginBottom: 6 },
  searchRow: { position: 'relative', flexDirection: 'row', alignItems: 'center' },
  searchIcon: { position: 'absolute', left: 12, zIndex: 2 },
  searchInput: {
    flex: 1,
    backgroundColor: Theme.colors.inputBackground,
    borderRadius: Theme.borderRadius.sm,
    paddingLeft: 38,
    paddingRight: 38,
    paddingVertical: 14,
    fontSize: Theme.fontSize.md,
    color: Theme.colors.textPrimary,
  },
  searchTrailingIcon: { position: 'absolute', right: 12, zIndex: 2 },
  suggestionsBox: {
    backgroundColor: Theme.colors.white, borderRadius: Theme.borderRadius.md,
    borderWidth: 1, borderColor: Theme.colors.border, overflow: 'hidden',
    marginTop: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 5,
  },
  suggestion: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: Theme.spacing.md, paddingVertical: 12 },
  suggestionBorder: { borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  suggestionMain: { fontSize: Theme.fontSize.sm, fontWeight: Theme.fontWeight.medium, color: Theme.colors.textPrimary },
  suggestionSub: { fontSize: Theme.fontSize.xs, color: Theme.colors.textSecondary, marginTop: 2 },
  summaryCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#FFE0E0',
    padding: Theme.spacing.md,
    marginTop: 4,
  },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  summaryTitle: { flex: 1, fontSize: Theme.fontSize.sm, fontWeight: Theme.fontWeight.bold, color: Theme.colors.primary },
  summaryChange: { fontSize: Theme.fontSize.sm, fontWeight: Theme.fontWeight.semibold, color: Theme.colors.primary },
  summaryAddress: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.semibold, color: Theme.colors.textPrimary },
  summaryMeta: { fontSize: Theme.fontSize.sm, color: Theme.colors.textSecondary, marginTop: 2 },
  helperText: { fontSize: Theme.fontSize.sm, color: Theme.colors.textSecondary, paddingHorizontal: 4, marginTop: 4 },
});
