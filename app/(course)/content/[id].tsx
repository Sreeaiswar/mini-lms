import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import type { WebViewMessageEvent } from "react-native-webview";

import { publicApi } from "../../../src/api/publicApi";
import { ErrorState } from "../../../src/components/common/ErrorState";
import { LoadingState } from "../../../src/components/common/LoadingState";
import { useNetworkStatus } from "../../../src/hooks/useNetworkStatus";
import { useTheme } from "../../../src/hooks/useTheme";
import { courseCache } from "../../../src/services/courseCache";
import { useEnrollmentStore } from "../../../src/store/enrollmentStore";
import { useProgressStore } from "../../../src/store/progressStore";
import { useToastStore } from "../../../src/store/toastStore";
import type { CourseDetail } from "../../../src/types/courseTypes";
import type {
  CourseWebViewPayload,
  WebViewInboundMessage,
} from "../../../src/types/webViewTypes";
import { prepareWebViewSource } from "../../../src/utils/prepareWebViewSource";
import { getCourseContent } from "../../../src/utils/courseContent";
import { findCourseDetailById, toCourseDetail } from "../../../src/utils/mapCourses";

const COURSE_LIMIT = 10;

function parseWebViewMessage(data: string): WebViewInboundMessage | null {
  try {
    const parsed: unknown = JSON.parse(data);

    if (
      typeof parsed === "object" &&
      parsed != null &&
      "type" in parsed &&
      parsed.type === "COMPLETE_LESSON"
    ) {
      return { type: "COMPLETE_LESSON" };
    }

    if (
      typeof parsed === "object" &&
      parsed != null &&
      "type" in parsed &&
      parsed.type === "FEEDBACK" &&
      "value" in parsed &&
      typeof parsed.value === "string"
    ) {
      return { type: "FEEDBACK", value: parsed.value };
    }
  } catch {
    return null;
  }

  return null;
}

