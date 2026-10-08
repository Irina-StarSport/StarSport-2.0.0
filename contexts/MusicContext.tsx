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
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  addDeviceTracks: (assets: DocumentPicker.DocumentPickerAsset[]) => Promise<void>;
  removeTrack: (trackId: string) => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

const DEVICE_TRACKS_KEY = 'starsport_device_tracks';

// ─── AudioEngine ────────────────────────────────────────────────────────────

interface AudioEngineProps {
  uri: string | null;
  isPlaying: boolean;
  volume: number;
}

function AudioEngine({ uri, isPlaying, volume }: AudioEngineProps) {
  const player = useAudioPlayer(null);
  const replacingRef = React.useRef(false);

  // Single effect: handles both URI changes and play/pause state
  useEffect(() => {
    console.log('[AudioEngine] uri/isPlaying changed — uri:', uri, 'isPlaying:', isPlaying);
    if (!uri) {
      try { player.pause(); } catch (e) {}
      return;
    }
    let cancelled = false;
    replacingRef.current = true;
    (async () => {
      try {
        // Always pause first to stop the old track immediately
        try { player.pause(); } catch (e) {}
        await player.replace({ uri });
        if (cancelled) return;
        player.loop = true;
        if (isPlaying) {
          console.log('[AudioEngine] replace complete — calling player.play()');
          player.play();
        }
      } catch (e) {
        console.log('[AudioEngine] error:', e);
      } finally {
        if (!cancelled) replacingRef.current = false;
      }
    })();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uri, isPlaying]);

  // Volume sync
  useEffect(() => {
    try {
      player.volume = volume;
      console.log('[AudioEngine] volume set to', volume);
    } catch (e) {}
  }, [volume, player]);

  // Unmount cleanup
  useEffect(() => {
    return () => {
      try { player.pause(); } catch (e) {}
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function blobUriToDataUri(blobUri: string): Promise<string> {
  const response = await fetch(blobUri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

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
  // MediaLibrary tracks — reloaded from system on each launch
  const [mediaLibraryTracks, setMediaLibraryTracks] = useState<Track[]>([]);
  // DocumentPicker tracks — persisted to AsyncStorage
  const [pickerTracks, setPickerTracks] = useState<Track[]>([]);
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
      setMediaLibraryTracks((prev) => (after ? [...prev, ...newTracks] : newTracks));
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

  // On startup: load persisted picker tracks, then check MediaLibrary permission
  useEffect(() => {
    (async () => {
      try {
        // Load persisted DocumentPicker tracks
        try {
          const saved = await AsyncStorage.getItem(DEVICE_TRACKS_KEY);
          if (saved) {
            const parsed: Track[] = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              const valid = parsed.filter((t: Track) => t.uri && !t.uri.startsWith('blob:'));
              console.log(`[MusicContext] restored ${valid.length} picker track(s) from AsyncStorage (filtered ${parsed.length - valid.length} stale blob: URI(s))`);
              if (valid.length > 0) {
                setPickerTracks(valid);
              }
            }
          }
        } catch (e) {
          console.log('[MusicContext] failed to load saved tracks:', e);
        }
        // Existing permission check
        console.log('[MusicContext] checking existing permissions');
        const { status } = await MediaLibrary.getPermissionsAsync();
        console.log('[MusicContext] existing permission status:', status);
        setPermissionStatus(status);
        if (status === MediaLibrary.PermissionStatus.GRANTED) {
          await loadTracks();
        }
      } catch (e) {
        console.log('[MusicContext] startup error (non-fatal):', e);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist pickerTracks to AsyncStorage whenever they change
  useEffect(() => {
    AsyncStorage.setItem(DEVICE_TRACKS_KEY, JSON.stringify(pickerTracks)).catch((e) => {
      console.log('[MusicContext] failed to save tracks:', e);
    });
  }, [pickerTracks]);

  const addDeviceTracks = useCallback(async (assets: DocumentPicker.DocumentPickerAsset[]) => {
    console.log(`[MusicContext] addDeviceTracks called with ${assets.length} asset(s)`);
    const newTracks: Track[] = await Promise.all(assets.map(async (asset) => {
      let uri = asset.uri;
      try {
        if (uri && uri.startsWith('blob:')) {
          console.log('[MusicContext] converting blob: URI to data: URI for', asset.name ?? asset.uri);
          uri = await blobUriToDataUri(uri);
          console.log('[MusicContext] blob: URI converted successfully for', asset.name ?? asset.uri);
        }
      } catch (e) {
        console.log('[MusicContext] failed to convert blob URI:', e);
      }
      return {
        id: asset.uri, // keep original uri as id for dedup
        name: (asset.name ?? asset.uri).replace(/\.[^/.]+$/, ''),
        uri,
        isPreset: false,
      };
    }));
    setPickerTracks((prev) => {
      const existingIds = new Set(prev.map((t) => t.id));
      const unique = newTracks.filter((t) => !existingIds.has(t.id));
      console.log(`[MusicContext] addDeviceTracks: ${unique.length} new unique track(s) appended`);
      return [...prev, ...unique];
    });
  }, []);

  const removeTrack = useCallback((trackId: string) => {
    console.log(`[MusicContext] removeTrack: ${trackId}`);
    setPickerTracks((prev) => prev.filter((t) => t.id !== trackId));
    setCurrentTrack((prev) => {
      if (prev?.id === trackId) {
        setIsPlaying(false);
        return null;
      }
      return prev;
    });
  }, []);

  const loadMoreTracks = useCallback(() => {
    console.log('[MusicContext] loadMoreTracks called, endCursor=', endCursor);
    if (hasMoreTracks && endCursor && !isLoadingTracks) {
      loadTracks(endCursor);
    }
  }, [hasMoreTracks, endCursor, isLoadingTracks, loadTracks]);

  // Combined list: picker tracks first, then MediaLibrary tracks
  const allTracks = useMemo(
    () => [...pickerTracks, ...mediaLibraryTracks],
    [pickerTracks, mediaLibraryTracks],
  );

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
        tracks: allTracks,
        deviceTracks: allTracks,
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
        addDeviceTracks,
        removeTrack,
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
