import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CartClient } from "@/components/CartClient";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{
  const {locale}=await params;
  const t=await getTranslations({locale,namespace:"Pages.cart"});
  return { title:t("title")+" | hvacpacific", robots:{index:false,follow:false} };
}

export default async function Page({params}:{params:Promise<{locale:string}>}) {
  const {locale}=await params;
  const t=await getTranslations({locale,namespace:"Pages.cart"});
  return (
    <main id="main">
      <div className="wrap page-shell">
        <Breadcrumbs locale={locale} items={[{name:t("breadcrumb"),path:"/cart"}]} />
        <header className="page-head">
          <h1>{t("title")}</h1>
          <p>{t("description")}</p>
        </header>
        <CartClient />
      </div>
    </main>
  );
}
