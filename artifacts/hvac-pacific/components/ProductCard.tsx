import Image from "next/image";
import Link from "next/link";
import type { ProductCardData } from "@/lib/shopify/catalog";
import { hrefFor } from "./paths";
import { metafieldMap } from "@/lib/shopify/catalog";

export function money(amount: string, currencyCode = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

export function ProductCard({ product, locale }: { product: ProductCardData; locale: string }) {
  const price = product.priceRange.minVariantPrice;
  const m = metafieldMap(product);
  const meta = [product.vendor, m.tonnage ? `${m.tonnage} Ton` : "", m.refrigerant].filter(Boolean);
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
          <span className="image-placeholder">Image unavailable</span>
        )}
      </Link>
      <div className="product-card-body">
        {meta.length > 0 && <p className="product-meta">{meta.join(" · ")}</p>}
        <h3><Link href={hrefFor(locale, `/products/${product.handle}`)}>{product.title}</Link></h3>
        <div className="product-card-bottom">
          <strong>{money(price.amount, price.currencyCode)}</strong>
          <span className={product.availableForSale ? "stock yes" : "stock no"}>
            {product.availableForSale ? "Available" : "Unavailable"}
          </span>
        </div>
        <small>Local pickup / delivery within 20 mi</small>
      </div>
    </article>
  );
}
