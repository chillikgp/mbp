import { getCategories } from "./categoryRepository";

interface NavigationLink {
  href: string;
  label: string;
}

export function getHeaderNavigation(): NavigationLink[] {
  return [
    { href: "/categories/maternity/", label: "Categories" },
    { href: "/portfolio/", label: "Portfolio" },
    { href: "/shop/", label: "Shop" },
    { href: "/pricing/", label: "Pricing" },
    { href: "/resources/", label: "Resources" },
    { href: "/contact/", label: "Contact" },
  ];
}

export function getFooterExperiences(): NavigationLink[] {
  const categories = getCategories();
  return categories.map((cat) => ({
    href: `/categories/${cat.slug}/`,
    label: cat.label,
  }));
}

export function getFooterStudioLinks(): NavigationLink[] {
  return [
    { href: "/testimonials/", label: "Reviews" },
    { href: "/privacy-policy/", label: "Privacy Policy" },
    { href: "/resources/", label: "Guides" },
    { href: "/contact/", label: "Inquiry" },
  ];
}

export function getFooterPricingLinks(): NavigationLink[] {
  const categories = getCategories();
  return categories
    .filter((cat) => cat.pricing && cat.pricing.length > 0)
    .map((cat) => ({
      href: `/pricing/${cat.slug}/`,
      label: cat.title,
    }));
}
