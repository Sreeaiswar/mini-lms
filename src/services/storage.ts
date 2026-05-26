import AsyncStorage from "@react-native-async-storage/async-storage";

let writeChain: Promise<void> = Promise.resolve();

function enqueueWrite(task: () => Promise<void>): Promise<void> {
  writeChain = writeChain.then(task).catch(() => undefined);
  return writeChain;
}

export const storage = {
  set: async (key: string, value: unknown) => {
    await enqueueWrite(async () => {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    });
  },

  get: async (key: string) => {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },

  remove: async (key: string) => {
    await enqueueWrite(async () => {
      await AsyncStorage.removeItem(key);
    });
  },
};