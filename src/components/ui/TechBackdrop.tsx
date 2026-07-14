import { cn } from "@/lib/utils";

type TechBackdropProps = {
  variant?: "hero" | "section";
  className?: string;
};

/** CSS-only professional tech background — no photo plates */
export function TechBackdrop({ variant = "section", className }: TechBackdropProps) {
  return (
    <div
      className={cn("absolute inset-0 overflow-hidden bg-bg", className)}
      aria-hidden
    >
      <div className="ambient-grid absolute inset-0 opacity-[0.22]" />
      <div
        className={cn(
          "absolute inset-0",
          variant === "hero"
            ? "bg-[radial-gradient(ellipse_75%_55%_at_72%_38%,color-mix(in_oklab,var(--accent-blue)_14%,transparent),transparent_68%),radial-gradient(ellipse_45%_35%_at_18%_72%,color-mix(in_oklab,var(--accent-teal)_10%,transparent),transparent)]"
            : "bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,color-mix(in_oklab,var(--accent-blue)_8%,transparent),transparent_65%)]",
        )}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      {variant === "hero" ? (
        <div className="absolute right-[8%] top-[18%] hidden h-px w-[38%] bg-gradient-to-r from-accent-blue/25 to-transparent md:block" />
      ) : null}
    </div>
  );
}
