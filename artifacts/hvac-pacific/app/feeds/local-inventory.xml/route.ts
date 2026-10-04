import { NextResponse } from "next/server";
import { SITE } from "@/config/site";
import { boolMeta, getAllProducts, metafieldMap } from "@/lib/shopify/catalog";

function esc(v:unknown){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
export const revalidate=3600;

export async function GET(){
  if(process.env.ENABLE_LOCAL_INVENTORY_FEED!=="true"||!SITE.showroom){
    return new NextResponse("Local inventory feed is disabled until a showroom is configured.",{status:404});
  }
  const storeCode=process.env.GOOGLE_LOCAL_STORE_CODE?.trim();
  if(!storeCode)return new NextResponse("Missing store code.",{status:503});

  const products=(await getAllProducts("en")).filter((product)=>{
    const m=metafieldMap(product);
    const status=(m.site_status||"").trim().toUpperCase();
    const price=Number(product.priceRange.minVariantPrice.amount);
    return product.featuredImage
      && product.variants.nodes.length>0
      && Number.isFinite(price)
      && price>0
      && !boolMeta(m.requires_epa608)
      && !["HOLD","NEEDS DATA"].includes(status);
  });

  const rows=products.map((product)=>{
    const variant=product.variants.nodes.find((item)=>item.availableForSale)??product.variants.nodes[0];
    if(!variant)return "";
    return `<item>
<g:store_code>${esc(storeCode)}</g:store_code>
<g:id>${esc(variant.sku||product.id)}</g:id>
<g:availability>${product.availableForSale?"in_stock":"out_of_stock"}</g:availability>
<g:price>${esc(Number(variant.price.amount).toFixed(2)+" "+variant.price.currencyCode)}</g:price>
</item>`;
  }).join("");

  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel>${rows}</channel></rss>`,
    {headers:{"Content-Type":"application/xml; charset=utf-8","Cache-Control":"public, s-maxage=3600, stale-while-revalidate=86400"}}
  );
}
