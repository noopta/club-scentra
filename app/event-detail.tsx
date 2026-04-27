import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/lib/ThemeContext';
import { events as eventsApi, Event } from '@/lib/api';
import RedButton from '@/components/RedButton';

function formatDate(startAt: string, endAt?: string | null): string {
  const d = new Date(startAt);
  const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
  const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (endAt) {
    const e = new Date(endAt);
    const endTime = e.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `${dateStr} · ${timeStr} - ${endTime}`;
  }
  return `${dateStr} · ${timeStr}`;
}

export default function EventDetailScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    eventsApi.getById(id)
      .then(setEvent)
      .catch(() => Alert.alert('Error', 'Could not load event'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleGoing = async () => {
    if (!event || rsvpLoading) return;
    setRsvpLoading(true);
    try {
      const updated = await eventsApi.rsvp(event.id, 'GOING');
      setEvent(updated);
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not update RSVP');
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleInterested = async () => {
    if (!event || rsvpLoading) return;
    setRsvpLoading(true);
    try {
      if (event.viewerStatus === 'INTERESTED') {
        await eventsApi.removeRsvp(event.id);
        setEvent({ ...event, viewerStatus: null, interestedCount: event.interestedCount - 1 });
      } else {
        const updated = await eventsApi.rsvp(event.id, 'INTERESTED');
        setEvent(updated);
      }
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not update RSVP');
    } finally {
      setRsvpLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={Theme.colors.primary} size="large" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: Theme.colors.textSecondary }}>Event not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: Theme.colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isGoing = event.viewerStatus === 'GOING';
  const isSaved = event.viewerStatus === 'INTERESTED';
  const location = [event.city, event.region].filter(Boolean).join(', ') || event.addressLine || 'Location TBD';

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          {event.imageUrl ? (
            <Image source={{ uri: event.imageUrl }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, { backgroundColor: Theme.colors.border }]} />
          )}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Theme.colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.eventName}>{event.title}</Text>

          <TouchableOpacity
            style={styles.hostRow}
            onPress={() => router.push({ pathname: '/friend-profile', params: { id: event.host.id } })}
            activeOpacity={0.8}
          >
            {event.host.avatarUrl ? (
              <Image source={{ uri: event.host.avatarUrl }} style={styles.hostAvatar} />
            ) : (
              <View style={[styles.hostAvatar, { backgroundColor: Theme.colors.border }]} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.hostedBy}>Hosted by</Text>
              <Text style={styles.hostName}>@{event.host.username}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Theme.colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={20} color={Theme.colors.primary} />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>{formatDate(event.startAt, event.endAt)}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Ionicons name="location-sharp" size={20} color={Theme.colors.primary} />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{location}</Text>
                {event.addressLine && <Text style={styles.detailSubvalue}>{event.addressLine}</Text>}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Ionicons name="people" size={20} color={Theme.colors.primary} />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Attendees</Text>
                <Text style={styles.detailValue}>{event.goingCount} going · {event.interestedCount} interested</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{event.description}</Text>

          <View style={styles.buttonRow}>
            <RedButton
              title={rsvpLoading ? '...' : isGoing ? '✓ Going' : "I'm Going"}
              onPress={handleGoing}
            />
          </View>

          <TouchableOpacity
            style={[styles.interestedButton, isSaved && styles.interestedButtonActive]}
            activeOpacity={0.8}
            onPress={handleInterested}
            disabled={rsvpLoading}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isSaved ? Theme.colors.primary : Theme.colors.textPrimary}
            />
            <Text style={[styles.interestedText, isSaved && styles.interestedTextActive]}>
              {isSaved ? 'Saved' : 'Interested'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: typeof Theme.colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  imageContainer: { position: 'relative' },
  heroImage: { width: '100%', height: 250 },
  backButton: { position: 'absolute', top: 50, left: Theme.spacing.md, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Theme.spacing.lg },
  eventName: { fontSize: Theme.fontSize.xxxl, fontWeight: Theme.fontWeight.bold, color: c.textPrimary, marginBottom: Theme.spacing.md },
  hostRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Theme.spacing.lg },
  hostAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: Theme.spacing.sm },
  hostedBy: { fontSize: Theme.fontSize.xs, color: c.textSecondary },
  hostName: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.semibold, color: c.textPrimary },
  detailsCard: { backgroundColor: c.cardBackground, borderRadius: Theme.borderRadius.md, padding: Theme.spacing.md, marginBottom: Theme.spacing.lg },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: Theme.spacing.sm },
  detailTextContainer: { marginLeft: Theme.spacing.md, flex: 1 },
  detailLabel: { fontSize: Theme.fontSize.xs, color: c.textSecondary, fontWeight: Theme.fontWeight.medium },
  detailValue: { fontSize: Theme.fontSize.md, color: c.textPrimary, fontWeight: Theme.fontWeight.medium, marginTop: 2 },
  detailSubvalue: { fontSize: Theme.fontSize.sm, color: c.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: c.divider },
  sectionTitle: { fontSize: Theme.fontSize.lg, fontWeight: Theme.fontWeight.bold, color: c.textPrimary, marginBottom: Theme.spacing.sm },
  description: { fontSize: Theme.fontSize.md, color: c.textSecondary, lineHeight: 22, marginBottom: Theme.spacing.lg },
  buttonRow: { marginBottom: Theme.spacing.sm },
  interestedButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 2, borderColor: c.textPrimary, borderRadius: Theme.borderRadius.lg, paddingVertical: 16, marginBottom: Theme.spacing.xl },
  interestedButtonActive: { borderColor: c.primary, backgroundColor: '#FFF5F5' },
  interestedText: { fontSize: Theme.fontSize.lg, fontWeight: Theme.fontWeight.bold, color: c.textPrimary },
  interestedTextActive: { color: c.primary },
});
