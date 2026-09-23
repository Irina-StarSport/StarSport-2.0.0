import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { useAudioPlayer } from 'expo-audio';
import * as MediaLibrary from 'expo-media-library';

export interface Track {
  id: string;
  name: string;
  uri: string | null;
  isPreset: boolean;
  duration?: string;
}

interface MusicContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  tracks: Track[];
  deviceTracks: Track[];
  play: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  loadMoreTracks: () => void;
  hasMoreTracks: boolean;
  isLoadingTracks: boolean;
  permissionStatus: MediaLibrary.PermissionStatus | null;
  requestPermission: () => Promise<void>;
  volume: number;
  setVolume: (v: number) => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

// ─── AudioEngine ────────────────────────────────────────────────────────────

interface AudioEngineProps {
  uri: string | null;
  isPlaying: boolean;
  volume: number;
}

function AudioEngine({ uri, isPlaying, volume }: AudioEngineProps) {
  const source = uri ? { uri } : null;
  const player = useAudioPlayer(source);

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

  useEffect(() => {
    player.volume = volume;
    console.log('[AudioEngine] volume set to', volume);
  }, [volume, player]);

  return null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const sPadded = s < 10 ? `0${s}` : `${s}`;
  return `${m}:${sPadded}`;
}

function assetToTrack(asset: MediaLibrary.Asset): Track {
  return {
    id: asset.id,
    name: asset.filename.replace(/\.[^/.]+$/, ''),
    uri: asset.uri,
    isPreset: false,
    duration: asset.duration > 0 ? formatDuration(asset.duration) : undefined,
  };
}

const PAGE_SIZE = 30;

// ─── MusicProvider ───────────────────────────────────────────────────────────

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [deviceTracks, setDeviceTracks] = useState<Track[]>([]);
  const [volume, setVolumeState] = useState(0.8);
  const [permissionStatus, setPermissionStatus] = useState<MediaLibrary.PermissionStatus | null>(null);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [hasMoreTracks, setHasMoreTracks] = useState(false);
  const [endCursor, setEndCursor] = useState<string | undefined>(undefined);

  const setVolume = useCallback((v: number) => {
    console.log(`[MusicContext] setVolume: ${v}`);
    setVolumeState(v);
  }, []);

  const loadTracks = useCallback(async (after?: string) => {
    console.log('[MusicContext] loadTracks called, after=', after);
    setIsLoadingTracks(true);
    try {
      const result = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        first: PAGE_SIZE,
        after,
        sortBy: MediaLibrary.SortBy.default,
      });
      console.log(`[MusicContext] loaded ${result.assets.length} audio assets, hasNextPage=${result.hasNextPage}`);
      const newTracks = result.assets.map(assetToTrack);
      setDeviceTracks((prev) => (after ? [...prev, ...newTracks] : newTracks));
      setHasMoreTracks(result.hasNextPage);
      setEndCursor(result.hasNextPage ? result.endCursor : undefined);
    } catch (err) {
      console.log('[MusicContext] loadTracks error:', err);
    } finally {
      setIsLoadingTracks(false);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    console.log('[MusicContext] requestPermission called');
    const { status } = await MediaLibrary.requestPermissionsAsync();
    console.log('[MusicContext] permission status:', status);
    setPermissionStatus(status);
    if (status === MediaLibrary.PermissionStatus.GRANTED) {
      await loadTracks();
    }
  }, [loadTracks]);

  useEffect(() => {
    (async () => {
      console.log('[MusicContext] checking existing permissions');
      const { status } = await MediaLibrary.getPermissionsAsync();
      console.log('[MusicContext] existing permission status:', status);
      setPermissionStatus(status);
      if (status === MediaLibrary.PermissionStatus.GRANTED) {
        await loadTracks();
      }
    })();
  }, []);

  const loadMoreTracks = useCallback(() => {
    console.log('[MusicContext] loadMoreTracks called, endCursor=', endCursor);
    if (hasMoreTracks && endCursor && !isLoadingTracks) {
      loadTracks(endCursor);
    }
  }, [hasMoreTracks, endCursor, isLoadingTracks, loadTracks]);

  const allTracks = useMemo(() => deviceTracks, [deviceTracks]);

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
    if (allTracks.length === 0) return;
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
    if (allTracks.length === 0) return;
    if (!currentTrack) {
      play(allTracks[allTracks.length - 1]);
      return;
    }
    const idx = allTracks.findIndex((t) => t.id === currentTrack.id);
    const prevIdx = (idx - 1 + allTracks.length) % allTracks.length;
    play(allTracks[prevIdx]);
  }, [currentTrack, allTracks, play]);

  return (
    <MusicContext.Provider
      value={{
        currentTrack,
        isPlaying,
        tracks: deviceTracks,
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
