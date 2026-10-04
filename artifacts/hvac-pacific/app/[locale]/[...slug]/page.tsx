import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { hrefFor } from "@/components/paths";
import { SITE } from "@/config/site";
import { localizedAlternates } from "@/lib/seo";
import { STATIC_PAGES } from "@/lib/static-pages";

type P={params:Promise<{locale:string;slug:string[]}>};

function keyFrom(slug:string[]){return slug.join("/");}

export async function generateMetadata({params}:P):Promise<Metadata>{
  const {locale,slug}=await params;
  const key=keyFrom(slug);
  const page=STATIC_PAGES[key];
  if(!page)return {};
  const path="/"+key;
  const t=await getTranslations({locale,namespace:"StaticPage"});
  return {
    title:t(`pages.${key}.title`)+" | "+SITE.brand,
    description:t(`pages.${key}.description`),
    robots:!page.reviewed||locale==="zh"?{index:false,follow:true}:undefined,
    alternates:localizedAlternates(locale,path),
  };
}

export default async function StaticPage({params}:P){
  const {locale,slug}=await params;
  const key=keyFrom(slug);
  const page=STATIC_PAGES[key];
  if(!page)notFound();
  const t=await getTranslations({locale,namespace:"StaticPage"});
  const title=t(`pages.${key}.title`);
  const description=t(`pages.${key}.description`);
  return (
    <main id="main">
      <div className="wrap page-shell narrow">
        <Breadcrumbs locale={locale} items={[{name:title,path:"/"+key}]} />
        {process.env.NODE_ENV!=="production"&&!page.reviewed&&<div className="draft-banner">{t("draft")}</div>}
        {locale==="zh"&&<div className="info-callout translation-notice">{t("translationNotice")}</div>}
        <header className="page-head">
          <p className="eyebrow">HVAC Pacific</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </header>
        <div className="policy-content">
          {page.sections.map((section,i)=><section key={i}>
            {section.heading&&<h2>{section.heading}</h2>}
            {section.paragraphs.map((p,j)=><p key={j}>{p}</p>)}
          </section>)}
        </div>
      </div>
    </main>
  );
}