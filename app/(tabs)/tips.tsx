import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CosmicBackground } from '@/components/CosmicBackground';
import { COLORS } from '@/constants/SpaceColors';

interface TipCategory {
  id: string;
  icon: string;
  title: string;
  sections: TipSection[];
}

interface TipSection {
  header?: string;
  items: string[];
}

const TIP_CATEGORIES: TipCategory[] = [
  {
    id: 'psychologist',
    icon: '🧠',
    title: 'Советы психолога',
    sections: [
      {
        header: 'Как создать безопасную атмосферу:',
        items: [
          'Никогда не сравнивайте ребёнка с другими детьми — только с его собственными прошлыми результатами',
          'Хвалите усилие, а не результат: "Ты так старался!" важнее, чем "Ты сделал правильно!"',
          'Если ребёнок отказывается — не настаивайте. Предложите попробовать только одно упражнение',
          'Создайте ритуал начала тренировки: одна и та же песня, одно и то же место — это снижает тревогу',
          'После тренировки обсудите: "Что тебе понравилось больше всего?"',
        ],
      },
      {
        header: 'Мотивация и эмоции:',
        items: [
          'Дети с ОВЗ часто испытывают фрустрацию от неудач — нормализуйте это: "Это сложно, и это нормально"',
          'Используйте систему звёзд как инструмент радости, а не давления',
          'Если ребёнок плачет или злится — сделайте паузу, обнимите, вернитесь позже',
          'Замечайте маленькие победы: "Сегодня ты держал равновесие на 2 секунды дольше!"',
        ],
      },
    ],
  },
  {
    id: 'safety',
    icon: '💪',
    title: 'Физическая безопасность',
    sections: [
      {
        items: [
          'Всегда разогревайтесь перед тренировкой (планета Венера — разминка)',
          'При ДЦП: проконсультируйтесь с реабилитологом о допустимых нагрузках',
          'Никогда не делайте упражнения через боль — дискомфорт допустим, боль — нет',
          'Держите воду рядом — дети с ОВЗ быстрее перегреваются',
          'После тренировки обязательно делайте заминку (планета Звёздный финал)',
          'При спастичности мышц: начинайте с пассивных движений, постепенно переходите к активным',
        ],
      },
    ],
  },
  {
    id: 'vision',
    icon: '👁️',
    title: 'Для слабовидящих детей',
    sections: [
      {
        items: [
          'Описывайте каждое движение словами: "Поднимаем правую руку вверх, как будто тянемся к потолку"',
          'Используйте тактильные подсказки — направляйте руки и ноги ребёнка',
          'Яркое освещение в комнате помогает детям с остаточным зрением',
          'Называйте части тела, которых касаетесь, перед прикосновением',
          'Создайте постоянное место для тренировок — ребёнок будет ориентироваться в пространстве',
        ],
      },
    ],
  },
  {
    id: 'hearing',
    icon: '👂',
    title: 'Для слабослышащих детей',
    sections: [
      {
        items: [
          'Всегда находитесь в поле зрения ребёнка',
          'Используйте карточки с картинками упражнений',
          'Показывайте счёт на пальцах',
          'Преувеличенная мимика и жесты помогают передать эмоции и инструкции',
          'Вибрация от музыки через пол или поверхность — ребёнок может её чувствовать',
        ],
      },
    ],
  },
  {
    id: 'wheelchair',
    icon: '♿',
    title: 'Для детей в коляске',
    sections: [
      {
        items: [
          'Убедитесь, что коляска зафиксирована перед началом упражнений',
          'Большинство упражнений адаптированы для выполнения сидя — читайте раздел "Адаптации"',
          'Упражнения для рук и корпуса особенно важны для укрепления мышц',
          'Следите за осанкой — правильное положение в коляске влияет на эффективность упражнений',
          'Делайте перерывы каждые 15-20 минут для смены положения тела',
        ],
      },
    ],
  },
  {
    id: 'fun',
    icon: '🌟',
    title: 'Как сделать тренировку весёлой',
    sections: [
      {
        items: [
          'Придумайте семейный ритуал: особый танец победы после каждой планеты',
          'Фотографируйте прогресс — дети любят видеть себя в движении',
          'Пусть ребёнок сам выбирает порядок упражнений внутри планеты (если возможно)',
          'Играйте роли: вы — командир корабля, ребёнок — космонавт',
          'Отмечайте каждую пройденную планету на бумажной карте на стене',
        ],
      },
    ],
  },
  {
    id: 'schedule',
    icon: '📅',
    title: 'Режим и регулярность',
    sections: [
      {
        items: [
          'Оптимальная частота: 3-4 раза в неделю по 20-30 минут',
          'Лучшее время: утром через 1-2 часа после пробуждения или во второй половине дня',
          'Не тренируйтесь сразу после еды — подождите 1-1.5 часа',
          'Создайте расписание и придерживайтесь его — предсказуемость важна для детей с ОВЗ',
          'В дни плохого самочувствия — замените тренировку на дыхательные упражнения (планета Нептун)',
        ],
      },
    ],
  },
];

