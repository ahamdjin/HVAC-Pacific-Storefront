# HVAC Pacific

SEO-first, headless Shopify storefront for a Southern California HVAC equipment and parts seller.

## Active storefront

- App: `artifacts/hvac-pacific`
- Framework: Next.js App Router + TypeScript + Tailwind CSS + next-intl
- Commerce source of truth: Shopify
- Checkout: Shopify Cart / Checkout via Storefront API
- English: `/`
- Simplified Chinese: `/zh`

The legacy Vite scaffold under `artifacts/hvac-pacific/src` is not the active storefront.

## Commands

- `pnpm --filter @workspace/hvac-pacific run dev` — storefront dev server
- `pnpm --filter @workspace/hvac-pacific run typecheck`
- `pnpm --filter @workspace/hvac-pacific run build`
- `pnpm run typecheck` — whole workspace typecheck
- `pnpm run build` — whole workspace build

## Shopify environment

Preferred production secrets:
- `SHOPIFY_STORE_DOMAIN`
- `SHOPIFY_STOREFRONT_TOKEN`
- `SHOPIFY_ADMIN_TOKEN` (imports/admin only)
- `SHOPIFY_WEBHOOK_SECRET`

The Replit Shopify connector remains supported as a Storefront credential fallback.

Other production config:
- `LEAD_WEBHOOK_URL`
- `GA4_ID`
- `GSC_VERIFICATION`
- `MERCHANT_VERIFICATION`
- `ZH_TRANSLATIONS_REVIEWED=true` only after native Chinese review

See `docs/shopify-launch.md`.

## Architecture decisions

- Shopify is the only product/inventory/price/cart/checkout source of truth. Do not create a second local catalog.
- Storefront reads are server-side through `artifacts/hvac-pacific/lib/shopify/storefront.ts`.
- Shopify Admin API credentials must never be exposed to browser code.
- Product/category/guide pages are server-rendered for crawlable HTML.
- Filter query URLs are UX state, not SEO landing pages.
- Product facts are rendered only when present in Shopify. Never invent ratings, AHRI data, certifications, compatibility, inventory or pricing.
- Draft legal/policy content stays noindex until explicitly reviewed.
- Chinese pages stay noindex until native review is explicitly enabled.

## Commerce / compliance rules

- Local pickup and eligible local delivery within 20 miles at launch.
- No nationwide carrier shipping unless the business intentionally enables it.
- EPA 608 gated products require certification details before add-to-cart.
- Equipment flagged for licensed installation requires acknowledgement.
- Three-phase and Proposition 65 warnings render only when flagged in catalog data.
- HOLD / NEEDS DATA products should not be published to the headless channel or Merchant feed.

## SEO / Google

- Sitemap index: `/sitemap.xml`
- Merchant Center feed: `/feeds/google-merchant.xml`
- Local inventory feed is disabled until a real showroom/store code is configured.
- Shopify update webhook endpoint: `/api/revalidate`
- Keep Shopify's theme storefront password-protected or redirected to the headless domain to prevent duplicate indexable pages.
