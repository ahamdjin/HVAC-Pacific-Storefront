import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SITE } from "@/config/site";
import { MegaMenu } from "./MegaMenu";
import { LanguageSwitch } from "./LanguageSwitch";
import { hrefFor, partLinks, unitLinks } from "./paths";

export async function SiteHeader({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Navigation" });
  const n = await getTranslations({ locale, namespace: "Nav" });
  const h = (p: string) => hrefFor(locale, p);
  const units = unitLinks.map(([k, s]) => ({ label: t(`unitsCategories.${k}`), href: h(`/units/${s}`) }));
  const parts = partLinks.map(([k, s]) => ({ label: t(`partsCategories.${k}`), href: h(`/parts/${s}`) }));

  return (
    <header className="site-header">
      <a href="#main" className="skip">{n("skip")}</a>
      <div className="wrap top">
        <Link href={h("/")} className="logo" aria-label={SITE.displayName}>
          <Image src={SITE.logoPath} alt={SITE.displayName} width={1514} height={428} priority sizes="190px" />
        </Link>
        <form action={h("/search")} role="search" className="search">
          <label htmlFor="q" className="sr">{t("searchLabel")}</label>
          <input id="q" name="q" type="search" placeholder={t("searchPlaceholder")} autoComplete="off" />
          <button type="submit">{t("searchLabel")}</button>
        </form>
        <div className="actions">
          <a href={`tel:${SITE.phoneE164}`} className="phone" aria-label={`${t("call")} ${SITE.phone}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11 11 0 003.5.56 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.2.2 2.400.56 3.5a1 1 0 01-.25 1z"/></svg>
            <span>{SITE.phone}</span>
          </a>
          <LanguageSwitch locale={locale} en={t("languageEnglish")} zh={t("languageChinese")} label={n("language")} />
          <Link href={h("/cart")} className="cart" aria-label={t("cart")}>
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" d="M3 4h2.5l2 11h10l2-8H7M9 20h.01M17 20h.01"/></svg>
            <span>{t("cart")}</span>
          </Link>
        </div>
      </div>
      <nav className="navbar" aria-label={n("mainNav")}>
        <div className="wrap nav-row">
          <MegaMenu label={t("units")} allLabel={n("allUnits")} allHref={h("/units")} items={units} />
          <MegaMenu label={t("parts")} allLabel={n("allParts")} allHref={h("/parts")} items={parts} wide />
          <Link href={h("/brands")} className="nav-link">{t("brands")}</Link>
          <Link href={h("/guides")} className="nav-link">{t("guides")}</Link>
          <Link href={h("/need-installer")} className="nav-cta">{t("needInstaller")}</Link>
        </div>
      </nav>
    </header>
  );
}
