import React from "react";
import { getSiteSettings } from "../../../lib/repositories/settingsRepository";
import { buildMetadata } from "../../../lib/seo";
import { buildLocalBusinessSchema as getLocalBusinessSchema } from "../../../lib/schema";

// Let's create a dynamic metadata generator
export async function generateMetadata() {
  const site = await getSiteSettings();
  return await buildMetadata({
    title: `Privacy Policy | ${site.name}`,
    description: "Privacy policy for My Baby Pictures photography studio.",
    path: "/privacy-policy/",
    image: site.ogImage,
  });
}

export default async function PrivacyPolicyPage() {
  const site = await getSiteSettings();
  
  // Format today's date in 'en-CA' Kolkata time as done in scripts/build-site.mjs
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());

  const schema = getLocalBusinessSchema(site);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <section className="section">
        <div className="container">
          <p className="eyebrow">Privacy</p>
          <h1>Privacy Policy</h1>
          <p className="lead">Last updated: {today}</p>
          <div className="grid grid-2" style={{ marginTop: "36px" }}>
            <article className="content-card">
              <h3>Information we collect</h3>
              <p>
                We collect details needed to plan and deliver photography sessions, including name,
                phone number, WhatsApp contact, session category, baby age, event date and
                preferences shared through forms or messages.
              </p>
            </article>
            <article className="content-card">
              <h3>How we use it</h3>
              <p>
                Details are used for scheduling, session planning, gallery delivery, customer
                support, analytics and improving the website experience.
              </p>
            </article>
            <article className="content-card">
              <h3>Photos and media</h3>
              <p>
                Session images and videos are handled according to client consent and are used for
                portfolio or marketing only where permission has been given.
              </p>
            </article>
            <article className="content-card">
              <h3>Contact</h3>
              <p>
                For privacy questions, contact {site.name} at {site.phone} or visit the studio at{" "}
                {site.address}.
              </p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
