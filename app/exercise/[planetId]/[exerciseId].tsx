import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CosmicBackground } from '@/components/CosmicBackground';
import { ProgressRing } from '@/components/ProgressRing';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { MusicMiniPlayer } from '@/components/MusicMiniPlayer';
import { COLORS } from '@/constants/SpaceColors';
import { PLANETS } from '@/constants/planets';
import { useProgress } from '@/contexts/ProgressContext';
import { useSettings } from '@/contexts/SettingsContext';
import { t } from '@/constants/translations';
import { Play, Pause, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

import * as ExpoHaptics from 'expo-haptics';
const Haptics = Platform.OS !== 'web' ? ExpoHaptics : null;

export default function ExerciseScreen() {
  const { planetId, exerciseId } = useLocalSearchParams<{
    planetId: string;
    exerciseId: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { completeExercise, isExerciseCompleted } = useProgress();
  const { settings } = useSettings();
  const lang = settings.language;

  const planet = PLANETS.find((p) => p.id === planetId);
  const exercise = planet?.exercises.find((e) => e.id === exerciseId);

  const [timeLeft, setTimeLeft] = useState(exercise?.duration ?? 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [tipExpanded, setTipExpanded] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const completionScale = useRef(new Animated.Value(0)).current;
  const completionOpacity = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<any>(null);

  const alreadyCompleted = planet && exercise
    ? isExerciseCompleted(planet.id, exercise.id)
    : false;

  const isFinalLastExercise =
    planetId === 'final' &&
    planet !== undefined &&
    planet.exercises[planet.exercises.length - 1]?.id === exerciseId;

  useEffect(() => {
    console.log(`[ExerciseScreen] mounted: planet=${planetId}, exercise=${exerciseId}`);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleComplete = useCallback(() => {
    if (!planet || !exercise) return;
    console.log(`[ExerciseScreen] exercise completed: planet=${planetId}, exercise=${exerciseId}, stars=${planet.starsReward}`);
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setIsCompleted(true);

    if (Haptics) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    Animated.sequence([
      Animated.spring(completionScale, {
        toValue: 1.3,
        useNativeDriver: true,
        speed: 20,
        bounciness: 15,
      }),
      Animated.spring(completionScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 8,
      }),
    ]).start();
    Animated.timing(completionOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    if (!alreadyCompleted) {
      completeExercise(planet.id, exercise.id, planet.starsReward);
    }

    if (isFinalLastExercise && confettiRef.current) {
      confettiRef.current.start();
    }
  }, [planet, exercise, alreadyCompleted, completeExercise, completionScale, completionOpacity, isFinalLastExercise]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, handleComplete]);

  const handleStartPause = () => {
    if (isCompleted) return;
    console.log(`[ExerciseScreen] start/pause pressed, isRunning=${isRunning}`);
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    console.log('[ExerciseScreen] reset pressed');
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(exercise?.duration ?? 60);
    setIsCompleted(false);
    completionScale.setValue(0);
    completionOpacity.setValue(0);
  };

  const handleCompleteButton = () => {
    console.log('[ExerciseScreen] complete button pressed');
    handleComplete();
  };

  const handleBack = () => {
    console.log('[ExerciseScreen] back to planet');
    router.back();
  };

  if (!planet || !exercise) {
    return (
      <CosmicBackground style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Упражнение не найдено</Text>
        </View>
      </CosmicBackground>
    );
  }

  const duration = exercise.duration;
  const progress = duration > 0 ? (duration - timeLeft) / duration : 0;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const completeButtonLabel = `${t(lang, 'exerciseDone')} ⭐×${planet.starsReward}`;

  return (
    <CosmicBackground style={styles.container}>
      <Stack.Screen
        options={{
          title: exercise.name,
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
          { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Exercise header */}
        <View style={styles.exerciseHeader}>
          <View style={[styles.emojiCircle, { backgroundColor: planet.color + '20' }]}>
            <Text style={styles.exerciseEmoji}>{exercise.emoji}</Text>
          </View>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <View style={[styles.planetBadge, { backgroundColor: planet.color + '20' }]}>
            <Text style={styles.planetBadgeEmoji}>{planet.emoji}</Text>
            <Text style={[styles.planetBadgeText, { color: planet.color }]}>
              {planet.name}
            </Text>
          </View>
        </View>

        {/* Timer */}
        <View style={styles.timerSection}>
          <ProgressRing
            progress={progress}
            size={200}
            strokeWidth={10}
            color={isCompleted ? COLORS.success : planet.color}
            trackColor="rgba(255,255,255,0.08)"
          >
            <View style={styles.timerInner}>
              {isCompleted ? (
                <Animated.View
                  style={{
                    transform: [{ scale: completionScale }],
                    opacity: completionOpacity,
                    alignItems: 'center',
                  }}
                >
                  <Text style={styles.completedEmoji}>🎉</Text>
                  <Text style={styles.completedLabel}>Готово!</Text>
                </Animated.View>
              ) : (
                <>
                  <Text style={styles.timerDisplay}>{timeDisplay}</Text>
                  <Text style={styles.timerLabel}>осталось</Text>
                </>
              )}
            </View>
          </ProgressRing>

          {/* Timer controls */}
          <View style={styles.timerControls}>
            <AnimatedPressable
              onPress={handleReset}
              style={styles.controlButton}
              accessibilityLabel="Сбросить таймер"
              accessibilityRole="button"
            >
              <RotateCcw size={22} color={COLORS.textSecondary} />
            </AnimatedPressable>

            <AnimatedPressable
              onPress={handleStartPause}
              style={[styles.mainControlButton, { backgroundColor: planet.color }]}
              disabled={isCompleted}
              accessibilityLabel={isRunning ? 'Пауза' : 'Запустить таймер'}
              accessibilityRole="button"
            >
              {isRunning ? (
                <Pause size={28} color="#000" />
              ) : (
                <Play size={28} color="#000" />
              )}
            </AnimatedPressable>

            <View style={styles.controlButton} />
          </View>
        </View>

        {/* Description card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t(lang, 'description')}</Text>
          <Text style={styles.description}>{exercise.description}</Text>
          {exercise.reps && (
            <View style={styles.repsRow}>
              <Text style={styles.repsLabel}>{t(lang, 'reps')}</Text>
              <Text style={[styles.repsValue, { color: planet.color }]}>{exercise.reps}</Text>
            </View>
          )}
        </View>

        {/* Fun fact card */}
        <View style={[styles.card, styles.factCard]}>
          <Text style={styles.factTitle}>{t(lang, 'funFact')}</Text>
          <Text style={styles.factText}>{exercise.funFact}</Text>
        </View>

        {/* Parent tip card */}
        <View style={styles.card}>
          <AnimatedPressable
            onPress={() => {
              console.log(`[ExerciseScreen] tip toggle: expanded=${!tipExpanded}`);
              setTipExpanded((prev) => !prev);
            }}
            accessibilityLabel={t(lang, 'parentTip')}
            accessibilityRole="button"
          >
            <View style={styles.tipHeader}>
              <View style={styles.tipHeaderLeft}>
                <Text style={styles.tipIcon}>👨‍👩‍👧</Text>
                <Text style={styles.tipTitle}>{t(lang, 'parentTip')}</Text>
              </View>
              {tipExpanded ? (
                <ChevronUp size={18} color={COLORS.textSecondary} />
              ) : (
                <ChevronDown size={18} color={COLORS.textSecondary} />
              )}
            </View>
          </AnimatedPressable>

          {tipExpanded && (
            <View style={styles.tipContent}>
              <Text style={styles.tipText}>{exercise.parentTip}</Text>
              <View style={styles.adaptationsList}>
                <Text style={styles.adaptationsTitle}>{t(lang, 'adaptations')}</Text>
                {exercise.adaptations.map((adaptation, i) => (
                  <View key={i} style={styles.adaptationItem}>
                    <Text style={styles.adaptationBullet}>•</Text>
                    <Text style={styles.adaptationText}>{adaptation}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Complete button */}
        {!isCompleted ? (
          <AnimatedPressable
            onPress={handleCompleteButton}
            style={styles.completeButton}
            accessibilityLabel={completeButtonLabel}
            accessibilityRole="button"
          >
            <View style={[styles.completeButtonInner, { backgroundColor: planet.color }]}>
              <Text style={styles.completeButtonText}>{completeButtonLabel}</Text>
            </View>
          </AnimatedPressable>
        ) : (
          <View style={styles.completedButtons}>
            {(() => {
              const currentIndex = planet.exercises.findIndex((e) => e.id === exerciseId);
              const hasNext = currentIndex >= 0 && currentIndex + 1 < planet.exercises.length;
              const nextExercise = hasNext ? planet.exercises[currentIndex + 1] : null;
              return (
                <>
                  {nextExercise && (
                    <AnimatedPressable
                      onPress={() => {
                        console.log(`[ExerciseScreen] next exercise pressed: ${nextExercise.id}`);
                        router.replace(`/exercise/${planetId}/${nextExercise.id}`);
                      }}
                      style={styles.completeButton}
                      accessibilityLabel="Следующее упражнение"
                      accessibilityRole="button"
                    >
                      <View style={[styles.completeButtonInner, { backgroundColor: planet.color }]}>
                        <Text style={styles.completeButtonText}>{t(lang, 'nextExercise')}</Text>
                      </View>
                    </AnimatedPressable>
                  )}
                  <AnimatedPressable
                    onPress={handleBack}
                    style={styles.completeButton}
                    accessibilityLabel="Вернуться к планете"
                    accessibilityRole="button"
                  >
                    <View style={[styles.completeButtonInner, { backgroundColor: COLORS.surfaceSecondary }]}>
                      <Text style={[styles.completeButtonText, { color: COLORS.text }]}>{t(lang, 'backToPlanet')}</Text>
                    </View>
                  </AnimatedPressable>
                </>
              );
            })()}
          </View>
        )}
      </ScrollView>

      {/* Music mini player */}
      <View style={{ paddingBottom: insets.bottom }}>
        <MusicMiniPlayer />
      </View>

      {isFinalLastExercise && (
        <ConfettiCannon
          ref={confettiRef}
          count={200}
          origin={{ x: -10, y: 0 }}
          autoStart={false}
          fadeOut={true}
          explosionSpeed={350}
          fallSpeed={3000}
          colors={['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']}
        />
      )}
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
  scrollContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  exerciseHeader: {
    alignItems: 'center',
    gap: 8,
  },
  emojiCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseEmoji: {
    fontSize: 44,
  },
  exerciseName: {
    fontSize: 24,
    fontFamily: 'Nunito_800ExtraBold',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  planetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  planetBadgeEmoji: {
    fontSize: 14,
  },
  planetBadgeText: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
  },
  timerSection: {
    alignItems: 'center',
    gap: 20,
  },
  timerInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerDisplay: {
    fontSize: 44,
    fontFamily: 'Nunito_800ExtraBold',
    color: COLORS.text,
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  timerLabel: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textSecondary,
  },
  completedEmoji: {
    fontSize: 40,
    textAlign: 'center',
  },
  completedLabel: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
    color: COLORS.success,
    textAlign: 'center',
  },
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  controlButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainControlButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 10,
    borderCurve: 'continuous',
  },
  cardTitle: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.text,
    lineHeight: 22,
  },
  repsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  repsLabel: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.textSecondary,
  },
  repsValue: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
  },
  factCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    borderColor: 'rgba(255, 215, 0, 0.25)',
  },
  factTitle: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: '#FFD700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  factText: {
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.text,
    lineHeight: 22,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tipHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipIcon: {
    fontSize: 20,
  },
  tipTitle: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
    color: COLORS.text,
  },
  tipContent: {
    gap: 12,
    paddingTop: 4,
  },
  tipText: {
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.text,
    lineHeight: 22,
  },
  adaptationsList: {
    gap: 6,
  },
  adaptationsTitle: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  adaptationItem: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  adaptationBullet: {
    fontSize: 14,
    color: COLORS.accent,
    lineHeight: 20,
  },
  adaptationText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  completedButtons: {
    gap: 12,
    marginTop: 4,
  },
  completeButton: {
    marginTop: 0,
  },
  completeButtonInner: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
  completeButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#000',
  },
});
