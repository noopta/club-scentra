import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/lib/ThemeContext';

const SUPPORT_EMAIL = 'support@clubscentra.app';

const FAQ: { section: string; items: { q: string; a: string }[] }[] = [
  {
    section: 'Getting started',
    items: [
      { q: 'How do I create an account?', a: 'Tap Sign up on the welcome screen, then enter your email, username, and password — or continue with Google or Apple.' },
      { q: 'Why do I need to verify my email?', a: 'We use email verification to keep your account secure and to send important account updates such as password resets.' },
    ],
  },
  {
    section: 'Events & meets',
    items: [
      { q: 'How do I create a meet?', a: 'Tap the EVENT tab at the bottom, give your meet a name and short description, set a location and date, then add a cover photo.' },
      { q: 'How do I RSVP?', a: 'Open any event and tap "Going" or "Interested" near the top. You can change your RSVP at any time. Friends can see who else is attending.' },
      { q: 'Can I edit a meet after I post it?', a: 'Yes — open the meet from the MEETS tab under "Hosting" and tap the edit icon. You cannot change the event after it has ended.' },
    ],
  },
  {
    section: 'Posts & stories',
    items: [
      { q: 'How do I share a post from a meet?', a: 'On any event detail page, tap the "Add to story" chip, choose a photo, write a caption, and post.' },
      { q: 'Who can see my posts?', a: 'Posts are visible based on your Privacy settings. By default, your posts are visible to friends.' },
    ],
  },
  {
    section: 'Friends & messaging',
    items: [
      { q: 'How do I add a friend?', a: 'Open the FRIENDS tab and use the search bar. Tap "Add friend" on a profile to send a request.' },
      { q: 'How do I block someone?', a: 'Open their profile, tap the three-dot menu in the top right, then choose "Block". Blocked users can no longer find or message you.' },
    ],
  },
  {
    section: 'Account & privacy',
    items: [
      { q: 'How do I change my password?', a: 'Go to Settings → Change Password and follow the prompts. You will need your current password.' },
      { q: 'How do I delete my account?', a: 'Go to Settings, scroll to the bottom, and tap "Delete Account". This action is permanent.' },
    ],
  },
];

export default function HelpScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const router = useRouter();
  const [openKey, setOpenKey] = useState<string | null>(null);

  const handleContact = () => {
    const subject = encodeURIComponent('Club Scentra Support');
    const url = `mailto:${SUPPORT_EMAIL}?subject=${subject}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>Find answers to common questions, or reach out and we&apos;ll get back within one business day.</Text>

        {FAQ.map((section) => (
          <View key={section.section} style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <View style={styles.card}>
              {section.items.map((item, idx) => {
                const key = `${section.section}-${idx}`;
                const open = openKey === key;
                return (
                  <View key={key} style={[styles.faqRow, idx === section.items.length - 1 && styles.faqRowLast]}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setOpenKey(open ? null : key)}
                      style={styles.faqHead}
                    >
                      <Text style={styles.faqQ}>{item.q}</Text>
                      <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                    {open && <Text style={styles.faqA}>{item.a}</Text>}
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Still need help?</Text>
        <TouchableOpacity style={styles.contactButton} onPress={handleContact} activeOpacity={0.85}>
          <Ionicons name="mail" size={18} color={colors.white} />
          <Text style={styles.contactText}>Contact Support</Text>
        </TouchableOpacity>
        <Text style={styles.contactNote}>Or email us directly at {SUPPORT_EMAIL}</Text>
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
  scrollContent: { paddingHorizontal: Theme.spacing.md, paddingBottom: Theme.spacing.xxl },
  intro: { color: c.textSecondary, fontSize: Theme.fontSize.sm, lineHeight: 20, marginBottom: Theme.spacing.md },
  sectionWrap: { marginBottom: Theme.spacing.md },
  sectionTitle: { fontSize: Theme.fontSize.sm, fontWeight: Theme.fontWeight.bold, color: c.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: Theme.spacing.sm, marginTop: Theme.spacing.sm },
  card: { backgroundColor: c.cardBackground, borderRadius: Theme.borderRadius.md, overflow: 'hidden' },
  faqRow: { borderBottomWidth: 1, borderBottomColor: c.divider, paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.sm },
  faqRowLast: { borderBottomWidth: 0 },
  faqHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  faqQ: { color: c.textPrimary, fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.semibold, flex: 1, paddingRight: 12 },
  faqA: { color: c.textSecondary, fontSize: Theme.fontSize.sm, lineHeight: 20, paddingTop: 4, paddingBottom: 8 },
  contactButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: c.primary, paddingVertical: 14, borderRadius: Theme.borderRadius.lg, marginTop: Theme.spacing.sm },
  contactText: { color: c.white, fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.bold },
  contactNote: { color: c.textMuted, fontSize: Theme.fontSize.xs, textAlign: 'center', marginTop: Theme.spacing.sm },
});
