import { File, Paths } from "expo-file-system";

import type { CourseWebViewPayload } from "../types/webViewTypes";
import { buildCourseContentHtml } from "./buildCourseContentHtml";
import { buildWebViewHeaders } from "./buildWebViewHeaders";

export interface PreparedWebViewSource {
  uri: string;
  headers: Record<string, string>;
}

export interface PrepareWebViewSourceOptions {
  isDark?: boolean;
}

export async function prepareWebViewSource(
  courseId: number,
  payload: CourseWebViewPayload,
  options: PrepareWebViewSourceOptions = {}
): Promise<PreparedWebViewSource> {
  const { isDark = false } = options;
  const headers = buildWebViewHeaders(courseId, payload);
  const html = buildCourseContentHtml(payload, headers, { isDark });

  console.log("[prepareWebViewSource] generated html", {
    courseId,
    isDark,
    htmlLength: html.length,
  });

  const fileName = `course-content-${courseId}-${isDark ? "dark" : "light"}.html`;
  const file = new File(Paths.cache, fileName);

  if (file.exists) {
    file.delete();
  }

  file.create();
  file.write(html);

  return {
    uri: file.uri,
    headers,
  };
}
