import { create } from "zustand";

interface AuthState {
  user: any;
  accessToken: string | null;

  setUser: (user: any) => void;
  setAccessToken: (
    token: string | null
  ) => void;
}

export const useAuthStore =
  create<AuthState>((set) => ({
    user: null,
    accessToken: null,

    setUser: (user) =>
      set({ user }),

    setAccessToken: (
      accessToken
    ) =>
      set({
        accessToken,
      }),
  }));