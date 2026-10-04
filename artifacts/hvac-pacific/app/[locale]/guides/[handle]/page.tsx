import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { hrefFor } from "@/components/paths";
import { SITE } from "@/config/site";
import { localizedAlternates } from "@/lib/seo";
import { getGuideArticle } from "@/lib/shopify/catalog";

type P={params:Promise<{locale:string;handle:string}>};
export const revalidate=3600;

export async function generateMetadata({params}:P):Promise<Metadata>{
  const {locale,handle}=await params;const article=await getGuideArticle(handle,locale);if(!article)return {};
  const path="/guides/"+handle;let noindex=false;
  if(locale==="zh"){const en=await getGuideArticle(handle,"en").catch(()=>null);noindex=Boolean(en&&en.title===article.title&&en.contentHtml===article.contentHtml);}
  const t=await getTranslations({locale,namespace:"GuidesPage"});
  return {title:(article.seo.title||article.title)+" | "+SITE.brand,description:(article.seo.description||article.excerpt||t("fallbackDescription")).slice(0,160),robots:noindex?{index:false,follow:true}:undefined,alternates:localizedAlternates(locale,path),openGraph:{type:"article",title:article.title,images:article.image?[article.image.url]:undefined}};
}
export default async function Page({params}:P){
  const {locale,handle}=await params;
  const [article,t]=await Promise.all([getGuideArticle(handle,locale),getTranslations({locale,namespace:"GuidesPage"})]);
  if(!article)notFound();
  const url=SITE.domain+hrefFor(locale,"/guides/"+handle);
  const json={"@context":"https://schema.org","@type":"Article",headline:article.title,datePublished:article.publishedAt,dateModified:article.publishedAt,mainEntityOfPage:url,image:article.image?[article.image.url]:undefined,author:article.authorV2?{"@type":"Person",name:article.authorV2.name}:{"@type":"Organization",name:SITE.displayName},publisher:{"@type":"Organization",name:SITE.displayName}};
  return <main id="main"><article className="wrap article"><Breadcrumbs locale={locale} items={[{name:t("breadcrumb"),path:"/guides"},{name:article.title,path:"/guides/"+handle}]}/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(json).replace(/</g,"\\u003c")}}/><header><p className="eyebrow">{t("articleEyebrow")}</p><h1>{article.title}</h1><p className="article-meta">{t("updated",{date:new Date(article.publishedAt).toLocaleDateString(locale==="zh"?"zh-CN":"en-US")})}{article.authorV2?.name?" · "+article.authorV2.name:""}</p></header>{article.image&&<Image className="article-hero" src={article.image.url} alt={article.image.altText||article.title} width={article.image.width||1400} height={article.image.height||800} priority/>}<div className="prose article-prose" dangerouslySetInnerHTML={{__html:article.contentHtml}}/></article></main>;
}