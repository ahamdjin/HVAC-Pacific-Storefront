---
name: Shopify store choice
description: Distinguish the merchant's existing catalog from the empty Replit-provisioned Shopify store.
---

Verify the intended backend against a real product supplied by the merchant. Successful authentication to the Replit-provisioned store does not establish that it holds the merchant's catalog. Do not seed, migrate, or transfer products to resolve a connection mismatch.

**Why:** The user initially chose to keep the current connection, but subsequently supplied an existing merchant-store product URL. The connected store reported zero backend products and returned null for that product. The earlier confirmation was therefore not sufficient evidence of the correct catalog.

**How to apply:** Compare a supplied merchant product with the authenticated store before claiming the catalog is connected. Use an existing-store integration for merchant catalog access rather than provisioning another empty store. Treat importing or publishing products as separate work requiring explicit instruction.

For the buyer storefront, the user chose the existing merchant store's Headless credentials instead of authorizing the generic Admin integration, and subsequently supplied a private Storefront token for checkout.

**Why:** The user dismissed Admin integration setup and explicitly offered their existing Headless credentials. Buyer catalog, cart, and checkout access do not require an Admin token.

**How to apply:** Preserve this merchant Headless connection approach. Request tokens through the secure Secrets flow, never chat, and never write their values into project files. Private tokens stay server-only and must not use public-token authentication. For buyer-originated private cart requests, forward the validated buyer IP: Shopify documents that omitting it can cause unauthenticated checkout flows. Use the public token only when a private token is not configured, not as a silent fallback after private authentication fails.

The merchant's Shopify store is live, not a development/test store. Keep the normal live-store checkout flow.

**Why:** The user explicitly confirmed the store type when a checkout browser test reached Shopify's password page. A password-protected storefront does not imply a development store.

**How to apply:** Do not enable development-store preview parameters or disable store protection to bypass a checkout blocker. Recheck the real hosted checkout and report any remaining Shopify-side gate accurately.

The merchant reports more than 100 products in Shopify Admin. Storefront API results are not the merchant's total Admin inventory.

**Why:** The user corrected an earlier statement that treated the products exposed to the current Headless token as the full Shopify catalog. Shopify can publish different product sets to each named Headless storefront.

**How to apply:** Distinguish Admin product totals from the token's published, market-visible product set. Check raw API pagination and website exclusions, then inspect a missing product's status and publication to the exact named Headless storefront. Do not automatically activate or publish every Admin product.

Merchant publication changes must become visible through normal website visits without requiring code changes, another Replit publish, or a manual server restart.

**Why:** The merchant is releasing their existing inventory through Shopify and expects the website to reflect those availability changes. A long catalog cache can obscure successful publication and make the connection appear broken.

**How to apply:** Keep bounded freshness for both listings and product details, including previously missing products. Distinguish cache staleness from actual Headless publication restrictions; do not fill missing inventory with fabricated products.