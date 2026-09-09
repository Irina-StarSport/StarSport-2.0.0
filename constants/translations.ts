export type Language = 'ru' | 'en';

export const TRANSLATIONS = {
  ru: {
    // Home screen
    appTitle: 'StarSport',
    appSubtitle: 'Планета Здоровья',
    choosePlanet: 'Выбери планету',
    choosePlanetSubtitle: 'Путешествуй по Солнечной системе и выполняй упражнения',
    // Planet screen
    exercisesCompleted: 'Выполнено',
    of: 'из',
    exercises: 'упражнений',
    starsEarned: 'звёзд заработано',
    exercisesTitle: 'Упражнения',
    // Exercise screen
    description: 'Описание',
    reps: 'Повторений:',
    funFact: 'Интересный факт',
    parentTip: 'Совет для родителя',
    adaptations: 'Адаптации:',
    exerciseDone: 'Упражнение выполнено!',
    nextExercise: 'Следующее упражнение →',
    backToPlanet: 'Вернуться к планете 🚀',
    // Shop
    shopTitle: 'Магазин наград',
    yourStars: 'Твои звёзды',
    earnMoreStars: 'Выполняй упражнения, чтобы зарабатывать звёзды!',
    all: 'Все',
    stickers: 'Стикеры',
    frames: 'Рамки',
    backgrounds: 'Фоны',
    buy: 'Купить',
    inCollection: '✓ В коллекции',
    notEnoughStars: 'Недостаточно звёзд ⭐',
    back: 'Назад',
    // Settings
    settingsTitle: 'Настройки',
    textSize: 'Размер текста',
    textSizeHint: 'Увеличьте текст для детей с нарушениями зрения',
    small: 'Маленький',
    normal: 'Обычный',
    large: 'Крупный',
    musicVolume: 'Громкость музыки',
    language: 'Язык',
    languageHint: 'Язык интерфейса приложения',
    resetProgress: 'Сброс прогресса',
    resetProgressHint: 'Удалит все звёзды, пройденные упражнения и купленные предметы.',
    resetButton: 'Сбросить прогресс',
    previewText: 'Пример текста — так будет выглядеть описание упражнений',
    // Achievements
    achievementsTitle: 'Достижения',
    // Music
    musicTitle: 'Музыка',
    locked: 'Заблокировано',
  },
  en: {
    // Home screen
    appTitle: 'StarSport',
    appSubtitle: 'Planet of Health',
    choosePlanet: 'Choose a Planet',
    choosePlanetSubtitle: 'Travel through the Solar System and complete exercises',
    // Planet screen
    exercisesCompleted: 'Completed',
    of: 'of',
    exercises: 'exercises',
    starsEarned: 'stars earned',
    exercisesTitle: 'Exercises',
    // Exercise screen
    description: 'Description',
    reps: 'Reps:',
    funFact: 'Fun Fact',
    parentTip: 'Parent Tip',
    adaptations: 'Adaptations:',
    exerciseDone: 'Exercise done!',
    nextExercise: 'Next exercise →',
    backToPlanet: 'Back to planet 🚀',
    // Shop
    shopTitle: 'Reward Shop',
    yourStars: 'Your Stars',
    earnMoreStars: 'Complete exercises to earn more stars!',
    all: 'All',
    stickers: 'Stickers',
    frames: 'Frames',
    backgrounds: 'Backgrounds',
    buy: 'Buy',
    inCollection: '✓ In collection',
    notEnoughStars: 'Not enough stars ⭐',
    back: 'Back',
    // Settings
    settingsTitle: 'Settings',
    textSize: 'Text Size',
    textSizeHint: 'Increase text size for children with visual impairments',
    small: 'Small',
    normal: 'Normal',
    large: 'Large',
    musicVolume: 'Music Volume',
    language: 'Language',
    languageHint: 'App interface language',
    resetProgress: 'Reset Progress',
    resetProgressHint: 'Deletes all stars, completed exercises and purchased items.',
    resetButton: 'Reset Progress',
    previewText: 'Sample text — this is how exercise descriptions will look',
    // Achievements
    achievementsTitle: 'Achievements',
    // Music
    musicTitle: 'Music',
    locked: 'Locked',
  },
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS.ru;

export function t(lang: Language, key: TranslationKey): string {
  return TRANSLATIONS[lang][key] ?? TRANSLATIONS.ru[key];
}
