import React from "react";
import { notFound } from "next/navigation";
import { getSiteSettings } from "../../../lib/repositories/settingsRepository";
import { getResourceBySlug, getResources } from "../../../lib/repositories/resourceRepository";
import { getCategories } from "../../../lib/repositories/categoryRepository";
import { buildMetadata } from "../../../lib/seo";
import { buildLocalBusinessSchema } from "../../../lib/schema";
import ResourceTemplate from "../../../components/templates/ResourceTemplate";

interface ResourcePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const resources = getResources();
  return resources.map((r) => ({
    slug: r.slug,
  }));
}

export async function generateMetadata({ params }: ResourcePageProps) {
  const { slug } = await params;
  const resource = getResourceBySlug(slug);
  if (!resource) return {};

  const site = getSiteSettings();
  return buildMetadata({
    title: `${resource.title} | ${site.name}`,
    description: resource.excerpt,
    path: `/resources/${resource.slug}/`,
    image: resource.image,
  });
}

export default async function ResourceDetailPage({ params }: ResourcePageProps) {
  const { slug } = await params;
  const resource = getResourceBySlug(slug);
  if (!resource) {
    notFound();
  }

  const site = getSiteSettings();
  const categoriesList = getCategories();
  const schema = buildLocalBusinessSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <ResourceTemplate resource={resource} site={site} categories={categoriesList} />
    </>
  );
}
