import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/lib/ThemeContext';

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
}

export default function StepIndicator({ totalSteps, currentStep }: StepIndicatorProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index < currentStep ? styles.activeDot : styles.inactiveDot,
          ]}
        />
      ))}
    </View>
  );
}

const makeStyles = (c: typeof Theme.colors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: c.textPrimary,
  },
  inactiveDot: {
    backgroundColor: c.border,
  },
});
