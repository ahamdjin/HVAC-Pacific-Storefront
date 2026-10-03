import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { hrefFor } from "@/components/paths";
import { ProductCard } from "@/components/ProductCard";
import { LeadForm } from "@/components/LeadForm";
import { SITE } from "@/config/site";
import { localizedAlternates } from "@/lib/seo";
import { PART_SECTIONS, UNIT_SECTIONS, sectionPath } from "@/lib/catalog-config";
import { getFeaturedProducts, getGuideArticles } from "@/lib/shopify/catalog";

type HomePageProps = { params: Promise<{ locale: string }> };
export const revalidate=3600;

export async function generateMetadata({params}:HomePageProps):Promise<Metadata>{
  const {locale}=await params;const canonical=locale==="zh"?"/zh":"/";
  return {title:{absolute:"HVAC Equipment & Parts for Southern California | "+SITE.brand},description:"Shop HVAC equipment, systems and replacement parts with local pickup and delivery in Southern California.",alternates:localizedAlternates(locale,"/"),openGraph:{title:"HVAC Equipment & Parts for Southern California",description:"Shop verified HVAC equipment and parts from HVAC Pacific.",url:SITE.domain+canonical,type:"website"}};
}

export default async function HomePage({params}:HomePageProps){
  const {locale}=await params;setRequestLocale(locale);const h=(p:string)=>hrefFor(locale,p);
  const [featured,guides]=await Promise.all([getFeaturedProducts(locale).catch(()=>[]),getGuideArticles(locale,3).catch(()=>[])]);
  return <main id="main">
    <section className="hero home-hero"><div className="wrap herogrid"><div><p className="eyebrow">Southern California HVAC supply</p><h1>HVAC Equipment & Parts for Southern California</h1><p className="lead">Shop verified equipment, systems and service parts with local pickup and delivery within {SITE.serviceRadiusMiles} miles. Support in English and 中文.</p><div className="row"><Link className="btn primary" href={h("/units")}>Shop HVAC units</Link><Link className="btn ghost" href={h("/parts")}>Shop parts</Link></div><div className="trust-row"><span>Verified product data</span><span>Local fulfillment</span><span>Real phone support</span></div></div><aside className="hero-panel"><p className="eyebrow">Find the exact part</p><h2>Search by model, SKU or specification</h2><form action={h("/search")} className="hero-search"><input name="q" type="search" placeholder="Example: GA5SAN53600W" required/><button>Search catalog</button></form><p>Not sure what matches? <a href={"tel:"+SITE.phoneE164}>Call {SITE.phone}</a>.</p></aside></div></section>

    <section className="wrap section"><div className="section-title"><div><p className="eyebrow">Shop equipment</p><h2>HVAC units</h2></div><Link href={h("/units")}>View all units →</Link></div><div className="category-card-grid">{UNIT_SECTIONS.map((s)=><Link key={s.slug} href={h(sectionPath(s))}><span className="category-icon" aria-hidden="true">HVAC</span><strong>{s.title}</strong><small>{s.intro}</small></Link>)}</div></section>

    <section className="band-light"><div className="wrap section"><div className="section-title"><div><p className="eyebrow">Repair & service</p><h2>Parts & accessories</h2></div><Link href={h("/parts")}>View all parts →</Link></div><div className="category-card-grid parts-cards">{PART_SECTIONS.filter(s=>!s.parent).slice(0,6).map((s)=><Link key={s.slug} href={h(sectionPath(s))}><strong>{s.title}</strong><small>{s.intro}</small></Link>)}</div></div></section>

    {featured.length>0&&<section className="wrap section"><div className="section-title"><div><p className="eyebrow">Current catalog</p><h2>Featured products</h2></div></div><div className="product-grid">{featured.map(p=><ProductCard key={p.id} product={p} locale={locale}/>)}</div></section>}

    <section className="why-section"><div className="wrap section"><div className="section-title"><div><p className="eyebrow">Why HVAC Pacific</p><h2>Built for exact-product buying</h2></div></div><div className="facts"><div><dt>California-focused</dt><dd>Product pages surface compliance fields only when they exist in the catalog.</dd></div><div><dt>Local pickup & delivery</dt><dd>Fulfillment is focused on Southern California within the configured local service area.</dd></div><div><dt>English & 中文</dt><dd>Visible language routes and phone support without browser-language redirects.</dd></div><div><dt>Contractor-friendly data</dt><dd>Model numbers, electrical details, refrigerant and compatibility notes stay close to the product.</dd></div></div></div></section>

    {guides.length>0&&<section className="wrap section"><div className="section-title"><div><p className="eyebrow">Knowledge center</p><h2>Latest HVAC guides</h2></div><Link href={h("/guides")}>All guides →</Link></div><div className="guide-teasers">{guides.map(g=><article key={g.id}>{g.image&&<Image src={g.image.url} alt={g.image.altText||g.title} width={g.image.width||800} height={g.image.height||500}/>}<div><h3><Link href={h("/guides/"+g.handle)}>{g.title}</Link></h3>{g.excerpt&&<p>{g.excerpt}</p>}</div></article>)}</div></section>}

    <section className="contact-band"><div className="wrap contact-band-grid"><div><p className="eyebrow">Need help finding a product?</p><h2>Talk with HVAC Pacific</h2><p>Call <a href={"tel:"+SITE.phoneE164}>{SITE.phone}</a> or send the model number and what you need.</p></div><LeadForm type="contact" compact/></div></section>
  </main>;
}