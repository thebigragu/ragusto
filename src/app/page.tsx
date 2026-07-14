import { Benefits } from "@/components/sections/Benefits";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Hero } from "@/components/sections/Hero";
import { Industries } from "@/components/sections/Industries";
import { Process } from "@/components/sections/Process";
import { Projects } from "@/components/sections/Projects";
import { Services } from "@/components/sections/Services";
import { Solutions } from "@/components/sections/Solutions";
import { Technology } from "@/components/sections/Technology";
import { Testimonials } from "@/components/sections/Testimonials";
import { Trust } from "@/components/sections/Trust";
import { PageTransition } from "@/components/motion/PageTransition";

export default function Home() {
  return (
    <PageTransition>
      <Hero />
      <Trust />
      <Services />
      <Projects />
      <Process />
      <Technology />
      <Solutions />
      <Industries />
      <Benefits />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </PageTransition>
  );
}
