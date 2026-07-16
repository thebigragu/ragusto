"use client";

import { ArcformMark } from "@/components/brand/ArcformMark";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { href: "/#services", label: "Work" },
  { href: "/#services", label: "Services" },
  { href: "/#process", label: "Studio" },
  { href: "/#faq", label: "Insights" },
  { href: "/contact", label: "Contact" },
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
    <header className={cn("fixed top-0 right-0 left-0 z-40 transition-all duration-500", scrolled ? "py-3" : "py-5")}>
      <div className="container-shell">
        <div
          className={cn(
            "flex items-center justify-between px-1 py-2 transition-all duration-500 md:px-2",
            scrolled && "rounded-full px-4 glass md:px-5",
          )}
        >
          <Link href="/" className="flex items-center gap-2.5 text-white" onClick={() => setOpen(false)}>
            <ArcformMark size="sm" className="text-white" animated={false} />
            <span className="text-[13px] font-medium tracking-[0.22em] uppercase">Arcform</span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {links.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                className="text-[13px] tracking-wide text-white/70 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              aria-label="Menu"
              className="ml-1 flex h-8 w-8 flex-col items-center justify-center gap-1.5"
            >
              <span className="block h-px w-4 bg-white/80" />
              <span className="block h-px w-4 bg-white/80" />
              <span className="block h-px w-4 bg-white/80" />
            </button>
          </nav>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-10 w-10 items-center justify-center lg:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="flex flex-col gap-1.5">
              <span className={cn("block h-px w-4 bg-white transition-transform", open && "translate-y-[3.5px] rotate-45")} />
              <span className={cn("block h-px w-4 bg-white transition-transform", open && "-translate-y-[3.5px] -rotate-45")} />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-30 bg-black/95 backdrop-blur-xl lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="container-shell flex h-full flex-col justify-center gap-8 pt-20">
              {links.map((link, i) => (
                <motion.div
                  key={`${link.href}-${link.label}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={link.href}
                    className="font-serif text-4xl tracking-tight text-white"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
