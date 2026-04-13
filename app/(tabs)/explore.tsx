import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/Theme';
import { events as eventsApi, Event } from '@/lib/api';
import EventCard from '@/components/EventCard';
import SearchBar from '@/components/SearchBar';
import LocationDropdown from '@/components/LocationDropdown';
import DateDropdown from '@/components/DateDropdown';

const headerLogo = require('@/assets/images/club-scentra-text.png');

function formatEventDate(startAt: string): string {
  const d = new Date(startAt);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function formatEventLocation(event: Event): string {
  const parts = [event.city, event.region].filter(Boolean);
  return parts.join(', ') || event.addressLine || 'Location TBD';
}

export default function ExploreScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const params: Parameters<typeof eventsApi.explore>[0] = {};
      if (searchText) params.q = searchText;
      if (locationFilter) params.location = locationFilter;
      const res = await eventsApi.explore(params);
      setAllEvents(res.events);
    } catch {
      setAllEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchText, locationFilter]);

  useEffect(() => {
    const timer = setTimeout(() => fetchEvents(), 400);
    return () => clearTimeout(timer);
  }, [fetchEvents]);

  const popular = allEvents.filter((_, i) => i % 2 === 0);
  const nearby = allEvents.filter((_, i) => i % 2 !== 0);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchEvents(true); }} />}
      >
        <View style={styles.headerRow}>
          <Image source={headerLogo} style={styles.headerLogo} resizeMode="contain" />
        </View>

        <Text style={styles.pageTitle}>Find Car Events</Text>

        <View style={styles.filterRow}>
          <LocationDropdown selected={locationFilter} onSelect={setLocationFilter} />
          <DateDropdown selected={dateFilter} onSelect={setDateFilter} />
        </View>

        <SearchBar value={searchText} onChangeText={setSearchText} />

        {loading ? (
          <ActivityIndicator color={Theme.colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            <Text style={styles.sectionTitle}>Popular Events</Text>
            {popular.length === 0 ? (
              <Text style={styles.emptyText}>No events found</Text>
            ) : (
              popular.map((event) => (
                <EventCard
                  key={event.id}
                  name={event.title}
                  location={formatEventLocation(event)}
                  date={formatEventDate(event.startAt)}
                  image={event.imageUrl || undefined}
                  variant="popular"
                  onPress={() => router.push({ pathname: '/event-detail', params: { id: event.id } })}
                />
              ))
            )}

            <Text style={styles.sectionTitle}>Events Near You</Text>
            {nearby.length === 0 ? (
              <Text style={styles.emptyText}>No nearby events</Text>
            ) : (
              nearby.map((event) => (
                <EventCard
                  key={event.id}
                  name={event.title}
                  location={formatEventLocation(event)}
                  date={formatEventDate(event.startAt)}
                  image={event.imageUrl || undefined}
                  variant="dark"
                  onPress={() => router.push({ pathname: '/event-detail', params: { id: event.id } })}
                />
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  scrollContent: {
    paddingHorizontal: Theme.spacing.md,
    paddingTop: 60,
    paddingBottom: Theme.spacing.xl,
  },
  headerRow: { marginBottom: Theme.spacing.md },
  headerLogo: { width: 160, height: 36 },
  pageTitle: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Theme.colors.textPrimary,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
  },
  emptyText: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.fontSize.sm,
    textAlign: 'center',
    marginTop: Theme.spacing.md,
  },
});
