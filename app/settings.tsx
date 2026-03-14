import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  isToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  danger?: boolean;
}

function SettingsRow({ icon, label, onPress, isToggle, toggleValue, onToggle, danger }: SettingsRowProps) {
  return (
    <TouchableOpacity
      style={styles.settingsRow}
      onPress={onPress}
      activeOpacity={isToggle ? 1 : 0.7}
      disabled={isToggle}
    >
      <Ionicons
        name={icon}
        size={22}
        color={danger ? Theme.colors.danger : Theme.colors.textPrimary}
      />
      <Text style={[styles.settingsRowLabel, danger && styles.dangerText]}>{label}</Text>
      {isToggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: Theme.colors.border, true: Theme.colors.primary }}
          thumbColor={Theme.colors.white}
        />
      ) : (
        <Ionicons name="chevron-forward" size={18} color={Theme.colors.textMuted} />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [locationServices, setLocationServices] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.profileCard} activeOpacity={0.8}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' }}
            style={styles.profileAvatar}
          />
          <View>
            <Text style={styles.profileName}>Sara Nova</Text>
            <Text style={styles.profileUsername}>@Saraaa13</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Theme.colors.textMuted} style={styles.profileChevron} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.sectionCard}>
          <SettingsRow icon="person-outline" label="Edit Profile" onPress={() => router.push('/edit-profile')} />
          <SettingsRow icon="lock-closed-outline" label="Change Password" onPress={() => {}} />
          <SettingsRow icon="shield-outline" label="Privacy" onPress={() => {}} />
        </View>

        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.sectionCard}>
          <SettingsRow
            icon="notifications-outline"
            label="Push Notifications"
            isToggle
            toggleValue={pushNotifications}
            onToggle={setPushNotifications}
          />
          <SettingsRow
            icon="mail-outline"
            label="Email Notifications"
            isToggle
            toggleValue={emailNotifications}
            onToggle={setEmailNotifications}
          />
        </View>

        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.sectionCard}>
          <SettingsRow
            icon="moon-outline"
            label="Dark Mode"
            isToggle
            toggleValue={darkMode}
            onToggle={setDarkMode}
          />
          <SettingsRow
            icon="navigate-outline"
            label="Location Services"
            isToggle
            toggleValue={locationServices}
            onToggle={setLocationServices}
          />
        </View>

        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.sectionCard}>
          <SettingsRow icon="help-circle-outline" label="Help Center" onPress={() => {}} />
          <SettingsRow icon="alert-circle-outline" label="Report a Problem" onPress={() => {}} />
          <SettingsRow icon="document-text-outline" label="Terms of Service" onPress={() => router.push('/terms')} />
          <SettingsRow icon="eye-outline" label="Privacy Policy" onPress={() => {}} />
        </View>

        <View style={styles.sectionCard}>
          <SettingsRow
            icon="log-out-outline"
            label="Log Out"
            danger
            onPress={() => router.replace('/(auth)/landing')}
          />
          <SettingsRow
            icon="trash-outline"
            label="Delete Account"
            danger
            onPress={() => {}}
          />
        </View>

        <Text style={styles.versionText}>Club Scentra v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 54 : 40,
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.md,
  },
  backButton: {
    padding: Theme.spacing.sm,
  },
  headerTitle: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.xxl,
  },
  profileCard: {
    backgroundColor: Theme.colors.cardBackground,
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: Theme.spacing.md,
  },
  profileName: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
    color: Theme.colors.textPrimary,
  },
  profileUsername: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.textSecondary,
  },
  profileChevron: {
    marginLeft: 'auto',
  },
  sectionTitle: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Theme.spacing.sm,
    marginTop: Theme.spacing.sm,
  },
  sectionCard: {
    backgroundColor: Theme.colors.cardBackground,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.divider,
  },
  settingsRowLabel: {
    flex: 1,
    fontSize: Theme.fontSize.md,
    color: Theme.colors.textPrimary,
    marginLeft: Theme.spacing.md,
  },
  dangerText: {
    color: Theme.colors.danger,
  },
  versionText: {
    textAlign: 'center',
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.textMuted,
    marginTop: Theme.spacing.md,
  },
});
