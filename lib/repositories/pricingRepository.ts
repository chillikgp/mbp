import { getCategoryBySlug } from "./categoryRepository";
import { PricingPackage } from "../types";

export async function getPricingPackages(categorySlug: string): Promise<PricingPackage[]> {
  const category = await getCategoryBySlug(categorySlug);
  return category?.pricing || [];
}
