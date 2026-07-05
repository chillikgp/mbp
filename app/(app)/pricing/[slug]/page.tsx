import React from "react";
import { notFound } from "next/navigation";
import { getSiteSettings } from "../../../../lib/repositories/settingsRepository";
import { getCategoryBySlug, getCategories } from "../../../../lib/repositories/categoryRepository";
import { buildMetadata } from "../../../../lib/seo";
import { buildServiceSchema } from "../../../../lib/schema";
import PricingTemplate from "../../../../components/templates/PricingTemplate";
import { pricingPath } from "../../../../lib/routes";

interface PricingPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({
    slug: c.slug,
  }));
}

export async function generateMetadata({ params }: PricingPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  const site = await getSiteSettings();
  return await buildMetadata({
    title: `${category.title} Pricing | ${site.name}`,
    description: `Category-specific pricing for ${category.label.toLowerCase()} with packages, add-ons and inquiry CTA.`,
    path: pricingPath(category),
    image: category.heroImage,
  });
}

export default async function PricingDetailPage({ params }: PricingPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const [site, categoriesList] = await Promise.all([
    getSiteSettings(),
    getCategories(),
  ]);
  const path = pricingPath(category);
  const serviceSchema = buildServiceSchema(category, path, site);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <PricingTemplate category={category} site={site} categories={categoriesList} />
    </>
  );
}
