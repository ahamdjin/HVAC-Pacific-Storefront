"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { ProductDetailData } from "@/lib/shopify/shared";
import { boolMeta, metafieldMap } from "@/lib/shopify/shared";
import { money } from "./ProductCard";
import { SITE } from "@/config/site";
import Link from "next/link";
import { hrefFor } from "./paths";
import { notifyCartChanged } from "@/lib/cart-events";

export function ProductPurchase({ product }: { product: ProductDetailData }) {
  const t = useTranslations("Commerce.purchase");
  const locale = useLocale();
  const m = metafieldMap(product);
  const variants = product.variants.nodes;
  const [variantId, setVariantId] = useState(variants.find((v) => v.availableForSale)?.id ?? variants[0]?.id ?? "");
  const variant = useMemo(() => variants.find((v) => v.id === variantId) ?? variants[0], [variants, variantId]);
  const [epaOpen, setEpaOpen] = useState(false);
  const [cert, setCert] = useState("");
  const [tech, setTech] = useState("");
  const [epaAck, setEpaAck] = useState(false);
  const [installAck, setInstallAck] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [added, setAdded] = useState(false);
  const [pendingAction, setPendingAction] = useState<"cart" | "checkout">("cart");
  const [checkoutLink, setCheckoutLink] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const certRef = useRef<HTMLInputElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  const requiresEpa = boolMeta(m.requires_epa608);
  const requiresInstall = boolMeta(m.requires_licensed_install);
  const canAdd = Boolean(variant?.availableForSale) && (!requiresInstall || installAck);

  useEffect(() => {
    if (!epaOpen) return;
    certRef.current?.focus();
  }, [epaOpen]);

  useEffect(() => {
    if (!variant) return;
    const dataLayer = (window as unknown as { dataLayer?: unknown[] }).dataLayer;
    dataLayer?.push({
      event: "view_item",
      ecommerce: {
        currency: variant.price.currencyCode,
        value: Number(variant.price.amount),
        items: [{ item_id: variant.sku || variant.id, item_name: product.title, item_brand: product.vendor, price: Number(variant.price.amount), quantity: 1 }],
      },
    });
  }, [product.title, product.vendor, variant]);

  function closeEpa() {
    setEpaOpen(false);
    requestAnimationFrame(() => addButtonRef.current?.focus());
  }

  function handleDialogKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeEpa();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]'
      ) ?? [],
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  async function add(action: "cart" | "checkout" = "cart") {
    if (busy) return;
    setPendingAction(action);
    if (requiresEpa && (!cert.trim() || !tech.trim() || !epaAck)) {
      setEpaOpen(true);
      return;
    }
    if (!canAdd || !variant) return;
    setBusy(true);
    setMessage("");
    setAdded(false);
    setCheckoutLink("");
    // Open during the click, before awaiting Shopify, to avoid popup blocking.
    const checkoutTab = action === "checkout" ? window.open("about:blank", "_blank") : null;
    if (checkoutTab) checkoutTab.opener = null;
    const attributes = [
      ...(requiresEpa ? [
        { key: "EPA 608 Certification", value: cert.trim() },
        { key: "Certified Technician", value: tech.trim() },
        { key: "EPA 608 Acknowledgement", value: "Confirmed" },
      ] : []),
      ...(requiresInstall ? [{ key: "Licensed Install Acknowledgement", value: "Confirmed" }] : []),
    ];
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: variant.id,
          quantity: 1,
          attributes,
          checkoutOnly: action === "checkout",
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.id || !Array.isArray(data?.lines?.nodes)) {
        throw new Error(typeof data?.error === "string" ? data.error : t("addError"));
      }
      if (action === "cart") {
        setMessage(t("added"));
        setAdded(true);
        notifyCartChanged(data);
        (window as unknown as { dataLayer?: unknown[] }).dataLayer?.push({
          event: "add_to_cart",
          ecommerce: {
            currency: variant.price.currencyCode,
            value: Number(variant.price.amount),
            items: [{ item_id: variant.sku || variant.id, item_name: product.title, item_brand: product.vendor, price: Number(variant.price.amount), quantity: 1 }],
          },
        });
      }
      if (action === "checkout") {
        const destination = new URL(data.checkoutUrl);
        if (destination.protocol !== "https:") throw new Error(t("checkoutError"));
        setCheckoutLink(destination.href);
        setMessage(t("checkoutReady"));
        (window as unknown as { dataLayer?: unknown[] }).dataLayer?.push({
          event: "begin_checkout",
          ecommerce: {
            currency: data.cost.subtotalAmount.currencyCode,
            value: Number(data.cost.subtotalAmount.amount),
            items: data.lines.nodes.map((line: {
              quantity: number;
              merchandise: { id: string; price: { amount: string }; product: { title: string } };
            }) => ({
              item_id: line.merchandise.id,
              item_name: line.merchandise.product.title,
              price: Number(line.merchandise.price.amount),
              quantity: line.quantity,
            })),
          },
        });
        if (checkoutTab && !checkoutTab.closed) {
          checkoutTab.location.replace(destination.href);
        } else if (window.self === window.top) {
          window.location.assign(destination.href);
        }
      }
      closeEpa();
    } catch (e) {
      if (checkoutTab && !checkoutTab.closed) checkoutTab.close();
      setMessage(e instanceof Error ? e.message : t("addError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="purchase-box" id="purchase">
      {variants.length > 1 && (
        <label className="variant-picker"><span>{t("option")}</span><select value={variantId} onChange={(e)=>setVariantId(e.target.value)}>{variants.map((v)=><option key={v.id} value={v.id} disabled={!v.availableForSale}>{v.title}{!v.availableForSale ? t("unavailableSuffix") : ""}</option>)}</select></label>
      )}
      <div className="pdp-price">{variant ? money(variant.price.amount, variant.price.currencyCode, locale) : t("unavailable")}</div>
      <p className="fulfillment">{t("fulfillment")}</p>
      {requiresInstall && (
        <label className="ack"><input type="checkbox" checked={installAck} onChange={(e)=>setInstallAck(e.target.checked)} /> <span>{t("installAck")}</span></label>
      )}
      <button ref={addButtonRef} className="btn primary add-cart" type="button" disabled={!canAdd || busy} onClick={() => void add("cart")}>{busy && pendingAction === "cart" ? t("adding") : t("addToCart")}</button>
      <button className="btn ghost buy-now" type="button" disabled={!canAdd || busy} onClick={() => void add("checkout")}>{busy && pendingAction === "checkout" ? t("openingCheckout") : t("buyNow")}</button>
      {message && <p className="form-message" role="status">{message} {added && <Link href={hrefFor(locale, "/cart")}>{t("viewCart")}</Link>}</p>}
      {checkoutLink && <p className="form-message"><a href={checkoutLink} target="_blank" rel="noopener noreferrer">{t("openCheckout")}</a></p>}
      {requiresEpa && <p className="gate-note">{t("gateNote")}</p>}

      {variant && (
        <div className="mobile-buy" aria-label={t("mobilePurchase")}>
          <strong>{money(variant.price.amount, variant.price.currencyCode, locale)}</strong>
          <a href={"tel:" + SITE.phoneE164}>{t("call")}</a>
          <button type="button" disabled={!canAdd || busy} onClick={() => void add("checkout")}>{busy && pendingAction === "checkout" ? t("openingCheckout") : t("buyNow")}</button>
        </div>
      )}

      {epaOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(e)=>e.currentTarget===e.target && closeEpa()}>
          <div ref={dialogRef} className="modal" role="dialog" aria-modal="true" aria-labelledby="epa-title" aria-describedby="epa-description" onKeyDown={handleDialogKeyDown}>
            <button className="modal-close" type="button" onClick={closeEpa} aria-label={t("close")}>×</button>
            <h2 id="epa-title">{t("epaTitle")}</h2>
            <p id="epa-description">{t("epaDescription")}</p>
            <label><span>{t("certNumber")}</span><input ref={certRef} value={cert} onChange={(e)=>setCert(e.target.value)} required /></label>
            <label><span>{t("techName")}</span><input value={tech} onChange={(e)=>setTech(e.target.value)} required /></label>
            <label className="ack"><input type="checkbox" checked={epaAck} onChange={(e)=>setEpaAck(e.target.checked)} /><span>{t("epaAck")}</span></label>
            <button className="btn primary" type="button" disabled={!cert.trim() || !tech.trim() || !epaAck || busy} onClick={() => void add(pendingAction)}>{pendingAction === "checkout" ? t("verifyBuy") : t("verifyAdd")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
