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
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash may already be hidden on fast reload.
});

import { AppToast } from "../src/components/common/AppToast";
import { ErrorBoundary } from "../src/components/common/ErrorBoundary";
import { OfflineBanner } from "../src/components/common/OfflineBanner";
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
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isSessionRestored = useAuthStore((state) => state.isSessionRestored);

  if (!isSessionRestored) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-canvas">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-base text-muted">Loading...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
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
          }}
        />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
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
    <SafeAreaProvider>
      <ErrorBoundary>
        <OfflineBanner />
        <RootNavigator />
        <AppToast />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
