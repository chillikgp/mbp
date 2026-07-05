export function getAspectRatioClass(width?: number | null, height?: number | null): string {
  if (!width || !height) return "";
  if (width > height) return "landscape";
  if (height > width) return "portrait";
  return "square";
}
