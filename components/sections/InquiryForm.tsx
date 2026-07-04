import { PhotographyCategory, SiteSettings } from "../../lib/types";

interface InquiryFormProps {
  site: SiteSettings;
  categories: PhotographyCategory[];
  category?: Partial<PhotographyCategory>;
}

export default function InquiryForm({ site, categories, category = {} }: InquiryFormProps) {
  return (
    <form
      className="form"
      data-track-form="inquiry"
      data-category={category.slug || ""}
    >
      <label>
        Name
        <input name="name" autoComplete="name" required />
      </label>
      <label>
        Phone / WhatsApp
        <input name="phone" autoComplete="tel" required />
      </label>
      <label>
        Session category
        <select name="category" defaultValue={category.title || ""}>
          {categories.map((item) => (
            <option key={item.slug} value={item.title}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Preferred month
        <input name="month" placeholder="Example: August" />
      </label>
      <label className="full">
        Tell us about the session
        <textarea
          name="message"
          placeholder="Baby age, event date, preferred location or theme"
        />
      </label>
      <div className="full action-row">
        <button className="btn btn-primary" type="submit" data-track="form_submit">
          Send on WhatsApp
        </button>
        <a
          className="btn btn-outline"
          href={site.phoneHref}
          data-track="cta_click"
          data-track-label="Call studio"
        >
          Call {site.phone}
        </a>
      </div>
    </form>
  );
}
export { InquiryForm };
