/** Contact inbox — inquiries are delivered here via Resend */
export const CONTACT_TO_EMAIL = "jacob@ragusto.com";

export function getResendFromAddress() {
  const domain = (process.env.RESEND_EMAIL_DOMAIN || "").trim().replace(/^"+|"+$/g, "");
  if (domain) {
    return `Ragusto <contact@${domain}>`;
  }
  // Works before a custom domain is verified in Resend
  return "Ragusto <onboarding@resend.dev>";
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
