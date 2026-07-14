import type { Metadata } from "next";

export const SITE = {
  name: "Arcform",
  tagline: "Engineering digital products that scale.",
  heroLine: "Luxury digital products for ambitious brands.",
  description:
    "Arcform is a luxury digital studio building AI systems, custom applications, and cinematic web experiences with atelier-level craft.",
  url: "https://arcform.dev",
  email: "hello@arcform.dev",
  twitter: "@arcform",
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
    "AI application development",
    "custom software",
    "web design",
    "full stack development",
    "SaaS",
    "UI/UX design",
    "business automation",
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
      "AI Application Development",
      "Custom Software",
      "Web Design",
      "Full Stack Development",
      "UI/UX Design",
    ],
  };
}
