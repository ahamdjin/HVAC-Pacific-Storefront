"use client";

import { useTranslations } from "next-intl";

export function LeadForm({ type, product = "", compact = false }: { type:"installer"|"contact"; product?:string; compact?:boolean }) {
  const t = useTranslations("Commerce.lead");
  const formName = type === "installer" ? "hvac-pacific-installer-form" : "hvac-pacific-contact-form";

  // A native form submission lets HighLevel External Tracking capture its
  // submit event and field values. Do not call preventDefault / fetch here.
  return <form id={formName} name={formName} className={compact?"lead-form compact":"lead-form"} method="POST" action="/api/installer-lead">
    <input type="hidden" name="type" value={type} />
    <input type="hidden" name="return_to" value={typeof window === "undefined" ? (type === "installer" ? "/need-installer" : "/contact") : window.location.pathname} />
    <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="honeypot" aria-hidden="true" />
    <label><span>{t("name")}</span><input name="name" required autoComplete="name" /></label>
    <label><span>{t("phone")}</span><input name="phone" required autoComplete="tel" inputMode="tel" /></label>
    <label><span>{t("email")}</span><input name="email" required type="email" autoComplete="email" /></label>
    {type==="installer" && <label><span>{t("zip")}</span><input name="zip" required inputMode="numeric" pattern="[0-9]{5}" /></label>}
    {type==="installer" && <label><span>{t("preferredLanguage")}</span><select name="language"><option>English</option><option>中文</option></select></label>}
    {product && <input type="hidden" name="product" value={product} />}
    <label className="wide"><span>{t("message")}</span><textarea name="message" rows={4} /></label>
    <label className="ack wide"><input type="checkbox" name="consent" value="yes" required /><span>{t("consent")}</span></label>
    <button className="btn primary" type="submit">{t("send")}</button>
  </form>;
}
