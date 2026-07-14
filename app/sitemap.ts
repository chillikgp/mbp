import { MetadataRoute } from "next";
import { getCategories } from "../lib/repositories/categoryRepository";
import { getProducts } from "../lib/repositories/productRepository";
import { getResources } from "../lib/repositories/resourceRepository";
import { getSiteSettings } from "../lib/repositories/settingsRepository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSiteSettings();
  const baseUrl = site.domain.replace(/\/$/, "");

  // Format today's date in 'en-CA' (YYYY-MM-DD) as done in the static builder
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());

  const staticRoutes = [
    { route: "", changeFrequency: "weekly" as const, priority: 1 },
    { route: "/categories", changeFrequency: "weekly" as const, priority: 0.8 },
    { route: "/contact", changeFrequency: "monthly" as const, priority: 0.6 },
    { route: "/portfolio", changeFrequency: "weekly" as const, priority: 0.8 },
    { route: "/pricing", changeFrequency: "monthly" as const, priority: 0.7 },
    { route: "/privacy-policy", changeFrequency: "yearly" as const, priority: 0.2 },
    { route: "/resources", changeFrequency: "weekly" as const, priority: 0.7 },
    { route: "/shop", changeFrequency: "weekly" as const, priority: 0.7 },
    { route: "/testimonials", changeFrequency: "weekly" as const, priority: 0.6 },
  ].map(({ route, changeFrequency, priority }) => ({
    url: `${baseUrl}${route}`,
    lastModified: today,
    changeFrequency,
    priority,
  }));

  const categories = await getCategories();
  const categoryRoutes: MetadataRoute.Sitemap = [];
  const pricingRoutes: MetadataRoute.Sitemap = [];
  const portfolioRoutes: MetadataRoute.Sitemap = [];

  for (const cat of categories) {
    // Categories
    categoryRoutes.push({
      url: `${baseUrl}/categories/${cat.slug}`,
      lastModified: cat.updatedAt || today,
      changeFrequency: "weekly",
      priority: 0.8,
    });
    for (const child of cat.children || []) {
      categoryRoutes.push({
        url: `${baseUrl}/categories/${cat.slug}/${child.slug}`,
        lastModified: child.updatedAt || cat.updatedAt || today,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    // Pricing
    pricingRoutes.push({
      url: `${baseUrl}/pricing/${cat.slug}`,
      lastModified: cat.updatedAt || today,
      changeFrequency: "monthly",
      priority: 0.6,
    });

    // Portfolio
    portfolioRoutes.push({
      url: `${baseUrl}/portfolio/${cat.slug}`,
      lastModified: cat.updatedAt || today,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  // Resources
  const resources = await getResources();
  const resourceRoutes = resources.map((r) => ({
    url: `${baseUrl}/resources/${r.slug}`,
    lastModified: r.updatedAt || r.createdAt || today,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Shop Products
  // Checkout and confirmation pages are intentionally excluded: they don't
  // exist as public pages, and even once implemented they're noindex thin
  // content that shouldn't be crawled.
  const products = await getProducts();
  const productRoutes: MetadataRoute.Sitemap = [];
  for (const prod of products) {
    productRoutes.push({
      url: `${baseUrl}/shop/${prod.slug}`,
      lastModified: prod.updatedAt || today,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  // Combine and sort alphabetically by URL to ensure exact parity matching
  const allRoutes = [
    ...staticRoutes,
    ...categoryRoutes,
    ...portfolioRoutes,
    ...pricingRoutes,
    ...resourceRoutes,
    ...productRoutes,
  ];

  allRoutes.sort((a, b) => a.url.localeCompare(b.url));

  return allRoutes;
}
export { sitemap };
