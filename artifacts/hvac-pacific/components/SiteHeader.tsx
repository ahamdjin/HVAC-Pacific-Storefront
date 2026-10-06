import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SITE } from "@/config/site";
import { MegaMenu } from "./MegaMenu";
import { LanguageSwitch } from "./LanguageSwitch";
import { MobileMenu } from "./MobileMenu";
import { HeaderCart } from "./HeaderCart";
import { hrefFor, partLinks, unitLinks } from "./paths";

export async function SiteHeader({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Navigation" });
  const n = await getTranslations({ locale, namespace: "Nav" });
  const hm = await getTranslations({ locale, namespace: "HomePage" });
  const f = await getTranslations({ locale, namespace: "Footer" });
  const h = (p: string) => hrefFor(locale, p);
  const units = unitLinks.map(([k, s]) => ({ label: t(`unitsCategories.${k}`), href: h(`/units/${s}`) }));
  const parts = partLinks.map(([k, s]) => ({ label: t(`partsCategories.${k}`), href: h(`/parts/${s}`) }));

  return (
    <>
      <div className="utility-bar">
        <div className="wrap utility-inner">
          <span>{hm("supplyEyebrow")}</span>
          <div>
            <Link href={h("/pickup-delivery")}>{f("pickupDelivery")}</Link>
            <span aria-hidden="true">•</span>
            <a href={`tel:${SITE.phoneE164}`}>{t("call")} {SITE.phone}</a>
          </div>
        </div>
      </div>

      <header className="site-header">
        <a href="#main" className="skip">{n("skip")}</a>

        <div className="wrap header-main">
        <Link href={h("/")} className="logo" aria-label={SITE.displayName}>
          <Image src={SITE.logoPath} alt={SITE.displayName} width={645} height={242} priority sizes="180px" />
        </Link>

        <form action={h("/search")} role="search" className="search header-search">
          <label htmlFor="q" className="sr">{t("searchLabel")}</label>
          <input id="q" name="q" type="search" placeholder={t("searchPlaceholder")} autoComplete="off" />
          <button type="submit" aria-label={t("searchLabel")}>
            <svg width="21" height="21" viewBox="0 0 24 24" aria-hidden="true">
              <path d="m21 21-4.3-4.3m2.3-5.2a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </form>

        <div className="header-actions">
          <LanguageSwitch locale={locale} en={t("languageEnglish")} zh={t("languageChinese")} label={n("language")} />
          <HeaderCart href={h("/cart")} />
          <MobileMenu
            menuLabel={n("menu")}
            unitsLabel={t("units")}
            partsLabel={t("parts")}
            units={units}
            parts={parts}
            links={[
              { label: t("brands"), href: h("/brands") },
              { label: t("guides"), href: h("/guides") },
              { label: t("needInstaller"), href: h("/need-installer") },
            ]}
          />
        </div>
      </div>

      <nav className="navbar desktop-navbar" aria-label={n("mainNav")}>
        <div className="wrap nav-row">
          <Link href={h("/units")} className="nav-link nav-link-first">{n("allUnits")}</Link>
          <MegaMenu label={t("units")} allLabel={n("allUnits")} allHref={h("/units")} items={units} />
          <MegaMenu label={t("parts")} allLabel={n("allParts")} allHref={h("/parts")} items={parts} wide />
          <Link href={h("/units/mini-splits")} className="nav-link">{t("unitsCategories.miniSplits")}</Link>
          <Link href={h("/brands")} className="nav-link">{t("brands")}</Link>
          <Link href={h("/guides")} className="nav-link">{t("guides")}</Link>
          <Link href={h("/need-installer")} className="nav-support">{t("needInstaller")}</Link>
        </div>
      </nav>
      </header>
    </>
  );
}
