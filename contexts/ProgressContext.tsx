import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  loadTotalStars,
  saveTotalStars,
  loadPlanetProgress,
  savePlanetProgress,
  loadPurchasedItems,
  savePurchasedItems,
  loadActiveItems,
  saveActiveItems,
  PlanetProgressMap,
} from '@/utils/storage';
import { PLANETS } from '@/constants/planets';

interface ProgressContextType {
  totalStars: number;
  planetProgress: PlanetProgressMap;
  completeExercise: (planetId: string, exerciseId: string, stars: number) => void;
  isExerciseCompleted: (planetId: string, exerciseId: string) => boolean;
  isPlanetCompleted: (planetId: string) => boolean;
  isPlanetUnlocked: (planetId: string) => boolean;
  getPlanetStars: (planetId: string) => number;
  isLoaded: boolean;
  purchasedItems: string[];
  purchaseItem: (itemId: string, cost: number) => boolean;
  isItemPurchased: (itemId: string) => boolean;
  resetProgress: () => void;
  activeBackground: string | null;
  activeFrame: string | null;
  activeStickers: string[];
  setActiveBackground: (id: string | null) => void;
  setActiveFrame: (id: string | null) => void;
  toggleActiveSticker: (id: string) => void;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [totalStars, setTotalStars] = useState(0);
  const [planetProgress, setPlanetProgress] = useState<PlanetProgressMap>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
  const [activeBackground, setActiveBackgroundState] = useState<string | null>(null);
  const [activeFrame, setActiveFrameState] = useState<string | null>(null);
  const [activeStickers, setActiveStickersState] = useState<string[]>([]);

  // Keep refs so the AppState handler always sees the latest values
  const totalStarsRef = useRef(totalStars);
  const planetProgressRef = useRef(planetProgress);
  const purchasedItemsRef = useRef(purchasedItems);
  const activeBackgroundRef = useRef<string | null>(null);
  const activeFrameRef = useRef<string | null>(null);
  const activeStickersRef = useRef<string[]>([]);

  useEffect(() => { totalStarsRef.current = totalStars; }, [totalStars]);
  useEffect(() => { planetProgressRef.current = planetProgress; }, [planetProgress]);
  useEffect(() => { purchasedItemsRef.current = purchasedItems; }, [purchasedItems]);
  useEffect(() => { activeBackgroundRef.current = activeBackground; }, [activeBackground]);
  useEffect(() => { activeFrameRef.current = activeFrame; }, [activeFrame]);
  useEffect(() => { activeStickersRef.current = activeStickers; }, [activeStickers]);

  useEffect(() => {
    async function load() {
      const [stars, progress, purchased, activeItems] = await Promise.all([
        loadTotalStars(),
        loadPlanetProgress(),
        loadPurchasedItems(),
        loadActiveItems(),
      ]);
      setTotalStars(stars);
      setPlanetProgress(progress);
      setPurchasedItems(purchased);
      setActiveBackgroundState(activeItems.background);
      setActiveFrameState(activeItems.frame);
      setActiveStickersState(activeItems.stickers);
      setIsLoaded(true);
    }
    load();
  }, []);

