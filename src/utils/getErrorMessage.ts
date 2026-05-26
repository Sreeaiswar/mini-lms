import axios from "axios";

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: string[] }
      | undefined;

    if (typeof data?.message === "string" && data.message.trim()) {
      return data.message;
    }

    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      return data.errors.join(", ");
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
