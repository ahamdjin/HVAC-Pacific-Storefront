import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LeadForm } from "@/components/LeadForm";
import { SITE } from "@/config/site";
import { hrefFor } from "@/components/paths";
import { localizedAlternates, seoMetaDescription } from "@/lib/seo";

export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{
  const {locale}=await params;
  const t=await getTranslations({locale,namespace:"Pages.contact"});
  const description=seoMetaDescription(t("description"));
  return {
    title:t("title"),
    description,
    alternates:localizedAlternates(locale,"/contact"),
    openGraph:{title:t("title"),description,url:SITE.domain+hrefFor(locale,"/contact"),type:"website"}
  };
}

export default async function Page({params}:{params:Promise<{locale:string}>}){
  const {locale}=await params;
  const a=SITE.mailingAddress;
  const t=await getTranslations({locale,namespace:"Pages.contact"});
  return <main id="main"><div className="wrap page-shell">
    <Breadcrumbs locale={locale} items={[{name:t("breadcrumb"),path:"/contact"}]}/>
    <header className="page-head"><p className="eyebrow">{t("eyebrow")}</p><h1>{t("title")}</h1><p>{t("description")}</p></header>
    <div className="contact-grid">
      <div className="contact-card"><h2>{t("talk")}</h2><p><a href={"tel:"+SITE.phoneE164}>{SITE.phone}</a></p><p><a href={"mailto:"+SITE.email}>{SITE.email}</a></p><address>{a.street}<br/>{a.city}, {a.region} {a.postal}</address><p>{t("pickup")}</p></div>
      <LeadForm type="contact"/>
    </div>
  </div></main>;
}
