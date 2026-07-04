import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const root = process.cwd();
const data = JSON.parse(await readFile(join(root, "content/site.json"), "utf8"));
const { site, homepage, categories, testimonials, faqs, resources } = data;
const productData = JSON.parse(await readFile(join(root, "content/products.json"), "utf8"));
const { shop, products } = productData;
const mediaMeta = await loadMediaMeta();

const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
}).format(new Date());
const generatedUrls = new Set(["/"]);

const esc = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const strip = (value = "") => String(value).replace(/<[^>]*>/g, "");
const url = (path = "/") => `${site.domain}${path}`;
const pagePath = (route) => route.replace(/^\//, "").replace(/\/$/, "") || "index";
const stars = (rating = 5) => "★".repeat(Number(rating));
const cssToken = (value = "home") => String(value).replace(/[^a-z0-9-]/gi, "-").toLowerCase();

function pageTheme(category, child = null) {
  return child?.slug || category?.slug || "home";
}

function collectGalleryImages() {
  return [...new Set(categories.flatMap((category) => category.gallery || []).map((item) => item.src).filter(Boolean))];
}

async function loadMediaMeta() {
  const entries = await Promise.all(
    collectGalleryImages().map(async (src) => {
      try {
        const buffer = await readFile(join(root, src.replace(/^\//, "")));
        return [src, readImageSize(buffer)];
      } catch {
        return [src, null];
      }
    })
  );
  return new Map(entries);
}

function readImageSize(buffer) {
  if (buffer[0] === 0x89 && buffer.toString("ascii", 1, 4) === "PNG") {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }

  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;

  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7)
      };
    }
    offset += 2 + length;
  }

  return null;
}

function portfolioItemClass(src) {
  const size = mediaMeta.get(src);
  if (!size?.width || !size?.height) return "";
  if (size.width > size.height) return "landscape";
  if (size.height > size.width) return "portrait";
  return "square";
}

function categoryPath(category) {
  return `/categories/${category.slug}/`;
}

function pricingPath(category) {
  return `/pricing/${category.slug}/`;
}

function portfolioPath(category) {
  return `/portfolio/${category.slug}/`;
}

function shopPath(product = null) {
  return product ? `/shop/${product.slug}/` : "/shop/";
}

function checkoutPath(product) {
  return `/shop/${product.slug}/checkout/`;
}

function confirmationPath(product) {
  return `/shop/${product.slug}/confirmation/`;
}

function childPath(parent, child) {
  return `/categories/${parent.slug}/${child.slug}/`;
}

function jsonLd(payload) {
  return `<script type="application/ld+json">${JSON.stringify(payload)}</script>`;
}

function header() {
  const navItems = [
    ["/categories/maternity/", "Categories"],
    ["/portfolio/", "Portfolio"],
    ["/shop/", "Shop"],
    ["/pricing/", "Pricing"],
    ["/resources/", "Resources"],
    ["/contact/", "Contact"]
  ];

  const nav = navItems.map(([href, label]) => `<a href="${href}">${label}</a>`).join("");

  return `
    <header class="site-header">
      <div class="header-inner">
        <a class="brand" href="/" aria-label="My Baby Pictures home">
          <img src="${site.logo}" alt="" width="42" height="42">
          <span>${esc(site.name)}</span>
        </a>
        <nav class="nav" aria-label="Primary navigation">${nav}</nav>
        <a class="btn btn-primary desktop-cta" href="${site.whatsapp}" data-track="cta_click" data-track-label="Header WhatsApp">Book Now</a>
        <button class="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false" data-menu-toggle>
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </div>
      <nav class="mobile-nav" aria-label="Mobile navigation" data-mobile-nav>${nav}<a href="${site.whatsapp}" data-track="cta_click" data-track-label="Mobile WhatsApp">Book Now</a></nav>
    </header>`;
}

function footer() {
  const categoryLinks = categories.map((category) => `<a href="${categoryPath(category)}">${esc(category.label)}</a>`).join("");
  const pricingLinks = categories
    .filter((category) => category.pricing)
    .map((category) => `<a href="${pricingPath(category)}">${esc(category.title)}</a>`)
    .join("");

  return `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <a class="brand" href="/">
              <img src="${site.logo}" alt="" width="42" height="42">
              <span>${esc(site.name)}</span>
            </a>
            <p>${esc(site.description)}</p>
            <p>${esc(site.address)}<br><a href="${site.phoneHref}">${esc(site.phone)}</a></p>
          </div>
          <div>
            <h3>Photography</h3>
            ${categoryLinks}
          </div>
          <div>
            <h3>Pricing</h3>
            ${pricingLinks}
          </div>
          <div>
            <h3>Connect</h3>
            <a href="${site.whatsapp}" data-track="cta_click" data-track-label="Footer WhatsApp">WhatsApp</a>
            <a href="${site.instagram}" target="_blank" rel="noopener">Instagram</a>
            <a href="${site.youtube}" target="_blank" rel="noopener">YouTube</a>
            <a href="/privacy-policy/">Privacy Policy</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© ${new Date().getFullYear()} ${esc(site.name)}. All rights reserved.</span>
          <span>Premium baby, maternity, event and family photography in Delhi NCR.</span>
        </div>
      </div>
    </footer>`;
}

function layout({ title, description, path, image = site.ogImage, body, schema = [], theme = "home" }) {
  generatedUrls.add(path);
  const canonical = url(path);
  const schemaTags = schema.map(jsonLd).join("\n");
  const themeClass = `theme-${cssToken(theme)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(site.name)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${url(image)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${url(image)}">
  <link rel="icon" type="image/png" href="${site.logo}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,650;9..144,750&family=Nunito+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/styles.css">
  <script async src="https://www.googletagmanager.com/gtag/js?id=${esc(site.analyticsId)}"></script>
  ${schemaTags}
</head>
<body class="${themeClass}">
  <a class="skip-link btn btn-primary" href="#main">Skip to content</a>
  ${header()}
  <main id="main">${body}</main>
  ${footer()}
  <div class="lightbox" data-lightbox aria-hidden="true">
    <button class="btn btn-soft" type="button" data-lightbox-close>Close</button>
    <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" alt="" data-lightbox-image>
  </div>
  <script src="/assets/site.js" defer></script>
</body>
</html>`;
}

