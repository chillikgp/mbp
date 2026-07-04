import React from "react";
import { getImageAspectRatioClass } from "../../lib/image-utils";
import GalleryImage from "../layout/GalleryImage";
import { GalleryItem } from "../../lib/types";

interface PortfolioGridProps {
  gallery: GalleryItem[];
  category: string;
}

export default async function PortfolioGrid({ gallery, category }: PortfolioGridProps) {
  const itemsWithClass = await Promise.all(
    gallery.map(async (item, index) => {
      const aspectClass = await getImageAspectRatioClass(item.src);
      const isTall = index % 5 === 0 ? "tall" : "";
      const className = `portfolio-item ${isTall} ${aspectClass}`.trim();
      return { ...item, className };
    })
  );

  return (
    <div className="portfolio-grid">
      {itemsWithClass.map((item, index) => (
        <button
          key={index}
          className={item.className}
          type="button"
          data-gallery-image={item.src}
          data-category={category}
        >
          <GalleryImage src={item.src} alt={item.alt} />
          <span className="portfolio-caption">{item.caption || ""}</span>
        </button>
      ))}
    </div>
  );
}
