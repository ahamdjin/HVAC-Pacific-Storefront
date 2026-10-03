"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { money } from "./ProductCard";

type Cart = {
  id: string;
  checkoutUrl: string;
  cost: { subtotalAmount: { amount:string; currencyCode:string }; totalAmount: { amount:string; currencyCode:string } };
  lines: { nodes: Array<{ id:string; quantity:number; merchandise: { id:string; title:string; price: { amount:string; currencyCode:string }; product:{ title:string; handle:string; featuredImage?:{url:string;altText?:string|null;width?:number|null;height?:number|null}|null } } }> };
};

export function CartClient() {
  const t = useTranslations("Commerce.cart");
  const locale = useLocale();
  const [cart, setCart] = useState<Cart|null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const r = await fetch("/api/cart", { cache:"no-store" });
    if (r.ok) setCart(await r.json());
    setLoading(false);
  }
  useEffect(()=>{ void load(); },[]);

  async function change(lineId:string, quantity:number) {
    await fetch("/api/cart", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({lineId,quantity}) });
    await load();
  }
  async function remove(lineId:string) {
    await fetch("/api/cart", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({lineId}) });
    await load();
  }

  if (loading) return <div className="loading-box">{t("loading")}</div>;
  if (!cart?.lines.nodes.length) return <div className="empty-state"><h2>{t("emptyTitle")}</h2><p>{t("emptyText")}</p></div>;

  return <div className="cart-layout">
    <div className="cart-lines">
      {cart.lines.nodes.map((line)=><article className="cart-line" key={line.id}>
        <div className="cart-thumb">{line.merchandise.product.featuredImage && <Image src={line.merchandise.product.featuredImage.url} alt={line.merchandise.product.featuredImage.altText || line.merchandise.product.title} width={120} height={120} />}</div>
        <div><h2>{line.merchandise.product.title}</h2>{line.merchandise.title !== "Default Title" && <p>{line.merchandise.title}</p>}<strong>{money(line.merchandise.price.amount,line.merchandise.price.currencyCode,locale)}</strong></div>
        <div className="qty"><label><span>{t("qty")}</span><input type="number" min={1} value={line.quantity} onChange={(e)=>void change(line.id,Math.max(1,Number(e.target.value)))} /></label><button type="button" onClick={()=>void remove(line.id)}>{t("remove")}</button></div>
      </article>)}
    </div>
    <aside className="cart-summary"><h2>{t("summary")}</h2><div><span>{t("subtotal")}</span><strong>{money(cart.cost.subtotalAmount.amount,cart.cost.subtotalAmount.currencyCode,locale)}</strong></div><p>{t("fulfillmentNote")}</p><a className="btn primary checkout" href={cart.checkoutUrl} onClick={() => {
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
  </div>;
}
