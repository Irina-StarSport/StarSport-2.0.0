import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { COLORS } from '@/constants/SpaceColors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const NUM_STARS = 20;

function generateStars() {
  return Array.from({ length: NUM_STARS }, (_, i) => ({
    id: i,
    x: Math.random() * SCREEN_WIDTH,
    y: Math.random() * SCREEN_HEIGHT,
    size: Math.random() * 2.5 + 1,
    delay: Math.random() * 1500,
  }));
}

const STARS = generateStars();

export function RocketLoader() {
  const starOpacities = useRef(
    STARS.map(() => new Animated.Value(0))
  ).current;

  const rocketY = useRef(new Animated.Value(80)).current;
  const rocketX = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log('[RocketLoader] mounted, starting animations');

    // Staggered star fade in/out loops
    starOpacities.forEach((opacity, i) => {
      const delay = STARS[i].delay;
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    // Rocket vertical fly loop
    Animated.loop(
      Animated.timing(rocketY, {
        toValue: -80,
        duration: 1800,
        useNativeDriver: true,
      }),
      { resetBeforeIteration: false }
    ).start();

    // Rocket horizontal wobble loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(rocketX, {
          toValue: 6,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(rocketX, {
          toValue: -6,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Progress bar fill
    Animated.timing(progressWidth, {
      toValue: 220,
      duration: 2000,
      useNativeDriver: false,
    }).start();
  }, []);

  const systemFont = Platform.OS === 'ios' ? 'System' : 'sans-serif';

  return (
    <View style={styles.container}>
      {/* Starfield */}
      {STARS.map((star, i) => (
        <Animated.View
          key={star.id}
          style={[
            styles.star,
            {
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              borderRadius: star.size / 2,
              opacity: starOpacities[i],
            },
          ]}
        />
      ))}

      {/* Center content */}
      <View style={styles.content}>
        {/* Rocket */}
        <Animated.Text
          style={[
            styles.rocket,
            {
              transform: [
                { translateY: rocketY },
                { translateX: rocketX },
              ],
            },
          ]}
        >
          🚀
        </Animated.Text>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              { width: progressWidth },
            ]}
          />
        </View>

        {/* Loading text */}
        <Text style={[styles.loadingText, { fontFamily: systemFont }]}>
          Загрузка...
        </Text>

        {/* App name */}
        <Text style={[styles.appName, { fontFamily: systemFont }]}>
          StarSport 🚀
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  content: {
    alignItems: 'center',
    gap: 20,
  },
  rocket: {
    fontSize: 52,
    marginBottom: 16,
  },
  progressTrack: {
    width: 220,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  loadingText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});
