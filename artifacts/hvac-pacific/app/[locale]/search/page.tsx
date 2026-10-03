import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { searchProducts } from "@/lib/shopify/catalog";

export const metadata: Metadata = {
  title: "Search | hvacpacific",
  robots: { index: false, follow: true },
};

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q = "" } = await searchParams;
  const products = q ? await searchProducts(q, locale) : [];

  return (
    <main id="main">
      <div className="wrap page-shell">
        <Breadcrumbs locale={locale} items={[{ name: "Search", path: "/search" }]} />
        <header className="page-head">
          <h1>Search HVAC equipment &amp; parts</h1>
          {q && <p>{products.length} results for <strong>{q}</strong></p>}
        </header>
        <form action={locale === "zh" ? "/zh/search" : "/search"} className="standalone-search">
          <input
            type="search"
            name="q"
            defaultValue={q}
            required
            placeholder="Model, part, brand or specification"
          />
          <button className="btn primary">Search</button>
        </form>
        {products.length ? (
          <div className="product-grid search-results">
            {products.map((p) => <ProductCard key={p.id} product={p} locale={locale} />)}
          </div>
        ) : q ? (
          <div className="empty-state">
            <h2>No products found</h2>
            <p>Try a model number, brand, component type or shorter search.</p>
          </div>
        ) : null}
      </div>
    </main>
  );
}