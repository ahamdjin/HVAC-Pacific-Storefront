// Production Next.js cache test with a local fake Shopify upstream. No merchant
// writes, credentials, workflow restart, or live webhook subscription required.
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { cp, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createRequire } from "node:module";

const root = resolve(import.meta.dirname, "../..");
const app = resolve(root, "artifacts/hvac-pacific");
const require = createRequire(resolve(app, "package.json"));
const nextBin = require.resolve("next/dist/bin/next");
const secret = "local-test-only-signing-key";
let revision = 1;
let upstreamReads = 0;
const upstream = createServer(async (req, res) => {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  const { query, variables } = JSON.parse(raw);
  upstreamReads++;
  const money = { amount: `${revision}00.00`, currencyCode: "USD" };
  const product = {
    id: "gid://shopify/Product/1", handle: "test-unit",
    title: `${variables.language}-${revision}`, description: "", vendor: "Fixture",
    productType: "Unit", tags: [], availableForSale: revision % 2 === 1,
    priceRange: { minVariantPrice: money, maxVariantPrice: money },
    variants: { nodes: [{ id: "gid://shopify/ProductVariant/1", title: "Default",
      availableForSale: revision % 2 === 1, price: money, sku: "TEST", selectedOptions: [] }] },
    collections: { nodes: [{ id: "gid://shopify/Collection/1", handle: "units", title: `Units-${revision}` }] },
    metafields: [], images: { nodes: [] }, options: [], seo: {}, descriptionHtml: "",
  };
  const connection = { nodes: [product], pageInfo: { hasNextPage: !variables.after, endCursor: variables.after ? null : "page-2" } };
  let data;
  if (query.includes("query Products")) data = { products: connection };
  else if (query.includes("query Featured")) data = { collection: { products: { nodes: [product] } } };
  else if (query.includes("query Product(")) data = { product };
  else if (query.includes("query Collection")) data = { collection: { id: "gid://shopify/Collection/1", handle: "units", title: `Units-${revision}`, metafields: [] } };
  else if (query.includes("query Search")) data = { search: connection };
  else if (query.includes("query Recs")) data = { complementary: [product], related: [] };
  else throw new Error("Unexpected fixture query");
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ data }));
});
upstream.listen(0, "127.0.0.1");
await once(upstream, "listening");
await mkdir(resolve(app, "tmp"), { recursive: true });
const fixture = await mkdtemp(resolve(app, "tmp/webhook-cache-"));
let server;
let logs = "";
try {
  await cp(resolve(app, "lib/shopify"), resolve(fixture, "lib/shopify"), { recursive: true });
  await mkdir(resolve(fixture, "app/api/revalidate"), { recursive: true });
  await cp(resolve(app, "app/api/revalidate/route.ts"), resolve(fixture, "app/api/revalidate/route.ts"));
  await writeFile(resolve(fixture, "package.json"), '{"private":true}');
  await writeFile(resolve(fixture, "next.config.mjs"), "export default {experimental:{cpus:1}};");
  await writeFile(resolve(fixture, "app/layout.tsx"), 'export default function Layout({children}) {return <html><body>{children}</body></html>}');
  await mkdir(resolve(fixture, "app/[locale]"), { recursive: true });
  await writeFile(resolve(fixture, "app/[locale]/page.tsx"), `
    import {getAllProducts,getFeaturedProducts,getProduct,getCollection,searchProducts,getProductsByVendor,getProductRecommendations} from "../../lib/shopify/catalog";
    export const revalidate=60;
    export function generateStaticParams(){return [{locale:"en"},{locale:"zh"}]}
    export default async function Page({params}){
      const {locale}=await params;
      const [all,featured,detail,collection,vendor,recs]=await Promise.all([
        getAllProducts(locale),getFeaturedProducts(locale),getProduct("test-unit",locale),
        getCollection("units",locale),getProductsByVendor("Fixture",locale),
        getProductRecommendations("gid://shopify/Product/1",locale)]);
      return <pre>{JSON.stringify({all,featured,detail,collection,vendor,recs})}</pre>;
    }`);
  // Dynamic search still merges a cached catalog for SKU/synonym matches.
  await mkdir(resolve(fixture, "app/[locale]/search"), { recursive: true });
  await writeFile(resolve(fixture, "app/[locale]/search/page.tsx"), `
    import {searchProducts} from "../../../lib/shopify/catalog";
    export default async function Page({params,searchParams}){
      const {locale}=await params; const {q}=await searchParams;
      return <pre>{JSON.stringify(await searchProducts(q,locale))}</pre>;
    }`);
  await writeFile(resolve(fixture, "fetch-fixture.cjs"), `
    const original=global.fetch;
    global.fetch=(input,init)=>{
      const url=typeof input==="string"?input:input.url||String(input);
      if(url.startsWith("https://fixture.myshopify.com/")){
        const redirected="http://127.0.0.1:${upstream.address().port}/graphql";
        input=input instanceof Request?new Request(redirected,input):redirected;
      }
      return original(input,init);
    };`);
  const env = {
    ...process.env, NODE_ENV: "production", SHOPIFY_MOCK_BUILD: "false",
    SHOPIFY_WEBHOOK_SECRET: secret, SHOPIFY_STORE_DOMAIN: "fixture.myshopify.com",
    SHOPIFY_STOREFRONT_AUTH_MODE: "private", SHOPIFY_STOREFRONT_PRIVATE_TOKEN: "fixture-token",
    NODE_OPTIONS: `--require ${resolve(fixture, "fetch-fixture.cjs")}`,
  };
  const build = spawn(process.execPath, [nextBin, "build", fixture, "--webpack"], { cwd: fixture, env });
  build.stdout.on("data", (chunk) => { logs += chunk; });
  build.stderr.on("data", (chunk) => { logs += chunk; });
  assert.equal((await once(build, "exit"))[0], 0, logs);
  // Reserve an unused local port; this is an isolated test, not a workflow.
  const socket = createServer();
  socket.listen(0, "127.0.0.1");
  await once(socket, "listening");
  const port = socket.address().port;
  await new Promise((done) => socket.close(done));
  server = spawn(process.execPath, [nextBin, "start", fixture, "--hostname", "127.0.0.1", "--port", String(port)], { cwd: fixture, env });
  server.stdout.on("data", (chunk) => { logs += chunk; });
  server.stderr.on("data", (chunk) => { logs += chunk; });
  const base = `http://127.0.0.1:${port}`;
  async function page(locale, search = false) {
    const response = await fetch(`${base}/${locale}${search ? "/search?q=test" : ""}`);
    assert.equal(response.status, 200, logs);
    const html = await response.text();
    return JSON.parse(html.match(/<pre>(.*?)<\/pre>/s)[1].replaceAll("&quot;", '"').replaceAll("&amp;", "&"));
  }
  for (let attempt = 0; attempt < 100; attempt++) {
    try { await fetch(base); break; } catch { await new Promise((done) => setTimeout(done, 100)); }
  }
  async function notify(topic, body, signature = createHmac("sha256", secret).update(body).digest("base64")) {
    return fetch(`${base}/api/revalidate`, { method: "POST", body, headers: {
      "x-shopify-topic": topic, ...(signature === null ? {} : { "x-shopify-hmac-sha256": signature }),
    } });
  }
  function check(data, locale, rev) {
    for (const product of [...data.all, ...data.featured, data.detail, ...data.vendor, ...data.recs]) {
      assert.equal(product.priceRange.minVariantPrice.amount, `${rev}00.00`);
      assert.equal(product.availableForSale, rev % 2 === 1);
      assert.equal(product.title, `${locale === "zh" ? "ZH_CN" : "EN"}-${rev}`);
    }
    assert.equal(data.collection.title, `Units-${rev}`);
  }
  for (const locale of ["en", "zh"]) check(await page(locale), locale, 1);
  const warmReads = upstreamReads;
  revision = 2;
  for (const [topic, body, signature, status] of [
    ["products/update", '{"id":1}', null, 401],
    ["products/update", '{"id":1}', "invalid", 401],
    ["products/update", '{"id":1}', createHmac("sha256", "wrong-key").update('{"id":1}').digest("base64"), 401],
    ["products/update", "{", undefined, 400],
    ["products/update", "null", undefined, 400],
    ["products/update", "[]", undefined, 400],
    ["products/update", "{}", undefined, 400],
    ["inventory_levels/update", '{"inventory_item_id":1}', undefined, 400],
    ["products/not-a-topic", '{"id":1}', undefined, 400],
  ]) assert.equal((await notify(topic, body, signature)).status, status);
  for (const locale of ["en", "zh"]) check(await page(locale), locale, 1);
  assert.equal(upstreamReads, warmReads, "Rejected requests must not invalidate caches");
  for (const topic of ["products/update", "collections/update", "inventory_levels/update", "inventory_items/update", "products/delete"]) {
    const payload = topic.startsWith("inventory_levels/") ? '{"inventory_item_id":1,"location_id":2}' : '{"id":1}';
    assert.equal((await notify(topic, payload)).status, 200);
    for (const locale of ["en", "zh"]) {
      check(await page(locale), locale, revision);
      for (const product of await page(locale, true)) {
        assert.equal(product.priceRange.minVariantPrice.amount, `${revision}00.00`);
        assert.equal(product.availableForSale, revision % 2 === 1);
      }
    }
    revision++;
  }
  console.log("PASS: unsigned/malformed requests leave caches intact; signed product, collection, inventory and delete notifications refresh first reads, pagination, details, recommendations, vendor and search data in EN and ZH without restarting Next.js.");
} finally {
  if (server && server.exitCode === null) {
    server.kill("SIGTERM");
    await once(server, "exit");
  }
  await new Promise((done) => upstream.close(done));
  await rm(fixture, { recursive: true, force: true });
}