import AsyncStorage from "@react-native-async-storage/async-storage";

export const storage = {
  set: async (
    key: string,
    value: unknown
  ) => {
    await AsyncStorage.setItem(
      key,
      JSON.stringify(value)
    );
  },

  get: async (key: string) => {
    const value =
      await AsyncStorage.getItem(key);

    return value
      ? JSON.parse(value)
      : null;
  },

  remove: async (key: string) => {
    await AsyncStorage.removeItem(key);
  },
};