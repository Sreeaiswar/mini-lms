import { useEffect, useMemo, useRef } from "react";
import { Animated, Pressable, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CheckCircle2, Info, X, XCircle } from "lucide-react-native";

import { useTheme } from "../../hooks/useTheme";
import { useToastStore, type ToastType } from "../../store/toastStore";
import type { ThemeColors } from "../../constants/theme";

function getToastPalette(
  type: ToastType,
  colors: ThemeColors
): { bg: string; border: string; icon: string; text: string } {
  if (type === "success") {
    return {
      bg: colors.successBg,
      border: colors.success,
      icon: colors.success,
      text: colors.successText,
    };
  }

  if (type === "error") {
    return {
      bg: colors.errorBg,
      border: colors.error,
      icon: colors.error,
      text: colors.errorText,
    };
  }

  return {
    bg: colors.infoBg,
    border: colors.info,
    icon: colors.info,
    text: colors.infoText,
  };
}

function ToastIcon({ type, color }: { type: ToastType; color: string }) {
  const size = 20;

  if (type === "success") {
    return <CheckCircle2 size={size} color={color} />;
  }

  if (type === "error") {
    return <XCircle size={size} color={color} />;
  }

  return <Info size={size} color={color} />;
}

export function AppToast() {
  const { visible, message, type, hideToast } = useToastStore();
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  const { colors } = useTheme();

  const palette = useMemo(() => getToastPalette(type, colors), [type, colors]);

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
          backgroundColor: palette.bg,
          borderColor: palette.border,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.18,
          shadowRadius: 8,
        }}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
      >
        <ToastIcon type={type} color={palette.icon} />
        <Text
          className="flex-1 text-sm font-semibold"
          style={{ color: palette.text }}
        >
          {message}
        </Text>
        <X size={18} color={colors.mutedText} />
      </Pressable>
    </Animated.View>
  );
}
