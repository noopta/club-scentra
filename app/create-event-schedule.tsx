import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import StepIndicator from '@/components/StepIndicator';
import InputField from '@/components/InputField';
import RedButton from '@/components/RedButton';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CreateEventScheduleScreen() {
  const router = useRouter();
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [calendarVisible, setCalendarVisible] = useState(false);

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
    const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    setDate(label);
    setCalendarVisible(false);
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <StepIndicator totalSteps={4} currentStep={3} />

        <Text style={styles.title}>Schedule</Text>
        <Text style={styles.subtitle}>Add a date and time</Text>

        <View style={styles.formContainer}>
          <View>
            <Text style={styles.inputLabel}>Date</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setCalendarVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar-outline" size={18} color={Theme.colors.primary} />
              <Text style={[styles.datePickerText, !date && styles.datePickerPlaceholder]}>
                {date || 'Select a date'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={Theme.colors.textMuted} />
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
      </ScrollView>

      <Modal visible={calendarVisible} transparent animationType="slide" onRequestClose={() => setCalendarVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setCalendarVisible(false)}>
          <View style={styles.calendarSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.handle} />
            <Text style={styles.calTitle}>Select a Date</Text>

            <View style={styles.calHeader}>
              <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
                <Ionicons name="chevron-back" size={22} color={Theme.colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.monthLabel}>{MONTHS[viewMonth]} {viewYear}</Text>
              <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
                <Ionicons name="chevron-forward" size={22} color={Theme.colors.textPrimary} />
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
                const label = new Date(viewYear, viewMonth, day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                const isSelected = date === label;
                const isPast = new Date(viewYear, viewMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
                return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.cell, isSelected && styles.cellSelected, isToday && !isSelected && styles.cellToday, isPast && styles.cellPast]}
                    onPress={() => !isPast && handleDayPress(day)}
                    activeOpacity={isPast ? 1 : 0.7}
                    disabled={isPast}
                  >
                    <Text style={[
                      styles.cellText,
                      isSelected && styles.cellTextSelected,
                      isToday && !isSelected && styles.cellTextToday,
                      isPast && styles.cellTextPast,
                    ]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {date ? (
              <View style={styles.selectedDateRow}>
                <Ionicons name="checkmark-circle" size={18} color={Theme.colors.primary} />
                <Text style={styles.selectedDateText}>Selected: {date}</Text>
              </View>
            ) : null}

            <TouchableOpacity style={styles.closeBtn} onPress={() => setCalendarVisible(false)}>
              <Text style={styles.closeBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  formContainer: {
    gap: Theme.spacing.md,
  },
  inputLabel: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.medium,
    color: Theme.colors.textPrimary,
    marginBottom: 6,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 14,
    gap: 10,
  },
  datePickerText: {
    flex: 1,
    fontSize: Theme.fontSize.md,
    color: Theme.colors.textPrimary,
    fontWeight: Theme.fontWeight.medium,
  },
  datePickerPlaceholder: {
    color: Theme.colors.textMuted,
    fontWeight: '400',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  calendarSheet: {
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
  calTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
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
    marginBottom: 8,
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
    borderWidth: 1.5,
    borderColor: Theme.colors.primary,
  },
  cellPast: {
    opacity: 0.3,
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
  cellTextPast: {
    color: Theme.colors.textMuted,
  },
  selectedDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Theme.spacing.md,
    backgroundColor: '#FFF5F5',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.sm,
  },
  selectedDateText: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.primary,
    fontWeight: Theme.fontWeight.medium,
  },
  closeBtn: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Theme.spacing.lg,
  },
  closeBtnText: {
    color: Theme.colors.white,
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
  },
});
