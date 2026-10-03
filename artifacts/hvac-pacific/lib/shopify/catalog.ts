import "server-only";
import { shopifyStorefrontRequest } from "./storefront";

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
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  seo: { title?: string | null; description?: string | null };
  metafields: Array<ShopifyMetafield | null>;
};

export type ArticleData = {
  id: string;
  handle: string;
  title: string;
  excerpt?: string | null;
  excerptHtml?: string | null;
  contentHtml: string;
  publishedAt: string;
  image?: ShopifyImage | null;
  seo: { title?: string | null; description?: string | null };
  tags: string[];
  authorV2?: { name: string } | null;
};

const PRODUCT_CARD_FIELDS = `
  id handle title description vendor productType availableForSale tags
  featuredImage { url altText width height }
  priceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }
  variants(first: 50) {
    nodes { id title availableForSale quantityAvailable price { amount currencyCode } sku selectedOptions { name value } }
  }
  metafields(identifiers: [
    {namespace:"specs", key:"site_status"},
    {namespace:"specs", key:"site_category"},
    {namespace:"specs", key:"subcategory"},
    {namespace:"specs", key:"tonnage"},
    {namespace:"specs", key:"btu"},
    {namespace:"specs", key:"system_type"},
    {namespace:"specs", key:"outdoor_model"},
    {namespace:"specs", key:"indoor_model"},
    {namespace:"specs", key:"furnace_model"},
    {namespace:"specs", key:"refrigerant"},
    {namespace:"specs", key:"ahri_number"},
    {namespace:"specs", key:"seer2"},
    {namespace:"specs", key:"eer2"},
    {namespace:"specs", key:"hspf2"},
    {namespace:"specs", key:"afue"},
    {namespace:"specs", key:"scaqmd_1111_compliant"},
    {namespace:"specs", key:"cec_listed"},
    {namespace:"specs", key:"requires_epa608"},
    {namespace:"specs", key:"requires_licensed_install"},
    {namespace:"specs", key:"three_phase"},
    {namespace:"specs", key:"prop65"},
    {namespace:"specs", key:"key_specs"},
    {namespace:"specs", key:"google_title"},
    {namespace:"specs", key:"spec_sheet_url"},
    {namespace:"specs", key:"manual_url"},
    {namespace:"specs", key:"sds_url"},
    {namespace:"specs", key:"faq"}
  ]) { namespace key value type }
`;

function language(locale: string) {
  return locale === "zh" ? "ZH_CN" : "EN";
}

export function metafieldMap(product: Pick<ProductCardData, "metafields">) {
  return Object.fromEntries(
    (product.metafields ?? [])
      .filter((m): m is ShopifyMetafield => Boolean(m))
      .map((m) => [m.key, m.value]),
  );
}

export function parseKeySpecs(value?: string) {
  if (!value) return [] as Array<{ label: string; value: string }>;
  return value
    .split(/;|\n/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const i = part.indexOf(":");
      return i > 0
        ? { label: part.slice(0, i).trim(), value: part.slice(i + 1).trim() }
        : { label: "Specification", value: part };
    });
}

export function parseFaq(value?: string) {
  if (!value) return [] as Array<{ q: string; a: string }>;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((x) => x && typeof x.q === "string" && typeof x.a === "string")
      : [];
  } catch {
    return [];
  }
}

export function boolMeta(value?: string) {
  return value === "true" || value === "1";
}

export async function getAllProducts(locale = "en", first = 250) {
  const query = `
    query Products($first:Int!, $language:LanguageCode!) @inContext(language:$language) {
      products(first:$first, sortKey:TITLE) { nodes { ${PRODUCT_CARD_FIELDS} } }
    }`;
  const data = await shopifyStorefrontRequest<{ products: { nodes: ProductCardData[] } }>(
    query,
    { first, language: language(locale) },
  );
  return data.products.nodes;
}

export async function getFeaturedProducts(locale = "en") {
  const query = `
    query Featured($language:LanguageCode!) @inContext(language:$language) {
      collection(handle:"featured") { products(first:8) { nodes { ${PRODUCT_CARD_FIELDS} } } }
    }`;
  const data = await shopifyStorefrontRequest<{ collection?: { products: { nodes: ProductCardData[] } } | null }>(
    query,
    { language: language(locale) },
  );
  if (data.collection?.products.nodes.length) return data.collection.products.nodes;
  return (await getAllProducts(locale, 12)).slice(0, 8);
}

