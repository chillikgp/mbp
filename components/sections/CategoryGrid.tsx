import React from "react";
import { categoryPath, portfolioPath } from "../../lib/routes";
import { PhotographyCategory } from "../../lib/types";
import ResponsiveImage from "../layout/ResponsiveImage";

interface CategoryGridProps {
  items: PhotographyCategory[];
  destination?: "category" | "portfolio";
}

export default function CategoryGrid({
  items,
  destination = "category",
}: CategoryGridProps) {
  return (
    <div className="grid grid-3">
      {items.map((category) => {
        const isPortfolio = destination === "portfolio";
        const href = isPortfolio ? portfolioPath(category) : categoryPath(category);

        return (
          <a
            key={category.slug}
            className="category-card"
            href={href}
            data-track="category_click"
            data-category={category.slug}
            data-track-label={category.title}
          >
            <ResponsiveImage src={category.heroImage} alt={category.label} loading="lazy" />
            <div className="category-overlay">
              <span className="pill">{category.eyebrow || "Photography"}</span>
              <h3>{category.label}</h3>
              <p>{category.summary}</p>
              <span className="btn btn-soft">
                {isPortfolio ? `View ${category.title} portfolio` : `Explore ${category.title}`}
              </span>
            </div>
          </a>
        );
      })}
    </div>
  );
}
export { CategoryGrid };
