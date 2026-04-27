import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image, Platform, Alert, Linking, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { users } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  isToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  danger?: boolean;
  saving?: boolean;
  saved?: boolean;
}

function SettingsRow({ icon, label, onPress, isToggle, toggleValue, onToggle, danger, saving, saved }: SettingsRowProps) {
  return (
    <TouchableOpacity style={styles.settingsRow} onPress={onPress} activeOpacity={isToggle ? 1 : 0.7} disabled={isToggle}>
      <Ionicons name={icon} size={22} color={danger ? Theme.colors.danger : Theme.colors.textPrimary} />
      <Text style={[styles.settingsRowLabel, danger && styles.dangerText]}>{label}</Text>
      {isToggle ? (
        <View style={styles.toggleRight}>
          {saving ? (
            <ActivityIndicator size="small" color={Theme.colors.primary} style={styles.toggleStatus} />
          ) : saved ? (
            <Ionicons name="checkmark-circle" size={18} color={Theme.colors.primary} style={styles.toggleStatus} />
          ) : null}
          <Switch value={toggleValue} onValueChange={onToggle} trackColor={{ false: Theme.colors.border, true: Theme.colors.primary }} thumbColor={Theme.colors.white} />
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={18} color={Theme.colors.textMuted} />
      )}
    </TouchableOpacity>
  );
}

function showAlert(title: string, message: string, onConfirm?: () => void) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      if (onConfirm) {
        if (window.confirm(`${title}\n\n${message}`)) onConfirm();
      } else {
        window.alert(`${title}\n\n${message}`);
      }
    }
    return;
  }
  Alert.alert(title, message, onConfirm ? [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Confirm', style: 'destructive', onPress: onConfirm },
  ] : [{ text: 'OK' }]);
}

