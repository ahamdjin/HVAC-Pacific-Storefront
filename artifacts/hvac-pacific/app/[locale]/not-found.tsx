"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { hrefFor } from "@/components/paths";

export default function NotFound(){
  const locale=useLocale();
  const t=useTranslations("NotFound");
  return <main id="main"><div className="wrap page-shell narrow">
    <p className="eyebrow">404</p>
    <h1>{t("title")}</h1>
    <p>{t("description")}</p>
    <div className="row">
      <Link className="btn primary" href={hrefFor(locale,"/search")}>{t("search")}</Link>
      <Link className="btn ghost" href={hrefFor(locale,"/units")}>{t("units")}</Link>
      <Link className="btn ghost" href={hrefFor(locale,"/parts")}>{t("parts")}</Link>
    </div>
  </div></main>;
}
