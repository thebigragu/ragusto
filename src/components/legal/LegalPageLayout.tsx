import { PageTransition } from "@/components/motion/PageTransition";
import type { ReactNode } from "react";

export function LegalPageLayout({ children }: { children: ReactNode }) {
  return (
    <PageTransition>
      <section className="section-pad pt-[calc(var(--nav-height)+3rem)]">
        <div className="container-shell max-w-3xl">{children}</div>
      </section>
    </PageTransition>
  );
}
