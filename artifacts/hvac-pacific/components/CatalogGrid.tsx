"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { ProductCardData } from "@/lib/shopify/shared";
import { metafieldMap, parseKeySpecs } from "@/lib/shopify/shared";
import { ProductCard } from "./ProductCard";

type Props = { products: ProductCardData[]; locale: string; kind: "units" | "parts" };

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

export function CatalogGrid({ products, locale, kind }: Props) {
  const t = useTranslations("Commerce.catalog");
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const initial = {
    brand: search.get("brand") || "",
    tonnage: search.get("tonnage") || "",
    refrigerant: search.get("refrigerant") || "",
    system: search.get("system") || "",
    attribute: search.get("attribute") || "",
    price: search.get("price") || "",
  };
  const [filters, setFilters] = useState(initial);

  const options = useMemo(() => {
    const brands: string[] = [], tonnage: string[] = [], refrigerant: string[] = [], system: string[] = [], attribute: string[] = [];
    for (const p of products) {
      const m = metafieldMap(p);
      brands.push(p.vendor);
      if (m.tonnage) tonnage.push(m.tonnage);
      if (m.refrigerant) refrigerant.push(m.refrigerant);
      if (m.system_type) system.push(m.system_type);
      for (const spec of parseKeySpecs(m.key_specs)) {
        const k = spec.label.toLowerCase();
        if (/(mfd|voltage|amps|horsepower|hp|rpm)/.test(k)) attribute.push(`${spec.label}: ${spec.value}`);
      }
    }
    return { brands: unique(brands), tonnage: unique(tonnage), refrigerant: unique(refrigerant), system: unique(system), attribute: unique(attribute).slice(0, 40) };
  }, [products]);

  const filtered = useMemo(() => products.filter((p) => {
    const m = metafieldMap(p);
    const price = Number(p.priceRange.minVariantPrice.amount);
    if (filters.brand && p.vendor !== filters.brand) return false;
    if (filters.tonnage && m.tonnage !== filters.tonnage) return false;
    if (filters.refrigerant && m.refrigerant !== filters.refrigerant) return false;
    if (filters.system && m.system_type !== filters.system) return false;
    if (filters.attribute && !parseKeySpecs(m.key_specs).some((s) => `${s.label}: ${s.value}` === filters.attribute)) return false;
    if (filters.price === "under-100" && price >= 100) return false;
    if (filters.price === "100-500" && (price < 100 || price > 500)) return false;
    if (filters.price === "500-2000" && (price < 500 || price > 2000)) return false;
    if (filters.price === "2000-plus" && price < 2000) return false;
    return true;
  }), [products, filters]);

  function update(key: keyof typeof filters, value: string) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    const params = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => v && params.set(k, v));
    router.replace(params.size ? `${pathname}?${params}` : pathname, { scroll: false });
  }

  function reset() {
    const empty = { brand: "", tonnage: "", refrigerant: "", system: "", attribute: "", price: "" };
    setFilters(empty);
    router.replace(pathname, { scroll: false });
  }

  return (
    <div className="catalog-layout">
      <aside className="filters" aria-label={t("aria")}>
        <div className="filter-head"><strong>{t("title")}</strong><button type="button" onClick={reset}>{t("reset")}</button></div>
        <Filter allLabel={t("all")} label={t("brand")} value={filters.brand} values={options.brands} onChange={(v) => update("brand", v)} />
        {kind === "units" && <Filter allLabel={t("all")} label={t("tonnage")} value={filters.tonnage} values={options.tonnage} onChange={(v) => update("tonnage", v)} />}
        <Filter allLabel={t("all")} label={t("refrigerant")} value={filters.refrigerant} values={options.refrigerant} onChange={(v) => update("refrigerant", v)} />
        {kind === "units" && <Filter allLabel={t("all")} label={t("systemType")} value={filters.system} values={options.system} onChange={(v) => update("system", v)} />}
        {kind === "parts" && options.attribute.length > 0 && <Filter allLabel={t("all")} label={t("keySpecification")} value={filters.attribute} values={options.attribute} onChange={(v) => update("attribute", v)} />}
        <Filter allLabel={t("all")} label={t("price")} value={filters.price} values={["under-100","100-500","500-2000","2000-plus"]} labels={{"under-100":t("under100"),"100-500":t("from100to500"),"500-2000":t("from500to2000"),"2000-plus":t("over2000")}} onChange={(v) => update("price", v)} />
      </aside>
      <section>
        <div className="results-line"><strong>{filtered.length}</strong> {t("products")}</div>
        {filtered.length ? <div className="product-grid">{filtered.map((p) => <ProductCard key={p.id} product={p} locale={locale} />)}</div> : <div className="empty-state"><h2>{t("noMatchingTitle")}</h2><p>{t("noMatchingText")}</p><button className="btn ghost" onClick={reset}>{t("clearFilters")}</button></div>}
      </section>
    </div>
  );
}

function Filter({ label, allLabel, value, values, onChange, labels = {} }: { label:string; allLabel:string; value:string; values:string[]; onChange:(v:string)=>void; labels?:Record<string,string> }) {
  if (!values.length) return null;
  return <label className="filter"><span>{label}</span><select value={value} onChange={(e)=>onChange(e.target.value)}><option value="">{allLabel}</option>{values.map((v)=><option value={v} key={v}>{labels[v] ?? v}</option>)}</select></label>;
}
