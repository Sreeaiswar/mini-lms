import { useCallback, useEffect, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { LegendList } from "@legendapp/list";
import { ArrowLeft, Bell } from "lucide-react-native";
import { Stack, router, useFocusEffect } from "expo-router";

import { EmptyState } from "../src/components/common/EmptyState";
import { LoadingState } from "../src/components/common/LoadingState";
import { LEGEND_LIST_PERF } from "../src/constants/flatListConfig";
import { useTheme } from "../src/hooks/useTheme";
import { useNotificationStore } from "../src/store/notificationStore";
import { shadows } from "../src/styles/ui";
import type { ThemeColors } from "../src/constants/theme";
import type { AppNotification } from "../src/types/notificationTypes";

function formatNotificationTime(iso: string): string {
  const date = new Date(iso);
  const now = Date.now();
  const diffMs = now - date.getTime();

  if (diffMs < 60_000) {
    return "Just now";
  }

  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function NotificationRow({
  item,
  colors,
}: {
  item: AppNotification;
  colors: ThemeColors;
}) {
  return (
    <View
      className="mb-3 rounded-card border px-4 py-3.5"
      style={[
        shadows.statCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}
    >
      <View className="flex-row items-start justify-between gap-2">
        <Text
          className="flex-1 text-[15px] font-bold"
          style={{ color: colors.text }}
        >
          {item.title}
        </Text>
        {!item.read ? (
          <View
            className="mt-1.5 h-2 w-2 rounded-full"
            style={{ backgroundColor: colors.primary }}
          />
        ) : null}
      </View>
      <Text
        className="mt-1 text-[14px] leading-5"
        style={{ color: colors.secondaryText }}
      >
        {item.body}
      </Text>
      <Text
        className="mt-2 text-xs font-medium"
        style={{ color: colors.mutedText }}
      >
        {formatNotificationTime(item.createdAt)}
      </Text>
    </View>
  );
}

const keyExtractor = (item: AppNotification) => item.id;

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const hydrate = useNotificationStore((state) => state.hydrate);
  const notifications = useNotificationStore((state) => state.notifications);
  const isHydrated = useNotificationStore((state) => state.isHydrated);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

  const headerBack = useCallback(
    () => (
      <Pressable
        onPress={() => router.back()}
        hitSlop={10}
        className="rounded-full p-1.5"
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <ArrowLeft size={22} color={colors.headerText} />
      </Pressable>
    ),
    [colors.headerText]
  );

  const headerOptions = useMemo(
    () => ({
      title: "Notifications",
      headerTitleAlign: "center" as const,
      headerStyle: { backgroundColor: colors.header },
      headerTintColor: colors.headerText,
      headerTitleStyle: { color: colors.headerText },
      headerLeft: headerBack,
    }),
    [colors.header, colors.headerText, headerBack]
  );

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useFocusEffect(
    useCallback(() => {
      if (useNotificationStore.getState().isHydrated) {
        void markAllAsRead();
      }
    }, [markAllAsRead])
  );

  const renderItem = useCallback(
    ({ item }: { item: AppNotification }) => (
      <NotificationRow item={item} colors={colors} />
    ),
    [colors]
  );

  const listEmptyComponent = useCallback(
    () => (
      <EmptyState
        title="No notifications"
        subtitle="Learning updates and reminders will appear here."
        icon={<Bell size={36} color={colors.placeholder} />}
      />
    ),
    [colors.placeholder]
  );

  if (!isHydrated) {
    return (
      <>
        <Stack.Screen options={headerOptions} />
        <LoadingState message="Loading notifications..." />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={headerOptions} />
      <View
        className="flex-1 px-5 pt-4"
        style={{ backgroundColor: colors.background }}
      >
        <LegendList
          data={notifications}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={
            notifications.length === 0
              ? { flexGrow: 1, paddingBottom: 32 }
              : { paddingBottom: 32 }
          }
          ListEmptyComponent={listEmptyComponent}
          {...LEGEND_LIST_PERF}
        />
      </View>
    </>
  );
}
