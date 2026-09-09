import React, { useState } from 'react';
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
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { StarCounter } from '@/components/StarCounter';
import { COLORS } from '@/constants/SpaceColors';
import { SHOP_ITEMS, ShopItemCategory, ShopItem } from '@/constants/shopItems';
import { useProgress } from '@/contexts/ProgressContext';
import { ChevronLeft } from 'lucide-react-native';

const CATEGORIES: { id: ShopItemCategory | 'all'; label: string; emoji: string }[] = [
  { id: 'all', label: 'Все', emoji: '🛍️' },
  { id: 'sticker', label: 'Стикеры', emoji: '🎨' },
  { id: 'frame', label: 'Рамки', emoji: '🖼️' },
  { id: 'background', label: 'Фоны', emoji: '🌌' },
];

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { totalStars, purchaseItem, isItemPurchased } = useProgress();
  const [activeCategory, setActiveCategory] = useState<ShopItemCategory | 'all'>('all');

  const filteredItems = activeCategory === 'all'
    ? SHOP_ITEMS
    : SHOP_ITEMS.filter((item) => item.category === activeCategory);

  const rows = chunkArray(filteredItems, 2);

  const handlePurchase = (itemId: string, cost: number, name: string) => {
    console.log(`[ShopScreen] purchase pressed: itemId=${itemId}, cost=${cost}`);
    if (isItemPurchased(itemId)) return;
    if (totalStars < cost) {
      Alert.alert(
        'Недостаточно звёзд ⭐',
        `Для покупки "${name}" нужно ${cost} звёзд.\nУ тебя сейчас ${totalStars} звёзд.\nВыполняй упражнения, чтобы заработать больше!`,
        [{ text: 'Понятно', style: 'default' }]
      );
      return;
    }
    const remainingStars = totalStars - cost;
    Alert.alert(
      `Купить "${name}"?`,
      `Стоимость: ${cost} ⭐\nОстаток после покупки: ${remainingStars} ⭐`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Купить!',
          onPress: () => {
            console.log(`[ShopScreen] confirmed purchase: itemId=${itemId}`);
            const success = purchaseItem(itemId, cost);
            if (success) {
              Alert.alert('🎉 Куплено!', `"${name}" добавлен в твою коллекцию!`, [
                { text: 'Ура!', style: 'default' },
              ]);
            }
          },
        },
      ]
    );
  };

  const handleCategoryPress = (catId: ShopItemCategory | 'all') => {
    console.log(`[ShopScreen] category pressed: ${catId}`);
    setActiveCategory(catId);
  };

  const renderItem = (item: ShopItem) => {
    const purchased = isItemPurchased(item.id);
    const canAfford = totalStars >= item.cost;
    const emojiCircleStyle = { backgroundColor: item.color + '20' };
    const buyButtonStyle = canAfford ? styles.buyButtonAffordable : styles.buyButtonLocked;
    const buyButtonLabel = canAfford ? `Купить ⭐ ${item.cost}` : `⭐ ${item.cost}`;
    return (
      <View key={item.id} style={styles.itemCard}>
        {purchased && (
          <View style={styles.purchasedBadge}>
            <Text style={styles.purchasedBadgeText}>✓</Text>
          </View>
        )}
        <View style={[styles.itemEmojiCircle, emojiCircleStyle]}>
          <Text style={styles.itemEmoji}>{item.emoji}</Text>
        </View>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
        {purchased ? (
          <View style={styles.ownedBadge}>
            <Text style={styles.ownedText}>✓ В коллекции</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.buyButton, buyButtonStyle]}
            onPress={() => handlePurchase(item.id, item.cost, item.name)}
            activeOpacity={0.75}
          >
            <Text style={[styles.buyButtonText, !canAfford && styles.buyButtonTextLocked]}>
              {buyButtonLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <CosmicBackground style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Custom header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            console.log('[ShopScreen] back pressed');
            router.back();
          }}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={COLORS.text} />
          <Text style={styles.backText}>Назад</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Магазин наград</Text>
        <View style={styles.headerRight}>
          <StarCounter count={totalStars} size="small" />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Твои звёзды</Text>
          <StarCounter count={totalStars} size="large" />
          <Text style={styles.balanceHint}>Выполняй упражнения, чтобы зарабатывать звёзды!</Text>
        </View>

        {/* Category filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <AnimatedPressable
                key={cat.id}
                onPress={() => handleCategoryPress(cat.id)}
                accessibilityLabel={cat.label}
                accessibilityRole="button"
              >
                <View style={[styles.categoryChip, isActive && styles.categoryChipActive]}>
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                    {cat.label}
                  </Text>
                </View>
              </AnimatedPressable>
            );
          })}
        </ScrollView>

        {/* Items in rows of 2 */}
        <View style={styles.grid}>
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((item) => renderItem(item))}
              {row.length === 1 && <View style={styles.itemPlaceholder} />}
            </View>
          ))}
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
    gap: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingRight: 8,
  },
  backText: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.text,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Nunito_800ExtraBold',
    color: COLORS.text,
    textAlign: 'center',
  },
  headerRight: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 20,
  },
  balanceCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  balanceLabel: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceHint: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  categoriesRow: {
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: 'rgba(255,215,0,0.15)',
    borderColor: '#FFD700',
  },
  categoryEmoji: { fontSize: 16 },
  categoryLabel: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.textSecondary,
  },
  categoryLabelActive: { color: '#FFD700' },
  grid: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  itemCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  itemPlaceholder: {
    flex: 1,
  },
  purchasedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  purchasedBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Nunito_700Bold',
  },
  itemEmojiCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemEmoji: { fontSize: 32 },
  itemName: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  itemDescription: {
    fontSize: 11,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 15,
  },
  buyButton: {
    width: '100%',
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buyButtonAffordable: {
    backgroundColor: 'rgba(255,215,0,0.25)',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  buyButtonLocked: {
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  buyButtonText: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: '#FFD700',
  },
  buyButtonTextLocked: {
    color: COLORS.textSecondary,
  },
  ownedBadge: {
    width: '100%',
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(76,175,80,0.2)',
    alignItems: 'center',
    marginTop: 4,
  },
  ownedText: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    color: '#4CAF50',
  },
});
