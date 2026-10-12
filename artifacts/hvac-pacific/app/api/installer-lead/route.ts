import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SITE } from "@/config/site";

const hits = new Map<string, { count: number; reset: number }>();
const WINDOW = 60_000;
const LIMIT = 6;

const LeadSchema = z.object({
  type: z.enum(["installer", "contact"]).default("contact"),
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(7).max(40),
  email: z.string().trim().email().max(180),
  zip: z.string().trim().max(10).optional().default(""),
  language: z.string().trim().max(30).optional().default(""),
  product: z.string().trim().max(300).optional().default(""),
  message: z.string().trim().max(2000).optional().default(""),
  consent: z.literal("yes"),
  company_website: z.string().max(200).optional().default(""),
}).superRefine((value, ctx) => {
  if (value.type === "installer" && !/^\d{5}$/.test(value.zip)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["zip"],
      message: "Enter a valid 5-digit ZIP code.",
    });
  }
});

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...extraHeaders },
  });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (process.env.NODE_ENV === "production" && origin) {
    const allowed = new Set([SITE.domain, "https://www.hvacpacific.com"]);
    if (!allowed.has(origin)) return json({ error: "Invalid request origin." }, 403);
  }

  const isFormPost = request.headers.get("content-type")?.includes("application/x-www-form-urlencoded") || request.headers.get("content-type")?.includes("multipart/form-data");
  const raw = isFormPost
    ? Object.fromEntries((await request.formData().catch(() => new FormData())).entries())
    : await request.json().catch(() => null);
  if (!raw || typeof raw !== "object") return json({ error: "Invalid request." }, 400);

  const honeypot = "company_website" in raw && typeof raw.company_website === "string"
    ? raw.company_website.trim()
    : "";
  if (honeypot) return json({ ok: true });

  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
  const now = Date.now();
  if (hits.size > 1_000) {
    for (const [key, entry] of hits) if (entry.reset <= now) hits.delete(key);
  }
  const current = hits.get(ip);
  if (current && current.reset > now && current.count >= LIMIT) {
    return json(
      { error: "Too many requests. Please call us if you need immediate help." },
      429,
      { "Retry-After": "60" },
    );
  }
  hits.set(ip, current && current.reset > now
    ? { ...current, count: current.count + 1 }
    : { count: 1, reset: now + WINDOW });

  const parsed = LeadSchema.safeParse(raw);
  if (!parsed.success) {
    const zipIssue = parsed.error.issues.find((issue) => issue.path[0] === "zip");
    return json(
      { error: zipIssue?.message || "Please complete the required contact fields." },
      400,
    );
  }

  const { type, name, phone, email, zip, language, product, message } = parsed.data;
  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (!webhook && isFormPost) {
    // HighLevel External Tracking receives the browser's native submit event.
    // This response acknowledges the website submission, not confirmed CRM delivery.
    return new NextResponse(`<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Request Submitted | HVAC Pacific</title><style>body{font:16px system-ui,sans-serif;color:#173b56;background:#f6f8fa;margin:0;display:grid;min-height:100vh;place-items:center}.card{background:#fff;padding:36px;max-width:520px;margin:20px;border:1px solid #e1e6eb;border-radius:12px}h1{margin-top:0}a{color:#12679b}</style></head><body><main class="card"><h1>Request submitted</h1><p>Your form was submitted on our website. If you don't hear from our team, please call ${SITE.phone}.</p><p><a href="/">Return to HVAC Pacific</a></p></main></body></html>`, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
  if (!webhook) return json({ error: "Lead delivery is not configured. Please call us instead." }, 503);

  try {
    const target = new URL(webhook);
    if (process.env.NODE_ENV === "production" && target.protocol !== "https:") {
      return json({ error: "Lead delivery is not configured securely. Please call us instead." }, 503);
    }
  } catch {
    return json({ error: "Lead delivery is not configured. Please call us instead." }, 503);
  }

  const response = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type,
      name,
      phone,
      email,
      zip: zip || undefined,
      language: language || undefined,
      product: product || undefined,
      message: message || undefined,
      source: "hvacpacific.com",
      submittedAt: new Date().toISOString(),
    }),
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  }).catch(() => null);

  if (!response?.ok) {
    return json({ error: "We could not send your request. Please call us instead." }, 502);
  }
  return json({ ok: true });
}
