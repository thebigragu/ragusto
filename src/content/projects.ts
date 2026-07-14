export type Project = {
  id: string;
  name: string;
  category: string;
  description: string;
  outcomes: string[];
  stack: string[];
  accent: string;
};

export const projects: Project[] = [
  {
    id: "northwind-ops",
    name: "Northwind Ops",
    category: "Internal Platform",
    description:
      "A unified operations console that replaced six spreadsheets with live workflows, role-based access, and AI-assisted triage.",
    outcomes: ["62% faster handoffs", "Single source of truth", "Audit-ready logs"],
    stack: ["Next.js", "PostgreSQL", "AI Agents"],
    accent: "#3B82F6",
  },
  {
    id: "lumen-portal",
    name: "Lumen Client Portal",
    category: "Customer Portal",
    description:
      "A branded self-serve portal for enterprise clients — invoices, project status, document exchange, and support in one place.",
    outcomes: ["40% fewer tickets", "NPS +18", "Mobile-first UX"],
    stack: ["React", "Node", "Stripe"],
    accent: "#14B8A6",
  },
  {
    id: "signal-saas",
    name: "Signal Analytics",
    category: "SaaS Product",
    description:
      "A multi-tenant analytics SaaS with realtime dashboards, usage-based billing, and a design system that scales with every release.",
    outcomes: ["Series A ready", "Sub-second charts", "SOC2 path"],
    stack: ["TypeScript", "ClickHouse", "R3F"],
    accent: "#7C6CF0",
  },
  {
    id: "harbor-ai",
    name: "Harbor AI Desk",
    category: "AI Integration",
    description:
      "An AI support desk embedded in an existing product — grounded answers, escalation routing, and measurable deflection.",
    outcomes: ["35% deflection", "Grounded RAG", "Human override"],
    stack: ["Python", "OpenAI", "Next.js"],
    accent: "#3B82F6",
  },
];
