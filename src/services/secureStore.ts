import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN = "access_token";
const REFRESH_TOKEN = "refresh_token";

export const secureStore = {
  setAccessToken: async (token: string) => {
    await SecureStore.setItemAsync(
      ACCESS_TOKEN,
      token
    );
  },

  getAccessToken: async () => {
    return SecureStore.getItemAsync(
      ACCESS_TOKEN
    );
  },

  removeAccessToken: async () => {
    return SecureStore.deleteItemAsync(
      ACCESS_TOKEN
    );
  },

  setRefreshToken: async (
    token: string
  ) => {
    await SecureStore.setItemAsync(
      REFRESH_TOKEN,
      token
    );
  },

  getRefreshToken: async () => {
    return SecureStore.getItemAsync(
      REFRESH_TOKEN
    );
  },
};