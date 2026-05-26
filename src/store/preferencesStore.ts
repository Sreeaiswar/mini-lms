import { create } from "zustand";

import type { CourseCategoryId } from "../constants/courseCategories";
import { USER_PREFERENCES_STORAGE_KEY } from "../constants/storageKeys";
import { storage } from "../services/storage";

export interface UserPreferences {
  homeCategory: CourseCategoryId;
  notificationsEnabled: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  homeCategory: "all",
  notificationsEnabled: true,
};

interface PreferencesState {
  preferences: UserPreferences;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setHomeCategory: (category: CourseCategoryId) => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
}

function parsePreferences(stored: unknown): UserPreferences {
  if (typeof stored !== "object" || stored == null) {
    return DEFAULT_PREFERENCES;
  }

  const record = stored as Partial<UserPreferences>;

  return {
    homeCategory:
      typeof record.homeCategory === "string"
        ? (record.homeCategory as CourseCategoryId)
        : DEFAULT_PREFERENCES.homeCategory,
    notificationsEnabled:
      typeof record.notificationsEnabled === "boolean"
        ? record.notificationsEnabled
        : DEFAULT_PREFERENCES.notificationsEnabled,
  };
}

async function persistPreferences(preferences: UserPreferences): Promise<void> {
  await storage.set(USER_PREFERENCES_STORAGE_KEY, preferences);
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  preferences: DEFAULT_PREFERENCES,
  isHydrated: false,

  hydrate: async () => {
    const stored = await storage.get(USER_PREFERENCES_STORAGE_KEY);
    const preferences = parsePreferences(stored);
    set({ preferences, isHydrated: true });
  },

  setHomeCategory: async (category) => {
    const next = { ...get().preferences, homeCategory: category };
    await persistPreferences(next);
    set({ preferences: next });
  },

  setNotificationsEnabled: async (enabled) => {
    const next = { ...get().preferences, notificationsEnabled: enabled };
    await persistPreferences(next);
    set({ preferences: next });
  },
}));
