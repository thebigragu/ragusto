import { SITE } from "@/lib/seo";
import { ArcformWordmark } from "@/components/brand/ArcformMark";
import Link from "next/link";

const columns = [
  {
    title: "Studio",
    links: [
      { href: "/#services", label: "Services" },
      { href: "/#process", label: "Process" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "More",
    links: [
      { href: "/#faq", label: "FAQ" },
      { href: "/privacy", label: "Privacy" },
      { href: `mailto:${SITE.email}`, label: "Email" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container-shell section-pad grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-5">
          <ArcformWordmark markSize="md" textClassName="text-3xl" />
          <p className="max-w-sm text-fg-muted leading-relaxed">{SITE.tagline}</p>
          <a
            href={`mailto:${SITE.email}`}
            className="inline-block text-sm text-fg transition-colors hover:text-accent-blue"
          >
            {SITE.email}
          </a>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <p className="mb-4 text-xs tracking-[0.25em] text-fg-muted uppercase">
              {col.title}
            </p>
            <ul className="space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-fg-muted transition-colors hover:text-fg"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="container-shell flex flex-col gap-3 border-t border-border py-6 text-sm text-fg-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
        <Link href="/privacy" className="hover:text-fg">
          Privacy
        </Link>
      </div>
    </footer>
  );
}
