import type { CourseDetail } from "./courseTypes";

export interface EnrolledCourse {
  course: CourseDetail;
  progressPercent: number;
  enrolledAt: string;
  completedAt?: string;
}
