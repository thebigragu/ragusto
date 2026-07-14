export type Service = {
  id: string;
  title: string;
  summary: string;
  details: string;
  accent: "blue" | "teal" | "violet";
};

export const services: Service[] = [
  {
    id: "ai-apps",
    title: "AI Application Development",
    summary: "Production AI systems that ship, learn, and scale with your business.",
    details:
      "From intelligent copilots to retrieval pipelines and agent workflows — we design, train integrations, and harden AI products for real users.",
    accent: "violet",
  },
  {
    id: "custom-software",
    title: "Custom Software",
    summary: "Bespoke platforms engineered around your operations — not the other way around.",
    details:
      "Internal tools, customer portals, and mission-critical systems built with clean architecture, strong typing, and long-term maintainability.",
    accent: "blue",
  },
  {
    id: "web",
    title: "Web Design & Development",
    summary: "Cinematic, conversion-focused experiences that feel as sharp as they perform.",
    details:
      "Brand-led interfaces, motion systems, and blazing Next.js builds optimized for SEO, accessibility, and Core Web Vitals.",
    accent: "teal",
  },
  {
    id: "fullstack",
    title: "Full Stack Development",
    summary: "End-to-end product engineering from API to pixel.",
    details:
      "Cloud applications, SaaS products, and dashboards with secure auth, scalable data layers, and polished frontends.",
    accent: "blue",
  },
  {
    id: "automation",
    title: "Automation & Integrations",
    summary: "Replace manual process with reliable, observable workflows.",
    details:
      "Business automation, API development, and third-party integrations that connect your stack without fragile duct tape.",
    accent: "teal",
  },
  {
    id: "design",
    title: "UI/UX & Branding",
    summary: "Visual systems that communicate premium quality on first glance.",
    details:
      "Product design, design systems, and brand identity that make sophisticated software feel inevitable and trustworthy.",
    accent: "violet",
  },
];
