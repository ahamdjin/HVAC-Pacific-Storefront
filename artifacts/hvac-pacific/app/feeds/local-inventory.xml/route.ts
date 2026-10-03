import { NextResponse } from "next/server";
import { SITE } from "@/config/site";
import { getAllProducts } from "@/lib/shopify/catalog";

function esc(v:unknown){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
export const revalidate=3600;
export async function GET(){
  if(process.env.ENABLE_LOCAL_INVENTORY_FEED!=="true"||!SITE.showroom)return new NextResponse("Local inventory feed is disabled until a showroom is configured.",{status:404});
  const products=await getAllProducts("en");
  const storeCode=process.env.GOOGLE_LOCAL_STORE_CODE;
  if(!storeCode)return new NextResponse("Missing store code.",{status:503});
  const rows=products.filter(p=>p.featuredImage).map(p=>{const v=p.variants.nodes.find(x=>x.availableForSale)??p.variants.nodes[0];return v?`<item><g:store_code>${esc(storeCode)}</g:store_code><g:id>${esc(v.sku||p.id)}</g:id><g:availability>${p.availableForSale?"in_stock":"out_of_stock"}</g:availability><g:price>${esc(Number(v.price.amount).toFixed(2)+" "+v.price.currencyCode)}</g:price></item>`:"";}).join("");
  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel>${rows}</channel></rss>`,{headers:{"Content-Type":"application/xml; charset=utf-8"}});
}