import { CONTACT_TO_EMAIL, escapeHtml, getResendFromAddress } from "@/lib/contact";
import { Resend } from "resend";

export const runtime = "nodejs";

type ContactBody = {
  name?: string;
  email?: string;
  company?: string;
  projectType?: string;
  message?: string;
  company_website?: string;
};

function validate(body: ContactBody) {
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const company = String(body.company || "").trim();
  const projectType = String(body.projectType || "").trim();
  const message = String(body.message || "").trim();
  const honey = String(body.company_website || "");

  if (honey) return { error: "Rejected.", status: 400 as const };
  if (name.length < 2) return { error: "Please enter your name.", status: 400 as const };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email.", status: 400 as const };
  }
  if (!message) {
    return { error: "Please add a short note about your project.", status: 400 as const };
  }

  return {
    data: {
      name,
      email,
      company: company || "—",
      projectType: projectType || "Not specified",
      message,
    },
  };
}

export async function POST(request: Request) {
  try {
    const apiKey = (process.env.RESEND_API_KEY || "").trim().replace(/^"+|"+$/g, "");
    if (!apiKey) {
      console.error("RESEND_API_KEY is missing or empty");
      return Response.json(
        { error: "Email service is not configured. Please try again later." },
        { status: 503 },
      );
    }

    const body = (await request.json()) as ContactBody;
    const result = validate(body);
    if ("error" in result && result.error) {
      return Response.json({ error: result.error }, { status: result.status });
    }

    const data = result.data!;
    const resend = new Resend(apiKey);
    const to = (process.env.CONTACT_TO_EMAIL || CONTACT_TO_EMAIL).trim() || CONTACT_TO_EMAIL;

    const text = [
      `New Ragusto inquiry`,
      ``,
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Company: ${data.company}`,
      `Project type: ${data.projectType}`,
      ``,
      data.message,
    ].join("\n");

    const html = `
      <div style="font-family:Georgia,serif;line-height:1.55;color:#111;">
        <h2 style="margin:0 0 12px;font-weight:600;">New Ragusto inquiry</h2>
        <p style="margin:0 0 8px;"><strong>Name:</strong> ${escapeHtml(data.name)}</p>
        <p style="margin:0 0 8px;"><strong>Email:</strong> ${escapeHtml(data.email)}</p>
        <p style="margin:0 0 8px;"><strong>Company:</strong> ${escapeHtml(data.company)}</p>
        <p style="margin:0 0 16px;"><strong>Project type:</strong> ${escapeHtml(data.projectType)}</p>
        <p style="margin:0 0 6px;"><strong>Message:</strong></p>
        <p style="margin:0;white-space:pre-wrap;">${escapeHtml(data.message)}</p>
      </div>
    `;

    const { data: sent, error } = await resend.emails.send({
      from: getResendFromAddress(),
      to: [to],
      replyTo: data.email,
      subject: `Ragusto inquiry — ${data.name}`,
      text,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return Response.json({ error: "Failed to send message. Please try again." }, { status: 502 });
    }

    return Response.json({ ok: true, id: sent?.id ?? null });
  } catch (error) {
    console.error("Contact API error:", error);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
