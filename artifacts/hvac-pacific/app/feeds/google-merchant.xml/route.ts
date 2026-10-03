import { NextResponse } from "next/server";
import { SITE } from "@/config/site";
import { boolMeta, getAllProducts, metafieldMap, parseKeySpecs } from "@/lib/shopify/catalog";

function esc(v:unknown){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function plain(v:string){return v.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();}
export const revalidate=3600;

export async function GET(){
  const products=await getAllProducts("en");
  const eligible=products.filter(p=>{
    const m=metafieldMap(p);
    const status=(m.site_status||"").toUpperCase();
    return p.featuredImage && p.variants.nodes.length && !boolMeta(m.requires_epa608) && !["HOLD","NEEDS DATA"].includes(status);
  });
  const items=eligible.map(p=>{
    const m=metafieldMap(p);const v=p.variants.nodes.find(x=>x.availableForSale)??p.variants.nodes[0];
    const model=m.outdoor_model||m.indoor_model||m.furnace_model||v.sku||"";
    const isHouse=p.vendor.toLowerCase()===SITE.brand.toLowerCase();
    const bundle=[m.outdoor_model,m.indoor_model,m.furnace_model].filter(Boolean).length>1;
    const highlights=parseKeySpecs(m.key_specs).slice(0,10).map(x=>`<g:product_highlight>${esc(x.label+": "+x.value)}</g:product_highlight>`).join("");
    const productType=[m.site_category,m.subcategory].filter(Boolean).join(" > ");
    const description=plain(p.description)||[p.title,productType,m.refrigerant].filter(Boolean).join(" – ");
    return `<item>
<title>${esc((m.google_title||p.title).slice(0,150))}</title>
<description>${esc(description.slice(0,5000))}</description>
<link>${esc(SITE.domain+"/products/"+p.handle)}</link>
<g:id>${esc(v.sku||p.id)}</g:id>
<g:title>${esc((m.google_title||p.title).slice(0,150))}</g:title>
<g:description>${esc(description.slice(0,5000))}</g:description>
<g:link>${esc(SITE.domain+"/products/"+p.handle)}</g:link>
<g:image_link>${esc(p.featuredImage!.url)}</g:image_link>
<g:availability>${p.availableForSale?"in_stock":"out_of_stock"}</g:availability>
<g:price>${esc(Number(v.price.amount).toFixed(2)+" "+v.price.currencyCode)}</g:price>
<g:condition>new</g:condition>
<g:brand>${esc(p.vendor)}</g:brand>
${!isHouse&&model?`<g:mpn>${esc(model)}</g:mpn>`:""}
${isHouse&&!model?"<g:identifier_exists>no</g:identifier_exists>":""}
${bundle?"<g:is_bundle>yes</g:is_bundle>":""}
${productType?`<g:product_type>${esc(productType)}</g:product_type>`:""}
${highlights}
</item>`;
  }).join("");
  const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel><title>${esc(SITE.displayName)}</title><link>${SITE.domain}</link><description>HVAC equipment and parts</description>${items}</channel></rss>`;
  return new NextResponse(xml,{headers:{"Content-Type":"application/xml; charset=utf-8","Cache-Control":"public, s-maxage=3600, stale-while-revalidate=86400"}});
}