import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogGrid } from "./CatalogGrid";
import { Breadcrumbs } from "./Breadcrumbs";
import { LeadForm } from "./LeadForm";
import { hrefFor } from "./paths";
import { SITE } from "@/config/site";
import { ALL_SECTIONS, getSection, productMatchesSection, sectionPath } from "@/lib/catalog-config";
import { getAllProducts, getCollection, metafieldMap, parseFaq } from "@/lib/shopify/catalog";

export async function categoryMetadata(kind:"units"|"parts", slugs:string[], locale:string, hasParams:boolean): Promise<Metadata> {
  const section=getSection(kind,slugs);
  const title=section?.title ?? (kind==="units"?"HVAC Units":"HVAC Parts & Accessories");
  const path=section?sectionPath(section):`/${kind}`;
  const canonical=hrefFor(locale,path);
  const desc=section?.intro ?? (kind==="units"?"Shop HVAC equipment for Southern California pickup and local delivery.":"Shop HVAC parts and accessories for Southern California pickup and local delivery.");
  return {
    title:`${title} for Sale – Pickup in Southern California | ${SITE.brand}`,
    description:desc.slice(0,160),
    robots:hasParams?{index:false,follow:true}:undefined,
    alternates:{canonical,languages:{"en-US":path,"zh-Hans":hrefFor("zh",path),"x-default":path}},
    openGraph:{title,description:desc,url:`${SITE.domain}${canonical}`,type:"website"},
  };
}

export async function CategoryPage({kind,slugs,locale}:{kind:"units"|"parts";slugs:string[];locale:string}) {
  const section=getSection(kind,slugs);
  if(slugs.length && !section) notFound();

  const handle=section?.collectionHandle ?? section?.slug;
  const [all,collection]=await Promise.all([
    getAllProducts(locale),
    handle?getCollection(handle,locale).catch(()=>null):Promise.resolve(null),
  ]);

  const sections=ALL_SECTIONS.filter((s)=>s.kind===kind && !s.parent);
  let products=section
    ? all.filter((p)=>productMatchesSection(p,section.slug))
    : all.filter((p)=>sections.some((s)=>productMatchesSection(p,s.slug)));

  if(section?.parent && products.length<5) notFound();

  const title=collection?.title || section?.title || (kind==="units"?"HVAC Units":"HVAC Parts & Accessories");
  const intro=collection?.description || section?.intro || (kind==="units"
    ?"Browse HVAC equipment by system type, brand, capacity and refrigerant. Product information is displayed only when it is available from the catalog."
    :"Browse HVAC parts and accessories by category, brand and key specifications.");

  const cmeta=Object.fromEntries((collection?.metafields??[]).filter(Boolean).map((m)=>[m!.key,m!.value]));
  const faqs=parseFaq(cmeta.faq);
  const parentPath=section?.parent?`/${kind}/${section.parent}`:`/${kind}`;
  const crumbs=section
    ? [...(section.parent?[{name:kind==="units"?"Units":"Parts & Accessories",path:`/${kind}`},{name:ALL_SECTIONS.find(x=>x.slug===section.parent)?.title??section.parent,path:parentPath}]:[{name:kind==="units"?"Units":"Parts & Accessories",path:`/${kind}`}]),{name:title,path:sectionPath(section)}]
    : [{name:title,path:`/${kind}`}];

  const itemList={
    "@context":"https://schema.org","@type":"ItemList",name:title,
    itemListElement:products.slice(0,100).map((p,i)=>({"@type":"ListItem",position:i+1,url:`${SITE.domain}${hrefFor(locale,`/products/${p.handle}`)}`,name:p.title})),
  };

  return <main id="main">
    <div className="wrap page-shell">
      <Breadcrumbs locale={locale} items={crumbs}/>
      <header className="page-head"><p className="eyebrow">{kind==="units"?"Equipment":"Parts & accessories"}</p><h1>{title}</h1><p className="category-intro">{intro}</p></header>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(itemList).replace(/</g,"\\u003c")}}/>
      {!section && <div className="category-links">{sections.map((s)=><Link key={s.slug} href={hrefFor(locale,sectionPath(s))}><strong>{s.title}</strong><span>{s.intro}</span></Link>)}</div>}
      {section?.slug==="capacitors" && <div className="subcat-links">{ALL_SECTIONS.filter((s)=>s.parent==="capacitors").map((s)=><Link key={s.slug} href={hrefFor(locale,sectionPath(s))}>{s.title}</Link>)}</div>}

      {products.length>0 ? <CatalogGrid products={products} locale={locale} kind={kind}/> : (
        <div className="empty-state">
          <h2>No verified products are published in this category yet.</h2>
          <p>We do not publish placeholder inventory. Contact us with the model or equipment you need.</p>
          {section?.slug==="ac-furnace-systems" ? <LeadForm type="contact" compact/> : <p><a className="btn primary" href={`tel:${SITE.phoneE164}`}>{SITE.phone}</a></p>}
        </div>
      )}

      {cmeta.guide_html && <section className="rich-guide"><h2>Buying guide</h2><div className="prose" dangerouslySetInnerHTML={{__html:cmeta.guide_html}}/></section>}
      {kind==="units" && <section className="info-callout"><h2>Choosing the right capacity</h2><p>Do not size HVAC equipment from square footage alone. A licensed contractor should perform a Manual J load calculation and verify the matched equipment, electrical service, ductwork and local permit requirements before installation.</p></section>}
      {faqs.length>0 && <FaqBlock faqs={faqs}/>}
    </div>
  </main>;
}

function FaqBlock({faqs}:{faqs:Array<{q:string;a:string}>}) {
  const json={"@context":"https://schema.org","@type":"FAQPage",mainEntity:faqs.map(f=>({"@type":"Question",name:f.q,acceptedAnswer:{"@type":"Answer",text:f.a}}))};
  return <section className="faq"><h2>Frequently asked questions</h2>{faqs.map((f)=><details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(json).replace(/</g,"\\u003c")}}/></section>;
}
