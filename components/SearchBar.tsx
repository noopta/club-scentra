import React, { useMemo } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/lib/ThemeContext';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
}

export default function SearchBar({ placeholder = 'Name, Event, Venue', value, onChangeText }: SearchBarProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Ionicons name="search" size={14} color={Theme.colors.textSecondary} />
        <Text style={styles.label}>SEARCH</Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Theme.colors.textMuted}
          value={value}
          onChangeText={onChangeText}
        />
        <Ionicons name="search" size={20} color={Theme.colors.textMuted} />
      </View>
    </View>
  );
}

const makeStyles = (c: typeof Theme.colors) => StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: Theme.fontSize.xs,
    fontWeight: Theme.fontWeight.bold,
    color: c.textPrimary,
    marginLeft: 4,
    letterSpacing: 1,
  },
  inputContainer: {
    backgroundColor: c.cardBackground,
    borderRadius: Theme.borderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: c.border,
  },
  input: {
    flex: 1,
    fontSize: Theme.fontSize.md,
    color: c.textPrimary,
  },
});
