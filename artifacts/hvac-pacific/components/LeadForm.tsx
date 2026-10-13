"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export function LeadForm({ type, product = "", compact = false }: { type:"installer"|"contact"; product?:string; compact?:boolean }) {
  const t = useTranslations("Commerce.lead");
  const locale = useLocale();
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const formName = type === "installer" ? "HVAC Pacific - Need an Installer" : "HVAC Pacific - Contact";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Same external-form flow used by Howard Choi: allow HighLevel's tracking
    // submit listener to observe this real submit event, but keep navigation
    // client-side so the browser doesn't POST to the unconfigured webhook API.
    event.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);

    window.setTimeout(() => {
      window.location.assign(`${locale === "zh" ? "/zh" : ""}/thank-you`);
    }, 1500);
  }

  return <form
    id={type === "installer" ? "hvac-pacific-installer-form" : "hvac-pacific-contact-form"}
    name={formName}
    data-form-name={formName}
    data-external-form="highlevel"
    className={compact ? "lead-form compact" : "lead-form"}
    onSubmit={handleSubmit}
  >
    <input type="hidden" name="type" value={type} />
    <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="honeypot" aria-hidden="true" />
    <label><span>{t("name")}</span><input name="full_name" required autoComplete="name" /></label>
    <label><span>{t("phone")}</span><input name="phone" type="tel" required autoComplete="tel" inputMode="tel" /></label>
    <label><span>{t("email")}</span><input name="email" required type="email" autoComplete="email" /></label>
    {type === "installer" && <label><span>{t("zip")}</span><input name="zip" required inputMode="numeric" pattern="[0-9]{5}" /></label>}
    {type === "installer" && <label><span>{t("preferredLanguage")}</span><select name="language"><option>English</option><option>中文</option></select></label>}
    {product && <input type="hidden" name="product" value={product} />}
    <label className="wide"><span>{t("message")}</span><textarea name="message" rows={4} /></label>
    <label className="ack wide"><input type="checkbox" name="consent" value="yes" required /><span>{t("consent")}</span></label>
    <button className="btn primary" type="submit" disabled={submitting}>{submitting ? t("sending") : t("send")}</button>
  </form>;
}
