import type { Metadata } from "next";
import { getSiteSettings } from "./repositories/settingsRepository";

interface MetadataProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
}

function toAbsoluteUrl(path: string, domain: string): string {
  if (path.startsWith("http")) return path;
  return `${domain}${path.startsWith("/") ? "" : "/"}${path}`;
}

export async function buildMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
}: MetadataProps): Promise<Metadata> {
  const site = await getSiteSettings();
  const domain = site.domain.replace(/\/$/, "");
  const formattedPath = path.startsWith("/") ? path : `/${path}`;
  const canonicalUrl = `${domain}${formattedPath}`;

  const ogImgUrl = toAbsoluteUrl(image || site.ogImage, domain);

  return {
    title: title,
    description: description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph:
      type === "article"
        ? {
            type: "article",
            siteName: site.name,
            title: title,
            description: description,
            url: canonicalUrl,
            images: [{ url: ogImgUrl }],
            publishedTime,
            modifiedTime,
          }
        : {
            type: "website",
            siteName: site.name,
            title: title,
            description: description,
            url: canonicalUrl,
            images: [
              {
                url: ogImgUrl,
              },
            ],
          },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [ogImgUrl],
    },
    icons: {
      icon: site.logo,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

