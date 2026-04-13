import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { meets as meetsApi, Event } from '@/lib/api';
import EventCard from '@/components/EventCard';
import SearchBar from '@/components/SearchBar';
import LocationDropdown from '@/components/LocationDropdown';
import DateDropdown from '@/components/DateDropdown';
import { useAuth } from '@/lib/AuthContext';

const headerLogo = require('@/assets/images/club-scentra-text.png');

function formatDate(startAt: string): string {
  const d = new Date(startAt);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function formatLocation(event: Event): string {
  return [event.city, event.region].filter(Boolean).join(', ') || event.addressLine || '';
}

export default function MeetsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [hostedEvents, setHostedEvents] = useState<Event[]>([]);
  const [goingEvents, setGoingEvents] = useState<Event[]>([]);
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savedModalVisible, setSavedModalVisible] = useState(false);

  const fetchAll = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const [h, g, s, p] = await Promise.all([
        meetsApi.getSection('hosting'),
        meetsApi.getSection('going'),
        meetsApi.getSection('saved'),
        meetsApi.getSection('past'),
      ]);
      setHostedEvents(h.events);
      setGoingEvents(g.events);
      setSavedEvents(s.events);
      setPastEvents(p.events);
    } catch {
      // keep existing data on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchAll(); }, [fetchAll]));

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(true); }} />}
      >
        <View style={styles.headerRow}>
          <Image source={headerLogo} style={styles.headerLogo} resizeMode="contain" />
          <TouchableOpacity
            style={[styles.savedBtn, savedEvents.length > 0 && styles.savedBtnActive]}
            onPress={() => setSavedModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={savedEvents.length > 0 ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={savedEvents.length > 0 ? Theme.colors.primary : Theme.colors.textPrimary}
            />
            {savedEvents.length > 0 && (
              <View style={styles.savedBadge}>
                <Text style={styles.savedBadgeText}>{savedEvents.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.pageTitle}>My Meets</Text>

        <View style={styles.filterRow}>
          <LocationDropdown selected={locationFilter} onSelect={setLocationFilter} />
          <DateDropdown selected={dateFilter} onSelect={setDateFilter} />
        </View>

        <SearchBar value={searchText} onChangeText={setSearchText} />

        {loading ? (
          <ActivityIndicator color={Theme.colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            <Text style={styles.sectionTitle}>Hosted by {user?.username ?? 'You'}</Text>
            {hostedEvents.length === 0 ? (
              <Text style={styles.emptyText}>No hosted events yet</Text>
            ) : hostedEvents.map((event) => (
              <EventCard
                key={event.id}
                name={event.title}
                location={formatLocation(event)}
                date={formatDate(event.startAt)}
                image={event.imageUrl || undefined}
                variant="popular"
                onPress={() => router.push({ pathname: '/event-detail', params: { id: event.id } })}
              />
            ))}

            <Text style={styles.sectionTitle}>Going</Text>
            {goingEvents.length === 0 ? (
              <Text style={styles.emptyText}>No upcoming events</Text>
            ) : goingEvents.map((event) => (
              <EventCard
                key={event.id}
                name={event.title}
                location={formatLocation(event)}
                date={formatDate(event.startAt)}
                image={event.imageUrl || undefined}
                variant="dark"
                onPress={() => router.push({ pathname: '/event-detail', params: { id: event.id } })}
              />
            ))}

            <Text style={styles.sectionTitle}>Past Ride Log</Text>
            {pastEvents.length === 0 ? (
              <Text style={styles.emptyText}>No past events</Text>
            ) : pastEvents.map((event) => (
              <EventCard
                key={event.id}
                name={event.title}
                location={formatLocation(event)}
                date={formatDate(event.startAt)}
                image={event.imageUrl || undefined}
                variant="past"
                onPress={() => router.push({ pathname: '/event-detail', params: { id: event.id } })}
              />
            ))}
          </>
        )}
      </ScrollView>

      <Modal
        visible={savedModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSavedModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSavedModalVisible(false)}>
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHandle} />
            <View style={styles.modalTitleRow}>
              <Ionicons name="bookmark" size={20} color={Theme.colors.primary} />
              <Text style={styles.modalTitle}>Saved / Interested</Text>
            </View>
            {savedEvents.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="bookmark-outline" size={48} color={Theme.colors.textMuted} />
                <Text style={styles.emptyStateText}>No saved events yet</Text>
                <Text style={styles.emptySubtext}>Press "Interested" on any event to save it here</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {savedEvents.map(event => (
                  <TouchableOpacity
                    key={event.id}
                    style={styles.savedItem}
                    onPress={() => { setSavedModalVisible(false); router.push({ pathname: '/event-detail', params: { id: event.id } }); }}
                    activeOpacity={0.8}
                  >
                    {event.imageUrl ? (
                      <Image source={{ uri: event.imageUrl }} style={styles.savedItemImage} />
                    ) : (
                      <View style={[styles.savedItemImage, { backgroundColor: Theme.colors.border }]} />
                    )}
                    <View style={styles.savedItemInfo}>
                      <Text style={styles.savedItemName} numberOfLines={1}>{event.title}</Text>
                      <Text style={styles.savedItemMeta}>{formatLocation(event)}</Text>
                      <Text style={styles.savedItemMeta}>{formatDate(event.startAt)}</Text>
                    </View>
                    <Ionicons name="bookmark" size={18} color={Theme.colors.primary} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  scrollContent: { paddingHorizontal: Theme.spacing.md, paddingTop: 60, paddingBottom: Theme.spacing.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Theme.spacing.md },
  headerLogo: { width: 140, height: 35 },
  savedBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Theme.colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Theme.colors.border },
  savedBtnActive: { borderColor: Theme.colors.primary, backgroundColor: '#FFF5F5' },
  savedBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: Theme.colors.primary, borderRadius: 8, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  savedBadgeText: { color: Theme.colors.white, fontSize: 10, fontWeight: Theme.fontWeight.bold },
  pageTitle: { fontSize: Theme.fontSize.xl, fontWeight: Theme.fontWeight.bold, color: Theme.colors.textPrimary, marginBottom: Theme.spacing.sm },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm, marginBottom: Theme.spacing.md },
  sectionTitle: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.bold, color: Theme.colors.textPrimary, marginBottom: Theme.spacing.sm, marginTop: Theme.spacing.sm },
  emptyText: { color: Theme.colors.textSecondary, fontSize: Theme.fontSize.sm, marginBottom: Theme.spacing.md },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: Theme.colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: Theme.spacing.lg, paddingTop: Theme.spacing.md, paddingBottom: 40, maxHeight: '75%' },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Theme.colors.border, alignSelf: 'center', marginBottom: Theme.spacing.md },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm, marginBottom: Theme.spacing.lg },
  modalTitle: { fontSize: Theme.fontSize.lg, fontWeight: Theme.fontWeight.bold, color: Theme.colors.textPrimary },
  emptyState: { alignItems: 'center', paddingVertical: Theme.spacing.xxl },
  emptyStateText: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.semibold, color: Theme.colors.textSecondary, marginTop: Theme.spacing.md },
  emptySubtext: { fontSize: Theme.fontSize.sm, color: Theme.colors.textMuted, textAlign: 'center', marginTop: Theme.spacing.xs },
  savedItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Theme.spacing.md, borderBottomWidth: 1, borderBottomColor: Theme.colors.border, gap: Theme.spacing.md },
  savedItemImage: { width: 56, height: 56, borderRadius: 10 },
  savedItemInfo: { flex: 1 },
  savedItemName: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.semibold, color: Theme.colors.textPrimary },
  savedItemMeta: { fontSize: Theme.fontSize.sm, color: Theme.colors.textSecondary, marginTop: 2 },
});
