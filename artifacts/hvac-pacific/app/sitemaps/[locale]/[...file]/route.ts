import { NextRequest, NextResponse } from "next/server";
import { SITE } from "@/config/site";
import { ALL_SECTIONS, productMatchesSection, sectionPath } from "@/lib/catalog-config";
import { getAllProducts, getGuideArticles, metafieldMap } from "@/lib/shopify/catalog";
import { STATIC_PAGES } from "@/lib/static-pages";
import { zhTranslationsReviewed } from "@/lib/seo";

function esc(v:string){return v.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function url(locale:string,path:string){return SITE.domain+(locale==="zh"?"/zh"+(path==="/"? "":path):path);}
function xml(urls:string[]){return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u=>`<url><loc>${esc(u)}</loc></url>`).join("")}</urlset>`;}
function blocked(product:Awaited<ReturnType<typeof getAllProducts>>[number]){
  const status=(metafieldMap(product).site_status||"").trim().toUpperCase();
  return status==="HOLD"||status==="NEEDS DATA";
}
function brandSlug(value:string){return value.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");}

export const revalidate=3600;

export async function GET(_request:NextRequest,{params}:{params:Promise<{locale:string;file:string[]}>}){
  const {locale,file}=await params;
  if(!["en","zh"].includes(locale))return new NextResponse("Not found",{status:404});
  if(locale==="zh"&&!zhTranslationsReviewed())return new NextResponse("Not found",{status:404});

  const type=(file[0]||"").replace(/\.xml$/,"");
  let urls:string[]=[];

  if(type==="products"){
    const products=(await getAllProducts(locale)).filter((product)=>!blocked(product));
    if(locale==="zh"){
      const en=(await getAllProducts("en")).filter((product)=>!blocked(product));
      const map=new Map(en.map(p=>[p.handle,p]));
      urls=products
        .filter(p=>{const e=map.get(p.handle);return !e||e.title!==p.title||e.description!==p.description;})
        .map(p=>url(locale,"/products/"+p.handle));
    }else{
      urls=products.map(p=>url(locale,"/products/"+p.handle));
    }
  } else if(type==="collections"){
    const products=(await getAllProducts(locale)).filter((product)=>!blocked(product));
    const sectionUrls=ALL_SECTIONS
      .filter((section)=>{
        const count=products.filter((product)=>productMatchesSection(product,section.slug)).length;
        return section.parent?count>=5:count>=1;
      })
      .map((section)=>url(locale,sectionPath(section)));
    const brandUrls=Array.from(new Set(products.map((product)=>product.vendor).filter(Boolean)))
      .map((vendor)=>url(locale,"/brands/"+brandSlug(vendor)));
    urls=[url(locale,"/units"),url(locale,"/parts"),...sectionUrls,url(locale,"/brands"),...brandUrls];
  } else if(type==="guides"){
    const guides=await getGuideArticles(locale);
    if(locale==="zh"){
      const en=await getGuideArticles("en");
      const map=new Map(en.map((guide)=>[guide.handle,guide]));
      urls=[url(locale,"/guides"),...guides
        .filter((guide)=>{const source=map.get(guide.handle);return !source||source.title!==guide.title||source.contentHtml!==guide.contentHtml;})
        .map((guide)=>url(locale,"/guides/"+guide.handle))];
    }else{
      urls=[url(locale,"/guides"),...guides.map(g=>url(locale,"/guides/"+g.handle))];
    }
  } else if(type==="static"){
    const reviewed=Object.entries(STATIC_PAGES).filter(([,page])=>page.reviewed);
    urls=[
      url(locale,"/"),
      url(locale,"/contact"),
      url(locale,"/need-installer"),
      ...reviewed.map(([key])=>url(locale,"/"+key)),
    ];
  } else {
    return new NextResponse("Not found",{status:404});
  }

  return new NextResponse(xml(Array.from(new Set(urls))),{
    headers:{"Content-Type":"application/xml; charset=utf-8","Cache-Control":"public, s-maxage=3600, stale-while-revalidate=86400"}
  });
}
