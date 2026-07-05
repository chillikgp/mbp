import { MetadataRoute } from "next";
import { getCategories } from "../lib/repositories/categoryRepository";
import { getProducts } from "../lib/repositories/productRepository";
import { getResources } from "../lib/repositories/resourceRepository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://mybabypictures.in";
  
  // Format today's date in 'en-CA' (YYYY-MM-DD) as done in the static builder
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());

  const staticRoutes = [
    "",
    "/contact/",
    "/portfolio/",
    "/pricing/",
    "/privacy-policy/",
    "/resources/",
    "/shop/",
    "/testimonials/",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: today,
  }));

  const categories = await getCategories();
  const categoryRoutes: MetadataRoute.Sitemap = [];
  const pricingRoutes: MetadataRoute.Sitemap = [];
  const portfolioRoutes: MetadataRoute.Sitemap = [];

  for (const cat of categories) {
    // Categories
    categoryRoutes.push({
      url: `${baseUrl}/categories/${cat.slug}/`,
      lastModified: today,
    });
    for (const child of cat.children || []) {
      categoryRoutes.push({
        url: `${baseUrl}/categories/${cat.slug}/${child.slug}/`,
        lastModified: today,
      });
    }

    // Pricing
    pricingRoutes.push({
      url: `${baseUrl}/pricing/${cat.slug}/`,
      lastModified: today,
    });

    // Portfolio
    portfolioRoutes.push({
      url: `${baseUrl}/portfolio/${cat.slug}/`,
      lastModified: today,
    });
  }

  // Resources
  const resources = await getResources();
  const resourceRoutes = resources.map((r) => ({
    url: `${baseUrl}/resources/${r.slug}/`,
    lastModified: today,
  }));

  // Shop Products
  const products = await getProducts();
  const productRoutes: MetadataRoute.Sitemap = [];
  for (const prod of products) {
    productRoutes.push({
      url: `${baseUrl}/shop/${prod.slug}/`,
      lastModified: today,
    });
    // Add checkout and confirmation routes as they exist today and we want sitemap parity
    productRoutes.push({
      url: `${baseUrl}/shop/${prod.slug}/checkout/`,
      lastModified: today,
    });
    productRoutes.push({
      url: `${baseUrl}/shop/${prod.slug}/confirmation/`,
      lastModified: today,
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
