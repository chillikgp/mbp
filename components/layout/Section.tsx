import React from "react";

interface SectionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  isAlt?: boolean;
}

export default function Section({ children, id, className = "", isAlt = false }: SectionProps) {
  const sectionClass = `section ${isAlt ? "section-alt" : ""} ${className}`.trim();
  return (
    <section id={id} className={sectionClass}>
      {children}
    </section>
  );
}
