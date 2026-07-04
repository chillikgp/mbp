import React from "react";
import { SiteSettings } from "../../lib/types";

interface NavigationLink {
  href: string;
  label: string;
}

interface FooterProps {
  site: SiteSettings;
  experienceLinks: NavigationLink[];
  pricingLinks: NavigationLink[];
  studioLinks: NavigationLink[];
}

export default function Footer({ site, experienceLinks, pricingLinks, studioLinks }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <a className="brand" href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={site.logo} alt="" width="42" height="42" />
              <span>{site.name}</span>
            </a>
            <p>{site.description}</p>
            <p>
              {site.address}
              <br />
              <a href={site.phoneHref}>{site.phone}</a>
            </p>
          </div>
          <div>
            <h3>Photography</h3>
            {experienceLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
          <div>
            <h3>Pricing</h3>
            {pricingLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
          <div>
            <h3>Connect</h3>
            <a href={site.whatsapp} data-track="cta_click" data-track-label="Footer WhatsApp">
              WhatsApp
            </a>
            <a href={site.instagram} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
            <a href={site.youtube} target="_blank" rel="noopener noreferrer">
              YouTube
            </a>
            {studioLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {currentYear} {site.name}. All rights reserved.</span>
          <span>Premium baby, maternity, event and family photography in Delhi NCR.</span>
        </div>
      </div>
    </footer>
  );
}
export { Footer };
