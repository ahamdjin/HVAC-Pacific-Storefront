import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { CatalogGrid } from "@/components/CatalogGrid";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getAllProducts, searchProducts } from "@/lib/shopify/catalog";

export async function generateMetadata({params,searchParams}:{params:Promise<{locale:string}>;searchParams:Promise<{q?:string}>}):Promise<Metadata>{
  const {locale}=await params;
  const {q}=await searchParams;
  const t=await getTranslations({locale,namespace:"Commerce.search"});
  const catalog=await getTranslations({locale,namespace:"Commerce.catalog"});
  return { title: q?.trim()?t("title"):catalog("allProducts"), robots:{index:false,follow:true} };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q = "" } = await searchParams;
  const [products,t,catalog]=await Promise.all([
    q.trim() ? searchProducts(q, locale) : getAllProducts(locale),
    getTranslations({locale,namespace:"Commerce.search"}),
    getTranslations({locale,namespace:"Commerce.catalog"}),
  ]);

  return (
    <main id="main">
      <div className="wrap page-shell">
        <Breadcrumbs locale={locale} items={[{ name: t("breadcrumb"), path: "/search" }]} />
        <header className="page-head">
          <h1>{q.trim()?t("title"):catalog("allProducts")}</h1>
          {q && <p>{t("results",{count:products.length,query:q})}</p>}
        </header>
        <form action={locale === "zh" ? "/zh/search" : "/search"} className="standalone-search">
          <input type="search" name="q" defaultValue={q} placeholder={t("placeholder")} />
          <button className="btn primary">{t("button")}</button>
        </form>
        {products.length ? (
          <Suspense fallback={null}><CatalogGrid products={products} locale={locale} kind="all" /></Suspense>
        ) : q ? (
          <div className="empty-state">
            <h2>{t("noneTitle")}</h2>
            <p>{t("noneText")}</p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
