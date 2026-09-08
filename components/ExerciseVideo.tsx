import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { COLORS } from '@/constants/SpaceColors';

interface ExerciseVideoProps {
  uri: string;
  planetColor: string;
}

export function ExerciseVideo({ uri, planetColor }: ExerciseVideoProps) {
  console.log(`[ExerciseVideo] rendering video: uri=${uri}`);

  if (!uri) {
    return null;
  }

  return <ExerciseVideoInner uri={uri} planetColor={planetColor} />;
}

function ExerciseVideoInner({ uri, planetColor }: ExerciseVideoProps) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
  });

  const handlePlayPress = () => {
    console.log('[ExerciseVideo] play/pause pressed');
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>ДЕМОНСТРАЦИЯ УПРАЖНЕНИЯ</Text>
      <View style={[styles.videoContainer, { borderColor: planetColor + '40' }]}>
        <VideoView
          style={styles.video}
          player={player}
          allowsFullscreen={true}
          allowsPictureInPicture={false}
          contentFit="cover"
          onTouchEnd={handlePlayPress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  videoContainer: {
    width: '100%',
    height: 200,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 1,
  },
  video: {
    width: '100%',
    height: 200,
    borderRadius: 14,
  },
});
