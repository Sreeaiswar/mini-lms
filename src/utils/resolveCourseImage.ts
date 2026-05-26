import { getCategoryCourseImage } from "../constants/courseImages";

export function isValidImageUri(
  uri: string | undefined | null
): uri is string {
  if (!uri || typeof uri !== "string") {
    return false;
  }

  const trimmed = uri.trim();

  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("file://")
  );
}

/** Legacy freeapi paths that 404 or return a generic gray tile, not a product photo. */
export function isUnusableCourseThumbnail(
  uri: string | undefined | null
): boolean {
  if (!isValidImageUri(uri)) {
    return true;
  }

  return /cdn\.dummyjson\.com\/product-images\/\d+\//i.test(uri.trim());
}

export function resolveCourseThumbnail(
  thumbnail: string | undefined | null,
  category: string
): string {
  if (isValidImageUri(thumbnail) && !isUnusableCourseThumbnail(thumbnail)) {
    return thumbnail.trim();
  }

  return getCategoryCourseImage(category);
}