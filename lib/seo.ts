import type { Metadata } from "next";
import { getSiteSettings } from "./repositories/settingsRepository";

interface MetadataProps {
  title: string;
  description: string;
  path: string;
  image?: string;
}

export function buildMetadata({ title, description, path, image }: MetadataProps): Metadata {
  const site = getSiteSettings();
  const domain = site.domain.replace(/\/$/, "");
  const formattedPath = path.startsWith("/") ? path : `/${path}`;
  const canonicalUrl = `${domain}${formattedPath}`;
  
  const ogImgUrl = image 
    ? (image.startsWith("http") ? image : `${domain}${image.startsWith("/") ? "" : "/"}${image}`)
    : `${domain}${site.ogImage.startsWith("/") ? "" : "/"}${site.ogImage}`;

  return {
    title: title,
    description: description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
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
