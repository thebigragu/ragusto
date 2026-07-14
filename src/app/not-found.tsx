import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section-pad pt-[calc(var(--nav-height)+4rem)]">
      <div className="container-shell max-w-xl space-y-6">
        <p className="font-mono text-sm text-fg-muted">404</p>
        <h1 className="font-display text-5xl tracking-tight">Page not found</h1>
        <p className="text-fg-muted">The page you’re looking for doesn’t exist or has moved.</p>
        <Link
          href="/"
          className="inline-flex rounded-full border border-border px-6 py-3 text-sm hover:bg-bg-elevated"
        >
          Back home
        </Link>
      </div>
    </section>
  );
}
