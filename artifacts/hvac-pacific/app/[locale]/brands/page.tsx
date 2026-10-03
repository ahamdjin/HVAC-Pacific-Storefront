import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { hrefFor } from "@/components/paths";
import { SITE } from "@/config/site";
import { getAllProducts } from "@/lib/shopify/catalog";

export const metadata: Metadata = {
  title: "HVAC Brands | hvacpacific",
  description: "Browse HVAC equipment and parts by brand at HVAC Pacific.",
};

export default async function Page({params}:{params:Promise<{locale:string}>}) {
  const {locale}=await params;
  const products=await getAllProducts(locale);
  const counts=new Map<string,number>();
  products.forEach((p)=>counts.set(p.vendor,(counts.get(p.vendor)||0)+1));
  const brands=Array.from(counts).filter(([name])=>name).sort((a,b)=>a[0].localeCompare(b[0]));
  return <main id="main"><div className="wrap page-shell">
    <Breadcrumbs locale={locale} items={[{name:"Brands",path:"/brands"}]} />
    <header className="page-head"><p className="eyebrow">Manufacturers</p><h1>HVAC brands</h1><p>Browse published equipment and parts by manufacturer.</p></header>
    <div className="brand-grid">{brands.map(([name,count])=><Link key={name} href={hrefFor(locale,"/brands/"+encodeURIComponent(name.toLowerCase().replace(/[^a-z0-9]+/g,"-")))}><strong>{name}</strong><span>{count} product{count===1?"":"s"}</span></Link>)}</div>
  </div></main>;
}