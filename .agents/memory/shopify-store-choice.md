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