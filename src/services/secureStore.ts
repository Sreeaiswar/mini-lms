import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_TOKEN = "access_token";
const REFRESH_TOKEN = "refresh_token";

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }

  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
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
};