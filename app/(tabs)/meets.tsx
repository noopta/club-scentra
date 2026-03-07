import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { hostedEvents, goingEvents, pastEvents } from '@/constants/MockData';
import EventCard from '@/components/EventCard';
import SearchBar from '@/components/SearchBar';

const logo = require('@/assets/images/logo.png');

export default function MeetsScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Image source={logo} style={styles.headerLogo} resizeMode="contain" />
        </View>

        <Text style={styles.pageTitle}>My Meets</Text>

        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Sort by Location</Text>
            <Ionicons name="chevron-down" size={14} color={Theme.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Sort by Date</Text>
            <Ionicons name="chevron-down" size={14} color={Theme.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterIcon}>
            <Ionicons name="options-outline" size={20} color={Theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <SearchBar value={searchText} onChangeText={setSearchText} />

        <Text style={styles.sectionTitle}>Hosted by Saraaa13</Text>
        {hostedEvents.map((event) => (
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

        <Text style={styles.sectionTitle}>Going</Text>
        {goingEvents.map((event) => (
          <EventCard
            key={event.id}
            name={event.name}
            location={event.location}
            date={event.date}
            image={event.image}
            onPress={() => router.push('/event-detail')}
          />
        ))}

        <Text style={styles.sectionTitle}>Past Ride Log</Text>
        {pastEvents.map((event) => (
          <EventCard
            key={event.id}
            name={event.name}
            location={event.location}
            date={event.date}
            image={event.image}
            variant="past"
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
    width: 100,
    height: 50,

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
  filterIcon: {
    padding: Theme.spacing.sm,
  },
  filterText: {
    fontSize: Theme.fontSize.xs,
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
