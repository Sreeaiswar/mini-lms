import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useResponsiveLayout } from "../../../src/hooks/useResponsiveLayout";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react-native";

import { CourseProgressBadge } from "../../../src/components/common/CourseProgressBadge";
import { LoadingState } from "../../../src/components/common/LoadingState";
import { ProgressBar } from "../../../src/components/common/ProgressBar";
import { useTheme } from "../../../src/hooks/useTheme";
import { useEnrollmentStore } from "../../../src/store/enrollmentStore";
import { useProgressStore } from "../../../src/store/progressStore";
import { useToastStore } from "../../../src/store/toastStore";
import type { CourseModule } from "../../../src/utils/courseContent";
import { getCourseContent } from "../../../src/utils/courseContent";
import { cn } from "../../../src/utils/cn";

export default function CourseLearningScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const courseId = Number(id);
  const { colors } = useTheme();
  const { contentPadding, maxContentWidth, isLandscape } = useResponsiveLayout();

  const hydrateEnrollments = useEnrollmentStore((state) => state.hydrate);
  const hydrateProgress = useProgressStore((state) => state.hydrate);
  const syncCourseProgress = useEnrollmentStore((state) => state.syncCourseProgress);
  const getEnrollmentByCourseId = useEnrollmentStore(
    (state) => state.getEnrollmentByCourseId
  );
  const isEnrolled = useEnrollmentStore((state) => state.isEnrolled);
  const markLessonComplete = useProgressStore((state) => state.markLessonComplete);
  const markModuleComplete = useProgressStore((state) => state.markModuleComplete);
  const isLessonComplete = useProgressStore((state) => state.isLessonComplete);
  const getProgress = useProgressStore((state) => state.getProgress);
  const storedProgress = useProgressStore(
    (state) => state.progressByCourseId[String(courseId)]
  );
  const showToast = useToastStore((state) => state.showToast);

  const [modules, setModules] = useState<CourseModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completingLessonId, setCompletingLessonId] = useState<string | null>(
    null
  );
  const [completingModuleId, setCompletingModuleId] = useState<string | null>(
    null
  );

  const loadContent = useCallback(async () => {
    if (!Number.isFinite(courseId)) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    await hydrateProgress();
    await hydrateEnrollments();
    setModules(getCourseContent(courseId));
    setIsLoading(false);
  }, [courseId, hydrateEnrollments, hydrateProgress]);

  useEffect(() => {
    void loadContent();
  }, [loadContent]);

  const enrollment = getEnrollmentByCourseId(courseId);

  const progressPercent = useMemo(
    () => storedProgress ?? enrollment?.progressPercent ?? getProgress(courseId),
    [storedProgress, enrollment?.progressPercent, getProgress, courseId]
  );

  const handleMarkLessonComplete = useCallback(
    async (lessonId: string) => {
      if (completingLessonId || isLessonComplete(courseId, lessonId)) {
        return;
      }

      setCompletingLessonId(lessonId);

      try {
        const newProgress = await markLessonComplete(courseId, lessonId);
        await syncCourseProgress(courseId, newProgress);
        showToast("Lesson completed", "success");
      } finally {
        setCompletingLessonId(null);
      }
    },
    [
      completingLessonId,
      courseId,
      isLessonComplete,
      markLessonComplete,
      showToast,
      syncCourseProgress,
    ]
  );

  const handleMarkModuleComplete = useCallback(
    async (courseModule: CourseModule) => {
      if (completingModuleId) {
        return;
      }

      const pendingLessonIds = courseModule.lessons
        .map((lesson) => lesson.id)
        .filter((lessonId) => !isLessonComplete(courseId, lessonId));

      if (pendingLessonIds.length === 0) {
        return;
      }

      setCompletingModuleId(courseModule.id);

      try {
        const newProgress = await markModuleComplete(courseId, pendingLessonIds);
        await syncCourseProgress(courseId, newProgress);
        showToast("Module completed", "success");
      } finally {
        setCompletingModuleId(null);
      }
    },
    [
      completingModuleId,
      courseId,
      isLessonComplete,
      markModuleComplete,
      showToast,
      syncCourseProgress,
    ]
  );

  const handleGoBack = useCallback(() => {
    router.back();
  }, []);

  const handleViewCourse = useCallback(() => {
    router.replace(`/(course)/${courseId}`);
  }, [courseId]);

  const headerBack = (
    <Pressable onPress={handleGoBack} hitSlop={10} className="rounded-full p-1.5">
      <ArrowLeft size={22} color={colors.headerText} />
    </Pressable>
  );

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
          options={{ title: "Course Content", ...headerScreenOptions }}
        />
        <LoadingState message="Loading learning progress..." />
      </>
    );
  }

  if (!Number.isFinite(courseId) || !isEnrolled(courseId) || !enrollment) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Course Content",
            headerLeft: () => headerBack,
            ...headerScreenOptions,
          }}
        />
        <View
          className="flex-1 items-center justify-center gap-3 px-6"
          style={{ backgroundColor: colors.background }}
        >
          <Text
            className="text-center text-[15px] leading-[22px]"
            style={{ color: colors.mutedText }}
          >
            Enroll in this course to access learning content.
          </Text>
          <Pressable
            className="rounded-lg px-5 py-2.5"
            style={{ backgroundColor: colors.primary }}
            onPress={handleViewCourse}
          >
            <Text
              className="font-semibold"
              style={{ color: colors.onPrimary }}
            >
              View Course
            </Text>
          </Pressable>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: enrollment.course.title,
          headerLeft: () => headerBack,
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
        <Text
          className="mb-2 text-[22px] font-bold"
          style={{ color: colors.text }}
        >
          Course Content
        </Text>
        <View className="mb-6 gap-2">
          <CourseProgressBadge progressPercent={progressPercent} />
          <ProgressBar progress={progressPercent} />
        </View>

        <View className={cn(isLandscape && "flex-row flex-wrap gap-3")}>
          {modules.map((module) => {
            const totalLessons = module.lessons.length;
            const completedLessons = module.lessons.filter((lesson) =>
              isLessonComplete(courseId, lesson.id)
            ).length;
            const moduleCompleted =
              totalLessons > 0 && completedLessons === totalLessons;
            const isCompletingModule = completingModuleId === module.id;

            return (
              <View
                key={module.id}
                className={cn(
                  "mb-4 rounded-xl border p-4",
                  isLandscape && "mb-0 min-w-[48%] max-w-[49%] flex-1"
                )}
                style={{
                  backgroundColor: colors.card,
                  borderColor: moduleCompleted ? colors.success : colors.border,
                }}
              >
                <View className="mb-3 flex-row items-start justify-between gap-2">
                  <Text
                    className="flex-1 text-[17px] font-bold"
                    style={{ color: colors.text }}
                  >
                    {module.title}
                  </Text>
                  {moduleCompleted ? (
                    <View
                      className="flex-row items-center gap-1 rounded-md px-2 py-1"
                      style={{ backgroundColor: colors.successBg }}
                    >
                      <CheckCircle2 size={14} color={colors.success} />
                      <Text
                        className="text-[11px] font-bold"
                        style={{ color: colors.successText }}
                      >
                        Completed
                      </Text>
                    </View>
                  ) : (
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: colors.mutedText }}
                    >
                      {completedLessons}/{totalLessons}
                    </Text>
                  )}
                </View>

                {module.lessons.map((lesson) => {
                  const completed = isLessonComplete(courseId, lesson.id);
                  const isCompleting = completingLessonId === lesson.id;

                  return (
                    <View
                      key={lesson.id}
                      className="flex-row items-center justify-between gap-3 border-t py-2.5"
                      style={{ borderColor: colors.border }}
                    >
                      <View className="flex-1 flex-row items-center gap-2.5">
                        {completed ? (
                          <CheckCircle2 size={20} color={colors.success} />
                        ) : (
                          <Circle size={20} color={colors.placeholder} />
                        )}
                        <Text
                          className={cn(
                            "flex-1 text-sm font-semibold",
                            completed && "line-through"
                          )}
                          style={{
                            color: completed
                              ? colors.mutedText
                              : colors.secondaryText,
                          }}
                        >
                          {lesson.title}
                        </Text>
                      </View>
                      <Pressable
                        className="min-w-[118px] items-center rounded-lg px-3 py-2"
                        style={({ pressed }) => ({
                          backgroundColor: completed
                            ? colors.success
                            : pressed
                              ? colors.primaryDark
                              : colors.primary,
                        })}
                        onPress={() => void handleMarkLessonComplete(lesson.id)}
                        disabled={completed || isCompleting}
                      >
                        {isCompleting ? (
                          <ActivityIndicator
                            color={colors.onPrimary}
                            size="small"
                          />
                        ) : (
                          <Text
                            className="text-xs font-bold"
                            style={{ color: colors.onPrimary }}
                          >
                            {completed ? "Completed" : "Mark Complete"}
                          </Text>
                        )}
                      </Pressable>
                    </View>
                  );
                })}

                <Pressable
                  className="mt-4 items-center justify-center rounded-lg py-3"
                  style={({ pressed }) => ({
                    backgroundColor: moduleCompleted
                      ? colors.successBg
                      : pressed
                        ? colors.primaryDark
                        : colors.primary,
                    borderWidth: moduleCompleted ? 1 : 0,
                    borderColor: colors.success,
                  })}
                  onPress={() => void handleMarkModuleComplete(module)}
                  disabled={moduleCompleted || isCompletingModule}
                  accessibilityRole="button"
                  accessibilityLabel={
                    moduleCompleted
                      ? `${module.title} completed`
                      : `Mark ${module.title} as complete`
                  }
                >
                  {isCompletingModule ? (
                    <ActivityIndicator color={colors.onPrimary} />
                  ) : (
                    <Text
                      className="text-sm font-bold"
                      style={{
                        color: moduleCompleted
                          ? colors.successText
                          : colors.onPrimary,
                      }}
                    >
                      {moduleCompleted
                        ? "Module Completed ✓"
                        : "Mark Module as Complete"}
                    </Text>
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </>
  );
}
