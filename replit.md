# HVAC Pacific

An SEO-first Shopify-backed storefront for a Southern California HVAC equipment and parts seller.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/hvac-pacific run dev` — storefront, via its managed workflow
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Storefront: Next.js App Router, Tailwind CSS, next-intl. Its active source is `artifacts/hvac-pacific/app/`, not the unused Vite scaffold under `src/`.

## Where things live

- `artifacts/hvac-pacific/config/site.ts` — business configuration
- `artifacts/hvac-pacific/lib/shopify/storefront.ts` — server-only Storefront client using the Replit Shopify connection
- `artifacts/hvac-pacific/messages/` — UI messages; Simplified Chinese is a machine draft pending native review

## Architecture decisions

- Shopify is the system of record for products, inventory, pricing, translations, carts and checkout. Do not create a second local catalog.
- Use server-rendered Next.js pages for crawlable HTML. Never replace the storefront with client-only routing.
  **Why:** SEO and server-rendered content are explicit, non-negotiable requirements in the user's brief.
- Shopify Admin calls belong only in import/setup scripts through the integration proxy. Never expose Admin credentials to the browser.

## Product

- Local pickup and delivery within 20 miles. No carrier shipping at launch; refrigerant and units stay pickup/local-delivery only.
- English at `/`, Simplified Chinese at `/zh`; visible language links, no browser-language redirects.
- Showroom location is not yet set. Hide showroom/pickup addresses and Store/LocalBusiness address schema; say “Pickup location provided after order.”

## User preferences

- Build in the seven phases from the uploaded brief. Stop after each phase, show the result, and wait for the user's OK before continuing.
- Never invent product specifications, certifications, AHRI numbers, availability or pricing. Omit empty Shopify fields rather than using placeholders.
- No fake testimonials, star ratings, dealer status, price guarantees, stock counters or countdowns.
- EPA 608 certification, licensed-install acknowledgments and hidden HOLD products are mandatory business logic.

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
