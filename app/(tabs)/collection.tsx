import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CosmicBackground } from '@/components/CosmicBackground';
import { COLORS } from '@/constants/SpaceColors';
import { SHOP_ITEMS } from '@/constants/shopItems';
import { useProgress } from '@/contexts/ProgressContext';
import { useSettings } from '@/contexts/SettingsContext';

type CollectionTab = 'sticker' | 'frame' | 'background';

const TABS: { id: CollectionTab; label: string; emoji: string }[] = [
  { id: 'sticker', label: 'Стикеры', emoji: '🎨' },
  { id: 'frame', label: 'Рамки', emoji: '🖼️' },
  { id: 'background', label: 'Фоны', emoji: '🌌' },
];

const BG_THEMES: Record<string, { colors: string[]; label: string }> = {
  'bg-nebula': { colors: ['#1a0033', '#3d0066', '#660099'], label: 'Туманность' },
  'bg-galaxy': { colors: ['#000033', '#000066', '#000099'], label: 'Млечный путь' },
  'bg-aurora': { colors: ['#003333', '#006666', '#009999'], label: 'Северное сияние' },
};

const FRAME_STYLES: Record<string, { borderColor: string; borderWidth: number; label: string }> = {
  'frame-gold': { borderColor: '#FFD700', borderWidth: 3, label: 'Золотая' },
  'frame-space': { borderColor: '#9C27B0', borderWidth: 3, label: 'Космическая' },
  'frame-fire': { borderColor: '#FF5722', borderWidth: 3, label: 'Огненная' },
};

