import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SITE } from "@/config/site";
import { hrefFor } from "@/components/paths";

type P = { params: Promise<{ locale: string; slug: string[] }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "Scaffold" });
  const path = `/${slug.join("/")}`;
  return {
    title: t("title"),
    robots: { index: false, follow: true },
    alternates: {
      canonical: hrefFor(locale, path),
      languages: {
        "en-US": path,
        "zh-Hans": hrefFor("zh", path),
        "x-default": path,
      },
    },
  };
}

export default async function ScaffoldPage({ params }: P) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Scaffold" });
  const top = slug[0];
  const title = top === "search" ? t("searchTitle") : top === "cart" ? t("cartTitle") : t("title");
  const desc = top === "cart" ? t("cartDescription") : t("description");
  const pageUrl = `${SITE.domain}${hrefFor(locale, `/${slug.join("/")}`)}`;
  return (
    <main id="main" className="wrap scaffold">
      <nav aria-label={t("breadcrumb")}>
        <Link href={hrefFor(locale, "/")}>{t("back")}</Link>
        {" / "}
        <span aria-current="page">{title}</span>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: SITE.displayName, item: `${SITE.domain}${hrefFor(locale, "/")}` },
              { "@type": "ListItem", position: 2, name: title, item: pageUrl },
            ],
          }).replace(/</g, "\\u003c"),
        }}
      />
      <p className="eyebrow">{SITE.displayName}</p>
      <h1>{title}</h1>
      <p>{desc}</p>
      <p className="row">
        <a className="btn primary" href={`tel:${SITE.phoneE164}`}>{SITE.phone}</a>
        <a className="btn ghost" href={`mailto:${SITE.email}`}>{SITE.email}</a>
        <Link className="btn ghost" href={hrefFor(locale, "/")}>{t("back")}</Link>
      </p>
    </main>
  );
}
