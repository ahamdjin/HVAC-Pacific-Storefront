import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  CATALOG_PAGE_PATTERNS,
  GUIDE_PAGE_PATTERNS,
  SHOPIFY_CATALOG_TAG,
  SHOPIFY_GUIDES_TAG,
} from "../../../lib/shopify/cache";

export const runtime = "nodejs";

const catalogTopics = new Set([
  "products/create", "products/update", "products/delete",
  "collections/create", "collections/update", "collections/delete",
  "inventory_items/create", "inventory_items/update", "inventory_items/delete",
  "inventory_levels/update", "inventory_levels/connect", "inventory_levels/disconnect",
]);
const guideTopics = new Set([
  "articles/create", "articles/update", "articles/delete",
  "blogs/create", "blogs/update", "blogs/delete",
]);

function validHmac(raw: Buffer, received: string | null, secret: string) {
  // Require the complete base64-encoded SHA-256 signature, not a permissive
  // base64 decode that could silently ignore malformed/trailing characters.
  if (!received || !/^[A-Za-z0-9+/]{43}=$/.test(received)) return false;
  const expected = createHmac("sha256", secret).update(raw).digest("base64");
  return timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

function validId(value: unknown) {
  return typeof value === "number"
    ? Number.isSafeInteger(value) && value > 0
    : typeof value === "string" && /^[1-9]\d*$/.test(value);
}

function validPayload(payload: unknown, topic: string) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return false;
  const record = payload as Record<string, unknown>;
  if (topic.startsWith("inventory_levels/")) {
    return validId(record.inventory_item_id) && validId(record.location_id);
  }
  return validId(record.id);
}

export async function POST(request: NextRequest) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret is not configured." }, { status: 503 });
  }
  const raw = Buffer.from(await request.arrayBuffer());
  if (!validHmac(raw, request.headers.get("x-shopify-hmac-sha256"), secret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const topic = request.headers.get("x-shopify-topic") ?? "";
  if (!catalogTopics.has(topic) && !guideTopics.has(topic)) {
    return NextResponse.json({ error: "Unsupported webhook topic." }, { status: 400 });
  }
  let payload: unknown;
  try {
    payload = JSON.parse(raw.toString("utf8"));
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  if (!validPayload(payload, topic)) {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }

  const catalog = catalogTopics.has(topic);
  // Unlike "max", expire:0 makes the first subsequent read block for fresh
  // Shopify data. updateTag is only available in Server Actions, not webhooks.
  revalidateTag(catalog ? SHOPIFY_CATALOG_TAG : SHOPIFY_GUIDES_TAG, { expire: 0 });
  // next-intl rewrites / to /en. File-route patterns match both actual locales
  // and all detail/category/brand handles, including old/deleted handles.
  for (const path of catalog ? CATALOG_PAGE_PATTERNS : GUIDE_PAGE_PATTERNS) {
    revalidatePath(path, "page");
  }
  return NextResponse.json({ ok: true });
}