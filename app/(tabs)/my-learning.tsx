import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { useResponsiveLayout } from "../../src/hooks/useResponsiveLayout";
import { router } from "expo-router";
import { Award, CheckCircle2 } from "lucide-react-native";

import { CourseImage } from "../../src/components/common/CourseImage";
import { CourseProgressBadge } from "../../src/components/common/CourseProgressBadge";
import { EmptyState } from "../../src/components/common/EmptyState";
import { ErrorState } from "../../src/components/common/ErrorState";
import { LoadingState } from "../../src/components/common/LoadingState";
import { ProgressBar } from "../../src/components/common/ProgressBar";
import { useNetworkStatus } from "../../src/hooks/useNetworkStatus";
import { useEnrollmentStore } from "../../src/store/enrollmentStore";
import { useProgressStore } from "../../src/store/progressStore";
import type { EnrolledCourse } from "../../src/types/enrollmentTypes";
import { shadows } from "../../src/styles/ui";
import { cn } from "../../src/utils/cn";

function sortLearningEnrollments(
  enrollments: EnrolledCourse[]
): EnrolledCourse[] {
  return [...enrollments].sort((a, b) => {
    const aCompleted = a.progressPercent >= 100;
    const bCompleted = b.progressPercent >= 100;

    if (aCompleted !== bCompleted) {
      return aCompleted ? 1 : -1;
    }

    if (!aCompleted && !bCompleted && a.progressPercent !== b.progressPercent) {
      return b.progressPercent - a.progressPercent;
    }

    return (
      new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime()
    );
  });
}

const THUMB = { width: 104, height: 118 } as const;

function LearningCourseCard({
  enrollment,
  isCompleted,
  cardStyle,
}: {
  enrollment: EnrolledCourse;
  isCompleted: boolean;
  cardStyle?: ViewStyle;
}) {
  const { course, progressPercent } = enrollment;

  const handlePress = useCallback(() => {
    router.push(`/(course)/learn/${course.id}`);
  }, [course.id]);

  return (
    <Pressable
      className={cn(
        "mb-3 flex-row overflow-hidden rounded-card border border-line bg-white",
        isCompleted && "border-[#bbf7d0]"
      )}
      style={({ pressed }) => [
        shadows.learningCard,
        cardStyle,
        pressed && { opacity: 0.92 },
      ]}
      onPress={handlePress}
    >
      <CourseImage
        uri={course.thumbnail}
        category={course.category}
        style={THUMB}
        containerStyle={THUMB}
        borderRadius={0}
      />
      <View className="flex-1 justify-center gap-1.5 p-3">
        <View className="flex-row items-start gap-2">
          <Text className="flex-1 text-base font-bold text-ink" numberOfLines={2}>
            {course.title}
          </Text>
          {isCompleted ? (
            <View className="pt-0.5">
              <CheckCircle2 size={22} color="#16a34a" />
            </View>
          ) : null}
        </View>
        {isCompleted ? (
          <View className="flex-row items-center gap-1.5">
            <Award size={14} color="#15803d" />
            <Text className="text-xs font-bold text-[#15803d]">
              Completed · 100%
            </Text>
          </View>
        ) : (
          <CourseProgressBadge progressPercent={progressPercent} />
        )}
        <ProgressBar progress={progressPercent} />
        <Text className="text-[13px] font-semibold text-muted">
          {isCompleted
            ? "Review course content →"
            : progressPercent > 0
              ? "Continue learning →"
              : "Start course →"}
        </Text>
      </View>
    </Pressable>
  );
}

