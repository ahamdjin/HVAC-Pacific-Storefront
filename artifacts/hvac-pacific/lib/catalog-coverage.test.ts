import assert from "node:assert/strict";
import { test } from "node:test";
import { getCatalogFacets, getProductKind, productMatchesSection } from "./catalog-config";
import { collectConnection } from "./shopify/pagination";
import { isVisibleCatalogProduct, type ProductCardData } from "./shopify/shared";

function product(overrides: Partial<ProductCardData> = {}): ProductCardData {
  return {
    id: "test-product", handle: "test-product", title: "Test product",
    description: "", vendor: "Test brand", productType: "", availableForSale: true,
    tags: [], metafields: [], variants: { nodes: [] },
    priceRange: { minVariantPrice: { amount: "100", currencyCode: "USD" }, maxVariantPrice: { amount: "100", currencyCode: "USD" } },
    ...overrides,
  };
}

test("catalog pagination retrieves every product beyond 250", async () => {
  const inventory = Array.from({ length: 321 }, (_, id) => ({ id }));
  let calls = 0;
  const result = await collectConnection(async (after) => {
    calls++;
    const start = Number(after ?? 0);
    const next = start + 50;
    return { nodes: inventory.slice(start, next), pageInfo: { hasNextPage: next < inventory.length, endCursor: String(next) } };
  });
  assert.equal(result.length, 321);
  assert.equal(new Set(result.map((item) => item.id)).size, 321);
  assert.equal(calls, 7);
});

test("explicit featured-product limit remains bounded", async () => {
  let calls = 0;
  const result = await collectConnection(async () => {
    calls++;
    return { nodes: Array.from({ length: 50 }, (_, id) => id), pageInfo: { hasNextPage: true, endCursor: "next" } };
  }, 12);
  assert.equal(result.length, 12);
  assert.equal(calls, 1);
});

test("broken pagination fails instead of silently truncating or looping", async () => {
  await assert.rejects(collectConnection(async () => ({
    nodes: [1], pageInfo: { hasNextPage: true, endCursor: null },
  })), /invalid catalog pagination/);
  await assert.rejects(collectConnection(async () => ({
    nodes: [1], pageInfo: { hasNextPage: true, endCursor: "repeated" },
  })), /invalid catalog pagination/);
});

test("merchant units collection overrides misleading parts keywords", () => {
  const equipment = product({
    title: "Heat pump with R454B refrigerant", productType: "Packaged Heat Pump",
    collections: { nodes: [{ id: "units", handle: "units", title: "Units" }] },
  });
  assert.equal(getProductKind(equipment), "units");
  assert.equal(productMatchesSection(equipment, "packaged-units"), true);
  assert.equal(productMatchesSection(equipment, "heat-pump-systems"), true);
});

test("merchant parts collection and exact collection membership are respected", () => {
  const part = product({
    title: "Replacement component",
    collections: { nodes: [
      { id: "accessories", handle: "accessories", title: "Accessories" },
      { id: "capacitors", handle: "capacitors", title: "Replacement components" },
    ] },
  });
  assert.equal(getProductKind(part), "parts");
  assert.equal(productMatchesSection(part, "capacitors"), true);
});

test("products with no category stay available to All products", () => {
  const unclassified = product();
  assert.equal(getProductKind(unclassified), null);
  assert.equal(isVisibleCatalogProduct(unclassified), true);
});

test("filters use supplied metadata, tags, and titles without invented specs", () => {
  const facets = getCatalogFacets(product({
    title: "Midea 2.5 Ton heat pump", tags: ["R454B"], productType: "Packaged Heat Pump",
  }));
  assert.equal(facets.tonnage, "2.5");
  assert.equal(facets.refrigerant, "R-454B");
  assert.equal(facets.system_type, "Packaged Heat Pump");
  const empty = getCatalogFacets(product());
  assert.equal(empty.tonnage, "");
  assert.equal(empty.refrigerant, "");
});

test("existing product hold policy remains enforced", () => {
  for (const value of ["HOLD", "NEEDS DATA"]) {
    assert.equal(isVisibleCatalogProduct(product({
      metafields: [{ namespace: "specs", key: "site_status", value, type: "single_line_text_field" }],
    })), false);
  }
});