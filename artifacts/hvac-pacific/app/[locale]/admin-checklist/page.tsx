import { notFound } from "next/navigation";

const checks=[
  ["Shopify store domain","SHOPIFY_STORE_DOMAIN"],
  ["Storefront token","SHOPIFY_STOREFRONT_TOKEN"],
  ["Admin token (imports only)","SHOPIFY_ADMIN_TOKEN"],
  ["Shopify webhook secret","SHOPIFY_WEBHOOK_SECRET"],
  ["Lead webhook","LEAD_WEBHOOK_URL"],
  ["GA4 measurement ID","GA4_ID"],
  ["Search Console verification","GSC_VERIFICATION"],
  ["Merchant verification","MERCHANT_VERIFICATION"],
] as const;

export default function Page(){
  if(process.env.NODE_ENV==="production")notFound();
  return <main className="wrap page-shell"><header className="page-head"><h1>Shopify launch checklist</h1><p>This page is available only in development and never exposes secret values.</p></header><div className="checklist">{checks.map(([label,key])=><div key={key}><span>{process.env[key]?"✓":"○"}</span><strong>{label}</strong><code>{key}</code></div>)}</div><section className="policy-content"><h2>Shopify admin setup</h2><p>Enable the Headless sales channel and Storefront API content/product access. Publish only verified products to the headless channel.</p><p>Create the specs metafields described in the project brief with Storefront access enabled. Configure local pickup/local delivery, Shopify Tax, and the Google & YouTube sales channel or use the custom Merchant feed.</p><p>Keep the Shopify Online Store password-protected or redirected to the headless domain to avoid duplicate indexable product pages.</p></section></main>;
}