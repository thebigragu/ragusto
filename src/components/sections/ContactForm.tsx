"use client";

import { Button } from "@/components/ui/Button";
import { SITE } from "@/lib/seo";
import { FormEvent, useState } from "react";

const projectTypes = [
  "AI application",
  "Custom software",
  "Website / brand site",
  "SaaS product",
  "Automation / integrations",
  "UI/UX & branding",
  "Not sure yet",
];

const budgets = [
  "Under $15k",
  "$15k – $40k",
  "$40k – $80k",
  "$80k+",
  "Prefer to discuss",
];

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(form: FormData) {
    const next: Record<string, string> = {};
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const message = String(form.get("message") || "").trim();
    const honey = String(form.get("company_website") || "");

    if (honey) next.honeypot = "bot";
    if (name.length < 2) next.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email.";
    if (message.length < 20) next.message = "Tell us a bit more (20+ characters).";
    return next;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setStatus("submitting");

    // Client-side stub until Resend/SMTP is wired.
    // Opens a prepared mailto as a reliable fallback.
    const subject = encodeURIComponent(
      `Arcform project inquiry — ${String(form.get("name"))}`,
    );
    const body = encodeURIComponent(
      [
        `Name: ${form.get("name")}`,
        `Email: ${form.get("email")}`,
        `Company: ${form.get("company") || "—"}`,
        `Project type: ${form.get("projectType")}`,
        `Budget: ${form.get("budget")}`,
        "",
        String(form.get("message")),
      ].join("\n"),
    );

    try {
      await new Promise((r) => setTimeout(r, 600));
      window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`;
      setStatus("success");
      e.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-[2rem] border border-border bg-bg-elevated p-10 text-center">
        <h2 className="font-display text-3xl tracking-tight">Message ready</h2>
        <p className="mt-3 text-fg-muted">
          Your email client should open with the details. If it doesn’t, write us at{" "}
          <a className="text-fg underline" href={`mailto:${SITE.email}`}>
            {SITE.email}
          </a>
          .
        </p>
        <div className="mt-8 flex justify-center">
          <Button type="button" variant="secondary" onClick={() => setStatus("idle")}>
            Send another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <input
        type="text"
        name="company_website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Name" error={errors.name}>
          <input name="name" required className={inputClass} placeholder="Alex Rivera" />
        </Field>
        <Field label="Email" error={errors.email}>
          <input
            name="email"
            type="email"
            required
            className={inputClass}
            placeholder="alex@company.com"
          />
        </Field>
      </div>

      <Field label="Company">
        <input name="company" className={inputClass} placeholder="Optional" />
      </Field>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Project type">
          <select name="projectType" className={inputClass} defaultValue={projectTypes[0]}>
            {projectTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Budget range">
          <select name="budget" className={inputClass} defaultValue={budgets[4]}>
            {budgets.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Project details" error={errors.message}>
        <textarea
          name="message"
          required
          rows={6}
          className={`${inputClass} resize-y`}
          placeholder="What are you building? Timeline, goals, and anything critical."
        />
      </Field>

      {status === "error" && (
        <p className="text-sm text-red-400">Something went wrong. Please email us directly.</p>
      )}

      <Button type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Preparing…" : "Send inquiry"}
      </Button>
    </form>
  );
}

const inputClass =
  "w-full rounded-2xl border border-border bg-bg-elevated/60 px-4 py-3.5 text-sm outline-none transition focus:border-accent-blue/50";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs tracking-[0.2em] text-fg-muted uppercase">{label}</span>
      {children}
      {error && <span className="block text-xs text-red-400">{error}</span>}
    </label>
  );
}
