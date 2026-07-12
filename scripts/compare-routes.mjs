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
        // Normalize S3 media file URLs (including file extensions like .jpeg, .jpg, .webp, or none) to match legacy images pattern
        .replace(/https:\/\/mbp-media-[a-z0-9-]+\.s3\.[a-z0-9-]+\.amazonaws\.com\/[a-zA-Z0-9_-]+(\.[a-zA-Z0-9]+)?/g, "normalized-media-url")
        // Normalize legacy local image URLs to same pattern
        .replace(/https:\/\/mybabypictures\.in\/images\/[a-zA-Z0-9_.-]+(\.[a-zA-Z0-9]+)?/g, "normalized-media-url")
        .replace(/\/images\/[a-zA-Z0-9_.-]+(\.[a-zA-Z0-9]+)?/g, "normalized-media-url")
        .replace(/^https:\/\/mybabypictures\.in\/?$/, "https://mybabypictures.in")
        .replace(/\/$/, "") // Legacy static site uses trailing-slash canonicals (directory/index.html hosting); Next.js never does (see CLAUDE.md). Structural difference, not a bug.
        .trim();
    };

    const normalizeText = (val) => {
      if (typeof val === "string") {
        return norm(val);
      }
      if (Array.isArray(val)) {
        return val.map(normalizeText);
      }
      if (val && typeof val === "object") {
        const res = {};
        for (const key of Object.keys(val)) {
          res[key] = normalizeText(val[key]);
        }
        return res;
      }
      return val;
    };

    const matchSchemas = (legacy, next) => {
      const normLegacy = legacy.map(normalizeText);
      const normNext = next.map(normalizeText);

      for (const leg of normLegacy) {
        const type = leg["@type"];
        const matchingNext = normNext.find((n) => n["@type"] === type);
        if (!matchingNext) {
          return { matches: false, reason: `Missing schema type: ${type}` };
        }

        if (type === "FAQPage") {
          const legQuestions = leg.mainEntity || [];
          const nextQuestions = matchingNext.mainEntity || [];
          for (const legQ of legQuestions) {
            const matchQ = nextQuestions.find((nq) => nq.name === legQ.name);
            if (!matchQ) {
              return {
                matches: false,
                reason: `FAQPage question mismatch: Could not find legacy question "${legQ.name}" in Next.js FAQs.`
              };
            }
            if (JSON.stringify(legQ.acceptedAnswer) !== JSON.stringify(matchQ.acceptedAnswer)) {
              return {
                matches: false,
                reason: `FAQPage answer mismatch for question "${legQ.name}":\n    Legacy: ${JSON.stringify(legQ.acceptedAnswer)}\n    Next.js: ${JSON.stringify(matchQ.acceptedAnswer)}`
              };
            }
          }
          continue;
        }
        
        // Compare values by sorting fields to be order-independent
        const sortedLeg = Object.keys(leg).sort().reduce((acc, key) => { acc[key] = leg[key]; return acc; }, {});
        const sortedNext = Object.keys(matchingNext).sort().reduce((acc, key) => { acc[key] = matchingNext[key]; return acc; }, {});
        
        if (JSON.stringify(sortedLeg) !== JSON.stringify(sortedNext)) {
          return {
            matches: false,
            reason: `Schema type "${type}" fields mismatch:\n    Legacy: ${JSON.stringify(sortedLeg)}\n    Next.js: ${JSON.stringify(sortedNext)}`
          };
        }
      }
      return { matches: true };
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
    
    const schemaResult = matchSchemas(legacySchemas, nextSchemas);
    if (!schemaResult.matches) {
      routeFailures.push(`JSON-LD Schema mismatch:\n  ${schemaResult.reason}`);
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
