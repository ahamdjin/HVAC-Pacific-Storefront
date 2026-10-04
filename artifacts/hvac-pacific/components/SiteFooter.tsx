import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SITE } from "@/config/site";
import { hrefFor, partLinks, unitLinks } from "./paths";

export async function SiteFooter({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Navigation" });
  const f = await getTranslations({ locale, namespace: "Footer" });
  const hm = await getTranslations({ locale, namespace: "HomePage" });
  const h = (p: string) => hrefFor(locale, p);
  const a = SITE.mailingAddress;
  return (
    <footer className="site-footer">
      <div className="wrap fgrid">
        <div>
          <Image src={SITE.logoPath} alt={SITE.displayName} width={1514} height={428} sizes="170px" className="flogo" />
          <p className="fnote">{hm("subtitle")}</p>
          <p className="fnote"><a href={`tel:${SITE.phoneE164}`}>{SITE.phone}</a><br/><a href={`mailto:${SITE.email}`}>{SITE.email}</a></p>
        </div>
        <div>
          <h2>{t("units")}</h2>
          <ul>{unitLinks.map(([k, s]) => <li key={s}><Link href={h(`/units/${s}`)}>{t(`unitsCategories.${k}`)}</Link></li>)}</ul>
          <h2 className="h2b">{f("company")}</h2>
          <ul>
            <li><Link href={h("/about")}>{f("about")}</Link></li>
            <li><Link href={h("/contact")}>{f("contactLink")}</Link></li>
            <li><Link href={h("/pickup-delivery")}>{f("pickupLink")}</Link></li>
          </ul>
        </div>
        <div>
          <h2>{t("parts")}</h2>
          <ul>
            {partLinks.slice(0, 6).map(([k, s]) => <li key={s}><Link href={h(`/parts/${s}`)}>{t(`partsCategories.${k}`)}</Link></li>)}
            <li><Link href={h("/parts")}>{t("parts")} &rarr;</Link></li>
          </ul>
          <h2 className="h2b">{f("resources")}</h2>
          <ul>
            <li><Link href={h("/guides")}>{f("guides")}</Link></li>
            <li><Link href={h("/california-hvac-compliance")}>{f("californiaCompliance")}</Link></li>
            <li><Link href={h("/refrigerant-sales-policy")}>{f("refrigerantPolicy")}</Link></li>
          </ul>
        </div>
        <div>
          <h2>{f("contact")}</h2>
          <ul>
            <li><address>{a.street}<br />{a.city}, {a.region} {a.postal}</address></li>
          </ul>
          <h2 className="h2b">{f("pickupDelivery")}</h2>
          <p className="fnote">{f("pickupNote")}</p>
          <h2 className="h2b">{f("policies")}</h2>
          <ul>
            <li><Link href={h("/shipping-returns")}>{f("shippingReturns")}</Link></li>
            <li><Link href={h("/warranty")}>{f("warranty")}</Link></li>
            <li><Link href={h("/privacy")}>{f("privacy")}</Link></li>
            <li><Link href={h("/terms")}>{f("terms")}</Link></li>
            <li><Link href={h("/prop-65")}>{f("prop65")}</Link></li>
          </ul>
        </div>
      </div>
      <div className="wrap fbar">&copy; {new Date().getFullYear()} {SITE.displayName}</div>
    </footer>
  );
}
