import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { hostedEvents, goingEvents, pastEvents } from '@/constants/MockData';
import { getCreatedEvents } from '@/constants/CreatedEvents';
import { getSavedEvents } from '@/constants/SavedEvents';
import { getGoingEvents } from '@/constants/GoingEvents';
import EventCard from '@/components/EventCard';
import SearchBar from '@/components/SearchBar';
import LocationDropdown from '@/components/LocationDropdown';
import DateDropdown from '@/components/DateDropdown';

const headerLogo = require('@/assets/images/club-scentra-text.png');

export default function MeetsScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [userCreatedEvents, setUserCreatedEvents] = useState(getCreatedEvents());
  const [savedEvents, setSavedEvents] = useState(getSavedEvents());
  const [userGoingEvents, setUserGoingEvents] = useState(getGoingEvents());
  const [savedModalVisible, setSavedModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setUserCreatedEvents(getCreatedEvents());
      setSavedEvents(getSavedEvents());
      setUserGoingEvents(getGoingEvents());
    }, [])
  );

  const allHostedEvents = [...hostedEvents, ...userCreatedEvents];
  const allGoingEvents = [...goingEvents, ...userGoingEvents];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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

        <Text style={styles.sectionTitle}>Hosted by Saraaa13</Text>
        {allHostedEvents.map((event) => (
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
        {allGoingEvents.map((event) => (
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

      <Modal
        visible={savedModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSavedModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSavedModalVisible(false)}
        >
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHandle} />
            <View style={styles.modalTitleRow}>
              <Ionicons name="bookmark" size={20} color={Theme.colors.primary} />
              <Text style={styles.modalTitle}>Saved / Interested</Text>
            </View>
            {savedEvents.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="bookmark-outline" size={48} color={Theme.colors.textMuted} />
                <Text style={styles.emptyText}>No saved events yet</Text>
                <Text style={styles.emptySubtext}>Press "Interested" on any event to save it here</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {savedEvents.map(event => (
                  <TouchableOpacity
                    key={event.id}
                    style={styles.savedItem}
                    onPress={() => { setSavedModalVisible(false); router.push('/event-detail'); }}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: event.image }} style={styles.savedItemImage} />
                    <View style={styles.savedItemInfo}>
                      <Text style={styles.savedItemName} numberOfLines={1}>{event.name}</Text>
                      <Text style={styles.savedItemMeta}>{event.location}</Text>
                      <Text style={styles.savedItemMeta}>{event.date}</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  headerLogo: {
    width: 140,
    height: 35,
  },
  savedBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  savedBtnActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: '#FFF5F5',
  },
  savedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Theme.colors.primary,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedBadgeText: {
    color: Theme.colors.white,
    fontSize: 10,
    fontWeight: Theme.fontWeight.bold,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Theme.colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: 40,
    maxHeight: '75%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Theme.colors.border,
    alignSelf: 'center',
    marginBottom: Theme.spacing.md,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.lg,
  },
  modalTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.textPrimary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.xxl,
  },
  emptyText: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.md,
  },
  emptySubtext: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    marginTop: Theme.spacing.xs,
  },
  savedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    gap: Theme.spacing.md,
  },
  savedItemImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  savedItemInfo: {
    flex: 1,
  },
  savedItemName: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
    color: Theme.colors.textPrimary,
  },
  savedItemMeta: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
});
