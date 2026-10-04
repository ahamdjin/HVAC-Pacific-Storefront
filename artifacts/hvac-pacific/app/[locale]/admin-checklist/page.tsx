import { notFound } from "next/navigation";

const checks=[
  ["Shopify store domain","SHOPIFY_STORE_DOMAIN"],
  ["Storefront token","SHOPIFY_STOREFRONT_TOKEN"],
  ["Admin token","SHOPIFY_ADMIN_TOKEN"],
  ["Headless publication ID","SHOPIFY_HEADLESS_PUBLICATION_ID"],
  ["Inventory location ID","SHOPIFY_LOCATION_ID"],
  ["Shopify webhook secret","SHOPIFY_WEBHOOK_SECRET"],
  ["Lead webhook","LEAD_WEBHOOK_URL"],
  ["GA4 measurement ID","GA4_ID"],
  ["Search Console verification","GSC_VERIFICATION"],
  ["Merchant verification","MERCHANT_VERIFICATION"],
  ["Merchant local delivery ZIPs","MERCHANT_LOCAL_DELIVERY_ZIP_CODES"],
  ["Merchant local delivery price","MERCHANT_LOCAL_DELIVERY_PRICE"],
  ["Google local store code","GOOGLE_LOCAL_STORE_CODE"],
] as const;

const scopes=[
  "read_products",
  "write_products",
  "write_inventory",
  "read_locations",
  "write_publications",
  "read_content",
  "write_content",
  "read_translations",
  "write_translations",
];

export default function Page(){
  if(process.env.NODE_ENV==="production")notFound();
  return <main className="wrap page-shell">
    <header className="page-head"><h1>Shopify launch checklist</h1><p>This page is available only in development and never exposes secret values.</p></header>
    <div className="checklist">{checks.map(([label,key])=><div key={key}><span>{process.env[key]?"✓":"○"}</span><strong>{label}</strong><code>{key}</code></div>)}</div>
    <section className="policy-content">
      <h2>Shopify app scopes</h2>
      <p>Confirm the custom Admin app has the scopes required by the importer, guide seeder, inventory updates, publication control and translations:</p>
      <p><code>{scopes.join(", ")}</code></p>
      <h2>Shopify admin setup</h2>
      <p>Enable the Headless sales channel and Storefront API content/product access. Publish only verified products to the headless channel.</p>
      <p>Create the specs metafields described in the project brief with Storefront access enabled. Optional Merchant override: <code>specs.google_product_category</code>.</p>
      <p>Configure local pickup/local delivery, Shopify Tax, and the Google & YouTube sales channel or use the custom Merchant feed.</p>
      <p>Keep the Shopify Online Store password-protected or redirected to the headless domain to avoid duplicate indexable product pages.</p>
      <h2>Google Merchant Center</h2>
      <p>Use account-level shipping settings unless the exact local delivery ZIP codes and price are configured in the environment. The feed will not invent shipping coverage or cost.</p>
      <p>Leave Google product category blank unless an accurate taxonomy ID/path has been supplied; Google can automatically categorize products.</p>
      <h2>Chinese launch</h2>
      <p>Keep <code>ZH_TRANSLATIONS_REVIEWED</code> unset until a native review confirms the UI plus Shopify product, collection, guide and policy translations.</p>
    </section>
  </main>;
}
