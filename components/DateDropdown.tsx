import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

interface DateDropdownProps {
  selected: string;
  onSelect: (date: string) => void;
}

export default function DateDropdown({ selected, onSelect }: DateDropdownProps) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const handleDayPress = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    onSelect(label);
    setVisible(false);
    setSearch('');
  };

  const handleSearchSubmit = () => {
    if (search.trim()) {
      onSelect(search.trim());
      setVisible(false);
      setSearch('');
    }
  };

  const isActive = !!selected;
  const displayLabel = selected || 'Date';

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <>
      <TouchableOpacity
        style={[styles.filterButton, isActive && styles.filterButtonActive]}
        onPress={() => setVisible(true)}
        activeOpacity={0.85}
      >
        <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
          <Ionicons name="calendar" size={14} color={isActive ? Theme.colors.white : Theme.colors.primary} />
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
            <Text style={styles.title}>Filter by Date</Text>

            <View style={styles.searchRow}>
              <Ionicons name="search" size={16} color={Theme.colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder='Search date (e.g. "Aug 2")'
                placeholderTextColor={Theme.colors.textMuted}
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={handleSearchSubmit}
                returnKeyType="search"
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={16} color={Theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {search.length > 0 && (
              <TouchableOpacity style={styles.searchApply} onPress={handleSearchSubmit} activeOpacity={0.8}>
                <Text style={styles.searchApplyText}>Search for "{search}"</Text>
              </TouchableOpacity>
            )}

            <View style={styles.calHeader}>
              <TouchableOpacity onPress={prevMonth} style={styles.navBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="chevron-back" size={20} color={Theme.colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.monthLabel}>{MONTHS[viewMonth]} {viewYear}</Text>
              <TouchableOpacity onPress={nextMonth} style={styles.navBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="chevron-forward" size={20} color={Theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.dayRow}>
              {DAYS.map(d => (
                <View key={d} style={styles.dayLabelWrap}>
                  <Text style={styles.dayLabel}>{d}</Text>
                </View>
              ))}
            </View>

            <View style={styles.grid}>
              {cells.map((day, i) => {
                if (day === null) return <View key={`empty-${i}`} style={styles.cellWrap} />;
                const label = new Date(viewYear, viewMonth, day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                const isSelected = selected === label;
                const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
                return (
                  <View key={day} style={styles.cellWrap}>
                    <TouchableOpacity
                      style={[styles.cell, isSelected && styles.cellSelected, isToday && !isSelected && styles.cellToday]}
                      onPress={() => handleDayPress(day)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.cellText, isSelected && styles.cellTextSelected, isToday && !isSelected && styles.cellTextToday]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            {selected ? (
              <TouchableOpacity style={styles.clearBtn} onPress={() => { onSelect(''); setVisible(false); }}>
                <Text style={styles.clearText}>Clear date filter</Text>
              </TouchableOpacity>
            ) : null}
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
  sheet: { backgroundColor: Theme.colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: Theme.spacing.lg, paddingTop: Theme.spacing.md, paddingBottom: 40 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Theme.colors.border, alignSelf: 'center', marginBottom: Theme.spacing.md },
  title: { fontSize: Theme.fontSize.lg, fontWeight: Theme.fontWeight.bold, color: Theme.colors.textPrimary, marginBottom: Theme.spacing.md },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.background, borderRadius: Theme.borderRadius.sm, paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.sm, marginBottom: Theme.spacing.sm, gap: Theme.spacing.sm },
  searchInput: { flex: 1, fontSize: Theme.fontSize.md, color: Theme.colors.textPrimary },
  searchApply: { backgroundColor: Theme.colors.primary, borderRadius: Theme.borderRadius.sm, paddingVertical: 10, alignItems: 'center', marginBottom: Theme.spacing.md },
  searchApplyText: { color: Theme.colors.white, fontWeight: Theme.fontWeight.medium, fontSize: Theme.fontSize.sm },
  calHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Theme.spacing.md, paddingHorizontal: 4 },
  navBtn: { padding: Theme.spacing.sm, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  monthLabel: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.bold, color: Theme.colors.textPrimary },
  dayRow: { flexDirection: 'row', marginBottom: 8 },
  dayLabelWrap: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 4 },
  dayLabel: { fontSize: Theme.fontSize.xs, color: Theme.colors.textSecondary, fontWeight: Theme.fontWeight.semibold, letterSpacing: 0.5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  cellWrap: { width: `${100 / 7}%`, padding: 3, alignItems: 'center', justifyContent: 'center' },
  cell: { width: '100%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 100 },
  cellSelected: { backgroundColor: Theme.colors.primary },
  cellToday: { backgroundColor: Theme.colors.background, borderWidth: 1, borderColor: Theme.colors.primary },
  cellText: { fontSize: Theme.fontSize.sm, color: Theme.colors.textPrimary },
  cellTextSelected: { color: Theme.colors.white, fontWeight: Theme.fontWeight.bold },
  cellTextToday: { color: Theme.colors.primary, fontWeight: Theme.fontWeight.bold },
  clearBtn: { marginTop: Theme.spacing.md, alignItems: 'center', paddingVertical: 8 },
  clearText: { fontSize: Theme.fontSize.sm, color: Theme.colors.primary, fontWeight: Theme.fontWeight.semibold },
});