export default function CourseContentWebViewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const courseId = Number(id);
  const webViewRef = useRef<WebView>(null);
  const { isDark, colors } = useTheme();

  const { isOffline } = useNetworkStatus();
  const showToast = useToastStore((state) => state.showToast);

  const hydrateEnrollments = useEnrollmentStore((state) => state.hydrate);
  const hydrateProgress = useProgressStore((state) => state.hydrate);
  const syncCourseProgress = useEnrollmentStore(
    (state) => state.syncCourseProgress
  );
  const markLessonComplete = useProgressStore((state) => state.markLessonComplete);
  const isLessonComplete = useProgressStore((state) => state.isLessonComplete);

  // Subscribe reactively so the WebView regenerates when progress changes.
  const enrollment = useEnrollmentStore((state) =>
    state.enrollments.find((item) => item.course.id === courseId)
  );
  const storedCourseProgress = useProgressStore(
    (state) => state.progressByCourseId[String(courseId)]
  );
  const enrolled = enrollment != null;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);
  const [courseError, setCourseError] = useState<string | null>(null);
  const [isWebViewLoading, setIsWebViewLoading] = useState(true);
  const [webViewError, setWebViewError] = useState<string | null>(null);
  const [webViewKey, setWebViewKey] = useState(0);
  const [webViewSource, setWebViewSource] = useState<{
    uri: string;
    headers: Record<string, string>;
  } | null>(null);
  const [isPreparingWebView, setIsPreparingWebView] = useState(false);

  const loadFromCacheOrEnrollment = useCallback(async (): Promise<boolean> => {
    const storedEnrollment = useEnrollmentStore
      .getState()
      .getEnrollmentByCourseId(courseId);

    if (storedEnrollment) {
      setCourse(storedEnrollment.course);
      setCourseError(null);
      return true;
    }

    const cachedCourses = await courseCache.getCourses();
    const cachedItem = cachedCourses?.find((item) => item.id === courseId);

    if (cachedItem) {
      setCourse(toCourseDetail(cachedItem));
      setCourseError(null);
      return true;
    }

    return false;
  }, [courseId]);

  const loadCourse = useCallback(async () => {
    if (!Number.isFinite(courseId)) {
      setCourseError("Invalid course.");
      setIsLoadingCourse(false);
      return;
    }

    setIsLoadingCourse(true);
    setCourseError(null);

    if (isOffline) {
      const found = await loadFromCacheOrEnrollment();

      if (!found) {
        setCourse(null);
        setCourseError("Course unavailable offline.");
      }

      setIsLoadingCourse(false);
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
        setCourseError("Course not found.");
      }
    } catch {
      const found = await loadFromCacheOrEnrollment();

      if (!found) {
        setCourse(null);
        setCourseError("Could not load course content. Please try again.");
      }
    } finally {
      setIsLoadingCourse(false);
    }
  }, [courseId, isOffline, loadFromCacheOrEnrollment]);

  useEffect(() => {
    void hydrateProgress().then(() => hydrateEnrollments());
    void loadCourse();
  }, [hydrateEnrollments, hydrateProgress, loadCourse]);

  const progressPercent = course
    ? enrolled
      ? (enrollment?.progressPercent ?? storedCourseProgress ?? 0)
      : 0
    : 0;

  const webViewPayload: CourseWebViewPayload | null = useMemo(() => {
    if (!course) {
      console.log("[WebViewPayload] course is null");
      return null;
    }

    console.log("[WebViewPayload] building payload", {
      courseId: course.id,
      title: course.title,
      enrolled,
      progressPercent,
    });

    return {
      title: course.title,
      instructor: course.instructorName,
      description: course.description,
      category: course.category,
      progressPercent,
      enrollmentStatus: enrolled ? "Enrolled" : "Not Enrolled",
    };
  }, [course, enrolled, progressPercent]);

  useEffect(() => {
    if (!webViewPayload || !Number.isFinite(courseId)) {
      console.log("[WebViewSource] skipping preparation", {
        hasPayload: !!webViewPayload,
        courseId: Number.isFinite(courseId) ? courseId : "invalid",
      });
      setWebViewSource(null);
      return;
    }

    let cancelled = false;
    setIsPreparingWebView(true);

    console.log("[WebViewSource] starting preparation", { courseId, isDark });

    void prepareWebViewSource(courseId, webViewPayload, { isDark })
      .then((source) => {
        if (!cancelled) {
          console.log("[WebViewSource] preparation successful", {
            courseId,
            uri: source.uri,
          });
          setWebViewSource(source);
          setWebViewError(null);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("[WebViewSource] preparation failed", {
            courseId,
            error: error instanceof Error ? error.message : String(error),
          });
          setWebViewError("Failed to prepare course content.");
          setWebViewSource(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsPreparingWebView(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [courseId, webViewPayload, webViewKey, isDark]);

  const findNextLessonId = useCallback((): string | null => {
    const modules = getCourseContent(courseId);

    for (const courseModule of modules) {
      for (const lesson of courseModule.lessons) {
        if (!isLessonComplete(courseId, lesson.id)) {
          return lesson.id;
        }
      }
    }

    return null;
  }, [courseId, isLessonComplete]);

  const handleWebViewMessage = useCallback(
    async (event: WebViewMessageEvent) => {
      const message = parseWebViewMessage(event.nativeEvent.data);

      if (!message || !course) {
        return;
      }

      if (message.type === "FEEDBACK") {
        showToast(`Thanks for your feedback: ${message.value}`, "success");
        return;
      }

      if (message.type === "COMPLETE_LESSON") {
        if (!enrolled) {
          showToast("Enroll in this course to track lesson progress.", "info");
          return;
        }

        const lessonId = findNextLessonId();

        if (!lessonId) {
          showToast("All lessons are already complete.", "info");
          return;
        }

        const newProgress = await markLessonComplete(courseId, lessonId);
        await syncCourseProgress(courseId, newProgress);
        showToast("Lesson marked complete", "success");
        setWebViewKey((current) => current + 1);
      }
    },
    [
      course,
      enrolled,
      findNextLessonId,
      markLessonComplete,
      showToast,
      syncCourseProgress,
      courseId,
    ]
  );

  const handleRetryWebView = useCallback(() => {
    setWebViewError(null);
    setIsWebViewLoading(true);
    setWebViewKey((current) => current + 1);
  }, []);

  const headerScreenOptions = useMemo(
    () => ({
      headerStyle: { backgroundColor: colors.header },
      headerTintColor: colors.headerText,
      headerTitleStyle: { color: colors.headerText },
    }),
    [colors.header, colors.headerText]
  );

  if (isLoadingCourse) {
    return (
      <>
        <Stack.Screen options={{ title: "Course Content", ...headerScreenOptions }} />
        <LoadingState message="Loading course content..." />
      </>
    );
  }

  if (courseError || !course) {
    return (
      <>
        <Stack.Screen options={{ title: "Course Content", ...headerScreenOptions }} />
        <ErrorState
          message={courseError ?? "Course not found."}
          onRetry={() => void loadCourse()}
        />
      </>
    );
  }

  if (webViewError && !webViewSource) {
    return (
      <>
        <Stack.Screen options={{ title: course.title, ...headerScreenOptions }} />
        <ErrorState
          message={webViewError}
          onRetry={handleRetryWebView}
        />
      </>
    );
  }

  if (isPreparingWebView || !webViewSource) {
    return (
      <>
        <Stack.Screen options={{ title: course.title, ...headerScreenOptions }} />
        <LoadingState message="Preparing WebView content..." />
      </>
    );
  }

  if (webViewError) {
    return (
      <>
        <Stack.Screen options={{ title: course.title, ...headerScreenOptions }} />
        <ErrorState
          message={webViewError}
          onRetry={handleRetryWebView}
        />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: course.title, ...headerScreenOptions }} />
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        {isWebViewLoading ? (
          <View
            className="absolute inset-0 z-[2]"
            style={{ backgroundColor: colors.background }}
          >
            <LoadingState message="Loading WebView content..." />
          </View>
        ) : null}
        <WebView
          key={webViewKey}
          ref={webViewRef}
          source={{
            uri: webViewSource.uri,
            headers: webViewSource.headers,
          }}
          style={{ flex: 1, backgroundColor: colors.background }}
          originWhitelist={["*"]}
          allowingReadAccessToURL={webViewSource.uri}
          javaScriptEnabled
          domStorageEnabled
          allowFileAccess
          allowFileAccessFromFileURLs
          allowUniversalAccessFromFileURLs
          mixedContentMode="always"
          setSupportMultipleWindows={false}
          androidLayerType="hardware"
          onLoadStart={() => {
            console.log("[WebView] onLoadStart", { uri: webViewSource.uri });
            setIsWebViewLoading(true);
            setWebViewError(null);
          }}
          onLoadEnd={() => {
            console.log("[WebView] onLoadEnd");
            setIsWebViewLoading(false);
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error("[WebView] onError", nativeEvent);
            setIsWebViewLoading(false);
            setWebViewError("Failed to load course content in WebView.");
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error("[WebView] onHttpError", nativeEvent);
            setIsWebViewLoading(false);
            setWebViewError("Failed to load course content in WebView.");
          }}
          onRenderProcessGone={() => {
            console.warn("[WebView] onRenderProcessGone - reloading");
            setWebViewKey((current) => current + 1);
          }}
          onMessage={(event) => void handleWebViewMessage(event)}
        />
      </View>
    </>
  );
}
