"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function LeadForm({ type, product = "", compact = false }: { type:"installer"|"contact"; product?:string; compact?:boolean }) {
  const t=useTranslations("Commerce.lead");
  const [status,setStatus]=useState("");
  const [busy,setBusy]=useState(false);
  async function submit(e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setStatus("");
    const form=new FormData(e.currentTarget);
    const body=Object.fromEntries(form.entries());
    try {
      const r=await fetch("/api/installer-lead",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...body,type})});
      const data=await r.json();
      if(!r.ok) throw new Error(t("error"));
      setStatus(t("success"));
      (window as unknown as { dataLayer?: unknown[] }).dataLayer?.push({
        event: "generate_lead",
        lead_type: type,
        product_context: product || undefined,
      });
      e.currentTarget.reset();
    } catch(err) { setStatus(err instanceof Error ? err.message : t("error")); }
    finally { setBusy(false); }
  }
  const formName=type==="installer"?"hvac-pacific-installer-form":"hvac-pacific-contact-form";
  return <form id={formName} name={formName} className={compact?"lead-form compact":"lead-form"} onSubmit={submit}>
    <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="honeypot" aria-hidden="true" />
    <label><span>{t("name")}</span><input name="name" required autoComplete="name" /></label>
    <label><span>{t("phone")}</span><input name="phone" required autoComplete="tel" inputMode="tel" /></label>
    <label><span>{t("email")}</span><input name="email" required type="email" autoComplete="email" /></label>
    {type==="installer" && <label><span>{t("zip")}</span><input name="zip" required inputMode="numeric" pattern="[0-9]{5}" /></label>}
    {type==="installer" && <label><span>{t("preferredLanguage")}</span><select name="language"><option>English</option><option>中文</option></select></label>}
    {product && <input type="hidden" name="product" value={product} />}
    <label className="wide"><span>{t("message")}</span><textarea name="message" rows={4} /></label>
    <label className="ack wide"><input type="checkbox" name="consent" value="yes" required /><span>{t("consent")}</span></label>
    <button className="btn primary" disabled={busy} type="submit">{busy?t("sending"):t("send")}</button>
    {status && <p className="form-message" role="status">{status}</p>}
  </form>;
}
