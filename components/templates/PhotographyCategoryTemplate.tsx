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

  const isMaternity = category.slug === "maternity";
  const effectiveGallery = isMaternity && effective.gallery
    ? effective.gallery.slice(0, 10)
    : effective.gallery;

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
              copy="Explore specialized session themes, cultural rituals, and package detail pages for each celebration."
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
            title={isMaternity ? "Maternity Portfolio Highlights" : `${title} gallery`}
            eyebrow="Portfolio"
            copy={isMaternity ? "Browse our signature looks and outfits. Expecting mothers can select their preferred themes from these curated recent sessions." : "Step into our gallery of recent sessions and browse by theme to see our styling and setups in action."}
          />
          <PortfolioGrid gallery={effectiveGallery || []} category={category.slug} />
          <div className="action-row">
            <a className="btn btn-outline" href={portfolioPath(category)}>
              {isMaternity ? "View the Complete Maternity Portfolio" : `Open ${category.title} Portfolio`}
            </a>
          </div>
        </Container>
      </Section>

      <Section isAlt={!isChild}>
        <Container>
          <PageHeader
            title={`${category.title} packages`}
            eyebrow="Pricing"
            copy="Browse tailored package inclusions, premium prints, and custom setups for your session."
          />
          <div className={isMaternity ? "grid grid-4" : "grid grid-3"}>
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

      {isMaternity && (
        <>
          {/* Complimentary Frame Offer */}
          <Section isAlt>
            <Container>
              <div className="promo-box" style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
                <p className="eyebrow">Exclusive Promotion</p>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '16px' }}>Complimentary Frame Offer</h2>
                <p style={{ fontSize: '1.1rem', marginBottom: '24px' }}>
                  Follow, subscribe, and review MyBabyPictures.in to receive a complimentary frame for your session memories:
                </p>
                <div className="grid grid-2" style={{ textAlign: 'left', marginBottom: '24px', gap: '20px' }}>
                  <div style={{ padding: '20px', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: '4px' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: 'var(--accent-strong)', fontSize: '1.1rem' }}>From One Account</h4>
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>Receive a complimentary <strong>8 × 12-inch</strong> printed frame.</p>
                  </div>
                  <div style={{ padding: '20px', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: '4px' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: 'var(--accent-strong)', fontSize: '1.1rem' }}>From Two Accounts</h4>
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>Receive a complimentary <strong>12 × 18-inch</strong> printed frame.</p>
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 0 }}>
                  * Verification of reviews/follows is required. Subject to current frame availability and standard studio terms.
                </p>
              </div>
            </Container>
          </Section>

          {/* What to Expect (4-step experience) */}
          <Section>
            <Container>
              <PageHeader
                title="Your Session Experience"
                eyebrow="What to expect"
                copy="We walk you through every stage of your maternity shoot, from planning to final deliverables."
              />
              <div className="grid grid-4" style={{ marginTop: '40px' }}>
                <article style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent-strong)', display: 'grid', placeItems: 'center', fontSize: '1.25rem', fontWeight: 'bold', margin: '0 auto 16px' }}>1</div>
                  <h3 style={{ fontSize: '1.2rem', margin: '0 0 8px 0' }}>Select a Package</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--muted)', margin: 0 }}>Choose the pricing and inclusion level that best fits your family’s vision.</p>
                </article>
                <article style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent-strong)', display: 'grid', placeItems: 'center', fontSize: '1.25rem', fontWeight: 'bold', margin: '0 auto 16px' }}>2</div>
                  <h3 style={{ fontSize: '1.2rem', margin: '0 0 8px 0' }}>Theme & Outfit Planning</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--muted)', margin: 0 }}>Discuss your preferred gown selections, backdrops, and session locations.</p>
                </article>
                <article style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent-strong)', display: 'grid', placeItems: 'center', fontSize: '1.25rem', fontWeight: 'bold', margin: '0 auto 16px' }}>3</div>
                  <h3 style={{ fontSize: '1.2rem', margin: '0 0 8px 0' }}>The Maternity Shoot</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--muted)', margin: 0 }}>Enjoy a relaxed, unhurried session designed entirely around your physical comfort.</p>
                </article>
                <article style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent-strong)', display: 'grid', placeItems: 'center', fontSize: '1.25rem', fontWeight: 'bold', margin: '0 auto 16px' }}>4</div>
                  <h3 style={{ fontSize: '1.2rem', margin: '0 0 8px 0' }}>Artistic Delivery</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--muted)', margin: 0 }}>Receive your high-resolution, professionally finished and edited digital photographs.</p>
                </article>
              </div>
            </Container>
          </Section>

          {/* Ideal Timing for the Shoot */}
          <Section isAlt>
            <Container>
              <div className="grid grid-2" style={{ alignItems: 'center' }}>
                <div>
                  <p className="eyebrow">Planning Tip</p>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem' }}>Ideal Timing for Your Photoshoot</h2>
                  <p className="lead" style={{ marginTop: '16px' }}>
                    Maternity sessions are commonly planned during the later second trimester or early third trimester, when the baby bump is clearly visible and the mother is generally comfortable enough for the session.
                  </p>
                  <p style={{ color: 'var(--muted)' }}>
                    The ideal timing varies by pregnancy, so personal comfort and medical guidance should always take priority. We recommend reserving your date early in your second trimester to secure your preferred slot.
                  </p>
                </div>
                <div style={{ display: 'grid', placeItems: 'center' }}>
                  <img src="/images/maternity/26_white3_large.jpeg" alt="Soft natural light white gown photoshoot" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '4px' }} />
                </div>
              </div>
            </Container>
          </Section>

          {/* Delhi NCR Service Area */}
          <Section>
            <Container>
              <PageHeader
                title="Maternity Photography Across Delhi NCR"
                eyebrow="Locations"
                copy="Our team provides professional maternity photography services to expecting families across the capital region."
              />
              <div className="grid grid-3" style={{ marginTop: '32px', gap: '16px' }}>
                {['Delhi', 'Noida', 'Gurgaon / Gurugram', 'Greater Noida', 'Noida Extension', 'Faridabad'].map((loc) => (
                  <div key={loc} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: '4px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent-strong)' }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>
                    <span style={{ fontWeight: 600 }}>{loc}</span>
                  </div>
                ))}
              </div>
            </Container>
          </Section>

          {/* Other Photography Services */}
          <Section isAlt>
            <Container>
              <PageHeader
                title="Other Family Photography Services"
                eyebrow="Keep Exploring"
                copy="We capture all milestones and celebrations of your family's journey."
              />
              <p className="lead" style={{ textAlign: 'center', maxWidth: '800px', margin: '30px auto' }}>
                We also provide candid photography and cinematic event coverage for birthdays, baby welcome celebrations, mundan ceremonies, naming ceremonies, Kua Pujan, Mata Ki Chowki and other family occasions.
              </p>
              <div className="pill-row" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
                <span className="pill">Birthday Sessions</span>
                <span className="pill">Baby Welcome</span>
                <span className="pill">Mundan Photography</span>
                <span className="pill">Naming Ceremonies</span>
                <span className="pill">Kua Pujan</span>
                <span className="pill">Mata Ki Chowki</span>
              </div>
            </Container>
          </Section>
        </>
      )}

      {/* Video slots & Behind the scenes */}
      {((effective.videos && effective.videos.length > 0) || (effective.bts && effective.bts.length > 0)) && (
        <Section isAlt>
          <Container>
            <PageHeader
              title="Video and behind the scenes"
              eyebrow="Media support"
              copy="Experience the magic behind the lens with highlight reels, set sneak-peeks, and client session stories."
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
                          Highlight reel or set preview video coming soon. Contact our East Delhi studio to view our sample films.
                        </p>
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className="content-card">
                  <h3>Video-ready section</h3>
                  <p>See our latest behind-the-scenes content and video reels on our official social media channels.</p>
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
