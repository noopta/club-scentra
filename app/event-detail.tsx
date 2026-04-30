import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, Modal, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/lib/ThemeContext';
import { events as eventsApi, Event, PublicUser } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
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
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  
  const [attendeesModalVisible, setAttendeesModalVisible] = useState(false);
  const [attendees, setAttendees] = useState<{ going: PublicUser[]; interested: PublicUser[] }>({ going: [], interested: [] });
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  const isHost = event && user ? event.host.id === user.id : false;

  useEffect(() => {
    if (!id) return;
    eventsApi.getById(id)
      .then(setEvent)
      .catch(() => Alert.alert('Error', 'Could not load event'))
      .finally(() => setLoading(false));
  }, [id]);

  const openAttendeesModal = useCallback(async () => {
    if (!event) return;
    setAttendeesModalVisible(true);
    setLoadingAttendees(true);
    try {
      const res = await eventsApi.getAttendees(event.id);
      setAttendees(res);
    } catch {
      setAttendees({ going: [], interested: [] });
    } finally {
      setLoadingAttendees(false);
    }
  }, [event]);

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
          {event.imageUrl && event.imageUrl.length > 0 ? (
            <Image 
              source={{ uri: event.imageUrl }} 
              style={styles.heroImage} 
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.heroImage, styles.imagePlaceholder]}>
              <Ionicons name="image-outline" size={48} color={Theme.colors.textMuted} />
            </View>
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

            <TouchableOpacity style={styles.detailRow} onPress={openAttendeesModal} activeOpacity={0.7}>
              <Ionicons name="people" size={20} color={Theme.colors.primary} />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Attendees</Text>
                <Text style={styles.detailValue}>{event.goingCount} going · {event.interestedCount} interested</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {isHost && (
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => router.push({ pathname: '/edit-event', params: { id: event.id } })}
              activeOpacity={0.8}
            >
              <Ionicons name="create-outline" size={20} color={Theme.colors.primary} />
              <Text style={styles.editButtonText}>Edit Event</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{event.description}</Text>

          {!isHost && (
            <>
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
            </>
          )}

          {isHost && (
            <View style={styles.hostBadge}>
              <Ionicons name="star" size={16} color={Theme.colors.primary} />
              <Text style={styles.hostBadgeText}>You're hosting this event</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Attendees Modal */}
      <Modal visible={attendeesModalVisible} transparent animationType="slide" onRequestClose={() => setAttendeesModalVisible(false)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setAttendeesModalVisible(false)} />
          <View style={styles.attendeesSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Attendees</Text>
            
            {loadingAttendees ? (
              <ActivityIndicator color={Theme.colors.primary} style={{ marginTop: 20 }} />
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {attendees.going.length > 0 && (
                  <>
                    <Text style={styles.attendeesSectionTitle}>Going ({attendees.going.length})</Text>
                    {attendees.going.map((u) => (
                      <TouchableOpacity
                        key={u.id}
                        style={styles.attendeeRow}
                        onPress={() => { setAttendeesModalVisible(false); router.push({ pathname: '/friend-profile', params: { id: u.id } }); }}
                        activeOpacity={0.8}
                      >
                        {u.avatarUrl ? (
                          <Image source={{ uri: u.avatarUrl }} style={styles.attendeeAvatar} />
                        ) : (
                          <View style={[styles.attendeeAvatar, styles.attendeeAvatarPlaceholder]}>
                            <Ionicons name="person" size={16} color={Theme.colors.textMuted} />
                          </View>
                        )}
                        <View style={styles.attendeeInfo}>
                          <Text style={styles.attendeeName}>{u.displayName || u.username}</Text>
                          <Text style={styles.attendeeUsername}>@{u.username}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
                
                {attendees.interested.length > 0 && (
                  <>
                    <Text style={[styles.attendeesSectionTitle, { marginTop: 16 }]}>Interested ({attendees.interested.length})</Text>
                    {attendees.interested.map((u) => (
                      <TouchableOpacity
                        key={u.id}
                        style={styles.attendeeRow}
                        onPress={() => { setAttendeesModalVisible(false); router.push({ pathname: '/friend-profile', params: { id: u.id } }); }}
                        activeOpacity={0.8}
                      >
                        {u.avatarUrl ? (
                          <Image source={{ uri: u.avatarUrl }} style={styles.attendeeAvatar} />
                        ) : (
                          <View style={[styles.attendeeAvatar, styles.attendeeAvatarPlaceholder]}>
                            <Ionicons name="person" size={16} color={Theme.colors.textMuted} />
                          </View>
                        )}
                        <View style={styles.attendeeInfo}>
                          <Text style={styles.attendeeName}>{u.displayName || u.username}</Text>
                          <Text style={styles.attendeeUsername}>@{u.username}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </>
                )}

                {attendees.going.length === 0 && attendees.interested.length === 0 && (
                  <View style={styles.emptyAttendees}>
                    <Ionicons name="people-outline" size={48} color={Theme.colors.textMuted} />
                    <Text style={styles.emptyAttendeesText}>No attendees yet</Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const makeStyles = (c: typeof Theme.colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  imageContainer: { position: 'relative' },
  heroImage: { width: '100%', height: 250 },
  imagePlaceholder: { backgroundColor: c.border, alignItems: 'center', justifyContent: 'center' },
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
  editButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FFF5F5', borderRadius: Theme.borderRadius.md, paddingVertical: 12, marginBottom: Theme.spacing.md },
  editButtonText: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.semibold, color: c.primary },
  hostBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FFF5F5', borderRadius: Theme.borderRadius.md, paddingVertical: 16, marginBottom: Theme.spacing.xl },
  hostBadgeText: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.semibold, color: c.primary },
  modalContainer: { flex: 1, justifyContent: 'flex-end' },
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  attendeesSheet: { backgroundColor: c.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: Theme.spacing.lg, paddingTop: Theme.spacing.md, paddingBottom: 40, maxHeight: '70%' },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: c.border, alignSelf: 'center', marginBottom: Theme.spacing.md },
  modalTitle: { fontSize: Theme.fontSize.lg, fontWeight: Theme.fontWeight.bold, color: c.textPrimary, marginBottom: Theme.spacing.md },
  attendeesSectionTitle: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.semibold, color: c.textSecondary, marginBottom: Theme.spacing.sm },
  attendeeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Theme.spacing.sm },
  attendeeAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: Theme.spacing.md },
  attendeeAvatarPlaceholder: { backgroundColor: c.border, alignItems: 'center', justifyContent: 'center' },
  attendeeInfo: { flex: 1 },
  attendeeName: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.medium, color: c.textPrimary },
  attendeeUsername: { fontSize: Theme.fontSize.sm, color: c.textSecondary },
  emptyAttendees: { alignItems: 'center', paddingVertical: Theme.spacing.xxl },
  emptyAttendeesText: { fontSize: Theme.fontSize.md, color: c.textSecondary, marginTop: Theme.spacing.md },
});
