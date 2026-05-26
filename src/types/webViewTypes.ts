export interface CourseWebViewPayload {
  title: string;
  instructor: string;
  description: string;
  category: string;
  progressPercent: number;
  enrollmentStatus: string;
}

export type WebViewInboundMessage =
  | { type: "COMPLETE_LESSON" }
  | { type: "FEEDBACK"; value: string };
