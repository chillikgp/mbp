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
