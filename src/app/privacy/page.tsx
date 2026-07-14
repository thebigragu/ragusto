import { PageTransition } from "@/components/motion/PageTransition";
import { SITE } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description: `Privacy policy for ${SITE.name}.`,
};

export default function PrivacyPage() {
  return (
    <PageTransition>
      <section className="section-pad pt-[calc(var(--nav-height)+3rem)]">
        <div className="container-shell max-w-3xl space-y-6">
          <h1 className="font-display text-5xl tracking-tight">Privacy</h1>
          <p className="text-fg-muted leading-relaxed">
            {SITE.name} collects only the information you voluntarily submit through our
            contact form (name, email, company, and project details) to respond to inquiries.
            We do not sell personal data. Form submissions are handled via your email client
            until a production mail provider is configured.
          </p>
          <p className="text-fg-muted leading-relaxed">
            Theme preference may be stored locally in your browser. Analytics identifiers are
            not active in this release.
          </p>
          <p className="text-fg-muted leading-relaxed">
            Questions? Email{" "}
            <a className="text-fg underline" href={`mailto:${SITE.email}`}>
              {SITE.email}
            </a>
            .
          </p>
          <Link href="/" className="inline-block text-sm text-fg-muted hover:text-fg">
            ← Back home
          </Link>
        </div>
      </section>
    </PageTransition>
  );
}
