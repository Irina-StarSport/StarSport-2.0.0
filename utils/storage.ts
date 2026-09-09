import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TOTAL_STARS: 'starsport_total_stars',
  PLANET_PROGRESS: 'starsport_planet_progress',
  CUSTOM_TRACKS: 'starsport_custom_tracks',
};

export interface PlanetProgressData {
  completedExercises: string[];
}

export type PlanetProgressMap = Record<string, PlanetProgressData>;

export async function loadTotalStars(): Promise<number> {
  try {
    const val = await AsyncStorage.getItem(KEYS.TOTAL_STARS);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

export async function saveTotalStars(stars: number): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.TOTAL_STARS, String(stars));
  } catch {
    // ignore
  }
}

export async function loadPlanetProgress(): Promise<PlanetProgressMap> {
  try {
    const val = await AsyncStorage.getItem(KEYS.PLANET_PROGRESS);
    return val ? JSON.parse(val) : {};
  } catch {
    return {};
  }
}

export async function savePlanetProgress(progress: PlanetProgressMap): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.PLANET_PROGRESS, JSON.stringify(progress));
  } catch {
    // ignore
  }
}

export interface CustomTrack {
  id: string;
  name: string;
  uri: string;
}

export async function loadCustomTracks(): Promise<CustomTrack[]> {
  try {
    const val = await AsyncStorage.getItem(KEYS.CUSTOM_TRACKS);
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
}

export async function saveCustomTracks(tracks: CustomTrack[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.CUSTOM_TRACKS, JSON.stringify(tracks));
  } catch {
    // ignore
  }
}

const SHOP_KEY = 'starsport_purchased_items';

export async function loadPurchasedItems(): Promise<string[]> {
  try {
    const val = await AsyncStorage.getItem(SHOP_KEY);
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
}

export async function savePurchasedItems(items: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(SHOP_KEY, JSON.stringify(items));
  } catch {}
}