export default function MyLearningScreen() {
  const { isOffline } = useNetworkStatus();
  const { isLandscape, contentPadding, maxContentWidth } = useResponsiveLayout();
  const hydrateEnrollments = useEnrollmentStore((state) => state.hydrate);
  const hydrateProgress = useProgressStore((state) => state.hydrate);
  const enrollments = useEnrollmentStore((state) => state.enrollments);
  const isEnrollmentsHydrated = useEnrollmentStore((state) => state.isHydrated);
  const isProgressHydrated = useProgressStore((state) => state.isHydrated);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadLearningData = useCallback(async () => {
    setLoadError(null);

    try {
      await hydrateProgress();
      await hydrateEnrollments();
    } catch {
      setLoadError("Could not load your learning progress. Please try again.");
    }
  }, [hydrateEnrollments, hydrateProgress]);

  const handleRefresh = useCallback(async () => {
    if (isOffline) {
      return;
    }

    setIsRefreshing(true);
    await loadLearningData();
    setIsRefreshing(false);
  }, [isOffline, loadLearningData]);

  useEffect(() => {
    void loadLearningData();
  }, [loadLearningData]);

  const sortedEnrollments = useMemo(
    () => sortLearningEnrollments(enrollments),
    [enrollments]
  );

  const { continueLearning, completedCourses } = useMemo(() => {
    const inProgress: EnrolledCourse[] = [];
    const completed: EnrolledCourse[] = [];

    for (const enrollment of sortedEnrollments) {
      if (enrollment.progressPercent >= 100) {
        completed.push(enrollment);
      } else {
        inProgress.push(enrollment);
      }
    }

    return {
      continueLearning: inProgress,
      completedCourses: completed,
    };
  }, [sortedEnrollments]);

  const isHydrated = isEnrollmentsHydrated && isProgressHydrated;

  if (!isHydrated && !loadError) {
    return <LoadingState message="Loading learning progress..." />;
  }

  if (loadError) {
    return (
      <ErrorState
        message={loadError}
        onRetry={() => void loadLearningData()}
      />
    );
  }

  const landscapeCardStyle: ViewStyle | undefined = isLandscape
    ? { flex: 1, minWidth: "48%", maxWidth: "49%" }
    : undefined;

  return (
    <ScrollView
      className="flex-1 bg-canvas"
      contentContainerStyle={{
        flexGrow: 1,
        padding: contentPadding,
        paddingBottom: 32,
        maxWidth: maxContentWidth,
        alignSelf: maxContentWidth ? "center" : undefined,
        width: maxContentWidth ? "100%" : undefined,
      }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => void handleRefresh()}
          enabled={!isOffline}
          tintColor="#2563eb"
          colors={["#2563eb"]}
        />
      }
    >
      <Text className="mb-6 text-[26px] font-bold text-ink">My Learning</Text>

      {enrollments.length === 0 ? (
        <View className="items-center gap-4">
          <EmptyState
            title="Nothing to continue"
            subtitle="Enroll in a course and begin learning."
          />
          <Pressable
            className="rounded-control bg-brand px-5 py-3"
            onPress={() => router.push("/(tabs)/home")}
          >
            <Text className="text-[15px] font-semibold text-white">
              Browse Courses
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          {continueLearning.length > 0 ? (
            <View className="mb-7">
              <View className="mb-3.5 flex-row items-center justify-between">
                <Text className="text-lg font-bold text-label">
                  Continue Learning
                </Text>
                <Text className="rounded-chip bg-line px-2.5 py-1 text-[13px] font-bold text-muted">
                  {continueLearning.length}
                </Text>
              </View>
              <View
                style={
                  isLandscape
                    ? { flexDirection: "row", flexWrap: "wrap", gap: 12 }
                    : { gap: 0 }
                }
              >
                {continueLearning.map((enrollment) => (
                  <LearningCourseCard
                    key={enrollment.course.id}
                    enrollment={enrollment}
                    isCompleted={false}
                    cardStyle={landscapeCardStyle}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {completedCourses.length > 0 ? (
            <View className="mb-7">
              <View className="mb-3.5 flex-row items-center justify-between">
                <Text className="text-lg font-bold text-label">
                  Completed Courses
                </Text>
                <Text className="rounded-chip bg-line px-2.5 py-1 text-[13px] font-bold text-muted">
                  {completedCourses.length}
                </Text>
              </View>
              <View
                style={
                  isLandscape
                    ? { flexDirection: "row", flexWrap: "wrap", gap: 12 }
                    : { gap: 0 }
                }
              >
                {completedCourses.map((enrollment) => (
                  <LearningCourseCard
                    key={enrollment.course.id}
                    enrollment={enrollment}
                    isCompleted
                    cardStyle={landscapeCardStyle}
                  />
                ))}
              </View>
            </View>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}
