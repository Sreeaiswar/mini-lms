import { Tabs } from "expo-router";
import { Bookmark, GraduationCap, Home, User } from "lucide-react-native";

import {
  AppTabHeaderBell,
  AppTabHeaderLogo,
} from "../../src/components/common/AppTabHeader";

const tabHeaderOptions = {
  headerLeft: () => <AppTabHeaderLogo />,
  headerRight: () => <AppTabHeaderBell />,
  headerTitleAlign: "center" as const,
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#2563eb",
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
