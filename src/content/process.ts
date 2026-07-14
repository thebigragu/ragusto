export type ProcessStep = {
  id: string;
  phase: string;
  title: string;
  description: string;
};

export const processSteps: ProcessStep[] = [
  {
    id: "discovery",
    phase: "01",
    title: "Discovery",
    description: "Goals, constraints, users, and success metrics — mapped before a single screen is drawn.",
  },
  {
    id: "planning",
    phase: "02",
    title: "Planning",
    description: "Scope, milestones, and technical strategy that keep delivery predictable.",
  },
  {
    id: "ux",
    phase: "03",
    title: "UX",
    description: "Information architecture and flows that reduce cognitive load and increase conversion.",
  },
  {
    id: "ui",
    phase: "04",
    title: "UI",
    description: "Visual systems, motion language, and interfaces that feel premium and intentional.",
  },
  {
    id: "architecture",
    phase: "05",
    title: "Architecture",
    description: "Data models, APIs, and infrastructure designed for scale and clarity.",
  },
  {
    id: "development",
    phase: "06",
    title: "Development",
    description: "Type-safe implementation with clean components and disciplined engineering.",
  },
  {
    id: "testing",
    phase: "07",
    title: "Testing",
    description: "Quality gates across accessibility, performance, security, and edge cases.",
  },
  {
    id: "deployment",
    phase: "08",
    title: "Deployment",
    description: "Zero-drama launches on modern cloud platforms with observability from day one.",
  },
  {
    id: "support",
    phase: "09",
    title: "Support",
    description: "Iteration, monitoring, and partnership after ship — products that keep improving.",
  },
];
