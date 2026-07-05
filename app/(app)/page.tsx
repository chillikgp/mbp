import React from "react";
import { getSiteSettings } from "../../lib/repositories/settingsRepository";
import { getHomepage } from "../../lib/repositories/homepageRepository";
import { getCategories } from "../../lib/repositories/categoryRepository";
import { getGlobalFAQs } from "../../lib/repositories/faqRepository";
import { getResources } from "../../lib/repositories/resourceRepository";
import { getTestimonials } from "../../lib/repositories/testimonialRepository";
import { buildMetadata } from "../../lib/seo";
import { buildLocalBusinessSchema, buildFAQSchema } from "../../lib/schema";
import Hero from "../../components/sections/Hero";
import Section from "../../components/layout/Section";
import Container from "../../components/layout/Container";
import PageHeader from "../../components/layout/PageHeader";
import CategoryGrid from "../../components/sections/CategoryGrid";
import PortfolioGrid from "../../components/photography/PortfolioGrid";
import TestimonialSection from "../../components/sections/TestimonialSection";
import ResourceGrid from "../../components/sections/ResourceGrid";
import FAQSection from "../../components/sections/FAQSection";
import InquiryForm from "../../components/sections/InquiryForm";
import ResponsiveImage from "../../components/layout/ResponsiveImage";

export async function generateMetadata() {
  const homepage = await getHomepage();
  return await buildMetadata({
    title: homepage.seo.title,
    description: homepage.seo.description,
    path: "/",
    image: homepage.hero.image,
  });
}

export default async function HomePage() {
  const [site, homepage, categories, globalFaqs, resources, testimonials] = await Promise.all([
    getSiteSettings(),
    getHomepage(),
    getCategories(),
    getGlobalFAQs(),
    getResources(),
    getTestimonials(),
  ]);

  const displayCategories = homepage.categories || categories;
  const defaultPricingCategory = categories.find((c) => c.slug === "newborn") || categories[1] || categories[0];

  const businessSchema = buildLocalBusinessSchema(site);
  const faqSchema = buildFAQSchema(globalFaqs);

  // Map the first image of each category's gallery for portfolio highlights
  const featuredGallery = displayCategories.flatMap((category) =>
    (category.gallery || [])
      .slice(0, 1)
      .map((item) => ({ ...item, category: category.slug }))
  );


  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <Hero
        eyebrow={homepage.hero.eyebrow}
        title={homepage.hero.title}
        copy={homepage.hero.copy}
        image={homepage.hero.image}
        primary={homepage.hero.primaryCta}
        secondary={homepage.hero.secondaryCta}
        path="#contact"
        secondaryPath="#categories"
        stats={homepage.hero.stats}
      />

      <Section>
        <Container>
          <div className="trust-row">
            {homepage.hero.trust?.map((item, idx) => (
              <span key={idx}>{item}</span>
            ))}
          </div>
        </Container>
      </Section>

      <Section isAlt id="categories">
        <Container>
          <PageHeader
            title="Choose the story you want to preserve"
            eyebrow="Photography experiences"
            copy="One featured gateway per category, each leading to a dedicated page with its own gallery, pricing, FAQs and CTAs."
          />
          <CategoryGrid items={displayCategories} />
        </Container>
      </Section>

      <Section>
        <Container className="story-grid">
          <ResponsiveImage
            src={homepage.story.image}
            alt="My Baby Pictures studio photographer"
            loading="lazy"
          />
          <div>
            <p className="eyebrow">{homepage.story.eyebrow}</p>
            <h2>{homepage.story.title}</h2>
            <p className="lead">{homepage.story.copy}</p>
            <ul className="feature-list">
              {homepage.story.points?.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      <Section isAlt id="portfolio">
        <Container>
          <PageHeader
            title="A category-led portfolio, not one giant gallery"
            eyebrow="Portfolio highlights"
            copy="Browse the highlights here, then step into dedicated portfolio pages for each category."
          />
          <PortfolioGrid gallery={featuredGallery} category="homepage" />
          <div className="action-row">
            <a className="btn btn-primary" href="/portfolio">
              View Portfolio by Category
            </a>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <PageHeader
            title="Packages that change by session type"
            eyebrow="Services and pricing"
            copy="Each category has independent pricing, inclusions, add-ons and inquiry CTAs."
          />
          {/* Default to Newborn pricing cards */}
          <div className="grid grid-3">
            {(defaultPricingCategory?.pricing || []).map((pkg, idx) => (
              <article key={idx} className={`price-card ${pkg.featured ? "featured" : ""}`}>
                <p className="eyebrow">{pkg.featured ? "Most booked" : defaultPricingCategory?.title}</p>
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
                  data-category={defaultPricingCategory?.slug}
                  data-track-label={`${pkg.name} inquiry`}
                >
                  Inquire
                </a>
              </article>
            ))}
          </div>
          <div className="action-row">
            <a className="btn btn-outline" href="/pricing">
              Explore All Pricing
            </a>
          </div>
        </Container>
      </Section>

      <Section isAlt>
        <Container>
          <PageHeader title="Trusted by families across Delhi NCR" eyebrow="Kind words" />
          <TestimonialSection items={testimonials} limit={3} />
          <div className="action-row">
            <a className="btn btn-soft" href="/testimonials">
              Read More Reviews
            </a>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <PageHeader title="Helpful planning guides for parents" eyebrow="Resources" />
          <ResourceGrid resources={resources} limit={3} />
        </Container>
      </Section>

      <Section isAlt>
        <Container>
          <PageHeader title="Before you book" eyebrow="FAQ" />
          <FAQSection items={globalFaqs} />
        </Container>
      </Section>

      <Section id="contact">
        <Container className="grid grid-2">
          <div>
            <p className="eyebrow">Start here</p>
            <h2>Tell us what you are planning.</h2>
            <p className="lead">
              Share the category, baby age, event date or theme and the team will guide you to the right session.
            </p>
          </div>
          <InquiryForm site={site} categories={categories} />
        </Container>
      </Section>
    </>
  );
}
export { HomePage };
