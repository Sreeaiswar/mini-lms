import type { UserStatistics } from "../types/authTypes";
import type { EnrolledCourse } from "../types/enrollmentTypes";

export function computeUserStatistics(
  enrollments: EnrolledCourse[]
): UserStatistics {
  if (enrollments.length === 0) {
    return {
      coursesEnrolled: 0,
      coursesCompleted: 0,
      progressPercent: 0,
    };
  }

  const coursesCompleted = enrollments.filter(
    (item) => item.completedAt != null || item.progressPercent >= 100
  ).length;

  const totalProgress = enrollments.reduce(
    (sum, item) => sum + item.progressPercent,
    0
  );

  return {
    coursesEnrolled: enrollments.length,
    coursesCompleted,
    progressPercent: Math.round(totalProgress / enrollments.length),
  };
}
