import React, { useEffect, useRef } from 'react';
import { Animated, Text, View, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/SpaceColors';
import { useProgress } from '@/contexts/ProgressContext';

interface StarCounterProps {
  count: number;
  size?: 'small' | 'medium' | 'large';
}

const FRAME_COLORS: Record<string, string> = {
  'frame-gold': '#FFD700',
  'frame-space': '#9C27B0',
  'frame-fire': '#FF5722',
};

export function StarCounter({ count, size = 'medium' }: StarCounterProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const prevCount = useRef(count);
  const { activeFrame } = useProgress();

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
  const frameColor = activeFrame ? FRAME_COLORS[activeFrame] : undefined;

  return (
    <Animated.View style={[styles.container, { transform: [{ scale }] }]}>
      <View
        style={[
          styles.inner,
          frameColor ? { borderWidth: 2, borderColor: frameColor, borderRadius: 20, paddingHorizontal: 2, paddingVertical: 1 } : undefined,
        ]}
      >
        <Text style={[styles.emoji, { fontSize: emojiSize }]}>⭐</Text>
        <Text style={[styles.count, { fontSize }]}>{count}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inner: {
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
