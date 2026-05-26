import { File, Paths } from "expo-file-system";

import type { CourseWebViewPayload } from "../types/webViewTypes";
import { buildCourseContentHtml } from "./buildCourseContentHtml";
import { buildWebViewHeaders } from "./buildWebViewHeaders";

export interface PreparedWebViewSource {
  uri: string;
  headers: Record<string, string>;
}

export async function prepareWebViewSource(
  courseId: number,
  payload: CourseWebViewPayload
): Promise<PreparedWebViewSource> {
  const headers = buildWebViewHeaders(courseId, payload);
  const html = buildCourseContentHtml(payload, headers);
  const file = new File(Paths.cache, `course-content-${courseId}.html`);

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
