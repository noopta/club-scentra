import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { Theme } from '@/constants/Theme';

interface InputFieldProps extends TextInputProps {
  label: string;
  required?: boolean;
  containerStyle?: ViewStyle;
}

export default function InputField({ label, required, containerStyle, ...props }: InputFieldProps) {
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

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.md,
    width: '100%',
  },
  label: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.medium,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  input: {
    backgroundColor: Theme.colors.inputBackground,
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 14,
    fontSize: Theme.fontSize.md,
    color: Theme.colors.textPrimary,
    width: '100%',
  },
});
