import { create } from "zustand";

import {
  APP_NOTIFICATIONS_STORAGE_KEY,
  WELCOME_NOTIFICATION_SHOWN_KEY,
} from "../constants/storageKeys";
import { storage } from "../services/storage";
import type {
  AddAppNotificationInput,
  AppNotification,
} from "../types/notificationTypes";

interface NotificationState {
  notifications: AppNotification[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  addNotification: (input: AddAppNotificationInput) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  unreadCount: () => number;
}

function createNotificationId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function parseNotifications(stored: unknown): AppNotification[] {
  if (!Array.isArray(stored)) {
    return [];
  }

  return stored.filter(
    (item): item is AppNotification =>
      typeof item === "object" &&
      item != null &&
      typeof (item as AppNotification).id === "string" &&
      typeof (item as AppNotification).title === "string" &&
      typeof (item as AppNotification).body === "string"
  );
}

async function persistNotifications(
  notifications: AppNotification[]
): Promise<void> {
  await storage.set(APP_NOTIFICATIONS_STORAGE_KEY, notifications);
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  isHydrated: false,

  hydrate: async () => {
    const stored = await storage.get(APP_NOTIFICATIONS_STORAGE_KEY);
    let notifications = parseNotifications(stored);

    const welcomeShown = await storage.get(WELCOME_NOTIFICATION_SHOWN_KEY);

    if (welcomeShown !== true) {
      const welcome: AppNotification = {
        id: createNotificationId(),
        title: "Welcome to Nexora: Next-Gen Learning",
        body: "Explore courses, bookmark favorites, and track your progress.",
        type: "general",
        createdAt: new Date().toISOString(),
        read: false,
        dedupeKey: "welcome",
      };
      notifications = [welcome, ...notifications];
      await storage.set(WELCOME_NOTIFICATION_SHOWN_KEY, true);
      await persistNotifications(notifications);
    }

    set({ notifications, isHydrated: true });
  },

  addNotification: async ({ title, body, type, dedupeKey }) => {
    const { notifications } = get();

    if (
      dedupeKey &&
      notifications.some((item) => item.dedupeKey === dedupeKey)
    ) {
      return;
    }

    const next: AppNotification = {
      id: createNotificationId(),
      title,
      body,
      type,
      createdAt: new Date().toISOString(),
      read: false,
      dedupeKey,
    };

    const updated = [next, ...notifications];
    await persistNotifications(updated);
    set({ notifications: updated });
  },

  markAllAsRead: async () => {
    const { notifications } = get();

    if (notifications.every((item) => item.read)) {
      return;
    }

    const updated = notifications.map((item) => ({ ...item, read: true }));
    await persistNotifications(updated);
    set({ notifications: updated });
  },

  unreadCount: () => get().notifications.filter((item) => !item.read).length,
}));
