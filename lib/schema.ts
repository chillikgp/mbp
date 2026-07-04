import { getSiteSettings } from "./repositories/settingsRepository";
import { FAQItem, Product, PhotographyCategory } from "./types";

const url = (path: string = "/") => {
  const site = getSiteSettings();
  const domain = site.domain.replace(/\/$/, "");
  const formattedPath = path.startsWith("/") ? path : `/${path}`;
  return `${domain}${formattedPath}`;
};

export function buildLocalBusinessSchema() {
  const site = getSiteSettings();
  return {
    "@context": "https://schema.org",
    "@type": "PhotographyStudio",
    name: site.name,
    image: url(site.logo),
    url: site.domain,
    telephone: site.phone,
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Saini Enclave, Karkardooma",
      addressLocality: "Delhi",
      postalCode: "110092",
      addressCountry: "IN",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: site.rating,
      reviewCount: site.reviewCount,
    },
    sameAs: [site.instagram, site.youtube],
  };
}

export function buildFAQSchema(items: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

function productBasePrice(product: Product): number {
  return product.variants?.[0]?.options?.[0]?.price || product.startingPrice || 0;
}

export function buildProductSchema(product: Product) {
  const site = getSiteSettings();
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.gallery?.map((image) => url(image.src)) || [url(product.heroImage)],
    description: product.summary,
    brand: { "@type": "Brand", name: site.name },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: productBasePrice(product),
      availability: "https://schema.org/InStock",
      url: url(`/shop/${product.slug}/`),
    },
  };
}

export function buildServiceSchema(category: PhotographyCategory, path: string) {
  const site = getSiteSettings();
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${category.label} by ${site.name}`,
    description: category.description,
    provider: {
      "@type": "PhotographyStudio",
      name: site.name,
      url: site.domain,
    },
    areaServed: ["Delhi", "Noida", "Gurugram", "Faridabad", "Ghaziabad"],
    url: url(path),
    offers: (category.pricing || []).map((pkg) => ({
      "@type": "Offer",
      name: pkg.name,
      priceCurrency: "INR",
      price: pkg.price.replace(/[^\d]/g, ""),
      description: pkg.includes.join(", "),
    })),
  };
}
