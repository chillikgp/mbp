import React from "react";
import ResponsiveImage from "../layout/ResponsiveImage";

interface StatItemProps {
  value: string;
  label: string;
}

interface HeroProps {
  eyebrow: string;
  title: string;
  copy: string;
  image: string;
  video?: string;
  videoPoster?: string;
  primary?: string;
  secondary?: string;
  path?: string;
  secondaryPath?: string;
  stats?: StatItemProps[];
}

export default function Hero({
  eyebrow,
  title,
  copy,
  image,
  video,
  videoPoster,
  primary = "Book a Session",
  secondary = "View Portfolio",
  path = "#contact",
  secondaryPath = "#portfolio",
  stats = [],
}: HeroProps) {
  return (
    <section className="hero">
      <div className="container hero-inner">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="lead">{copy}</p>
          <div className="hero-actions">
            <a
              className="btn btn-primary"
              href={path}
              data-track="cta_click"
              data-track-label={primary}
            >
              {primary}
            </a>
            <a
              className="btn btn-outline"
              href={secondaryPath}
              data-track="cta_click"
              data-track-label={secondary}
            >
              {secondary}
            </a>
          </div>
        </div>
        <div className={`hero-media${video ? " hero-media--video" : ""}`}>
          {video ? (
            <>
              <video
                autoPlay
                muted
                loop
                playsInline
                poster={videoPoster || image}
                data-hero-video
              >
                <source src={video} type="video/mp4" />
              </video>
              <button
                type="button"
                className="hero-sound-toggle"
                data-hero-sound-toggle
                aria-label="Unmute video"
              />
            </>
          ) : (
            <ResponsiveImage src={image} alt={title} loading="eager" />
          )}
          {stats.length > 0 && (
            <div className="hero-card">
              {stats.map((stat, index) => (
                <div key={index} className="stat">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
export { Hero };
