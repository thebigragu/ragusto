"use client";

import { ContactForm } from "@/components/sections/ContactForm";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

export function ContactModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <button
            type="button"
            aria-label="Close contact form"
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
            className="relative z-10 max-h-[min(94svh,960px)] w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[#12141a]/95 p-8 shadow-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden dark md:max-w-5xl md:p-12"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.28em] text-white/45 uppercase">Contact</p>
                <h2
                  id="contact-modal-title"
                  className="mt-2 font-serif text-3xl tracking-tight text-white md:text-5xl"
                >
                  Get in{" "}
                  <span className="bg-gradient-to-br from-[#f0e2c4] via-[#c4a574] to-[#8a7350] bg-clip-text italic text-transparent">
                    touch
                  </span>
                </h2>
                <p className="mt-2 text-sm text-white/60">
                  Tell us what you&apos;re building — we&apos;ll reply with a clear next step.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/70 transition hover:border-white/35 hover:text-white"
                aria-label="Close"
              >
                Close
              </button>
            </div>
            <ContactForm />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
