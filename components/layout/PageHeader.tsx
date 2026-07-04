import React from "react";

interface PageHeaderProps {
  title: string;
  eyebrow?: string;
  copy?: string;
  link?: React.ReactNode;
}

export default function PageHeader({ title, eyebrow, copy = "", link }: PageHeaderProps) {
  return (
    <div className="section-head">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
      </div>
      {(copy || link) && (
        <p>
          {copy}
          {link}
        </p>
      )}
    </div>
  );
}
