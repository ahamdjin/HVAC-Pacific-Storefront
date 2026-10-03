# HVAC Pacific — Shopify launch setup

This storefront treats Shopify as the only source of truth for products, prices, inventory, translations, carts and checkout.

## Required environment variables

- `SHOPIFY_STORE_DOMAIN` — e.g. `store.myshopify.com`
- `SHOPIFY_STOREFRONT_TOKEN` — Storefront API token
- `SHOPIFY_ADMIN_TOKEN` — server/import use only; never expose to the browser
- `SHOPIFY_WEBHOOK_SECRET`
- `LEAD_WEBHOOK_URL` — GoHighLevel or other inbound lead webhook
- `GA4_ID`
- `GSC_VERIFICATION`
- `MERCHANT_VERIFICATION`

Optional:
- `ENABLE_LOCAL_INVENTORY_FEED=true` only after a real showroom/pickup location is configured
- `GOOGLE_LOCAL_STORE_CODE` when Local Inventory is enabled

The Replit Shopify connector remains supported as a Storefront credential fallback.

## Shopify channels and domains

1. Enable the Headless sales channel and publish only verified products to it.
2. Keep the Shopify Online Store theme password protected or redirect it to the headless domain so duplicate Shopify product pages are not indexable.
3. Use Shopify checkout for payment and order completion.
4. Configure local pickup and eligible local delivery in Shopify. Do not enable nationwide shipping unless the business decides to offer it.

## Product metafields

Create these product metafields in namespace `specs` and enable Storefront access:

| Key | Type | Purpose |
| --- | --- | --- |
| site_status | single line text | PUBLISH / PUBLISH AFTER CHECK / NEEDS DATA / HOLD / KEEP - LEGAL RISK |
| site_category | single line text | top catalog category |
| subcategory | single line text | parts subcategory |
| tonnage | decimal | filters/specifications |
| btu | integer | specifications |
| system_type | single line text | filters/specifications |
| outdoor_model | single line text | model/component data |
| indoor_model | single line text | model/component data |
| furnace_model | single line text | model/component data |
| refrigerant | single line text | filters/specifications |
| ahri_number | single line text | AHRI information |
| seer2 | decimal | specifications |
| eer2 | decimal | specifications |
| hspf2 | decimal | specifications |
| afue | decimal | specifications |
| scaqmd_1111_compliant | boolean | compliance badge |
| cec_listed | boolean | compliance badge |
| requires_epa608 | boolean | purchase gate |
| requires_licensed_install | boolean | purchase acknowledgement |
| three_phase | boolean | warning |
| prop65 | boolean | warning |
| key_specs | multiline text | semicolon/newline-separated `label: value` pairs |
| google_title | single line text | Merchant title override |
| spec_sheet_url | URL | product document |
| manual_url | URL | product document |
| sds_url | URL | product document |
| faq | JSON | `[{"q":"...","a":"..."}]` |

Collection metafields:
- `content.guide_html`
- `content.faq`

## Catalog conventions

- Products with unverified or missing facts stay unpublished from the Headless channel.
- Do not invent AHRI numbers, ratings, warranty periods, certifications or compatibility.
- Refrigerant products that require certification use `specs.requires_epa608=true`.
- Equipment that requires licensed installation uses `specs.requires_licensed_install=true`.
- Exact system/component model numbers belong in their dedicated metafields, not only in prose.
- Use separate Shopify products for separately stocked/sold components; use metadata and recommendations to connect them.

## Guides

Create a Shopify blog with handle `guides`. Only publish reviewed articles. The headless site automatically renders published articles at:

- `/guides`
- `/guides/{handle}`
- Chinese equivalents under `/zh`

## Webhooks

Send Shopify product, collection and article/blog update webhooks to:

`https://hvacpacific.com/api/revalidate`

Configure the same secret in `SHOPIFY_WEBHOOK_SECRET`.

## Google Merchant Center

Primary custom feed:

`https://hvacpacific.com/feeds/google-merchant.xml`

The feed:
- uses the headless product URL, never the Shopify theme URL
- excludes refrigerant products requiring EPA 608 verification
- excludes products without images
- excludes HOLD / NEEDS DATA statuses
- includes brand, MPN when available, price, availability and product highlights

Shipping/delivery settings must also be configured accurately in Merchant Center or the connected Shopify Google channel. Do not advertise nationwide shipping if the store only offers local pickup/delivery.

