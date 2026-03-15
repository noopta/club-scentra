import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';

interface EventCardProps {
  name: string;
  location: string;
  date: string;
  image: string;
  onPress?: () => void;
  variant?: 'default' | 'popular' | 'past' | 'dark';
}

export default function EventCard({ name, location, date, image, onPress, variant = 'default' }: EventCardProps) {
  const isPopular = variant === 'popular';
  const isPast = variant === 'past';
  const isDark = variant === 'dark';
  const useLightText = isPopular || isDark || isPast;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isPopular && styles.popularCard,
        isPast && styles.pastCard,
        isDark && styles.darkCard,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.name,
            useLightText && styles.lightName,
          ]}
          numberOfLines={2}
        >
          {name}
        </Text>
        <View style={styles.infoGroup}>
          <View style={styles.infoRow}>
            <Ionicons
              name="location-sharp"
              size={14}
              color={useLightText ? Theme.colors.white : Theme.colors.primary}
            />
            <Text style={[styles.infoText, useLightText && styles.lightText]}>
              {location}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons
              name="calendar"
              size={14}
              color={useLightText ? Theme.colors.white : Theme.colors.primary}
            />
            <Text style={[styles.infoText, useLightText && styles.lightText]}>
              {date}
            </Text>
          </View>
        </View>
      </View>
      <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.cardBackground,
    borderRadius: 16,
    flexDirection: 'row',
    padding: 12,
    marginBottom: 10,
    overflow: 'hidden',
  },
  popularCard: {
    backgroundColor: Theme.colors.primary,
  },
  darkCard: {
    backgroundColor: '#181921',
  },
  pastCard: {
    backgroundColor: 'rgba(24, 25, 33, 0.4)',
  },
  textContainer: {
    flex: 1,
    paddingRight: 10,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
  },
  lightName: {
    color: Theme.colors.white,
  },
  infoGroup: {
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  infoText: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    marginLeft: 5,
  },
  lightText: {
    color: Theme.colors.white,
  },
  image: {
    width: 130,
    height: 95,
    borderRadius: 10,
  },
});
