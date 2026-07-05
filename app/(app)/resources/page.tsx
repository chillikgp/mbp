import React from "react";
import { getSiteSettings } from "../../../lib/repositories/settingsRepository";
import { getResources } from "../../../lib/repositories/resourceRepository";
import { buildMetadata } from "../../../lib/seo";
import { buildLocalBusinessSchema } from "../../../lib/schema";
import Hero from "../../../components/sections/Hero";
import Section from "../../../components/layout/Section";
import Container from "../../../components/layout/Container";
import ResourceGrid from "../../../components/sections/ResourceGrid";

export async function generateMetadata() {
  const site = await getSiteSettings();
  return await buildMetadata({
    title: `Resources | ${site.name}`,
    description: "Parent planning resources for maternity, newborn and birthday photography sessions.",
    path: "/resources",
    image: "/images/portfolio-maternity-2.jpeg",
  });
}

export default async function ResourcesIndexPage() {
  const site = await getSiteSettings();
  const resources = await getResources();
  const schema = buildLocalBusinessSchema(site);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Hero
        eyebrow="Resources"
        title="Planning guides for meaningful family photographs."
        copy="Simple, parent-friendly resources for choosing timing, themes, outfits and session types."
        image="/images/portfolio-maternity-2.jpeg"
        primary="Ask a Question"
        secondary="Browse Guides"
        path="#resources"
        secondaryPath="#resources"
      />
      <Section isAlt id="resources">
        <Container>
          <ResourceGrid resources={resources} />
        </Container>
      </Section>
    </>
  );
}
