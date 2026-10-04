import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogGrid } from "./CatalogGrid";
import { Breadcrumbs } from "./Breadcrumbs";
import { LeadForm } from "./LeadForm";
import { hrefFor } from "./paths";
import { SITE } from "@/config/site";
import { localizedAlternates } from "@/lib/seo";
import { ALL_SECTIONS, getSection, productMatchesSection, sectionPath } from "@/lib/catalog-config";
import { getAllProducts, getCollection, getGuideArticles, metafieldMap, parseFaq } from "@/lib/shopify/catalog";

export async function categoryMetadata(kind:"units"|"parts", slugs:string[], locale:string, hasParams:boolean): Promise<Metadata> {
  const section=getSection(kind,slugs);
  const t=await getTranslations({locale,namespace:"Category"});
  const title=section?t(`sections.${section.slug}.title`):(kind==="units"?t("allUnitsTitle"):t("allPartsTitle"));
  const path=section?sectionPath(section):`/${kind}`;
  const canonical=hrefFor(locale,path);
  const desc=section?t(`sections.${section.slug}.intro`):(kind==="units"?t("unitsMetaDescription"):t("partsMetaDescription"));
  let emptySection=false;
  if(section&&!hasParams){
    const all=await getAllProducts(locale).catch(()=>[]);
    emptySection=!all.some((product)=>productMatchesSection(product,section.slug));
  }
  return {
    title:t("forSaleTitle",{title,brand:SITE.brand}),
    description:desc.slice(0,160),
    robots:hasParams||emptySection?{index:false,follow:true}:undefined,
    alternates:localizedAlternates(locale,path),
    openGraph:{title,description:desc,url:`${SITE.domain}${canonical}`,type:"website"},
  };
}

