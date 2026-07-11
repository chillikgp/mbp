import { MetadataRoute } from "next";
import { getSiteSettings } from "../lib/repositories/settingsRepository";

const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "anthropic-ai",
  "PerplexityBot",
  "Google-Extended",
  "CCBot",
];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSiteSettings();
  const domain = site.domain.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/admin",
      },
      // Explicitly welcome AI answer-engine crawlers (GEO) rather than
      // relying only on the "*" rule above.
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
      })),
    ],
    sitemap: `${domain}/sitemap.xml`,
  };
}
export { robots };
