import React from "react";
import { getSiteSettings } from "../../../lib/repositories/settingsRepository";
import { getCategories } from "../../../lib/repositories/categoryRepository";
import { buildMetadata } from "../../../lib/seo";
import { buildLocalBusinessSchema, buildBreadcrumbSchema } from "../../../lib/schema";
import { childPath } from "../../../lib/routes";
import Hero from "../../../components/sections/Hero";
import Section from "../../../components/layout/Section";
import Container from "../../../components/layout/Container";
import PageHeader from "../../../components/layout/PageHeader";
import CategoryGrid from "../../../components/sections/CategoryGrid";
import InquiryForm from "../../../components/sections/InquiryForm";

export async function generateMetadata() {
  const site = await getSiteSettings();
  return await buildMetadata({
    title: `Photography Categories | ${site.name}`,
    description:
      "Explore every photography category by My Baby Pictures: newborn, maternity, birthday, family, event and festival sessions across Delhi NCR.",
    path: "/categories",
    image: "/images/hero-carousel-1.jpeg",
  });
}

export default async function CategoriesIndexPage() {
  const site = await getSiteSettings();
  const categories = await getCategories();

  const businessSchema = buildLocalBusinessSchema(site);
  const breadcrumbSchema = buildBreadcrumbSchema(
    [
      { label: "Home", href: "/" },
      { label: "Categories", href: "/categories" },
    ],
    site.domain
  );

  const withChildren = categories.filter(
    (category) => category.children && category.children.length > 0
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Hero
        eyebrow="Categories"
        title="Every session type, one place to start."
        copy="Each category has its own setups, packages and gallery so you can plan the session that fits your family's milestone."
        image="/images/hero-carousel-1.jpeg"
        primary="Check Availability"
        secondary="Explore Categories"
        path="#contact"
        secondaryPath="#categories"
      />
      <Section isAlt id="categories">
        <Container>
          <PageHeader title="Choose a photography experience" eyebrow="All categories" />
          <CategoryGrid items={categories} />
        </Container>
      </Section>
      {withChildren.length > 0 && (
        <Section>
          <Container>
            <PageHeader
              title="Specialized session themes"
              eyebrow="Subcategories"
              copy="Dedicated pages for cultural celebrations and themed sessions."
            />
            <div className="grid grid-3">
              {withChildren.flatMap((category) =>
                (category.children || []).map((child) => (
                  <a
                    key={`${category.slug}-${child.slug}`}
                    className="content-card"
                    href={childPath(category, child)}
                  >
                    <h3>{child.title}</h3>
                    <p>{child.summary}</p>
                  </a>
                ))
              )}
            </div>
          </Container>
        </Section>
      )}
      <Section isAlt id="contact">
        <Container className="grid grid-2">
          <div>
            <h2>Not sure which session fits?</h2>
            <p className="lead">
              Tell us the occasion and the baby&apos;s age — we will point you to the right
              category and package.
            </p>
          </div>
          <InquiryForm site={site} categories={categories} />
        </Container>
      </Section>
    </>
  );
}
