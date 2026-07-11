import { PhotographyCategory, CategoryChild, FAQItem, Testimonial, SiteSettings, Resource } from "../../lib/types";
import Hero from "../sections/Hero";
import Container from "../layout/Container";
import Section from "../layout/Section";
import PageHeader from "../layout/PageHeader";
import PortfolioGrid from "../photography/PortfolioGrid";
import ComparisonTable from "../sections/ComparisonTable";
import AddonsComparisonTable from "../sections/AddonsComparisonTable";
import TestimonialSection from "../sections/TestimonialSection";
import FAQSection from "../sections/FAQSection";
import InquiryForm from "../sections/InquiryForm";
import CategoryGrid from "../sections/CategoryGrid";
import ResourceGrid from "../sections/ResourceGrid";
import { portfolioPath, childPath } from "../../lib/routes";

interface PhotographyCategoryTemplateProps {
  category: PhotographyCategory;
  child?: CategoryChild | null;
  pageFaqs: FAQItem[];
  relatedCategories: PhotographyCategory[];
  site: SiteSettings;
  categories: PhotographyCategory[];
  testimonials: Testimonial[];
  relatedResources?: Resource[];
}

export default function PhotographyCategoryTemplate({
  category,
  child = null,
  pageFaqs,
  relatedCategories,
  site,
  categories,
  testimonials,
  relatedResources = [],
}: PhotographyCategoryTemplateProps) {
  const isChild = Boolean(child);
  const title = isChild ? `${child!.title} Photography` : category.label;
  const summary = isChild ? child!.summary : category.description;
  const image = isChild ? child!.heroImage : category.heroImage;
  const description = isChild ? child!.description || category.description : category.description;
  const heroVideo = isChild ? child!.heroVideo || category.heroVideo : category.heroVideo;
  const heroVideoPoster = isChild ? child!.heroVideoPoster || category.heroVideoPoster : category.heroVideoPoster;
  const ctaBadgeImage = isChild ? child!.ctaBadgeImage || category.ctaBadgeImage : category.ctaBadgeImage;

  const pick = <T,>(childVal: T[] | undefined, parentVal: T[] | undefined): T[] | undefined =>
    isChild && childVal && childVal.length > 0 ? childVal : parentVal;

  const effective = isChild
    ? {
        ...category,
        gallery: pick(child!.gallery, category.gallery),
        pricing: pick(child!.pricing, category.pricing),
        addons: pick(child!.addons, category.addons),
        addonDetails: pick(child!.addonDetails, category.addonDetails),
        testimonials: pick(child!.testimonials, category.testimonials),
        videos: pick(child!.videos, category.videos),
        bts: pick(child!.bts, category.bts),
      }
    : category;

  return (
    <>
      <Hero
        eyebrow={isChild ? category.label : category.eyebrow}
        title={title}
        copy={summary}
        image={image}
        video={heroVideo}
        videoPoster={heroVideoPoster}
        primary="Ask for Availability"
        secondary="See Portfolio"
        path="#contact"
        secondaryPath="#portfolio"
      />

      <Section>
        <Container className="grid grid-2">
          <div>
            <p className="eyebrow">Category intro</p>
            <h2>{title} at My Baby Pictures</h2>
          </div>
          <div>
            <p className="lead">{description}</p>
            <div className="pill-row">
              {(effective.addons || []).map((addon, idx) => (
                <span key={idx} className="pill">
                  {addon}
                </span>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {!isChild && category.children && category.children.length > 0 && (
        <Section isAlt>
          <Container>
            <PageHeader
              title={`${category.title} pages`}
              eyebrow="Subcategories"
              copy="Each subcategory can become a dedicated SEO landing page with its own media and copy."
            />
            <div className="grid grid-3">
              {category.children.map((item) => (
                <a key={item.slug} className="content-card" href={childPath(category, item)}>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                </a>
              ))}
            </div>
          </Container>
        </Section>
      )}

      <Section isAlt={isChild} id="portfolio">
        <Container>
          <PageHeader
            title={`${title} gallery`}
            eyebrow="Portfolio"
            copy="Images are managed by category, with room for carousels, tags and future CMS media fields."
          />
          <PortfolioGrid gallery={effective.gallery || []} category={category.slug} />
          <div className="action-row">
            <a className="btn btn-outline" href={portfolioPath(category)}>
              Open {category.title} Portfolio
            </a>
          </div>
        </Container>
      </Section>

      <Section isAlt={!isChild}>
        <Container>
          <PageHeader
            title={`${category.title} packages`}
            eyebrow="Pricing"
            copy="Pricing is category-specific and can be updated independently."
          />
          <div className="grid grid-3">
            {(effective.pricing || []).map((pkg, idx) => (
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
          <PageHeader title="Package comparison" eyebrow="Compare" />
          <ComparisonTable category={effective} />
        </Container>
      </Section>

      {effective.addonDetails && effective.addonDetails.length > 0 && (
        <Section>
          <Container>
            <PageHeader title="Optional add-ons" eyebrow="Customize your package" />
            <AddonsComparisonTable addons={effective.addonDetails} />
          </Container>
        </Section>
      )}

      {/* Video slots & Behind the scenes */}
      {((effective.videos && effective.videos.length > 0) || (effective.bts && effective.bts.length > 0)) && (
        <Section isAlt>
          <Container>
            <PageHeader
              title="Video and behind the scenes"
              eyebrow="Media support"
              copy="This template supports embedded videos, short clips, set previews and BTS content for categories that need it."
            />
            <div className="media-block">
              {effective.videos && effective.videos.length > 0 ? (
                effective.videos.map((video, idx) =>
                  video.file ? (
                    <div key={idx} className="video-shell">
                      <video src={video.file} poster={image} controls title={video.title} />
                    </div>
                  ) : video.embed ? (
                    <div key={idx} className="video-shell">
                      <iframe
                        data-video=""
                        src={video.embed}
                        title={video.title}
                        loading="lazy"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div
                      key={idx}
                      className="video-shell"
                      style={{
                        display: "grid",
                        placeItems: "center",
                        padding: "28px",
                        color: "#fff",
                        textAlign: "center",
                      }}
                    >
                      <div>
                        <p className="eyebrow" style={{ color: "#f4d7cf" }}>
                          Video slot
                        </p>
                        <h3>{video.title}</h3>
                        <p style={{ color: "rgba(255,255,255,.76)" }}>
                          Add a video embed URL in the CMS content model to publish a film, reel or BTS clip here.
                        </p>
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className="content-card">
                  <h3>Video-ready section</h3>
                  <p>Add an embed URL in the category video field to publish films or reels here.</p>
                </div>
              )}
              {effective.bts && effective.bts.length > 0 && (
                <div className="grid">
                  {effective.bts.map((item, idx) => (
                    <article key={idx} className="content-card bts-card">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.title} loading="lazy" />
                      <h3>{item.title}</h3>
                      <p>{item.copy}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </Container>
        </Section>
      )}

      {testimonials.length > 0 && (
        <Section>
          <Container>
            <PageHeader title="Families who booked this experience" eyebrow="Reviews" />
            <TestimonialSection items={testimonials} limit={3} />
          </Container>
        </Section>
      )}

      <Section isAlt>
        <Container>
          <PageHeader title={`${category.title} questions`} eyebrow="FAQ" />
          <FAQSection items={pageFaqs} />
        </Container>
      </Section>

      {relatedResources.length > 0 && (
        <Section>
          <Container>
            <PageHeader title="Related guides" eyebrow="Read next" />
            <ResourceGrid resources={relatedResources} />
          </Container>
        </Section>
      )}

      {relatedCategories.length > 0 && (
        <Section>
          <Container>
            <PageHeader title="Related photography experiences" eyebrow="Keep exploring" />
            <CategoryGrid items={relatedCategories} />
          </Container>
        </Section>
      )}

      <Section id="contact">
        <Container className="grid grid-2">
          <div>
            {ctaBadgeImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={ctaBadgeImage}
                alt=""
                width={96}
                height={96}
                loading="lazy"
                style={{ borderRadius: "50%", marginBottom: "16px" }}
              />
            )}
            <p className="eyebrow">Book {category.title}</p>
            <h2>Check dates, themes and package fit.</h2>
            <p className="lead">
              Send the baby age, event date, preferred location and any visual references. We will help plan the right session flow.
            </p>
          </div>
          <InquiryForm site={site} categories={categories} category={category} />
        </Container>
      </Section>
    </>
  );
}
export { PhotographyCategoryTemplate };
