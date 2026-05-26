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
import { useEnrollmentStore } from "../../../src/store/enrollmentStore";
import { useProgressStore } from "../../../src/store/progressStore";
import { useToastStore } from "../../../src/store/toastStore";
import type { CourseModule } from "../../../src/utils/courseContent";
import { getCourseContent } from "../../../src/utils/courseContent";
import { cn } from "../../../src/utils/cn";

export default function CourseLearningScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const courseId = Number(id);
  const { contentPadding, maxContentWidth, isLandscape } = useResponsiveLayout();

  const hydrateEnrollments = useEnrollmentStore((state) => state.hydrate);
  const hydrateProgress = useProgressStore((state) => state.hydrate);
  const syncCourseProgress = useEnrollmentStore((state) => state.syncCourseProgress);
  const getEnrollmentByCourseId = useEnrollmentStore(
    (state) => state.getEnrollmentByCourseId
  );
  const isEnrolled = useEnrollmentStore((state) => state.isEnrolled);
  const markLessonComplete = useProgressStore((state) => state.markLessonComplete);
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

  const handleGoBack = useCallback(() => {
    router.back();
  }, []);

  const handleViewCourse = useCallback(() => {
    router.replace(`/(course)/${courseId}`);
  }, [courseId]);

  const headerBack = (
    <Pressable onPress={handleGoBack} hitSlop={10} className="rounded-full p-1.5">
      <ArrowLeft size={22} color="#0f172a" />
    </Pressable>
  );

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: "Course Content" }} />
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
          }}
        />
        <View className="flex-1 items-center justify-center gap-3 bg-canvas px-6">
          <Text className="text-center text-[15px] leading-[22px] text-muted">
            Enroll in this course to access learning content.
          </Text>
          <Pressable
            className="rounded-lg bg-brand px-5 py-2.5"
            onPress={handleViewCourse}
          >
            <Text className="font-semibold text-white">View Course</Text>
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
        <Text className="mb-2 text-[22px] font-bold text-ink">
          Course Content
        </Text>
        <View className="mb-6 gap-2">
          <CourseProgressBadge progressPercent={progressPercent} />
          <ProgressBar progress={progressPercent} />
        </View>

        <View className={cn(isLandscape && "flex-row flex-wrap gap-3")}>
          {modules.map((module) => (
            <View
              key={module.id}
              className={cn(
                "mb-4 rounded-xl border border-line bg-white p-4",
                isLandscape && "mb-0 min-w-[48%] max-w-[49%] flex-1"
              )}
            >
              <Text className="mb-3 text-[17px] font-bold text-ink">
                {module.title}
              </Text>
              {module.lessons.map((lesson) => {
                const completed = isLessonComplete(courseId, lesson.id);
                const isCompleting = completingLessonId === lesson.id;

                return (
                  <View
                    key={lesson.id}
                    className="flex-row items-center justify-between gap-3 border-t border-[#f1f5f9] py-2.5"
                  >
                    <View className="flex-1 flex-row items-center gap-2.5">
                      {completed ? (
                        <CheckCircle2 size={20} color="#16a34a" />
                      ) : (
                        <Circle size={20} color="#94a3b8" />
                      )}
                      <Text
                        className={cn(
                          "flex-1 text-sm font-semibold text-label",
                          completed && "text-muted line-through"
                        )}
                      >
                        {lesson.title}
                      </Text>
                    </View>
                    <Pressable
                      className={cn(
                        "min-w-[118px] items-center rounded-lg px-3 py-2",
                        completed ? "bg-[#16a34a]" : "bg-brand"
                      )}
                      style={({ pressed }) =>
                        pressed && !completed
                          ? { backgroundColor: "#1d4ed8" }
                          : undefined
                      }
                      onPress={() => void handleMarkLessonComplete(lesson.id)}
                      disabled={completed || isCompleting}
                    >
                      {isCompleting ? (
                        <ActivityIndicator color="#ffffff" size="small" />
                      ) : (
                        <Text className="text-xs font-bold text-white">
                          {completed ? "Completed" : "Mark Complete"}
                        </Text>
                      )}
                    </Pressable>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  );
}
