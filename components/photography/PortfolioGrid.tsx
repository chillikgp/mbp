import React from "react";
import { getAspectRatioClass } from "../../lib/image-utils";
import GalleryImage from "../layout/GalleryImage";
import { GalleryItem } from "../../lib/types";

interface PortfolioGridProps {
  gallery: GalleryItem[];
  category: string;
}

export default function PortfolioGrid({ gallery, category }: PortfolioGridProps) {
  const itemsWithClass = gallery.map((item) => {
    const aspectClass = getAspectRatioClass(item.width, item.height);
    const className = `portfolio-item ${aspectClass}`.trim();
    return { ...item, className };
  });

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
