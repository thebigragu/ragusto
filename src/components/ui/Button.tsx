"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  magnetic?: boolean;
  onClick?: ComponentProps<"button">["onClick"];
} & Omit<ComponentProps<"button">, "children" | "className" | "onClick">;

const variants = {
  primary:
    "bg-fg text-bg hover:bg-accent-blue hover:text-white border border-transparent",
  secondary:
    "bg-transparent text-fg border border-border hover:border-fg/40 hover:bg-bg-elevated",
  ghost: "bg-transparent text-fg-muted hover:text-fg border border-transparent",
};

export function Button({
  children,
  href,
  variant = "primary",
  className,
  magnetic = true,
  onClick,
  ...props
}: ButtonProps) {
  const classes = cn(
    "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-7 py-3.5 text-sm font-medium tracking-wide transition-colors duration-500 disabled:opacity-60",
    variants[variant],
    className,
  );

  const inner = (
    <motion.span
      className="relative z-10 inline-flex items-center gap-2"
      whileHover={magnetic ? { y: -1 } : undefined}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.span>
  );

  const shine = (
    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
  );

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick as ComponentProps<"a">["onClick"]}>
        {inner}
        {shine}
      </Link>
    );
  }

  return (
    <button className={classes} onClick={onClick} {...props}>
      {inner}
      {shine}
    </button>
  );
}
