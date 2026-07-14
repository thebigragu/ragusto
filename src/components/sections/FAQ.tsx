import { Accordion } from "@/components/ui/Accordion";
import { faqs } from "@/content/site";

export function FAQ() {
  return (
    <section id="faq" className="section-pad scroll-mt-24">
      <div className="container-shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4">
          <p className="text-xs tracking-[0.3em] text-fg-muted uppercase">FAQ</p>
          <h2 className="font-display text-4xl tracking-tight md:text-5xl">
            Straight answers before we build
          </h2>
        </div>
        <Accordion items={faqs} />
      </div>
    </section>
  );
}
