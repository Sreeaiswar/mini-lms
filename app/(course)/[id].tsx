import { useCallback, useEffect, useState } from "react";
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
  const checkIsEnrolled = useEnrollmentStore((state) => state.isEnrolled);
  const getEnrollmentByCourseId = useEnrollmentStore(
    (state) => state.getEnrollmentByCourseId
  );
  const getProgress = useProgressStore((state) => state.getProgress);

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const loadFromCacheOrEnrollment = useCallback(async (): Promise<boolean> => {
    const storedEnrollment = getEnrollmentByCourseId(courseId);

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
  }, [courseId, getEnrollmentByCourseId]);

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
    if (isEnrolling || !course || checkIsEnrolled(course.id) || isOffline) {
      return;
    }

    setIsEnrolling(true);

    try {
      await enrollInCourse(course);
      showToast("Course enrolled", "success");
    } finally {
      setIsEnrolling(false);
    }
  }, [
    checkIsEnrolled,
    course,
    enrollInCourse,
    isEnrolling,
    isOffline,
    showToast,
  ]);

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
      <ArrowLeft size={22} color="#0f172a" />
    </Pressable>
  ), []);

  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Course Details",
            headerLeft: headerBack,
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
          }}
        />
        <ErrorState
          message={errorMessage ?? "Course not found."}
          onRetry={() => void loadCourse()}
        />
      </>
    );
  }

  const enrolled = checkIsEnrolled(course.id);
  const enrollment = getEnrollmentByCourseId(course.id);
  const progressPercent = enrolled
    ? (enrollment?.progressPercent ?? getProgress(course.id))
    : 0;
  const enrollLabel = isEnrolling
    ? "Enrolling..."
    : enrolled
      ? "Enrolled ✓"
      : "Enroll";

  return (
    <>
      <Stack.Screen
        options={{
          title: course.title,
          headerLeft: headerBack,
        }}
      />
      <ScrollView
        className="flex-1 bg-canvas"
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
            <View className="absolute right-3 top-3 rounded-3xl bg-white/90">
              <BookmarkIcon
                size="large"
                isBookmarked={bookmarked}
                onPress={() => void handleToggleBookmark()}
              />
            </View>
          </View>

          <View className={isLandscape ? "flex-[1.2]" : undefined}>
            <Text className="mb-1 text-2xl font-bold text-ink">
              {course.title}
            </Text>
            <Text className="mb-3 text-sm font-semibold capitalize text-brand">
              {course.category}
            </Text>

            <View className="mb-5 flex-row flex-wrap" style={{ gap: 12 }}>
              <Text className="text-[15px] font-semibold text-[#ca8a04]">
                ★ {course.rating.toFixed(1)}
              </Text>
              <Text className="text-[15px] font-bold text-ink">
                ${course.price.toFixed(2)}
              </Text>
              <Text className="text-[15px] text-muted">{course.brand}</Text>
            </View>

            <Text className="mb-2 text-base font-bold text-label">
              Description
            </Text>
            <Text className="mb-6 text-[15px] leading-[22px] text-body">
              {course.description}
            </Text>

            <Text className="mb-2 text-base font-bold text-label">
              Instructor
            </Text>
            <View className="mb-7 flex-row items-center gap-3 rounded-xl border border-line bg-white p-3.5">
              <Image
                source={{ uri: course.instructorAvatar }}
                style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "#e2e8f0" }}
                contentFit="cover"
              />
              <View className="flex-1">
                <Text className="mb-1 text-base font-bold text-ink">
                  {course.instructorName}
                </Text>
                <Text className="text-sm text-muted">
                  {course.instructorEmail}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Pressable
          className="mb-4 items-center rounded-xl bg-[#7c3aed] py-3.5"
          onPress={handleOpenCourseContent}
        >
          <Text className="text-base font-bold text-white">
            Open Course Content
          </Text>
        </Pressable>

        <Pressable
          className={cn(
            "min-h-[52px] items-center justify-center rounded-xl py-4",
            enrolled ? "bg-[#16a34a]" : "bg-brand",
            isEnrolling && "opacity-[0.85]"
          )}
          style={({ pressed }) =>
            pressed && !enrolled && !isEnrolling
              ? { backgroundColor: "#1d4ed8" }
              : undefined
          }
          onPress={() => void handleEnroll()}
          disabled={enrolled || isEnrolling || isOffline}
        >
          {isEnrolling ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-[17px] font-bold text-white">{enrollLabel}</Text>
          )}
        </Pressable>

        {enrolled ? (
          <>
            <View className="mt-4 gap-2">
              <CourseProgressBadge progressPercent={progressPercent} />
              <ProgressBar progress={progressPercent} />
            </View>
            <Pressable
              className="mt-3 items-center rounded-xl bg-ink py-3.5"
              onPress={handleContinueLearning}
            >
              <Text className="text-base font-bold text-white">
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
