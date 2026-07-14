export type Service = {
  id: string;
  title: string;
  summary: string;
  details: string;
  accent: "blue" | "teal" | "violet";
};

/** Four pillars — no overlap with a separate “solutions” block */
export const services: Service[] = [
  {
    id: "ai",
    title: "AI Products",
    summary: "Copilots, agents, and retrieval systems built for production — not demos.",
    details:
      "Grounded RAG, workflow automation, evals, and guardrails embedded into products your users already trust.",
    accent: "violet",
  },
  {
    id: "apps",
    title: "Custom Applications",
    summary: "SaaS, portals, dashboards, and internal platforms engineered end-to-end.",
    details:
      "Type-safe full-stack systems with clean architecture, secure auth, and interfaces that scale with your team.",
    accent: "blue",
  },
  {
    id: "web",
    title: "Web Experiences",
    summary: "Brand-defining sites with cinematic motion and conversion clarity.",
    details:
      "Next.js builds optimized for performance, SEO, and storytelling — the kind of presence that signals engineering excellence.",
    accent: "teal",
  },
  {
    id: "design",
    title: "Design Systems",
    summary: "UI/UX and identity that make sophisticated software feel inevitable.",
    details:
      "Product design, motion language, and brand systems that keep every screen coherent as you ship.",
    accent: "violet",
  },
];
