import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image, Platform, Alert, ActivityIndicator } from 'react-native';
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
  status?: 'saving' | 'saved' | null;
  isLast?: boolean;
}

function SettingsRow({ icon, label, onPress, isToggle, toggleValue, onToggle, danger, status, isLast }: SettingsRowProps) {
  return (
    <TouchableOpacity
      style={[styles.settingsRow, isLast && styles.settingsRowLast]}
      onPress={onPress}
      activeOpacity={isToggle ? 1 : 0.7}
      disabled={isToggle}
    >
      <Ionicons name={icon} size={22} color={danger ? Theme.colors.danger : Theme.colors.textPrimary} />
      <Text style={[styles.settingsRowLabel, danger && styles.dangerText]}>{label}</Text>
      {isToggle ? (
        <View style={styles.toggleArea}>
          {status === 'saving' ? (
            <ActivityIndicator size="small" color={Theme.colors.primary} style={{ marginRight: 8 }} />
          ) : status === 'saved' ? (
            <View style={styles.savedPill}>
              <Ionicons name="checkmark" size={12} color={Theme.colors.white} />
              <Text style={styles.savedText}>Saved</Text>
            </View>
          ) : null}
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            trackColor={{ false: Theme.colors.border, true: Theme.colors.primary }}
            thumbColor={Theme.colors.white}
          />
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={18} color={Theme.colors.textMuted} />
      )}
    </TouchableOpacity>
  );
}

type ToggleKey = 'pushNotifications' | 'emailNotifications' | 'darkMode' | 'locationServices';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [locationServices, setLocationServices] = useState(true);
  const [toggleStatus, setToggleStatus] = useState<Record<ToggleKey, 'saving' | 'saved' | null>>({
    pushNotifications: null, emailNotifications: null, darkMode: null, locationServices: null,
  });
  const [banner, setBanner] = useState<{ message: string; tone: 'info' | 'error' } | null>(null);
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      // revert local state
      if (key === 'pushNotifications') setPushNotifications(!value);
      if (key === 'emailNotifications') setEmailNotifications(!value);
      if (key === 'darkMode') setDarkMode(!value);
      if (key === 'locationServices') setLocationServices(!value);
      showBanner('Couldn\'t save that change. Please try again.', 'error');
    }
  };

  const comingSoon = (label: string) => () => {
    showBanner(`${label} is coming soon.`);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/landing');
  };

  const handleDeleteAccount = () => {
    const message = 'Deleting your account is permanent. All your events, posts, and messages will be removed. This cannot be undone.';
    if (Platform.OS === 'web') {
      const ok = typeof window !== 'undefined' && window.confirm
        ? window.confirm(`Delete account?\n\n${message}`)
        : false;
      if (ok) showBanner('Account deletion is coming soon.');
      return;
    }
    Alert.alert(
      'Delete account?',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => showBanner('Account deletion is coming soon.'),
        },
      ]
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

      {banner && (
        <View style={[styles.banner, banner.tone === 'error' ? styles.bannerError : styles.bannerInfo]}>
          <Ionicons
            name={banner.tone === 'error' ? 'alert-circle' : 'information-circle'}
            size={18}
            color={banner.tone === 'error' ? Theme.colors.primary : Theme.colors.primary}
          />
          <Text style={styles.bannerText}>{banner.message}</Text>
        </View>
      )}

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
          <SettingsRow icon="lock-closed-outline" label="Change Password" onPress={comingSoon('Change Password')} />
          <SettingsRow icon="shield-outline" label="Privacy" onPress={comingSoon('Privacy controls')} isLast />
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
            toggleValue={darkMode}
            status={toggleStatus.darkMode}
            onToggle={(v) => { setDarkMode(v); updateSetting('darkMode', v); }}
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
          <SettingsRow icon="help-circle-outline" label="Help Center" onPress={comingSoon('Help Center')} />
          <SettingsRow icon="alert-circle-outline" label="Report a Problem" onPress={comingSoon('Reporting')} />
          <SettingsRow icon="document-text-outline" label="Terms of Service" onPress={() => router.push('/terms')} />
          <SettingsRow icon="eye-outline" label="Privacy Policy" onPress={comingSoon('Privacy Policy')} isLast />
        </View>

        <View style={styles.sectionCard}>
          <SettingsRow icon="log-out-outline" label="Log Out" danger onPress={handleLogout} />
          <SettingsRow icon="trash-outline" label="Delete Account" danger onPress={handleDeleteAccount} isLast />
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
  },
  bannerInfo: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FFCDD2',
  },
  bannerError: {
    backgroundColor: '#FFF0F0',
    borderColor: '#FFCDD2',
  },
  bannerText: {
    flex: 1,
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.textPrimary,
  },
  scrollContent: { paddingHorizontal: Theme.spacing.md, paddingBottom: Theme.spacing.xxl },
  profileCard: { backgroundColor: Theme.colors.cardBackground, borderRadius: Theme.borderRadius.md, flexDirection: 'row', alignItems: 'center', padding: Theme.spacing.md, marginBottom: Theme.spacing.lg },
  profileAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: Theme.spacing.md },
  profileName: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.semibold, color: Theme.colors.textPrimary },
  profileUsername: { fontSize: Theme.fontSize.sm, color: Theme.colors.textSecondary },
  profileChevron: { marginLeft: 'auto' },
  sectionTitle: { fontSize: Theme.fontSize.sm, fontWeight: Theme.fontWeight.bold, color: Theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: Theme.spacing.sm, marginTop: Theme.spacing.sm },
  sectionCard: { backgroundColor: Theme.colors.cardBackground, borderRadius: Theme.borderRadius.md, marginBottom: Theme.spacing.md, overflow: 'hidden' },
  settingsRow: { flexDirection: 'row', alignItems: 'center', padding: Theme.spacing.md, borderBottomWidth: 1, borderBottomColor: Theme.colors.divider },
  settingsRowLast: { borderBottomWidth: 0 },
  settingsRowLabel: { flex: 1, fontSize: Theme.fontSize.md, color: Theme.colors.textPrimary, marginLeft: Theme.spacing.md },
  toggleArea: { flexDirection: 'row', alignItems: 'center' },
  savedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    marginRight: 8,
  },
  savedText: {
    color: Theme.colors.white,
    fontSize: 11,
    fontWeight: Theme.fontWeight.semibold,
  },
  dangerText: { color: Theme.colors.danger },
  versionText: { textAlign: 'center', fontSize: Theme.fontSize.sm, color: Theme.colors.textMuted, marginTop: Theme.spacing.md },
  toggleRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleStatus: { width: 18, height: 18 },
});
