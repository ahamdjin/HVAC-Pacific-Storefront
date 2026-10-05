import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { hrefFor } from "@/components/paths";
import { ProductCard } from "@/components/ProductCard";
import { SITE } from "@/config/site";
import { localizedAlternates, seoMetaDescription, seoPageTitle } from "@/lib/seo";
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
  const {locale,brand}=await params;
  const [{vendor},t]=await Promise.all([resolveBrand(brand,locale),getTranslations({locale,namespace:"BrandsPage"})]);
  if(!vendor)return {};
  const path="/brands/"+brand;
  const description=seoMetaDescription(t("brandMetaDescription",{brand:vendor}));
  return {
    title:seoPageTitle(t("brandMetaTitle",{brand:vendor})),
    description,
    alternates:localizedAlternates(locale,path),
    openGraph:{title:t("brandTitle",{brand:vendor}),description,url:SITE.domain+hrefFor(locale,path),type:"website"}
  };
}
export default async function Page({params}:P){
  const {locale,brand}=await params;
  const [{vendor,products},t]=await Promise.all([resolveBrand(brand,locale),getTranslations({locale,namespace:"BrandsPage"})]);
  if(!vendor||!products.length)notFound();
  return <main id="main"><div className="wrap page-shell">
    <Breadcrumbs locale={locale} items={[{name:t("breadcrumb"),path:"/brands"},{name:vendor,path:"/brands/"+brand}]}/>
    <header className="page-head"><p className="eyebrow">{t("brandEyebrow")}</p><h1>{t("brandTitle",{brand:vendor})}</h1><p>{t("brandDescription",{brand:vendor})}</p></header>
    <div className="product-grid">{products.map(p=><ProductCard key={p.id} product={p} locale={locale}/>)}</div>
  </div></main>;
}
