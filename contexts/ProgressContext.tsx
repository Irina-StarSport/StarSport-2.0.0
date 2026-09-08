import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  loadTotalStars,
  saveTotalStars,
  loadPlanetProgress,
  savePlanetProgress,
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
}

const ProgressContext = createContext<ProgressContextType | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [totalStars, setTotalStars] = useState(0);
  const [planetProgress, setPlanetProgress] = useState<PlanetProgressMap>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const [stars, progress] = await Promise.all([
        loadTotalStars(),
        loadPlanetProgress(),
      ]);
      setTotalStars(stars);
      setPlanetProgress(progress);
      setIsLoaded(true);
    }
    load();
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
