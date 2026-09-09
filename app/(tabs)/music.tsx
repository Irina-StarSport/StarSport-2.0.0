import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { CosmicBackground } from '@/components/CosmicBackground';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { COLORS } from '@/constants/SpaceColors';
import { useMusic, Track } from '@/contexts/MusicContext';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Plus,
  Trash2,
  Music2,
} from 'lucide-react-native';

export default function MusicScreen() {
  const insets = useSafeAreaInsets();
  const {
    currentTrack,
    isPlaying,
    tracks,
    customTracks,
    play,
    pause,
    resume,
    next,
    previous,
    addCustomTrack,
    removeCustomTrack,
  } = useMusic();

  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log('[MusicScreen] mounted');
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePickDocument = async () => {
    console.log('[MusicScreen] pick document pressed');
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const name = asset.name.replace(/\.[^/.]+$/, '');
        console.log(`[MusicScreen] document picked: name=${name}, uri=${asset.uri}`);
        addCustomTrack(asset.uri, name);
      }
    } catch (err) {
      console.log('[MusicScreen] document picker error:', err);
    }
  };

  const handlePlayPause = (track: Track) => {
    console.log(`[MusicScreen] play/pause: track=${track.name}, currentTrack=${currentTrack?.id}, isPlaying=${isPlaying}`);
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
    console.log('[MusicScreen] next pressed');
    next();
  };

  const handlePrevious = () => {
    console.log('[MusicScreen] previous pressed');
    previous();
  };

  const handleRemoveTrack = (id: string) => {
    console.log(`[MusicScreen] remove track: id=${id}`);
    removeCustomTrack(id);
  };

  const allTracks = [...tracks, ...customTracks];
  void allTracks;

  return (
    <CosmicBackground style={styles.container}>
      {/* Custom header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.headerTitle}>Музыка 🎵</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
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

        {/* Preset tracks */}
        <Text style={styles.sectionTitle}>Встроенные треки</Text>
        {tracks.map((track, index) => (
          <TrackRow
            key={track.id}
            track={track}
            isActive={currentTrack?.id === track.id}
            isPlaying={isPlaying && currentTrack?.id === track.id}
            onPlayPause={() => handlePlayPause(track)}
            index={index}
          />
        ))}

        {/* Custom tracks */}
        <View style={styles.customHeader}>
          <Text style={styles.sectionTitle}>Моя музыка</Text>
          <AnimatedPressable
            onPress={handlePickDocument}
            style={styles.addButton}
            accessibilityLabel="Добавить свою музыку"
            accessibilityRole="button"
          >
            <Plus size={18} color={COLORS.primary} />
            <Text style={styles.addButtonText}>Добавить</Text>
          </AnimatedPressable>
        </View>

        {customTracks.length === 0 ? (
          <View style={styles.emptyCustom}>
            <Text style={styles.emptyEmoji}>🎵</Text>
            <Text style={styles.emptyTitle}>Нет своей музыки</Text>
            <Text style={styles.emptySubtitle}>
              Нажми "Добавить" чтобы загрузить свои аудиофайлы
            </Text>
          </View>
        ) : (
          customTracks.map((track, index) => (
            <TrackRow
              key={track.id}
              track={track}
              isActive={currentTrack?.id === track.id}
              isPlaying={isPlaying && currentTrack?.id === track.id}
              onPlayPause={() => handlePlayPause(track)}
              onDelete={() => handleRemoveTrack(track.id)}
              index={index}
            />
          ))
        )}
      </ScrollView>
    </CosmicBackground>
  );
}

function TrackRow({
  track,
  isActive,
  isPlaying,
  onPlayPause,
  onDelete,
  index,
}: {
  track: Track;
  isActive: boolean;
  isPlaying: boolean;
  onPlayPause: () => void;
  onDelete?: () => void;
  index: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(-12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        delay: index * 50,
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
          {!track.isPreset && (
            <Text style={styles.trackCustomLabel}>Своя музыка</Text>
          )}
        </View>

        {onDelete && (
          <AnimatedPressable
            onPress={onDelete}
            style={styles.deleteBtn}
            accessibilityLabel={`Удалить ${track.name}`}
            accessibilityRole="button"
          >
            <Trash2 size={18} color={COLORS.danger} />
          </AnimatedPressable>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Nunito_800ExtraBold',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 16,
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
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryMuted,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  addButtonText: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: COLORS.primary,
  },
  emptyCustom: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderCurve: 'continuous',
  },
  emptyEmoji: {
    fontSize: 32,
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
  trackCustomLabel: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.accent,
  },
  deleteBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
