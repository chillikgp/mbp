import { categories } from "../content";
import { PhotographyCategory, CategoryChild } from "../types";

export function getCategories(): PhotographyCategory[] {
  return categories;
}

export function getCategoryBySlug(slug: string): PhotographyCategory | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getCategoryChild(parentSlug: string, childSlug: string): { parent: PhotographyCategory; child: CategoryChild } | undefined {
  const parent = getCategoryBySlug(parentSlug);
  if (!parent) return undefined;
  
  const child = parent.children?.find((c) => c.slug === childSlug);
  if (!child) return undefined;
  
  return { parent, child };
}
