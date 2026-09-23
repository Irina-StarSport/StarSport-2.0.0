import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { useAudioPlayer } from 'expo-audio';
import { loadCustomTracks, saveCustomTracks, CustomTrack } from '@/utils/storage';

export interface Track {
  id: string;
  name: string;
  uri: string | null;
  isPreset: boolean;
  duration?: string;
}

const PRESET_TRACKS: Track[] = [
  {
    id: 'preset-1',
    name: 'Космическое путешествие',
    uri: 'https://ia800905.us.archive.org/19/items/FREE_background_music_dhalius/01_Dhalius_-_Chill_Mood.mp3',
    isPreset: true,
    duration: '3:45',
  },
  {
    id: 'preset-2',
    name: 'Звёздный марш',
    uri: 'https://ia800905.us.archive.org/19/items/FREE_background_music_dhalius/02_Dhalius_-_Dreamy.mp3',
    isPreset: true,
    duration: '2:30',
  },
  {
    id: 'preset-3',
    name: 'Лунная соната',
    uri: 'https://ia800905.us.archive.org/19/items/FREE_background_music_dhalius/03_Dhalius_-_Floating.mp3',
    isPreset: true,
    duration: '4:10',
  },
  {
    id: 'preset-4',
    name: 'Марсианский ритм',
    uri: 'https://ia800905.us.archive.org/19/items/FREE_background_music_dhalius/04_Dhalius_-_Happy_Go_Lucky.mp3',
    isPreset: true,
    duration: '3:00',
  },
  {
    id: 'preset-5',
    name: 'Нептунские волны',
    uri: 'https://ia800905.us.archive.org/19/items/FREE_background_music_dhalius/05_Dhalius_-_Inspiring.mp3',
    isPreset: true,
    duration: '5:20',
  },
];

interface MusicContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  tracks: Track[];
  customTracks: Track[];
  play: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  addCustomTrack: (uri: string, name: string) => void;
  removeCustomTrack: (id: string) => void;
  volume: number;
  setVolume: (v: number) => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

// ─── AudioEngine ────────────────────────────────────────────────────────────
// Rendered inside MusicProvider so it can legally call hooks.
// It owns the single AudioPlayer instance and syncs it to context state.

interface AudioEngineProps {
  uri: string | null;
  isPlaying: boolean;
  volume: number;
}

function AudioEngine({ uri, isPlaying, volume }: AudioEngineProps) {
  // useAudioPlayer re-creates the player whenever the source changes
  // (the hook uses JSON.stringify(source) as its dep key internally)
  const source = uri ? { uri } : null;
  const player = useAudioPlayer(source);

  // Sync play/pause state
  useEffect(() => {
    if (!uri) return;
    if (isPlaying) {
      console.log('[AudioEngine] calling player.play()');
      player.play();
      player.loop = true;
    } else {
      console.log('[AudioEngine] calling player.pause()');
      player.pause();
    }
  }, [isPlaying]);

  // Stop old player and auto-play when the track (uri) changes
  useEffect(() => {
    if (!uri) return;
    console.log('[AudioEngine] track changed, auto-playing:', uri);
    if (isPlaying) {
      player.play();
      player.loop = true;
    }
    return () => {
      console.log('[AudioEngine] uri cleanup — pausing old player');
      player.pause();
    };
  }, [uri]);

  // Sync volume
  useEffect(() => {
    player.volume = volume;
    console.log('[AudioEngine] volume set to', volume);
  }, [volume, player]);

  return null;
}

// ─── MusicProvider ───────────────────────────────────────────────────────────

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [customTracks, setCustomTracks] = useState<Track[]>([]);
  const [volume, setVolumeState] = useState(0.8);

  const setVolume = useCallback((v: number) => {
    console.log(`[MusicContext] setVolume: ${v}`);
    setVolumeState(v);
  }, []);

  const allTracks = useMemo(() => [...PRESET_TRACKS, ...customTracks], [customTracks]);

  useEffect(() => {
    loadCustomTracks().then((saved) => {
      const tracks: Track[] = saved.map((t: CustomTrack) => ({
        id: t.id,
        name: t.name,
        uri: t.uri,
        isPreset: false,
      }));
      setCustomTracks(tracks);
    });
  }, []);

  const play = useCallback((track: Track) => {
    console.log(`[MusicContext] play: track=${track.name}, uri=${track.uri}`);
    setCurrentTrack(track);
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    console.log('[MusicContext] pause');
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    console.log('[MusicContext] resume');
    if (currentTrack) {
      setIsPlaying(true);
    }
  }, [currentTrack]);

  const next = useCallback(() => {
    console.log('[MusicContext] next');
    if (!currentTrack) {
      play(allTracks[0]);
      return;
    }
    const idx = allTracks.findIndex((t) => t.id === currentTrack.id);
    const nextIdx = (idx + 1) % allTracks.length;
    play(allTracks[nextIdx]);
  }, [currentTrack, allTracks, play]);

  const previous = useCallback(() => {
    console.log('[MusicContext] previous');
    if (!currentTrack) {
      play(allTracks[allTracks.length - 1]);
      return;
    }
    const idx = allTracks.findIndex((t) => t.id === currentTrack.id);
    const prevIdx = (idx - 1 + allTracks.length) % allTracks.length;
    play(allTracks[prevIdx]);
  }, [currentTrack, allTracks, play]);

  const addCustomTrack = useCallback(
    (uri: string, name: string) => {
      console.log(`[MusicContext] addCustomTrack: name=${name}, uri=${uri}`);
      const newTrack: Track = {
        id: `custom-${Date.now()}`,
        name,
        uri,
        isPreset: false,
      };
      setCustomTracks((prev) => {
        const updated = [...prev, newTrack];
        saveCustomTracks(
          updated.map((t) => ({ id: t.id, name: t.name, uri: t.uri ?? '' }))
        );
        return updated;
      });
    },
    []
  );

  const removeCustomTrack = useCallback(
    (id: string) => {
      console.log(`[MusicContext] removeCustomTrack: id=${id}`);
      setCustomTracks((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        saveCustomTracks(
          updated.map((t) => ({ id: t.id, name: t.name, uri: t.uri ?? '' }))
        );
        return updated;
      });
      if (currentTrack?.id === id) {
        setCurrentTrack(null);
        setIsPlaying(false);
      }
    },
    [currentTrack]
  );

  return (
    <MusicContext.Provider
      value={{
        currentTrack,
        isPlaying,
        tracks: PRESET_TRACKS,
        customTracks,
        play,
        pause,
        resume,
        next,
        previous,
        addCustomTrack,
        removeCustomTrack,
        volume,
        setVolume,
      }}
    >
      <AudioEngine
        uri={currentTrack?.uri ?? null}
        isPlaying={isPlaying}
        volume={volume}
      />
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic must be used within MusicProvider');
  return ctx;
}
