import React from "react";
import { notFound } from "next/navigation";
import { getSiteSettings } from "../../../../lib/repositories/settingsRepository";
import { getCategoryBySlug, getCategories } from "../../../../lib/repositories/categoryRepository";
import { getFAQs } from "../../../../lib/repositories/faqRepository";
import { getTestimonialsByNames } from "../../../../lib/repositories/testimonialRepository";
import { getResources } from "../../../../lib/repositories/resourceRepository";
import { buildMetadata } from "../../../../lib/seo";
import { buildServiceSchema, buildFAQSchema, buildBreadcrumbSchema } from "../../../../lib/schema";
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
  const isMaternity = slug === "maternity";

  const title = isMaternity
    ? "Maternity Photoshoot in Delhi NCR | Packages from ₹3,499"
    : `${category.label} | ${site.name}`;

  const description = isMaternity
    ? "Book an elegant maternity photoshoot in Delhi NCR with studio, outdoor and couple themes. Packages start at ₹3,499 and include maternity gowns. Serving Delhi, Noida, Gurgaon and Faridabad."
    : category.description;

  return await buildMetadata({
    title,
    description,
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
  
  const [site, pageFaqs, categoriesList, testimonials, relatedDocs, allResources] = await Promise.all([
    getSiteSettings(),
    getFAQs(category.slug),
    getCategories(),
    getTestimonialsByNames(category.testimonials || []),
    Promise.all((category.related || []).map((s) => getCategoryBySlug(s))),
    getResources(),
  ]);
  const relatedResources = allResources.filter((r) => r.categorySlug === category.slug);

  const serviceSchema = buildServiceSchema(category, path, site);
  const faqSchema = buildFAQSchema(pageFaqs);
  const breadcrumbSchema = buildBreadcrumbSchema(
    [
      { label: "Home", href: "/" },
      { label: "Categories", href: "/categories/maternity" },
      { label: category.label },
    ],
    site.domain
  );
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PhotographyCategoryTemplate
        category={category}
        child={null}
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
