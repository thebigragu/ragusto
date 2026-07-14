import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Hero } from "@/components/sections/Hero";
import { ProcessShowcase } from "@/components/sections/ProcessShowcase";
import { Proof } from "@/components/sections/Proof";
import { Services } from "@/components/sections/Services";
import { PageTransition } from "@/components/motion/PageTransition";

/**
 * Hero → Services → Process → Proof → FAQ → CTA
 */
export default function Home() {
  return (
    <PageTransition>
      <Hero />
      <Services />
      <ProcessShowcase />
      <Proof />
      <FAQ />
      <FinalCTA />
    </PageTransition>
  );
}
