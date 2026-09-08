import "react-native-reanimated";
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProgressProvider } from "@/contexts/ProgressContext";
import { MusicProvider } from "@/contexts/MusicContext";
import {
  useFonts,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from "@expo-google-fonts/nunito";
import { COLORS } from "@/constants/SpaceColors";

const DevErrorBoundary = __DEV__
  ? ErrorBoundary
  : ({ children }: { children: React.ReactNode }) => <>{children}</>;

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const SpaceTheme: Theme = {
    ...DarkTheme,
    colors: {
      primary: COLORS.primary,
      background: COLORS.background,
      card: COLORS.surface,
      text: COLORS.text,
      border: COLORS.border,
      notification: COLORS.danger,
    },
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <DevErrorBoundary>
      <StatusBar style="light" animated />
      <ThemeProvider value={SpaceTheme}>
        <SafeAreaProvider>
          <ProgressProvider>
            <MusicProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <Stack
                  screenOptions={{
                    headerStyle: { backgroundColor: COLORS.background },
                    headerTintColor: COLORS.text,
                    headerTitleStyle: {
                      fontFamily: 'Nunito_700Bold',
                      color: COLORS.text,
                    },
                    contentStyle: { backgroundColor: COLORS.background },
                  }}
                >
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="planet/[id]"
                    options={{
                      headerShown: true,
                      headerTransparent: true,
                      headerTintColor: COLORS.text,
                    }}
                  />
                  <Stack.Screen
                    name="exercise/[planetId]/[exerciseId]"
                    options={{
                      headerShown: true,
                      headerTransparent: true,
                      headerTintColor: COLORS.text,
                    }}
                  />
                  <Stack.Screen
                    name="achievements"
                    options={{
                      presentation: 'modal',
                      headerShown: true,
                      title: 'Достижения',
                      headerTintColor: COLORS.text,
                      headerStyle: { backgroundColor: COLORS.background },
                    }}
                  />
                  <Stack.Screen
                    name="music"
                    options={{
                      presentation: 'modal',
                      headerShown: true,
                      title: 'Музыка',
                      headerTintColor: COLORS.text,
                      headerStyle: { backgroundColor: COLORS.background },
                    }}
                  />
                  <Stack.Screen
                    name="guide"
                    options={{
                      presentation: 'modal',
                      headerShown: true,
                      title: 'Руководство',
                      headerTintColor: COLORS.text,
                      headerStyle: { backgroundColor: COLORS.background },
                    }}
                  />
                </Stack>
                <SystemBars style="light" />
              </GestureHandlerRootView>
            </MusicProvider>
          </ProgressProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </DevErrorBoundary>
  );
}
