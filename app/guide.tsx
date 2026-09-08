import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CosmicBackground } from '@/components/CosmicBackground';
import { COLORS } from '@/constants/SpaceColors';

interface GuideSection {
  emoji: string;
  title: string;
  content: React.ReactNode;
}

export default function GuideScreen() {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log('[GuideScreen] mounted');
    Animated.timing(opacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <CosmicBackground style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Руководство',
          presentation: 'modal',
          headerTransparent: true,
          headerTintColor: COLORS.text,
          headerTitleStyle: {
            fontFamily: 'Nunito_700Bold',
            color: COLORS.text,
          },
        }}
      />

      <Animated.ScrollView
        style={{ opacity }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.titleEmoji}>📖</Text>
          <Text style={styles.title}>Руководство пользователя</Text>
        </View>

        {/* Section 1 */}
        <GuideCard emoji="🚀" title="Добро пожаловать!">
          <Text style={styles.bodyText}>
            StarSport: Планета Здоровья — это космическое путешествие для вас и вашего ребёнка! Вместе вы будете путешествовать по планетам Солнечной системы, выполнять упражнения и зарабатывать звёзды.
          </Text>
          <Text style={styles.bodyText}>
            Приложение создано специально для детей с ОВЗ и их родителей. Все упражнения адаптированы и сопровождаются советами для родителей.
          </Text>
        </GuideCard>

        {/* Section 2 */}
        <GuideCard emoji="📋" title="Как начать">
          {[
            { step: '1', text: 'Выберите планету на главном экране' },
            { step: '2', text: 'Нажмите на упражнение в списке' },
            { step: '3', text: 'Прочитайте совет для родителя' },
            { step: '4', text: 'Запустите таймер и выполните упражнение' },
            { step: '5', text: 'Нажмите "Упражнение выполнено" и получите звёзды!' },
          ].map((item) => (
            <View key={item.step} style={styles.stepRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNumber}>{item.step}</Text>
              </View>
              <Text style={styles.stepText}>{item.text}</Text>
            </View>
          ))}
        </GuideCard>

        {/* Section 3 */}
        <GuideCard emoji="🌍" title="Планеты">
          {[
            { emoji: '🌕', name: 'Луна', desc: 'Разминка — начало путешествия' },
            { emoji: '🌍', name: 'Земля', desc: 'Сила — укрепляем мышцы' },
            { emoji: '🔴', name: 'Марс', desc: 'Ловкость — развиваем координацию' },
            { emoji: '🌀', name: 'Юпитер', desc: 'Гибкость — растягиваемся' },
            { emoji: '🌌', name: 'Нептун', desc: 'Дыхание — дыхательные техники' },
            { emoji: '🌟', name: 'Звёздный финал', desc: 'Заминка и награды' },
          ].map((planet) => (
            <View key={planet.name} style={styles.planetRow}>
              <Text style={styles.planetEmoji}>{planet.emoji}</Text>
              <View style={styles.planetInfo}>
                <Text style={styles.planetName}>{planet.name}</Text>
                <Text style={styles.planetDesc}>{planet.desc}</Text>
              </View>
            </View>
          ))}
        </GuideCard>

        {/* Section 4 */}
        <GuideCard emoji="⭐" title="Система звёзд">
          {[
            { planet: '🌕 Луна', stars: '1 звезда за упражнение' },
            { planet: '🌍 Земля и 🔴 Марс', stars: '2 звезды за упражнение' },
            { planet: '🌀 Юпитер и 🌌 Нептун', stars: '3 звезды за упражнение' },
            { planet: '🌟 Звёздный финал', stars: '5 звёзд за упражнение' },
          ].map((item) => (
            <View key={item.planet} style={styles.starsRow}>
              <Text style={styles.starsRowPlanet}>{item.planet}</Text>
              <View style={styles.starsRowBadge}>
                <Text style={styles.starsRowText}>{item.stars}</Text>
              </View>
            </View>
          ))}
        </GuideCard>

        {/* Section 5 */}
        <GuideCard emoji="👨‍👩‍👧" title="Советы для родителей">
          {[
            'Всегда читайте совет перед упражнением',
            'Адаптируйте упражнения под возможности ребёнка',
            'Хвалите за любое усилие — каждый шаг важен',
            'Не торопите — каждый ребёнок в своём темпе',
            'При болях или дискомфорте — остановитесь',
            'Выполняйте упражнения вместе — это веселее!',
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipBullet}>✓</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </GuideCard>

        {/* Section 6 */}
        <GuideCard emoji="🎵" title="Музыка">
          <Text style={styles.bodyText}>
            В приложении есть встроенные космические треки для сопровождения тренировок. Вы также можете добавить свою музыку через раздел "Музыка".
          </Text>
          <Text style={styles.bodyText}>
            Нажмите на мини-плеер внизу экрана, чтобы открыть полный музыкальный плеер. Там можно выбрать трек, добавить свои аудиофайлы и управлять воспроизведением.
          </Text>
        </GuideCard>

        {/* Section 7 */}
        <GuideCard emoji="⚠️" title="Безопасность">
          {[
            'Проконсультируйтесь с врачом перед началом занятий',
            'Упражнения адаптированы, но каждый ребёнок уникален',
            'При любом дискомфорте — немедленно остановитесь',
            'Не выполняйте упражнения при острых болях',
            'Следите за дыханием ребёнка во время занятий',
          ].map((item, i) => (
            <View key={i} style={styles.warningRow}>
              <Text style={styles.warningBullet}>!</Text>
              <Text style={styles.warningText}>{item}</Text>
            </View>
          ))}
        </GuideCard>
      </Animated.ScrollView>
    </CosmicBackground>
  );
}

function GuideCard({
  emoji,
  title,
  children,
}: {
  emoji: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardEmoji}>{emoji}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <View style={styles.cardContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  titleSection: {
    alignItems: 'center',
    gap: 8,
    paddingBottom: 4,
  },
  titleEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Nunito_800ExtraBold',
    color: COLORS.text,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    borderCurve: 'continuous',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    backgroundColor: COLORS.surfaceSecondary,
  },
  cardEmoji: {
    fontSize: 22,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
    color: COLORS.text,
  },
  cardContent: {
    padding: 16,
    gap: 10,
  },
  bodyText: {
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.text,
    lineHeight: 22,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumber: {
    fontSize: 13,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#000',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.text,
    lineHeight: 22,
    paddingTop: 3,
  },
  planetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  planetEmoji: {
    fontSize: 24,
    width: 32,
    textAlign: 'center',
  },
  planetInfo: {
    flex: 1,
    gap: 2,
  },
  planetName: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
    color: COLORS.text,
  },
  planetDesc: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textSecondary,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  starsRowPlanet: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.text,
    flex: 1,
  },
  starsRowBadge: {
    backgroundColor: COLORS.primaryMuted,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  starsRowText: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: COLORS.primary,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  tipBullet: {
    fontSize: 14,
    color: COLORS.success,
    fontFamily: 'Nunito_700Bold',
    lineHeight: 22,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.text,
    lineHeight: 22,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  warningBullet: {
    fontSize: 14,
    color: COLORS.warning,
    fontFamily: 'Nunito_800ExtraBold',
    lineHeight: 22,
    width: 16,
    textAlign: 'center',
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.text,
    lineHeight: 22,
  },
});
