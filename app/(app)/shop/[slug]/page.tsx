import React from "react";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts, getShopSettings } from "../../../../lib/repositories/productRepository";
import { getSiteSettings } from "../../../../lib/repositories/settingsRepository";
import { getFAQs } from "../../../../lib/repositories/faqRepository";
import { buildMetadata } from "../../../../lib/seo";
import { buildProductSchema, buildFAQSchema } from "../../../../lib/schema";
import ProductTemplate from "../../../../components/templates/ProductTemplate";
import { shopPath } from "../../../../lib/routes";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return await buildMetadata({
    title: `${product.name} | My Baby Pictures Shop`,
    description: product.summary,
    path: shopPath(product),
    image: product.heroImage,
  });
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  const [site, shop, productsList] = await Promise.all([
    getSiteSettings(),
    getShopSettings(),
    getProducts(),
  ]);
  const faqItems = product.faqs || shop.faqs || [];
  const productSchema = buildProductSchema(product, site);
  const faqSchema = product.faqs && product.faqs.length > 0 ? buildFAQSchema(product.faqs) : null;

  // Look up related products
  const related = productsList.filter((item) => item.slug !== product.slug).slice(0, 2);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <ProductTemplate
        product={product}
        productFaqs={faqItems}
        relatedProducts={related}
        site={site}
      />
    </>
  );
}
export { ProductDetailPage };
