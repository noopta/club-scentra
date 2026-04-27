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
};

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function formatCombined(s: { address: string; city: string; region: string; postalCode: string }): string {
  return [s.address, s.city, s.region, s.postalCode].filter(Boolean).join(', ');
}

export default function CreateEventLocationScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const router = useRouter();
  const params = useLocalSearchParams<{ title: string; description: string }>();

  const [combined, setCombined] = useState('');
  const [resolved, setResolved] = useState<Suggestion | null>(null);
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
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleNext = () => {
    setErrorMsg('');
    if (!resolved) {
      setErrorMsg('Please pick an address from the suggestions so we can fill in city, region, and postal code.');
      return;
    }
    if (!resolved.address.trim() || !resolved.city.trim()) {
      setErrorMsg('That address is missing a city. Please pick another suggestion.');
      return;
    }
    router.push({
      pathname: '/create-event-schedule',
      params: {
        title: params.title,
        description: params.description,
        addressLine: resolved.address.trim(),
        city: resolved.city.trim(),
        region: resolved.region.trim(),
        postalCode: resolved.postalCode.trim(),
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
                        {[item.city, item.region, item.postalCode].filter(Boolean).join(', ')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

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
});
