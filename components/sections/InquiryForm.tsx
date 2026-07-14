import { PhotographyCategory, SiteSettings } from "../../lib/types";

interface InquiryFormProps {
  site: SiteSettings;
  categories: PhotographyCategory[];
  category?: Partial<PhotographyCategory>;
}

export default function InquiryForm({ site, categories, category = {} }: InquiryFormProps) {
  const hasKnownTitle = categories.some((item) => item.title === category.title);
  const selectedPackages = (category.pricing || []).map((pkg) => pkg.name);
  // Category title -> package names, so site.js can repopulate the package
  // dropdown when the visitor changes the category select.
  const packagesByCategory = Object.fromEntries(
    categories.map((item) => [item.title, (item.pricing || []).map((pkg) => pkg.name)])
  );
  if (category.title && selectedPackages.length > 0) {
    packagesByCategory[category.title] = selectedPackages;
  }

  return (
    <form
      className="form"
      data-track-form="inquiry"
      data-category={category.slug || ""}
      data-whatsapp={site.whatsapp.replace(/\D/g, "")}
      data-packages={JSON.stringify(packagesByCategory)}
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
          <option value="" disabled>
            Select a category
          </option>
          {category.title && !hasKnownTitle && (
            <option value={category.title}>{category.label || category.title}</option>
          )}
          {categories.map((item) => (
            <option key={item.slug} value={item.title} data-category-slug={item.slug}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Package
        <select name="package" defaultValue="" data-package-select>
          <option value="">Not sure yet</option>
          {selectedPackages.map((name) => (
            <option key={name} value={name}>
              {name}
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
