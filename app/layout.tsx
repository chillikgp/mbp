import type { Metadata } from "next";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Script from "next/script";
import "../public/assets/styles.css";
import { getSiteSettings } from "../lib/repositories/settingsRepository";
import { getHeaderNavigation, getFooterExperiences, getFooterPricingLinks, getFooterStudioLinks } from "../lib/repositories/navigationRepository";

export const metadata: Metadata = {
  title: "My Baby Pictures",
  description: "Premium baby, maternity, event and family photography",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const site = getSiteSettings();
  const headerNav = getHeaderNavigation();
  const footerExperiences = getFooterExperiences();
  const footerPricing = getFooterPricingLinks();
  const footerStudio = getFooterStudioLinks();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,650;9..144,750&family=Nunito+Sans:wght@400;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {/* Blocking script to set the theme class on the html element before rendering to avoid FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var path = window.location.pathname;
                  var theme = 'home';
                  if (path.indexOf('/categories/') === 0) {
                    var parts = path.split('/');
                    theme = parts[2] || 'home';
                  } else if (path.indexOf('/portfolio/') === 0) {
                    var parts = path.split('/');
                    theme = parts[2] || 'portfolio';
                  } else if (path.indexOf('/pricing/') === 0) {
                    var parts = path.split('/');
                    theme = parts[2] || 'pricing';
                  } else if (path.indexOf('/shop/') === 0) {
                    theme = 'shop';
                  } else if (path.indexOf('/testimonials/') === 0) {
                    theme = 'testimonials';
                  } else if (path.indexOf('/resources/') === 0) {
                    theme = 'resources';
                  } else if (path.indexOf('/contact/') === 0) {
                    theme = 'contact';
                  } else if (path.indexOf('/privacy-policy/') === 0) {
                    theme = 'privacy';
                  }
                  document.documentElement.className = 'theme-' + theme;
                } catch (e) {}
              })()
            `,
          }}
        />
      </head>
      <body>
        <a className="skip-link btn btn-primary" href="#main">
          Skip to content
        </a>
        <Header site={site} navItems={headerNav} />
        <main id="main">{children}</main>
        <Footer site={site} experienceLinks={footerExperiences} pricingLinks={footerPricing} studioLinks={footerStudio} />
        <div className="lightbox" data-lightbox="" aria-hidden="true">
          <button className="btn btn-soft" type="button" data-lightbox-close="">
            Close
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
            alt=""
            data-lightbox-image=""
          />
        </div>
        <Script src="/assets/site.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
