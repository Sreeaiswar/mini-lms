import {
  WEBVIEW_HEADER_CATEGORY,
  WEBVIEW_HEADER_COURSE_ID,
  WEBVIEW_HEADER_COURSE_TITLE,
  WEBVIEW_HEADER_ENROLLMENT,
  WEBVIEW_HEADER_INSTRUCTOR,
  WEBVIEW_HEADER_PROGRESS,
} from "../constants/webViewHeaders";
import type { CourseWebViewPayload } from "../types/webViewTypes";

export function buildWebViewHeaders(
  courseId: number,
  payload: CourseWebViewPayload
): Record<string, string> {
  return {
    [WEBVIEW_HEADER_COURSE_ID]: String(courseId),
    [WEBVIEW_HEADER_COURSE_TITLE]: payload.title,
    [WEBVIEW_HEADER_INSTRUCTOR]: payload.instructor,
    [WEBVIEW_HEADER_CATEGORY]: payload.category,
    [WEBVIEW_HEADER_PROGRESS]: String(
      Math.min(100, Math.max(0, Math.round(payload.progressPercent)))
    ),
    [WEBVIEW_HEADER_ENROLLMENT]: payload.enrollmentStatus,
  };
}
