import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/lib/ThemeContext';
import StoryRing from './StoryRing';

interface EventCardProps {
  name: string;
  location: string;
  date: string;
  image?: string;
  onPress?: () => void;
  onImagePress?: () => void;
  onAddToStory?: () => void;
  variant?: 'default' | 'popular' | 'past' | 'dark';
}

export default function EventCard({ name, location, date, image, onPress, onImagePress, onAddToStory, variant = 'default' }: EventCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

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
          {onAddToStory && (
            <TouchableOpacity
              onPress={onAddToStory}
              activeOpacity={0.7}
              hitSlop={6}
              style={[
                styles.addStoryBtn,
                useLightText ? styles.addStoryBtnOnDark : styles.addStoryBtnOnLight,
              ]}
            >
              <Ionicons
                name="add-circle-outline"
                size={14}
                color={useLightText ? Theme.colors.white : Theme.colors.primary}
              />
              <Text style={[
                styles.addStoryText,
                useLightText ? styles.addStoryTextOnDark : styles.addStoryTextOnLight,
              ]}>
                Add to Story
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <TouchableOpacity
        onPress={onImagePress}
        activeOpacity={onImagePress ? 0.85 : 1}
        disabled={!onImagePress}
      >
        <StoryRing width={130} height={95} borderWidth={3} borderRadius={13} innerBackground="#FFFFFF">
          {image ? (
            <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]} />
          )}
        </StoryRing>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const makeStyles = (c: typeof Theme.colors) => StyleSheet.create({
  card: {
    backgroundColor: c.cardBackground,
    borderRadius: 16,
    flexDirection: 'row',
    padding: 12,
    marginBottom: 10,
    overflow: 'hidden',
  },
  popularCard: {
    backgroundColor: c.primary,
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
    color: c.textPrimary,
  },
  lightName: {
    color: c.white,
  },
  infoGroup: {},
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  infoText: {
    fontSize: 12,
    color: c.textSecondary,
    marginLeft: 5,
  },
  lightText: {
    color: c.white,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: '#E5E5E5',
  },
  addStoryBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
  },
  addStoryBtnOnLight: {
    borderColor: c.primary,
    backgroundColor: '#FFF5F5',
  },
  addStoryBtnOnDark: {
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  addStoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  addStoryTextOnLight: {
    color: c.primary,
  },
  addStoryTextOnDark: {
    color: c.white,
  },
});
