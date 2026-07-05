import { getCategories } from "./categoryRepository";
import { Navigation as PayloadNavigation } from "@/payload-types";

interface NavigationLink {
  href: string;
  label: string;
}

export async function getHeaderNavigation(): Promise<NavigationLink[]> {
  const { getPayload } = await import("payload");
  const config = (await import("@/payload.config")).default;
  const payload = await getPayload({ config });
  
  const nav = await payload.findGlobal({
    slug: 'navigation',
  }) as unknown as PayloadNavigation;

  if (!nav || !nav.primaryNavigation?.length) {
    throw new Error("Navigation global is not seeded in the database.");
  }

  return nav.primaryNavigation.map(item => ({
    href: item.href,
    label: item.label,
  }));
}

export async function getFooterExperiences(): Promise<NavigationLink[]> {
  const categories = await getCategories();
  return categories.map((cat) => ({
    href: `/categories/${cat.slug}/`,
    label: cat.label,
  }));
}

export async function getFooterStudioLinks(): Promise<NavigationLink[]> {
  const { getPayload } = await import("payload");
  const config = (await import("@/payload.config")).default;
  const payload = await getPayload({ config });
  
  const nav = await payload.findGlobal({
    slug: 'navigation',
  }) as unknown as PayloadNavigation;

  if (!nav || !nav.footerNavigation?.studioLinks?.length) {
    throw new Error("Navigation global is not seeded in the database.");
  }

  return nav.footerNavigation.studioLinks.map(item => ({
    href: item.href,
    label: item.label,
  }));
}

export async function getFooterPricingLinks(): Promise<NavigationLink[]> {
  const categories = await getCategories();
  return categories
    .filter((cat) => cat.pricing && cat.pricing.length > 0)
    .map((cat) => ({
      href: `/pricing/${cat.slug}/`,
      label: cat.title,
    }));
}
