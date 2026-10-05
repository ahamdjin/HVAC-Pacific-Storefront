import type { Metadata } from "next";
import Link from "next/link";
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
  const vendors=Array.from(new Set(featured.map((product)=>product.vendor).filter(Boolean))).slice(0,5);

  return <main id="main">
    <section className="home-hero-v4">
      <div className="wrap">
        <div className="hero-photo-card">
          <img
            className="hero-photo"
            src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Air_Conditioner_for_a_single_room.jpg"
            alt="Wall-mounted air conditioner in a room"
            loading="eager"
          />
          <div className="hero-photo-overlay">
            <p className="eyebrow">{t("supplyEyebrow")}</p>
            <h1>{t("title")}</h1>
            <p>{t("lead",{miles:SITE.serviceRadiusMiles})}</p>
            <div className="hero-actions">
              <Link className="btn primary" href={h("/units")}>{t("shopUnits")}</Link>
              <Link className="btn soft" href={h("/parts")}>{t("shopParts")}</Link>
            </div>
          </div>
        </div>

        <div className="home-quick-grid">
          <Link href={h("/units")}>
            <span className="quick-index">01</span>
            <strong>{t("shopEquipment")}</strong>
            <small>{t("equipmentShort")}</small>
          </Link>
          <Link href={h("/parts")}>
            <span className="quick-index">02</span>
            <strong>{t("partsHeading")}</strong>
            <small>{t("partsShort")}</small>
          </Link>
          <Link href={h("/units/mini-splits")}>
            <span className="quick-index">03</span>
            <strong>{t("miniSplits")}</strong>
            <small>{t("miniSplitsShort")}</small>
          </Link>
          <Link href={h("/contact")}>
            <span className="quick-index">04</span>
            <strong>{t("shoppingHelp")}</strong>
            <small>{t("shoppingHelpShort")}</small>
          </Link>
        </div>
      </div>
    </section>

    {featured.length>0&&<section className="wrap section home-products-v4">
      <div className="section-title compact-title">
        <div>
          <p className="eyebrow">{t("currentCatalog")}</p>
          <h2>{t("featuredProducts")}</h2>
        </div>
        <Link href={h("/units")}>{t("viewAllUnits")}</Link>
      </div>
      <div className="product-grid">{featured.slice(0,8).map(p=><ProductCard key={p.id} product={p} locale={locale}/>)}</div>
    </section>}

    <section className="parts-band-v4">
      <div className="wrap parts-band-inner">
        <div>
          <p className="eyebrow">{t("repairService")}</p>
          <h2>{t("popularParts")}</h2>
        </div>
        <div className="parts-pills">
          <Link href={h("/parts/capacitors")}>{t("capacitors")}</Link>
          <Link href={h("/parts/contactors-relays")}>{t("contactors")}</Link>
          <Link href={h("/parts/motors")}>{t("motors")}</Link>
          <Link href={h("/parts/thermostats")}>{t("thermostats")}</Link>
        </div>
      </div>
    </section>

    {vendors.length>0&&<section className="wrap home-brands-v4">
      <span>{t("brandsWeCarry")}</span>
      <div>{vendors.map((vendor)=><strong key={vendor}>{vendor}</strong>)}</div>
    </section>}

    <section className="home-help-v4">
      <div className="wrap home-help-inner">
        <div>
          <p className="eyebrow">{t("helpFind")}</p>
          <h2>{t("talkWith")}</h2>
          <p>{t.rich("sendModel",{phone:SITE.phone,call:(chunks)=><a href={"tel:"+SITE.phoneE164}>{chunks}</a>})}</p>
        </div>
        <div className="support-actions">
          <a className="btn primary" href={"tel:"+SITE.phoneE164}>{SITE.phone}</a>
          <Link className="btn ghost" href={h("/contact")}>{t("contactUs")}</Link>
        </div>
      </div>
    </section>
  </main>;
}
