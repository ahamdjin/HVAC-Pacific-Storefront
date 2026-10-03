"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ProductCardData } from "@/lib/shopify/shared";
import { hrefFor } from "./paths";
import { metafieldMap } from "@/lib/shopify/shared";

export function money(amount: string, currencyCode = "USD", locale = "en") {
  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

export function ProductCard({ product, locale }: { product: ProductCardData; locale: string }) {
  const t = useTranslations("Commerce.productCard");
  const price = product.priceRange.minVariantPrice;
  const m = metafieldMap(product);
  const meta = [product.vendor, m.tonnage ? t("ton", { value: m.tonnage }) : "", m.refrigerant].filter(Boolean);
  return (
    <article className="product-card">
      <Link href={hrefFor(locale, `/products/${product.handle}`)} className="product-image">
        {product.featuredImage ? (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText || product.title}
            width={product.featuredImage.width || 800}
            height={product.featuredImage.height || 800}
            sizes="(max-width:640px) 50vw, (max-width:1000px) 33vw, 25vw"
          />
        ) : (
          <span className="image-placeholder">{t("imageUnavailable")}</span>
        )}
      </Link>
      <div className="product-card-body">
        {meta.length > 0 && <p className="product-meta">{meta.join(" · ")}</p>}
        <h3><Link href={hrefFor(locale, `/products/${product.handle}`)}>{product.title}</Link></h3>
        <div className="product-card-bottom">
          <strong>{money(price.amount, price.currencyCode, locale)}</strong>
          <span className={product.availableForSale ? "stock yes" : "stock no"}>
            {product.availableForSale ? t("available") : t("unavailable")}
          </span>
        </div>
        <small>{t("fulfillment")}</small>
      </div>
    </article>
  );
}
