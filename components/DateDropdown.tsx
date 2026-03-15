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

  const displayLabel = selected || 'Date';

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <>
      <TouchableOpacity
        style={[styles.filterButton, selected ? styles.filterButtonActive : null]}
        onPress={() => setVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="calendar" size={14} color={Theme.colors.primary} />
        <Text style={[styles.filterText, selected ? styles.filterTextActive : null]} numberOfLines={1}>
          {displayLabel}
        </Text>
        <Ionicons name="chevron-down" size={14} color={Theme.colors.textPrimary} />
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
              <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
                <Ionicons name="chevron-back" size={20} color={Theme.colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.monthLabel}>{MONTHS[viewMonth]} {viewYear}</Text>
              <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
                <Ionicons name="chevron-forward" size={20} color={Theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.dayRow}>
              {DAYS.map(d => (
                <Text key={d} style={styles.dayLabel}>{d}</Text>
              ))}
            </View>

            <View style={styles.grid}>
              {cells.map((day, i) => {
                if (day === null) return <View key={`empty-${i}`} style={styles.cell} />;
                const label = new Date(viewYear, viewMonth, day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                const isSelected = selected === label;
                const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
                return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.cell, isSelected && styles.cellSelected, isToday && !isSelected && styles.cellToday]}
                    onPress={() => handleDayPress(day)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.cellText, isSelected && styles.cellTextSelected, isToday && !isSelected && styles.cellTextToday]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.xl,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    gap: 6,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    maxWidth: 140,
  },
  filterButtonActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: '#FFF5F5',
  },
  filterText: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.textPrimary,
    fontWeight: Theme.fontWeight.medium,
    flex: 1,
  },
  filterTextActive: {
    color: Theme.colors.primary,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Theme.colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Theme.colors.border,
    alignSelf: 'center',
    marginBottom: Theme.spacing.md,
  },
  title: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
    gap: Theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Theme.fontSize.md,
    color: Theme.colors.textPrimary,
  },
  searchApply: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.sm,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  searchApplyText: {
    color: Theme.colors.white,
    fontWeight: Theme.fontWeight.medium,
    fontSize: Theme.fontSize.sm,
  },
  calHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  navBtn: {
    padding: Theme.spacing.sm,
  },
  monthLabel: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.textPrimary,
  },
  dayRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.textSecondary,
    fontWeight: Theme.fontWeight.medium,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
  cellSelected: {
    backgroundColor: Theme.colors.primary,
  },
  cellToday: {
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },
  cellText: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.textPrimary,
  },
  cellTextSelected: {
    color: Theme.colors.white,
    fontWeight: Theme.fontWeight.bold,
  },
  cellTextToday: {
    color: Theme.colors.primary,
    fontWeight: Theme.fontWeight.bold,
  },
  clearBtn: {
    marginTop: Theme.spacing.md,
    alignItems: 'center',
  },
  clearText: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.primary,
    fontWeight: Theme.fontWeight.medium,
  },
});
