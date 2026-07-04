import { categories, products, resources } from "./content";
import { PhotographyCategory, CategoryChild, Product, Resource } from "./types";

export function categoryPath(category: PhotographyCategory): string {
  return `/categories/${category.slug}/`;
}

export function childPath(parent: PhotographyCategory, child: CategoryChild): string {
  return `/categories/${parent.slug}/${child.slug}/`;
}

export function pricingPath(category: PhotographyCategory): string {
  return `/pricing/${category.slug}/`;
}

export function portfolioPath(category: PhotographyCategory): string {
  return `/portfolio/${category.slug}/`;
}

export function shopPath(product?: Product | null): string {
  return product ? `/shop/${product.slug}/` : "/shop/";
}

export function checkoutPath(product: Product): string {
  return `/shop/${product.slug}/checkout/`;
}

export function confirmationPath(product: Product): string {
  return `/shop/${product.slug}/confirmation/`;
}

export function resourcePath(resource: Resource): string {
  return `/resources/${resource.slug}/`;
}

export function getAllRoutes(): string[] {
  const routes = new Set<string>();

  routes.add("/");
  routes.add("/pricing/");
  routes.add("/portfolio/");
  routes.add("/shop/");
  routes.add("/testimonials/");
  routes.add("/resources/");
  routes.add("/contact/");
  routes.add("/privacy-policy/");

  for (const category of categories) {
    routes.add(categoryPath(category));
    routes.add(pricingPath(category));
    routes.add(portfolioPath(category));
    for (const child of category.children || []) {
      routes.add(childPath(category, child));
    }
  }

  for (const product of products) {
    routes.add(shopPath(product));
    routes.add(checkoutPath(product));
    routes.add(confirmationPath(product));
  }

  for (const resource of resources) {
    routes.add(resourcePath(resource));
  }

  return Array.from(routes).sort();
}
