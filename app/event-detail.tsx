import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import RedButton from '@/components/RedButton';

export default function EventDetailScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800' }}
            style={styles.heroImage}
          />
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Theme.colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.eventName}>Downtown Drive</Text>

          <View style={styles.hostRow}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' }}
              style={styles.hostAvatar}
            />
            <View>
              <Text style={styles.hostedBy}>Hosted by</Text>
              <Text style={styles.hostName}>@Saraaa13</Text>
            </View>
          </View>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={20} color={Theme.colors.primary} />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>Sat Aug 2, 2025 · 3:00 PM - 8:00 PM</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Ionicons name="location-sharp" size={20} color={Theme.colors.primary} />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>Toronto, ON</Text>
                <Text style={styles.detailSubvalue}>123 Queen St W, Toronto, ON M5H 2M9</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Ionicons name="people" size={20} color={Theme.colors.primary} />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Attendees</Text>
                <Text style={styles.detailValue}>47 going · 12 interested</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>
            Join us for an epic downtown cruise through the streets of Toronto. All car enthusiasts welcome — JDM, Euro, Muscle, and everything in between. Meet up at the starting point, cruise together, and end at a scenic parking spot for a chill hangout.
          </Text>

          <View style={styles.buttonRow}>
            <RedButton
              title="I'm Going"
              onPress={() => {}}
            />
          </View>

          <TouchableOpacity style={styles.interestedButton} activeOpacity={0.8}>
            <Text style={styles.interestedText}>Interested</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  imageContainer: {
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: 250,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: Theme.spacing.md,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: Theme.spacing.lg,
  },
  eventName: {
    fontSize: Theme.fontSize.xxxl,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  hostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Theme.spacing.sm,
  },
  hostedBy: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.textSecondary,
  },
  hostName: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
    color: Theme.colors.textPrimary,
  },
  detailsCard: {
    backgroundColor: Theme.colors.cardBackground,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Theme.spacing.sm,
  },
  detailTextContainer: {
    marginLeft: Theme.spacing.md,
    flex: 1,
  },
  detailLabel: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.textSecondary,
    fontWeight: Theme.fontWeight.medium,
  },
  detailValue: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.textPrimary,
    fontWeight: Theme.fontWeight.medium,
    marginTop: 2,
  },
  detailSubvalue: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.divider,
  },
  sectionTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.sm,
  },
  description: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: Theme.spacing.lg,
  },
  buttonRow: {
    marginBottom: Theme.spacing.sm,
  },
  interestedButton: {
    borderWidth: 2,
    borderColor: Theme.colors.textPrimary,
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  interestedText: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.textPrimary,
  },
});
