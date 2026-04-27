import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/lib/ThemeContext';
import { users } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  isToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  status?: 'saving' | 'saved' | null;
  isLast?: boolean;
  danger?: boolean;
}

function SettingsRow({ icon, label, onPress, isToggle, toggleValue, onToggle, danger, status, isLast }: SettingsRowProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeRowStyles(colors), [colors]);
  return (
    <TouchableOpacity
      style={[styles.settingsRow, isLast && styles.settingsRowLast]}
      onPress={onPress}
      activeOpacity={isToggle ? 1 : 0.7}
      disabled={isToggle}
    >
      <Ionicons name={icon} size={22} color={danger ? colors.danger : colors.textPrimary} />
      <Text style={[styles.settingsRowLabel, danger && styles.dangerText]}>{label}</Text>
      {isToggle ? (
        <View style={styles.toggleArea}>
          {status === 'saving' ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />
          ) : status === 'saved' ? (
            <View style={styles.savedPill}>
              <Ionicons name="checkmark" size={12} color={colors.white} />
              <Text style={styles.savedText}>Saved</Text>
            </View>
          ) : null}
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      )}
    </TouchableOpacity>
  );
}

type ToggleKey = 'pushNotifications' | 'emailNotifications' | 'locationServices';

export default function SettingsScreen() {
  const { colors, mode, setMode } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const router = useRouter();
  const { user, logout } = useAuth();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [locationServices, setLocationServices] = useState(true);
  const [darkModeStatus, setDarkModeStatus] = useState<'saving' | 'saved' | null>(null);
  const [toggleStatus, setToggleStatus] = useState<Record<ToggleKey, 'saving' | 'saved' | null>>({
    pushNotifications: null, emailNotifications: null, locationServices: null,
  });
  const [banner, setBanner] = useState<{ message: string; tone: 'info' | 'error' } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    users.getSettings()
      .then(s => {
        setPushNotifications(s.pushNotifications);
        setEmailNotifications(s.emailNotifications);
        setLocationServices(s.locationServices);
      })
      .catch(() => {});
  }, []);

  useEffect(() => () => {
    if (bannerTimer.current) clearTimeout(bannerTimer.current);
  }, []);

  const showBanner = (message: string, tone: 'info' | 'error' = 'info') => {
    if (bannerTimer.current) clearTimeout(bannerTimer.current);
    setBanner({ message, tone });
    bannerTimer.current = setTimeout(() => setBanner(null), 2800);
  };

  const updateSetting = async (key: ToggleKey, value: boolean) => {
    setToggleStatus(s => ({ ...s, [key]: 'saving' }));
    try {
      await users.updateSettings({ [key]: value });
      setToggleStatus(s => ({ ...s, [key]: 'saved' }));
      setTimeout(() => {
        setToggleStatus(s => ({ ...s, [key]: null }));
      }, 1800);
    } catch {
      setToggleStatus(s => ({ ...s, [key]: null }));
      if (key === 'pushNotifications') setPushNotifications(!value);
      if (key === 'emailNotifications') setEmailNotifications(!value);
      if (key === 'locationServices') setLocationServices(!value);
      showBanner('Couldn\'t save that change. Please try again.', 'error');
    }
  };

  const handleDarkModeToggle = async (value: boolean) => {
    setDarkModeStatus('saving');
    try {
      await setMode(value ? 'dark' : 'light');
      setDarkModeStatus('saved');
      setTimeout(() => setDarkModeStatus(null), 1800);
    } catch {
      setDarkModeStatus(null);
      showBanner('Couldn\'t save your theme. Please try again.', 'error');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/landing');
  };

  const performDelete = async () => {
    setDeleting(true);
    try {
      await users.deleteMe();
      await logout();
      router.replace('/(auth)/landing');
    } catch (err: unknown) {
      setDeleting(false);
      const msg = err instanceof Error ? err.message : 'Could not delete account';
      showBanner(msg, 'error');
    }
  };

  const handleDeleteAccount = () => {
    if (deleting) return;
    const message = 'Deleting your account is permanent. All your events, posts, and messages will be removed. This cannot be undone.';
    if (Platform.OS === 'web') {
      const ok = typeof window !== 'undefined' && window.confirm
        ? window.confirm(`Delete account?\n\n${message}`)
        : false;
      if (ok) performDelete();
      return;
    }
    Alert.alert(
      'Delete account?',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: performDelete },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      {banner && (
        <View style={[styles.banner, banner.tone === 'error' ? styles.bannerError : styles.bannerInfo]}>
          <Ionicons
            name={banner.tone === 'error' ? 'alert-circle' : 'information-circle'}
            size={18}
            color={colors.primary}
          />
          <Text style={styles.bannerText}>{banner.message}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.profileCard} activeOpacity={0.8} onPress={() => router.push('/edit-profile')}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.profileAvatar} />
          ) : (
            <View style={[styles.profileAvatar, { backgroundColor: colors.border }]} />
          )}
          <View>
            <Text style={styles.profileName}>{user?.displayName ?? user?.username}</Text>
            <Text style={styles.profileUsername}>@{user?.username}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={styles.profileChevron} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.sectionCard}>
          <SettingsRow icon="person-outline" label="Edit Profile" onPress={() => router.push('/edit-profile')} />
          <SettingsRow icon="lock-closed-outline" label="Change Password" onPress={() => router.push('/change-password')} />
          <SettingsRow icon="shield-outline" label="Privacy" onPress={() => router.push('/privacy-settings')} isLast />
        </View>

        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.sectionCard}>
          <SettingsRow
            icon="notifications-outline"
            label="Push Notifications"
            isToggle
            toggleValue={pushNotifications}
            status={toggleStatus.pushNotifications}
            onToggle={(v) => { setPushNotifications(v); updateSetting('pushNotifications', v); }}
          />
          <SettingsRow
            icon="mail-outline"
            label="Email Notifications"
            isToggle
            toggleValue={emailNotifications}
            status={toggleStatus.emailNotifications}
            onToggle={(v) => { setEmailNotifications(v); updateSetting('emailNotifications', v); }}
            isLast
          />
        </View>

        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.sectionCard}>
          <SettingsRow
            icon="moon-outline"
            label="Dark Mode"
            isToggle
            toggleValue={mode === 'dark'}
            status={darkModeStatus}
            onToggle={handleDarkModeToggle}
          />
          <SettingsRow
            icon="navigate-outline"
            label="Location Services"
            isToggle
            toggleValue={locationServices}
            status={toggleStatus.locationServices}
            onToggle={(v) => { setLocationServices(v); updateSetting('locationServices', v); }}
            isLast
          />
        </View>

        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.sectionCard}>
          <SettingsRow icon="help-circle-outline" label="Help Center" onPress={() => router.push('/help')} />
          <SettingsRow icon="alert-circle-outline" label="Report a Problem" onPress={() => router.push('/report-problem')} />
          <SettingsRow icon="document-text-outline" label="Terms of Service" onPress={() => router.push('/terms')} />
          <SettingsRow icon="eye-outline" label="Privacy Policy" onPress={() => router.push('/privacy-policy')} isLast />
        </View>

        <View style={styles.sectionCard}>
          <SettingsRow icon="log-out-outline" label="Log Out" danger onPress={handleLogout} />
          <SettingsRow
            icon="trash-outline"
            label={deleting ? 'Deleting…' : 'Delete Account'}
            danger
            onPress={handleDeleteAccount}
            isLast
          />
        </View>

        <Text style={styles.versionText}>Club Scentra v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const makeRowStyles = (c: typeof Theme.colors) => StyleSheet.create({
  settingsRow: { flexDirection: 'row', alignItems: 'center', padding: Theme.spacing.md, borderBottomWidth: 1, borderBottomColor: c.divider },
  settingsRowLast: { borderBottomWidth: 0 },
  settingsRowLabel: { flex: 1, fontSize: Theme.fontSize.md, color: c.textPrimary, marginLeft: Theme.spacing.md },
  toggleArea: { flexDirection: 'row', alignItems: 'center' },
  savedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: c.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    marginRight: 8,
  },
  savedText: {
    color: c.white,
    fontSize: 11,
    fontWeight: Theme.fontWeight.semibold,
  },
  dangerText: { color: c.danger },
});

