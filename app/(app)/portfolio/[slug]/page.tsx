import React from "react";
import { notFound } from "next/navigation";
import { getSiteSettings } from "../../../../lib/repositories/settingsRepository";
import { getCategoryBySlug, getCategories } from "../../../../lib/repositories/categoryRepository";
import { buildMetadata } from "../../../../lib/seo";
import { buildBreadcrumbSchema, buildServiceSchema } from "../../../../lib/schema";
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
  const isMaternity = slug === "maternity";

  const title = isMaternity
    ? "Maternity Photography Portfolio | MyBabyPictures.in"
    : `${category.title} Portfolio | ${site.name}`;

  const description = isMaternity
    ? "Explore elegant maternity photography themes, gowns, couple portraits and studio looks created for families across Delhi NCR."
    : `${category.label} portfolio with category-specific images and inquiry CTA.`;

  return await buildMetadata({
    title,
    description,
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
  
  const isMaternity = slug === "maternity";

  const breadcrumbSchema = buildBreadcrumbSchema(
    [
      { label: "Home", href: "/" },
      { label: "Portfolio", href: "/portfolio" },
      { label: `${category.title} Portfolio` },
    ],
    site.domain
  );

  const schema = isMaternity
    ? breadcrumbSchema
    : buildServiceSchema(category, portfolioPath(category), site);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <PortfolioTemplate category={category} site={site} categories={categoriesList} />
    </>
  );
}
