import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/lib/ThemeContext';
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
  country: string;
};

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function formatCombined(s: { address: string; city: string; region: string; postalCode: string; country: string }): string {
  const parts: string[] = [];
  if (s.address && s.address.toLowerCase() !== s.city?.toLowerCase()) parts.push(s.address);
  if (s.city) parts.push(s.city);
  if (s.region) parts.push(s.region);
  if (s.country) parts.push(s.country);
  return parts.join(', ');
}

export default function CreateEventLocationScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const router = useRouter();
  const params = useLocalSearchParams<{ title: string; description: string }>();

  const [combined, setCombined] = useState('');
  const [resolved, setResolved] = useState<Suggestion | null>(null);
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 3) { setSuggestions([]); setShowSuggestions(false); return; }
    setSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=1`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en', 'User-Agent': 'ClubScentra/1.0' } });
      const data = await res.json();
      const mapped: Suggestion[] = data.map((item: Record<string, unknown>) => {
        const a = (item.address ?? {}) as Record<string, string>;
        const road = a.road ?? a.pedestrian ?? a.path ?? '';
        const houseNumber = a.house_number ?? '';
        const streetLine = [houseNumber, road].filter(Boolean).join(' ');
        const city = a.city ?? a.town ?? a.village ?? a.municipality ?? '';
        const displayFirst = String(item.display_name ?? '').split(',')[0].trim();
        const addressValue = streetLine || (displayFirst.toLowerCase() !== city.toLowerCase() ? displayFirst : '');
        return {
          display: String(item.display_name ?? ''),
          address: addressValue,
          city,
          region: a.state ?? a.province ?? '',
          postalCode: a.postcode ?? '',
          country: a.country ?? '',
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

  const handleChange = (text: string) => {
    setCombined(text);
    // typing invalidates a previously resolved selection
    setResolved(null);
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fetchSuggestions(text), 400);
  };

  const handleSelect = (item: Suggestion) => {
    setResolved(item);
    setCombined(formatCombined(item));
    setAddressLine(item.address);
    setCity(item.city);
    setRegion(item.region);
    setPostalCode(item.postalCode);
    setCountry(item.country);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleFieldChange = (field: keyof Suggestion, value: string) => {
    switch (field) {
      case 'address': setAddressLine(value); break;
      case 'city': setCity(value); break;
      case 'region': setRegion(value); break;
      case 'postalCode': setPostalCode(value); break;
      case 'country': setCountry(value); break;
    }
    if (resolved) {
      setResolved({ ...resolved, [field]: value });
    }
  };

  const handleNext = () => {
    setErrorMsg('');
    if (!city.trim()) {
      setErrorMsg('City is required. Please enter a city or pick a suggestion.');
      return;
    }
    router.push({
      pathname: '/create-event-schedule',
      params: {
        title: params.title,
        description: params.description,
        addressLine: addressLine.trim(),
        city: city.trim(),
        region: region.trim(),
        postalCode: postalCode.trim(),
        country: country.trim(),
        additionalInfo: additionalInfo.trim(),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <WizardHeader
        title="Step 2 of 4"
        cancelTo="/(tabs)/meets"
        onCancelConfirm={() => { setCombined(''); setResolved(null); setAdditionalInfo(''); }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <StepIndicator totalSteps={4} currentStep={2} />

          <Text style={styles.title}>Location</Text>
          <Text style={styles.subtitle}>Where is the meet happening?</Text>

          {errorMsg ? <View style={styles.errorBanner}><Text style={styles.errorText}>{errorMsg}</Text></View> : null}

          <View style={styles.searchWrapper}>
            <Text style={styles.inputLabel}>Address *</Text>
            <View style={[styles.searchRow, resolved && styles.searchRowResolved]}>
              <Ionicons name="location-outline" size={18} color={Theme.colors.primary} style={styles.searchIcon} />
              <TextInput
                value={combined}
                onChangeText={handleChange}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                style={styles.searchInput}
                placeholder="Start typing an address, city, or place"
                placeholderTextColor={Theme.colors.textMuted}
                autoCapitalize="words"
                autoCorrect={false}
                autoComplete={Platform.OS === 'ios' ? 'street-address' : 'postal-address'}
                textContentType="fullStreetAddress"
              />
              {searching && <ActivityIndicator size="small" color={Theme.colors.primary} style={styles.searchSpinner} />}
              {!searching && combined.length > 0 && (
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={() => {
                    setCombined('');
                    setResolved(null);
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }}
                  hitSlop={8}
                >
                  <Ionicons name="close-circle" size={18} color={Theme.colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.helperText}>
              {resolved
                ? `${resolved.city}${resolved.region ? ', ' + resolved.region : ''}${resolved.postalCode ? ' · ' + resolved.postalCode : ''}`
                : 'Pick a suggestion to autofill city, region, and postal code.'}
            </Text>

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
                        {[item.city, item.region, item.country].filter(Boolean).join(', ')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {(resolved || city) && (
            <View style={styles.fieldsContainer}>
              <Text style={styles.fieldsTitle}>Location Details</Text>
              <Text style={styles.fieldsSubtitle}>Auto-filled from selection. Edit if needed.</Text>
              
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Street Address</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={addressLine}
                  onChangeText={(v) => handleFieldChange('address', v)}
                  placeholder="Street address (optional)"
                  placeholderTextColor={Theme.colors.textMuted}
                />
              </View>

              <View style={styles.fieldRowDouble}>
                <View style={styles.fieldHalf}>
                  <Text style={styles.fieldLabel}>City *</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={city}
                    onChangeText={(v) => handleFieldChange('city', v)}
                    placeholder="City"
                    placeholderTextColor={Theme.colors.textMuted}
                  />
                </View>
                <View style={styles.fieldHalf}>
                  <Text style={styles.fieldLabel}>Region / State</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={region}
                    onChangeText={(v) => handleFieldChange('region', v)}
                    placeholder="Province / State"
                    placeholderTextColor={Theme.colors.textMuted}
                  />
                </View>
              </View>

              <View style={styles.fieldRowDouble}>
                <View style={styles.fieldHalf}>
                  <Text style={styles.fieldLabel}>Postal Code</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={postalCode}
                    onChangeText={(v) => handleFieldChange('postalCode', v)}
                    placeholder="Postal / ZIP"
                    placeholderTextColor={Theme.colors.textMuted}
                  />
                </View>
                <View style={styles.fieldHalf}>
                  <Text style={styles.fieldLabel}>Country</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={country}
                    onChangeText={(v) => handleFieldChange('country', v)}
                    placeholder="Country"
                    placeholderTextColor={Theme.colors.textMuted}
                  />
                </View>
              </View>
            </View>
          )}

          <InputField
            label="Additional Info"
            value={additionalInfo}
            onChangeText={setAdditionalInfo}
            multiline
            placeholder="Parking notes, meeting point, gate code…"
          />

          <RedButton title="Next: Date and Time" onPress={handleNext} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (c: typeof Theme.colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  scrollContent: { paddingHorizontal: Theme.spacing.xl, paddingTop: Theme.spacing.lg, paddingBottom: Theme.spacing.xxl, gap: Theme.spacing.sm },
  title: { fontSize: Theme.fontSize.xxxl, fontWeight: Theme.fontWeight.bold, color: c.textPrimary, textAlign: 'center', marginTop: Theme.spacing.md, marginBottom: Theme.spacing.xs },
  subtitle: { fontSize: Theme.fontSize.md, color: c.textSecondary, textAlign: 'center', marginBottom: Theme.spacing.md },
  errorBanner: { backgroundColor: '#FFF0F0', borderRadius: Theme.borderRadius.md, borderWidth: 1, borderColor: '#FFCDD2', padding: Theme.spacing.md },
  errorText: { fontSize: Theme.fontSize.sm, color: c.primary, textAlign: 'center' },
  searchWrapper: { zIndex: 10, marginBottom: Theme.spacing.sm },
  inputLabel: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.medium, color: c.textPrimary, marginBottom: 6 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.inputBackground,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 14 : 6,
    gap: 8,
  },
  searchRowResolved: {
    borderColor: c.primary,
    backgroundColor: '#FFF5F5',
  },
  searchIcon: {},
  searchInput: {
    flex: 1,
    fontSize: Theme.fontSize.md,
    color: c.textPrimary,
    paddingVertical: Platform.OS === 'android' ? 8 : 0,
  },
  searchSpinner: {},
  clearBtn: {},
  helperText: {
    fontSize: Theme.fontSize.xs,
    color: c.textSecondary,
    marginTop: 6,
    marginLeft: 4,
  },
  suggestionsBox: {
    backgroundColor: c.white, borderRadius: Theme.borderRadius.md,
    borderWidth: 1, borderColor: c.border, overflow: 'hidden',
    marginTop: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 5,
  },
  suggestion: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: Theme.spacing.md, paddingVertical: 12 },
  suggestionBorder: { borderBottomWidth: 1, borderBottomColor: c.border },
  suggestionMain: { fontSize: Theme.fontSize.sm, fontWeight: Theme.fontWeight.medium, color: c.textPrimary },
  suggestionSub: { fontSize: Theme.fontSize.xs, color: c.textSecondary, marginTop: 2 },
  fieldsContainer: {
    backgroundColor: c.white,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: c.border,
    padding: Theme.spacing.md,
    marginTop: Theme.spacing.sm,
  },
  fieldsTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
    color: c.textPrimary,
    marginBottom: 4,
  },
  fieldsSubtitle: {
    fontSize: Theme.fontSize.xs,
    color: c.textSecondary,
    marginBottom: Theme.spacing.md,
  },
  fieldRow: {
    marginBottom: Theme.spacing.sm,
  },
  fieldRowDouble: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  fieldHalf: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.medium,
    color: c.textSecondary,
    marginBottom: 4,
  },
  fieldInput: {
    backgroundColor: c.inputBackground,
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: Theme.fontSize.md,
    color: c.textPrimary,
  },
});
