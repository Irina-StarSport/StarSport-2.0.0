export type ShopItemCategory = 'sticker' | 'frame' | 'background';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  emoji: string;
  cost: number;
  category: ShopItemCategory;
  color: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  // Stickers
  { id: 'sticker-rocket', name: 'Ракета', description: 'Космическая ракета для твоей коллекции', emoji: '🚀', cost: 5, category: 'sticker', color: '#FF6B6B' },
  { id: 'sticker-star', name: 'Золотая звезда', description: 'Сияющая золотая звезда', emoji: '⭐', cost: 3, category: 'sticker', color: '#FFD700' },
  { id: 'sticker-planet', name: 'Планета', description: 'Загадочная далёкая планета', emoji: '🪐', cost: 8, category: 'sticker', color: '#9C27B0' },
  { id: 'sticker-astronaut', name: 'Космонавт', description: 'Храбрый исследователь космоса', emoji: '👨‍🚀', cost: 10, category: 'sticker', color: '#2196F3' },
  { id: 'sticker-alien', name: 'Инопланетянин', description: 'Дружелюбный житель другой планеты', emoji: '👽', cost: 12, category: 'sticker', color: '#4CAF50' },
  { id: 'sticker-comet', name: 'Комета', description: 'Быстрая комета с хвостом из льда', emoji: '☄️', cost: 7, category: 'sticker', color: '#FF9800' },
  { id: 'sticker-galaxy', name: 'Галактика', description: 'Целая галактика в твоей коллекции', emoji: '🌌', cost: 15, category: 'sticker', color: '#3F51B5' },
  { id: 'sticker-moon', name: 'Луна', description: 'Серебристая луна в ночном небе', emoji: '🌙', cost: 4, category: 'sticker', color: '#C8D8E8' },
  // Frames
  { id: 'frame-gold', name: 'Золотая рамка', description: 'Рамка для настоящего чемпиона', emoji: '🏆', cost: 20, category: 'frame', color: '#FFD700' },
  { id: 'frame-space', name: 'Космическая рамка', description: 'Рамка из звёзд и туманностей', emoji: '✨', cost: 25, category: 'frame', color: '#9C27B0' },
  { id: 'frame-fire', name: 'Огненная рамка', description: 'Рамка из космического огня', emoji: '🔥', cost: 30, category: 'frame', color: '#FF5722' },
  // Backgrounds
  { id: 'bg-nebula', name: 'Туманность', description: 'Красочная космическая туманность', emoji: '🎆', cost: 35, category: 'background', color: '#E91E63' },
  { id: 'bg-galaxy', name: 'Млечный путь', description: 'Наша родная галактика', emoji: '🌠', cost: 40, category: 'background', color: '#3F51B5' },
  { id: 'bg-aurora', name: 'Северное сияние', description: 'Волшебное северное сияние', emoji: '🌈', cost: 45, category: 'background', color: '#00BCD4' },
];
