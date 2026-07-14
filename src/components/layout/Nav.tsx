"use client";

import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { SITE } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { href: "/#services", label: "Services" },
  { href: "/#work", label: "Work" },
  { href: "/#process", label: "Process" },
  { href: "/#faq", label: "FAQ" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 z-40 transition-all duration-500",
        scrolled ? "py-3" : "py-5",
      )}
    >
      <div className="container-shell">
        <div
          className={cn(
            "flex items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 md:px-6",
            scrolled ? "glass shadow-[0_10px_40px_rgba(0,0,0,0.12)]" : "bg-transparent",
          )}
        >
          <Link
            href="/"
            className="font-display text-lg tracking-tight md:text-xl"
            onClick={() => setOpen(false)}
          >
            {SITE.name}
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative text-sm text-fg-muted transition-colors hover:text-fg"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-fg transition-all duration-500 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <ThemeToggle />
            <Magnetic>
              <Button href="/contact" variant="primary">
                Start a project
              </Button>
            </Magnetic>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="sr-only">Menu</span>
              <span className="flex flex-col gap-1.5">
                <span
                  className={cn(
                    "block h-px w-4 bg-fg transition-transform duration-300",
                    open && "translate-y-[3.5px] rotate-45",
                  )}
                />
                <span
                  className={cn(
                    "block h-px w-4 bg-fg transition-transform duration-300",
                    open && "-translate-y-[3.5px] -rotate-45",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-30 bg-bg/95 backdrop-blur-xl lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="container-shell flex h-full flex-col justify-center gap-8 pt-20">
              {links.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={link.href}
                    className="font-display text-4xl tracking-tight"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <Button href="/contact" onClick={() => setOpen(false)}>
                Start a project
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
