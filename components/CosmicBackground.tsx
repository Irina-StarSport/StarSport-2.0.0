import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: Animated.Value;
  delay: number;
}

function useTwinklingStars(count: number): Star[] {
  const { width, height } = useWindowDimensions();
  const starsRef = useRef<Star[]>([]);

  if (starsRef.current.length === 0) {
    starsRef.current = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 1,
      opacity: new Animated.Value(Math.random() * 0.5 + 0.1),
      delay: Math.random() * 3000,
    }));
  }

  useEffect(() => {
    const animations = starsRef.current.map((star) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(star.delay),
          Animated.timing(star.opacity, {
            toValue: 1,
            duration: 1200 + Math.random() * 800,
            useNativeDriver: true,
          }),
          Animated.timing(star.opacity, {
            toValue: 0.1,
            duration: 1200 + Math.random() * 800,
            useNativeDriver: true,
          }),
        ])
      )
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, []);

  return starsRef.current;
}

interface CosmicBackgroundProps {
  children?: React.ReactNode;
  style?: object;
  tintColor?: string;
}

export function CosmicBackground({ children, style, tintColor }: CosmicBackgroundProps) {
  const stars = useTwinklingStars(25);

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={['#0A0E1A', '#1A0A2E', '#0A1A2E']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {stars.map((star, i) => (
        <Animated.View
          key={i}
          style={[
            styles.star,
            {
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              borderRadius: star.size / 2,
              opacity: star.opacity,
            },
          ]}
        />
      ))}
      {tintColor && (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: tintColor, opacity: 0.3 },
          ]}
          pointerEvents="none"
        />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
});
