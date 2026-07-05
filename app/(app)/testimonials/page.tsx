import React from "react";
import { getSiteSettings } from "../../../lib/repositories/settingsRepository";
import { getTestimonials } from "../../../lib/repositories/testimonialRepository";
import { getCategories } from "../../../lib/repositories/categoryRepository";
import { buildMetadata } from "../../../lib/seo";
import { buildLocalBusinessSchema } from "../../../lib/schema";
import Hero from "../../../components/sections/Hero";
import Section from "../../../components/layout/Section";
import Container from "../../../components/layout/Container";
import TestimonialSection from "../../../components/sections/TestimonialSection";
import InquiryForm from "../../../components/sections/InquiryForm";

export async function generateMetadata() {
  const site = await getSiteSettings();
  return await buildMetadata({
    title: `Testimonials | ${site.name}`,
    description: "Parent testimonials and reviews for My Baby Pictures photography studio.",
    path: "/testimonials/",
    image: "/images/client-sophia.jpeg",
  });
}

export default async function TestimonialsPage() {
  const [site, testimonials, categories] = await Promise.all([
    getSiteSettings(),
    getTestimonials(),
    getCategories(),
  ]);
  const schema = buildLocalBusinessSchema(site);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Hero
        eyebrow="Reviews"
        title="Kind words from families who trusted MBP."
        copy={`Rated ${site.rating} by ${site.reviewCount} happy parents across newborn, maternity, milestone, birthday and festival sessions.`}
        image="/images/client-sophia.jpeg"
        primary="Book Your Session"
        secondary="Browse Categories"
        path="#contact"
        secondaryPath="#portfolio"
      />
      <Section isAlt>
        <Container>
          <TestimonialSection items={testimonials} limit={testimonials.length} />
        </Container>
      </Section>
      <Section id="contact">
        <Container className="grid grid-2">
          <div>
            <h2>Ready to create your own story?</h2>
            <p className="lead">
              The team will help you plan a session that feels calm, personal and polished.
            </p>
          </div>
          <InquiryForm site={site} categories={categories} />
        </Container>
      </Section>
    </>
  );
}
