import React from "react";
import { getSiteSettings } from "../../lib/repositories/settingsRepository";
import { getCategories } from "../../lib/repositories/categoryRepository";
import { buildMetadata } from "../../lib/seo";
import { buildLocalBusinessSchema } from "../../lib/schema";
import Hero from "../../components/sections/Hero";
import Section from "../../components/layout/Section";
import Container from "../../components/layout/Container";
import InquiryForm from "../../components/sections/InquiryForm";

export async function generateMetadata() {
  const site = getSiteSettings();
  return buildMetadata({
    title: `Contact | ${site.name}`,
    description: "Contact My Baby Pictures for baby, maternity, family, event and festival photography in Delhi NCR.",
    path: "/contact/",
    image: "/images/hero-carousel-1.jpeg",
  });
}

export default function ContactPage() {
  const site = getSiteSettings();
  const categories = getCategories();
  const schema = buildLocalBusinessSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Hero
        eyebrow="Contact"
        title="Book a premium baby or family photography session."
        copy={`${site.address}. Call ${site.phone} or send a WhatsApp inquiry for availability.`}
        image="/images/hero-carousel-1.jpeg"
        primary="WhatsApp Now"
        secondary="View Pricing"
        path={site.whatsapp}
        secondaryPath="/pricing/"
      />
      <Section isAlt id="contact">
        <Container className="grid grid-2">
          <div>
            <p className="eyebrow">Inquiry form</p>
            <h2>Tell us the details.</h2>
            <p className="lead">
              A short note is enough: category, baby age, date and preferred location.
            </p>
          </div>
          <InquiryForm site={site} categories={categories} />
        </Container>
      </Section>
    </>
  );
}
