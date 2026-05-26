import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

let hideTimer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set) => ({
  visible: false,
  message: "",
  type: "success",

  showToast: (message, type = "success") => {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }

    set({ visible: true, message, type });

    hideTimer = setTimeout(() => {
      set({ visible: false, message: "" });
      hideTimer = null;
    }, 3200);
  },

  hideToast: () => {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }

    set({ visible: false, message: "" });
  },
}));
