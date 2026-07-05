import React from "react";
import { notFound } from "next/navigation";
import { getSiteSettings } from "../../../../../lib/repositories/settingsRepository";
import { getCategoryChild, getCategories, getCategoryBySlug } from "../../../../../lib/repositories/categoryRepository";
import { getFAQs } from "../../../../../lib/repositories/faqRepository";
import { getTestimonialsByNames } from "../../../../../lib/repositories/testimonialRepository";
import { buildMetadata } from "../../../../../lib/seo";
import { buildServiceSchema, buildFAQSchema } from "../../../../../lib/schema";
import PhotographyCategoryTemplate from "../../../../../components/templates/PhotographyCategoryTemplate";
import { childPath } from "../../../../../lib/routes";

interface SubcategoryPageProps {
  params: Promise<{
    slug: string;
    childSlug: string;
  }>;
}

export async function generateStaticParams() {
  const categories = await getCategories();
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
  const result = await getCategoryChild(slug, childSlug);
  if (!result) return {};

  const { parent, child } = result;
  const site = await getSiteSettings();
  const path = childPath(parent, child);

  return await buildMetadata({
    title: `${child.title} Photography | ${site.name}`,
    description: child.summary,
    path: path,
    image: child.heroImage,
  });
}

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  const { slug, childSlug } = await params;
  const result = await getCategoryChild(slug, childSlug);
  if (!result) {
    notFound();
  }

  const { parent, child } = result;
  const path = childPath(parent, child);
  
  const [site, pageFaqs, categoriesList, testimonials, relatedDocs] = await Promise.all([
    getSiteSettings(),
    getFAQs(parent.slug),
    getCategories(),
    getTestimonialsByNames(parent.testimonials || []),
    Promise.all((parent.related || []).map((s) => getCategoryBySlug(s))),
  ]);

  const serviceSchema = buildServiceSchema(parent, path, site);
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
