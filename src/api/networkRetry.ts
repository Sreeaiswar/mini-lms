import type { AxiosError, InternalAxiosRequestConfig } from "axios";

const MAX_NETWORK_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 400;

const NON_RETRYABLE_URL_FRAGMENTS = [
  "/users/login",
  "/users/register",
  "/users/refresh-token",
];

export type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _networkRetryCount?: number;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function shouldSkipNetworkRetry(config: RetryableRequestConfig | undefined): boolean {
  if (!config?.url) {
    return true;
  }

  return NON_RETRYABLE_URL_FRAGMENTS.some((fragment) =>
    config.url!.includes(fragment)
  );
}

export function isRetryableNetworkError(
  error: AxiosError,
  config: RetryableRequestConfig | undefined
): boolean {
  if (!config || shouldSkipNetworkRetry(config)) {
    return false;
  }

  const retryCount = config._networkRetryCount ?? 0;

  if (retryCount >= MAX_NETWORK_RETRIES) {
    return false;
  }

  if (!error.response) {
    return true;
  }

  const status = error.response.status;

  return status >= 500 || status === 408 || status === 429;
}

export async function retryNetworkRequest<T>(
  config: RetryableRequestConfig,
  request: (config: RetryableRequestConfig) => Promise<T>
): Promise<T> {
  const attempt = (config._networkRetryCount ?? 0) + 1;
  const nextConfig: RetryableRequestConfig = {
    ...config,
    _networkRetryCount: attempt,
  };

  await sleep(RETRY_BASE_DELAY_MS * attempt);
  return request(nextConfig);
}
