import { getCategoryBySlug } from "./categoryRepository";
import { faqs } from "../content";
import { FAQItem } from "../types";

export function getGlobalFAQs(): FAQItem[] {
  return faqs;
}

export function getFAQs(categorySlug: string): FAQItem[] {
  const category = getCategoryBySlug(categorySlug);
  if (category?.faqs && category.faqs.length > 0) {
    return category.faqs;
  }
  return faqs.slice(0, 3);
}
