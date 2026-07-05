import React from "react";
import { getSiteSettings } from "../../../lib/repositories/settingsRepository";
import { getCategories } from "../../../lib/repositories/categoryRepository";
import { buildMetadata } from "../../../lib/seo";
import { buildLocalBusinessSchema } from "../../../lib/schema";
import Hero from "../../../components/sections/Hero";
import Section from "../../../components/layout/Section";
import Container from "../../../components/layout/Container";
import PageHeader from "../../../components/layout/PageHeader";
import CategoryGrid from "../../../components/sections/CategoryGrid";
import InquiryForm from "../../../components/sections/InquiryForm";

export async function generateMetadata() {
  const site = await getSiteSettings();
  return await buildMetadata({
    title: `Portfolio | ${site.name}`,
    description: "Category-based baby, maternity, birthday, event, festival and family photography portfolio by My Baby Pictures.",
    path: "/portfolio",
    image: "/images/portfolio-family-2.jpeg",
  });
}

export default async function PortfolioIndexPage() {
  const site = await getSiteSettings();
  const categories = await getCategories();
  const schema = buildLocalBusinessSchema(site);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Hero
        eyebrow="Portfolio"
        title="Browse real stories by photography category."
        copy="The portfolio is organized by session type so parents can quickly see the work most relevant to them."
        image="/images/portfolio-family-2.jpeg"
        primary="Book a Session"
        secondary="Explore Categories"
        path="#contact"
        secondaryPath="#portfolio"
      />
      <Section isAlt>
        <Container>
          <PageHeader title="Select a gallery" eyebrow="Portfolio categories" />
          <CategoryGrid items={categories} />
        </Container>
      </Section>
      <Section id="contact">
        <Container className="grid grid-2">
          <div>
            <h2>Want a similar story?</h2>
            <p className="lead">
              Share references from the category gallery and we will plan a session around your
              baby, family or event.
            </p>
          </div>
          <InquiryForm site={site} categories={categories} />
        </Container>
      </Section>
    </>
  );
}
