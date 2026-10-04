export type Money = { amount: string; currencyCode: string };
export type ShopifyImage = { url: string; altText?: string | null; width?: number | null; height?: number | null };
export type ShopifyMetafield = { namespace: string; key: string; value: string; type: string };

export type ProductCardData = {
  id: string;
  handle: string;
  title: string;
  description: string;
  vendor: string;
  productType: string;
  availableForSale: boolean;
  tags: string[];
  collections?: { nodes: Array<{ id: string; handle: string; title: string }> };
  featuredImage?: ShopifyImage | null;
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money };
  variants: { nodes: Array<{ id: string; title: string; availableForSale: boolean; quantityAvailable?: number | null; price: Money; sku?: string | null; selectedOptions: Array<{ name: string; value: string }> }> };
  metafields: Array<ShopifyMetafield | null>;
};

export type ProductDetailData = ProductCardData & {
  descriptionHtml: string;
  seo: { title?: string | null; description?: string | null };
  images: { nodes: ShopifyImage[] };
  options: Array<{ name: string; values: string[] }>;
};

export type CollectionData = {
  id: string; handle: string; title: string; description: string; descriptionHtml: string;
  seo: { title?: string | null; description?: string | null };
  metafields: Array<ShopifyMetafield | null>;
};

export type ArticleData = {
  id: string; handle: string; title: string; excerpt?: string | null; excerptHtml?: string | null;
  contentHtml: string; publishedAt: string; image?: ShopifyImage | null;
  seo: { title?: string | null; description?: string | null }; tags: string[]; authorV2?: { name: string } | null;
};

export function metafieldMap(product: Pick<ProductCardData, "metafields">) {
  return Object.fromEntries((product.metafields ?? []).filter((m): m is ShopifyMetafield => Boolean(m)).map((m) => [m.key, m.value]));
}
export function parseKeySpecs(value?: string) {
  if (!value) return [] as Array<{ label: string; value: string }>;
  return value.split(/;|\n/).map((part) => part.trim()).filter(Boolean).map((part) => {
    const i = part.indexOf(":");
    return i > 0 ? { label: part.slice(0, i).trim(), value: part.slice(i + 1).trim() } : { label: "Specification", value: part };
  });
}
export function parseFaq(value?: string) {
  if (!value) return [] as Array<{ q: string; a: string }>;
  try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed.filter((x) => x && typeof x.q === "string" && typeof x.a === "string") : []; }
  catch { return []; }
}
export function boolMeta(value?: string) { return value === "true" || value === "1"; }


export function isBlockedCatalogProduct(product: Pick<ProductCardData, "metafields">) {
  const status = (metafieldMap(product).site_status || "").trim().toUpperCase();
  return status === "HOLD" || status === "NEEDS DATA";
}

export function isVisibleCatalogProduct(product: Pick<ProductCardData, "metafields">) {
  return !isBlockedCatalogProduct(product);
}
