import "server-only";
import { shopifyStorefrontRequest } from "./storefront";
import { collectConnection, type ShopifyConnection } from "./pagination";
import { SHOPIFY_CATALOG_TAG, SHOPIFY_GUIDES_TAG } from "./cache";

import { isVisibleCatalogProduct } from "./shared";
import type { ArticleData, CollectionData, ProductCardData, ProductDetailData } from "./shared";
export type { ArticleData, CollectionData, ProductCardData, ProductDetailData } from "./shared";
export { boolMeta, isBlockedCatalogProduct, isVisibleCatalogProduct, metafieldMap, parseFaq, parseKeySpecs } from "./shared";

const PRODUCT_CARD_FIELDS = `
  id handle title description vendor productType availableForSale tags
  collections(first:250) { nodes { id handle title } }
  featuredImage { url altText width height }
  priceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }
  variants(first: 50) {
    nodes { id title availableForSale price { amount currencyCode } sku selectedOptions { name value } }
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
    {namespace:"specs", key:"google_product_category"},
    {namespace:"specs", key:"search_keywords"},
    {namespace:"specs", key:"spec_sheet_url"},
    {namespace:"specs", key:"manual_url"},
    {namespace:"specs", key:"sds_url"},
    {namespace:"specs", key:"faq"},
    {namespace:"content", key:"manufacturer_resources"}
  ]) { namespace key value type }
`;

function language(locale: string) {
  return locale === "zh" ? "ZH_CN" : "EN";
}

function mockBuild() {
  return process.env.SHOPIFY_MOCK_BUILD === "true";
}

export async function getAllProducts(locale = "en", limit?: number) {
  if (mockBuild()) return [] as ProductCardData[];
  if (limit !== undefined && (!Number.isInteger(limit) || limit < 1)) return [] as ProductCardData[];
  const query = `
    query Products($first:Int!, $after:String, $language:LanguageCode!) @inContext(language:$language) {
      products(first:$first, after:$after, sortKey:TITLE) {
        nodes { ${PRODUCT_CARD_FIELDS} }
        pageInfo { hasNextPage endCursor }
      }
    }`;
  const nodes = await collectConnection(async (after) => {
    const data = await shopifyStorefrontRequest<{ products: ShopifyConnection<ProductCardData> }>(
      query, { first: Math.min(limit ?? 50, 50), after, language: language(locale) },
      { revalidate: 60, tags: [SHOPIFY_CATALOG_TAG] },
    );
    return data.products;
  }, limit);
  return Array.from(new Map(nodes.filter(isVisibleCatalogProduct).map((p) => [p.id, p])).values());
}

export async function getFeaturedProducts(locale = "en") {
  if (mockBuild()) return [] as ProductCardData[];
  const query = `
    query Featured($language:LanguageCode!) @inContext(language:$language) {
      collection(handle:"featured") { products(first:8) { nodes { ${PRODUCT_CARD_FIELDS} } } }
    }`;
  const data = await shopifyStorefrontRequest<{ collection?: { products: { nodes: ProductCardData[] } } | null }>(
    query,
    { language: language(locale) },
    { revalidate: 60, tags: [SHOPIFY_CATALOG_TAG] },
  );
  const featured = data.collection?.products.nodes.filter(isVisibleCatalogProduct) ?? [];
  return featured;
}

export async function getProduct(handle: string, locale = "en") {
  if (mockBuild()) return null;
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
    { revalidate: 60, tags: [SHOPIFY_CATALOG_TAG] },
  );
  return data.product && isVisibleCatalogProduct(data.product) ? data.product : null;
}

export async function getCollection(handle: string, locale = "en") {
  if (mockBuild()) return null;
  const query = `
    query Collection($handle:String!, $language:LanguageCode!) @inContext(language:$language) {
      collection(handle:$handle) {
        id handle title description descriptionHtml seo { title description }
        metafields(identifiers:[
          {namespace:"content",key:"guide_html"},
          {namespace:"content",key:"sizing_table_html"},
          {namespace:"content",key:"faq"}
        ]) { namespace key value type }
      }
    }`;
  const data = await shopifyStorefrontRequest<{ collection: CollectionData | null }>(
    query,
    { handle, language: language(locale) },
    { revalidate: 60, tags: [SHOPIFY_CATALOG_TAG] },
  );
  return data.collection;
}

export async function searchProducts(term: string, locale = "en") {
  if (mockBuild()) return [] as ProductCardData[];
  const clean = term.trim();
  if (!clean) return [];
  const query = `
    query Search($query:String!, $after:String, $language:LanguageCode!) @inContext(language:$language) {
      search(first:50, after:$after, query:$query, types:[PRODUCT], unavailableProducts:SHOW) {
        nodes { ... on Product { ${PRODUCT_CARD_FIELDS} } }
        pageInfo { hasNextPage endCursor }
      }
    }`;
  const [searchNodes, all] = await Promise.all([
    collectConnection(async (after) => {
      const data = await shopifyStorefrontRequest<{ search: ShopifyConnection<ProductCardData> }>(
        query, { query: clean, after, language: language(locale) },
        { cache: "no-store", revalidate: 0 },
      );
      return data.search;
    }),
    getAllProducts(locale),
  ]);
  const native = searchNodes.filter(Boolean).filter(isVisibleCatalogProduct);
  const needle = clean.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const synonymMatches = all.filter((product) => {
    const m = Object.fromEntries((product.metafields ?? []).filter(Boolean).map((x) => [x!.key, x!.value]));
    const haystack = [
      product.title,
      product.vendor,
      product.productType,
      ...product.tags,
      ...(product.collections?.nodes ?? []).map((collection) => collection.title),
      m.search_keywords,
      m.outdoor_model,
      m.indoor_model,
      m.furnace_model,
      ...product.variants.nodes.map((v) => v.sku ?? ""),
    ].join(" ").toLowerCase().replace(/[^a-z0-9]+/g, " ");
    return needle.length >= 2 && haystack.includes(needle);
  });
  return Array.from(new Map([...native, ...synonymMatches].map((product) => [product.id, product])).values());
}

export async function getProductsByVendor(vendor: string, locale = "en") {
  return (await getAllProducts(locale)).filter((p) => p.vendor.toLowerCase() === vendor.toLowerCase());
}

export async function getGuideArticles(locale = "en", first = 50) {
  if (mockBuild()) return [] as ArticleData[];
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
    { tags: [SHOPIFY_GUIDES_TAG] },
  );
  return data.blog?.articles.nodes ?? [];
}

export async function getGuideArticle(handle: string, locale = "en") {
  if (mockBuild()) return null;
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
    { tags: [SHOPIFY_GUIDES_TAG] },
  );
  return data.blog?.articleByHandle ?? null;
}

export async function getProductRecommendations(productId: string, locale = "en") {
  if (mockBuild()) return [] as ProductCardData[];
  const query = `
    query Recs($id:ID!, $language:LanguageCode!) @inContext(language:$language) {
      complementary: productRecommendations(productId:$id, intent:COMPLEMENTARY) { ${PRODUCT_CARD_FIELDS} }
      related: productRecommendations(productId:$id, intent:RELATED) { ${PRODUCT_CARD_FIELDS} }
    }`;
  const data = await shopifyStorefrontRequest<{ complementary: ProductCardData[]; related: ProductCardData[] }>(
    query,
    { id: productId, language: language(locale) },
    { tags: [SHOPIFY_CATALOG_TAG] },
  );
  const recommendations = data.complementary?.length ? data.complementary : (data.related ?? []);
  return recommendations.filter(isVisibleCatalogProduct);
}
