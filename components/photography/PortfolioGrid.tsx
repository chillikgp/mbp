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

  const themes = Array.from(
    new Set(gallery.map((item) => item.theme).filter((theme): theme is string => Boolean(theme)))
  );

  return (
    <div data-portfolio-tabs-root={themes.length > 1 ? category : undefined}>
      {themes.length > 1 && (
        <div className="portfolio-tabs" data-portfolio-tabs>
          <button type="button" className="btn btn-soft portfolio-tab is-active" data-portfolio-tab="all">
            All
          </button>
          {themes.map((theme) => (
            <button
              key={theme}
              type="button"
              className="btn btn-soft portfolio-tab"
              data-portfolio-tab={theme.toLowerCase()}
            >
              {theme}
            </button>
          ))}
        </div>
      )}
      <div className="portfolio-grid">
        {itemsWithClass.map((item, index) => (
          <button
            key={index}
            className={item.className}
            type="button"
            data-gallery-image={item.src}
            data-category={category}
            data-theme={item.theme ? item.theme.toLowerCase() : undefined}
          >
            <GalleryImage src={item.src} alt={item.alt} />
            <span className="portfolio-caption">{item.caption || ""}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
