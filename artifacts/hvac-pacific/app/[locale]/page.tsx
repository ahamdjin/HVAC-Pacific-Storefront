import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
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
  const {locale}=await params;
  const canonical=locale==="zh"?"/zh":"/";
  const t=await getTranslations({locale,namespace:"HomePage"});
  return {
    title:{absolute:t("metaTitle")},
    description:t("metaDescription"),
    alternates:localizedAlternates(locale,"/"),
    openGraph:{title:t("title"),description:t("ogDescription"),url:SITE.domain+canonical,type:"website"}
  };
}

export default async function HomePage({params}:HomePageProps){
  const {locale}=await params;
  setRequestLocale(locale);
  const h=(p:string)=>hrefFor(locale,p);
  const [featured,guides,t,cat]=await Promise.all([
    getFeaturedProducts(locale).catch(()=>[]),
    getGuideArticles(locale,3).catch(()=>[]),
    getTranslations({locale,namespace:"HomePage"}),
    getTranslations({locale,namespace:"Category"}),
  ]);
  return <main id="main">
    <section className="hero home-hero">
      <div className="wrap herogrid">
        <div className="hero-copy">
          <p className="eyebrow">{t("supplyEyebrow")}</p>
          <h1>{t("title")}</h1>
          <p className="lead">{t("lead",{miles:SITE.serviceRadiusMiles})}</p>
          <div className="row">
            <Link className="btn primary" href={h("/units")}>{t("shopUnits")}</Link>
            <Link className="btn ghost" href={h("/parts")}>{t("shopParts")}</Link>
          </div>
          <form action={h("/search")} className="hero-search compact-search">
            <input name="q" type="search" placeholder={t("searchExample")} aria-label={t("searchBy")} required/>
            <button>{t("searchCatalog")}</button>
          </form>
        </div>
        <div className="hero-visual">
          <Image
            src="https://images.unsplash.com/photo-1550998251-1e18917c975c?auto=format&fit=crop&w=1400&q=85"
            alt="Outdoor HVAC air conditioning condenser"
            width={1400}
            height={1000}
            priority
            sizes="(max-width:900px) 100vw, 48vw"
          />
        </div>
      </div>
    </section>

    <section className="wrap section">
      <div className="section-title"><div><p className="eyebrow">{t("shopEquipment")}</p><h2>{t("unitsHeading")}</h2></div><Link href={h("/units")}>{t("viewAllUnits")}</Link></div>
      <div className="category-card-grid">
        {UNIT_SECTIONS.map((s)=><Link key={s.slug} href={h(sectionPath(s))}><span className="category-icon" aria-hidden="true">HVAC</span><strong>{cat(`sections.${s.slug}.title`)}</strong></Link>)}
      </div>
    </section>

    <section className="band-light">
      <div className="wrap section">
        <div className="section-title"><div><p className="eyebrow">{t("repairService")}</p><h2>{t("partsHeading")}</h2></div><Link href={h("/parts")}>{t("viewAllParts")}</Link></div>
        <div className="category-card-grid parts-cards">
          {PART_SECTIONS.filter(s=>!s.parent).slice(0,6).map((s)=><Link key={s.slug} href={h(sectionPath(s))}><strong>{cat(`sections.${s.slug}.title`)}</strong></Link>)}
        </div>
      </div>
    </section>

    {featured.length>0&&<section className="wrap section">
      <div className="section-title"><div><h2>{t("featuredProducts")}</h2></div></div>
      <div className="product-grid">{featured.map(p=><ProductCard key={p.id} product={p} locale={locale}/>)}</div>
    </section>}

    {guides.length>0&&<section className="wrap section compact-guides">
      <div className="section-title"><div><h2>{t("latestGuides")}</h2></div><Link href={h("/guides")}>{t("allGuides")}</Link></div>
      <div className="guide-teasers">
        {guides.map(g=><article key={g.id}>{g.image&&<Image src={g.image.url} alt={g.image.altText||g.title} width={g.image.width||800} height={g.image.height||500}/>}<div><h3><Link href={h("/guides/"+g.handle)}>{g.title}</Link></h3></div></article>)}
      </div>
    </section>}

    <section className="contact-band">
      <div className="wrap contact-band-grid">
        <div><p className="eyebrow">{t("helpFind")}</p><h2>{t("talkWith")}</h2><p>{t.rich("sendModel",{phone:SITE.phone,call:(chunks)=><a href={"tel:"+SITE.phoneE164}>{chunks}</a>})}</p></div>
        <LeadForm type="contact" compact/>
      </div>
    </section>
  </main>;
}