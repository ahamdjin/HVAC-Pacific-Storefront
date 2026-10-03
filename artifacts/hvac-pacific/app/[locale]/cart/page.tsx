import type { Metadata } from "next";
import { CartClient } from "@/components/CartClient";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Cart | hvacpacific",
  robots: { index:false, follow:false },
};

export default async function Page({params}:{params:Promise<{locale:string}>}) {
  const {locale}=await params;
  return (
    <main id="main">
      <div className="wrap page-shell">
        <Breadcrumbs locale={locale} items={[{name:"Cart",path:"/cart"}]} />
        <header className="page-head">
          <h1>Your cart</h1>
          <p>Review your order before continuing to Shopify's secure checkout.</p>
        </header>
        <CartClient />
      </div>
    </main>
  );
}