function AccordionCard({ category }: { category: TipCategory }) {
  const [expanded, setExpanded] = useState(false);
  const animHeight = useRef(new Animated.Value(0)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;
  const chevronRotation = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    const toValue = expanded ? 0 : 1;
    console.log(`[Tips] accordion toggled: category=${category.id}, expanding=${!expanded}`);
    Animated.parallel([
      Animated.timing(animHeight, {
        toValue,
        duration: 280,
        useNativeDriver: false,
      }),
      Animated.timing(animOpacity, {
        toValue,
        duration: 220,
        useNativeDriver: false,
      }),
      Animated.timing(chevronRotation, {
        toValue,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
    setExpanded(!expanded);
  };

  const chevronStyle = {
    transform: [
      {
        rotate: chevronRotation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  };

  const maxHeight = animHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 800],
  });

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={toggle}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={`${category.title}, ${expanded ? 'свернуть' : 'развернуть'}`}
      >
        <View style={styles.iconWrapper}>
          <Text style={styles.categoryIcon}>{category.icon}</Text>
        </View>
        <Text style={styles.categoryTitle}>{category.title}</Text>
        <Animated.Text style={[styles.chevron, chevronStyle]}>▼</Animated.Text>
      </TouchableOpacity>

      <Animated.View style={[styles.expandable, { maxHeight, opacity: animOpacity }]}>
        <View style={styles.divider} />
        <View style={styles.contentPadding}>
          {category.sections.map((section, sIdx) => (
            <View key={sIdx} style={sIdx > 0 ? styles.sectionGap : undefined}>
              {section.header ? (
                <Text style={styles.sectionHeader}>{section.header}</Text>
              ) : null}
              {section.items.map((item, iIdx) => (
                <View key={iIdx} style={styles.tipRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.tipText}>{item}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

export default function TipsScreen() {
  return (
    <CosmicBackground>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Советы для родителей</Text>
            <Text style={styles.headerSubtitle}>Как помочь ребёнку в тренировке</Text>
          </View>

          {/* Tip cards */}
          {TIP_CATEGORIES.map((category) => (
            <AccordionCard key={category.id} category={category} />
          ))}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  header: {
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: 'Nunito_800ExtraBold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
    color: COLORS.text,
  },
  chevron: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  expandable: {
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginHorizontal: 16,
  },
  contentPadding: {
    padding: 16,
    paddingTop: 12,
  },
  sectionGap: {
    marginTop: 12,
  },
  sectionHeader: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  tipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  bullet: {
    fontSize: 14,
    color: COLORS.primary,
    fontFamily: 'Nunito_700Bold',
    lineHeight: 22,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  bottomSpacer: {
    height: 20,
  },
});
