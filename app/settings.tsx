import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CosmicBackground } from '@/components/CosmicBackground';
import { COLORS } from '@/constants/SpaceColors';
import { useProgress } from '@/contexts/ProgressContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useMusic } from '@/contexts/MusicContext';
import { ChevronLeft, Type, Globe, RotateCcw, Volume2 } from 'lucide-react-native';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { totalStars, resetProgress } = useProgress();
  const { settings, updateTextSize, updateLanguage } = useSettings();
  const { volume, setVolume } = useMusic();

  const handleResetProgress = () => {
    console.log('[SettingsScreen] reset progress pressed');
    Alert.alert(
      'Сбросить прогресс?',
      `Все ${totalStars} звёзд, пройденные упражнения и купленные предметы будут удалены. Это действие нельзя отменить!`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Сбросить',
          style: 'destructive',
          onPress: () => {
            resetProgress();
            Alert.alert('✅ Готово', 'Прогресс сброшен. Начинаем путешествие заново!', [
              { text: 'OK' },
            ]);
          },
        },
      ]
    );
  };

  const textSizeOptions: { value: 'small' | 'normal' | 'large'; label: string }[] = [
    { value: 'small', label: 'Маленький' },
    { value: 'normal', label: 'Обычный' },
    { value: 'large', label: 'Крупный' },
  ];

  const languageOptions: { value: 'ru' | 'en'; label: string; flag: string }[] = [
    { value: 'ru', label: 'Русский', flag: '🇷🇺' },
    { value: 'en', label: 'English', flag: '🇬🇧' },
  ];

  const volumeSteps = [0, 0.25, 0.5, 0.75, 1.0];
  const volumeLabels = ['0%', '25%', '50%', '75%', '100%'];

  return (
    <CosmicBackground style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Custom header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            console.log('[SettingsScreen] back pressed');
            router.back();
          }}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={COLORS.text} />
          <Text style={styles.backText}>Назад</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Настройки</Text>
        <View style={{ minWidth: 80 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Text size */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Type size={18} color={COLORS.accent} />
            <Text style={styles.sectionTitle}>Размер текста</Text>
          </View>
          <Text style={styles.sectionHint}>Увеличьте текст для детей с нарушениями зрения</Text>
          <View style={styles.optionsRow}>
            {textSizeOptions.map((opt) => {
              const isActive = settings.textSize === opt.value;
              const chipStyle = isActive ? styles.optionChipActive : undefined;
              const textStyle = isActive ? styles.optionChipTextActive : undefined;
              const sizeStyle = opt.value === 'small'
                ? styles.textSmall
                : opt.value === 'large'
                ? styles.textLarge
                : undefined;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.optionChip, chipStyle]}
                  onPress={() => {
                    console.log(`[SettingsScreen] textSize pressed: ${opt.value}`);
                    updateTextSize(opt.value);
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.optionChipText, textStyle, sizeStyle]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Music volume */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Volume2 size={18} color={COLORS.accent} />
            <Text style={styles.sectionTitle}>Громкость музыки</Text>
          </View>
          <View style={styles.optionsRow}>
            {volumeSteps.map((step, i) => {
              const isActive = Math.abs(volume - step) < 0.01;
              const chipStyle = isActive ? styles.optionChipActive : undefined;
              const textStyle = isActive ? styles.optionChipTextActive : undefined;
              return (
                <TouchableOpacity
                  key={step}
                  style={[styles.optionChip, chipStyle]}
                  onPress={() => {
                    console.log(`[SettingsScreen] volume pressed: ${step}`);
                    setVolume(step);
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.optionChipText, textStyle]}>
                    {volumeLabels[i]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Language */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Globe size={18} color={COLORS.accent} />
            <Text style={styles.sectionTitle}>Язык</Text>
          </View>
          <Text style={styles.sectionHint}>Язык интерфейса приложения</Text>
          <View style={styles.optionsRow}>
            {languageOptions.map((opt) => {
              const isActive = settings.language === opt.value;
              const chipStyle = isActive ? styles.optionChipActive : undefined;
              const textStyle = isActive ? styles.optionChipTextActive : undefined;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.optionChip, styles.optionChipWide, chipStyle]}
                  onPress={() => {
                    console.log(`[SettingsScreen] language pressed: ${opt.value}`);
                    updateLanguage(opt.value);
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={styles.optionFlag}>{opt.flag}</Text>
                  <Text style={[styles.optionChipText, textStyle]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Reset progress */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <RotateCcw size={18} color={COLORS.danger} />
            <Text style={[styles.sectionTitle, styles.dangerTitle]}>Сброс прогресса</Text>
          </View>
          <Text style={styles.sectionHint}>
            Удалит все звёзды, пройденные упражнения и купленные предметы. Начнёте путешествие заново.
          </Text>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetProgress}
            activeOpacity={0.75}
          >
            <RotateCcw size={16} color="#fff" />
            <Text style={styles.resetButtonText}>Сбросить прогресс</Text>
          </TouchableOpacity>
        </View>

        {/* App info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>StarSport: Планета Здоровья</Text>
          <Text style={styles.appInfoVersion}>Версия 1.0.0</Text>
        </View>
      </ScrollView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingRight: 8,
    minWidth: 80,
  },
  backText: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.text,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
    color: COLORS.text,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: COLORS.text,
  },
  dangerTitle: {
    color: COLORS.danger,
  },
  sectionHint: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionChipWide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  optionChipActive: {
    backgroundColor: 'rgba(100,160,255,0.2)',
    borderColor: COLORS.accent,
  },
  optionChipText: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.textSecondary,
  },
  optionChipTextActive: {
    color: COLORS.accent,
  },
  textSmall: {
    fontSize: 12,
  },
  textLarge: {
    fontSize: 17,
  },
  optionFlag: {
    fontSize: 16,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.danger,
    borderRadius: 12,
    paddingVertical: 14,
  },
  resetButtonText: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
    color: '#fff',
  },
  appInfo: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  appInfoText: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: COLORS.textSecondary,
  },
  appInfoVersion: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textSecondary,
  },
});
