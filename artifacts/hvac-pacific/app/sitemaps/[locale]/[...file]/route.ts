import { NextRequest, NextResponse } from "next/server";
import { SITE } from "@/config/site";
import { ALL_SECTIONS, sectionPath } from "@/lib/catalog-config";
import { getAllProducts, getGuideArticles } from "@/lib/shopify/catalog";
import { STATIC_PAGES } from "@/lib/static-pages";

function esc(v:string){return v.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function url(locale:string,path:string){return SITE.domain+(locale==="zh"?"/zh"+(path==="/"? "":path):path);}
function xml(urls:string[]){return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u=>`<url><loc>${esc(u)}</loc></url>`).join("")}</urlset>`;}

export const revalidate=3600;
export async function GET(_request:NextRequest,{params}:{params:Promise<{locale:string;file:string[]}>}){
  const {locale,file}=await params;
  if(!["en","zh"].includes(locale))return new NextResponse("Not found",{status:404});
  const type=(file[0]||"").replace(/\.xml$/,"");
  let urls:string[]=[];
  if(type==="products"){
    const products=await getAllProducts(locale);
    if(locale==="zh"){
      const en=await getAllProducts("en");
      const map=new Map(en.map(p=>[p.handle,p]));
      urls=products.filter(p=>{const e=map.get(p.handle);return !e||e.title!==p.title||e.description!==p.description;}).map(p=>url(locale,"/products/"+p.handle));
    }else urls=products.map(p=>url(locale,"/products/"+p.handle));
  } else if(type==="collections"){
    urls=[url(locale,"/units"),url(locale,"/parts"),...ALL_SECTIONS.map(s=>url(locale,sectionPath(s))),url(locale,"/brands")];
  } else if(type==="guides"){
    const guides=await getGuideArticles(locale);
    urls=[url(locale,"/guides"),...guides.map(g=>url(locale,"/guides/"+g.handle))];
  } else if(type==="static"){
    urls=[url(locale,"/"),url(locale,"/contact"),url(locale,"/need-installer"),...Object.entries(STATIC_PAGES).filter(([,p])=>p.reviewed&&locale==="en").map(([key])=>url(locale,"/"+key))];
  } else return new NextResponse("Not found",{status:404});
  return new NextResponse(xml(Array.from(new Set(urls))),{headers:{"Content-Type":"application/xml; charset=utf-8","Cache-Control":"public, s-maxage=3600, stale-while-revalidate=86400"}});
}