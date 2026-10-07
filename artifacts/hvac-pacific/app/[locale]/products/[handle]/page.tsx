import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductPurchase } from "@/components/ProductPurchase";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductCard } from "@/components/ProductCard";
import { ManufacturerResources } from "@/components/ManufacturerResources";
import { parseManufacturerResources } from "@/lib/manufacturer-resources";
import { hrefFor } from "@/components/paths";
import { SITE } from "@/config/site";
import { localizedAlternates, seoMetaDescription, seoPageTitle } from "@/lib/seo";
import { ALL_SECTIONS, productMatchesSection, sectionPath } from "@/lib/catalog-config";
import { boolMeta, getCollection, getGuideArticles, getProduct, getProductRecommendations, metafieldMap, parseFaq, parseKeySpecs } from "@/lib/shopify/catalog";

type P = { params: Promise<{ locale: string; handle: string }> };
export const revalidate = 3600;

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
  const description = seoMetaDescription(
    product.seo.description || product.description || "Shop " + product.title + " from HVAC Pacific.",
  );
  let noindex = blocked;
  if (locale === "zh") {
    const en = await getProduct(handle, "en").catch(() => null);
    noindex = blocked || Boolean(en && en.title === product.title && en.description === product.description);
  }
  return {
    title: seoPageTitle(product.seo.title || product.title),
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
  const manufacturerResources = parseManufacturerResources(m.manufacturer_resources);
  const keySpecs = parseKeySpecs(m.key_specs);
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
    ...keySpecs.map((x) => [x.label, x.value]),
  ].filter((x) => x[1]);

  const highlights = [
    [t("capacity"), m.tonnage ? (locale === "zh" ? m.tonnage + " 吨" : m.tonnage + " Ton") : ""],
    [t("refrigerant"), m.refrigerant],
    ["SEER2", m.seer2],
    ["HSPF2", m.hspf2],
    ["EER2", m.eer2],
    ...keySpecs.slice(0, 4).map((item) => [item.label, item.value]),
  ].filter((item) => item[1]).slice(0, 6);

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

  const productCategories = [
    m.google_product_category
      ? {
          "@type": "CategoryCode",
          inCodeSet: "https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt",
          codeValue: m.google_product_category,
        }
      : undefined,
    m.site_category || product.productType || undefined,
  ].filter(Boolean);

  const additionalProperty = [
    [t("capacity"), m.tonnage ? (locale === "zh" ? m.tonnage + " 吨" : m.tonnage + " Ton") : ""],
    ["BTU", m.btu],
    [t("refrigerant"), m.refrigerant],
    ["SEER2", m.seer2],
    ["EER2", m.eer2],
    ["HSPF2", m.hspf2],
    ["AFUE", m.afue],
  ]
    .filter((item) => item[1])
    .map(([name, value]) => ({ "@type": "PropertyValue", name, value }));

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
    model: m.outdoor_model || m.indoor_model || m.furnace_model || variant?.sku || undefined,
    category: productCategories.length ? productCategories : undefined,
    additionalProperty: additionalProperty.length ? additionalProperty : undefined,
    offers: variant
      ? {
          "@type": "Offer",
          priceCurrency: variant.price.currencyCode,
          price: variant.price.amount,
          availability: product.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
          url: SITE.domain + hrefFor(locale, "/products/" + handle),
          seller: { "@id": SITE.domain + "/#organization" },
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
          <ProductGallery
            images={product.images.nodes}
            title={product.title}
            unavailableLabel={t("imageUnavailable")}
            labels={{
              gallery: t("gallery"),
              viewImage: t("viewImage"),
              previousImage: t("previousImage"),
              nextImage: t("nextImage"),
              closeGallery: t("closeGallery"),
            }}
          />
          <div className="pdp-info">
            <p className="eyebrow"><Link href={hrefFor(locale, "/brands/" + brandSlug(product.vendor))}>{product.vendor}</Link></p>
            <h1>{product.title}</h1>
            {mpn && <p className="model-line">{t("model")}: <strong>{mpn}</strong></p>}
            {product.description && <p className="pdp-summary">{product.description}</p>}
            {!manufacturerResources && (product.descriptionHtml || product.description) && <a className="pdp-description-link" href="#description">{t("description")}</a>}
            <ProductPurchase product={product} />
            <Link
              className="installer-link"
              href={hrefFor(locale, "/need-installer?product=" + encodeURIComponent(product.title))}
            >
              {t("needInstaller")}
            </Link>
          </div>
        </section>

        {manufacturerResources && (
          <ManufacturerResources
            data={manufacturerResources}
            descriptionHtml={product.descriptionHtml}
            descriptionText={product.description}
          />
        )}

        {!manufacturerResources && (product.descriptionHtml || product.description) && (
          <section className="pdp-section pdp-description-section" id="description">
            <h2>{t("description")}</h2>
            {product.descriptionHtml
              ? <div className="prose" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
              : <p className="prose">{product.description}</p>}
          </section>
        )}

        {highlights.length > 0 && (
          <section className="pdp-section">
            <h2>{t("highlights")}</h2>
            <div className="highlight-grid">
              {highlights.map(([label,value])=><div key={label}><span>{label}</span><strong>{value}</strong></div>)}
            </div>
          </section>
        )}

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
              {m.seer2 && <span className="badge">SEER2 {m.seer2}</span>}
              {m.eer2 && <span className="badge">EER2 {m.eer2}</span>}
              {m.hspf2 && <span className="badge">HSPF2 {m.hspf2}</span>}
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
  </main>
  );
}
