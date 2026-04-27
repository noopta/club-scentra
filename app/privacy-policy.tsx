import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/lib/ThemeContext';

export default function PrivacyPolicyScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last Updated: April 2026</Text>

        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.bodyText}>
          When you create an account on Club Scentra we collect the basics you provide — username, email, display name, and any photos or details you choose to add. If you sign in with Apple or Google, we receive only what those providers share with us.
        </Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.bodyText}>
          We use your information to operate and improve Club Scentra: showing you nearby car meets, letting you RSVP, post photos, message other members, and personalize what you see. We do not sell your personal data.
        </Text>

        <Text style={styles.sectionTitle}>3. Photos and Posts</Text>
        <Text style={styles.bodyText}>
          Photos you post to your profile are visible to other members. Photos you post to a meet appear in that meet's story feed. You can delete your posts at any time, and removing a post removes it from anywhere it was shared in the app.
        </Text>

        <Text style={styles.sectionTitle}>4. Location</Text>
        <Text style={styles.bodyText}>
          We use your approximate location only to surface nearby meets and tag the events you host. You can turn this off any time from the Settings screen.
        </Text>

        <Text style={styles.sectionTitle}>5. Notifications</Text>
        <Text style={styles.bodyText}>
          We send notifications about meet invites, messages, and activity on your posts. You can manage what you receive in Settings under Notifications.
        </Text>

        <Text style={styles.sectionTitle}>6. Data Retention and Deletion</Text>
        <Text style={styles.bodyText}>
          We keep your account data while your account is active. To request deletion of your account and associated data, use Delete Account in Settings or email support@clubscentra.com.
        </Text>

        <Text style={styles.sectionTitle}>7. Contact Us</Text>
        <Text style={styles.bodyText}>
          Questions about privacy? Reach out at support@clubscentra.com and we'll get back to you.
        </Text>
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: typeof Theme.colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 54 : 40, paddingHorizontal: Theme.spacing.md, paddingBottom: Theme.spacing.md },
  backButton: { padding: Theme.spacing.sm },
  headerTitle: { fontSize: Theme.fontSize.xl, fontWeight: Theme.fontWeight.bold, color: c.textPrimary },
  headerSpacer: { width: 40 },
  scrollContent: { paddingHorizontal: Theme.spacing.lg, paddingBottom: Theme.spacing.xxl },
  lastUpdated: { fontSize: Theme.fontSize.sm, color: c.textSecondary, marginBottom: Theme.spacing.lg, fontStyle: 'italic' },
  sectionTitle: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.bold, color: c.textPrimary, marginTop: Theme.spacing.md, marginBottom: Theme.spacing.sm },
  bodyText: { fontSize: Theme.fontSize.sm, color: c.textPrimary, lineHeight: 22, marginBottom: Theme.spacing.sm },
});
