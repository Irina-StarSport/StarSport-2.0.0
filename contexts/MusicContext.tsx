import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { useAudioPlayer, AudioPlayer } from 'expo-audio';
import { loadCustomTracks, saveCustomTracks, CustomTrack } from '@/utils/storage';

export interface Track {
  id: string;
  name: string;
  uri: string | null; // null = preset placeholder (no actual file)
  isPreset: boolean;
  duration?: string;
}

const PRESET_TRACKS: Track[] = [
  { id: 'preset-1', name: 'Космическое путешествие', uri: null, isPreset: true, duration: '3:45' },
  { id: 'preset-2', name: 'Звёздный марш', uri: null, isPreset: true, duration: '2:30' },
  { id: 'preset-3', name: 'Лунная соната', uri: null, isPreset: true, duration: '4:10' },
  { id: 'preset-4', name: 'Марсианский ритм', uri: null, isPreset: true, duration: '3:00' },
  { id: 'preset-5', name: 'Нептунские волны', uri: null, isPreset: true, duration: '5:20' },
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
}

const MusicContext = createContext<MusicContextType | null>(null);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [customTracks, setCustomTracks] = useState<Track[]>([]);
  const playerRef = useRef<AudioPlayer | null>(null);

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
    // Preset tracks have no actual audio file — just update UI state
    if (!track.uri) {
      return;
    }
    // For custom tracks with real URIs, playback would be handled here
    // expo-audio useAudioPlayer is a hook so we can't call it imperatively
    // We set state and let the player component handle it
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
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic must be used within MusicProvider');
  return ctx;
}
