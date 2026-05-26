import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

import {
  isRetryableNetworkError,
  retryNetworkRequest,
  type RetryableRequestConfig,
} from "./networkRetry";

export const api = axios.create({
  baseURL: "https://api.freeapi.app/api/v1",
  timeout: 10000,
});

const REFRESH_TOKEN_PATH = "/users/refresh-token";

let getAccessToken: (() => string | null) | null = null;
let getRefreshToken: (() => string | null) | null = null;
let onTokensRefreshed:
  | ((accessToken: string, refreshToken: string) => Promise<void>)
  | null = null;
let onRefreshFailed: (() => Promise<void>) | null = null;

export function setAccessTokenGetter(getter: () => string | null) {
  getAccessToken = getter;
}

export function setAuthSessionHandlers(handlers: {
  getRefreshToken: () => string | null;
  onTokensRefreshed: (
    accessToken: string,
    refreshToken: string
  ) => Promise<void>;
  onRefreshFailed: () => Promise<void>;
}) {
  getRefreshToken = handlers.getRefreshToken;
  onTokensRefreshed = handlers.onTokensRefreshed;
  onRefreshFailed = handlers.onRefreshFailed;
}

function shouldSkipRefreshRetry(
  config: InternalAxiosRequestConfig | undefined
): boolean {
  if (!config?.url) {
    return true;
  }

  const url = config.url;

  return (
    url.includes(REFRESH_TOKEN_PATH) ||
    url.includes("/users/login") ||
    url.includes("/users/register")
  );
}

api.interceptors.request.use((config) => {
  const accessToken = getAccessToken?.();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processRefreshQueue(error: unknown, token: string | null) {
  refreshQueue.forEach((pending) => {
    if (error || !token) {
      pending.reject(error);
      return;
    }

    pending.resolve(token);
  });

  refreshQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const retryableRequest = originalRequest as RetryableRequestConfig | undefined;

    if (
      retryableRequest &&
      isRetryableNetworkError(error, retryableRequest)
    ) {
      return retryNetworkRequest(retryableRequest, (config) => api(config));
    }

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      shouldSkipRefreshRetry(originalRequest)
    ) {
      return Promise.reject(error);
    }

    const storedRefreshToken = getRefreshToken?.();

    if (!storedRefreshToken) {
      await onRefreshFailed?.();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((accessToken) => {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await axios.post<{
        data: { accessToken: string; refreshToken: string };
      }>(
        `${api.defaults.baseURL}${REFRESH_TOKEN_PATH}`,
        { refreshToken: storedRefreshToken },
        { timeout: api.defaults.timeout }
      );

      const { accessToken, refreshToken: newRefreshToken } = response.data.data;

      await onTokensRefreshed?.(accessToken, newRefreshToken);
      processRefreshQueue(null, accessToken);

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processRefreshQueue(refreshError, null);
      await onRefreshFailed?.();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
