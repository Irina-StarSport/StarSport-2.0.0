import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as MediaLibrary from 'expo-media-library';
import { CosmicBackground } from '@/components/CosmicBackground';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { COLORS } from '@/constants/SpaceColors';
import { useMusic, Track } from '@/contexts/MusicContext';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Music2,
  Music,
} from 'lucide-react-native';

export default function MusicModalScreen() {
  const insets = useSafeAreaInsets();
  const {
    currentTrack,
    isPlaying,
    deviceTracks,
    play,
    pause,
    resume,
    next,
    previous,
    loadMoreTracks,
    hasMoreTracks,
    isLoadingTracks,
    permissionStatus,
    requestPermission,
  } = useMusic();

  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log('[MusicModalScreen] mounted');
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePlayPause = (track: Track) => {
    console.log(`[MusicModalScreen] play/pause: track=${track.name}, currentTrack=${currentTrack?.id}, isPlaying=${isPlaying}`);
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        pause();
      } else {
        resume();
      }
    } else {
      play(track);
    }
  };

  const handleNext = () => {
    console.log('[MusicModalScreen] next pressed');
    next();
  };

  const handlePrevious = () => {
    console.log('[MusicModalScreen] previous pressed');
    previous();
  };

  const handleRequestPermission = async () => {
    console.log('[MusicModalScreen] request permission button pressed');
    await requestPermission();
  };

  const handleLoadMore = () => {
    console.log('[MusicModalScreen] load more pressed');
    loadMoreTracks();
  };

  const isGranted = permissionStatus === MediaLibrary.PermissionStatus.GRANTED;

  return (
    <CosmicBackground style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Музыка',
          presentation: 'modal',
          headerTransparent: true,
          headerTintColor: COLORS.text,
          headerTitleStyle: {
            fontFamily: 'Nunito_700Bold',
            color: COLORS.text,
          },
        }}
      />

      {/* Permission not yet determined */}
      {permissionStatus === null && (
        <View style={[styles.centerState, { paddingTop: insets.top + 60 }]}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      {/* Permission denied */}
      {permissionStatus !== null && !isGranted && (
        <View style={[styles.permissionContainer, { paddingTop: insets.top + 60 }]}>
          <Text style={styles.permissionEmoji}>🎵</Text>
          <Text style={styles.permissionTitle}>Доступ к музыке</Text>
          <Text style={styles.permissionSubtitle}>
            Разреши доступ к медиатеке, чтобы слушать свою музыку во время тренировок
          </Text>
          <AnimatedPressable
            onPress={handleRequestPermission}
            style={styles.permissionButton}
            accessibilityLabel="Разрешить доступ к музыке"
            accessibilityRole="button"
          >
            <Text style={styles.permissionButtonText}>Разрешить доступ к музыке</Text>
          </AnimatedPressable>
        </View>
      )}

      {/* Main content */}
      {isGranted && (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Animated.View style={[styles.titleSection, { opacity: headerOpacity }]}>
            <Text style={styles.titleEmoji}>🎵</Text>
            <Text style={styles.title}>Космическая музыка</Text>
          </Animated.View>

          {/* Current track player */}
          {currentTrack && (
            <View style={styles.playerCard}>
              <View style={styles.playerTrackInfo}>
                <View style={styles.playerIconContainer}>
                  <Music2 size={20} color={COLORS.primary} />
                </View>
                <View style={styles.playerTextContainer}>
                  <Text style={styles.playerTrackName} numberOfLines={1}>
                    {currentTrack.name}
                  </Text>
                  <Text style={styles.playerStatus}>
                    {isPlaying ? 'Воспроизводится' : 'Пауза'}
                  </Text>
                </View>
              </View>

              <View style={styles.playerControls}>
                <AnimatedPressable
                  onPress={handlePrevious}
                  style={styles.playerControlBtn}
                  accessibilityLabel="Предыдущий трек"
                  accessibilityRole="button"
                >
                  <SkipBack size={22} color={COLORS.text} />
                </AnimatedPressable>

                <AnimatedPressable
                  onPress={() => handlePlayPause(currentTrack)}
                  style={styles.playerMainBtn}
                  accessibilityLabel={isPlaying ? 'Пауза' : 'Воспроизвести'}
                  accessibilityRole="button"
                >
                  {isPlaying ? (
                    <Pause size={26} color="#000" />
                  ) : (
                    <Play size={26} color="#000" />
                  )}
                </AnimatedPressable>

                <AnimatedPressable
                  onPress={handleNext}
                  style={styles.playerControlBtn}
                  accessibilityLabel="Следующий трек"
                  accessibilityRole="button"
                >
                  <SkipForward size={22} color={COLORS.text} />
                </AnimatedPressable>
              </View>
            </View>
          )}

          {/* Device tracks section */}
          <Text style={styles.sectionTitle}>Музыка с устройства</Text>

          {/* Loading state */}
          {isLoadingTracks && deviceTracks.length === 0 && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>Загрузка треков...</Text>
            </View>
          )}

          {/* Empty state */}
          {!isLoadingTracks && deviceTracks.length === 0 && (
            <View style={styles.emptyState}>
              <Music size={40} color={COLORS.textTertiary} />
              <Text style={styles.emptyTitle}>Аудиофайлы не найдены</Text>
              <Text style={styles.emptySubtitle}>
                На устройстве не найдено аудиофайлов
              </Text>
            </View>
          )}

          {/* Track list */}
          {deviceTracks.map((track, index) => (
            <TrackRow
              key={track.id}
              track={track}
              isActive={currentTrack?.id === track.id}
              isPlaying={isPlaying && currentTrack?.id === track.id}
              onPlayPause={() => handlePlayPause(track)}
              index={index}
            />
          ))}

          {/* Load more */}
          {hasMoreTracks && (
            <AnimatedPressable
              onPress={handleLoadMore}
              style={styles.loadMoreButton}
              accessibilityLabel="Загрузить ещё треки"
              accessibilityRole="button"
            >
              {isLoadingTracks ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Text style={styles.loadMoreText}>Загрузить ещё</Text>
              )}
            </AnimatedPressable>
          )}
        </ScrollView>
      )}
    </CosmicBackground>
  );
}

