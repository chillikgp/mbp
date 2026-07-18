import { FAQItem, Product, PhotographyCategory, SiteSettings, Resource, Testimonial } from "./types";

const url = (path: string = "/", domain: string) => {
  if (path.startsWith("http")) return path;
  const formattedDomain = domain.replace(/\/$/, "");
  const formattedPath = path.startsWith("/") ? path : `/${path}`;
  return `${formattedDomain}${formattedPath}`;
};

export function buildLocalBusinessSchema(site: SiteSettings) {
  const ratingValue = Number(site.rating);
  const reviewCount = Number(site.reviewCount);
  const hasValidRating = Number.isFinite(ratingValue) && Number.isFinite(reviewCount) && reviewCount > 0;

  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "PhotographyStudio"],
    name: site.name,
    image: url(site.logo, site.domain),
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
    ...(hasValidRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue,
        reviewCount,
      },
    }),
    sameAs: [site.instagram, site.youtube],
  };
}

export function buildBreadcrumbSchema(items: { label: string; href?: string }[], domain: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: url(item.href, domain) } : {}),
    })),
  };
}

export function buildImageObjectSchema(images: { src: string; alt: string; caption?: string }[], site: SiteSettings) {
  return images
    .filter((image) => image.src)
    .map((image) => ({
      "@context": "https://schema.org",
      "@type": "ImageObject",
      contentUrl: url(image.src, site.domain),
      url: url(image.src, site.domain),
      caption: image.caption || image.alt,
      description: image.alt,
      creator: { "@type": "Organization", name: site.name },
      copyrightHolder: { "@type": "Organization", name: site.name },
      contentLocation: { "@type": "Place", name: "Delhi, India" },
    }));
}

export function buildReviewSchema(testimonials: Testimonial[], site: SiteSettings, itemReviewedName: string) {
  return testimonials.map((testimonial) => ({
    "@context": "https://schema.org",
    "@type": "Review",
    reviewRating: { "@type": "Rating", ratingValue: testimonial.rating, bestRating: 5 },
    author: { "@type": "Person", name: testimonial.name },
    reviewBody: testimonial.quote,
    itemReviewed: { "@type": "Service", name: itemReviewedName, provider: { "@type": "PhotographyStudio", name: site.name } },
  }));
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

export function buildProductSchema(product: Product, site: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.gallery?.map((image) => url(image.src, site.domain)) || [url(product.heroImage, site.domain)],
    description: product.summary,
    brand: { "@type": "Brand", name: site.name },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: Number(product.rating),
      reviewCount: Number(product.reviewCount),
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: productBasePrice(product),
      availability: "https://schema.org/InStock",
      url: url(`/shop/${product.slug}`, site.domain),
    },
  };
}

export function buildArticleSchema(resource: Resource, path: string, site: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: resource.title,
    description: resource.excerpt,
    image: resource.image ? [url(resource.image, site.domain)] : undefined,
    datePublished: resource.createdAt,
    dateModified: resource.updatedAt || resource.createdAt,
    author: { "@type": "Organization", name: site.name },
    publisher: { "@type": "Organization", name: site.name, logo: { "@type": "ImageObject", url: url(site.logo, site.domain) } },
    mainEntityOfPage: { "@type": "WebPage", "@id": url(path, site.domain) },
  };
}

export function buildServiceSchema(category: PhotographyCategory, path: string, site: SiteSettings) {
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
    url: url(path, site.domain),
    offers: (category.pricing || []).map((pkg) => ({
      "@type": "Offer",
      name: pkg.name,
      priceCurrency: "INR",
      price: pkg.price.replace(/[^\d]/g, ""),
      description: pkg.includes.join(", "),
    })),
  };
}
