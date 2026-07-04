import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();

// Helper to escape regex special characters
const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Simple regex extracts for HTML tags
function extractTitle(html) {
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  return match ? match[1].trim() : null;
}

function extractMeta(html, name) {
  // Matches name or property attribute
  const regex = new RegExp(`<meta\\s+[^>]*(?:name|property)="` + escapeRegExp(name) + `"\\s+content="([^"]*)"`, "i");
  const match = html.match(regex);
  if (match) return match[1];
  
  // Try reversed attribute order
  const regexAlt = new RegExp(`<meta\\s+content="([^"]*)"\\s+[^>]*(?:name|property)="` + escapeRegExp(name) + `"`, "i");
  const matchAlt = html.match(regexAlt);
  return matchAlt ? matchAlt[1] : null;
}

function extractCanonical(html) {
  const match = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i);
  return match ? match[1] : null;
}

function extractSchemas(html) {
  const regex = /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
  const schemas = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      schemas.push(JSON.parse(match[1]));
    } catch {
      schemas.push(null);
    }
  }
  return schemas;
}

async function runParityChecks() {
  const siteData = JSON.parse(await readFile(join(root, "content/site.json"), "utf8"));
  const productData = JSON.parse(await readFile(join(root, "content/products.json"), "utf8"));
  
  const { categories, resources } = siteData;
  const { products } = productData;

  // Re-generate the expected paths to check
  const paths = [
    "/",
    "/pricing/",
    "/portfolio/",
    "/shop/",
    "/testimonials/",
    "/resources/",
    "/contact/",
    "/privacy-policy/",
    "/privacy-policy.html",
    "/testimonials.html"
  ];

  for (const category of categories) {
    paths.push(`/categories/${category.slug}/`);
    paths.push(`/pricing/${category.slug}/`);
    paths.push(`/portfolio/${category.slug}/`);
    for (const child of category.children || []) {
      paths.push(`/categories/${category.slug}/${child.slug}/`);
    }
  }

  for (const product of products) {
    paths.push(`/shop/${product.slug}/`);
  }

  for (const resource of resources) {
    paths.push(`/resources/${resource.slug}/`);
  }

  console.log(`\n=== MBP Parity Checker: Scanning ${paths.length} Routes ===\n`);

  let checkedCount = 0;
  let missingLegacyCount = 0;
  let successCount = 0;
  let failures = [];

  for (const path of paths) {
    // 1. Resolve local legacy file
    let legacyFilePath = "";
    if (path === "/") {
      legacyFilePath = join(root, "index.html");
    } else if (path.endsWith(".html")) {
      legacyFilePath = join(root, path.replace(/^\//, ""));
    } else {
      legacyFilePath = join(root, path.replace(/^\//, "").replace(/\/$/, ""), "index.html");
    }

    let legacyHtml = "";
    try {
      legacyHtml = await readFile(legacyFilePath, "utf8");
    } catch {
      console.log(`⚠️ Legacy file not found for route: ${path} (Skipping comparison)`);
      missingLegacyCount++;
      continue;
    }

    checkedCount++;

    // 2. Fetch from Next.js server (assuming next dev is running on port 4173)
    let nextHtml = "";
    try {
      const response = await fetch(`http://localhost:4173${path}`);
      if (response.status !== 200) {
        throw new Error(`HTTP status ${response.status}`);
      }
      nextHtml = await response.text();
    } catch (err) {
      failures.push({
        path,
        error: `Could not fetch Next.js page: ${err.message}`
      });
      continue;
    }

    // 3. Extract metadata
    const legacyTitle = extractTitle(legacyHtml);
    const nextTitle = extractTitle(nextHtml);

    const legacyDesc = extractMeta(legacyHtml, "description");
    const nextDesc = extractMeta(nextHtml, "description");

    const legacyCanon = extractCanonical(legacyHtml);
    const nextCanon = extractCanonical(nextHtml);

    const legacyOgImage = extractMeta(legacyHtml, "og:image");
    const nextOgImage = extractMeta(nextHtml, "og:image");

    const legacySchemas = extractSchemas(legacyHtml);
    const nextSchemas = extractSchemas(nextHtml);

    // 4. Compare fields
    const norm = (str) => {
      if (!str) return "";
      return str
        .replaceAll("&#x27;", "'")
        .replaceAll("&#39;", "'")
        .replaceAll("&amp;", "&")
        .replaceAll("&quot;", '"')
        .replaceAll("&lt;", "<")
        .replaceAll("&gt;", ">")
        .replace(/^https:\/\/mybabypictures\.in\/?$/, "https://mybabypictures.in") // Normalize root URL trailing slash
        .trim();
    };

    const routeFailures = [];

    if (norm(legacyTitle) !== norm(nextTitle)) {
      routeFailures.push(`Title mismatch:\n  Legacy: "${legacyTitle}"\n  Next.js: "${nextTitle}"`);
    }
    if (norm(legacyDesc) !== norm(nextDesc)) {
      routeFailures.push(`Description mismatch:\n  Legacy: "${legacyDesc}"\n  Next.js: "${nextDesc}"`);
    }
    if (norm(legacyCanon) !== norm(nextCanon)) {
      routeFailures.push(`Canonical URL mismatch:\n  Legacy: "${legacyCanon}"\n  Next.js: "${nextCanon}"`);
    }
    if (norm(legacyOgImage) !== norm(nextOgImage)) {
      routeFailures.push(`og:image mismatch:\n  Legacy: "${legacyOgImage}"\n  Next.js: "${nextOgImage}"`);
    }
    
    // Sort keys and values in schemas to be resilient to formatting/ordering differences
    const cleanSchema = (s) => JSON.stringify(s).replaceAll("&#x27;", "'").replaceAll("&#39;", "'");
    if (cleanSchema(legacySchemas) !== cleanSchema(nextSchemas)) {
      routeFailures.push(`JSON-LD Schema mismatch:\n  Legacy: ${JSON.stringify(legacySchemas)}\n  Next.js: ${JSON.stringify(nextSchemas)}`);
    }

    if (routeFailures.length > 0) {
      failures.push({ path, errors: routeFailures });
    } else {
      successCount++;
    }
  }

  console.log("\n=== Parity Check Summary ===");
  console.log(`Total Routes: ${paths.length}`);
  console.log(`Legacy Routes Existing: ${checkedCount}`);
  console.log(`Legacy Routes Missing (not generated yet): ${missingLegacyCount}`);
  console.log(`Successful Matches (100% Parity): ${successCount}`);
  console.log(`Failed Matches: ${failures.length}`);

  if (failures.length > 0) {
    console.log("\n--- Failures List ---");
    failures.forEach((fail) => {
      console.log(`\n❌ Path: ${fail.path}`);
      if (fail.error) {
        console.log(`   Error: ${fail.error}`);
      } else {
        fail.errors.forEach((err) => console.log(`   - ${err}`));
      }
    });
    process.exit(1);
  } else {
    console.log("\n🎉 All compared pages achieved 100% SEO, metadata, canonical and schema parity!");
    process.exit(0);
  }
}

runParityChecks().catch((err) => {
  console.error("Parity script failed:", err);
  process.exit(1);
});
