import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductPurchase } from "@/components/ProductPurchase";
import { ProductCard } from "@/components/ProductCard";
import { hrefFor } from "@/components/paths";
import { SITE } from "@/config/site";
import { localizedAlternates } from "@/lib/seo";
import { ALL_SECTIONS, productMatchesSection, sectionPath } from "@/lib/catalog-config";
import { boolMeta, getCollection, getGuideArticles, getProduct, getProductRecommendations, metafieldMap, parseFaq, parseKeySpecs } from "@/lib/shopify/catalog";

type P = { params: Promise<{ locale: string; handle: string }> };
export const revalidate = 3600;

function shortTitle(value: string) {
  return value.length > 58 ? value.slice(0, 55).replace(/\s+\S*$/, "") + "…" : value;
}

function brandSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function isBlockedStatus(value?: string) {
  const status = (value ?? "").trim().toUpperCase();
  return status === "HOLD" || status === "NEEDS DATA";
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, handle } = await params;
  const product = await getProduct(handle, locale);
  if (!product) return {};
  const meta = metafieldMap(product);
  const blocked = isBlockedStatus(meta.site_status);
  const path = "/products/" + handle;
  const description = (product.seo.description || product.description || "Shop " + product.title + " from HVAC Pacific.")
    .replace(/\s+/g, " ")
    .slice(0, 155);
  let noindex = blocked;
  if (locale === "zh") {
    const en = await getProduct(handle, "en").catch(() => null);
    noindex = blocked || Boolean(en && en.title === product.title && en.description === product.description);
  }
  return {
    title: shortTitle(product.seo.title || product.title) + " | " + SITE.brand,
    description,
    robots: noindex ? { index: false, follow: true } : undefined,
    alternates: localizedAlternates(locale, path),
    openGraph: {
      type: "website",
      title: product.title,
      description,
      url: SITE.domain + hrefFor(locale, path),
      images: product.featuredImage
        ? [{ url: product.featuredImage.url, alt: product.featuredImage.altText || product.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description,
      images: product.featuredImage ? [product.featuredImage.url] : undefined,
    },
  };
}

export default async function ProductPage({ params }: P) {
  const { locale, handle } = await params;
  const product = await getProduct(handle, locale);
  if (!product) notFound();

  const [t, cat] = await Promise.all([
    getTranslations({ locale, namespace: "ProductPage" }),
    getTranslations({ locale, namespace: "Category" }),
  ]);
  const m = metafieldMap(product);
  if (isBlockedStatus(m.site_status)) notFound();
  const section = ALL_SECTIONS.find((s) => productMatchesSection(product, s.slug));
  const specs = [
    [t("brand"), product.vendor],
    [t("model"), m.outdoor_model || m.indoor_model || m.furnace_model || product.variants.nodes[0]?.sku || ""],
    [t("capacity"), m.tonnage ? (locale === "zh" ? m.tonnage + " 吨" : m.tonnage + " Ton") : ""],
    ["BTU", m.btu],
    [t("systemType"), m.system_type],
    [t("refrigerant"), m.refrigerant],
    ["SEER2", m.seer2],
    ["EER2", m.eer2],
    ["HSPF2", m.hspf2],
    ["AFUE", m.afue],
    ...parseKeySpecs(m.key_specs).map((x) => [x.label, x.value]),
  ].filter((x) => x[1]);

  const productFaq = parseFaq(m.faq);
  const [recs, guides, categoryCollection] = await Promise.all([
    getProductRecommendations(product.id, locale).catch(() => []),
    getGuideArticles(locale, 20).catch(() => []),
    section ? getCollection(section.slug, locale).catch(() => null) : Promise.resolve(null),
  ]);
  const categoryMeta = Object.fromEntries(
    (categoryCollection?.metafields ?? []).filter(Boolean).map((field) => [field!.key, field!.value]),
  );
  const categoryFaq = parseFaq(categoryMeta.faq);
  const faq = productFaq.length ? productFaq : categoryFaq;
  const guideTerms = [product.vendor, section?.title, m.site_category, m.refrigerant]
    .filter((value): value is string => Boolean(value))
    .map((value) => value.toLowerCase());
  const relatedGuides = guides
    .map((guide) => {
      const haystack = [guide.title, ...guide.tags].join(" ").toLowerCase();
      const score = guideTerms.reduce((total, term) => total + (haystack.includes(term) ? 2 : 0), 0);
      return { guide, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(({ guide }) => guide);

  const variant = product.variants.nodes.find((v) => v.availableForSale) ?? product.variants.nodes[0];
  const mpn =
    product.vendor.toLowerCase() === SITE.brand.toLowerCase()
      ? undefined
      : m.outdoor_model || m.indoor_model || m.furnace_model || undefined;

  const productJson = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    url: SITE.domain + hrefFor(locale, "/products/" + handle),
    image: product.images.nodes.map((i) => i.url),
    brand: product.vendor ? { "@type": "Brand", name: product.vendor } : undefined,
    sku: variant?.sku || undefined,
    mpn,
    category: m.site_category || product.productType || undefined,
    offers: variant
      ? {
          "@type": "Offer",
          priceCurrency: variant.price.currencyCode,
          price: variant.price.amount,
          availability: product.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
          url: SITE.domain + hrefFor(locale, "/products/" + handle),
          seller: { "@type": "Organization", name: SITE.displayName },
        }
      : undefined,
  };

  const docs = [
    [t("specSheet"), m.spec_sheet_url],
    [t("installationManual"), m.manual_url],
    [t("safetyDataSheet"), m.sds_url],
  ].filter((x) => x[1]);
  const components = [
    [t("outdoorUnit"), m.outdoor_model],
    [t("indoorUnit"), m.indoor_model],
    [t("furnace"), m.furnace_model],
  ].filter((x) => x[1]);

  return (
    <main id="main">
      <div className="wrap page-shell">
        <Breadcrumbs
          locale={locale}
          items={[
            ...(section
              ? [
                  { name: section.kind === "units" ? t("units") : t("parts"), path: "/" + section.kind },
                  { name: cat(`sections.${section.slug}.title`), path: sectionPath(section) },
                ]
              : []),
            { name: product.title, path: "/products/" + handle },
          ]}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJson).replace(/</g, "\\u003c") }}
        />
        {boolMeta(m.three_phase) && (
          <div className="warning-banner">
            <strong>{t("threePhaseTitle")}</strong> {t("threePhaseText")}
          </div>
        )}

        <section className="pdp-top">
          <div className="gallery">
            {product.images.nodes.length ? (
              product.images.nodes.map((img, i) => (
                <div className={i === 0 ? "gallery-main" : "gallery-item"} key={img.url}>
                  <Image
                    src={img.url}
                    alt={img.altText || t("imageAlt", { title: product.title, number: i + 1 })}
                    width={img.width || 1000}
                    height={img.height || 1000}
                    priority={i === 0}
                    sizes={i === 0 ? "(max-width:850px) 100vw, 50vw" : "(max-width:850px) 50vw, 25vw"}
                  />
                </div>
              ))
            ) : (
              <div className="gallery-main image-placeholder">{t("imageUnavailable")}</div>
            )}
          </div>
          <div className="pdp-info">
            <p className="eyebrow"><Link href={hrefFor(locale, "/brands/" + brandSlug(product.vendor))}>{product.vendor}</Link></p>
            <h1>{product.title}</h1>
            {mpn && <p className="model-line">{t("model")}: <strong>{mpn}</strong></p>}
            {product.description && <p className="pdp-summary">{product.description}</p>}
            <ProductPurchase product={product} />
            <Link
              className="installer-link"
              href={hrefFor(locale, "/need-installer?product=" + encodeURIComponent(product.title))}
            >
              {t("needInstaller")}
            </Link>
          </div>
        </section>

        {components.length > 0 && (
          <section className="pdp-section">
            <h2>{t("systemComponents")}</h2>
            <div className="spec-table">
              {components.map(([a, b]) => <div key={a}><span>{a}</span><strong>{b}</strong></div>)}
            </div>
          </section>
        )}

        {specs.length > 0 && (
          <section className="pdp-section">
            <h2>{t("specifications")}</h2>
            <div className="spec-table">
              {specs.map(([a, b]) => <div key={a}><span>{a}</span><strong>{b}</strong></div>)}
            </div>
          </section>
        )}

        {(m.ahri_number || m.scaqmd_1111_compliant || m.cec_listed) && (
          <section className="pdp-section">
            <h2>{t("compliance")}</h2>
            <div className="badges">
              {m.ahri_number && <a className="badge" href="https://www.ahridirectory.org/" target="_blank" rel="noreferrer">AHRI #{m.ahri_number}</a>}
              {boolMeta(m.scaqmd_1111_compliant) && <span className="badge">{t("scaqmd")}</span>}
              {boolMeta(m.cec_listed) && <span className="badge">{t("cec")}</span>}
            </div>
          </section>
        )}

        {docs.length > 0 && (
          <section className="pdp-section">
            <h2>{t("documents")}</h2>
            <div className="document-links">
              {docs.map(([name, url]) => <a key={name} href={url} target="_blank" rel="noreferrer">{name} ↗</a>)}
            </div>
          </section>
        )}

        <section className="pdp-section info-callout">
          <h2>{t("installNoteTitle")}</h2>
          <p>{t("installNote")}</p>
        </section>

        {boolMeta(m.prop65) && (
          <section className="pdp-section prop65">
            <h2>{t("prop65Title")}</h2>
            <p>{t("prop65Text")}</p>
          </section>
        )}

        {product.descriptionHtml && (
          <section className="pdp-section">
            <h2>{t("productDetails")}</h2>
            <div className="prose" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
          </section>
        )}

        {faq.length > 0 && (
          <section className="pdp-section faq">
            <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({"@context":"https://schema.org","@type":"FAQPage",mainEntity:faq.map((f)=>({"@type":"Question",name:f.q,acceptedAnswer:{"@type":"Answer",text:f.a}}))}).replace(/</g,"\\u003c")}} />
            <h2>{t("faq")}</h2>
            {faq.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
          </section>
        )}

        {recs.length > 0 && (
          <section className="pdp-section">
            <h2>{t("completeInstall")}</h2>
            <div className="product-grid compact-grid">
              {recs.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} locale={locale} />)}
            </div>
          </section>
        )}

        {relatedGuides.length > 0 && (
          <section className="pdp-section">
            <h2>{t("relatedGuides")}</h2>
            <div className="guide-links">
              {relatedGuides.slice(0, 3).map((g) => <Link key={g.id} href={hrefFor(locale, "/guides/" + g.handle)}>{g.title}</Link>)}
            </div>
          </section>
        )}
      </div>
      {variant && (
        <div className="mobile-buy">
          <strong>{new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US", { style: "currency", currency: variant.price.currencyCode }).format(Number(variant.price.amount))}</strong>
          <a href={"tel:" + SITE.phoneE164}>{t("call")}</a>
          <a href="#purchase">{t("order")}</a>
        </div>
      )}
    </main>
  );
}
