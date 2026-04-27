import React, { useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/lib/ThemeContext';

interface InputFieldProps extends TextInputProps {
  label: string;
  required?: boolean;
  containerStyle?: ViewStyle;
}

export default function InputField({ label, required, containerStyle, ...props }: InputFieldProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>
        {label}{required ? '*' : ''}
      </Text>
      <TextInput
        style={styles.input}
        placeholderTextColor={Theme.colors.textMuted}
        {...props}
      />
    </View>
  );
}

const makeStyles = (c: typeof Theme.colors) => StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.md,
    width: '100%',
  },
  label: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.medium,
    color: c.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  input: {
    backgroundColor: c.inputBackground,
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 14,
    fontSize: Theme.fontSize.md,
    color: c.textPrimary,
    width: '100%',
  },
});
