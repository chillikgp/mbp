import React from "react";
import { notFound } from "next/navigation";
import { getSiteSettings } from "../../../lib/repositories/settingsRepository";
import { getCategoryBySlug, getCategories } from "../../../lib/repositories/categoryRepository";
import { getFAQs } from "../../../lib/repositories/faqRepository";
import { getTestimonialsByNames } from "../../../lib/repositories/testimonialRepository";
import { buildMetadata } from "../../../lib/seo";
import { buildServiceSchema, buildFAQSchema } from "../../../lib/schema";
import PhotographyCategoryTemplate from "../../../components/templates/PhotographyCategoryTemplate";
import { categoryPath } from "../../../lib/routes";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const categories = getCategories();
  return categories.map((c) => ({
    slug: c.slug,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};

  const site = getSiteSettings();
  return buildMetadata({
    title: `${category.label} | ${site.name}`,
    description: category.description,
    path: categoryPath(category),
    image: category.heroImage,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const path = categoryPath(category);
  const pageFaqs = getFAQs(category.slug);
  const serviceSchema = buildServiceSchema(category, path);
  const faqSchema = buildFAQSchema(pageFaqs);

  const site = getSiteSettings();
  const categoriesList = getCategories();
  const testimonials = getTestimonialsByNames(category.testimonials || []);

  // Look up related category objects
  const related = (category.related || [])
    .map((s) => getCategoryBySlug(s))
    .filter(Boolean) as any[];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <PhotographyCategoryTemplate
        category={category}
        child={null}
        pageFaqs={pageFaqs}
        relatedCategories={related}
        site={site}
        categories={categoriesList}
        testimonials={testimonials}
      />
    </>
  );
}
