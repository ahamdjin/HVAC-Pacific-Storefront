import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ProductCard } from "@/components/ProductCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { searchProducts } from "@/lib/shopify/catalog";

export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{
  const {locale}=await params;
  const t=await getTranslations({locale,namespace:"Commerce.search"});
  return { title: t("title")+" | hvacpacific", robots:{index:false,follow:true} };
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
  const [products,t]=await Promise.all([
    q ? searchProducts(q, locale) : Promise.resolve([]),
    getTranslations({locale,namespace:"Commerce.search"}),
  ]);

  return (
    <main id="main">
      <div className="wrap page-shell">
        <Breadcrumbs locale={locale} items={[{ name: t("breadcrumb"), path: "/search" }]} />
        <header className="page-head">
          <h1>{t("title")}</h1>
          {q && <p>{t("results",{count:products.length,query:q})}</p>}
        </header>
        <form action={locale === "zh" ? "/zh/search" : "/search"} className="standalone-search">
          <input type="search" name="q" defaultValue={q} required placeholder={t("placeholder")} />
          <button className="btn primary">{t("button")}</button>
        </form>
        {products.length ? (
          <div className="product-grid search-results">
            {products.map((p) => <ProductCard key={p.id} product={p} locale={locale} />)}
          </div>
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
