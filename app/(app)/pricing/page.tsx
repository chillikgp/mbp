import React from "react";
import { getSiteSettings } from "../../../lib/repositories/settingsRepository";
import { getCategories } from "../../../lib/repositories/categoryRepository";
import { buildMetadata } from "../../../lib/seo";
import { buildLocalBusinessSchema } from "../../../lib/schema";
import Hero from "../../../components/sections/Hero";
import Section from "../../../components/layout/Section";
import Container from "../../../components/layout/Container";
import PageHeader from "../../../components/layout/PageHeader";
import InquiryForm from "../../../components/sections/InquiryForm";
import { pricingPath } from "../../../lib/routes";

export async function generateMetadata() {
  const site = await getSiteSettings();
  return await buildMetadata({
    title: `Pricing | ${site.name}`,
    description: "Category-specific photography pricing for maternity, newborn, milestone, birthday, family, event and festival sessions.",
    path: "/pricing/",
    image: "/images/portfolio-newborn-2.jpeg",
  });
}

export default async function PricingIndexPage() {
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
        eyebrow="Category-specific pricing"
        title="Choose pricing by photography category."
        copy="Maternity, newborn, milestone, birthday, family, event and festival sessions each have their own packages, inclusions and add-ons."
        image="/images/portfolio-newborn-2.jpeg"
        primary="Ask for Guidance"
        secondary="Browse Categories"
        path="#contact"
        secondaryPath="#pricing-routes"
      />
      <Section isAlt id="pricing-routes">
        <Container>
          <PageHeader title="Session pricing by category" eyebrow="Pricing routes" />
          <div className="grid grid-3">
            {categories.map((category) => (
              <a key={category.slug} className="content-card" href={pricingPath(category)}>
                <span className="pill">{category.label}</span>
                <h3>{category.title}</h3>
                <p>{category.summary}</p>
              </a>
            ))}
          </div>
        </Container>
      </Section>
      <Section id="contact">
        <Container className="grid grid-2">
          <div>
            <h2>Need help choosing?</h2>
            <p className="lead">
              Tell us your session type and rough date. We will suggest the right package.
            </p>
          </div>
          <InquiryForm site={site} categories={categories} />
        </Container>
      </Section>
    </>
  );
}
