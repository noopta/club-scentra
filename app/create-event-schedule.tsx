import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/lib/ThemeContext';
import StepIndicator from '@/components/StepIndicator';
import RedButton from '@/components/RedButton';
import TimePicker from '@/components/TimePicker';
import WizardHeader from '@/components/WizardHeader';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function getDaysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year: number, month: number) { return new Date(year, month, 1).getDay(); }

function timeStringToISO(dateStr: string, timeStr: string): string | null {
  try {
    const base = new Date(dateStr);
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return null;
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    base.setHours(hours, minutes, 0, 0);
    return base.toISOString();
  } catch { return null; }
}

export default function CreateEventScheduleScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const router = useRouter();
  const params = useLocalSearchParams<{
    title: string; description: string;
    addressLine: string; city: string; region: string; postalCode: string; country: string; additionalInfo: string;
  }>();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateLabel, setDateLabel] = useState('');
  const [startTime, setStartTime] = useState('12:00 PM');
  const [endTime, setEndTime] = useState('');
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [startPickerOpen, setStartPickerOpen] = useState(false);
  const [endPickerOpen, setEndPickerOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  const handleDayPress = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    setSelectedDate(d);
    setDateLabel(d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
    setCalendarVisible(false);
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const handleNext = () => {
    setErrorMsg('');
    if (!selectedDate) { setErrorMsg('Please select a date.'); return; }
    if (!startTime) { setErrorMsg('Please select a start time.'); return; }

    const startAt = timeStringToISO(selectedDate.toISOString(), startTime);
    if (!startAt) { setErrorMsg('Invalid start time.'); return; }

    const endAt = endTime ? timeStringToISO(selectedDate.toISOString(), endTime) : null;

    router.push({
      pathname: '/create-event-photo',
      params: { ...params, startAt, endAt: endAt ?? '', dateLabel },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <WizardHeader
        title="Step 3 of 4"
        cancelTo="/(tabs)/meets"
        onCancelConfirm={() => { setSelectedDate(null); setDateLabel(''); setStartTime('12:00 PM'); setEndTime(''); }}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <StepIndicator totalSteps={4} currentStep={3} />

        <Text style={styles.title}>Schedule</Text>
        <Text style={styles.subtitle}>Add a date and time</Text>

        {errorMsg ? <View style={styles.errorBanner}><Text style={styles.errorText}>{errorMsg}</Text></View> : null}

        <View style={styles.formContainer}>
          <View>
            <Text style={styles.inputLabel}>Date *</Text>
            <TouchableOpacity style={styles.pickerButton} onPress={() => setCalendarVisible(true)} activeOpacity={0.8}>
              <Ionicons name="calendar-outline" size={18} color={Theme.colors.primary} />
              <Text style={[styles.pickerText, !dateLabel && styles.pickerPlaceholder]}>
                {dateLabel || 'Select a date'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={Theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View>
            <Text style={styles.inputLabel}>Start Time *</Text>
            <TouchableOpacity style={styles.pickerButton} onPress={() => setStartPickerOpen(true)} activeOpacity={0.8}>
              <Ionicons name="time-outline" size={18} color={Theme.colors.primary} />
              <Text style={[styles.pickerText, !startTime && styles.pickerPlaceholder]}>
                {startTime || 'Select start time'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={Theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View>
            <Text style={styles.inputLabel}>End Time</Text>
            <TouchableOpacity style={styles.pickerButton} onPress={() => setEndPickerOpen(true)} activeOpacity={0.8}>
              <Ionicons name="time-outline" size={18} color={Theme.colors.primary} />
              <Text style={[styles.pickerText, !endTime && styles.pickerPlaceholder]}>
                {endTime || 'Select end time (optional)'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={Theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <RedButton title="Next: Add a Picture" onPress={handleNext} />
        </View>
      </ScrollView>

      <Modal visible={calendarVisible} transparent animationType="slide" onRequestClose={() => setCalendarVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setCalendarVisible(false)}>
          <View style={styles.calendarSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.handle} />
            <Text style={styles.calTitle}>Select a Date</Text>
            <View style={styles.calHeader}>
              <TouchableOpacity onPress={prevMonth} style={styles.navBtn} hitSlop={10}><Ionicons name="chevron-back" size={22} color={Theme.colors.textPrimary} /></TouchableOpacity>
              <Text style={styles.monthLabel}>{MONTHS[viewMonth]} {viewYear}</Text>
              <TouchableOpacity onPress={nextMonth} style={styles.navBtn} hitSlop={10}><Ionicons name="chevron-forward" size={22} color={Theme.colors.textPrimary} /></TouchableOpacity>
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
                if (day === null) {
                  return (
                    <View key={`e-${i}`} style={styles.cellWrap}>
                      <View style={styles.cellInner} />
                    </View>
                  );
                }
                const thisDate = new Date(viewYear, viewMonth, day);
                const isSelected = selectedDate?.toDateString() === thisDate.toDateString();
                const isPast = thisDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const isToday = thisDate.toDateString() === today.toDateString();
                return (
                  <View key={day} style={styles.cellWrap}>
                    <TouchableOpacity
                      style={[styles.cellInner, isSelected && styles.cellSelected, isToday && !isSelected && styles.cellToday, isPast && styles.cellPast]}
                      onPress={() => !isPast && handleDayPress(day)}
                      disabled={isPast}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.cellText, isSelected && styles.cellTextSelected, isToday && !isSelected && styles.cellTextToday, isPast && styles.cellTextPast]}>{day}</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
            {dateLabel ? (
              <View style={styles.selectedDateRow}>
                <Ionicons name="checkmark-circle" size={18} color={Theme.colors.primary} />
                <Text style={styles.selectedDateText}>Selected: {dateLabel}</Text>
              </View>
            ) : null}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setCalendarVisible(false)}>
              <Text style={styles.closeBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <TimePicker
        visible={startPickerOpen}
        value={startTime}
        onConfirm={setStartTime}
        onClose={() => setStartPickerOpen(false)}
      />

      <TimePicker
        visible={endPickerOpen}
        value={endTime || '12:00 PM'}
        onConfirm={setEndTime}
        onClose={() => setEndPickerOpen(false)}
      />
    </SafeAreaView>
  );
}

const makeStyles = (c: typeof Theme.colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  scrollContent: { paddingHorizontal: Theme.spacing.xl, paddingTop: Theme.spacing.lg, paddingBottom: Theme.spacing.xxl },
  title: { fontSize: Theme.fontSize.xxxl, fontWeight: Theme.fontWeight.bold, color: c.textPrimary, textAlign: 'center', marginTop: Theme.spacing.md, marginBottom: Theme.spacing.xs },
  subtitle: { fontSize: Theme.fontSize.md, color: c.textSecondary, textAlign: 'center', marginBottom: Theme.spacing.lg },
  errorBanner: { backgroundColor: '#FFF0F0', borderRadius: Theme.borderRadius.md, borderWidth: 1, borderColor: '#FFCDD2', padding: Theme.spacing.md, marginBottom: Theme.spacing.md },
  errorText: { fontSize: Theme.fontSize.sm, color: c.primary, textAlign: 'center' },
  formContainer: { gap: Theme.spacing.md },
  inputLabel: { fontSize: Theme.fontSize.sm, fontWeight: Theme.fontWeight.medium, color: c.textPrimary, marginBottom: 6 },
  pickerButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.white, borderRadius: Theme.borderRadius.md, borderWidth: 1, borderColor: c.border, paddingHorizontal: Theme.spacing.md, paddingVertical: 14, gap: 10 },
  pickerText: { flex: 1, fontSize: Theme.fontSize.md, color: c.textPrimary, fontWeight: Theme.fontWeight.medium },
  pickerPlaceholder: { color: c.textMuted, fontWeight: '400' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  calendarSheet: { backgroundColor: c.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: Theme.spacing.lg, paddingTop: Theme.spacing.md, paddingBottom: 40 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: c.border, alignSelf: 'center', marginBottom: Theme.spacing.md },
  calTitle: { fontSize: Theme.fontSize.lg, fontWeight: Theme.fontWeight.bold, color: c.textPrimary, marginBottom: Theme.spacing.md, textAlign: 'center' },
  calHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Theme.spacing.sm, paddingHorizontal: 4 },
  navBtn: { padding: Theme.spacing.sm },
  monthLabel: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.bold, color: c.textPrimary },
  dayRow: { flexDirection: 'row', marginBottom: 4 },
  dayLabelWrap: { width: `${100 / 7}%`, alignItems: 'center', justifyContent: 'center', paddingVertical: 6 },
  dayLabel: { fontSize: Theme.fontSize.xs, color: c.textSecondary, fontWeight: Theme.fontWeight.semibold, textTransform: 'uppercase', letterSpacing: 0.5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cellWrap: { width: `${100 / 7}%`, aspectRatio: 1, padding: 3 },
  cellInner: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 100 },
  cellSelected: { backgroundColor: c.primary },
  cellToday: { borderWidth: 1.5, borderColor: c.primary },
  cellPast: { opacity: 0.3 },
  cellText: { fontSize: Theme.fontSize.md, color: c.textPrimary, fontWeight: Theme.fontWeight.medium },
  cellTextSelected: { color: c.white, fontWeight: Theme.fontWeight.bold },
  cellTextToday: { color: c.primary, fontWeight: Theme.fontWeight.bold },
  cellTextPast: { color: c.textMuted },
  selectedDateRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: Theme.spacing.md, backgroundColor: '#FFF5F5', padding: Theme.spacing.md, borderRadius: Theme.borderRadius.sm },
  selectedDateText: { fontSize: Theme.fontSize.sm, color: c.primary, fontWeight: Theme.fontWeight.medium },
  closeBtn: { backgroundColor: c.primary, borderRadius: Theme.borderRadius.lg, paddingVertical: 14, alignItems: 'center', marginTop: Theme.spacing.lg },
  closeBtnText: { color: c.white, fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.bold },
});
