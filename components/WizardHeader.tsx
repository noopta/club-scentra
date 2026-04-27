import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';

interface WizardHeaderProps {
  title?: string;
  canGoBack?: boolean;
  cancelHref?: string;
  cancelConfirmMessage?: string;
}

export default function WizardHeader({
  title,
  canGoBack = true,
  cancelHref = '/(tabs)/meets',
  cancelConfirmMessage = 'Cancel creating this event? Your progress will be lost.',
}: WizardHeaderProps) {
  const router = useRouter();

  const handleCancel = () => {
    if (Platform.OS === 'web') {
      const ok = typeof window !== 'undefined' ? window.confirm(cancelConfirmMessage) : true;
      if (ok) router.replace(cancelHref as never);
      return;
    }
    Alert.alert(
      'Cancel Event Creation',
      cancelConfirmMessage,
      [
        { text: 'Keep editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.replace(cancelHref as never) },
      ],
    );
  };

  return (
    <View style={styles.header}>
      {canGoBack ? (
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={22} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconBtn} />
      )}
      <Text style={styles.title} numberOfLines={1}>{title ?? ''}</Text>
      <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
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
    textAlign: 'center',
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
    color: Theme.colors.textPrimary,
  },
  cancelBtn: {
    paddingHorizontal: 8,
    minWidth: 56,
    alignItems: 'flex-end',
  },
  cancelText: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.semibold,
    color: Theme.colors.primary,
  },
});
