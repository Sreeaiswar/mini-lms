import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

import { useTheme } from "../../hooks/useTheme";

interface ProgressBarProps {
  progress: number;
}

function clampProgress(progress: number): number {
  return Math.min(100, Math.max(0, Math.round(progress)));
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const clamped = clampProgress(progress);
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const { colors } = useTheme();

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: clamped,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [animatedWidth, clamped]);

  const widthInterpolation = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View className="gap-1.5">
      <View
        className="h-2 overflow-hidden rounded"
        style={{ backgroundColor: colors.progressTrack }}
      >
        <Animated.View
          className="h-full rounded"
          style={{
            width: widthInterpolation,
            backgroundColor: colors.primary,
          }}
        />
      </View>
      <Text
        className="text-[13px] font-semibold"
        style={{ color: colors.secondaryText }}
      >
        {clamped}%
      </Text>
    </View>
  );
}
