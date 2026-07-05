export interface SiteSettings {
  name: string;
  domain: string;
  tagline: string;
  description: string;
  phone: string;
  phoneHref: string;
  whatsapp: string;
  email: string;
  address: string;
  instagram: string;
  youtube: string;
  logo: string;
  ogImage: string;
  analyticsId: string;
  rating: string | number;
  reviewCount: string | number;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface HeroData {
  eyebrow: string;
  title: string;
  copy: string;
  image: string;
  primaryCta?: string;
  secondaryCta?: string;
  stats?: StatItem[];
  trust?: string[];
}

export interface StoryData {
  eyebrow: string;
  title: string;
  copy: string;
  image: string;
  points: string[];
}

export interface HomepageData {
  seo: {
    title: string;
    description: string;
  };
  hero: HeroData;
  story: StoryData;
  resources: string[];
}

export interface GalleryItem {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface PricingPackage {
  name: string;
  price: string;
  featured: boolean;
  includes: string[];
}

export interface CategoryChild {
  slug: string;
  title: string;
  summary: string;
  heroImage: string;
}

export interface FAQItem {
  q: string;
  a: string;
}

export interface VideoSlot {
  title: string;
  embed?: string;
}

export interface BtsItem {
  title: string;
  image: string;
  copy: string;
}

export interface PhotographyCategory {
  slug: string;
  title: string;
  label: string;
  eyebrow: string;
  summary: string;
  description: string;
  heroImage: string;
  gallery?: GalleryItem[];
  pricing?: PricingPackage[];
  addons?: string[];
  faqs?: FAQItem[];
  testimonials?: string[];
  related?: string[];
  children?: CategoryChild[];
  videos?: VideoSlot[];
  bts?: BtsItem[];
}

export interface Testimonial {
  name: string;
  rating: string | number;
  quote: string;
  category?: string;
}

export interface Resource {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  image: string;
  contentPoints?: string[];
}

export interface SiteData {
  site: SiteSettings;
  homepage: HomepageData;
  categories: PhotographyCategory[];
  testimonials: Testimonial[];
  faqs: FAQItem[];
  resources: Resource[];
}

export interface ShopHero {
  eyebrow: string;
  title: string;
  copy: string;
  image: string;
}

export interface ShopSettings {
  seo: {
    title: string;
    description: string;
  };
  hero: ShopHero;
  why: string[];
  faqs: FAQItem[];
}

export interface ProductOption {
  label: string;
  price: number;
}

export interface ProductVariant {
  name: string;
  key: string;
  options: ProductOption[];
}

export interface PersonalizationField {
  label: string;
  key: string;
  placeholder?: string;
}

export interface ProductUpload {
  min: number;
  max: number;
  multiple: boolean;
  guidance: string;
}

export interface ProductReview {
  name: string;
  quote: string;
}

export interface Product {
  slug: string;
  name: string;
  startingPrice: number;
  priceLabel: string;
  summary: string;
  shortDescription: string;
  heroImage: string;
  gallery?: GalleryItem[];
  rating: string | number;
  reviewCount: number;
  variants?: ProductVariant[];
  personalizationFields?: PersonalizationField[];
  upload: ProductUpload;
  details: string[];
  howItWorks: string[];
  included: string[];
  reviews?: ProductReview[];
  faqs?: FAQItem[];
}

export interface ProductsData {
  shop: ShopSettings;
  products: Product[];
}
