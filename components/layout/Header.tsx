import { SiteSettings } from "../../lib/types";

interface NavigationLink {
  href: string;
  label: string;
}

interface HeaderProps {
  site: SiteSettings;
  navItems: NavigationLink[];
}

export default function Header({ site, navItems }: HeaderProps) {

  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="/" aria-label="My Baby Pictures home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={site.logo} alt="" width="42" height="42" />
          <span>{site.name}</span>
        </a>
        <nav className="nav" aria-label="Primary navigation">
          {navItems.map(({ href, label }) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <a
          className="btn btn-primary desktop-cta"
          href={site.whatsapp}
          data-track="cta_click"
          data-track-label="Header WhatsApp"
        >
          Book Now
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-label="Open menu"
          aria-expanded="false"
          data-menu-toggle=""
        >
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      <nav className="mobile-nav" aria-label="Mobile navigation" data-mobile-nav="">
        {navItems.map(({ href, label }) => (
          <a key={href} href={href}>
            {label}
          </a>
        ))}
        <a
          href={site.whatsapp}
          data-track="cta_click"
          data-track-label="Mobile WhatsApp"
        >
          Book Now
        </a>
      </nav>
    </header>
  );
}