function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "PhotographyStudio",
    name: site.name,
    image: url(site.logo),
    url: site.domain,
    telephone: site.phone,
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Saini Enclave, Karkardooma",
      addressLocality: "Delhi",
      postalCode: "110092",
      addressCountry: "IN"
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: site.rating,
      reviewCount: site.reviewCount
    },
    sameAs: [site.instagram, site.youtube]
  };
}

function faqSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a }
    }))
  };
}

function serviceSchema(category, path) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${category.label} by ${site.name}`,
    description: category.description,
    provider: {
      "@type": "PhotographyStudio",
      name: site.name,
      url: site.domain
    },
    areaServed: ["Delhi", "Noida", "Gurugram", "Faridabad", "Ghaziabad"],
    url: url(path),
    offers: (category.pricing || []).map((pkg) => ({
      "@type": "Offer",
      name: pkg.name,
      priceCurrency: "INR",
      price: pkg.price.replace(/[^\d]/g, ""),
      description: pkg.includes.join(", ")
    }))
  };
}

function hero({ eyebrow, title, copy, image, primary = "Book a Session", secondary = "View Portfolio", path = "#contact", stats = [] }) {
  const statMarkup = stats.length
    ? `<div class="hero-card">${stats.map((stat) => `<div class="stat"><strong>${esc(stat.value)}</strong><span>${esc(stat.label)}</span></div>`).join("")}</div>`
    : "";
  return `
    <section class="hero">
      <div class="container hero-inner">
        <div>
          <p class="eyebrow">${esc(eyebrow)}</p>
          <h1>${esc(title)}</h1>
          <p class="lead">${esc(copy)}</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="${path}" data-track="cta_click" data-track-label="${esc(primary)}">${esc(primary)}</a>
            <a class="btn btn-outline" href="#portfolio" data-track="cta_click" data-track-label="${esc(secondary)}">${esc(secondary)}</a>
          </div>
        </div>
        <div class="hero-media">
          <img src="${image}" alt="${esc(title)}" loading="eager">
          ${statMarkup}
        </div>
      </div>
    </section>`;
}

function sectionHead(eyebrow, title, copy = "", link = "") {
  return `
    <div class="section-head">
      <div>
        ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ""}
        <h2>${esc(title)}</h2>
      </div>
      ${copy || link ? `<p>${esc(copy)}${link}</p>` : ""}
    </div>`;
}

function categoryCards(items = categories) {
  return `<div class="grid grid-3">${items
    .map(
      (category) => `
        <a class="category-card" href="${categoryPath(category)}" data-track="category_click" data-category="${category.slug}" data-track-label="${esc(category.title)}">
          <img src="${category.heroImage}" alt="${esc(category.label)}" loading="lazy">
          <div class="category-overlay">
            <span class="pill">${esc(category.eyebrow || "Photography")}</span>
            <h3>${esc(category.label)}</h3>
            <p>${esc(category.summary)}</p>
            <span class="btn btn-soft">Explore ${esc(category.title)}</span>
          </div>
        </a>`
    )
    .join("")}</div>`;
}

function portfolioGrid(gallery = [], category = "") {
  return `<div class="portfolio-grid">${gallery
    .map(
      (item, index) => `
        <button class="portfolio-item ${index % 5 === 0 ? "tall" : ""} ${portfolioItemClass(item.src)}" type="button" data-gallery-image="${item.src}" data-category="${category}">
          <img src="${item.src}" alt="${esc(item.alt)}" loading="lazy">
          <span class="portfolio-caption">${esc(item.caption || "")}</span>
        </button>`
    )
    .join("")}</div>`;
}

function pricingCards(category) {
  return `<div class="grid grid-3">${(category.pricing || [])
    .map(
      (pkg) => `
        <article class="price-card ${pkg.featured ? "featured" : ""}">
          <p class="eyebrow">${pkg.featured ? "Most booked" : category.title}</p>
          <h3>${esc(pkg.name)}</h3>
          <div class="price">${esc(pkg.price)} <small>onwards</small></div>
          <ul class="feature-list">${pkg.includes.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
          <a class="btn ${pkg.featured ? "btn-primary" : "btn-soft"}" href="#contact" data-track="cta_click" data-category="${category.slug}" data-track-label="${esc(pkg.name)} inquiry">Inquire</a>
        </article>`
    )
    .join("")}</div>`;
}

function comparisonTable(category) {
  const packages = category.pricing || [];
  const rows = ["Session style", "Edited images", "Best for"];
  return `
    <table class="compare">
      <thead><tr><th>Package</th>${packages.map((pkg) => `<th>${esc(pkg.name)}</th>`).join("")}</tr></thead>
      <tbody>
        ${rows
          .map(
            (row, rowIndex) => `
              <tr>
                <th>${row}</th>
                ${packages.map((pkg) => `<td>${esc(pkg.includes[rowIndex] || pkg.includes[pkg.includes.length - 1])}</td>`).join("")}
              </tr>`
          )
          .join("")}
      </tbody>
    </table>`;
}

function testimonialCards(names = [], limit = 3) {
  const selected = names.length ? testimonials.filter((item) => names.includes(item.name)) : testimonials;
  return `<div class="grid grid-3">${selected
    .slice(0, limit)
    .map(
      (item) => `
        <article class="testimonial-card">
          <div class="stars" aria-label="${item.rating} star rating">${stars(item.rating)}</div>
          <blockquote>${esc(item.quote)}</blockquote>
          <strong>${esc(item.name)}</strong>
        </article>`
    )
    .join("")}</div>`;
}

function faqList(items = []) {
  return `<div class="faq-list">${items
    .map((item) => `<details><summary>${esc(item.q)}</summary><p>${esc(item.a)}</p></details>`)
    .join("")}</div>`;
}

function inquiryForm(category = {}) {
  const options = categories.map((item) => `<option value="${esc(item.title)}" ${item.slug === category.slug ? "selected" : ""}>${esc(item.label)}</option>`).join("");
  return `
    <form class="form" data-track-form="inquiry" data-category="${esc(category.slug || "")}">
      <label>Name<input name="name" autocomplete="name" required></label>
      <label>Phone / WhatsApp<input name="phone" autocomplete="tel" required></label>
      <label>Session category<select name="category">${options}</select></label>
      <label>Preferred month<input name="month" placeholder="Example: August"></label>
      <label class="full">Tell us about the session<textarea name="message" placeholder="Baby age, event date, preferred location or theme"></textarea></label>
      <div class="full action-row">
        <button class="btn btn-primary" type="submit" data-track="form_submit">Send on WhatsApp</button>
        <a class="btn btn-outline" href="${site.phoneHref}" data-track="cta_click" data-track-label="Call studio">Call ${esc(site.phone)}</a>
      </div>
    </form>`;
}

function ctaBand(title = "Ready to plan your session?", copy = "Tell us the category, age or event date and the team will help you choose a package.", category = {}) {
  return `
    <section class="section">
      <div class="container">
        <div class="cta-band">
          <p class="eyebrow">Book My Baby Pictures</p>
          <h2>${esc(title)}</h2>
          <p>${esc(copy)}</p>
          <div class="action-row">
            <a class="btn btn-soft" href="${site.whatsapp}" data-track="cta_click" data-category="${esc(category.slug || "")}" data-track-label="WhatsApp CTA">WhatsApp Now</a>
            <a class="btn btn-outline" href="/contact/" data-track="cta_click" data-track-label="Contact page">Contact Studio</a>
          </div>
        </div>
      </div>
    </section>`;
}

function videoSection(category) {
  if (!category.videos?.length && !category.bts?.length) return "";
  const videos = (category.videos || [])
    .map(
      (video) =>
        video.embed
          ? `
        <div class="video-shell">
          <iframe data-video src="${video.embed}" title="${esc(video.title)}" loading="lazy" allowfullscreen></iframe>
        </div>`
          : `
        <div class="video-shell" style="display:grid;place-items:center;padding:28px;color:#fff;text-align:center;">
          <div>
            <p class="eyebrow" style="color:#f4d7cf;">Video slot</p>
            <h3>${esc(video.title)}</h3>
            <p style="color:rgba(255,255,255,.76);">Add a video embed URL in the CMS content model to publish a film, reel or BTS clip here.</p>
          </div>
        </div>`
    )
    .join("");
  const bts = (category.bts || [])
    .map(
      (item) => `
        <article class="content-card bts-card">
          <img src="${item.image}" alt="${esc(item.title)}" loading="lazy">
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.copy)}</p>
        </article>`
    )
    .join("");

  return `
    <section class="section section-alt">
      <div class="container">
        ${sectionHead("Media support", "Video and behind the scenes", "This template supports embedded videos, short clips, set previews and BTS content for categories that need it.")}
        <div class="media-block">
          ${videos || `<div class="content-card"><h3>Video-ready section</h3><p>Add an embed URL in the category video field to publish films or reels here.</p></div>`}
          <div class="grid">${bts}</div>
        </div>
      </div>
    </section>`;
}

function relatedCategories(category) {
  const related = categories.filter((item) => (category.related || []).includes(item.slug));
  if (!related.length) return "";
  return `
    <section class="section">
      <div class="container">
        ${sectionHead("Keep exploring", "Related photography experiences")}
        ${categoryCards(related)}
      </div>
    </section>`;
}

function resourceCards(limit = resources.length) {
  return `<div class="grid grid-3">${resources
    .slice(0, limit)
    .map(
      (item) => `
        <a class="resource-card" href="/resources/${item.slug}/">
          <img src="${item.image}" alt="${esc(item.title)}" loading="lazy" style="width:100%;height:210px;object-fit:cover;border-radius:8px;margin-bottom:16px;">
          <span class="pill">${esc(item.category)}</span>
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.excerpt)}</p>
        </a>`
    )
    .join("")}</div>`;
}

async function writeRoute(route, html) {
  const target =
    route === "/"
      ? join(root, "index.html")
      : route.endsWith(".html")
        ? join(root, route.replace(/^\//, ""))
        : join(root, pagePath(route), "index.html");
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, html);
}

async function writeCompat(route, html) {
  await writeFile(join(root, route), html);
}

function homePage() {
  const featuredGallery = categories.flatMap((category) => (category.gallery || []).slice(0, 1).map((item) => ({ ...item, category: category.slug })));
  const body = `
    ${hero({
      eyebrow: homepage.hero.eyebrow,
      title: homepage.hero.title,
      copy: homepage.hero.copy,
      image: homepage.hero.image,
      primary: homepage.hero.primaryCta,
      secondary: homepage.hero.secondaryCta,
      path: "#contact",
      stats: homepage.hero.stats
    })}
    <section class="section">
      <div class="container">
        <div class="trust-row">${homepage.hero.trust.map((item) => `<span>${esc(item)}</span>`).join("")}</div>
      </div>
    </section>
    <section class="section section-alt" id="categories">
      <div class="container">
        ${sectionHead("Photography experiences", "Choose the story you want to preserve", "One featured gateway per category, each leading to a dedicated page with its own gallery, pricing, FAQs and CTAs.")}
        ${categoryCards(categories)}
      </div>
    </section>
    <section class="section">
      <div class="container story-grid">
        <img src="${homepage.story.image}" alt="My Baby Pictures studio photographer" loading="lazy">
        <div>
          <p class="eyebrow">${esc(homepage.story.eyebrow)}</p>
          <h2>${esc(homepage.story.title)}</h2>
          <p class="lead">${esc(homepage.story.copy)}</p>
          <ul class="feature-list">${homepage.story.points.map((point) => `<li>${esc(point)}</li>`).join("")}</ul>
        </div>
      </div>
    </section>
    <section class="section section-alt" id="portfolio">
      <div class="container">
        ${sectionHead("Portfolio highlights", "A category-led portfolio, not one giant gallery", "Browse the highlights here, then step into dedicated portfolio pages for each category.")}
        ${portfolioGrid(featuredGallery, "homepage")}
        <div class="action-row"><a class="btn btn-primary" href="/portfolio/">View Portfolio by Category</a></div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        ${sectionHead("Services and pricing", "Packages that change by session type", "Each category has independent pricing, inclusions, add-ons and inquiry CTAs.")}
        ${pricingCards(categories[1])}
        <div class="action-row"><a class="btn btn-outline" href="/pricing/">Explore All Pricing</a></div>
      </div>
    </section>
    <section class="section section-alt">
      <div class="container">
        ${sectionHead("Kind words", "Trusted by families across Delhi NCR")}
        ${testimonialCards([], 3)}
        <div class="action-row"><a class="btn btn-soft" href="/testimonials/">Read More Reviews</a></div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        ${sectionHead("Resources", "Helpful planning guides for parents")}
        ${resourceCards(3)}
      </div>
    </section>
    <section class="section section-alt">
      <div class="container">
        ${sectionHead("FAQ", "Before you book")}
        ${faqList(faqs)}
      </div>
    </section>
    <section class="section" id="contact">
      <div class="container grid grid-2">
        <div>
          <p class="eyebrow">Start here</p>
          <h2>Tell us what you are planning.</h2>
          <p class="lead">Share the category, baby age, event date or theme and the team will guide you to the right session.</p>
        </div>
        ${inquiryForm({})}
      </div>
    </section>`;

  return layout({
    title: homepage.seo.title,
    description: homepage.seo.description,
    path: "/",
    image: homepage.hero.image,
    body,
    theme: "home",
    schema: [localBusinessSchema(), faqSchema(faqs)]
  });
}

function categoryPage(category, child = null) {
  const isChild = Boolean(child);
  const title = isChild ? `${child.title} Photography` : category.label;
  const summary = isChild ? child.summary : category.description;
  const image = isChild ? child.heroImage : category.heroImage;
  const path = isChild ? childPath(category, child) : categoryPath(category);
  const pageFaqs = category.faqs?.length ? category.faqs : faqs.slice(0, 3);
  const children = category.children?.length
    ? `<section class="section section-alt"><div class="container">${sectionHead("Subcategories", `${category.title} pages`, "Each subcategory can become a dedicated SEO landing page with its own media and copy.")}<div class="grid grid-3">${category.children
        .map((item) => `<a class="content-card" href="${childPath(category, item)}"><h3>${esc(item.title)}</h3><p>${esc(item.summary)}</p></a>`)
        .join("")}</div></div></section>`
    : "";

  const body = `
    ${hero({
      eyebrow: isChild ? category.label : category.eyebrow,
      title,
      copy: summary,
      image,
      primary: "Ask for Availability",
      secondary: "See Portfolio",
      path: "#contact"
    })}
    <section class="section">
      <div class="container grid grid-2">
        <div>
          <p class="eyebrow">Category intro</p>
          <h2>${esc(title)} at My Baby Pictures</h2>
        </div>
        <div>
          <p class="lead">${esc(category.description)}</p>
          <div class="pill-row">${(category.addons || []).map((addon) => `<span class="pill">${esc(addon)}</span>`).join("")}</div>
        </div>
      </div>
    </section>
    ${children}
    <section class="section section-alt" id="portfolio">
      <div class="container">
        ${sectionHead("Portfolio", `${esc(title)} gallery`, "Images are managed by category, with room for carousels, tags and future CMS media fields.")}
        ${portfolioGrid(category.gallery || [], category.slug)}
        <div class="action-row"><a class="btn btn-outline" href="${portfolioPath(category)}">Open ${esc(category.title)} Portfolio</a></div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        ${sectionHead("Pricing", `${esc(category.title)} packages`, "Pricing is category-specific and can be updated independently.")}
        ${pricingCards(category)}
      </div>
    </section>
    <section class="section section-alt">
      <div class="container">
        ${sectionHead("Compare", "Package comparison")}
        ${comparisonTable(category)}
      </div>
    </section>
    ${videoSection(category)}
    <section class="section">
      <div class="container">
        ${sectionHead("Reviews", "Families who booked this experience")}
        ${testimonialCards(category.testimonials, 3)}
      </div>
    </section>
    <section class="section section-alt">
      <div class="container">
        ${sectionHead("FAQ", `${esc(category.title)} questions`)}
        ${faqList(pageFaqs)}
      </div>
    </section>
    ${relatedCategories(category)}
    <section class="section" id="contact">
      <div class="container grid grid-2">
        <div>
          <p class="eyebrow">Book ${esc(category.title)}</p>
          <h2>Check dates, themes and package fit.</h2>
          <p class="lead">Send the baby age, event date, preferred location and any visual references. We will help plan the right session flow.</p>
        </div>
        ${inquiryForm(category)}
      </div>
    </section>`;

  return layout({
    title: `${title} | ${site.name}`,
    description: strip(summary),
    path,
    image,
    body,
    theme: pageTheme(category, child),
    schema: [serviceSchema(category, path), faqSchema(pageFaqs)]
  });
}

function pricingIndexPage() {
  const body = `
    ${hero({
      eyebrow: "Category-specific pricing",
      title: "Choose pricing by photography category.",
      copy: "Maternity, newborn, milestone, birthday, family, event and festival sessions each have their own packages, inclusions and add-ons.",
      image: "/images/portfolio-newborn-2.jpeg",
      primary: "Ask for Guidance",
      secondary: "Browse Categories",
      path: "#contact"
    })}
    <section class="section section-alt">
      <div class="container">
        ${sectionHead("Pricing routes", "Session pricing by category")}
        <div class="grid grid-3">${categories
          .map((category) => `<a class="content-card" href="${pricingPath(category)}"><span class="pill">${esc(category.label)}</span><h3>${esc(category.title)}</h3><p>${esc(category.summary)}</p></a>`)
          .join("")}</div>
      </div>
    </section>
    <section class="section" id="contact">
      <div class="container grid grid-2"><div><h2>Need help choosing?</h2><p class="lead">Tell us your session type and rough date. We will suggest the right package.</p></div>${inquiryForm({})}</div>
    </section>`;

  return layout({
    title: `Pricing | ${site.name}`,
    description: "Category-specific photography pricing for maternity, newborn, milestone, birthday, family, event and festival sessions.",
    path: "/pricing/",
    image: "/images/portfolio-newborn-2.jpeg",
    body,
    theme: "pricing",
    schema: [localBusinessSchema()]
  });
}

function pricingPage(category) {
  const body = `
    ${hero({
      eyebrow: "Pricing",
      title: `${category.title} pricing`,
      copy: `Compare ${category.title.toLowerCase()} packages, inclusions and add-ons. Pricing can be updated independently for this category.`,
      image: category.heroImage,
      primary: "Inquire About Pricing",
      secondary: "View Gallery",
      path: "#contact"
    })}
    <section class="section">
      <div class="container">${pricingCards(category)}</div>
    </section>
    <section class="section section-alt">
      <div class="container">
        ${sectionHead("Package comparison", `${category.title} inclusions`)}
        ${comparisonTable(category)}
      </div>
    </section>
    <section class="section">
      <div class="container">
        ${sectionHead("Add-ons", "Customize your session")}
        <div class="pill-row">${(category.addons || []).map((addon) => `<span class="pill">${esc(addon)}</span>`).join("")}</div>
      </div>
    </section>
    <section class="section section-alt" id="contact">
      <div class="container grid grid-2"><div><p class="eyebrow">Inquiry</p><h2>Request current availability.</h2><p class="lead">Final package recommendations depend on date, age, location, preferred sets and output needs.</p></div>${inquiryForm(category)}</div>
    </section>`;

  return layout({
    title: `${category.title} Pricing | ${site.name}`,
    description: `Category-specific pricing for ${category.label.toLowerCase()} with packages, add-ons and inquiry CTA.`,
    path: pricingPath(category),
    image: category.heroImage,
    body,
    theme: pageTheme(category),
    schema: [serviceSchema(category, pricingPath(category))]
  });
}

function portfolioIndexPage() {
  const body = `
    ${hero({
      eyebrow: "Portfolio",
      title: "Browse real stories by photography category.",
      copy: "The portfolio is organized by session type so parents can quickly see the work most relevant to them.",
      image: "/images/portfolio-family-2.jpeg",
      primary: "Book a Session",
      secondary: "Explore Categories",
      path: "#contact"
    })}
    <section class="section section-alt">
      <div class="container">
        ${sectionHead("Portfolio categories", "Select a gallery")}
        ${categoryCards(categories)}
      </div>
    </section>
    <section class="section" id="contact">
      <div class="container grid grid-2"><div><h2>Want a similar story?</h2><p class="lead">Share references from the category gallery and we will plan a session around your baby, family or event.</p></div>${inquiryForm({})}</div>
    </section>`;

  return layout({
    title: `Portfolio | ${site.name}`,
    description: "Category-based baby, maternity, birthday, event, festival and family photography portfolio by My Baby Pictures.",
    path: "/portfolio/",
    image: "/images/portfolio-family-2.jpeg",
    body,
    theme: "portfolio",
    schema: [localBusinessSchema()]
  });
}

function portfolioPage(category) {
  const body = `
    ${hero({
      eyebrow: "Category portfolio",
      title: `${category.title} portfolio`,
      copy: category.summary,
      image: category.heroImage,
      primary: "Book This Look",
      secondary: "See Pricing",
      path: "#contact"
    })}
    <section class="section section-alt" id="portfolio">
      <div class="container">
        ${sectionHead("Gallery", `${category.title} images`)}
        ${portfolioGrid(category.gallery || [], category.slug)}
      </div>
    </section>
    ${ctaBand(`Plan a ${category.title.toLowerCase()} session`, "Send us your favorite gallery references and preferred date.", category)}
    <section class="section" id="contact">
      <div class="container grid grid-2"><div><h2>Start your inquiry.</h2><p class="lead">Tell us which images you loved and what kind of session you are imagining.</p></div>${inquiryForm(category)}</div>
    </section>`;

  return layout({
    title: `${category.title} Portfolio | ${site.name}`,
    description: `${category.label} portfolio with category-specific images and inquiry CTA.`,
    path: portfolioPath(category),
    image: category.heroImage,
    body,
    theme: pageTheme(category),
    schema: [serviceSchema(category, portfolioPath(category))]
  });
}

function testimonialsPage() {
  const body = `
    ${hero({
      eyebrow: "Reviews",
      title: "Kind words from families who trusted MBP.",
      copy: `Rated ${site.rating} by ${site.reviewCount} happy parents across newborn, maternity, milestone, birthday and festival sessions.`,
      image: "/images/client-sophia.jpeg",
      primary: "Book Your Session",
      secondary: "Browse Categories",
      path: "#contact"
    })}
    <section class="section section-alt">
      <div class="container">${testimonialCards([], testimonials.length)}</div>
    </section>
    <section class="section" id="contact"><div class="container grid grid-2"><div><h2>Ready to create your own story?</h2><p class="lead">The team will help you plan a session that feels calm, personal and polished.</p></div>${inquiryForm({})}</div></section>`;
  return layout({
    title: `Testimonials | ${site.name}`,
    description: "Parent testimonials and reviews for My Baby Pictures photography studio.",
    path: "/testimonials/",
    image: "/images/client-sophia.jpeg",
    body,
    theme: "testimonials",
    schema: [localBusinessSchema()]
  });
}

function resourcesIndexPage() {
  const body = `
    ${hero({
      eyebrow: "Resources",
      title: "Planning guides for meaningful family photographs.",
      copy: "Simple, parent-friendly resources for choosing timing, themes, outfits and session types.",
      image: "/images/portfolio-maternity-2.jpeg",
      primary: "Ask a Question",
      secondary: "Browse Guides",
      path: "#resources"
    })}
    <section class="section section-alt" id="resources"><div class="container">${resourceCards(resources.length)}</div></section>`;
  return layout({
    title: `Resources | ${site.name}`,
    description: "Parent planning resources for maternity, newborn and birthday photography sessions.",
    path: "/resources/",
    image: "/images/portfolio-maternity-2.jpeg",
    body,
    theme: "resources",
    schema: [localBusinessSchema()]
  });
}

function resourcePage(resource) {
  const body = `
    ${hero({
      eyebrow: resource.category,
      title: resource.title,
      copy: resource.excerpt,
      image: resource.image,
      primary: "Discuss This Session",
      secondary: "All Resources",
      path: "#contact"
    })}
    <section class="section">
      <div class="container story-grid">
        <div>
          <p class="eyebrow">Guide</p>
          <h2>${esc(resource.title)}</h2>
          <p class="lead">${esc(resource.excerpt)}</p>
          <ul class="feature-list">
            <li>Choose the right category page before comparing packages.</li>
            <li>Share baby age, date, theme and location preferences with the studio.</li>
            <li>Use the inquiry form to confirm current availability and add-ons.</li>
          </ul>
        </div>
        <img src="${resource.image}" alt="${esc(resource.title)}" loading="lazy">
      </div>
    </section>
    <section class="section section-alt" id="contact"><div class="container grid grid-2"><div><h2>Plan with the studio.</h2><p class="lead">Send your question and the team will suggest the best session route.</p></div>${inquiryForm({})}</div></section>`;
  return layout({
    title: `${resource.title} | ${site.name}`,
    description: resource.excerpt,
    path: `/resources/${resource.slug}/`,
    image: resource.image,
    body,
    theme: "resources",
    schema: [localBusinessSchema()]
  });
}

function money(amount = 0) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

function productBasePrice(product) {
  return product.variants?.[0]?.options?.[0]?.price || product.startingPrice || 0;
}

function productCard(product) {
  return `
    <a class="shop-product-card" href="${shopPath(product)}" data-track="shop_product_click" data-track-label="${esc(product.name)}">
      <div class="shop-product-media">
        <img src="${product.heroImage}" alt="${esc(product.name)}" loading="lazy">
      </div>
      <div class="shop-product-copy">
        <span class="pill">${esc(product.priceLabel)}</span>
        <h3>${esc(product.name)}</h3>
        <p>${esc(product.shortDescription)}</p>
        <span class="btn btn-soft">View product</span>
      </div>
    </a>`;
}

function shopProductGrid(productList = products) {
  return `<div class="shop-product-grid">${productList.map(productCard).join("")}</div>`;
}

function productGallery(product) {
  const images = product.gallery?.length ? product.gallery : [{ src: product.heroImage, alt: product.name }];
  return `
    <div class="product-gallery" data-product-gallery>
      <div class="product-gallery-main">
        <img src="${images[0].src}" alt="${esc(images[0].alt || product.name)}" data-product-main-image>
      </div>
      <div class="product-thumbs">
        ${images
          .map(
            (image, index) => `
              <button class="${index === 0 ? "is-active" : ""}" type="button" data-product-thumb="${image.src}" aria-label="Show ${esc(image.alt || product.name)}">
                <img src="${image.src}" alt="" loading="lazy">
              </button>`
          )
          .join("")}
      </div>
    </div>`;
}

function variantRadios(product) {
  return (product.variants || [])
    .map(
      (variant) => `
        <fieldset class="variant-group" data-variant-group="${esc(variant.key)}">
          <legend>${esc(variant.name)}</legend>
          <div class="variant-options">
            ${variant.options
              .map(
                (option, index) => `
                  <label class="variant-option">
                    <input type="radio" name="${esc(variant.key)}" value="${esc(option.label)}" data-price="${option.price || 0}" ${index === 0 ? "checked" : ""}>
                    <span>${esc(option.label)}${option.price ? `<small>+ ${money(option.price)}</small>` : ""}</span>
                  </label>`
              )
              .join("")}
          </div>
        </fieldset>`
    )
    .join("");
}

function personalizationInputs(product) {
  if (!product.personalizationFields?.length) return "";
  return `
    <div class="product-fields">
      ${product.personalizationFields
        .map(
          (field) => `
            <label>${esc(field.label)}
              <input name="${esc(field.key)}" placeholder="${esc(field.placeholder || "")}">
            </label>`
        )
        .join("")}
    </div>`;
}

function productReviews(product) {
  return `<div class="grid grid-2">${(product.reviews || [])
    .map(
      (review) => `
        <article class="testimonial-card">
          <div class="stars" aria-label="5 star rating">★★★★★</div>
          <blockquote>${esc(review.quote)}</blockquote>
          <strong>${esc(review.name)}</strong>
        </article>`
    )
    .join("")}</div>`;
}

function productFaqs(product) {
  return faqList(product.faqs || shop.faqs || []);
}

function relatedProducts(product) {
  const related = products.filter((item) => item.slug !== product.slug).slice(0, 2);
  return shopProductGrid(related);
}

function productJson(product) {
  return esc(JSON.stringify(product)).replaceAll("'", "&#39;");
}

function shopHomePage() {
  const body = `
    ${hero({
      eyebrow: shop.hero.eyebrow,
      title: shop.hero.title,
      copy: shop.hero.copy,
      image: shop.hero.image,
      primary: "Shop products",
      secondary: "How it works",
      path: "#products"
    })}
    <section class="section">
      <div class="container grid grid-2">
        <div>
          <p class="eyebrow">Personalized by MBP</p>
          <h2>Upload photos. Choose details. Make the party feel yours.</h2>
        </div>
        <p class="lead">Every product is made around your baby's face, name, milestone, theme or celebration colors. The flow collects photos and details before payment so parents know exactly what they are ordering.</p>
      </div>
    </section>
    <section class="section section-alt" id="products">
      <div class="container">
        ${sectionHead("Shop", "Personalized celebration products", "A small first collection for birthdays, milestones and family functions.")}
        ${shopProductGrid(products)}
      </div>
    </section>
    <section class="section">
      <div class="container">
        ${sectionHead("Why parents buy these", "Made for memory-filled celebrations")}
        <div class="trust-row">${shop.why.map((item) => `<span>${esc(item)}</span>`).join("")}</div>
      </div>
    </section>
    <section class="section section-alt">
      <div class="container">
        ${sectionHead("Loved details", "Tiny products, big smiles")}
        ${productReviews(products[1])}
      </div>
    </section>
    <section class="section">
      <div class="container">
        ${sectionHead("FAQ", "Before you personalize")}
        ${faqList(shop.faqs)}
      </div>
    </section>`;

  return layout({
    title: shop.seo.title,
    description: shop.seo.description,
    path: "/shop/",
    image: shop.hero.image,
    body,
    theme: "shop",
    schema: [localBusinessSchema()]
  });
}

function productSchema(product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.gallery?.map((image) => url(image.src)) || [url(product.heroImage)],
    description: product.summary,
    brand: { "@type": "Brand", name: site.name },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: productBasePrice(product),
      availability: "https://schema.org/InStock",
      url: url(shopPath(product))
    }
  };
}

function productDetailPage(product) {
  const body = `
    <section class="product-page">
      <div class="container">
        <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/shop/">Shop</a><span>/</span><span>${esc(product.name)}</span></nav>
        <div class="product-hero-grid" data-product-detail data-product='${productJson(product)}'>
          ${productGallery(product)}
          <aside class="product-buy-panel">
            <p class="eyebrow">Made to order</p>
            <h1>${esc(product.name)}</h1>
            <div class="product-rating"><span>★★★★★</span> ${esc(product.rating)} from ${product.reviewCount} parents</div>
            <p class="lead">${esc(product.summary)}</p>
            <div class="product-price" data-product-price>${money(productBasePrice(product))}</div>
            ${variantRadios(product)}
            ${personalizationInputs(product)}
            <label class="quantity-control">Quantity
              <span>
                <button type="button" data-qty-minus>-</button>
                <input name="quantity" value="1" inputmode="numeric" data-quantity>
                <button type="button" data-qty-plus>+</button>
              </span>
            </label>
            <div class="action-row">
              <a class="btn btn-primary" href="${checkoutPath(product)}" data-product-checkout data-track="shop_checkout_start" data-track-label="${esc(product.name)}">Personalize & continue</a>
              <a class="btn btn-outline" href="${site.whatsapp}" data-track="cta_click" data-track-label="Shop WhatsApp">Ask on WhatsApp</a>
            </div>
            <div class="mini-trust">
              <span>Handcrafted</span><span>Made to order</span><span>Photo preview</span><span>WhatsApp support</span>
            </div>
          </aside>
        </div>
      </div>
    </section>
    <section class="section section-alt">
      <div class="container grid grid-3">
        <article class="content-card"><h3>Product details</h3><ul class="feature-list">${product.details.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></article>
        <article class="content-card"><h3>How it works</h3><ul class="feature-list">${product.howItWorks.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></article>
        <article class="content-card"><h3>What's included</h3><ul class="feature-list">${product.included.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></article>
      </div>
    </section>
    <section class="section">
      <div class="container">
        ${sectionHead("Reviews", "Parents love the tiny details")}
        ${productReviews(product)}
      </div>
    </section>
    <section class="section section-alt">
      <div class="container">
        ${sectionHead("FAQ", `${product.name} questions`)}
        ${productFaqs(product)}
      </div>
    </section>
    <section class="section">
      <div class="container">
        ${sectionHead("Pair it with", "Related celebration products")}
        ${relatedProducts(product)}
      </div>
    </section>`;

  return layout({
    title: `${product.name} | My Baby Pictures Shop`,
    description: product.summary,
    path: shopPath(product),
    image: product.heroImage,
    body,
    theme: "shop",
    schema: [productSchema(product)]
  });
}

function checkoutPage(product) {
  const body = `
    <section class="checkout-page">
      <div class="container">
        <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/shop/">Shop</a><span>/</span><a href="${shopPath(product)}">${esc(product.name)}</a><span>/</span><span>Checkout</span></nav>
        <div class="checkout-layout" data-product-checkout-page data-product='${productJson(product)}'>
          <div class="checkout-main">
            <section class="checkout-step">
              <span class="step-number">1</span>
              <h2>Choose your details</h2>
              <p>Pick the variant that fits your celebration. You can adjust before payment.</p>
              ${variantRadios(product)}
              ${personalizationInputs(product)}
              <label class="quantity-control">Quantity
                <span>
                  <button type="button" data-qty-minus>-</button>
                  <input name="quantity" value="1" inputmode="numeric" data-quantity>
                  <button type="button" data-qty-plus>+</button>
                </span>
              </label>
            </section>
            <section class="checkout-step">
              <span class="step-number">2</span>
              <h2>Upload photos</h2>
              <p>${esc(product.upload.guidance)}</p>
              <label class="upload-drop">
                <input type="file" accept="image/*" ${product.upload.multiple ? "multiple" : ""} data-photo-upload data-min="${product.upload.min}" data-max="${product.upload.max}">
                <strong>Upload baby photos</strong>
                <span>${product.upload.min}-${product.upload.max} image${product.upload.max > 1 ? "s" : ""}. Clear faces and bright photos work best.</span>
              </label>
              <div class="upload-preview" data-upload-preview></div>
            </section>
            <section class="checkout-step">
              <span class="step-number">3</span>
              <h2>Preview your order</h2>
              <div class="mockup-preview" data-order-preview>
                <div class="mockup-product"><img src="${product.heroImage}" alt="${esc(product.name)}"></div>
                <div><h3>${esc(product.name)}</h3><p data-preview-copy>Your selected details and uploaded photos will appear here.</p></div>
              </div>
            </section>
            <section class="checkout-step">
              <span class="step-number">4</span>
              <h2>Delivery details</h2>
              <form class="customer-form" data-customer-form>
                <label>Full name<input name="fullName" autocomplete="name" required></label>
                <label>Mobile number<input name="mobile" autocomplete="tel" required></label>
                <label class="full">Address<textarea name="address" autocomplete="street-address" required></textarea></label>
                <label class="full">Notes / instructions<textarea name="notes" placeholder="Theme colors, delivery timing, face preference or crop notes"></textarea></label>
              </form>
            </section>
          </div>
          <aside class="order-summary">
            <p class="eyebrow">Order summary</p>
            <h2>${esc(product.name)}</h2>
            <div data-summary-lines></div>
            <div class="summary-total"><span>Total</span><strong data-summary-total>${money(productBasePrice(product))}</strong></div>
            <p class="cashfree-note">Payment will route to Cashfree. This first version uses a placeholder success flow until live Cashfree order creation is connected.</p>
            <button class="btn btn-primary" type="button" data-pay-cashfree>Pay with Cashfree</button>
            <a class="btn btn-outline" href="${shopPath(product)}">Edit product</a>
          </aside>
        </div>
      </div>
    </section>`;

  return layout({
    title: `${product.name} Checkout | My Baby Pictures Shop`,
    description: `Personalize ${product.name}, upload photos and enter delivery details before Cashfree payment.`,
    path: checkoutPath(product),
    image: product.heroImage,
    body,
    theme: "shop",
    schema: [productSchema(product)]
  });
}

function confirmationPage(product) {
  const body = `
    <section class="confirmation-page" data-order-confirmation data-product='${productJson(product)}'>
      <div class="container">
        <div class="confirmation-card">
          <p class="eyebrow">Order received</p>
          <h1>Thank you. Your ${esc(product.name)} order is in.</h1>
          <p class="lead">Payment status and order details are shown below. Our team will review your uploaded photos and contact you on WhatsApp if anything needs confirmation.</p>
          <div class="confirmation-summary" data-confirmation-summary>
            <article class="content-card"><h3>Payment status</h3><p>Success placeholder</p></article>
            <article class="content-card"><h3>Next steps</h3><p>Design check, print preparation, safe packaging and delivery coordination.</p></article>
            <article class="content-card"><h3>Timeline</h3><p>Most personalized orders are processed in 3-5 working days after photo confirmation.</p></article>
          </div>
          <div class="action-row">
            <a class="btn btn-primary" href="${site.whatsapp}" data-track="cta_click" data-track-label="Confirmation WhatsApp">Message support</a>
            <a class="btn btn-outline" href="/shop/">Continue shopping</a>
          </div>
        </div>
      </div>
    </section>`;

  return layout({
    title: `${product.name} Order Confirmation | My Baby Pictures Shop`,
    description: `Order confirmation and next steps for ${product.name}.`,
    path: confirmationPath(product),
    image: product.heroImage,
    body,
    theme: "shop",
    schema: [productSchema(product)]
  });
}

function contactPage() {
  const body = `
    ${hero({
      eyebrow: "Contact",
      title: "Book a premium baby or family photography session.",
      copy: `${site.address}. Call ${site.phone} or send a WhatsApp inquiry for availability.`,
      image: "/images/hero-carousel-1.jpeg",
      primary: "WhatsApp Now",
      secondary: "View Pricing",
      path: site.whatsapp
    })}
    <section class="section section-alt" id="contact"><div class="container grid grid-2"><div><p class="eyebrow">Inquiry form</p><h2>Tell us the details.</h2><p class="lead">A short note is enough: category, baby age, date and preferred location.</p></div>${inquiryForm({})}</div></section>`;
  return layout({
    title: `Contact | ${site.name}`,
    description: "Contact My Baby Pictures for baby, maternity, family, event and festival photography in Delhi NCR.",
    path: "/contact/",
    image: "/images/hero-carousel-1.jpeg",
    body,
    theme: "contact",
    schema: [localBusinessSchema()]
  });
}

function privacyPage() {
  const body = `
    <section class="section">
      <div class="container">
        <p class="eyebrow">Privacy</p>
        <h1>Privacy Policy</h1>
        <p class="lead">Last updated: ${today}</p>
        <div class="grid grid-2" style="margin-top:36px;">
          <article class="content-card"><h3>Information we collect</h3><p>We collect details needed to plan and deliver photography sessions, including name, phone number, WhatsApp contact, session category, baby age, event date and preferences shared through forms or messages.</p></article>
          <article class="content-card"><h3>How we use it</h3><p>Details are used for scheduling, session planning, gallery delivery, customer support, analytics and improving the website experience.</p></article>
          <article class="content-card"><h3>Photos and media</h3><p>Session images and videos are handled according to client consent and are used for portfolio or marketing only where permission has been given.</p></article>
          <article class="content-card"><h3>Contact</h3><p>For privacy questions, contact ${esc(site.name)} at ${esc(site.phone)} or visit the studio at ${esc(site.address)}.</p></article>
        </div>
      </div>
    </section>`;
  return layout({
    title: `Privacy Policy | ${site.name}`,
    description: "Privacy policy for My Baby Pictures photography studio.",
    path: "/privacy-policy/",
    image: site.ogImage,
    body,
    theme: "privacy",
    schema: [localBusinessSchema()]
  });
}

await writeRoute("/", homePage());

for (const category of categories) {
  await writeRoute(categoryPath(category), categoryPage(category));
  await writeRoute(pricingPath(category), pricingPage(category));
  await writeRoute(portfolioPath(category), portfolioPage(category));
  for (const child of category.children || []) {
    await writeRoute(childPath(category, child), categoryPage(category, child));
  }
}

await writeRoute("/pricing/", pricingIndexPage());
await writeRoute("/portfolio/", portfolioIndexPage());
await writeRoute("/shop/", shopHomePage());
for (const product of products) {
  await writeRoute(shopPath(product), productDetailPage(product));
  await writeRoute(checkoutPath(product), checkoutPage(product));
  await writeRoute(confirmationPath(product), confirmationPage(product));
}
await writeRoute("/testimonials/", testimonialsPage());
await writeCompat("testimonials.html", testimonialsPage());
await writeRoute("/resources/", resourcesIndexPage());
for (const resource of resources) {
  await writeRoute(`/resources/${resource.slug}/`, resourcePage(resource));
}
await writeRoute("/contact/", contactPage());
await writeRoute("/privacy-policy/", privacyPage());
await writeCompat("privacy-policy.html", privacyPage());

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...generatedUrls]
  .sort()
  .map(
    (path) => `  <url>
    <loc>${url(path)}</loc>
    <lastmod>${today}</lastmod>
  </url>`
  )
  .join("\n")}
</urlset>
`;

await writeFile(join(root, "sitemap.xml"), sitemap);
await writeFile(join(root, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${site.domain}/sitemap.xml\n`);

console.log(`Generated ${generatedUrls.size} routes.`);