  // Flush progress to storage when app goes to background or becomes inactive
  useEffect(() => {
    const handler = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        console.log(`[ProgressContext] AppState changed to ${nextAppState}, flushing progress to storage`);
        saveTotalStars(totalStarsRef.current);
        savePlanetProgress(planetProgressRef.current);
        savePurchasedItems(purchasedItemsRef.current);
        saveActiveItems({
          background: activeBackgroundRef.current,
          frame: activeFrameRef.current,
          stickers: activeStickersRef.current,
        });
      }
    };
    const subscription = AppState.addEventListener('change', handler);
    return () => {
      subscription.remove();
    };
  }, []);

  const completeExercise = useCallback(
    (planetId: string, exerciseId: string, stars: number) => {
      console.log(`[ProgressContext] completeExercise: planet=${planetId}, exercise=${exerciseId}, stars=${stars}`);
      setPlanetProgress((prev) => {
        const existing = prev[planetId] ?? { completedExercises: [] };
        if (existing.completedExercises.includes(exerciseId)) {
          return prev;
        }
        const updated: PlanetProgressMap = {
          ...prev,
          [planetId]: {
            completedExercises: [...existing.completedExercises, exerciseId],
          },
        };
        savePlanetProgress(updated);
        return updated;
      });
      setTotalStars((prev) => {
        const newTotal = prev + stars;
        saveTotalStars(newTotal);
        return newTotal;
      });
    },
    []
  );

  const isExerciseCompleted = useCallback(
    (planetId: string, exerciseId: string) => {
      return planetProgress[planetId]?.completedExercises.includes(exerciseId) ?? false;
    },
    [planetProgress]
  );

  const isPlanetCompleted = useCallback(
    (planetId: string) => {
      const planet = PLANETS.find((p) => p.id === planetId);
      if (!planet) return false;
      const completed = planetProgress[planetId]?.completedExercises ?? [];
      return planet.exercises.every((e) => completed.includes(e.id));
    },
    [planetProgress]
  );

  const isPlanetUnlocked = useCallback(
    (planetId: string) => {
      const planet = PLANETS.find((p) => p.id === planetId);
      if (!planet) return false;
      if (!planet.unlockAfter) return true;
      return isPlanetCompleted(planet.unlockAfter);
    },
    [isPlanetCompleted]
  );

  const getPlanetStars = useCallback(
    (planetId: string) => {
      const planet = PLANETS.find((p) => p.id === planetId);
      if (!planet) return 0;
      const completed = planetProgress[planetId]?.completedExercises ?? [];
      return completed.length * planet.starsReward;
    },
    [planetProgress]
  );

  const purchaseItem = useCallback(
    (itemId: string, cost: number): boolean => {
      const currentStars = totalStarsRef.current;
      const currentPurchased = purchasedItemsRef.current;

      if (currentStars < cost) {
        console.log(`[ProgressContext] purchaseItem failed: not enough stars (${currentStars} < ${cost})`);
        return false;
      }
      if (currentPurchased.includes(itemId)) {
        console.log(`[ProgressContext] purchaseItem failed: already purchased ${itemId}`);
        return false;
      }

      const newItems = [...currentPurchased, itemId];
      const newTotal = currentStars - cost;

      setPurchasedItems(newItems);
      savePurchasedItems(newItems);
      setTotalStars(newTotal);
      saveTotalStars(newTotal);

      purchasedItemsRef.current = newItems;
      totalStarsRef.current = newTotal;

      console.log(`[ProgressContext] purchased item: ${itemId}, cost=${cost}, remaining stars=${newTotal}`);
      return true;
    },
    []
  );

  const isItemPurchased = useCallback(
    (itemId: string) => purchasedItems.includes(itemId),
    [purchasedItems]
  );

  const setActiveBackground = useCallback((id: string | null) => {
    console.log(`[ProgressContext] setActiveBackground: ${id}`);
    setActiveBackgroundState(id);
    activeBackgroundRef.current = id;
    saveActiveItems({
      background: id,
      frame: activeFrameRef.current,
      stickers: activeStickersRef.current,
    });
  }, []);

  const setActiveFrame = useCallback((id: string | null) => {
    console.log(`[ProgressContext] setActiveFrame: ${id}`);
    setActiveFrameState(id);
    activeFrameRef.current = id;
    saveActiveItems({
      background: activeBackgroundRef.current,
      frame: id,
      stickers: activeStickersRef.current,
    });
  }, []);

  const toggleActiveSticker = useCallback((id: string) => {
    setActiveStickersState((prev) => {
      const next = prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id];
      console.log(`[ProgressContext] toggleActiveSticker: ${id}, active=${!prev.includes(id)}`);
      saveActiveItems({
        background: activeBackgroundRef.current,
        frame: activeFrameRef.current,
        stickers: next,
      });
      return next;
    });
  }, []);

  const resetProgress = useCallback(() => {
    setTotalStars(0);
    setPlanetProgress({});
    setPurchasedItems([]);
    setActiveBackgroundState(null);
    setActiveFrameState(null);
    setActiveStickersState([]);
    saveTotalStars(0);
    savePlanetProgress({});
    savePurchasedItems([]);
    saveActiveItems({ background: null, frame: null, stickers: [] });
    console.log('[ProgressContext] progress reset');
  }, []);

  return (
    <ProgressContext.Provider
      value={{
        totalStars,
        planetProgress,
        completeExercise,
        isExerciseCompleted,
        isPlanetCompleted,
        isPlanetUnlocked,
        getPlanetStars,
        isLoaded,
        purchasedItems,
        purchaseItem,
        isItemPurchased,
        resetProgress,
        activeBackground,
        activeFrame,
        activeStickers,
        setActiveBackground,
        setActiveFrame,
        toggleActiveSticker,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
