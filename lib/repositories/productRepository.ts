import { products, shop } from "../content";
import { Product, ShopSettings } from "../types";

export function getProducts(): Product[] {
  return products;
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getShopSettings(): ShopSettings {
  return shop;
}