export async function getProduct(handle: string, locale = "en") {
  const query = `
    query Product($handle:String!, $language:LanguageCode!) @inContext(language:$language) {
      product(handle:$handle) {
        ${PRODUCT_CARD_FIELDS}
        descriptionHtml
        seo { title description }
        images(first:12) { nodes { url altText width height } }
        options { name values }
      }
    }`;
  const data = await shopifyStorefrontRequest<{ product: ProductDetailData | null }>(
    query,
    { handle, language: language(locale) },
  );
  return data.product;
}

export async function getCollection(handle: string, locale = "en") {
  const query = `
    query Collection($handle:String!, $language:LanguageCode!) @inContext(language:$language) {
      collection(handle:$handle) {
        id handle title description descriptionHtml seo { title description }
        metafields(identifiers:[
          {namespace:"content",key:"guide_html"},
          {namespace:"content",key:"faq"}
        ]) { namespace key value type }
      }
    }`;
  const data = await shopifyStorefrontRequest<{ collection: CollectionData | null }>(
    query,
    { handle, language: language(locale) },
  );
  return data.collection;
}

export async function searchProducts(term: string, locale = "en") {
  if (!term.trim()) return [];
  const query = `
    query Search($query:String!, $language:LanguageCode!) @inContext(language:$language) {
      search(first:60, query:$query, types:[PRODUCT], unavailableProducts:HIDE) {
        nodes { ... on Product { ${PRODUCT_CARD_FIELDS} } }
      }
    }`;
  const data = await shopifyStorefrontRequest<{ search: { nodes: ProductCardData[] } }>(
    query,
    { query: term, language: language(locale) },
    { cache: "no-store", revalidate: 0 },
  );
  return data.search.nodes.filter(Boolean);
}

export async function getProductsByVendor(vendor: string, locale = "en") {
  const query = `
    query Vendor($query:String!, $language:LanguageCode!) @inContext(language:$language) {
      products(first:100, query:$query, sortKey:TITLE) { nodes { ${PRODUCT_CARD_FIELDS} } }
    }`;
  const data = await shopifyStorefrontRequest<{ products: { nodes: ProductCardData[] } }>(
    query,
    { query: `vendor:"${vendor.replace(/"/g, "\\\"")}"`, language: language(locale) },
  );
  return data.products.nodes;
}

export async function getGuideArticles(locale = "en", first = 50) {
  const query = `
    query Guides($first:Int!, $language:LanguageCode!) @inContext(language:$language) {
      blog(handle:"guides") {
        articles(first:$first, sortKey:PUBLISHED_AT, reverse:true) {
          nodes {
            id handle title excerpt excerptHtml contentHtml publishedAt tags
            image { url altText width height }
            seo { title description }
            authorV2 { name }
          }
        }
      }
    }`;
  const data = await shopifyStorefrontRequest<{ blog: { articles: { nodes: ArticleData[] } } | null }>(
    query,
    { first, language: language(locale) },
  );
  return data.blog?.articles.nodes ?? [];
}

export async function getGuideArticle(handle: string, locale = "en") {
  const query = `
    query Guide($handle:String!, $language:LanguageCode!) @inContext(language:$language) {
      blog(handle:"guides") {
        articleByHandle(handle:$handle) {
          id handle title excerpt excerptHtml contentHtml publishedAt tags
          image { url altText width height }
          seo { title description }
          authorV2 { name }
        }
      }
    }`;
  const data = await shopifyStorefrontRequest<{ blog: { articleByHandle: ArticleData | null } | null }>(
    query,
    { handle, language: language(locale) },
  );
  return data.blog?.articleByHandle ?? null;
}

export async function getProductRecommendations(productId: string, locale = "en") {
  const query = `
    query Recs($id:ID!, $language:LanguageCode!) @inContext(language:$language) {
      productRecommendations(productId:$id) { ${PRODUCT_CARD_FIELDS} }
    }`;
  const data = await shopifyStorefrontRequest<{ productRecommendations: ProductCardData[] }>(
    query,
    { id: productId, language: language(locale) },
  );
  return data.productRecommendations ?? [];
}
