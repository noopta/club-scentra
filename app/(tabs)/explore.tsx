import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/Theme';
import { popularEvents, nearbyEvents } from '@/constants/MockData';
import EventCard from '@/components/EventCard';
import SearchBar from '@/components/SearchBar';
import LocationDropdown from '@/components/LocationDropdown';
import DateDropdown from '@/components/DateDropdown';

const headerLogo = require('@/assets/images/club-scentra-text.png');

export default function ExploreScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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

        <Text style={styles.sectionTitle}>Popular Events</Text>
        {popularEvents.map((event) => (
          <EventCard
            key={event.id}
            name={event.name}
            location={event.location}
            date={event.date}
            image={event.image}
            variant="popular"
            onPress={() => router.push('/event-detail')}
          />
        ))}

        <Text style={styles.sectionTitle}>Events Near You</Text>
        {nearbyEvents.map((event) => (
          <EventCard
            key={event.id}
            name={event.name}
            location={event.location}
            date={event.date}
            image={event.image}
            variant="dark"
            onPress={() => router.push('/event-detail')}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.md,
    paddingTop: 60,
    paddingBottom: Theme.spacing.xl,
  },
  headerRow: {
    marginBottom: Theme.spacing.md,
  },
  headerLogo: {
    width: 140,
    height: 35,
  },
  pageTitle: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  sectionTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.sm,
    marginTop: Theme.spacing.sm,
  },
});
