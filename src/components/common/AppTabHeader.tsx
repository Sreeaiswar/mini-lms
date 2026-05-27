import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Bell } from "lucide-react-native";

import { useTheme } from "../../hooks/useTheme";
import { useNotificationStore } from "../../store/notificationStore";

const SPLASH_ICON = require("../../../assets/splash-icon.png");

export function AppTabHeaderLogo() {
  return (
    <View className="ml-3">
      <Image
        source={SPLASH_ICON}
        style={{ width: 32, height: 32 }}
        contentFit="contain"
        accessibilityLabel="Mini LMS"
      />
    </View>
  );
}

export function AppTabHeaderBell() {
  const { colors } = useTheme();
  const unreadCount = useNotificationStore((state) =>
    state.notifications.filter((item) => !item.read).length
  );

  return (
    <Pressable
      className="mr-3 rounded-full p-2 active:opacity-70"
      onPress={() => router.push("/notifications")}
      accessibilityRole="button"
      accessibilityLabel="Notifications"
    >
      <View>
        <Bell size={22} color={colors.headerText} strokeWidth={2} />
        {unreadCount > 0 ? (
          <View
            className="absolute -right-0.5 -top-0.5 min-h-[16px] min-w-[16px] items-center justify-center rounded-full px-1"
            style={{ backgroundColor: colors.primary }}
          >
            <Text
              className="text-[10px] font-bold"
              style={{ color: colors.onPrimary }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
