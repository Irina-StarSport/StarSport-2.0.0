import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CosmicBackground } from '@/components/CosmicBackground';
import { PlanetCard } from '@/components/PlanetCard';
import { StarCounter } from '@/components/StarCounter';
import { MusicMiniPlayer } from '@/components/MusicMiniPlayer';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { COLORS } from '@/constants/SpaceColors';
import { PLANETS } from '@/constants/planets';
import { useProgress } from '@/contexts/ProgressContext';
import { useSettings } from '@/contexts/SettingsContext';
import { t } from '@/constants/translations';
import { BookOpen, ShoppingBag } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { totalStars, planetProgress, isPlanetUnlocked, getPlanetStars, activeBackground } = useProgress();
  const { settings } = useSettings();
  const lang = settings.language;

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePlanetPress = (planetId: string) => {
    console.log(`[HomeScreen] planet pressed: ${planetId}`);
    router.push(`/planet/${planetId}`);
  };

  const handleStarsPress = () => {
    console.log('[HomeScreen] stars counter pressed → achievements');
    router.push('/achievements');
  };

  const handleGuidePress = () => {
    console.log('[HomeScreen] guide button pressed');
    router.push('/guide');
  };

  const handleShopPress = () => {
    console.log('[HomeScreen] shop button pressed');
    router.push('/shop');
  };

  const bgTint = activeBackground === 'bg-nebula' ? '#3d0066'
    : activeBackground === 'bg-galaxy' ? '#000066'
    : activeBackground === 'bg-aurora' ? '#006666'
    : undefined;

  return (
    <CosmicBackground style={styles.container} tintColor={bgTint}>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          { paddingTop: insets.top + 12 },
          { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] },
        ]}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.appTitle}>StarSport</Text>
          <Text style={styles.appSubtitle}>{t(lang, 'appSubtitle')}</Text>
        </View>
        <View style={styles.headerRight}>
          <AnimatedPressable
            onPress={handleStarsPress}
            accessibilityLabel={`Мои достижения. Звёзд: ${totalStars}`}
            accessibilityRole="button"
          >
            <View style={styles.starsButton}>
              <StarCounter count={totalStars} size="medium" />
            </View>
          </AnimatedPressable>
          <AnimatedPressable
            onPress={handleShopPress}
            accessibilityLabel="Магазин наград"
            accessibilityRole="button"
          >
            <View style={styles.iconButton}>
              <ShoppingBag size={22} color={COLORS.text} />
            </View>
          </AnimatedPressable>
          <AnimatedPressable
            onPress={handleGuidePress}
            accessibilityLabel="Руководство пользователя"
            accessibilityRole="button"
          >
            <View style={styles.iconButton}>
              <BookOpen size={22} color={COLORS.text} />
            </View>
          </AnimatedPressable>
        </View>
      </Animated.View>

      {/* Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>{t(lang, 'choosePlanet')}</Text>
        <Text style={styles.sectionSubtitle}>
          {t(lang, 'choosePlanetSubtitle')}
        </Text>

        {PLANETS.map((planet, index) => {
          const completed = planetProgress[planet.id]?.completedExercises.length ?? 0;
          const locked = !isPlanetUnlocked(planet.id);
          const stars = getPlanetStars(planet.id);
          return (
            <PlanetCard
              key={planet.id}
              planet={planet}
              completedCount={completed}
              isLocked={locked}
              starsEarned={stars}
              onPress={() => handlePlanetPress(planet.id)}
              index={index}
            />
          );
        })}
      </ScrollView>

      {/* Music mini player */}
      <View style={{ paddingBottom: insets.bottom }}>
        <MusicMiniPlayer />
      </View>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerLeft: {
    gap: 2,
  },
  appTitle: {
    fontSize: 28,
    fontFamily: 'Nunito_800ExtraBold',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.textSecondary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starsButton: {
    backgroundColor: COLORS.primaryMuted,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Nunito_800ExtraBold',
    color: COLORS.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
});
