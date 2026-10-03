import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { hrefFor, partLinks, unitLinks } from "@/components/paths";
import { SITE } from "@/config/site";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomePage" });
  const canonical = locale === "zh" ? "/zh" : "/";

  return {
    title: { absolute: `${t("title")} | ${SITE.brand}` },
    description: t("subtitle"),
    alternates: {
      canonical,
      languages: {
        "en-US": "/",
        "zh-Hans": "/zh",
        "x-default": "/",
      },
    },
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "HomePage" });

  const t2 = await getTranslations({ locale, namespace: "Home" });
  const n = await getTranslations({ locale, namespace: "Navigation" });
  const h = (p: string) => hrefFor(locale, p);
  const miles = SITE.serviceRadiusMiles;
  const facts = [
    [t2("factPickup"), t2("factPickupText")],
    [t2("factDelivery", { miles }), t2("factDeliveryText", { miles })],
    [t2("factLanguages"), t2("factLanguagesText")],
  ];

  return (
    <main id="main">
      <section className="hero">
        <div className="wrap herogrid">
          <div>
            <p className="eyebrow">{t("eyebrow")}</p>
            <h1>{t("title")}</h1>
            <p className="lead">{t("subtitle")}</p>
            <p className="row">
              <Link className="btn primary" href={h("/units")}>{t("shopUnits")}</Link>
              <Link className="btn ghost" href={h("/parts")}>{t("shopParts")}</Link>
            </p>
          </div>
          <aside className="status" aria-label={t2("status")}>
            <h2>{t2("emptyTitle")}</h2>
            <p>{t2("emptyDescription")}</p>
            <p className="row">
              <a className="btn primary" href={`tel:${SITE.phoneE164}`}>{SITE.phone}</a>
              <a className="btn ghost" href={`mailto:${SITE.email}`}>{t2("email")}</a>
            </p>
          </aside>
        </div>
      </section>

      <section className="wrap section">
        <h2 className="sh">{t2("browseHeading")}</h2>
        <div className="cats">
          <div className="catbox">
            <h3>{t("unitsHeading")}</h3>
            <p>{t2("unitsText")}</p>
            <ul>{unitLinks.map(([k, s]) => <li key={s}><Link href={h(`/units/${s}`)}>{n(`unitsCategories.${k}`)}</Link></li>)}</ul>
          </div>
          <div className="catbox">
            <h3>{t("partsHeading")}</h3>
            <p>{t2("partsText")}</p>
            <ul className="two">{partLinks.map(([k, s]) => <li key={s}><Link href={h(`/parts/${s}`)}>{n(`partsCategories.${k}`)}</Link></li>)}</ul>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap section">
          <h2 className="sh">{t2("factsHeading")}</h2>
          <dl className="facts">
            {facts.map(([a, b]) => <div key={a}><dt>{a}</dt><dd>{b}</dd></div>)}
          </dl>
        </div>
      </section>

      <section className="wrap section cta">
        <div>
          <h2>{t("contactTitle")}</h2>
          <p>{t("contactDescription")}</p>
        </div>
        <p className="row">
          <a className="btn primary" href={`tel:${SITE.phoneE164}`}>{SITE.phone}</a>
          <Link className="btn ghost" href={h("/need-installer")}>{n("needInstaller")}</Link>
        </p>
      </section>
    </main>
  );
}
