import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { hrefFor } from "@/components/paths";
import { getGuideArticles } from "@/lib/shopify/catalog";

export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{
  const {locale}=await params;
  const t=await getTranslations({locale,namespace:"GuidesPage"});
  return {title:t("metaTitle"),description:t("metaDescription")};
}

export default async function Page({params}:{params:Promise<{locale:string}>}){
  const {locale}=await params;
  const [guides,t]=await Promise.all([
    getGuideArticles(locale),
    getTranslations({locale,namespace:"GuidesPage"}),
  ]);
  return <main id="main"><div className="wrap page-shell">
    <Breadcrumbs locale={locale} items={[{name:t("breadcrumb"),path:"/guides"}]}/>
    <header className="page-head"><p className="eyebrow">{t("eyebrow")}</p><h1>{t("title")}</h1><p>{t("description")}</p></header>
    {guides.length?<div className="guides-grid">{guides.map(g=><article key={g.id}>{g.image&&<Link href={hrefFor(locale,"/guides/"+g.handle)}><Image src={g.image.url} alt={g.image.altText||g.title} width={g.image.width||900} height={g.image.height||600}/></Link>}<div><p className="product-meta">{new Date(g.publishedAt).toLocaleDateString(locale==="zh"?"zh-CN":"en-US")}</p><h2><Link href={hrefFor(locale,"/guides/"+g.handle)}>{g.title}</Link></h2>{g.excerpt&&<p>{g.excerpt}</p>}</div></article>)}</div>:<div className="empty-state"><h2>{t("noneTitle")}</h2><p>{t("noneText")}</p></div>}
  </div></main>;
}
