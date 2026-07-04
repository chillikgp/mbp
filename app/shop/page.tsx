import React from "react";
import { getProducts, getShopSettings } from "../../lib/repositories/productRepository";
import { buildMetadata } from "../../lib/seo";
import { buildLocalBusinessSchema } from "../../lib/schema";
import Hero from "../../components/sections/Hero";
import Section from "../../components/layout/Section";
import Container from "../../components/layout/Container";
import PageHeader from "../../components/layout/PageHeader";
import FAQSection from "../../components/sections/FAQSection";
import ResponsiveImage from "../../components/layout/ResponsiveImage";
import { shopPath } from "../../lib/routes";

export async function generateMetadata() {
  const shop = getShopSettings();
  return buildMetadata({
    title: shop.seo.title,
    description: shop.seo.description,
    path: "/shop/",
    image: shop.hero.image,
  });
}

export default function ShopIndexPage() {
  const shop = getShopSettings();
  const products = getProducts();
  const schema = buildLocalBusinessSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Hero
        eyebrow={shop.hero.eyebrow}
        title={shop.hero.title}
        copy={shop.hero.copy}
        image={shop.hero.image}
        primary="Shop products"
        secondary="How it works"
        path="#products"
        secondaryPath="#products"
      />
      
      <Section>
        <Container className="grid grid-2">
          <div>
            <p className="eyebrow">Personalized by MBP</p>
            <h2>Upload photos. Choose details. Make the party feel yours.</h2>
          </div>
          <p className="lead">
            Every product is made around your baby's face, name, milestone, theme or celebration
            colors. The flow collects photos and details before payment so parents know exactly
            what they are ordering.
          </p>
        </Container>
      </Section>

      <Section isAlt id="products">
        <Container>
          <PageHeader
            title="Personalized celebration products"
            eyebrow="Shop"
            copy="A small first collection for birthdays, milestones and family functions."
          />
          <div className="shop-product-grid">
            {products.map((product) => (
              <a
                key={product.slug}
                className="shop-product-card"
                href={shopPath(product)}
                data-track="shop_product_click"
                data-track-label={product.name}
              >
                <div className="shop-product-media">
                  <ResponsiveImage src={product.heroImage} alt={product.name} loading="lazy" />
                </div>
                <div className="shop-product-copy">
                  <span className="pill">{product.priceLabel}</span>
                  <h3>{product.name}</h3>
                  <p>{product.shortDescription}</p>
                  <span className="btn btn-soft">View product</span>
                </div>
              </a>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <PageHeader title="Made for memory-filled celebrations" eyebrow="Why parents buy these" />
          <div className="trust-row">
            {shop.why.map((item, idx) => (
              <span key={idx}>{item}</span>
            ))}
          </div>
        </Container>
      </Section>

      <Section isAlt>
        <Container>
          <PageHeader title="Tiny products, big smiles" eyebrow="Loved details" />
          <div className="grid grid-2">
            {(products[1]?.reviews || []).map((review, idx) => (
              <article key={idx} className="testimonial-card">
                <div className="stars" aria-label="5 star rating">
                  ★★★★★
                </div>
                <blockquote>{review.quote}</blockquote>
                <strong>{review.name}</strong>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <PageHeader title="Before you personalize" eyebrow="FAQ" />
          <FAQSection items={shop.faqs} />
        </Container>
      </Section>
    </>
  );
}
export { ShopIndexPage };
