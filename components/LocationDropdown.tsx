import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';

const ALL_LOCATIONS = [
  'All Locations',
  'Toronto, ON',
  'Mississauga, ON',
  'Scarborough, ON',
  'North York, ON',
  'Vaughan, ON',
  'Markham, ON',
  'Oakville, ON',
  'Brampton, ON',
  'Hamilton, ON',
  'Burlington, ON',
  'Richmond Hill, ON',
];

interface LocationDropdownProps {
  selected: string;
  onSelect: (location: string) => void;
}

export default function LocationDropdown({ selected, onSelect }: LocationDropdownProps) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = ALL_LOCATIONS.filter(loc =>
    loc.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (loc: string) => {
    onSelect(loc === 'All Locations' ? '' : loc);
    setVisible(false);
    setSearch('');
  };

  const isActive = !!selected;
  const displayLabel = selected || 'Location';

  return (
    <>
      <TouchableOpacity
        style={[styles.filterButton, isActive && styles.filterButtonActive]}
        onPress={() => setVisible(true)}
        activeOpacity={0.85}
      >
        <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
          <Ionicons
            name="location-sharp"
            size={14}
            color={isActive ? Theme.colors.white : Theme.colors.primary}
          />
        </View>
        <Text style={[styles.filterText, isActive && styles.filterTextActive]} numberOfLines={1}>
          {displayLabel}
        </Text>
        {isActive ? (
          <TouchableOpacity
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={(e) => { e.stopPropagation(); onSelect(''); }}
          >
            <Ionicons name="close-circle" size={16} color={Theme.colors.primary} />
          </TouchableOpacity>
        ) : (
          <Ionicons name="chevron-down" size={14} color={Theme.colors.textSecondary} />
        )}
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setVisible(false)}>
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <View style={styles.handle} />
            <Text style={styles.title}>Filter by Location</Text>

            <View style={styles.searchRow}>
              <Ionicons name="search" size={16} color={Theme.colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search location..."
                placeholderTextColor={Theme.colors.textMuted}
                value={search}
                onChangeText={setSearch}
                autoCapitalize="none"
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={16} color={Theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {filtered.map(loc => (
                <TouchableOpacity
                  key={loc}
                  style={styles.option}
                  onPress={() => handleSelect(loc)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionLeft}>
                    <Ionicons
                      name={loc === 'All Locations' ? 'globe-outline' : 'location-outline'}
                      size={18}
                      color={Theme.colors.primary}
                    />
                    <Text style={styles.optionText}>{loc}</Text>
                  </View>
                  {(selected === loc || (loc === 'All Locations' && !selected)) && (
                    <Ionicons name="checkmark" size={18} color={Theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
              {filtered.length === 0 && (
                <Text style={styles.emptyText}>No locations found</Text>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    borderRadius: 999,
    paddingLeft: 4,
    paddingRight: 14,
    paddingVertical: 6,
    gap: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    minHeight: 40,
  },
  filterButtonActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: '#FFF5F5',
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: Theme.colors.primary,
  },
  filterText: {
    flex: 1,
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.textPrimary,
    fontWeight: Theme.fontWeight.semibold,
  },
  filterTextActive: {
    color: Theme.colors.primary,
  },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Theme.colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: 40,
    maxHeight: '75%',
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Theme.colors.border, alignSelf: 'center', marginBottom: Theme.spacing.md },
  title: { fontSize: Theme.fontSize.lg, fontWeight: Theme.fontWeight.bold, color: Theme.colors.textPrimary, marginBottom: Theme.spacing.md },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.background, borderRadius: Theme.borderRadius.sm, paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.sm, marginBottom: Theme.spacing.md, gap: Theme.spacing.sm },
  searchInput: { flex: 1, fontSize: Theme.fontSize.md, color: Theme.colors.textPrimary },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md },
  optionText: { fontSize: Theme.fontSize.md, color: Theme.colors.textPrimary },
  emptyText: { textAlign: 'center', color: Theme.colors.textSecondary, marginTop: Theme.spacing.xl },
});
