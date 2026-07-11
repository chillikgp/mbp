import React from "react";
import { notFound } from "next/navigation";
import { getSiteSettings } from "../../../../../lib/repositories/settingsRepository";
import { getCategoryChild, getCategories, getCategoryBySlug } from "../../../../../lib/repositories/categoryRepository";
import { getFAQs } from "../../../../../lib/repositories/faqRepository";
import { getTestimonialsByNames } from "../../../../../lib/repositories/testimonialRepository";
import { getResources } from "../../../../../lib/repositories/resourceRepository";
import { buildMetadata } from "../../../../../lib/seo";
import { buildServiceSchema, buildFAQSchema, buildBreadcrumbSchema, buildImageObjectSchema, buildReviewSchema } from "../../../../../lib/schema";
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
  
  const [site, pageFaqs, categoriesList, testimonials, relatedDocs, allResources] = await Promise.all([
    getSiteSettings(),
    getFAQs(parent.slug, child.slug),
    getCategories(),
    getTestimonialsByNames(child.testimonials && child.testimonials.length > 0 ? child.testimonials : (parent.testimonials || [])),
    Promise.all((parent.related || []).map((s) => getCategoryBySlug(s))),
    getResources(),
  ]);
  const relatedResources = allResources.filter((r) => r.categorySlug === child.slug);

  const serviceSchema = buildServiceSchema(parent, path, site);
  const faqSchema = buildFAQSchema(pageFaqs);
  const breadcrumbSchema = buildBreadcrumbSchema(
    [
      { label: "Home", href: "/" },
      { label: "Categories", href: "/categories/maternity" },
      { label: parent.label, href: `/categories/${parent.slug}` },
      { label: child.title },
    ],
    site.domain
  );
  const related = relatedDocs.filter(Boolean) as any[];
  const galleryForSchema = child.gallery && child.gallery.length > 0 ? child.gallery : parent.gallery || [];
  const imageObjectSchemas = buildImageObjectSchema(galleryForSchema, site);
  const reviewSchemas = buildReviewSchema(testimonials, site, `${child.title} Photography`);

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {imageObjectSchemas.map((imageSchema, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(imageSchema) }}
        />
      ))}
      {reviewSchemas.map((reviewSchema, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
        />
      ))}
      <PhotographyCategoryTemplate
        category={parent}
        child={child}
        pageFaqs={pageFaqs}
        relatedCategories={related}
        site={site}
        categories={categoriesList}
        testimonials={testimonials}
        relatedResources={relatedResources}
      />
    </>
  );
}
