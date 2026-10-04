import assert from "node:assert/strict";
import http from "node:http";

const base = (process.env.QA_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

async function get(path: string) {
  const response = await fetch(base + path, { redirect: "manual" });
  const text = await response.text();
  return { response, text };
}

function hasNoindexFollow(html: string) {
  return /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex\s*,?\s*follow[^"']*["']/i.test(html)
    || /<meta[^>]+content=["'][^"']*noindex\s*,?\s*follow[^"']*["'][^>]+name=["']robots["']/i.test(html);
}

function requestWithHost(path: string, host: string) {
  return new Promise<{ status: number; location?: string }>((resolve, reject) => {
    const url = new URL(base);
    const request = http.request({
      hostname: url.hostname,
      port: url.port || 80,
      path,
      method: "GET",
      headers: { Host: host },
    }, (response) => {
      response.resume();
      resolve({
        status: response.statusCode || 0,
        location: response.headers.location,
      });
    });
    request.on("error", reject);
    request.end();
  });
}

function assertNoFakeTrust(html:string,label:string){
  assert.doesNotMatch(html, /"@type":"AggregateRating"|"@type":"Review"/i, label+" should not contain review/rating schema.");
  const visible=html.replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/\s+/g," ").toLowerCase();
  for(const phrase of ["best price guaranteed","authorized dealer","#1 hvac","countdown timer","customer testimonials"]){
    assert.ok(!visible.includes(phrase), label+" contains prohibited trust claim: "+phrase);
  }
}

const home = await get("/");
assert.equal(home.response.status, 200);
assertNoFakeTrust(home.text,"Home");
assert.match(home.text, /HVAC Equipment &amp; Parts for Southern California|HVAC Equipment & Parts for Southern California/);
assert.doesNotMatch(
  home.text,
  /<link[^>]+rel=["']alternate["'][^>]+hreflang=["']zh-Hans["']/i,
  "Unreviewed Chinese content should not be advertised as hreflang.",
);

const robots = await get("/robots.txt");
assert.equal(robots.response.status, 200);
assert.match(robots.text, /Sitemap:\s*https:\/\/hvacpacific\.com\/sitemap\.xml/i);
assert.match(robots.text, /Disallow:\s*\/api\//i);

const sitemap = await get("/sitemap.xml");
assert.equal(sitemap.response.status, 200);
assert.match(sitemap.response.headers.get("content-type") || "", /xml/i);
assert.match(sitemap.text, /\/sitemaps\/en\/products\.xml/);
assert.doesNotMatch(sitemap.text, /\/sitemaps\/zh\//, "Unreviewed Chinese URLs should not be in the sitemap index.");

const units = await get("/units");
assert.equal(units.response.status, 200);
assertNoFakeTrust(units.text,"Units");

const filtered = await get("/units?brand=qa-test");
assert.equal(filtered.response.status, 200);
assert.ok(hasNoindexFollow(filtered.text), "Filtered category URLs must be noindex,follow.");

const draftPolicy = await get("/shipping-returns");
assert.equal(draftPolicy.response.status, 200);
assert.ok(hasNoindexFollow(draftPolicy.text), "Unreviewed policy pages must be noindex,follow.");

const chinese = await get("/zh");
assert.equal(chinese.response.status, 200);
assert.ok(hasNoindexFollow(chinese.text), "Chinese pages must remain noindex until native review is enabled.");

const missingProduct = await get("/products/qa-product-does-not-exist");
assert.equal(missingProduct.response.status, 404);

const merchant = await get("/feeds/google-merchant.xml");
assert.equal(merchant.response.status, 200);
assert.match(merchant.text, /xmlns:g="http:\/\/base\.google\.com\/ns\/1\.0"/);

const localInventory = await get("/feeds/local-inventory.xml");
assert.equal(localInventory.response.status, 404);

const www = await requestWithHost("/", "www.hvacpacific.com");
assert.equal(www.status, 301);
assert.equal(www.location, "https://hvacpacific.com/");

console.log("Production storefront smoke tests passed.");
