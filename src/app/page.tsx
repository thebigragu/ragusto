import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Hero } from "@/components/sections/Hero";
import { ProcessShowcase } from "@/components/sections/ProcessShowcase";
import { Projects } from "@/components/sections/Projects";
import { Proof } from "@/components/sections/Proof";
import { Services } from "@/components/sections/Services";
import { PageTransition } from "@/components/motion/PageTransition";

/**
 * Tight homepage arc:
 * Hero → Services → Work → Process (with 3D) → Proof → FAQ → CTA
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
