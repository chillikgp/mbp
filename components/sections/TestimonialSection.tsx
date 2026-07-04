import { Testimonial } from "../../lib/types";

interface TestimonialSectionProps {
  items: Testimonial[];
  limit?: number;
}

export default function TestimonialSection({ items, limit = 3 }: TestimonialSectionProps) {
  const selected = items;

  const renderStars = (rating: string | number) => {
    return "★".repeat(Number(rating || 5));
  };

  return (
    <div className="grid grid-3">
      {selected.slice(0, limit).map((item, index) => (
        <article key={index} className="testimonial-card">
          <div className="stars" aria-label={`${item.rating} star rating`}>
            {renderStars(item.rating)}
          </div>
          <blockquote>{item.quote}</blockquote>
          <strong>{item.name}</strong>
        </article>
      ))}
    </div>
  );
}
export { TestimonialSection };
