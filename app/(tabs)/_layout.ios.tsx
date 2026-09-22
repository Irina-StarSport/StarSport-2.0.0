import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import FloatingTabBar from '@/components/FloatingTabBar';
import type { TabBarItem } from '@/components/FloatingTabBar';

const TABS: TabBarItem[] = [
  { name: '(home)', route: '/(tabs)/(home)', icon: 'home', label: 'Главная' },
  { name: 'music', route: '/(tabs)/music', icon: 'music-note', label: 'Музыка' },
  { name: 'collection', route: '/(tabs)/collection', icon: 'collections', label: 'Коллекция' },
  { name: 'settings', route: '/(tabs)/settings', icon: 'settings', label: 'Настройки' },
];

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen name="(home)" />
        <Stack.Screen name="music" />
        <Stack.Screen name="collection" />
        <Stack.Screen name="settings" />
      </Stack>
      <FloatingTabBar tabs={TABS} containerWidth={340} />
    </View>
  );
}
