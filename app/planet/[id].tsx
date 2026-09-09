import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Animated,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CosmicBackground } from '@/components/CosmicBackground';
import { ExerciseCard } from '@/components/ExerciseCard';
import { COLORS } from '@/constants/SpaceColors';
import { PLANETS } from '@/constants/planets';
import { useProgress } from '@/contexts/ProgressContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function PlanetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { planetProgress, isExerciseCompleted, getPlanetStars } = useProgress();

  const planet = PLANETS.find((p) => p.id === id);

  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroScale = useRef(new Animated.Value(0.8)).current;
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    console.log(`[PlanetScreen] mounted: planet=${id}`);
    Animated.parallel([
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(heroScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 12,
        bounciness: 8,
      }),
    ]).start();
  }, []);

  if (!planet) {
    return (
      <CosmicBackground style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Планета не найдена</Text>
        </View>
      </CosmicBackground>
    );
  }

  const completedExercises = planetProgress[planet.id]?.completedExercises ?? [];
  const completedCount = completedExercises.length;
  const total = planet.exercises.length;
  const progress = total > 0 ? completedCount / total : 0;
  const progressPercent = Math.round(progress * 100);
  const starsEarned = getPlanetStars(planet.id);

  const handleExercisePress = (exerciseId: string) => {
    console.log(`[PlanetScreen] exercise pressed: planet=${id}, exercise=${exerciseId}`);
    router.push(`/exercise/${id}/${exerciseId}`);
  };

  return (
    <CosmicBackground style={styles.container}>
      <Stack.Screen
        options={{
          title: planet.name,
          headerTransparent: true,
          headerTintColor: COLORS.text,
          headerStyle: { backgroundColor: 'transparent' },
          headerTitleStyle: {
            fontFamily: 'Nunito_700Bold',
            color: COLORS.text,
          },
        }}
      />

      <FlatList
        data={planet.exercises}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Hero section */}
            <Animated.View
              style={[
                styles.hero,
                { opacity: heroOpacity, transform: [{ scale: heroScale }] },
              ]}
            >
              <View
                style={[
                  styles.planetGlow,
                  {
                    boxShadow: `0 0 40px ${planet.glowColor}`,
                    backgroundColor: planet.color + '20',
                  },
                ]}
              >
                {planet.imageUrl && !imageError ? (
                  <Image
                    source={{ uri: planet.imageUrl }}
                    style={{ width: 100, height: 100, borderRadius: 50 }}
                    resizeMode="cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <Text style={styles.planetEmoji}>{planet.emoji}</Text>
                )}
              </View>
              <Text style={[styles.planetName, { color: planet.color }]}>
                {planet.name}
              </Text>
              <Text style={styles.planetSubtitle}>{planet.subtitle}</Text>

              {/* Stars earned */}
              <View style={styles.starsRow}>
                <Text style={styles.starEmoji}>⭐</Text>
                <Text style={styles.starsText}>{starsEarned} звёзд заработано</Text>
              </View>
            </Animated.View>

            {/* Progress section */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>
                  Выполнено {completedCount} из {total} упражнений
                </Text>
                <Text style={[styles.progressPercent, { color: planet.color }]}>
                  {progressPercent}%
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${progressPercent}%`,
                      backgroundColor: planet.color,
                    },
                  ]}
                />
              </View>
            </View>

            <Text style={styles.exercisesTitle}>Упражнения</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <ExerciseCard
            exercise={item}
            isCompleted={isExerciseCompleted(planet.id, item.id)}
            starsReward={planet.starsReward}
            onPress={() => handleExercisePress(item.id)}
            index={index}
          />
        )}
      />

      {/* Bottom gradient */}
      <LinearGradient
        colors={['transparent', COLORS.background]}
        style={styles.bottomGradient}
        pointerEvents="none"
      />
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
  },
  listContent: {
    paddingHorizontal: 20,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  planetGlow: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  planetEmoji: {
    fontSize: 56,
  },
  planetName: {
    fontSize: 32,
    fontFamily: 'Nunito_800ExtraBold',
    letterSpacing: -0.5,
  },
  planetSubtitle: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.textSecondary,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 4,
  },
  starEmoji: {
    fontSize: 16,
  },
  starsText: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: COLORS.primary,
  },
  progressSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
    borderCurve: 'continuous',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.textSecondary,
  },
  progressPercent: {
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  exercisesTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_800ExtraBold',
    color: COLORS.text,
    marginBottom: 12,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
});
