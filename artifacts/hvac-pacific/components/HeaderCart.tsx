"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { CART_UPDATED_EVENT, cartItemCount } from "@/lib/cart-events";

export function HeaderCart({ href }: { href: string }) {
  const t = useTranslations("Navigation");
  const pathname = usePathname();
  const [count, setCount] = useState<number | null>(null);
  const revision = useRef(0);

  useEffect(() => {
    const controller = new AbortController();

    async function refresh() {
      const current = ++revision.current;
      try {
        const response = await fetch("/api/cart", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Unable to fetch cart count");
        const cart = await response.json();
        if (!Array.isArray(cart?.lines?.nodes)) throw new Error("Invalid cart response");
        if (current === revision.current) setCount(cartItemCount(cart));
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn("Unable to refresh the header cart count");
        }
      }
    }

    function onCartChanged(event: Event) {
      const quantity = (event as CustomEvent<number>).detail;
      if (!Number.isInteger(quantity) || quantity < 0) return;
      // An older GET must not overwrite a successful mutation's count.
      ++revision.current;
      setCount(quantity);
    }

    function onVisible() {
      if (document.visibilityState === "visible") void refresh();
    }

    window.addEventListener(CART_UPDATED_EVENT, onCartChanged);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisible);
    void refresh();
    return () => {
      ++revision.current;
      controller.abort();
      window.removeEventListener(CART_UPDATED_EVENT, onCartChanged);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [pathname]);

  const label = count === null ? t("cart") : t("cartCount", { count });
  return <>
    <Link href={href} className="cart" aria-label={label} data-testid="header-cart">
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" d="M3 4h2.5l2 11h10l2-8H7M9 20h.01M17 20h.01"/></svg>
      <span>{t("cart")}</span>
      <b className="cart-count" aria-hidden="true" data-testid="cart-count" style={{ visibility: count === null ? "hidden" : "visible" }}>{count ?? 0}</b>
    </Link>
    <span className="sr" role="status" aria-atomic="true">{count === null ? "" : label}</span>
  </>;
}