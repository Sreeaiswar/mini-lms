import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

interface ProgressBarProps {
  progress: number;
}

function clampProgress(progress: number): number {
  return Math.min(100, Math.max(0, Math.round(progress)));
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const clamped = clampProgress(progress);
  const animatedWidth = useRef(new Animated.Value(0)).current;

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
      <View className="h-2 overflow-hidden rounded bg-line">
        <Animated.View
          className="h-full rounded bg-brand"
          style={{ width: widthInterpolation }}
        />
      </View>
      <Text className="text-[13px] font-semibold text-[#475569]">{clamped}%</Text>
    </View>
  );
}
