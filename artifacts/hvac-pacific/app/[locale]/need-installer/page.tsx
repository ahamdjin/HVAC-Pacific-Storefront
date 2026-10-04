import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LeadForm } from "@/components/LeadForm";
import { SITE } from "@/config/site";

export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{
  const {locale}=await params;
  const t=await getTranslations({locale,namespace:"Pages.installer"});
  return {title:t("title")+" | hvacpacific",description:t("description")};
}

export default async function Page({params,searchParams}:{params:Promise<{locale:string}>;searchParams:Promise<{product?:string}>}){
  const {locale}=await params;
  const {product=""}=await searchParams;
  const t=await getTranslations({locale,namespace:"Pages.installer"});
  return <main id="main"><div className="wrap page-shell narrow">
    <Breadcrumbs locale={locale} items={[{name:t("breadcrumb"),path:"/need-installer"}]}/>
    <header className="page-head"><p className="eyebrow">{t("eyebrow")}</p><h1>{t("title")}</h1><p>{t("description")}</p></header>
    <div className="info-callout"><strong>{t("important")}</strong> {t("disclaimer")}</div>
    <LeadForm type="installer" product={product}/>
    <p className="contact-fallback">{t("callPrompt",{phone:SITE.phone})}</p>
  </div></main>;
}
