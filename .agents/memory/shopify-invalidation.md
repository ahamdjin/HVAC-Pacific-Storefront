---
name: Shopify invalidation tradeoff
description: Why catalog notifications intentionally expire more than a single product.
---

Prefer catalog-wide expiration across languages over introducing inventory-to-product mappings or additional Admin lookups solely for targeted invalidation.

**Why:** Inventory-level notifications identify an inventory item and location, not a product handle. Product handle changes, deletion, recommendations, and collection membership also affect results beyond a single detail URL. For this storefront, correctness on the first subsequent visit is more important than preserving every warm cache entry.

**How to apply:** Keep webhook processing independent of Admin credentials and product publishing. If catalog volume eventually justifies targeted expiration, first establish a reliable mapping and cover old handles, collection membership, recommendations, and both languages; do not narrow invalidation based only on the webhook's current handle.