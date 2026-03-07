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
  variant?: 'default' | 'popular' | 'past';
}

export default function EventCard({ name, location, date, image, onPress, variant = 'default' }: EventCardProps) {
  const isPopular = variant === 'popular';
  const isPast = variant === 'past';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isPopular && styles.popularCard,
        isPast && styles.pastCard,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.name,
            isPopular && styles.popularName,
          ]}
          numberOfLines={2}
        >
          {name}
        </Text>
        <View style={styles.infoRow}>
          <Ionicons
            name="location-sharp"
            size={14}
            color={isPopular ? Theme.colors.white : Theme.colors.primary}
          />
          <Text style={[styles.infoText, isPopular && styles.popularText]}>
            {location}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons
            name="calendar"
            size={14}
            color={isPopular ? Theme.colors.white : Theme.colors.primary}
          />
          <Text style={[styles.infoText, isPopular && styles.popularText]}>
            {date}
          </Text>
        </View>
      </View>
      <Image source={{ uri: image }} style={[styles.image, isPopular && styles.popularImage]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.cardBackground,
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    overflow: 'hidden',
  },
  popularCard: {
    backgroundColor: Theme.colors.primary,
  },
  pastCard: {
    opacity: 0.7,
  },
  textContainer: {
    flex: 1,
    paddingRight: Theme.spacing.sm,
    paddingLeft: Theme.spacing.sm,
  },
  name: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.textPrimary,
    marginBottom: 4,
  },
  popularName: {
    color: Theme.colors.white,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  infoText: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.textSecondary,
    marginLeft: 4,
  },
  popularText: {
    color: Theme.colors.white,
  },
  image: {
    width: 110,
    height: 85,
    borderRadius: Theme.borderRadius.sm,
  },
  popularImage: {
    borderRadius: Theme.borderRadius.sm,
  },
});
