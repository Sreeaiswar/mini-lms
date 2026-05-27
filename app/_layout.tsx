import "../global.css";

import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  AppState,
  Text,
  View,
  type AppStateStatus,
} from "react-native";
import { Stack } from "expo-router";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash may already be hidden on fast reload.
});

import { AppToast } from "../src/components/common/AppToast";
import { ErrorBoundary } from "../src/components/common/ErrorBoundary";
import { OfflineBanner } from "../src/components/common/OfflineBanner";
import { useTheme } from "../src/hooks/useTheme";
import { usePreferencesStore } from "../src/store/preferencesStore";
import {
  cancelReminder,
  recordInAppNotification,
  requestPermissions,
  scheduleReminder,
} from "../src/services/notificationService";
import { useAuthStore } from "../src/store/authStore";
import { useNotificationStore } from "../src/store/notificationStore";

function RootNavigator() {
  const { colors } = useTheme();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isSessionRestored = useAuthStore((state) => state.isSessionRestored);

  if (!isSessionRestored) {
    return (
      <View
        className="flex-1 items-center justify-center gap-4"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          className="text-base"
          style={{ color: colors.mutedText }}
        >
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: colors.header },
        headerTintColor: colors.headerText,
        headerTitleStyle: { color: colors.headerText },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(course)" />
        <Stack.Screen
          name="notifications"
          options={{
            headerShown: true,
            title: "Notifications",
            headerBackTitle: "Back",
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.headerText,
            headerTitleStyle: { color: colors.headerText },
            contentStyle: { backgroundColor: colors.background },
          }}
        />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

function RootShell() {
  const { isDark, colors } = useTheme();
  const appState = useRef(AppState.currentState);
  const isSessionRestored = useAuthStore((state) => state.isSessionRestored);

  useEffect(() => {
    void useAuthStore.getState().restoreSession();
    void usePreferencesStore.getState().hydrate();
    void useNotificationStore.getState().hydrate();
  }, []);

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        const content = notification.request.content;
        const title = content.title?.trim() || "Notification";
        const body = content.body?.trim() || "";
        const data = content.data as { dedupeKey?: string } | undefined;
        const dedupeKey =
          typeof data?.dedupeKey === "string"
            ? data.dedupeKey
            : notification.request.identifier;

        void recordInAppNotification(title, body, "reminder", dedupeKey);
      }
    );

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (isSessionRestored) {
      void SplashScreen.hideAsync();
    }
  }, [isSessionRestored]);

  useEffect(() => {
    void cancelReminder().then(() => scheduleReminder());

    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        const wasBackground =
          appState.current === "background" || appState.current === "inactive";
        const isBackground =
          nextAppState === "background" || nextAppState === "inactive";
        const isActive = nextAppState === "active";

        if (isActive || (wasBackground === false && isBackground)) {
          void cancelReminder().then(() => scheduleReminder());
        }

        appState.current = nextAppState;
      }
    );

    return () => subscription.remove();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <OfflineBanner />
      <RootNavigator />
      <AppToast />
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <RootShell />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
