import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useResponsiveLayout } from "../../src/hooks/useResponsiveLayout";
import { router } from "expo-router";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BookOpen, GraduationCap, TrendingUp } from "lucide-react-native";

import { CourseListCard } from "../../src/components/CourseListCard";
import { CourseProgressBadge } from "../../src/components/common/CourseProgressBadge";
import { EmptyState } from "../../src/components/common/EmptyState";
import { ErrorState } from "../../src/components/common/ErrorState";
import { LoadingState } from "../../src/components/common/LoadingState";
import { ProgressBar } from "../../src/components/common/ProgressBar";
import { PROFILE_PICTURE_STORAGE_KEY } from "../../src/constants/storageKeys";
import { useNetworkStatus } from "../../src/hooks/useNetworkStatus";
import { useTheme } from "../../src/hooks/useTheme";
import { useAuthStore } from "../../src/store/authStore";
import {
  useBookmarkedCourseIds,
  useBookmarkStore,
} from "../../src/store/bookmarkStore";
import { useEnrollmentStore } from "../../src/store/enrollmentStore";
import { useProgressStore } from "../../src/store/progressStore";
import { usePreferencesStore } from "../../src/store/preferencesStore";
import { useToastStore } from "../../src/store/toastStore";
import {
  cancelReminder,
  scheduleReminder,
} from "../../src/services/notificationService";
import { computeUserStatistics } from "../../src/utils/computeUserStatistics";
import { getErrorMessage } from "../../src/utils/getErrorMessage";
import { shadows } from "../../src/styles/ui";
import { cn } from "../../src/utils/cn";

const DEFAULT_AVATAR = "https://via.placeholder.com/200x200.png";

