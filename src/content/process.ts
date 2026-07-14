export type ProcessStep = {
  id: string;
  phase: string;
  title: string;
  description: string;
};

/** Tight four-stage arc — matches scroll showcase stages */
export const processSteps: ProcessStep[] = [
  {
    id: "discover",
    phase: "01",
    title: "Discover",
    description: "Goals, users, and constraints mapped before a single screen ships.",
  },
  {
    id: "design",
    phase: "02",
    title: "Design",
    description: "Architecture, UX, and visual systems aligned to how the product should feel.",
  },
  {
    id: "build",
    phase: "03",
    title: "Build",
    description: "Type-safe development across AI, apps, and web — tested as we go.",
  },
  {
    id: "ship",
    phase: "04",
    title: "Ship",
    description: "Launch, observe, and iterate. Partnership continues after go-live.",
  },
];
