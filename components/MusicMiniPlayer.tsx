import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { COLORS } from '@/constants/SpaceColors';
import { useMusic } from '@/contexts/MusicContext';
import { Play, Pause, Music2 } from 'lucide-react-native';

export function MusicMiniPlayer() {
  const router = useRouter();
  const { currentTrack, isPlaying, play, pause, resume } = useMusic();

  const trackName = currentTrack ? currentTrack.name : 'Космическая музыка';

  const handlePlayPause = () => {
    console.log(`[MusicMiniPlayer] play/pause pressed, isPlaying=${isPlaying}`);
    if (!currentTrack) {
      router.push('/music');
      return;
    }
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  const handleOpen = () => {
    console.log('[MusicMiniPlayer] open music screen');
    router.push('/music');
  };

  return (
    <View style={styles.container}>
      <AnimatedPressable onPress={handleOpen} style={styles.trackArea} accessibilityLabel="Открыть музыкальный плеер">
        <View style={styles.iconContainer}>
          <Music2 size={16} color={COLORS.primary} />
        </View>
        <Text style={styles.trackName} numberOfLines={1} ellipsizeMode="tail">
          {trackName}
        </Text>
      </AnimatedPressable>

      <AnimatedPressable
        onPress={handlePlayPause}
        style={styles.playButton}
        accessibilityLabel={isPlaying ? 'Пауза' : 'Воспроизвести'}
        accessibilityRole="button"
      >
        {isPlaying ? (
          <Pause size={18} color={COLORS.primary} />
        ) : (
          <Play size={18} color={COLORS.primary} />
        )}
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  trackArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackName: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: 'Nunito_600SemiBold',
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