Local inventory scaffold:

`https://hvacpacific.com/feeds/local-inventory.xml`

It stays disabled until `SITE.showroom`, the feature flag and Google store code are set.

## SEO / indexing

- Product, collection and guide pages are server rendered.
- Filter query URLs are `noindex,follow` and canonicalize to the clean category URL.
- Draft policy pages remain noindex until `reviewed: true` in `lib/static-pages.ts`.
- Chinese Shopify content that falls back unchanged to English is noindex until translated.
- Sitemap index: `/sitemap.xml`.
- Robots file references the sitemap and blocks cart/API/account/search-query crawling.

## Before launch

1. Fill production secrets.
2. Confirm the custom domain and Shopify checkout domain.
3. Publish at least one verified product and test category → PDP → cart → checkout.
4. Test EPA 608 and licensed-installation gates with flagged products.
5. Test lead delivery.
6. Validate Product structured data.
7. Add Merchant Center feed and resolve diagnostics.
8. Submit sitemap in Search Console.
9. Review draft legal/policy pages before marking them indexable.
10. Native-review Simplified Chinese copy before treating Chinese pages as final.


## Excel product import

The importer lives in `scripts/src/import-products.ts` and reads the exact `Units` and `Accessories` worksheets from the approved workbook.

Dry run is the default and performs **no Shopify writes**:

```bash
pnpm --filter @workspace/scripts import:products -- ../hvacpacific_product_list.xlsx
```

After reviewing the generated CSV report, apply the import explicitly:

```bash
pnpm --filter @workspace/scripts import:products -- ../hvacpacific_product_list.xlsx --apply
```

Additional apply-mode environment values:

- `SHOPIFY_HEADLESS_PUBLICATION_ID` — required before any ACTIVE row can be published to the headless channel.
- `SHOPIFY_LOCATION_ID` — required if accessory `qty` values should update Shopify inventory at a location.

Safety behavior:

- upsert lookup is by exact variant SKU (`listing_id` for Units, `sku` for Accessories)
- duplicate SKUs fail instead of guessing
- multi-option / multi-variant products are refused rather than destructively replaced
- a handle already owned by a different SKU is refused
- `DECIDE`, HOLD/NEEDS DATA, unknown statuses and missing prices remain DRAFT
- missing price is never invented
- controlled blank metafields are deleted so re-running the workbook is truly idempotent
- `efficiency_stated` is intentionally never mapped to public efficiency fields
- refrigerant rows receive the `pickup-only` tag and EPA 608 gate
- equipment categories receive the licensed-install acknowledgement gate
- collections are created/attached from `site_category` and `subcategory`
- every run writes a CSV report under `scripts/reports/`

The XLSX reader uses Python's standard library only, so there is no third-party spreadsheet parsing dependency in the production workspace.

## Catalog QA

Run catalog data checks against the live Storefront API:

```bash
pnpm --filter @workspace/scripts qa:catalog
```

Set `QA_SITE_URL=https://hvacpacific.com` to also check server-rendered PDP H1s, self-referencing canonicals, Product JSON-LD, and filtered-URL `noindex,follow` behavior.

The QA command fails non-zero for blocking issues such as:

- a published product without an image or valid price
- a published HOLD / NEEDS DATA product
- a unit missing its installer gate
- a refrigerant item missing its EPA 608 gate
- missing Product schema/canonical on a rendered PDP


## Source-backed Shopify guide drafts

Eight full guide drafts are stored in `scripts/src/guide-drafts.ts`. Each draft includes a short-answer block, table of contents, internal catalog links, and a source section using primary or manufacturer technical sources.

Preview the seeding plan without any Shopify writes:

```bash
pnpm --filter @workspace/scripts seed:guides
```

Sync the drafts to the Shopify `guides` blog:

```bash
pnpm --filter @workspace/scripts seed:guides -- --apply
```

The seeder creates the `guides` blog if necessary and creates or updates articles as **unpublished**. It will not overwrite an article that is already published, which protects reviewed live content from a later seed run.

Guide seeding requires Shopify Admin content permissions: `read_content` and `write_content` (or the equivalent Online Store page scopes supported by the installed app).

Before publishing a guide, review its current regulatory claims against the linked primary sources, add any needed product/category links, and perform editorial/legal review where appropriate.
