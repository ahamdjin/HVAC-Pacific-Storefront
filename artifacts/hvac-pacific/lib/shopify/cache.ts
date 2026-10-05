// Shared across languages and query shapes, including every pagination cursor.
// Inventory notifications do not carry product handles; handle changes and
// collection membership changes can also affect more than one detail page.
export const SHOPIFY_CATALOG_TAG = "shopify:catalog";
export const SHOPIFY_GUIDES_TAG = "shopify:guides";

export const CATALOG_PAGE_PATTERNS = [
  "/[locale]",
  "/[locale]/units/[[...slug]]",
  "/[locale]/parts/[[...slug]]",
  "/[locale]/products/[handle]",
  "/[locale]/brands",
  "/[locale]/brands/[brand]",
  "/[locale]/search",
  "/[locale]/[...slug]",
];

export const GUIDE_PAGE_PATTERNS = [
  "/[locale]",
  "/[locale]/guides",
  "/[locale]/guides/[handle]",
];