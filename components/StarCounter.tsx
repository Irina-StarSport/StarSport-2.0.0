import React, { useEffect, useRef } from 'react';
import { Animated, Text, View, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/SpaceColors';

interface StarCounterProps {
  count: number;
  size?: 'small' | 'medium' | 'large';
}

export function StarCounter({ count, size = 'medium' }: StarCounterProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const prevCount = useRef(count);

  useEffect(() => {
    if (count !== prevCount.current) {
      prevCount.current = count;
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.4,
          useNativeDriver: true,
          speed: 40,
          bounciness: 12,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 40,
          bounciness: 8,
        }),
      ]).start();
    }
  }, [count, scale]);

  const fontSize = size === 'large' ? 28 : size === 'medium' ? 20 : 14;
  const emojiSize = size === 'large' ? 28 : size === 'medium' ? 20 : 14;

  return (
    <Animated.View style={[styles.container, { transform: [{ scale }] }]}>
      <Text style={[styles.emoji, { fontSize: emojiSize }]}>⭐</Text>
      <Text style={[styles.count, { fontSize }]}>{count}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emoji: {
    lineHeight: undefined,
  },
  count: {
    color: COLORS.primary,
    fontFamily: 'Nunito_800ExtraBold',
    fontVariant: ['tabular-nums'],
  },
});
