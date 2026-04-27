import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';

const SUPPORT_EMAIL = 'support@clubscentra.com';
const HELP_URL = 'https://clubscentra.com/help';

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How do I create a meet?',
    a: 'Open the EVENT tab in the bottom bar, then walk through the four steps: name and details, location, schedule, and a cover photo.',
  },
  {
    q: 'How do RSVPs work?',
    a: 'On any event, tap "Going" or "Interested" to RSVP. You can change or remove your RSVP at any time from the event page.',
  },
  {
    q: 'How do I post a photo from a meet?',
    a: 'Open the meet, tap the "+" in the story header, choose a photo, and share. Your post appears in that meet\u2019s story feed and your profile.',
  },
  {
    q: 'How do I block or report a member?',
    a: 'On any profile, tap the menu and choose Report. For privacy controls, head to Settings > Privacy.',
  },
  {
    q: 'How do I delete my account?',
    a: 'Go to Settings, scroll to the bottom, and tap Delete Account. Deletion is permanent and removes all your meets, posts, and messages.',
  },
];

function openUrl(url: string) {
  Linking.openURL(url).catch(() => {
    if (Platform.OS === 'web') {
      try {
        window.open(url, '_blank');
        return;
      } catch {}
    }
    Alert.alert('Couldn\u2019t open link', url);
  });
}

export default function HelpCenterScreen() {
  const router = useRouter();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Find quick answers below. Still stuck? Email us or open the full help site.
        </Text>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionPrimary]}
            onPress={() => openUrl(`mailto:${SUPPORT_EMAIL}?subject=Club%20Scentra%20Support`)}
            activeOpacity={0.8}
          >
            <Ionicons name="mail-outline" size={18} color={Theme.colors.white} />
            <Text style={styles.actionPrimaryText}>Email Support</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionSecondary]}
            onPress={() => openUrl(HELP_URL)}
            activeOpacity={0.8}
          >
            <Ionicons name="open-outline" size={18} color={Theme.colors.primary} />
            <Text style={styles.actionSecondaryText}>Visit Help Site</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Frequently Asked</Text>
        <View style={styles.sectionCard}>
          {FAQS.map((faq, idx) => {
            const open = openIdx === idx;
            return (
              <View key={faq.q} style={[styles.faqRow, idx === FAQS.length - 1 && styles.faqRowLast]}>
                <TouchableOpacity
                  style={styles.faqHeader}
                  onPress={() => setOpenIdx(open ? null : idx)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.faqQuestion}>{faq.q}</Text>
                  <Ionicons
                    name={open ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={Theme.colors.textMuted}
                  />
                </TouchableOpacity>
                {open ? <Text style={styles.faqAnswer}>{faq.a}</Text> : null}
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.reportRow}
          activeOpacity={0.7}
          onPress={() => router.push('/report-problem')}
        >
          <Ionicons name="alert-circle-outline" size={22} color={Theme.colors.textPrimary} />
          <Text style={styles.reportText}>Report a Problem</Text>
          <Ionicons name="chevron-forward" size={18} color={Theme.colors.textMuted} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 54 : 40,
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.md,
  },
  backButton: { padding: Theme.spacing.sm },
  headerTitle: { fontSize: Theme.fontSize.xl, fontWeight: Theme.fontWeight.bold, color: Theme.colors.textPrimary },
  headerSpacer: { width: 40 },
  scrollContent: { paddingHorizontal: Theme.spacing.md, paddingBottom: Theme.spacing.xxl },
  intro: { fontSize: Theme.fontSize.sm, color: Theme.colors.textSecondary, marginBottom: Theme.spacing.md, lineHeight: 20 },
  actionRow: { flexDirection: 'row', gap: Theme.spacing.sm, marginBottom: Theme.spacing.lg },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: Theme.borderRadius.md,
    gap: 8,
  },
  actionPrimary: { backgroundColor: Theme.colors.primary },
  actionPrimaryText: { color: Theme.colors.white, fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.semibold },
  actionSecondary: { backgroundColor: Theme.colors.cardBackground, borderWidth: 1, borderColor: Theme.colors.primary },
  actionSecondaryText: { color: Theme.colors.primary, fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.semibold },
  sectionTitle: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Theme.spacing.sm,
  },
  sectionCard: {
    backgroundColor: Theme.colors.cardBackground,
    borderRadius: Theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: Theme.spacing.md,
  },
  faqRow: { borderBottomWidth: 1, borderBottomColor: Theme.colors.divider, paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.md },
  faqRowLast: { borderBottomWidth: 0 },
  faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  faqQuestion: { flex: 1, fontSize: Theme.fontSize.md, color: Theme.colors.textPrimary, fontWeight: Theme.fontWeight.medium, marginRight: Theme.spacing.sm },
  faqAnswer: { fontSize: Theme.fontSize.sm, color: Theme.colors.textSecondary, marginTop: Theme.spacing.sm, lineHeight: 20 },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.cardBackground,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    gap: Theme.spacing.md,
  },
  reportText: { flex: 1, fontSize: Theme.fontSize.md, color: Theme.colors.textPrimary },
});
