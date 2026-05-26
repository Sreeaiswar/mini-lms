export const COURSE_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "smartphones", label: "Smartphones" },
  { id: "laptops", label: "Laptops" },

] as const;

export type CourseCategoryId = (typeof COURSE_CATEGORIES)[number]["id"];
