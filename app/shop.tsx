import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CosmicBackground } from '@/components/CosmicBackground';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { StarCounter } from '@/components/StarCounter';
import { COLORS } from '@/constants/SpaceColors';
import { SHOP_ITEMS, ShopItemCategory } from '@/constants/shopItems';
import { useProgress } from '@/contexts/ProgressContext';

const CATEGORIES: { id: ShopItemCategory | 'all'; label: string; emoji: string }[] = [
  { id: 'all', label: 'Все', emoji: '🛍️' },
  { id: 'sticker', label: 'Стикеры', emoji: '🎨' },
  { id: 'frame', label: 'Рамки', emoji: '🖼️' },
  { id: 'background', label: 'Фоны', emoji: '🌌' },
];

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const { totalStars, purchaseItem, isItemPurchased } = useProgress();
  const [activeCategory, setActiveCategory] = useState<ShopItemCategory | 'all'>('all');

  const filteredItems = activeCategory === 'all'
    ? SHOP_ITEMS
    : SHOP_ITEMS.filter((item) => item.category === activeCategory);

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

  return (
    <CosmicBackground style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Магазин наград',
          headerTransparent: true,
          headerTintColor: COLORS.text,
          headerTitleStyle: {
            fontFamily: 'Nunito_700Bold',
            color: COLORS.text,
          },
        }}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance */}
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
                <View style={[
                  styles.categoryChip,
                  isActive && styles.categoryChipActive,
                ]}>
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text style={[
                    styles.categoryLabel,
                    isActive && styles.categoryLabelActive,
                  ]}>{cat.label}</Text>
                </View>
              </AnimatedPressable>
            );
          })}
        </ScrollView>

        {/* Items grid */}
        <View style={styles.grid}>
          {filteredItems.map((item) => {
            const purchased = isItemPurchased(item.id);
            const canAfford = totalStars >= item.cost;
            const emojiCircleStyle = { backgroundColor: item.color + '20' };
            return (
              <AnimatedPressable
                key={item.id}
                onPress={() => handlePurchase(item.id, item.cost, item.name)}
                style={styles.itemWrapper}
                accessibilityLabel={`${item.name}, ${item.cost} звёзд`}
                accessibilityRole="button"
              >
                <View style={[
                  styles.itemCard,
                  purchased && styles.itemCardPurchased,
                  !canAfford && !purchased && styles.itemCardLocked,
                ]}>
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
                      <Text style={styles.ownedText}>В коллекции</Text>
                    </View>
                  ) : (
                    <View style={[
                      styles.costBadge,
                      canAfford ? styles.costBadgeAffordable : styles.costBadgeLocked,
                    ]}>
                      <Text style={styles.costText}>⭐ {item.cost}</Text>
                    </View>
                  )}
                </View>
              </AnimatedPressable>
            );
          })}
        </View>
      </ScrollView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    paddingHorizontal: 0,
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
  categoryLabelActive: {
    color: '#FFD700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  itemWrapper: {
    width: '47%',
  },
  itemCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  itemCardPurchased: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76,175,80,0.08)',
  },
  itemCardLocked: {
    opacity: 0.6,
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
  costBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  costBadgeAffordable: {
    backgroundColor: 'rgba(255,215,0,0.2)',
  },
  costBadgeLocked: {
    backgroundColor: COLORS.surfaceSecondary,
  },
  costText: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: '#FFD700',
  },
  ownedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(76,175,80,0.2)',
  },
  ownedText: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    color: '#4CAF50',
  },
});
