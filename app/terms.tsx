import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/lib/ThemeContext';

export default function TermsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms and Conditions</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Last Updated: March 2026</Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.bodyText}>
          By accessing or using Club Scentra, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use our services.
        </Text>

        <Text style={styles.sectionTitle}>2. User Accounts</Text>
        <Text style={styles.bodyText}>
          You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information when creating your account and to update your information as necessary.
        </Text>

        <Text style={styles.sectionTitle}>3. User Conduct</Text>
        <Text style={styles.bodyText}>
          You agree not to use Club Scentra for any unlawful purpose or in any way that could damage, disable, or impair the service. You must not post content that is offensive, harmful, or violates the rights of others.
        </Text>

        <Text style={styles.sectionTitle}>4. Events and Meetups</Text>
        <Text style={styles.bodyText}>
          Club Scentra provides a platform for organizing and discovering car meetups. We are not responsible for the conduct of users at events, vehicle safety, or any incidents that occur at meetups organized through our platform.
        </Text>

        <Text style={styles.sectionTitle}>5. Content Ownership</Text>
        <Text style={styles.bodyText}>
          You retain ownership of content you post on Club Scentra. By posting content, you grant us a non-exclusive license to use, display, and distribute your content within the platform.
        </Text>

        <Text style={styles.sectionTitle}>6. Privacy</Text>
        <Text style={styles.bodyText}>
          Your use of Club Scentra is also governed by our Privacy Policy. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.
        </Text>

        <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
        <Text style={styles.bodyText}>
          Club Scentra is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.
        </Text>

        <Text style={styles.sectionTitle}>8. Changes to Terms</Text>
        <Text style={styles.bodyText}>
          We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the modified terms.
        </Text>

        <Text style={styles.sectionTitle}>9. Contact</Text>
        <Text style={styles.bodyText}>
          For questions about these Terms and Conditions, please contact us at support@clubscentra.com.
        </Text>
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: typeof Theme.colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.md,
  },
  backButton: {
    padding: Theme.spacing.sm,
  },
  headerTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
    color: c.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.xl,
    paddingBottom: Theme.spacing.xxl,
  },
  lastUpdated: {
    fontSize: Theme.fontSize.sm,
    color: c.textMuted,
    marginBottom: Theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
    color: c.textPrimary,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
  },
  bodyText: {
    fontSize: Theme.fontSize.md,
    color: c.textSecondary,
    lineHeight: 22,
  },
});
