import type { Metadata } from "next";

export const SITE = {
  name: "Ragusto",
  tagline: "Bespoke web design and app creation.",
  heroLine: "Digital experiences, crafted with clarity and purpose.",
  description:
    "Ragusto is a bespoke web design and app creation studio building cinematic sites, custom applications, and product experiences with meticulous craft.",
  url: "https://ragusto.com",
  email: "jacob@ragusto.com",
  twitter: "@ragusto",
} as const;

export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "bespoke web design",
    "custom application development",
    "custom software",
    "web design",
    "full stack development",
    "SaaS",
    "UI/UX design",
    "app creation",
  ],
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    creator: SITE.twitter,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "ProfessionalService"],
    name: SITE.name,
    url: SITE.url,
    email: SITE.email,
    description: SITE.description,
    slogan: SITE.tagline,
    areaServed: "Worldwide",
    serviceType: [
      "Bespoke Web Design",
      "Custom Application Development",
      "Custom Software",
      "Web Design",
      "Full Stack Development",
      "UI/UX Design",
      "App Creation",
    ],
  };
}
