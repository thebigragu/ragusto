import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Hero } from "@/components/sections/Hero";
import { ProcessShowcase } from "@/components/sections/ProcessShowcase";
import { Projects } from "@/components/sections/Projects";
import { Proof } from "@/components/sections/Proof";
import { Services } from "@/components/sections/Services";
import { PageTransition } from "@/components/motion/PageTransition";

/**
 * First-iteration cinematic arc (tight):
 * Hero (interactive Blender lounge) → Services → Work → Process → Proof → FAQ → CTA
 * Fluid full-bleed sections — no boxed photography.
 */
export default function Home() {
  return (
    <PageTransition>
      <Hero />
      <Services />
      <Projects />
      <ProcessShowcase />
      <Proof />
      <FAQ />
      <FinalCTA />
    </PageTransition>
  );
}
