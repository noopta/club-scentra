import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { Theme } from '@/constants/Theme';

const screenWidth = Dimensions.get('window').width;
const photoSize = (screenWidth - Theme.spacing.md * 2 - Theme.spacing.sm) / 2;

interface PhotoGridProps {
  photos: string[];
}

export default function PhotoGrid({ photos }: PhotoGridProps) {
  return (
    <View style={styles.grid}>
      {photos.map((photo, index) => (
        <Image
          key={index}
          source={{ uri: photo }}
          style={styles.photo}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
  },
  photo: {
    width: photoSize,
    height: photoSize,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.sm,
  },
});
