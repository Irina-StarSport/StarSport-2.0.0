import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { COLORS } from '@/constants/SpaceColors';
import { Planet } from '@/constants/planets';
import { Lock } from 'lucide-react-native';

interface PlanetCardProps {
  planet: Planet;
  completedCount: number;
  isLocked: boolean;
  starsEarned: number;
  onPress: () => void;
  index: number;
}

export function PlanetCard({
  planet,
  completedCount,
  isLocked,
  starsEarned,
  onPress,
  index,
}: PlanetCardProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const total = planet.exercises.length;
  const progress = total > 0 ? completedCount / total : 0;
  const progressPercent = Math.round(progress * 100);

  const completedText = `Пройдено: ${completedCount}/${total} упражнений`;

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <AnimatedPressable
        onPress={() => {
          console.log(`[PlanetCard] pressed: planet=${planet.id}, locked=${isLocked}`);
          if (!isLocked) onPress();
        }}
        accessibilityLabel={`Планета ${planet.name}. ${isLocked ? 'Заблокировано' : completedText}`}
        accessibilityRole="button"
      >
        <View
          style={[
            styles.card,
            {
              boxShadow: `0 0 20px ${planet.glowColor}, 0 2px 8px rgba(0,0,0,0.4)`,
              borderColor: isLocked ? COLORS.border : planet.color + '40',
            },
          ]}
        >
          {/* Glow overlay */}
          <View
            style={[
              styles.glowOverlay,
              { backgroundColor: planet.glowColor },
            ]}
          />

          <View style={styles.row}>
            {/* Planet emoji */}
            <View style={[styles.emojiContainer, { backgroundColor: planet.color + '20' }]}>
              {planet.imageUrl && !imageError ? (
                <Image
                  source={{ uri: planet.imageUrl }}
                  style={styles.planetImage}
                  resizeMode="cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <Text style={styles.emoji}>{planet.emoji}</Text>
              )}
            </View>

            {/* Info */}
            <View style={styles.info}>
              <View style={styles.nameRow}>
                <Text style={[styles.name, { color: isLocked ? COLORS.textTertiary : planet.color }]}>
                  {planet.name}
                </Text>
                <Text style={styles.subtitle}>{planet.subtitle}</Text>
              </View>

              <Text style={styles.progressText}>{completedText}</Text>

              {/* Progress bar */}
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${progressPercent}%`,
                      backgroundColor: isLocked ? COLORS.textTertiary : planet.color,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Right side */}
            <View style={styles.rightSide}>
              {isLocked ? (
                <View style={styles.lockContainer}>
                  <Lock size={22} color={COLORS.textTertiary} />
                </View>
              ) : (
                <View style={styles.starsContainer}>
                  <Text style={styles.starEmoji}>⭐</Text>
                  <Text style={[styles.starsCount, { color: planet.color }]}>{starsEarned}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderCurve: 'continuous',
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emojiContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 36,
  },
  planetImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 18,
    fontFamily: 'Nunito_800ExtraBold',
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'Nunito_600SemiBold',
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  rightSide: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
  },
  lockContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starsContainer: {
    alignItems: 'center',
    gap: 2,
  },
  starEmoji: {
    fontSize: 20,
  },
  starsCount: {
    fontSize: 14,
    fontFamily: 'Nunito_800ExtraBold',
  },
});