function TrackRow({
  track,
  isActive,
  isPlaying,
  onPlayPause,
  index,
}: {
  track: Track;
  isActive: boolean;
  isPlaying: boolean;
  onPlayPause: () => void;
  index: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(-12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay: Math.min(index, 20) * 40,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        delay: Math.min(index, 20) * 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateX }] }}>
      <View style={[styles.trackRow, isActive && styles.trackRowActive]}>
        <AnimatedPressable
          onPress={onPlayPause}
          style={styles.trackPlayBtn}
          accessibilityLabel={isPlaying ? 'Пауза' : `Воспроизвести ${track.name}`}
          accessibilityRole="button"
        >
          <View
            style={[
              styles.trackPlayIcon,
              { backgroundColor: isActive ? COLORS.primary : COLORS.surfaceSecondary },
            ]}
          >
            {isPlaying ? (
              <Pause size={16} color={isActive ? '#000' : COLORS.textSecondary} />
            ) : (
              <Play size={16} color={isActive ? '#000' : COLORS.textSecondary} />
            )}
          </View>
        </AnimatedPressable>

        <View style={styles.trackInfo}>
          <Text
            style={[styles.trackName, isActive && styles.trackNameActive]}
            numberOfLines={1}
          >
            {track.name}
          </Text>
          {track.duration && (
            <Text style={styles.trackDuration}>{track.duration}</Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  permissionEmoji: {
    fontSize: 56,
  },
  permissionTitle: {
    fontSize: 22,
    fontFamily: 'Nunito_800ExtraBold',
    color: COLORS.text,
    textAlign: 'center',
  },
  permissionSubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 14,
    marginTop: 8,
  },
  permissionButtonText: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
    color: '#000',
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  titleSection: {
    alignItems: 'center',
    gap: 8,
  },
  titleEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Nunito_800ExtraBold',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  playerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    padding: 16,
    gap: 16,
    borderCurve: 'continuous',
  },
  playerTrackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerTextContainer: {
    flex: 1,
    gap: 2,
  },
  playerTrackName: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: COLORS.text,
  },
  playerStatus: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textSecondary,
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  playerControlBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerMainBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: 'Nunito_800ExtraBold',
    color: COLORS.text,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderCurve: 'continuous',
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
    color: COLORS.textSecondary,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textTertiary,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    gap: 12,
    borderCurve: 'continuous',
  },
  trackRowActive: {
    borderColor: COLORS.primary + '40',
    backgroundColor: COLORS.primaryMuted,
  },
  trackPlayBtn: {
    // wrapper for AnimatedPressable
  },
  trackPlayIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackInfo: {
    flex: 1,
    gap: 2,
  },
  trackName: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.text,
  },
  trackNameActive: {
    color: COLORS.primary,
  },
  trackDuration: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textTertiary,
  },
  loadMoreButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderCurve: 'continuous',
    minHeight: 48,
  },
  loadMoreText: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: COLORS.primary,
  },
});
