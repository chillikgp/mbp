import React from "react";
import { notFound } from "next/navigation";
import { getSiteSettings } from "../../../../lib/repositories/settingsRepository";
import { getResourceBySlug, getResources } from "../../../../lib/repositories/resourceRepository";
import { getCategories } from "../../../../lib/repositories/categoryRepository";
import { buildMetadata } from "../../../../lib/seo";
import { buildLocalBusinessSchema, buildBreadcrumbSchema, buildArticleSchema, buildFAQSchema, buildImageObjectSchema } from "../../../../lib/schema";
import ResourceTemplate from "../../../../components/templates/ResourceTemplate";

interface ResourcePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const resources = await getResources();
  return resources.map((r) => ({
    slug: r.slug,
  }));
}

export async function generateMetadata({ params }: ResourcePageProps) {
  const { slug } = await params;
  const resource = await getResourceBySlug(slug);
  if (!resource) return {};

  const site = await getSiteSettings();
  return await buildMetadata({
    title: `${resource.title} | ${site.name}`,
    description: resource.excerpt,
    path: `/resources/${resource.slug}`,
    image: resource.image,
    type: "article",
    publishedTime: resource.createdAt,
    modifiedTime: resource.updatedAt || resource.createdAt,
  });
}

export default async function ResourceDetailPage({ params }: ResourcePageProps) {
  const { slug } = await params;
  const resource = await getResourceBySlug(slug);
  if (!resource) {
    notFound();
  }

  const [site, categoriesList] = await Promise.all([
    getSiteSettings(),
    getCategories(),
  ]);
  const schema = buildLocalBusinessSchema(site);
  const breadcrumbSchema = buildBreadcrumbSchema(
    [
      { label: "Home", href: "/" },
      { label: "Resources", href: "/resources" },
      { label: resource.title },
    ],
    site.domain
  );
  const articleSchema = buildArticleSchema(resource, `/resources/${resource.slug}`, site);
  const faqSchema = resource.faqs && resource.faqs.length > 0 ? buildFAQSchema(resource.faqs) : null;
  const imageObjectSchemas = buildImageObjectSchema(resource.gallery || [], site);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {imageObjectSchemas.map((imageSchema, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(imageSchema) }}
        />
      ))}
      <ResourceTemplate resource={resource} site={site} categories={categoriesList} />
    </>
  );
}
