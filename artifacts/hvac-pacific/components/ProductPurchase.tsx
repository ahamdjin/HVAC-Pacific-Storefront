"use client";

import { useMemo, useState } from "react";
import type { ProductDetailData } from "@/lib/shopify/catalog";
import { boolMeta, metafieldMap } from "@/lib/shopify/catalog";
import { money } from "./ProductCard";

export function ProductPurchase({ product }: { product: ProductDetailData }) {
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

  const requiresEpa = boolMeta(m.requires_epa608);
  const requiresInstall = boolMeta(m.requires_licensed_install);
  const canAdd = Boolean(variant?.availableForSale) && (!requiresInstall || installAck);

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
        body: JSON.stringify({ variantId: variant.id, quantity: 1, attributes, note: requiresEpa ? `EPA 608 cert: ${cert.trim()} · Technician: ${tech.trim()}` : undefined }),
      });
      if (!response.ok) throw new Error("Unable to add to cart.");
      setMessage("Added to cart.");
      setEpaOpen(false);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to add to cart.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="purchase-box">
      {variants.length > 1 && (
        <label className="variant-picker"><span>Option</span><select value={variantId} onChange={(e)=>setVariantId(e.target.value)}>{variants.map((v)=><option key={v.id} value={v.id} disabled={!v.availableForSale}>{v.title}{!v.availableForSale ? " — unavailable" : ""}</option>)}</select></label>
      )}
      <div className="pdp-price">{variant ? money(variant.price.amount, variant.price.currencyCode) : "Unavailable"}</div>
      <p className="fulfillment">Local pickup · Local delivery within 20 miles</p>
      {requiresInstall && (
        <label className="ack"><input type="checkbox" checked={installAck} onChange={(e)=>setInstallAck(e.target.checked)} /> <span>I understand this equipment must be installed by a licensed contractor with EPA 608 certification and may require a permit.</span></label>
      )}
      <button className="btn primary add-cart" type="button" disabled={!canAdd || busy} onClick={add}>{busy ? "Adding…" : "Add to cart"}</button>
      {message && <p className="form-message" role="status">{message}</p>}
      {requiresEpa && <p className="gate-note">EPA 608 certification verification is required before refrigerant pickup or delivery.</p>}

      {epaOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(e)=>e.currentTarget===e.target && setEpaOpen(false)}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="epa-title">
            <button className="modal-close" type="button" onClick={()=>setEpaOpen(false)} aria-label="Close">×</button>
            <h2 id="epa-title">EPA 608 verification required</h2>
            <p>Certification is verified before pickup/delivery. Orders without valid certification are cancelled and refunded.</p>
            <label><span>EPA 608 certification number</span><input value={cert} onChange={(e)=>setCert(e.target.value)} required /></label>
            <label><span>Certified technician name</span><input value={tech} onChange={(e)=>setTech(e.target.value)} required /></label>
            <label className="ack"><input type="checkbox" checked={epaAck} onChange={(e)=>setEpaAck(e.target.checked)} /><span>I am EPA 608 certified or purchasing for a certified technician.</span></label>
            <button className="btn primary" type="button" disabled={!cert.trim() || !tech.trim() || !epaAck || busy} onClick={add}>Verify details & add</button>
          </div>
        </div>
      )}
    </div>
  );
}
