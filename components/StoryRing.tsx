import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = ['#0099FF', '#2E2EBA', '#5D7DC4', '#FF9500', '#E2CC00', '#0099FF'] as const;

type Props = {
  width: number;
  height: number;
  borderWidth?: number;
  borderRadius?: number;
  innerBackground?: string;
  children: React.ReactNode;
};

export default function StoryRing({
  width,
  height,
  borderWidth = 3,
  borderRadius = 13,
  innerBackground = '#FFFFFF',
  children,
}: Props) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 7000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [rotation]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const diag = Math.ceil(Math.sqrt(width * width + height * height)) + 4;
  const innerRadius = Math.max(0, borderRadius - borderWidth);

  return (
    <View style={[styles.wrap, { width, height, borderRadius }]}>
      <Animated.View
        style={[
          styles.gradientWrap,
          {
            width: diag,
            height: diag,
            left: (width - diag) / 2,
            top: (height - diag) / 2,
            transform: [{ rotate }],
          },
        ]}
      >
        <LinearGradient
          colors={COLORS as unknown as string[]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <View
        style={[
          styles.inner,
          {
            margin: borderWidth,
            borderRadius: innerRadius,
            backgroundColor: innerBackground,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', position: 'relative' },
  gradientWrap: { position: 'absolute' },
  inner: { flex: 1, overflow: 'hidden' },
});
