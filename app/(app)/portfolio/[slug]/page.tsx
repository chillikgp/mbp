import React from "react";
import { notFound } from "next/navigation";
import { getSiteSettings } from "../../../../lib/repositories/settingsRepository";
import { getCategoryBySlug, getCategories } from "../../../../lib/repositories/categoryRepository";
import { buildMetadata } from "../../../../lib/seo";
import { buildServiceSchema } from "../../../../lib/schema";
import PortfolioTemplate from "../../../../components/templates/PortfolioTemplate";
import { portfolioPath } from "../../../../lib/routes";

interface PortfolioPageProps {
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

export async function generateMetadata({ params }: PortfolioPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  const site = await getSiteSettings();
  return await buildMetadata({
    title: `${category.title} Portfolio | ${site.name}`,
    description: `${category.label} portfolio with category-specific images and inquiry CTA.`,
    path: portfolioPath(category),
    image: category.heroImage,
  });
}

export default async function PortfolioDetailPage({ params }: PortfolioPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const [site, categoriesList] = await Promise.all([
    getSiteSettings(),
    getCategories(),
  ]);
  const path = portfolioPath(category);
  const serviceSchema = buildServiceSchema(category, path, site);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <PortfolioTemplate category={category} site={site} categories={categoriesList} />
    </>
  );
}
