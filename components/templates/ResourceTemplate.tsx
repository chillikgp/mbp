import React from "react";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { Resource, PhotographyCategory, SiteSettings } from "../../lib/types";
import Hero from "../sections/Hero";
import Container from "../layout/Container";
import Section from "../layout/Section";
import ResponsiveImage from "../layout/ResponsiveImage";
import InquiryForm from "../sections/InquiryForm";
import FAQSection from "../sections/FAQSection";

interface ResourceTemplateProps {
  resource: Resource;
  site: SiteSettings;
  categories: PhotographyCategory[];
}

export default function ResourceTemplate({ resource, site, categories }: ResourceTemplateProps) {
  return (
    <>
      <Hero
        eyebrow={resource.category}
        title={resource.title}
        copy={resource.excerpt}
        image={resource.image}
        primary="Discuss This Session"
        secondary="All Resources"
        path="#contact"
        secondaryPath="#resources"
      />

      <Section>
        <Container className="story-grid">
          <div>
            <p className="eyebrow">Guide</p>
            <h2>{resource.title}</h2>
            <p className="lead">{resource.excerpt}</p>
            <ul className="feature-list">
              {resource.contentPoints && resource.contentPoints.length > 0 ? (
                resource.contentPoints.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))
              ) : (
                <>
                  <li>Choose the right category page before comparing packages.</li>
                  <li>Share baby age, date, theme and location preferences with the studio.</li>
                  <li>Use the inquiry form to confirm current availability and add-ons.</li>
                </>
              )}
            </ul>
          </div>
          <ResponsiveImage src={resource.image} alt={resource.title} loading="lazy" />
        </Container>
      </Section>

      {resource.gallery && resource.gallery.length > 0 && (
        <Section isAlt>
          <Container>
            <p className="eyebrow">At a glance</p>
            <h2>Ideas in this guide</h2>
            <div className="grid grid-3">
              {resource.gallery.map((item, idx) => (
                <article key={idx} className="content-card bts-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.src} alt={item.alt} loading="lazy" />
                  {item.caption && <h3>{item.caption}</h3>}
                </article>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {resource.content ? (
        <Section>
          <Container className="article-body">
            <RichText data={resource.content as any} />
          </Container>
        </Section>
      ) : null}

      {resource.faqs && resource.faqs.length > 0 && (
        <Section isAlt>
          <Container>
            <p className="eyebrow">FAQ</p>
            <h2>{resource.title} questions</h2>
            <FAQSection items={resource.faqs} />
          </Container>
        </Section>
      )}

      <Section isAlt id="contact">
        <Container className="grid grid-2">
          <div>
            <h2>Plan with the studio.</h2>
            <p className="lead">
              Send your question and the team will suggest the best session route.
            </p>
          </div>
          <InquiryForm site={site} categories={categories} />
        </Container>
      </Section>
    </>
  );
}
export { ResourceTemplate };
