import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { COLORS } from '@/constants/SpaceColors';
import { Exercise } from '@/constants/planets';
import { CheckCircle2, Clock } from 'lucide-react-native';

interface ExerciseCardProps {
  exercise: Exercise;
  isCompleted: boolean;
  starsReward: number;
  onPress: () => void;
  index: number;
}

export function ExerciseCard({
  exercise,
  isCompleted,
  starsReward,
  onPress,
  index,
}: ExerciseCardProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(-16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 350,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const durationText = exercise.reps ? exercise.reps : `${exercise.duration} сек`;

  return (
    <Animated.View style={{ opacity, transform: [{ translateX }] }}>
      <AnimatedPressable
        onPress={() => {
          console.log(`[ExerciseCard] pressed: exercise=${exercise.id}, name=${exercise.name}`);
          onPress();
        }}
        accessibilityLabel={`Упражнение ${exercise.name}. ${isCompleted ? 'Выполнено' : 'Не выполнено'}. ${durationText}`}
        accessibilityRole="button"
      >
        <View style={[styles.card, isCompleted && styles.cardCompleted]}>
          <View style={styles.emojiContainer}>
            <Text style={styles.emoji}>{exercise.emoji}</Text>
          </View>

          <View style={styles.info}>
            <Text style={[styles.name, isCompleted && styles.nameCompleted]}>
              {exercise.name}
            </Text>
            <View style={styles.metaRow}>
              <Clock size={12} color={COLORS.textTertiary} />
              <Text style={styles.meta}>{durationText}</Text>
            </View>
          </View>

          <View style={styles.rightSide}>
            {isCompleted ? (
              <CheckCircle2 size={24} color={COLORS.success} />
            ) : (
              <View style={styles.starsReward}>
                <Text style={styles.starEmoji}>⭐</Text>
                <Text style={styles.starsText}>×{starsReward}</Text>
              </View>
            )}
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderCurve: 'continuous',
  },
  cardCompleted: {
    borderColor: COLORS.success + '40',
    backgroundColor: COLORS.surface,
  },
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
    color: COLORS.text,
  },
  nameCompleted: {
    color: COLORS.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meta: {
    fontSize: 12,
    color: COLORS.textTertiary,
    fontFamily: 'Nunito_400Regular',
  },
  rightSide: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
  },
  starsReward: {
    alignItems: 'center',
    backgroundColor: COLORS.primaryMuted,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 2,
  },
  starEmoji: {
    fontSize: 14,
  },
  starsText: {
    fontSize: 12,
    color: COLORS.primary,
    fontFamily: 'Nunito_700Bold',
  },
});
