import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import {
  BOOKMARK_MILESTONE_SHOWN_KEY,
  NOTIFICATION_PERMISSION_KEY,
  REMINDER_NOTIFICATION_ID_KEY,
} from "../constants/storageKeys";
import { useNotificationStore } from "../store/notificationStore";
import { usePreferencesStore } from "../store/preferencesStore";
import type { AppNotificationType } from "../types/notificationTypes";
import { storage } from "./storage";

export async function recordInAppNotification(
  title: string,
  body: string,
  type: AppNotificationType,
  dedupeKey?: string
): Promise<void> {
  const { isHydrated, hydrate, addNotification } =
    useNotificationStore.getState();

  if (!isHydrated) {
    await hydrate();
  }

  await addNotification({ title, body, type, dedupeKey });
}

function areNotificationsAllowed(): boolean {
  const { isHydrated, preferences } = usePreferencesStore.getState();

  if (!isHydrated) {
    return true;
  }

  return preferences.notificationsEnabled;
}

const REMINDER_SECONDS = 24 * 60 * 60;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync("default", {
    name: "Default",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

async function persistPermissionStatus(
  status: Notifications.PermissionStatus
): Promise<void> {
  await storage.set(NOTIFICATION_PERMISSION_KEY, status);
}

export async function requestPermissions(): Promise<Notifications.PermissionStatus> {
  await ensureAndroidChannel();

  const existing = await Notifications.getPermissionsAsync();

  if (existing.granted) {
    await persistPermissionStatus(existing.status);
    return existing.status;
  }

  const requested = await Notifications.requestPermissionsAsync();
  await persistPermissionStatus(requested.status);
  return requested.status;
}

export async function showBookmarkMilestone(): Promise<void> {
  if (!areNotificationsAllowed()) {
    return;
  }

  const alreadyShown = await storage.get(BOOKMARK_MILESTONE_SHOWN_KEY);

  if (alreadyShown === true) {
    return;
  }

  let permission = await Notifications.getPermissionsAsync();

  if (!permission.granted) {
    await requestPermissions();
    permission = await Notifications.getPermissionsAsync();
  }

  await recordInAppNotification(
    "Great job!",
    "You have bookmarked 5 courses.",
    "milestone",
    "bookmark-milestone"
  );

  if (!permission.granted) {
    await storage.set(BOOKMARK_MILESTONE_SHOWN_KEY, true);
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Great job!",
      body: "You have bookmarked 5 courses.",
      data: { dedupeKey: "bookmark-milestone" },
    },
    trigger: null,
  });

  await storage.set(BOOKMARK_MILESTONE_SHOWN_KEY, true);
}

export async function cancelReminder(): Promise<void> {
  const storedId = await storage.get(REMINDER_NOTIFICATION_ID_KEY);

  if (typeof storedId === "string" && storedId.length > 0) {
    await Notifications.cancelScheduledNotificationAsync(storedId);
  }

  await storage.remove(REMINDER_NOTIFICATION_ID_KEY);
}

export async function scheduleReminder(): Promise<void> {
  if (!areNotificationsAllowed()) {
    return;
  }

  const permission = await Notifications.getPermissionsAsync();

  if (!permission.granted) {
    return;
  }

  await cancelReminder();

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Continue Learning",
      body: "Come back and continue your learning journey.",
      data: { dedupeKey: "learning-reminder" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: REMINDER_SECONDS,
    },
  });

  await storage.set(REMINDER_NOTIFICATION_ID_KEY, notificationId);
}
