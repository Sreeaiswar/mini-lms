import { useEffect, useRef } from "react";
import { Animated, Pressable, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CheckCircle2, Info, X, XCircle } from "lucide-react-native";

import { useToastStore, type ToastType } from "../../store/toastStore";

const TOAST_COLORS: Record<ToastType, { bg: string; border: string }> = {
  success: { bg: "#ecfdf5", border: "#16a34a" },
  error: { bg: "#fef2f2", border: "#dc2626" },
  info: { bg: "#eff6ff", border: "#2563eb" },
};

function ToastIcon({ type }: { type: ToastType }) {
  const size = 20;

  if (type === "success") {
    return <CheckCircle2 size={size} color="#16a34a" />;
  }

  if (type === "error") {
    return <XCircle size={size} color="#dc2626" />;
  }

  return <Info size={size} color="#2563eb" />;
}

export function AppToast() {
  const { visible, message, type, hideToast } = useToastStore();
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 24,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, opacity, translateY]);

  if (!visible && !message) {
    return null;
  }

  const colors = TOAST_COLORS[type];

  return (
    <Animated.View
      pointerEvents="box-none"
      className="absolute left-5 right-5 z-[1100]"
      style={{
        bottom: insets.bottom + 24,
        opacity,
        transform: [{ translateY }],
        elevation: 12,
      }}
    >
      <Pressable
        onPress={hideToast}
        className="flex-row items-center rounded-xl border px-4 py-3.5"
        style={{
          gap: 10,
          backgroundColor: colors.bg,
          borderColor: colors.border,
          shadowColor: "#0f172a",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
        }}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
      >
        <ToastIcon type={type} />
        <Text className="flex-1 text-sm font-semibold text-ink">{message}</Text>
        <X size={18} color="#64748b" />
      </Pressable>
    </Animated.View>
  );
}
