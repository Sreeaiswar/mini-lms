import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useResponsiveLayout } from "../../src/hooks/useResponsiveLayout";
import { Image } from "expo-image";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

import { publicApi } from "../../src/api/publicApi";
import { BookmarkIcon } from "../../src/components/BookmarkIcon";
import { CourseImage } from "../../src/components/common/CourseImage";
import { CourseProgressBadge } from "../../src/components/common/CourseProgressBadge";
import { ErrorState } from "../../src/components/common/ErrorState";
import { LoadingState } from "../../src/components/common/LoadingState";
import { ProgressBar } from "../../src/components/common/ProgressBar";
import { useNetworkStatus } from "../../src/hooks/useNetworkStatus";
import { useTheme } from "../../src/hooks/useTheme";
import { courseCache } from "../../src/services/courseCache";
import {
  useBookmarkStore,
  useIsCourseBookmarked,
} from "../../src/store/bookmarkStore";
import { useEnrollmentStore } from "../../src/store/enrollmentStore";
import { useProgressStore } from "../../src/store/progressStore";
import { useToastStore } from "../../src/store/toastStore";
import type { CourseDetail } from "../../src/types/courseTypes";
import { findCourseDetailById, toCourseDetail } from "../../src/utils/mapCourses";
import { cn } from "../../src/utils/cn";

