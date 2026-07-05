import React from "react";
import { Resource } from "../../lib/types";
import ResponsiveImage from "../layout/ResponsiveImage";

interface ResourceGridProps {
  resources: Resource[];
  limit?: number;
}

export default function ResourceGrid({ resources, limit }: ResourceGridProps) {
  const list = limit ? resources.slice(0, limit) : resources;

  return (
    <div className="grid grid-3">
      {list.map((item) => (
        <a key={item.slug} className="resource-card" href={`/resources/${item.slug}`}>
          <ResponsiveImage
            src={item.image}
            alt={item.title}
            loading="lazy"
            style={{
              width: "100%",
              height: "210px",
              objectFit: "cover",
              borderRadius: "8px",
              marginBottom: "16px",
            }}
          />
          <span className="pill">{item.category}</span>
          <h3>{item.title}</h3>
          <p>{item.excerpt}</p>
        </a>
      ))}
    </div>
  );
}
export { ResourceGrid };