const makeStyles = (c: typeof Theme.colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 54 : 40, paddingHorizontal: Theme.spacing.md, paddingBottom: Theme.spacing.md },
  backButton: { padding: Theme.spacing.sm },
  headerTitle: { fontSize: Theme.fontSize.xl, fontWeight: Theme.fontWeight.bold, color: c.textPrimary },
  headerSpacer: { width: 40 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 10,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    backgroundColor: c.cardBackground,
    borderColor: c.border,
  },
  bannerInfo: {},
  bannerError: {},
  bannerText: {
    flex: 1,
    fontSize: Theme.fontSize.sm,
    color: c.textPrimary,
  },
  scrollContent: { paddingHorizontal: Theme.spacing.md, paddingBottom: Theme.spacing.xxl },
  profileCard: { backgroundColor: c.cardBackground, borderRadius: Theme.borderRadius.md, flexDirection: 'row', alignItems: 'center', padding: Theme.spacing.md, marginBottom: Theme.spacing.lg },
  profileAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: Theme.spacing.md },
  profileName: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.semibold, color: c.textPrimary },
  profileUsername: { fontSize: Theme.fontSize.sm, color: c.textSecondary },
  profileChevron: { marginLeft: 'auto' },
  sectionTitle: { fontSize: Theme.fontSize.sm, fontWeight: Theme.fontWeight.bold, color: c.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: Theme.spacing.sm, marginTop: Theme.spacing.sm },
  sectionCard: { backgroundColor: c.cardBackground, borderRadius: Theme.borderRadius.md, marginBottom: Theme.spacing.md, overflow: 'hidden' },
  versionText: { textAlign: 'center', fontSize: Theme.fontSize.sm, color: c.textMuted, marginTop: Theme.spacing.md },
});
