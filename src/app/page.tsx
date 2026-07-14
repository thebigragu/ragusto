import { Approach } from "@/components/sections/Approach";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { Proof } from "@/components/sections/Proof";
import { Services } from "@/components/sections/Services";
import { PageTransition } from "@/components/motion/PageTransition";

/**
 * Editorial homepage — photoreal artwork, no WebGL clutter.
 * Hero → Work → Services → Approach → Proof → FAQ → CTA
 */
export default function Home() {
  return (
    <PageTransition>
      <Hero />
      <Projects />
      <Services />
      <Approach />
      <Proof />
      <FAQ />
      <FinalCTA />
    </PageTransition>
  );
}