const COURSE_LIMIT = 10;

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const courseId = Number(id);
  const { colors, isDark } = useTheme();
  const { isLandscape, contentPadding, maxContentWidth, heroImageHeight } =
    useResponsiveLayout();

  const { isOffline } = useNetworkStatus();
  const showToast = useToastStore((state) => state.showToast);

  const hydrateBookmarks = useBookmarkStore((state) => state.hydrate);
  const toggleBookmark = useBookmarkStore((state) => state.toggleBookmark);
  const bookmarked = useIsCourseBookmarked(courseId);

  const hydrateEnrollments = useEnrollmentStore((state) => state.hydrate);
  const hydrateProgress = useProgressStore((state) => state.hydrate);
  const enrollInCourse = useEnrollmentStore((state) => state.enroll);

  // Subscribe to the actual data slices so this screen re-renders when progress
  // updates from the learn screen / WebView / module-complete actions.
  const enrollment = useEnrollmentStore((state) =>
    state.enrollments.find((item) => item.course.id === courseId)
  );
  const storedCourseProgress = useProgressStore(
    (state) => state.progressByCourseId[String(courseId)]
  );
  const enrolled = enrollment != null;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const loadFromCacheOrEnrollment = useCallback(async (): Promise<boolean> => {
    const storedEnrollment = useEnrollmentStore
      .getState()
      .getEnrollmentByCourseId(courseId);

    if (storedEnrollment) {
      setCourse(storedEnrollment.course);
      setErrorMessage(null);
      return true;
    }

    const cachedCourses = await courseCache.getCourses();
    const cachedItem = cachedCourses?.find((item) => item.id === courseId);

    if (cachedItem) {
      setCourse(toCourseDetail(cachedItem));
      setErrorMessage(null);
      return true;
    }

    return false;
  }, [courseId]);

  const loadCourse = useCallback(async () => {
    if (!Number.isFinite(courseId)) {
      setErrorMessage("Invalid course.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    if (isOffline) {
      const found = await loadFromCacheOrEnrollment();

      if (!found) {
        setCourse(null);
        setErrorMessage("Course unavailable offline.");
      }

      setIsLoading(false);
      return;
    }

    try {
      const [usersResponse, productsResponse] = await Promise.all([
        publicApi.getRandomUsers(COURSE_LIMIT),
        publicApi.getRandomProducts(COURSE_LIMIT),
      ]);

      const detail = findCourseDetailById(
        courseId,
        productsResponse.data.data,
        usersResponse.data.data
      );

      if (detail) {
        setCourse(detail);
        return;
      }

      const found = await loadFromCacheOrEnrollment();

      if (!found) {
        setCourse(null);
        setErrorMessage("Course not found.");
      }
    } catch {
      const found = await loadFromCacheOrEnrollment();

      if (!found) {
        setCourse(null);
        setErrorMessage("Could not load course details. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [courseId, isOffline, loadFromCacheOrEnrollment]);

  useEffect(() => {
    void hydrateBookmarks();
    void hydrateProgress().then(() => hydrateEnrollments());
    void loadCourse();
  }, [hydrateBookmarks, hydrateEnrollments, hydrateProgress, loadCourse]);

  const handleEnroll = useCallback(async () => {
    if (isEnrolling || !course || enrolled || isOffline) {
      return;
    }

    setIsEnrolling(true);

    try {
      await enrollInCourse(course);
      showToast("Course enrolled", "success");
    } finally {
      setIsEnrolling(false);
    }
  }, [course, enrollInCourse, enrolled, isEnrolling, isOffline, showToast]);

  const handleToggleBookmark = useCallback(async () => {
    if (!course) {
      return;
    }

    const wasBookmarked = bookmarked;
    await toggleBookmark(course);
    showToast(
      wasBookmarked ? "Bookmark removed" : "Bookmark added",
      "success"
    );
  }, [bookmarked, course, showToast, toggleBookmark]);

  const handleContinueLearning = useCallback(() => {
    if (!course) {
      return;
    }

    router.push(`/(course)/learn/${course.id}`);
  }, [course]);

  const handleOpenCourseContent = useCallback(() => {
    if (!course) {
      return;
    }

    router.push(`/(course)/content/${course.id}`);
  }, [course]);

  const headerBack = useCallback(() => (
    <Pressable
      onPress={() => router.back()}
      hitSlop={10}
      className="rounded-full p-1.5"
      accessibilityRole="button"
      accessibilityLabel="Go back"
    >
      <ArrowLeft size={22} color={colors.headerText} />
    </Pressable>
  ), [colors.headerText]);

  const headerScreenOptions = useMemo(
    () => ({
      headerStyle: { backgroundColor: colors.header },
      headerTintColor: colors.headerText,
      headerTitleStyle: { color: colors.headerText },
    }),
    [colors.header, colors.headerText]
  );

  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Course Details",
            headerLeft: headerBack,
            ...headerScreenOptions,
          }}
        />
        <LoadingState message="Loading courses..." />
      </>
    );
  }

  if (errorMessage || !course) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Course Details",
            headerLeft: headerBack,
            ...headerScreenOptions,
          }}
        />
        <ErrorState
          message={errorMessage ?? "Course not found."}
          onRetry={() => void loadCourse()}
        />
      </>
    );
  }

  const progressPercent = enrolled
    ? (enrollment?.progressPercent ?? storedCourseProgress ?? 0)
    : 0;
  const enrollLabel = isEnrolling
    ? "Enrolling..."
    : enrolled
      ? "Enrolled ✓"
      : "Enroll";

  // Black in light mode, white in dark mode
  const buttonTextColor = isDark ? "#ffffff" : "#000000";

  return (
    <>
      <Stack.Screen
        options={{
          title: course.title,
          headerLeft: headerBack,
          ...headerScreenOptions,
        }}
      />
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={{
          padding: contentPadding,
          paddingBottom: 40,
          maxWidth: maxContentWidth,
          alignSelf: maxContentWidth ? "center" : undefined,
          width: maxContentWidth ? "100%" : undefined,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className={cn("gap-4", isLandscape && "flex-row items-start")}
          style={isLandscape ? { gap: 20 } : undefined}
        >
          <View
            className={cn("relative mb-4", isLandscape && "mb-0 flex-1")}
          >
            <CourseImage
              uri={course.thumbnail}
              category={course.category}
              style={{ width: "100%", height: heroImageHeight }}
              containerStyle={{ width: "100%", height: heroImageHeight }}
              borderRadius={14}
            />
            <View
              className="absolute right-3 top-3 rounded-3xl"
              style={{
                backgroundColor: isDark
                  ? "rgba(15,23,42,0.85)"
                  : "rgba(255,255,255,0.9)",
              }}
            >
              <BookmarkIcon
                size="large"
                isBookmarked={bookmarked}
                onPress={() => void handleToggleBookmark()}
              />
            </View>
          </View>

          <View className={isLandscape ? "flex-[1.2]" : undefined}>
            <Text
              className="mb-1 text-2xl font-bold"
              style={{ color: colors.text }}
            >
              {course.title}
            </Text>
            <Text
              className="mb-3 text-sm font-semibold capitalize"
              style={{ color: colors.primary }}
            >
              {course.category}
            </Text>

            <View className="mb-5 flex-row flex-wrap" style={{ gap: 12 }}>
              <Text
                className="text-[15px] font-semibold"
                style={{ color: colors.warning }}
              >
                ★ {course.rating.toFixed(1)}
              </Text>
              <Text
                className="text-[15px] font-bold"
                style={{ color: colors.text }}
              >
                ${course.price.toFixed(2)}
              </Text>
              <Text
                className="text-[15px]"
                style={{ color: colors.mutedText }}
              >
                {course.brand}
              </Text>
            </View>

            <Text
              className="mb-2 text-base font-bold"
              style={{ color: colors.secondaryText }}
            >
              Description
            </Text>
            <Text
              className="mb-6 text-[15px] leading-[22px]"
              style={{ color: colors.secondaryText }}
            >
              {course.description}
            </Text>

            <Text
              className="mb-2 text-base font-bold"
              style={{ color: colors.secondaryText }}
            >
              Instructor
            </Text>
            <View
              className="mb-7 flex-row items-center gap-3 rounded-xl border p-3.5"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
            >
              <Image
                source={{ uri: course.instructorAvatar }}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: colors.border,
                }}
                contentFit="cover"
              />
              <View className="flex-1">
                <Text
                  className="mb-1 text-base font-bold"
                  style={{ color: colors.text }}
                >
                  {course.instructorName}
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: colors.mutedText }}
                >
                  {course.instructorEmail}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Open Course Content button — black text in light, white in dark */}
        <Pressable
          className="mb-4 items-center rounded-xl py-3.5"
          style={({ pressed }) => ({
            backgroundColor: pressed ? colors.accentDark : colors.accent,
          })}
          onPress={handleOpenCourseContent}
        >
          <Text
            className="text-base font-bold"
            style={{ color: buttonTextColor }}
          >
            Open Course Content
          </Text>
        </Pressable>

        {/* Enroll button — black text in light, white in dark */}
        <Pressable
          className={cn(
            "min-h-[52px] items-center justify-center rounded-xl py-4",
            isEnrolling && "opacity-[0.85]"
          )}
          style={({ pressed }) => ({
            backgroundColor: enrolled
              ? colors.success
              : pressed && !isEnrolling
                ? colors.primaryDark
                : colors.primary,
          })}
          onPress={() => void handleEnroll()}
          disabled={enrolled || isEnrolling || isOffline}
        >
          {isEnrolling ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text
              className="text-[17px] font-bold"
              style={{ color: buttonTextColor }}
            >
              {enrollLabel}
            </Text>
          )}
        </Pressable>

        {enrolled ? (
          <>
            <View className="mt-4 gap-2">
              <CourseProgressBadge progressPercent={progressPercent} />
              <ProgressBar progress={progressPercent} />
            </View>
            <Pressable
              className="mt-3 items-center rounded-xl py-3.5"
              style={{
                backgroundColor: colors.buttonOnDarkBg,
                borderWidth: isDark ? 1 : 0,
                borderColor: colors.border,
              }}
              onPress={handleContinueLearning}
            >
              <Text
                className="text-base font-bold"
                style={{ color: colors.buttonOnDarkText }}
              >
                {progressPercent >= 100
                  ? "Review Course Content"
                  : "Continue Learning"}
              </Text>
            </Pressable>
          </>
        ) : null}
      </ScrollView>
    </>
  );
}