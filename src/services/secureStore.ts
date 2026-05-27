import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_TOKEN = "access_token";
const REFRESH_TOKEN = "refresh_token";

let secureStoreAvailable: boolean | null = null;

async function isSecureStoreAvailable(): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }

  if (secureStoreAvailable !== null) {
    return secureStoreAvailable;
  }

  try {
    secureStoreAvailable = await SecureStore.isAvailableAsync();
  } catch {
    secureStoreAvailable = false;
  }

  return secureStoreAvailable;
}

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn("[secureStore] localStorage.setItem failed", error);
    }
    return;
  }

  const available = await isSecureStoreAvailable();

  if (!available) {
    console.warn("[secureStore] SecureStore unavailable; cannot persist", key);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  const available = await isSecureStoreAvailable();

  if (!available) {
    return null;
  }

  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.warn("[secureStore] getItemAsync failed", key, error);
    return null;
  }
}

async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
    return;
  }

  const available = await isSecureStoreAvailable();

  if (!available) {
    return;
  }

  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.warn("[secureStore] deleteItemAsync failed", key, error);
  }
}

export const secureStore = {
  setAccessToken: async (token: string) => {
    await setItem(ACCESS_TOKEN, token);
  },

  getAccessToken: async () => {
    return getItem(ACCESS_TOKEN);
  },

  removeAccessToken: async () => {
    await deleteItem(ACCESS_TOKEN);
  },

  setRefreshToken: async (token: string) => {
    await setItem(REFRESH_TOKEN, token);
  },

  getRefreshToken: async () => {
    return getItem(REFRESH_TOKEN);
  },

  removeRefreshToken: async () => {
    await deleteItem(REFRESH_TOKEN);
  },

  clear: async () => {
    await Promise.all([deleteItem(ACCESS_TOKEN), deleteItem(REFRESH_TOKEN)]);
  },

  isAvailable: isSecureStoreAvailable,
};
