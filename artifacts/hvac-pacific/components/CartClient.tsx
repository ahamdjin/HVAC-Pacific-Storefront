"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { money } from "./ProductCard";
import { notifyCartChanged } from "@/lib/cart-events";

type Cart = {
  id: string;
  totalQuantity: number;
  checkoutUrl: string;
  cost: { subtotalAmount: { amount:string; currencyCode:string }; totalAmount: { amount:string; currencyCode:string } };
  lines: { nodes: Array<{ id:string; quantity:number; merchandise: { id:string; title:string; price: { amount:string; currencyCode:string }; product:{ title:string; handle:string; featuredImage?:{url:string;altText?:string|null;width?:number|null;height?:number|null}|null } } }> };
};

export function CartClient() {
  const t = useTranslations("Commerce.cart");
  const locale = useLocale();
  const [cart, setCart] = useState<Cart|null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function readCart(response: Response, fallback: string): Promise<Cart> {
    const data = await response.json().catch(() => null);
    if (!response.ok || !Array.isArray(data?.lines?.nodes) || !data?.cost?.subtotalAmount) {
      throw new Error(typeof data?.error === "string" ? data.error : fallback);
    }
    return data as Cart;
  }

  async function load() {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/cart", { cache:"no-store" });
      const loaded = await readCart(r, t("loadError"));
      setCart(loaded);
      notifyCartChanged(loaded);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("loadError"));
    } finally {
      setLoading(false);
    }
  }
  useEffect(()=>{ void load(); },[]);

  async function mutate(lineId: string, quantity?: number) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/cart", {
        method: quantity === undefined ? "DELETE" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lineId, ...(quantity === undefined ? {} : { quantity }) }),
      });
      const updated = await readCart(response, t("updateError"));
      setCart(updated);
      notifyCartChanged(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("updateError"));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="loading-box">{t("loading")}</div>;
  if (error && !cart) return <div className="empty-state"><p role="alert">{error}</p><button type="button" className="btn ghost" onClick={() => void load()}>{t("retry")}</button></div>;
  if (!cart?.lines.nodes.length) return <div className="empty-state"><h2>{t("emptyTitle")}</h2><p>{t("emptyText")}</p></div>;

  return <>{error && <p className="form-message" role="alert">{error}</p>}<div className="cart-layout" aria-busy={busy}>
    <div className="cart-lines">
      {cart.lines.nodes.map((line)=><article className="cart-line" key={line.id}>
        <div className="cart-thumb">{line.merchandise.product.featuredImage && <Image src={line.merchandise.product.featuredImage.url} alt={line.merchandise.product.featuredImage.altText || line.merchandise.product.title} width={120} height={120} />}</div>
        <div><h2>{line.merchandise.product.title}</h2>{line.merchandise.title !== "Default Title" && <p>{line.merchandise.title}</p>}<strong>{money(line.merchandise.price.amount,line.merchandise.price.currencyCode,locale)}</strong></div>
        <div className="qty"><label><span>{t("qty")}</span><input type="number" min={1} step={1} disabled={busy} value={line.quantity} onChange={(e)=>void mutate(line.id,Math.max(1,Math.floor(Number(e.target.value))||1))} /></label><button type="button" disabled={busy} onClick={()=>void mutate(line.id)}>{t("remove")}</button></div>
      </article>)}
    </div>
    <aside className="cart-summary"><h2>{t("summary")}</h2><div><span>{t("subtotal")}</span><strong>{money(cart.cost.subtotalAmount.amount,cart.cost.subtotalAmount.currencyCode,locale)}</strong></div><p>{t("fulfillmentNote")}</p><a className="btn primary checkout" href={cart.checkoutUrl} target="_blank" rel="noopener noreferrer" aria-disabled={busy} onClick={(event) => {
      if (busy) {
        event.preventDefault();
        return;
      }
      (window as unknown as { dataLayer?: unknown[] }).dataLayer?.push({
        event: "begin_checkout",
        ecommerce: {
          currency: cart.cost.subtotalAmount.currencyCode,
          value: Number(cart.cost.subtotalAmount.amount),
          items: cart.lines.nodes.map((line) => ({
            item_id: line.merchandise.id,
            item_name: line.merchandise.product.title,
            price: Number(line.merchandise.price.amount),
            quantity: line.quantity,
          })),
        },
      });
    }}>{t("checkout")}</a></aside>
  </div></>;
}