export async function CategoryPage({kind,slugs,locale}:{kind:"units"|"parts";slugs:string[];locale:string}) {
  const t=await getTranslations({locale,namespace:"Category"});
  const section=getSection(kind,slugs);
  if(slugs.length && !section) notFound();

  const handle=section?.collectionHandle ?? section?.slug;
  const [all,collection,guides]=await Promise.all([
    getAllProducts(locale),
    handle?getCollection(handle,locale).catch(()=>null):Promise.resolve(null),
    getGuideArticles(locale,20).catch(()=>[]),
  ]);

  const sections=ALL_SECTIONS.filter((s)=>s.kind===kind && !s.parent);
  let products=section
    ? all.filter((p)=>productMatchesSection(p,section.slug))
    : all.filter((p)=>sections.some((s)=>productMatchesSection(p,s.slug)));

  if(section?.parent && products.length<5) notFound();

  const fallbackTitle=section?t(`sections.${section.slug}.title`):(kind==="units"?t("allUnitsTitle"):t("allPartsTitle"));
  const fallbackIntro=section?t(`sections.${section.slug}.intro`):(kind==="units"?t("unitsIntro"):t("partsIntro"));
  const collectionHasLocalizedTitle=Boolean(collection?.title)&&(locale!=="zh"||!section||collection!.title!==section.title);
  const collectionHasLocalizedDescription=Boolean(collection?.description)&&(locale!=="zh"||!section||collection!.description!==section.intro);
  const title=collectionHasLocalizedTitle?collection!.title:fallbackTitle;
  const intro=collectionHasLocalizedDescription?collection!.description:fallbackIntro;

  const cmeta=Object.fromEntries((collection?.metafields??[]).filter(Boolean).map((m)=>[m!.key,m!.value]));
  const faqs=parseFaq(cmeta.faq);
  const guideTerms=[title,section?.title,section?.slug].filter((value):value is string=>Boolean(value)).map((value)=>value.toLowerCase().replace(/-/g," "));
  const relatedGuides=guides.map((guide)=>{
    const haystack=[guide.title,...guide.tags].join(" ").toLowerCase();
    return {guide,score:guideTerms.reduce((score,term)=>score+(haystack.includes(term)?2:0),0)};
  }).sort((a,b)=>b.score-a.score).map(({guide})=>guide);
  const siblings=section?ALL_SECTIONS.filter((candidate)=>candidate.kind===kind&&candidate.slug!==section.slug&&(candidate.parent??"")===(section.parent??"")).slice(0,6):[];
  const parentPath=section?.parent?`/${kind}/${section.parent}`:`/${kind}`;
  const rootName=kind==="units"?t("units"):t("parts");
  const parentSection=section?.parent?ALL_SECTIONS.find((candidate)=>candidate.slug===section.parent):undefined;
  const parentName=parentSection?t(`sections.${parentSection.slug}.title`):(section?.parent??"");
  const crumbs=section
    ? [...(section.parent?[{name:rootName,path:`/${kind}`},{name:parentName,path:parentPath}]:[{name:rootName,path:`/${kind}`}]),{name:title,path:sectionPath(section)}]
    : [{name:title,path:`/${kind}`}];

  const itemList={
    "@context":"https://schema.org","@type":"ItemList",name:title,
    itemListElement:products.slice(0,100).map((p,i)=>({"@type":"ListItem",position:i+1,url:`${SITE.domain}${hrefFor(locale,`/products/${p.handle}`)}`,name:p.title})),
  };

  return <main id="main">
    <div className="wrap page-shell">
      <Breadcrumbs locale={locale} items={crumbs}/>
      <header className="page-head"><p className="eyebrow">{kind==="units"?t("equipment"):t("partsEyebrow")}</p><h1>{title}</h1><p className="category-intro">{intro}</p></header>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(itemList).replace(/</g,"\\u003c")}}/>
      {!section && <div className="category-links">{sections.map((s)=><Link key={s.slug} href={hrefFor(locale,sectionPath(s))}><strong>{t(`sections.${s.slug}.title`)}</strong><span>{t(`sections.${s.slug}.intro`)}</span></Link>)}</div>}
      {section?.slug==="capacitors" && <div className="subcat-links">{ALL_SECTIONS.filter((s)=>s.parent==="capacitors").map((s)=><Link key={s.slug} href={hrefFor(locale,sectionPath(s))}>{t(`sections.${s.slug}.title`)}</Link>)}</div>}

      {products.length>0 ? <Suspense fallback={<div className="loading-box">{t("loadingFilters")}</div>}><CatalogGrid products={products} locale={locale} kind={kind}/></Suspense> : (
        <div className="empty-state">
          <h2>{t("emptyTitle")}</h2>
          <p>{t("emptyText")}</p>
          {section?.slug==="ac-furnace-systems" ? <LeadForm type="contact" compact/> : <p><a className="btn primary" href={`tel:${SITE.phoneE164}`}>{SITE.phone}</a></p>}
        </div>
      )}

      {cmeta.guide_html && <section className="rich-guide"><h2>{t("buyingGuide")}</h2><div className="prose" dangerouslySetInnerHTML={{__html:cmeta.guide_html}}/></section>}
      {kind==="units" && cmeta.sizing_table_html && <section className="pdp-section"><div className="prose sizing-table" dangerouslySetInnerHTML={{__html:cmeta.sizing_table_html}}/></section>}
      {kind==="units" && <section className="info-callout"><h2>{t("capacityTitle")}</h2><p>{t("capacityText")}</p></section>}
      {faqs.length>0 && <FaqBlock title={t("faq")} faqs={faqs}/>}
      {section&&siblings.length>0&&<section className="pdp-section"><h2>{t("relatedCategories")}</h2><div className="guide-links">{siblings.map((s)=><Link key={s.slug} href={hrefFor(locale,sectionPath(s))}>{t(`sections.${s.slug}.title`)}</Link>)}</div></section>}
      {section&&relatedGuides.length>0&&<section className="pdp-section"><h2>{t("helpfulGuides")}</h2><div className="guide-links">{relatedGuides.slice(0,4).map((guide)=><Link key={guide.id} href={hrefFor(locale,`/guides/${guide.handle}`)}>{guide.title}</Link>)}</div></section>}
    </div>
  </main>;
}

function FaqBlock({title,faqs}:{title:string;faqs:Array<{q:string;a:string}>}) {
  const json={"@context":"https://schema.org","@type":"FAQPage",mainEntity:faqs.map(f=>({"@type":"Question",name:f.q,acceptedAnswer:{"@type":"Answer",text:f.a}}))};
  return <section className="faq"><h2>{title}</h2>{faqs.map((f)=><details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(json).replace(/</g,"\\u003c")}}/></section>;
}
