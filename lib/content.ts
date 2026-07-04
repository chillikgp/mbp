import siteJson from "../content/site.json";
import productsJson from "../content/products.json";
import { SiteData, ProductsData } from "./types";

export const siteData = siteJson as unknown as SiteData;
export const productsData = productsJson as unknown as ProductsData;

export const { site, homepage, categories, testimonials, faqs, resources } = siteData;
export const { shop, products } = productsData;
