import React from "react";
import { FAQItem } from "../../lib/types";

interface FAQSectionProps {
  items: FAQItem[];
}

export default function FAQSection({ items }: FAQSectionProps) {
  return (
    <div className="faq-list">
      {items.map((item, index) => (
        <details key={index}>
          <summary>{item.q}</summary>
          <p>{item.a}</p>
        </details>
      ))}
    </div>
  );
}
export { FAQSection };
