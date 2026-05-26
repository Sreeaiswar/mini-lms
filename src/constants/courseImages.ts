import type { CourseCategoryId } from "./courseCategories";

export const CATEGORY_COURSE_IMAGES: Record<
  Exclude<CourseCategoryId, "all">,
  string
> = {
  smartphones:
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
  laptops:
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
};

const DEFAULT_COURSE_IMAGE =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80";

export function getCategoryCourseImage(category: string): string {
  const key = category as Exclude<CourseCategoryId, "all">;

  if (key in CATEGORY_COURSE_IMAGES) {
    return CATEGORY_COURSE_IMAGES[key];
  }

  return DEFAULT_COURSE_IMAGE;
}