export default function ProfileScreen() {
  const { contentPadding, maxContentWidth, isLandscape } = useResponsiveLayout();
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const uploadAvatar = useAuthStore((state) => state.uploadAvatar);
  const refreshCurrentUser = useAuthStore((state) => state.refreshCurrentUser);
  const isLoading = useAuthStore((state) => state.isLoading);
  const { isOffline } = useNetworkStatus();
  const showToast = useToastStore((state) => state.showToast);
  const notificationsEnabled = usePreferencesStore(
    (state) => state.preferences.notificationsEnabled
  );
  const setNotificationsEnabled = usePreferencesStore(
    (state) => state.setNotificationsEnabled
  );

  const hydrateBookmarks = useBookmarkStore((state) => state.hydrate);
  const toggleBookmark = useBookmarkStore((state) => state.toggleBookmark);
  const bookmarkedIds = useBookmarkedCourseIds();
  const hydrateEnrollments = useEnrollmentStore((state) => state.hydrate);
  const hydrateProgress = useProgressStore((state) => state.hydrate);
  const enrollments = useEnrollmentStore((state) => state.enrollments);
  const isEnrollmentsHydrated = useEnrollmentStore((state) => state.isHydrated);
  const isProgressHydrated = useProgressStore((state) => state.isHydrated);

  const statistics = useMemo(
    () => computeUserStatistics(enrollments),
    [enrollments]
  );

  const completedEnrollments = useMemo(
    () => enrollments.filter((item) => item.progressPercent >= 100),
    [enrollments]
  );

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cachedAvatarUrl, setCachedAvatarUrl] = useState<string>(DEFAULT_AVATAR);

  const loadProfileData = useCallback(async () => {
    setLoadError(null);

    try {
      await Promise.all([
        hydrateBookmarks(),
        hydrateProgress().then(() => hydrateEnrollments()),
        refreshCurrentUser(),
      ]);
    } catch {
      setLoadError("Could not load your profile. Please try again.");
    }
  }, [hydrateBookmarks, hydrateEnrollments, hydrateProgress, refreshCurrentUser]);

  useEffect(() => {
    async function restoreCachedAvatar() {
      try {
        const cached = await AsyncStorage.getItem(PROFILE_PICTURE_STORAGE_KEY);
        if (cached && typeof cached === "string" && cached.length > 0) {
          setCachedAvatarUrl(cached);
        }
      } catch (error) {
        console.warn("[profile] failed to restore cached avatar", error);
      }
    }
    void restoreCachedAvatar();
  }, []);

  useEffect(() => {
    const remoteAvatar = user?.avatar?.url;
    if (remoteAvatar && remoteAvatar !== cachedAvatarUrl) {
      void AsyncStorage.setItem(PROFILE_PICTURE_STORAGE_KEY, remoteAvatar).catch(
        (error) => console.warn("[profile] failed to cache avatar", error)
      );
      setCachedAvatarUrl(remoteAvatar);
    }
  }, [user?.avatar?.url, cachedAvatarUrl]);

  const handleRefresh = useCallback(async () => {
    if (isOffline) {
      return;
    }

    setIsRefreshing(true);
    await loadProfileData();
    setIsRefreshing(false);
  }, [isOffline, loadProfileData]);

  const handleToggleBookmark = useCallback(
    async (course: Parameters<typeof toggleBookmark>[0]) => {
      const wasBookmarked = bookmarkedIds.has(course.id);
      await toggleBookmark(course);
      showToast(
        wasBookmarked ? "Bookmark removed" : "Bookmark added",
        "success"
      );
    },
    [bookmarkedIds, showToast, toggleBookmark]
  );

  const handleNavigateToLearn = useCallback((courseId: number) => {
    router.push(`/(course)/learn/${courseId}`);
  }, []);

  useEffect(() => {
    void loadProfileData();
  }, [loadProfileData]);

  const avatarUrl = user?.avatar?.url ?? cachedAvatarUrl;

  const handleChangeProfilePicture = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      showToast(
        "Allow photo library access to change your profile picture.",
        "error"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];
    const fileName = asset.fileName ?? `avatar-${Date.now()}.jpg`;
    const mimeType = asset.mimeType ?? "image/jpeg";

    setIsUploadingAvatar(true);

    try {
      await uploadAvatar(asset.uri, mimeType, fileName);
      await refreshCurrentUser();
      const updated = useAuthStore.getState().user?.avatar?.url ?? asset.uri;
      await AsyncStorage.setItem(PROFILE_PICTURE_STORAGE_KEY, updated);
      setCachedAvatarUrl(updated);
      showToast("Avatar updated", "success");
    } catch (error) {
      // Even if remote upload fails, keep the local copy so the user sees their selection.
      try {
        await AsyncStorage.setItem(PROFILE_PICTURE_STORAGE_KEY, asset.uri);
        setCachedAvatarUrl(asset.uri);
      } catch {
        // ignore storage failure
      }
      showToast(getErrorMessage(error), "error");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleLogout = useCallback(() => {
    showToast("Logged out successfully", "info");
    void AsyncStorage.removeItem(PROFILE_PICTURE_STORAGE_KEY).catch(() => {
      // ignore
    });
    void logout();
  }, [logout, showToast]);

  const isBusy = isLoading || isUploadingAvatar;
  const isDataHydrated = isEnrollmentsHydrated && isProgressHydrated;

  if (!isDataHydrated && !loadError) {
    return <LoadingState message="Loading profile..." />;
  }

  if (loadError) {
    return (
      <ErrorState message={loadError} onRetry={() => void loadProfileData()} />
    );
  }

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{
        flexGrow: 1,
        padding: contentPadding,
        paddingBottom: 48,
        maxWidth: maxContentWidth,
        alignSelf: maxContentWidth ? "center" : undefined,
        width: maxContentWidth ? "100%" : undefined,
      }}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => void handleRefresh()}
          enabled={!isOffline}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <Text className="mb-7 text-[26px] font-bold" style={{ color: colors.text }}>
        Profile
      </Text>

      <View className="mb-8 items-center">
        <Image
          source={{ uri: avatarUrl }}
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: colors.border,
            marginBottom: 16,
            borderWidth: 3,
            borderColor: colors.card,
          }}
          contentFit="cover"
          transition={200}
          recyclingKey={avatarUrl}
        />
        <Pressable
          className={cn(
            "min-w-[220px] items-center rounded-control px-5 py-3",
            isBusy && "opacity-70"
          )}
          style={{ backgroundColor: colors.primary }}
          onPress={() => void handleChangeProfilePicture()}
          disabled={isBusy}
        >
          {isUploadingAvatar ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text
              className="text-[15px] font-semibold"
              style={{ color: colors.onPrimary }}
            >
              Change Profile Picture
            </Text>
          )}
        </Pressable>
      </View>

      <View className="mb-8">
        <Text
          className="mb-3.5 text-lg font-bold"
          style={{ color: colors.text }}
        >
          Your Statistics
        </Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: isLandscape ? "space-between" : undefined,
          }}
        >
          <View
            className="min-w-[100px] flex-1 items-center gap-1.5 rounded-card border px-3 py-[18px]"
            style={[
              shadows.statCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <GraduationCap size={22} color={colors.primary} />
            <Text
              className="text-2xl font-bold"
              style={{ color: colors.text }}
            >
              {statistics.coursesEnrolled}
            </Text>
            <Text
              className="text-center text-xs font-semibold"
              style={{ color: colors.mutedText }}
            >
              Enrolled
            </Text>
          </View>
          <View
            className="min-w-[100px] flex-1 items-center gap-1.5 rounded-card border px-3 py-[18px]"
            style={[
              shadows.statCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <BookOpen size={22} color={colors.success} />
            <Text
              className="text-2xl font-bold"
              style={{ color: colors.text }}
            >
              {statistics.coursesCompleted}
            </Text>
            <Text
              className="text-center text-xs font-semibold"
              style={{ color: colors.mutedText }}
            >
              Completed
            </Text>
          </View>
          <View
            className="min-w-[100px] flex-1 items-center gap-1.5 rounded-card border px-3 py-[18px]"
            style={[
              shadows.statCard,
              {
                flexBasis: "100%",
                backgroundColor: colors.card,
                borderColor: colors.border,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <TrendingUp size={22} color={colors.accent} />
            <Text
              className="text-2xl font-bold"
              style={{ color: colors.text }}
            >
              {statistics.progressPercent}%
            </Text>
            <Text
              className="text-center text-xs font-semibold"
              style={{ color: colors.mutedText }}
            >
              Overall Progress
            </Text>
          </View>
        </View>
      </View>

      <View className="mb-4">
        <Text
          className="mb-3.5 text-lg font-bold"
          style={{ color: colors.text }}
        >
          Enrolled Courses
        </Text>
        {enrollments.length === 0 ? (
          <EmptyState
            title="No enrolled courses"
            subtitle="Enroll in a course to start learning."
          />
        ) : (
          enrollments.map(({ course, progressPercent }) => (
            <View key={course.id} className="mb-5">
              <CourseListCard
                course={course}
                isBookmarked={bookmarkedIds.has(course.id)}
                onToggleBookmark={handleToggleBookmark}
                progressPercent={progressPercent}
              />
              <View style={{ marginTop: 10, paddingHorizontal: 4, gap: 8 }}>
                <CourseProgressBadge progressPercent={progressPercent} />
                <ProgressBar progress={progressPercent} />
                <Pressable onPress={() => handleNavigateToLearn(course.id)}>
                  <Text
                    className="text-[13px] font-semibold"
                    style={{ color: colors.primary }}
                  >
                    {progressPercent >= 100
                      ? "Review course →"
                      : "Continue learning →"}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>

      {completedEnrollments.length > 0 ? (
        <Text
          className="mb-6 text-center text-[13px] font-semibold"
          style={{ color: colors.success }}
        >
          {completedEnrollments.length} course
          {completedEnrollments.length === 1 ? "" : "s"} completed
        </Text>
      ) : null}

      <View className="mb-6">
        <Text
          className="mb-3.5 text-lg font-bold"
          style={{ color: colors.text }}
        >
          Preferences
        </Text>
        <Pressable
          className="flex-row items-center justify-between rounded-card border px-4 py-3.5"
          style={[
            shadows.statCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}
          onPress={() => {
            const next = !notificationsEnabled;
            void setNotificationsEnabled(next).then(() => {
              if (next) {
                void scheduleReminder();
              } else {
                void cancelReminder();
              }
              showToast(
                next ? "Reminders enabled" : "Reminders disabled",
                "info"
              );
            });
          }}
        >
          <Text
            className="text-[15px] font-semibold"
            style={{ color: colors.text }}
          >
            Learning reminders
          </Text>
          <Text
            className="text-[15px] font-bold"
            style={{ color: colors.primary }}
          >
            {notificationsEnabled ? "On" : "Off"}
          </Text>
        </Pressable>
      </View>

      <View className="my-2 mb-2">
        <Text
          className="mb-3.5 text-lg font-bold"
          style={{ color: colors.text }}
        >
          Account
        </Text>
        <Text
          className="mb-1 text-[13px] font-semibold"
          style={{ color: colors.mutedText }}
        >
          Username
        </Text>
        <Text className="mb-4 text-base" style={{ color: colors.text }}>
          {user?.username ?? "—"}
        </Text>
        <Text
          className="mb-1 text-[13px] font-semibold"
          style={{ color: colors.mutedText }}
        >
          Email
        </Text>
        <Text className="mb-4 text-base" style={{ color: colors.text }}>
          {user?.email ?? "—"}
        </Text>
        {user?.fullName ? (
          <>
            <Text
              className="mb-1 text-[13px] font-semibold"
              style={{ color: colors.mutedText }}
            >
              Full name
            </Text>
            <Text className="mb-4 text-base" style={{ color: colors.text }}>
              {user.fullName}
            </Text>
          </>
        ) : null}
      </View>

      <Pressable
        className={cn(
          "mt-4 items-center rounded-control py-3.5",
          isBusy && "opacity-70"
        )}
        style={{ backgroundColor: colors.error }}
        onPress={handleLogout}
        disabled={isBusy}
      >
        {isLoading && !isUploadingAvatar ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Text
            className="text-base font-semibold"
            style={{ color: colors.onPrimary }}
          >
            Logout
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}
