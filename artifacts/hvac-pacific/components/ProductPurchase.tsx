"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { ProductDetailData } from "@/lib/shopify/shared";
import { boolMeta, metafieldMap } from "@/lib/shopify/shared";
import { money } from "./ProductCard";
import { SITE } from "@/config/site";

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

  async function add() {
    if (requiresEpa && (!cert.trim() || !tech.trim() || !epaAck)) {
      setEpaOpen(true);
      return;
    }
    if (!canAdd || !variant) return;
    setBusy(true);
    setMessage("");
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
        body: JSON.stringify({ variantId: variant.id, quantity: 1, attributes }),
      });
      if (!response.ok) throw new Error(t("addError"));
      setMessage(t("added"));
      (window as unknown as { dataLayer?: unknown[] }).dataLayer?.push({
        event: "add_to_cart",
        ecommerce: {
          currency: variant.price.currencyCode,
          value: Number(variant.price.amount),
          items: [{ item_id: variant.sku || variant.id, item_name: product.title, item_brand: product.vendor, price: Number(variant.price.amount), quantity: 1 }],
        },
      });
      closeEpa();
    } catch (e) {
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
      <button ref={addButtonRef} className="btn primary add-cart" type="button" disabled={!canAdd || busy} onClick={add}>{busy ? t("adding") : t("addToCart")}</button>
      {message && <p className="form-message" role="status">{message}</p>}
      {requiresEpa && <p className="gate-note">{t("gateNote")}</p>}

      {variant && (
        <div className="mobile-buy" aria-label={t("mobilePurchase")}>
          <strong>{money(variant.price.amount, variant.price.currencyCode, locale)}</strong>
          <a href={"tel:" + SITE.phoneE164}>{t("call")}</a>
          <button type="button" disabled={!canAdd || busy} onClick={add}>{busy ? t("adding") : t("addToCart")}</button>
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
            <button className="btn primary" type="button" disabled={!cert.trim() || !tech.trim() || !epaAck || busy} onClick={add}>{t("verifyAdd")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
