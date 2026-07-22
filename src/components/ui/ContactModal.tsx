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
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4 md:p-6"
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
            className="relative z-10 flex max-h-[min(96dvh,1080px)] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-[#12141a]/95 shadow-2xl dark sm:min-h-[min(82dvh,820px)] sm:rounded-3xl md:max-w-5xl lg:max-w-6xl"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex min-h-0 flex-1 flex-col px-5 pt-5 pb-0 sm:px-8 sm:pt-8 md:px-12 md:pt-10 lg:px-14">
              <div className="mb-4 flex shrink-0 items-start justify-between gap-3 sm:mb-6 md:mb-7">
                <div className="min-w-0">
                  <p className="text-[10px] tracking-[0.28em] text-white/45 uppercase sm:text-xs">
                    Contact
                  </p>
                  <h2
                    id="contact-modal-title"
                    className="mt-1 font-serif text-[1.65rem] leading-tight tracking-tight text-white sm:mt-2 sm:text-4xl md:text-5xl lg:text-6xl"
                  >
                    Get in{" "}
                    <span className="inline-block bg-gradient-to-br from-[#f0e2c4] via-[#c4a574] to-[#8a7350] bg-clip-text pe-[0.2em] pb-[0.06em] italic text-transparent">
                      touch
                    </span>
                  </h2>
                  <p className="mt-1.5 text-xs text-white/60 sm:mt-2 sm:text-sm">
                    Tell us what you&apos;re building — we&apos;ll reply with a clear next step.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/70 transition hover:border-white/35 hover:text-white"
                  aria-label="Close"
                >
                  Close
                </button>
              </div>

              <div className="flex min-h-0 flex-1 flex-col">
                <ContactForm />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
