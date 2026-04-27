import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/lib/ThemeContext';

const ITEM_H = 48;
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));
const PERIODS = ['AM', 'PM'];

type Props = {
  visible: boolean;
  value: string;
  onConfirm: (time: string) => void;
  onClose: () => void;
};

function Column({ items, selected, onSelect, visible }: {
  items: string[];
  selected: string;
  onSelect: (v: string) => void;
  visible: boolean;
}) {
  const { colors } = useTheme();
  const col = useMemo(() => makeColStyles(colors), [colors]);
  const ref = useRef<ScrollView>(null);
  const idx = items.indexOf(selected);

  useEffect(() => {
    if (ref.current && idx >= 0) {
      ref.current.scrollTo({ y: idx * ITEM_H, animated: false });
    }
  }, [visible, idx]);

  return (
    <View style={col.wrap}>
      <View style={[col.highlight, { pointerEvents: 'none' }]} />
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: ITEM_H * 2 }}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
          const clamped = Math.max(0, Math.min(items.length - 1, i));
          onSelect(items[clamped]);
        }}
        scrollEventThrottle={16}
      >
        {items.map((item) => {
          const active = item === selected;
          return (
            <TouchableOpacity
              key={item}
              style={col.item}
              onPress={() => {
                const i = items.indexOf(item);
                ref.current?.scrollTo({ y: i * ITEM_H, animated: true });
                onSelect(item);
              }}
              activeOpacity={0.7}
            >
              <Text style={[col.label, active && col.activeLabel]}>{item}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default function TimePicker({ visible: v, value, onConfirm, onClose }: Props) {
  const { colors } = useTheme();
  const s = useMemo(() => makeSheetStyles(colors), [colors]);

  const parseValue = () => {
    const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match) {
      const h = match[1].padStart(2, '0').replace(/^0/, '') || '12';
      const m = String(Math.round(parseInt(match[2]) / 5) * 5).padStart(2, '0');
      const p = match[3].toUpperCase() as 'AM' | 'PM';
      return { h: HOURS.includes(h) ? h : '12', m: MINUTES.includes(m) ? m : '00', p };
    }
    return { h: '12', m: '00', p: 'PM' as const };
  };

  const init = parseValue();
  const [hour, setHour] = useState(init.h);
  const [minute, setMinute] = useState(init.m);
  const [period, setPeriod] = useState<'AM' | 'PM'>(init.p);

  useEffect(() => {
    if (v) {
      const p = parseValue();
      setHour(p.h);
      setMinute(p.m);
      setPeriod(p.p);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v]);

  const handleConfirm = () => {
    onConfirm(`${hour}:${minute} ${period}`);
    onClose();
  };

  return (
    <Modal visible={v} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <View style={s.sheet} onStartShouldSetResponder={() => true}>
          <View style={s.handle} />
          <Text style={s.title}>Select Time</Text>

          <View style={s.pickerRow}>
            <Column items={HOURS} selected={hour} onSelect={setHour} visible={v} />
            <Text style={s.colon}>:</Text>
            <Column items={MINUTES} selected={minute} onSelect={setMinute} visible={v} />
            <View style={s.periodCol}>
              {PERIODS.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[s.periodBtn, period === p && s.periodBtnActive]}
                  onPress={() => setPeriod(p as 'AM' | 'PM')}
                >
                  <Text style={[s.periodText, period === p && s.periodTextActive]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={s.confirmBtn} onPress={handleConfirm}>
            <Text style={s.confirmText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const makeColStyles = (c: typeof Theme.colors) => StyleSheet.create({
  wrap: { width: 72, height: ITEM_H * 5, overflow: 'hidden', position: 'relative' },
  highlight: {
    position: 'absolute', top: ITEM_H * 2, left: 0, right: 0, height: ITEM_H,
    backgroundColor: c.inputBackground, borderRadius: 10, zIndex: 0,
  },
  item: { height: ITEM_H, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 22, color: c.textMuted, fontWeight: '400' },
  activeLabel: { fontSize: 26, color: c.textPrimary, fontWeight: Theme.fontWeight.bold },
});

const makeSheetStyles = (c: typeof Theme.colors) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: c.cardBackground,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Theme.spacing.md,
    paddingBottom: 40,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: c.border, alignSelf: 'center', marginBottom: Theme.spacing.md },
  title: { fontSize: Theme.fontSize.lg, fontWeight: Theme.fontWeight.bold, color: c.textPrimary, textAlign: 'center', marginBottom: Theme.spacing.lg },
  pickerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  colon: { fontSize: 28, fontWeight: Theme.fontWeight.bold, color: c.textPrimary, marginHorizontal: 2, marginBottom: 4 },
  periodCol: { marginLeft: Theme.spacing.lg, gap: Theme.spacing.sm, justifyContent: 'center' },
  periodBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: Theme.borderRadius.md, borderWidth: 1.5, borderColor: c.border },
  periodBtnActive: { backgroundColor: c.primary, borderColor: c.primary },
  periodText: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.medium, color: c.textSecondary },
  periodTextActive: { color: c.white },
  confirmBtn: { backgroundColor: c.primary, borderRadius: Theme.borderRadius.lg, paddingVertical: 14, alignItems: 'center', marginTop: Theme.spacing.xl },
  confirmText: { color: c.white, fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.bold },
});
