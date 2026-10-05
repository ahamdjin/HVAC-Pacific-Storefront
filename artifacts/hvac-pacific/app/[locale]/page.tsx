import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hrefFor } from "@/components/paths";
import { ProductCard } from "@/components/ProductCard";
import { SITE } from "@/config/site";
import { localizedAlternates } from "@/lib/seo";
import { getFeaturedProducts } from "@/lib/shopify/catalog";

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
  const [featured,t]=await Promise.all([
    getFeaturedProducts(locale).catch(()=>[]),
    getTranslations({locale,namespace:"HomePage"}),
  ]);
  const heroProduct=featured.find((product)=>product.featuredImage);

  return <main id="main">
    <section className="home-showcase">
      <div className="wrap">
        <div className="showcase-frame">
          <div className="showcase-copy">
            <p className="eyebrow">{t("supplyEyebrow")}</p>
            <h1>{t("title")}</h1>
            <p>{t("lead",{miles:SITE.serviceRadiusMiles})}</p>
          </div>

          <div className="showcase-media">
            {heroProduct?.featuredImage ? (
              <Image
                src={heroProduct.featuredImage.url}
                alt={heroProduct.featuredImage.altText || heroProduct.title}
                width={heroProduct.featuredImage.width || 1200}
                height={heroProduct.featuredImage.height || 900}
                priority
                sizes="(max-width:900px) 92vw, 900px"
              />
            ) : (
              <div className="showcase-placeholder" aria-label={t("heroPlaceholder")}>
                <span>HVAC</span>
              </div>
            )}
          </div>

          <div className="showcase-bottom">
            <div className="row">
              <Link className="btn primary" href={h("/units")}>{t("shopUnits")}</Link>
              <Link className="btn ghost" href={h("/parts")}>{t("shopParts")}</Link>
            </div>
            <form action={h("/search")} className="hero-search showcase-search">
              <input name="q" type="search" placeholder={t("searchExample")} aria-label={t("searchBy")} required/>
              <button>{t("searchCatalog")}</button>
            </form>
          </div>
        </div>

        <div className="home-shortcuts" aria-label={t("quickLinks")}>
          <Link href={h("/units")}><strong>{t("shopEquipment")}</strong><span>{t("equipmentShort")}</span></Link>
          <Link href={h("/parts")}><strong>{t("partsHeading")}</strong><span>{t("partsShort")}</span></Link>
          <Link href={h("/units/mini-splits")}><strong>{t("miniSplits")}</strong><span>{t("miniSplitsShort")}</span></Link>
          <Link href={h("/contact")}><strong>{t("shoppingHelp")}</strong><span>{t("shoppingHelpShort")}</span></Link>
        </div>
      </div>
    </section>

    {featured.length>0&&<section className="wrap section home-products">
      <div className="section-title">
        <div><h2>{t("featuredProducts")}</h2></div>
        <Link href={h("/units")}>{t("viewAllUnits")}</Link>
      </div>
      <div className="product-grid">{featured.slice(0,8).map(p=><ProductCard key={p.id} product={p} locale={locale}/>)}</div>
    </section>}

    <section className="band-light">
      <div className="wrap home-parts-strip">
        <div>
          <p className="eyebrow">{t("repairService")}</p>
          <h2>{t("popularParts")}</h2>
        </div>
        <nav className="part-link-row" aria-label={t("popularParts")}>
          <Link href={h("/parts/capacitors")}>{t("capacitors")}</Link>
          <Link href={h("/parts/contactors-relays")}>{t("contactors")}</Link>
          <Link href={h("/parts/motors")}>{t("motors")}</Link>
          <Link href={h("/parts/thermostats")}>{t("thermostats")}</Link>
        </nav>
      </div>
    </section>

    <section className="wrap brand-strip" aria-label={t("brandsWeCarry")}>
      <span>{t("brandsWeCarry")}</span>
      <div>{SITE.featuredBrands.map((brand)=><strong key={brand}>{brand}</strong>)}</div>
    </section>

    <section className="home-support">
      <div className="wrap home-support-inner">
        <div>
          <p className="eyebrow">{t("helpFind")}</p>
          <h2>{t("talkWith")}</h2>
        </div>
        <div className="support-actions">
          <a className="btn primary" href={"tel:"+SITE.phoneE164}>{SITE.phone}</a>
          <Link className="btn ghost" href={h("/contact")}>{t("contactUs")}</Link>
        </div>
      </div>
    </section>
  </main>;
}
