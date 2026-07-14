import React from "react";
import { PhotographyCategory, SiteSettings } from "../../lib/types";
import Hero from "../sections/Hero";
import Container from "../layout/Container";
import Section from "../layout/Section";
import PageHeader from "../layout/PageHeader";
import PortfolioGrid from "../photography/PortfolioGrid";
import InquiryForm from "../sections/InquiryForm";
import { categoryPath } from "../../lib/routes";

interface PortfolioTemplateProps {
  category: PhotographyCategory;
  site: SiteSettings;
  categories: PhotographyCategory[];
}

export default function PortfolioTemplate({ category, site, categories }: PortfolioTemplateProps) {
  const isMaternity = category.slug === "maternity";
  const title = isMaternity ? "Maternity Photography Portfolio" : `${category.title} portfolio`;
  const copy = isMaternity 
    ? "Explore elegant maternity portraits created across studio, outdoor and couple settings. Each gallery reflects a different gown, mood and visual style, helping you discover the direction you prefer for your own session."
    : category.summary;

  return (
    <>
      <Hero
        eyebrow={isMaternity ? "Studio & Outdoor Gallery" : "Category portfolio"}
        title={title}
        copy={copy}
        image={isMaternity ? "/images/maternity_hero.jpg" : category.heroImage}
        video={category.heroVideo}
        videoPoster={isMaternity ? "/images/maternity_hero.jpg" : category.heroVideoPoster}
        primary="Check Availability"
        secondary={isMaternity ? "See Packages" : "See Pricing"}
        path="#contact"
        secondaryPath={isMaternity ? "/categories/maternity#packages" : "#portfolio"}
      />

      <Section isAlt id="portfolio">
        <Container>
          <PageHeader 
            title={isMaternity ? "Maternity Images" : `${category.title} images`} 
            eyebrow="Gallery" 
            copy={isMaternity ? "Every gown, backdrop, and styling theme is crafted to celebrate your pregnancy with comfort and elegance." : undefined}
          />
          <PortfolioGrid gallery={category.gallery || []} category={category.slug} />
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="cta-band">
            <p className="eyebrow">Book My Baby Pictures</p>
            <h2>Plan a {category.title.toLowerCase()} session</h2>
            {isMaternity ? (
              <p>
                Browse our <a href="/categories/maternity" style={{ textDecoration: "underline", fontWeight: "bold" }}>maternity photoshoot packages</a> to choose the right theme and gown inclusions, or send us your favorite references.
              </p>
            ) : (
              <p>Send us your favorite gallery references and preferred date.</p>
            )}
            <div className="action-row">
              <a
                className="btn btn-soft"
                href={`${categoryPath(category)}#packages`}
                data-track="cta_click"
                data-category={category.slug}
                data-track-label="See Packages"
              >
                See Packages
              </a>
              <a
                className="btn btn-outline"
                href="#contact"
                data-track="cta_click"
                data-track-label="Book a Session"
              >
                Book a Session
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
              {isMaternity 
                ? "Tell us which gowns or themes you loved and what kind of session you are imagining. We serve families across Delhi, Noida, Gurgaon and Faridabad."
                : "Tell us which images you loved and what kind of session you are imagining."}
            </p>
          </div>
          <InquiryForm site={site} categories={categories} category={category} />
        </Container>
      </Section>
    </>
  );
}
export { PortfolioTemplate };
