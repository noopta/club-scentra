import React from 'react';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';

interface FilterPillProps {
  icon: keyof typeof import('@expo/vector-icons/build/Ionicons').default.glyphMap;
  placeholder: string;
  value: string;
  onPress: () => void;
  onClear?: () => void;
}

export default function FilterPill({ icon, placeholder, value, onPress, onClear }: FilterPillProps) {
  const isActive = !!value;
  return (
    <TouchableOpacity
      style={[styles.pill, isActive && styles.pillActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons
        name={icon}
        size={16}
        color={isActive ? Theme.colors.primary : Theme.colors.textSecondary}
      />
      <Text
        style={[styles.text, isActive && styles.textActive]}
        numberOfLines={1}
      >
        {value || placeholder}
      </Text>
      {isActive && onClear ? (
        <TouchableOpacity onPress={onClear} hitSlop={10} style={styles.clearHit}>
          <Ionicons name="close" size={14} color={Theme.colors.primary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.chevronWrap}>
          <Ionicons name="chevron-down" size={14} color={Theme.colors.textSecondary} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 44,
    gap: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  pillActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: '#FFF5F5',
  },
  text: {
    flex: 1,
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.textSecondary,
    fontWeight: Theme.fontWeight.medium,
  },
  textActive: {
    color: Theme.colors.primary,
    fontWeight: Theme.fontWeight.semibold,
  },
  chevronWrap: {
    width: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearHit: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
