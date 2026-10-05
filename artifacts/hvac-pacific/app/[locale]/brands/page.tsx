import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { hrefFor } from "@/components/paths";
import { SITE } from "@/config/site";
import { localizedAlternates, seoMetaDescription, seoPageTitle } from "@/lib/seo";
import { getAllProducts } from "@/lib/shopify/catalog";

export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{
  const {locale}=await params;
  const t=await getTranslations({locale,namespace:"BrandsPage"});
  const description=seoMetaDescription(t("metaDescription"));
  return {
    title:seoPageTitle(t("metaTitle")),
    description,
    alternates:localizedAlternates(locale,"/brands"),
    openGraph:{title:t("title"),description,url:SITE.domain+hrefFor(locale,"/brands"),type:"website"}
  };
}

export default async function Page({params}:{params:Promise<{locale:string}>}) {
  const {locale}=await params;
  const [products,t]=await Promise.all([
    getAllProducts(locale),
    getTranslations({locale,namespace:"BrandsPage"}),
  ]);
  const counts=new Map<string,number>();
  products.forEach((p)=>counts.set(p.vendor,(counts.get(p.vendor)||0)+1));
  const brands=Array.from(counts).filter(([name])=>name).sort((a,b)=>a[0].localeCompare(b[0]));
  return <main id="main"><div className="wrap page-shell">
    <Breadcrumbs locale={locale} items={[{name:t("breadcrumb"),path:"/brands"}]} />
    <header className="page-head"><p className="eyebrow">{t("eyebrow")}</p><h1>{t("title")}</h1><p>{t("description")}</p></header>
    <div className="brand-grid">{brands.map(([name,count])=><Link key={name} href={hrefFor(locale,"/brands/"+encodeURIComponent(name.toLowerCase().replace(/[^a-z0-9]+/g,"-")))}><strong>{name}</strong><span>{t("products",{count})}</span></Link>)}</div>
  </div></main>;
}