export default function CollectionScreen() {
  const insets = useSafeAreaInsets();
  const {
    purchasedItems,
    activeBackground,
    activeFrame,
    activeStickers,
    setActiveBackground,
    setActiveFrame,
    toggleActiveSticker,
  } = useProgress();
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState<CollectionTab>('sticker');

  const itemsInCategory = SHOP_ITEMS.filter(
    (item) => item.category === activeTab && purchasedItems.includes(item.id)
  );

  const totalPurchased = purchasedItems.length;

  const handleApplyBackground = (itemId: string) => {
    if (activeBackground === itemId) {
      console.log(`[Collection] background removed: ${itemId}`);
      setActiveBackground(null);
    } else {
      console.log(`[Collection] background applied: ${itemId}`);
      setActiveBackground(itemId);
      Alert.alert('✅ Фон применён!', 'Новый фон будет виден на главном экране', [{ text: 'OK' }]);
    }
  };

  const handleApplyFrame = (itemId: string) => {
    if (activeFrame === itemId) {
      console.log(`[Collection] frame removed: ${itemId}`);
      setActiveFrame(null);
    } else {
      console.log(`[Collection] frame applied: ${itemId}`);
      setActiveFrame(itemId);
      Alert.alert('✅ Рамка применена!', 'Рамка будет видна вокруг счётчика звёзд', [{ text: 'OK' }]);
    }
  };

  const handleToggleSticker = (itemId: string) => {
    const isCurrentlyActive = activeStickers.includes(itemId);
    if (!isCurrentlyActive && activeStickers.length >= 2) {
      Alert.alert(
        'Максимум 2 стикера',
        'Сними один из активных стикеров, чтобы добавить новый',
        [{ text: 'OK' }]
      );
      return;
    }
    toggleActiveSticker(itemId);
    console.log(`[Collection] sticker toggled: ${itemId}`);
  };

  const handleTabPress = (tabId: CollectionTab) => {
    console.log(`[Collection] tab pressed: ${tabId}`);
    setActiveTab(tabId);
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🛍️</Text>
      <Text style={styles.emptyTitle}>Здесь пока пусто</Text>
      <Text style={styles.emptyHint}>
        Купи предметы в магазине наград, чтобы они появились здесь
      </Text>
    </View>
  );

  const renderStickers = () => (
    <View style={styles.grid}>
      {itemsInCategory.map((item) => {
        const isActive = activeStickers.includes(item.id);
        const emojiCircleBg = item.color + '25';
        const statusText = isActive ? '✓ Активен' : 'Применить';
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.itemCard, isActive && styles.itemCardActive]}
            onPress={() => handleToggleSticker(item.id)}
            activeOpacity={0.8}
          >
            <View style={[styles.emojiCircle, { backgroundColor: emojiCircleBg }]}>
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
            </View>
            <Text style={styles.itemName}>{item.name}</Text>
            <View style={[styles.statusBadge, isActive ? styles.statusActive : styles.statusInactive]}>
              <Text style={[styles.statusText, isActive ? styles.statusTextActive : styles.statusTextInactive]}>
                {statusText}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderFrames = () => (
    <View style={styles.listColumn}>
      {itemsInCategory.map((item) => {
        const isActive = activeFrame === item.id;
        const frameStyle = FRAME_STYLES[item.id];
        const statusText = isActive ? '✓ Активна' : 'Надеть';
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.listCard, isActive && styles.itemCardActive]}
            onPress={() => handleApplyFrame(item.id)}
            activeOpacity={0.8}
          >
            <View style={styles.listCardLeft}>
              <View style={[
                styles.framePreview,
                frameStyle ? { borderColor: frameStyle.borderColor, borderWidth: frameStyle.borderWidth } : undefined,
              ]}>
                <Text style={styles.framePreviewStar}>⭐</Text>
              </View>
              <View>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDesc}>{item.description}</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, isActive ? styles.statusActive : styles.statusInactive]}>
              <Text style={[styles.statusText, isActive ? styles.statusTextActive : styles.statusTextInactive]}>
                {statusText}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderBackgrounds = () => (
    <View style={styles.listColumn}>
      {itemsInCategory.map((item) => {
        const isActive = activeBackground === item.id;
        const theme = BG_THEMES[item.id];
        const statusText = isActive ? '✓ Активен' : 'Поставить';
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.listCard, isActive && styles.itemCardActive]}
            onPress={() => handleApplyBackground(item.id)}
            activeOpacity={0.8}
          >
            <View style={styles.listCardLeft}>
              <View style={styles.bgPreview}>
                {theme && theme.colors.map((color, i) => (
                  <View key={i} style={[styles.bgStripe, { backgroundColor: color }]} />
                ))}
                <Text style={styles.bgPreviewEmoji}>{item.emoji}</Text>
              </View>
              <View>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDesc}>{item.description}</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, isActive ? styles.statusActive : styles.statusInactive]}>
              <Text style={[styles.statusText, isActive ? styles.statusTextActive : styles.statusTextInactive]}>
                {statusText}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const stickerCount = SHOP_ITEMS.filter((item) => item.category === 'sticker' && purchasedItems.includes(item.id)).length;
  const frameCount = SHOP_ITEMS.filter((item) => item.category === 'frame' && purchasedItems.includes(item.id)).length;
  const bgCount = SHOP_ITEMS.filter((item) => item.category === 'background' && purchasedItems.includes(item.id)).length;
  const tabCounts: Record<CollectionTab, number> = { sticker: stickerCount, frame: frameCount, background: bgCount };

  return (
    <CosmicBackground style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Моя коллекция</Text>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{totalPurchased}</Text>
            <Text style={styles.headerBadgeLabel}> предметов</Text>
          </View>
        </View>

        {/* Active stickers display */}
        {activeStickers.length > 0 && (
          <View style={styles.activeStickersCard}>
            <Text style={styles.activeStickersLabel}>Активные стикеры</Text>
            <View style={styles.activeStickersRow}>
              {activeStickers.map((id) => {
                const item = SHOP_ITEMS.find((s) => s.id === id);
                return item ? (
                  <Text key={id} style={styles.activeStickerEmoji}>{item.emoji}</Text>
                ) : null;
              })}
            </View>
          </View>
        )}

        {/* Category tabs */}
        <View style={styles.tabsRow}>
          {TABS.map((tab) => {
            const count = tabCounts[tab.id];
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => handleTabPress(tab.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.tabEmoji}>{tab.emoji}</Text>
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
                {count > 0 && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Content */}
        {itemsInCategory.length === 0
          ? renderEmpty()
          : activeTab === 'sticker'
          ? renderStickers()
          : activeTab === 'frame'
          ? renderFrames()
          : renderBackgrounds()}
      </ScrollView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Nunito_800ExtraBold',
    color: COLORS.text,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.15)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  headerBadgeText: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: '#FFD700',
  },
  headerBadgeLabel: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    color: '#FFD700',
  },
  activeStickersCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
    padding: 14,
    gap: 8,
  },
  activeStickersLabel: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeStickersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activeStickerEmoji: {
    fontSize: 28,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
    position: 'relative',
  },
  tabActive: {
    backgroundColor: 'rgba(100,160,255,0.15)',
    borderColor: COLORS.accent,
  },
  tabEmoji: { fontSize: 20 },
  tabLabel: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  tabLabelActive: { color: COLORS.accent },
  tabBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeText: {
    fontSize: 9,
    fontFamily: 'Nunito_700Bold',
    color: '#fff',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  itemCard: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    alignItems: 'center',
    gap: 8,
  },
  itemCardActive: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(100,160,255,0.08)',
  },
  emojiCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemEmoji: { fontSize: 28 },
  itemName: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  itemDesc: {
    fontSize: 11,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textSecondary,
    lineHeight: 15,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusActive: {
    backgroundColor: 'rgba(100,160,255,0.2)',
    borderColor: COLORS.accent,
  },
  statusInactive: {
    backgroundColor: COLORS.surfaceSecondary,
    borderColor: COLORS.border,
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
  },
  statusTextActive: { color: COLORS.accent },
  statusTextInactive: { color: COLORS.textSecondary },
  listColumn: {
    gap: 10,
  },
  listCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  framePreview: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceSecondary,
  },
  framePreviewStar: { fontSize: 20 },
  bgPreview: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgStripe: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 16,
  },
  bgPreviewEmoji: {
    fontSize: 20,
    zIndex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    color: COLORS.text,
  },
  emptyHint: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 24,
  },
});
