import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WifiOff } from "lucide-react-native";

import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { useTheme } from "../../hooks/useTheme";

export function OfflineBanner() {
  const { isOffline } = useNetworkStatus();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const [wasOffline, setWasOffline] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const slideAnim = useRef(new Animated.Value(-80)).current;

  useEffect(() => {
    if (isOffline) {
      setWasOffline(true);
      setShowRetry(false);
    } else if (wasOffline) {
      setShowRetry(true);
    }
  }, [isOffline, wasOffline]);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOffline || showRetry ? 0 : -80,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [isOffline, showRetry, slideAnim]);

  if (!isOffline && !showRetry) {
    return null;
  }

  const handleDismissRetry = () => {
    setShowRetry(false);
    setWasOffline(false);
  };

  const bgColor =
    showRetry && !isOffline
      ? isDark
        ? "#14532D"
        : "#15803d"
      : isDark
        ? "#78350F"
        : "#b45309";

  return (
    <Animated.View
      className="absolute left-0 right-0 top-0 z-[1000]"
      style={{
        paddingTop: insets.top + 6,
        transform: [{ translateY: slideAnim }],
      }}
      pointerEvents="box-none"
    >
      <View
        className="flex-row items-center justify-center gap-2 px-4 py-2.5"
        style={{ backgroundColor: bgColor }}
      >
        {isOffline ? (
          <>
            <WifiOff size={16} color="#ffffff" />
            <Text className="shrink text-[13px] font-semibold text-white">
              You&apos;re offline. Showing cached content.
            </Text>
          </>
        ) : (
          <>
            <Text className="shrink text-[13px] font-semibold text-white">
              Back online
            </Text>
            <Pressable
              onPress={handleDismissRetry}
              className="ml-2 rounded-md bg-white/20 px-2.5 py-1"
              accessibilityRole="button"
              accessibilityLabel="Dismiss reconnect notice"
            >
              <Text className="text-[13px] font-bold text-white">OK</Text>
            </Pressable>
          </>
        )}
      </View>
    </Animated.View>
  );
}
