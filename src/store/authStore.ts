import axios from "axios";
import { create } from "zustand";
import { router } from "expo-router";

import { authApi } from "../api/authApi";
import { useEnrollmentStore } from "./enrollmentStore";
import { useProgressStore } from "./progressStore";
import {
  setAccessTokenGetter,
  setAuthSessionHandlers,
} from "../api/client";
import { secureStore } from "../services/secureStore";
import type {
  LoginPayload,
  RegisterPayload,
  User,
  UserStatistics,
} from "../types/authTypes";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSessionRestored: boolean;
  statistics: UserStatistics;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  restoreSession: () => Promise<void>;
  logout: () => Promise<void>;
  refreshCurrentUser: () => Promise<void>;
  uploadAvatar: (
    uri: string,
    mimeType?: string,
    fileName?: string
  ) => Promise<void>;
  clearAuthAndRedirectToLogin: () => Promise<void>;
}

type AuthStoreSet = (
  partial:
    | Partial<AuthState>
    | ((state: AuthState) => Partial<AuthState>)
) => void;

const PLACEHOLDER_STATISTICS: UserStatistics = {
  coursesEnrolled: 0,
  coursesCompleted: 0,
  progressPercent: 0,
};

const unauthenticatedState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
} satisfies Pick<
  AuthState,
  "user" | "accessToken" | "refreshToken" | "isAuthenticated"
>;

const restoredUnauthenticatedState = {
  ...unauthenticatedState,
  isSessionRestored: true,
};

function authenticatedState(
  user: User,
  accessToken: string,
  refreshToken: string | null
): Pick<
  AuthState,
  "user" | "accessToken" | "refreshToken" | "isAuthenticated"
> {
  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated: true,
  };
}

async function persistSessionTokens(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  await Promise.all([
    secureStore.setAccessToken(accessToken),
    secureStore.setRefreshToken(refreshToken),
  ]);
}

function setRestoredUnauthenticated(set: AuthStoreSet): void {
  set(restoredUnauthenticatedState);
}

let restoreSessionInFlight: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  ...unauthenticatedState,
  isLoading: false,
  isSessionRestored: false,
  statistics: PLACEHOLDER_STATISTICS,

  login: async (payload) => {
    set({ isLoading: true });

    try {
      const response = await authApi.login(payload);
      const { accessToken, refreshToken, user } = response.data;

      await persistSessionTokens(accessToken, refreshToken);

      set({
        ...authenticatedState(user, accessToken, refreshToken),
        isLoading: false,
        isSessionRestored: true,
      });

      router.replace("/(tabs)/home");
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (payload) => {
    set({ isLoading: true });

    try {
      await authApi.register({
        ...payload,
        role: payload.role ?? "USER",
      });

      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  restoreSession: async () => {
    if (restoreSessionInFlight) {
      return restoreSessionInFlight;
    }

    restoreSessionInFlight = (async () => {
      let storedAccessToken: string | null = null;
      let storedRefreshToken: string | null = null;

      try {
        console.log("restoreSession: Starting session restoration");

        [storedAccessToken, storedRefreshToken] = await Promise.all([
          secureStore.getAccessToken(),
          secureStore.getRefreshToken(),
        ]);

        console.log("restoreSession: Retrieved tokens", {
          hasAccessToken: !!storedAccessToken,
          hasRefreshToken: !!storedRefreshToken,
        });

        if (!storedAccessToken) {
          console.log("restoreSession: No access token found, clearing if refresh exists");
          if (storedRefreshToken) {
            await secureStore.clear();
          }

          setRestoredUnauthenticated(set);
          return;
        }

        set({
          accessToken: storedAccessToken,
          refreshToken: storedRefreshToken,
        });

        const currentUserResponse = await authApi.getCurrentUser();
        const user = currentUserResponse.data;

        console.log("restoreSession: Session restored successfully", {
          userId: user._id,
          username: user.username,
        });

        set({
          ...authenticatedState(
            user,
            storedAccessToken,
            storedRefreshToken
          ),
          isSessionRestored: true,
        });
      } catch (error) {
        const status = axios.isAxiosError(error)
          ? error.response?.status
          : undefined;

        if (status === 401 || status === 403 || !storedAccessToken) {
          console.log("restoreSession: Clearing session due to auth error", {
            status,
          });
          await secureStore.clear();
          setRestoredUnauthenticated(set);
          return;
        }

        console.error("restoreSession: Unexpected error during restoration", {
          status,
          message: error instanceof Error ? error.message : String(error),
          hasAccessToken: !!storedAccessToken,
        });

        console.log("restoreSession: Keeping tokens despite error");
        set({
          accessToken: storedAccessToken,
          refreshToken: storedRefreshToken,
          isAuthenticated: true,
          isSessionRestored: true,
        });
      }
    })();

    try {
      await restoreSessionInFlight;
    } finally {
      restoreSessionInFlight = null;
    }
  },

  refreshCurrentUser: async () => {
    const response = await authApi.getCurrentUser();
    set({ user: response.data });
  },

  uploadAvatar: async (uri, mimeType, fileName) => {
    set({ isLoading: true });

    try {
      const response = await authApi.uploadAvatar(uri, mimeType, fileName);
      set({ user: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  clearAuthAndRedirectToLogin: async () => {
    await secureStore.clear();
    await useProgressStore.getState().clearProgress();
    await useEnrollmentStore.getState().clearEnrollments();

    set({
      ...unauthenticatedState,
      isLoading: false,
      isSessionRestored: true,
      statistics: PLACEHOLDER_STATISTICS,
    });

    router.replace("/(auth)/login");
  },

  logout: async () => {
    set({ isLoading: true });

    try {
      if (get().accessToken) {
        await authApi.logout();
      }
    } catch {
      // Clear local session even if the API call fails.
    } finally {
      await get().clearAuthAndRedirectToLogin();
    }
  },
}));

setAccessTokenGetter(() => useAuthStore.getState().accessToken);

setAuthSessionHandlers({
  getRefreshToken: () => useAuthStore.getState().refreshToken,
  onTokensRefreshed: async (accessToken, refreshToken) => {
    await persistSessionTokens(accessToken, refreshToken);
    useAuthStore.setState({ accessToken, refreshToken });
  },
  onRefreshFailed: async () => {
    await useAuthStore.getState().clearAuthAndRedirectToLogin();
  },
});
