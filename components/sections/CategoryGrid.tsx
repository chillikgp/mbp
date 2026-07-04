import React from "react";
import { categoryPath } from "../../lib/routes";
import { PhotographyCategory } from "../../lib/types";
import ResponsiveImage from "../layout/ResponsiveImage";

interface CategoryGridProps {
  items: PhotographyCategory[];
}

export default function CategoryGrid({ items }: CategoryGridProps) {
  return (
    <div className="grid grid-3">
      {items.map((category) => (
        <a
          key={category.slug}
          className="category-card"
          href={categoryPath(category)}
          data-track="category_click"
          data-category={category.slug}
          data-track-label={category.title}
        >
          <ResponsiveImage src={category.heroImage} alt={category.label} loading="lazy" />
          <div className="category-overlay">
            <span className="pill">{category.eyebrow || "Photography"}</span>
            <h3>{category.label}</h3>
            <p>{category.summary}</p>
            <span className="btn btn-soft">Explore {category.title}</span>
          </div>
        </a>
      ))}
    </div>
  );
}
export { CategoryGrid };
