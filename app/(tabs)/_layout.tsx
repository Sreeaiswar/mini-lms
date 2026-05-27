import { useEffect } from "react";
import { Tabs } from "expo-router";
import { Bookmark, GraduationCap, Home, User } from "lucide-react-native";

import {
  AppTabHeaderBell,
  AppTabHeaderLogo,
} from "../../src/components/common/AppTabHeader";
import { requestPermissions } from "../../src/services/notificationService";

const tabHeaderOptions = {
  headerLeft: () => <AppTabHeaderLogo />,
  headerRight: () => <AppTabHeaderBell />,
  headerTitleAlign: "center" as const,
};

export default function TabsLayout() {
  useEffect(() => {
    void requestPermissions();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#2563eb",
        tabBarStyle: {
          height: 60,
          paddingVertical: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        ...tabHeaderOptions,
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
