import { getCategoryBySlug } from "./categoryRepository";
import { PricingPackage } from "../types";

export function getPricingPackages(categorySlug: string): PricingPackage[] {
  const category = getCategoryBySlug(categorySlug);
  return category?.pricing || [];
}
