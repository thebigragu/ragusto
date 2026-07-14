export type Faq = {
  question: string;
  answer: string;
};

export const faqs: Faq[] = [
  {
    question: "What kinds of companies do you work with?",
    answer:
      "We partner with founders and product teams who need exceptional software — startups shipping their first platform, and established businesses modernizing internal systems, portals, and customer experiences.",
  },
  {
    question: "Do you build both websites and applications?",
    answer:
      "Yes. Arcform covers cinematic marketing sites, SaaS products, dashboards, AI integrations, and full custom platforms — often as one continuous engagement.",
  },
  {
    question: "How long does a typical engagement take?",
    answer:
      "Focused websites often ship in 4–8 weeks. Product platforms and AI systems typically run 8–16 weeks depending on scope, integrations, and complexity.",
  },
  {
    question: "What does the engagement look like day to day?",
    answer:
      "You work with senior builders directly. Weekly demos, clear milestones, async updates, and a single source of truth for decisions — no black-box agency process.",
  },
  {
    question: "Can you integrate with our existing stack?",
    answer:
      "Absolutely. We routinely extend APIs, auth providers, CRMs, data warehouses, and cloud infrastructure already in place.",
  },
  {
    question: "How do we get started?",
    answer:
      "Start a project through our contact form. We’ll review scope, recommend an approach, and propose a clear timeline and investment.",
  },
];

export const testimonials = [
  {
    quote:
      "Arcform turned a tangled product story into a platform that finally felt as sharp as the engineering behind it. Investors and customers both noticed.",
    name: "Maya Chen",
    role: "CEO, Signal Analytics",
  },
  {
    quote:
      "They don’t just design interfaces — they engineer systems. Our ops console cut handoffs dramatically and the team still loves using it.",
    name: "Jordan Hale",
    role: "COO, Northwind Ops",
  },
  {
    quote:
      "The AI desk felt production-ready from week one: grounded answers, clean escalation, and a UI that matched our brand.",
    name: "Priya Nair",
    role: "Head of Product, Harbor",
  },
];

export const stats = [
  { label: "Products shipped", value: 80, suffix: "+" },
  { label: "Avg. Lighthouse", value: 95, suffix: "+" },
  { label: "Client retention", value: 94, suffix: "%" },
  { label: "Years building", value: 10, suffix: "+" },
];

export const industries = [
  "Fintech & SaaS",
  "Healthcare operations",
  "Logistics & supply chain",
  "Professional services",
  "E-commerce & retail",
  "Energy & industrial",
  "Education platforms",
  "Internal enterprise tools",
];

export const benefits = [
  {
    title: "Clarity on first visit",
    description: "Complex products explained with cinematic precision — buyers understand value immediately.",
  },
  {
    title: "Engineering that lasts",
    description: "Type-safe codebases, clean architecture, and documentation your team can own.",
  },
  {
    title: "Motion with purpose",
    description: "Every animation earns its place — hierarchy, delight, and performance in balance.",
  },
  {
    title: "AI with guardrails",
    description: "Intelligent features that are measurable, grounded, and safe for production users.",
  },
];

export const trustLogos = [
  "Quanta",
  "Northwind",
  "Lumen",
  "Harbor",
  "Signal",
  "Crestline",
];
