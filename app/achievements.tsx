import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CosmicBackground } from '@/components/CosmicBackground';
import { StarCounter } from '@/components/StarCounter';
import { COLORS } from '@/constants/SpaceColors';
import { PLANETS } from '@/constants/planets';
import { useProgress } from '@/contexts/ProgressContext';

interface Achievement {
  id: string;
  emoji: string;
  name: string;
  description: string;
  isUnlocked: (totalStars: number, completedPlanets: string[], totalExercises: number) => boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-step',
    emoji: '🌟',
    name: 'Первый шаг',
    description: 'Выполни первое упражнение',
    isUnlocked: (_, __, total) => total >= 1,
  },
  {
    id: 'venus-traveler',
    emoji: '🌸',
    name: 'Венерианский путешественник',
    description: 'Пройди все упражнения на Венере',
    isUnlocked: (_, planets) => planets.includes('venus'),
  },
  {
    id: 'earth-hero',
    emoji: '🌍',
    name: 'Земной герой',
    description: 'Пройди все упражнения на Земле',
    isUnlocked: (_, planets) => planets.includes('earth'),
  },
  {
    id: 'mars-agile',
    emoji: '🔴',
    name: 'Марсианский ловкач',
    description: 'Пройди все упражнения на Марсе',
    isUnlocked: (_, planets) => planets.includes('mars'),
  },
  {
    id: 'jupiter-flex',
    emoji: '🌀',
    name: 'Юпитерский гибкач',
    description: 'Пройди все упражнения на Юпитере',
    isUnlocked: (_, planets) => planets.includes('jupiter'),
  },
  {
    id: 'neptune-breather',
    emoji: '🌌',
    name: 'Нептунский дышатель',
    description: 'Пройди все упражнения на Нептуне',
    isUnlocked: (_, planets) => planets.includes('neptune'),
  },
  {
    id: 'space-conqueror',
    emoji: '🚀',
    name: 'Покоритель космоса',
    description: 'Пройди все планеты',
    isUnlocked: (_, planets) =>
      ['venus', 'earth', 'mars', 'jupiter', 'neptune', 'final'].every((p) =>
        planets.includes(p)
      ),
  },
  {
    id: 'star-collector',
    emoji: '⭐',
    name: 'Звёздный коллектор',
    description: 'Заработай 50 звёзд',
    isUnlocked: (stars) => stars >= 50,
  },
  {
    id: 'superstar',
    emoji: '💫',
    name: 'Суперзвезда',
    description: 'Заработай 100 звёзд',
    isUnlocked: (stars) => stars >= 100,
  },
  {
    id: 'cosmic-champion',
    emoji: '🏆',
    name: 'Космический чемпион',
    description: 'Заработай 200 звёзд',
    isUnlocked: (stars) => stars >= 200,
  },
];

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const { totalStars, planetProgress, isPlanetCompleted } = useProgress();

  const completedPlanets = PLANETS.filter((p) => isPlanetCompleted(p.id)).map((p) => p.id);
  const totalExercises = Object.values(planetProgress).reduce(
    (sum, p) => sum + p.completedExercises.length,
    0
  );

  const headerScale = useRef(new Animated.Value(0.8)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log('[AchievementsScreen] mounted');
    Animated.parallel([
      Animated.spring(headerScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 12,
        bounciness: 8,
      }),
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const unlockedCount = ACHIEVEMENTS.filter((a) =>
    a.isUnlocked(totalStars, completedPlanets, totalExercises)
  ).length;

  return (
    <CosmicBackground style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Достижения',
          presentation: 'modal',
          headerTransparent: true,
          headerTintColor: COLORS.text,
          headerTitleStyle: {
            fontFamily: 'Nunito_700Bold',
            color: COLORS.text,
          },
        }}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Animated.View
          style={[
            styles.titleSection,
            { opacity: headerOpacity, transform: [{ scale: headerScale }] },
          ]}
        >
          <Text style={styles.titleEmoji}>🏆</Text>
          <Text style={styles.title}>Мои достижения</Text>
          <View style={styles.starsDisplay}>
            <StarCounter count={totalStars} size="large" />
          </View>
        </Animated.View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalExercises}</Text>
            <Text style={styles.statLabel}>Упражнений</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{completedPlanets.length}</Text>
            <Text style={styles.statLabel}>Планет</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{unlockedCount}</Text>
            <Text style={styles.statLabel}>Наград</Text>
          </View>
        </View>

        {/* Achievements grid */}
        <Text style={styles.sectionTitle}>Награды</Text>
        <View style={styles.achievementsGrid}>
          {ACHIEVEMENTS.map((achievement, index) => {
            const unlocked = achievement.isUnlocked(
              totalStars,
              completedPlanets,
              totalExercises
            );
            return (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                unlocked={unlocked}
                index={index}
              />
            );
          })}
        </View>
      </ScrollView>
    </CosmicBackground>
  );
}

function AchievementBadge({
  achievement,
  unlocked,
  index,
}: {
  achievement: Achievement;
  unlocked: boolean;
  index: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        delay: index * 50,
        useNativeDriver: true,
        speed: 14,
        bounciness: 6,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.badge,
        !unlocked && styles.badgeLocked,
        { opacity, transform: [{ scale }] },
      ]}
    >
      <Text style={[styles.badgeEmoji, !unlocked && styles.badgeEmojiLocked]}>
        {unlocked ? achievement.emoji : '🔒'}
      </Text>
      <Text style={[styles.badgeName, !unlocked && styles.badgeNameLocked]}>
        {achievement.name}
      </Text>
      <Text style={styles.badgeDescription}>{achievement.description}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 20,
  },
  titleSection: {
    alignItems: 'center',
    gap: 8,
  },
  titleEmoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Nunito_800ExtraBold',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  starsDisplay: {
    backgroundColor: COLORS.primaryMuted,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    borderCurve: 'continuous',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Nunito_800ExtraBold',
    color: COLORS.primary,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_800ExtraBold',
    color: COLORS.text,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badge: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderCurve: 'continuous',
  },
  badgeLocked: {
    borderColor: COLORS.border,
    opacity: 0.6,
  },
  badgeEmoji: {
    fontSize: 32,
  },
  badgeEmojiLocked: {
    opacity: 0.5,
  },
  badgeName: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  badgeNameLocked: {
    color: COLORS.textTertiary,
  },
  badgeDescription: {
    fontSize: 11,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textTertiary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
