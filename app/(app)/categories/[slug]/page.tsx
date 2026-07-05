import React from "react";
import { notFound } from "next/navigation";
import { getSiteSettings } from "../../../../lib/repositories/settingsRepository";
import { getCategoryBySlug, getCategories } from "../../../../lib/repositories/categoryRepository";
import { getFAQs } from "../../../../lib/repositories/faqRepository";
import { getTestimonialsByNames } from "../../../../lib/repositories/testimonialRepository";
import { buildMetadata } from "../../../../lib/seo";
import { buildServiceSchema, buildFAQSchema } from "../../../../lib/schema";
import PhotographyCategoryTemplate from "../../../../components/templates/PhotographyCategoryTemplate";
import { categoryPath } from "../../../../lib/routes";

interface CategoryPageProps {
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

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  const site = await getSiteSettings();
  return await buildMetadata({
    title: `${category.label} | ${site.name}`,
    description: category.description,
    path: categoryPath(category),
    image: category.heroImage,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const path = categoryPath(category);
  
  const [site, pageFaqs, categoriesList, testimonials, relatedDocs] = await Promise.all([
    getSiteSettings(),
    getFAQs(category.slug),
    getCategories(),
    getTestimonialsByNames(category.testimonials || []),
    Promise.all((category.related || []).map((s) => getCategoryBySlug(s))),
  ]);

  const serviceSchema = buildServiceSchema(category, path, site);
  const faqSchema = buildFAQSchema(pageFaqs);
  const related = relatedDocs.filter(Boolean) as any[];

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
