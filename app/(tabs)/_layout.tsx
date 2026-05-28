import { useEffect } from "react";
import { Tabs } from "expo-router";
import { Bookmark, GraduationCap, Home, User } from "lucide-react-native";

import {
  AppTabHeaderBell,
  AppTabHeaderLogo,
} from "../../src/components/common/AppTabHeader";
import { useTheme } from "../../src/hooks/useTheme";
import { requestPermissions } from "../../src/services/notificationService";

export default function TabsLayout() {
  const { colors } = useTheme();

  useEffect(() => {
    void requestPermissions();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.header,
          borderBottomColor: colors.border,
        },
        headerTitleStyle: { color: colors.headerText },
        headerTintColor: colors.headerText,
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          height: 72,
          paddingVertical: 5,
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        headerLeft: () => <AppTabHeaderLogo />,
        headerRight: () => <AppTabHeaderBell />,
        headerTitleAlign: "center" as const,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-learning"
        options={{
          title: "My Learning",
          tabBarIcon: ({ color, size }) => (
            <GraduationCap color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: "Bookmarks",
          tabBarIcon: ({ color, size }) => (
            <Bookmark color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
