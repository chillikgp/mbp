import { testimonials } from "../content";
import { Testimonial } from "../types";

export function getTestimonials(): Testimonial[] {
  return testimonials;
}

export function getTestimonialsByNames(names: string[]): Testimonial[] {
  if (!names || names.length === 0) return testimonials;
  return testimonials.filter((item) => names.includes(item.name));
}
