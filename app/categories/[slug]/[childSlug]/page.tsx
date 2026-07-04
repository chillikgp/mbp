import React from "react";
import { notFound } from "next/navigation";
import { getSiteSettings } from "../../../../lib/repositories/settingsRepository";
import { getCategoryChild, getCategories, getCategoryBySlug } from "../../../../lib/repositories/categoryRepository";
import { getFAQs } from "../../../../lib/repositories/faqRepository";
import { getTestimonialsByNames } from "../../../../lib/repositories/testimonialRepository";
import { buildMetadata } from "../../../../lib/seo";
import { buildServiceSchema, buildFAQSchema } from "../../../../lib/schema";
import PhotographyCategoryTemplate from "../../../../components/templates/PhotographyCategoryTemplate";
import { childPath } from "../../../../lib/routes";

interface SubcategoryPageProps {
  params: Promise<{
    slug: string;
    childSlug: string;
  }>;
}

export async function generateStaticParams() {
  const categories = getCategories();
  const params: Array<{ slug: string; childSlug: string }> = [];
  for (const cat of categories) {
    for (const child of cat.children || []) {
      params.push({ slug: cat.slug, childSlug: child.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: SubcategoryPageProps) {
  const { slug, childSlug } = await params;
  const result = getCategoryChild(slug, childSlug);
  if (!result) return {};

  const { parent, child } = result;
  const site = getSiteSettings();
  const path = childPath(parent, child);

  return buildMetadata({
    title: `${child.title} Photography | ${site.name}`,
    description: child.summary,
    path: path,
    image: child.heroImage,
  });
}

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  const { slug, childSlug } = await params;
  const result = getCategoryChild(slug, childSlug);
  if (!result) {
    notFound();
  }

  const { parent, child } = result;
  const path = childPath(parent, child);
  const pageFaqs = getFAQs(parent.slug);
  const serviceSchema = buildServiceSchema(parent, path);
  const faqSchema = buildFAQSchema(pageFaqs);

  const site = getSiteSettings();
  const categoriesList = getCategories();
  const testimonials = getTestimonialsByNames(parent.testimonials || []);

  // Look up related category objects
  const related = (parent.related || [])
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
        category={parent}
        child={child}
        pageFaqs={pageFaqs}
        relatedCategories={related}
        site={site}
        categories={categoriesList}
        testimonials={testimonials}
      />
    </>
  );
}
