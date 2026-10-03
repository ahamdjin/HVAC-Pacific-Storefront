import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { hrefFor } from "@/components/paths";
import { getGuideArticles } from "@/lib/shopify/catalog";

export const metadata:Metadata={title:"HVAC Guides | hvacpacific",description:"Practical HVAC equipment, parts and buying guides from HVAC Pacific."};

export default async function Page({params}:{params:Promise<{locale:string}>}){
  const {locale}=await params;const guides=await getGuideArticles(locale);
  return <main id="main"><div className="wrap page-shell"><Breadcrumbs locale={locale} items={[{name:"Guides",path:"/guides"}]}/><header className="page-head"><p className="eyebrow">Knowledge center</p><h1>HVAC guides</h1><p>Practical information for comparing equipment, components and HVAC specifications.</p></header>
  {guides.length?<div className="guides-grid">{guides.map(g=><article key={g.id}>{g.image&&<Link href={hrefFor(locale,"/guides/"+g.handle)}><Image src={g.image.url} alt={g.image.altText||g.title} width={g.image.width||900} height={g.image.height||600}/></Link>}<div><p className="product-meta">{new Date(g.publishedAt).toLocaleDateString(locale==="zh"?"zh-CN":"en-US")}</p><h2><Link href={hrefFor(locale,"/guides/"+g.handle)}>{g.title}</Link></h2>{g.excerpt&&<p>{g.excerpt}</p>}</div></article>)}</div>:<div className="empty-state"><h2>No guides are published yet.</h2><p>Draft articles stay out of search until they are reviewed and published in Shopify.</p></div>}
  </div></main>;
}