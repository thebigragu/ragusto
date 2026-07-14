import { ContactForm } from "@/components/sections/ContactForm";
import { PageTransition } from "@/components/motion/PageTransition";
import { SITE } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: `Start a project with ${SITE.name}. Tell us about your AI, software, or web initiative.`,
};

export default function ContactPage() {
  return (
    <PageTransition>
      <section className="section-pad pt-[calc(var(--nav-height)+3rem)]">
        <div className="container-shell grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <p className="text-xs tracking-[0.3em] text-fg-muted uppercase">Contact</p>
            <h1 className="font-display text-5xl tracking-tight md:text-6xl">
              Start a project
            </h1>
            <p className="max-w-md text-fg-muted leading-relaxed">
              Share a short brief. We’ll review fit, scope, and recommend a clear next step —
              usually within one to two business days.
            </p>
            <div className="space-y-2 pt-4 text-sm">
              <p className="text-fg-muted">Email</p>
              <a href={`mailto:${SITE.email}`} className="text-fg hover:text-accent-blue">
                {SITE.email}
              </a>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
    </PageTransition>
  );
}
