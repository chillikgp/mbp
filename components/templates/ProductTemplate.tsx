import React from "react";
import { Product, FAQItem, SiteSettings } from "../../lib/types";
import { shopPath, checkoutPath } from "../../lib/routes";
import Breadcrumbs from "../layout/Breadcrumbs";
import ResponsiveImage from "../layout/ResponsiveImage";
import Section from "../layout/Section";
import Container from "../layout/Container";
import PageHeader from "../layout/PageHeader";
import FAQSection from "../sections/FAQSection";

interface ProductTemplateProps {
  product: Product;
  productFaqs: FAQItem[];
  relatedProducts: Product[];
  site: SiteSettings;
}

export default function ProductTemplate({
  product,
  productFaqs,
  relatedProducts,
  site,
}: ProductTemplateProps) {
  const money = (amount: number) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  const basePrice = product.variants?.[0]?.options?.[0]?.price || product.startingPrice || 0;
  const images = product.gallery?.length ? product.gallery : [{ src: product.heroImage, alt: product.name }];

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: product.name },
  ];

  return (
    <>
      <section className="product-page">
        <Container>
          <Breadcrumbs items={breadcrumbs} />
          <div
            className="product-hero-grid"
            data-product-detail=""
            data-product={JSON.stringify(product)}
          >
            {/* Product Gallery */}
            <div className="product-gallery" data-product-gallery="">
              <div className="product-gallery-main">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={images[0].src}
                  alt={images[0].alt || product.name}
                  data-product-main-image=""
                />
              </div>
              <div className="product-thumbs">
                {images.map((image, index) => (
                  <button
                    key={index}
                    className={index === 0 ? "is-active" : ""}
                    type="button"
                    data-product-thumb={image.src}
                    aria-label={`Show ${image.alt || product.name}`}
                  >
                    <ResponsiveImage src={image.src} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>

            {/* Buy Panel */}
            <aside className="product-buy-panel">
              <p className="eyebrow">Made to order</p>
              <h1>{product.name}</h1>
              <div className="product-rating">
                <span>★★★★★</span> {product.rating} from {product.reviewCount} parents
              </div>
              <p className="lead">{product.summary}</p>
              <div className="product-price" data-product-price="">
                {money(basePrice)}
              </div>

              {/* Variant Selector Radios */}
              {(product.variants || []).map((variant) => (
                <fieldset
                  key={variant.key}
                  className="variant-group"
                  data-variant-group={variant.key}
                >
                  <legend>{variant.name}</legend>
                  <div className="variant-options">
                    {variant.options.map((option, index) => (
                      <label key={index} className="variant-option">
                        <input
                          type="radio"
                          name={variant.key}
                          value={option.label}
                          data-price={option.price || 0}
                          defaultChecked={index === 0}
                        />
                        <span>
                          {option.label}
                          {option.price ? <small>+ {money(option.price)}</small> : ""}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}

              {/* Personalization Fields */}
              {product.personalizationFields && product.personalizationFields.length > 0 && (
                <div className="product-fields">
                  {product.personalizationFields.map((field) => (
                    <label key={field.key}>
                      {field.label}
                      <input name={field.key} placeholder={field.placeholder || ""} />
                    </label>
                  ))}
                </div>
              )}

              {/* Quantity */}
              <label className="quantity-control">
                Quantity
                <span>
                  <button type="button" data-qty-minus="">
                    -
                  </button>
                  <input name="quantity" defaultValue="1" inputMode="numeric" data-quantity="" />
                  <button type="button" data-qty-plus="">
                    +
                  </button>
                </span>
              </label>

              {/* Actions */}
              <div className="action-row">
                <a
                  className="btn btn-primary"
                  href={checkoutPath(product)}
                  data-product-checkout=""
                  data-track="shop_checkout_start"
                  data-track-label={product.name}
                >
                  Personalize & continue
                </a>
                <a
                  className="btn btn-outline"
                  href={site.whatsapp}
                  data-track="cta_click"
                  data-track-label="Shop WhatsApp"
                >
                  Ask on WhatsApp
                </a>
              </div>

              <div className="mini-trust">
                <span>Handcrafted</span>
                <span>Made to order</span>
                <span>Photo preview</span>
                <span>WhatsApp support</span>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* Details Lists */}
      <Section isAlt>
        <Container className="grid grid-3">
          <article className="content-card">
            <h3>Product details</h3>
            <ul className="feature-list">
              {product.details.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="content-card">
            <h3>How it works</h3>
            <ul className="feature-list">
              {product.howItWorks.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="content-card">
            <h3>What's included</h3>
            <ul className="feature-list">
              {product.included.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </article>
        </Container>
      </Section>

      {/* Reviews */}
      <Section>
        <Container>
          <PageHeader title="Parents love the tiny details" eyebrow="Reviews" />
          <div className="grid grid-2">
            {(product.reviews || []).map((review, idx) => (
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

      {/* FAQs */}
      <Section isAlt>
        <Container>
          <PageHeader title={`${product.name} questions`} eyebrow="FAQ" />
          <FAQSection items={productFaqs} />
        </Container>
      </Section>

      {/* Related Products */}
      <Section>
        <Container>
          <PageHeader title="Related celebration products" eyebrow="Pair it with" />
          <div className="shop-product-grid">
            {relatedProducts.map((item) => (
              <a
                key={item.slug}
                className="shop-product-card"
                href={shopPath(item)}
                data-track="shop_product_click"
                data-track-label={item.name}
              >
                <div className="shop-product-media">
                  <ResponsiveImage src={item.heroImage} alt={item.name} loading="lazy" />
                </div>
                <div className="shop-product-copy">
                  <span className="pill">{item.priceLabel}</span>
                  <h3>{item.name}</h3>
                  <p>{item.shortDescription}</p>
                  <span className="btn btn-soft">View product</span>
                </div>
              </a>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
export { ProductTemplate };
