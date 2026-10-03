import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductCard } from "@/components/ProductCard";
import { SITE } from "@/config/site";
import { localizedAlternates } from "@/lib/seo";
import { getAllProducts } from "@/lib/shopify/catalog";

type P={params:Promise<{locale:string;brand:string}>};
function slug(v:string){return v.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");}

async function resolveBrand(requested:string,locale:string){
  const products=await getAllProducts(locale);
  const decoded=decodeURIComponent(requested);
  const vendor=Array.from(new Set(products.map(p=>p.vendor))).find(v=>slug(v)===decoded);
  return {vendor,products:vendor?products.filter(p=>p.vendor===vendor):[]};
}
export async function generateMetadata({params}:P):Promise<Metadata>{
  const {locale,brand}=await params;const {vendor}=await resolveBrand(brand,locale);
  if(!vendor)return {};
  const path="/brands/"+brand;
  return {title:vendor+" HVAC Equipment & Parts | "+SITE.brand,description:"Shop published "+vendor+" HVAC equipment and parts from HVAC Pacific.",alternates:localizedAlternates(locale,path)};
}
export default async function Page({params}:P){
  const {locale,brand}=await params;const {vendor,products}=await resolveBrand(brand,locale);if(!vendor||!products.length)notFound();
  return <main id="main"><div className="wrap page-shell"><Breadcrumbs locale={locale} items={[{name:"Brands",path:"/brands"},{name:vendor,path:"/brands/"+brand}]}/><header className="page-head"><p className="eyebrow">Brand</p><h1>{vendor} HVAC equipment & parts</h1><p>Published {vendor} products currently available through HVAC Pacific.</p></header><div className="product-grid">{products.map(p=><ProductCard key={p.id} product={p} locale={locale}/>)}</div></div></main>;
}