import React from "react";
import { PhotographyCategory, SiteSettings } from "../../lib/types";
import Hero from "../sections/Hero";
import Container from "../layout/Container";
import Section from "../layout/Section";
import PageHeader from "../layout/PageHeader";
import PortfolioGrid from "../photography/PortfolioGrid";
import InquiryForm from "../sections/InquiryForm";

interface PortfolioTemplateProps {
  category: PhotographyCategory;
  site: SiteSettings;
  categories: PhotographyCategory[];
}

export default function PortfolioTemplate({ category, site, categories }: PortfolioTemplateProps) {
  return (
    <>
      <Hero
        eyebrow="Category portfolio"
        title={`${category.title} portfolio`}
        copy={category.summary}
        image={category.heroImage}
        primary="Book This Look"
        secondary="See Pricing"
        path="#contact"
        secondaryPath="#portfolio"
      />

      <Section isAlt id="portfolio">
        <Container>
          <PageHeader title={`${category.title} images`} eyebrow="Gallery" />
          <PortfolioGrid gallery={category.gallery || []} category={category.slug} />
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="cta-band">
            <p className="eyebrow">Book My Baby Pictures</p>
            <h2>Plan a {category.title.toLowerCase()} session</h2>
            <p>Send us your favorite gallery references and preferred date.</p>
            <div className="action-row">
              <a
                className="btn btn-soft"
                href={site.whatsapp}
                data-track="cta_click"
                data-category={category.slug}
                data-track-label="WhatsApp CTA"
              >
                WhatsApp Now
              </a>
              <a
                className="btn btn-outline"
                href="/contact/"
                data-track="cta_click"
                data-track-label="Contact page"
              >
                Contact Studio
              </a>
            </div>
          </div>
        </Container>
      </Section>

      <Section id="contact">
        <Container className="grid grid-2">
          <div>
            <h2>Start your inquiry.</h2>
            <p className="lead">
              Tell us which images you loved and what kind of session you are imagining.
            </p>
          </div>
          <InquiryForm site={site} categories={categories} category={category} />
        </Container>
      </Section>
    </>
  );
}
export { PortfolioTemplate };