const COMING_SOON = 'This feature is coming soon. We\'re still putting it together — thanks for your patience.';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [locationServices, setLocationServices] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  useEffect(() => {
    users.getSettings()
      .then(s => {
        setPushNotifications(s.pushNotifications);
        setEmailNotifications(s.emailNotifications);
        setDarkMode(s.darkMode);
        setLocationServices(s.locationServices);
      })
      .catch(() => {});
  }, []);

  const revertMap: Record<string, (v: boolean) => void> = {
    pushNotifications: setPushNotifications,
    emailNotifications: setEmailNotifications,
    darkMode: setDarkMode,
    locationServices: setLocationServices,
  };

  const updateSetting = async (key: string, value: boolean) => {
    setSavingKey(key);
    setSavedKey(null);
    try {
      await users.updateSettings({ [key]: value });
      setSavedKey(key);
      setTimeout(() => {
        setSavedKey(prev => (prev === key ? null : prev));
      }, 1500);
    } catch {
      const revert = revertMap[key];
      if (revert) revert(!value);
      showAlert('Could not save', 'We couldn\'t save that change. Please try again in a moment.');
    } finally {
      setSavingKey(prev => (prev === key ? null : prev));
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/landing');
  };

  const handleChangePassword = () => {
    showAlert(
      'Change Password',
      'Password reset is coming soon. In the meantime, email support@clubscentra.com and we\'ll help you reset it.',
    );
  };

  const handlePrivacy = () => {
    showAlert('Privacy Settings', COMING_SOON);
  };

  const handleHelp = async () => {
    const url = 'mailto:support@clubscentra.com?subject=Club%20Scentra%20Help';
    const ok = await Linking.canOpenURL(url).catch(() => false);
    if (ok) Linking.openURL(url);
    else showAlert('Help Center', 'Email us at support@clubscentra.com and we\'ll get back to you.');
  };

  const handleReport = async () => {
    const url = 'mailto:support@clubscentra.com?subject=Club%20Scentra%20Bug%20Report&body=Tell%20us%20what%20happened%3A%0A%0A';
    const ok = await Linking.canOpenURL(url).catch(() => false);
    if (ok) Linking.openURL(url);
    else showAlert('Report a Problem', 'Email us at support@clubscentra.com with details and screenshots if you have them.');
  };

  const handleDeleteAccount = () => {
    showAlert(
      'Delete Account',
      'This will permanently remove your profile, posts, and meet history. This cannot be undone.',
      () => {
        showAlert(
          'Account Deletion',
          'Account deletion is processed manually for safety. We\'ve made a note — please email support@clubscentra.com from your account email and we\'ll complete it within 7 days.',
        );
      },
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.profileCard} activeOpacity={0.8} onPress={() => router.push('/edit-profile')}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.profileAvatar} />
          ) : (
            <View style={[styles.profileAvatar, { backgroundColor: Theme.colors.border }]} />
          )}
          <View>
            <Text style={styles.profileName}>{user?.displayName ?? user?.username}</Text>
            <Text style={styles.profileUsername}>@{user?.username}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Theme.colors.textMuted} style={styles.profileChevron} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.sectionCard}>
          <SettingsRow icon="person-outline" label="Edit Profile" onPress={() => router.push('/edit-profile')} />
          <SettingsRow icon="lock-closed-outline" label="Change Password" onPress={handleChangePassword} />
          <SettingsRow icon="shield-outline" label="Privacy" onPress={handlePrivacy} />
        </View>

        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.sectionCard}>
          <SettingsRow
            icon="notifications-outline"
            label="Push Notifications"
            isToggle
            toggleValue={pushNotifications}
            onToggle={(v) => { setPushNotifications(v); updateSetting('pushNotifications', v); }}
            saving={savingKey === 'pushNotifications'}
            saved={savedKey === 'pushNotifications'}
          />
          <SettingsRow
            icon="mail-outline"
            label="Email Notifications"
            isToggle
            toggleValue={emailNotifications}
            onToggle={(v) => { setEmailNotifications(v); updateSetting('emailNotifications', v); }}
            saving={savingKey === 'emailNotifications'}
            saved={savedKey === 'emailNotifications'}
          />
        </View>

        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.sectionCard}>
          <SettingsRow
            icon="moon-outline"
            label="Dark Mode"
            isToggle
            toggleValue={darkMode}
            onToggle={(v) => { setDarkMode(v); updateSetting('darkMode', v); }}
            saving={savingKey === 'darkMode'}
            saved={savedKey === 'darkMode'}
          />
          <SettingsRow
            icon="navigate-outline"
            label="Location Services"
            isToggle
            toggleValue={locationServices}
            onToggle={(v) => { setLocationServices(v); updateSetting('locationServices', v); }}
            saving={savingKey === 'locationServices'}
            saved={savedKey === 'locationServices'}
          />
        </View>

        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.sectionCard}>
          <SettingsRow icon="help-circle-outline" label="Help Center" onPress={handleHelp} />
          <SettingsRow icon="alert-circle-outline" label="Report a Problem" onPress={handleReport} />
          <SettingsRow icon="document-text-outline" label="Terms of Service" onPress={() => router.push('/terms')} />
          <SettingsRow icon="eye-outline" label="Privacy Policy" onPress={() => router.push('/privacy-policy')} />
        </View>

        <View style={styles.sectionCard}>
          <SettingsRow icon="log-out-outline" label="Log Out" danger onPress={handleLogout} />
          <SettingsRow icon="trash-outline" label="Delete Account" danger onPress={handleDeleteAccount} />
        </View>

        <Text style={styles.versionText}>Club Scentra v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 54 : 40, paddingHorizontal: Theme.spacing.md, paddingBottom: Theme.spacing.md },
  backButton: { padding: Theme.spacing.sm },
  headerTitle: { fontSize: Theme.fontSize.xl, fontWeight: Theme.fontWeight.bold, color: Theme.colors.textPrimary },
  headerSpacer: { width: 40 },
  scrollContent: { paddingHorizontal: Theme.spacing.md, paddingBottom: Theme.spacing.xxl },
  profileCard: { backgroundColor: Theme.colors.cardBackground, borderRadius: Theme.borderRadius.md, flexDirection: 'row', alignItems: 'center', padding: Theme.spacing.md, marginBottom: Theme.spacing.lg },
  profileAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: Theme.spacing.md },
  profileName: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.semibold, color: Theme.colors.textPrimary },
  profileUsername: { fontSize: Theme.fontSize.sm, color: Theme.colors.textSecondary },
  profileChevron: { marginLeft: 'auto' },
  sectionTitle: { fontSize: Theme.fontSize.sm, fontWeight: Theme.fontWeight.bold, color: Theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: Theme.spacing.sm, marginTop: Theme.spacing.sm },
  sectionCard: { backgroundColor: Theme.colors.cardBackground, borderRadius: Theme.borderRadius.md, marginBottom: Theme.spacing.md, overflow: 'hidden' },
  settingsRow: { flexDirection: 'row', alignItems: 'center', padding: Theme.spacing.md, borderBottomWidth: 1, borderBottomColor: Theme.colors.divider },
  settingsRowLabel: { flex: 1, fontSize: Theme.fontSize.md, color: Theme.colors.textPrimary, marginLeft: Theme.spacing.md },
  dangerText: { color: Theme.colors.danger },
  versionText: { textAlign: 'center', fontSize: Theme.fontSize.sm, color: Theme.colors.textMuted, marginTop: Theme.spacing.md },
  toggleRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleStatus: { width: 18, height: 18 },
});
