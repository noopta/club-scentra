import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { popularEvents, nearbyEvents } from '@/constants/MockData';
import EventCard from '@/components/EventCard';
import SearchBar from '@/components/SearchBar';

const headerLogo = require('@/assets/images/club-scentra-text.png');

export default function ExploreScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

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
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="location-sharp" size={14} color={Theme.colors.primary} />
            <Text style={styles.filterText}>Location</Text>
            <Ionicons name="chevron-down" size={14} color={Theme.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="calendar" size={14} color={Theme.colors.primary} />
            <Text style={styles.filterText}>Date</Text>
            <Ionicons name="chevron-down" size={14} color={Theme.colors.textPrimary} />
          </TouchableOpacity>
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
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.xl,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    gap: 6,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  filterText: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.textPrimary,
    fontWeight: Theme.fontWeight.medium,
  },
  sectionTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.sm,
    marginTop: Theme.spacing.sm,
  },
});
