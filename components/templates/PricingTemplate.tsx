import React from "react";
import { PhotographyCategory, SiteSettings } from "../../lib/types";
import Hero from "../sections/Hero";
import Container from "../layout/Container";
import Section from "../layout/Section";
import PageHeader from "../layout/PageHeader";
import ComparisonTable from "../sections/ComparisonTable";
import InquiryForm from "../sections/InquiryForm";

interface PricingTemplateProps {
  category: PhotographyCategory;
  site: SiteSettings;
  categories: PhotographyCategory[];
}

export default function PricingTemplate({ category, site, categories }: PricingTemplateProps) {
  return (
    <>
      <Hero
        eyebrow="Pricing"
        title={`${category.title} pricing`}
        copy={`Compare ${category.title.toLowerCase()} packages, inclusions and add-ons. Pricing can be updated independently for this category.`}
        image={category.heroImage}
        primary="Inquire About Pricing"
        secondary="View Gallery"
        path="#contact"
        secondaryPath="#portfolio"
      />

      <Section>
        <Container>
          <div className="grid grid-3">
            {(category.pricing || []).map((pkg, idx) => (
              <article key={idx} className={`price-card ${pkg.featured ? "featured" : ""}`}>
                <p className="eyebrow">{pkg.featured ? "Most booked" : category.title}</p>
                <h3>{pkg.name}</h3>
                <div className="price">
                  {pkg.price} <small>onwards</small>
                </div>
                <ul className="feature-list">
                  {pkg.includes.map((item, fIdx) => (
                    <li key={fIdx}>{item}</li>
                  ))}
                </ul>
                <a
                  className={`btn ${pkg.featured ? "btn-primary" : "btn-soft"}`}
                  href="#contact"
                  data-track="cta_click"
                  data-category={category.slug}
                  data-track-label={`${pkg.name} inquiry`}
                >
                  Inquire
                </a>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <Section isAlt>
        <Container>
          <PageHeader
            title={`${category.title} inclusions`}
            eyebrow="Package comparison"
          />
          <ComparisonTable category={category} />
        </Container>
      </Section>

      <Section>
        <Container>
          <PageHeader title="Customize your session" eyebrow="Add-ons" />
          <div className="pill-row">
            {(category.addons || []).map((addon, idx) => (
              <span key={idx} className="pill">
                {addon}
              </span>
            ))}
          </div>
        </Container>
      </Section>

      <Section isAlt id="contact">
        <Container className="grid grid-2">
          <div>
            <p className="eyebrow">Inquiry</p>
            <h2>Request current availability.</h2>
            <p className="lead">
              Final package recommendations depend on date, age, location, preferred sets and output needs.
            </p>
          </div>
          <InquiryForm site={site} categories={categories} category={category} />
        </Container>
      </Section>
    </>
  );
}
export { PricingTemplate };
