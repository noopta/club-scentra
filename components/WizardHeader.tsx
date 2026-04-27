import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';

interface WizardHeaderProps {
  title?: string;
  cancelTo?: string;
  onCancelConfirm?: () => void;
  backBehavesAsCancel?: boolean;
}

export default function WizardHeader({ title, cancelTo = '/(tabs)/event', onCancelConfirm, backBehavesAsCancel = false }: WizardHeaderProps) {
  const router = useRouter();

  const performCancel = () => {
    if (onCancelConfirm) onCancelConfirm();
    router.replace(cancelTo as never);
  };

  const handleCancel = () => {
    if (Platform.OS === 'web') {
      const ok = typeof window !== 'undefined' && window.confirm
        ? window.confirm('Discard this event? Anything you\'ve entered will be lost.')
        : true;
      if (ok) performCancel();
      return;
    }
    Alert.alert(
      'Discard event?',
      'Anything you\'ve entered will be lost.',
      [
        { text: 'Keep editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: performCancel },
      ]
    );
  };

  const handleBack = () => {
    if (backBehavesAsCancel) {
      handleCancel();
    } else if (router.canGoBack && router.canGoBack()) {
      router.back();
    } else {
      handleCancel();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleBack} style={styles.iconBtn} hitSlop={10} activeOpacity={0.7}>
        <Ionicons name="arrow-back" size={24} color={Theme.colors.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.title} numberOfLines={1}>{title ?? ''}</Text>
      <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn} hitSlop={10} activeOpacity={0.7}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Platform.OS === 'ios' ? 8 : 4,
    paddingBottom: Theme.spacing.sm,
    minHeight: 44,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
  cancelBtn: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 8,
    minWidth: 60,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
    color: Theme.colors.primary,
  },
});
