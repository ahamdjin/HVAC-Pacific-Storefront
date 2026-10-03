"use client";

import { useState } from "react";

export function LeadForm({ type, product = "", compact = false }: { type:"installer"|"contact"; product?:string; compact?:boolean }) {
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
      if(!r.ok) throw new Error(data.error || "Unable to send request.");
      setStatus("Thanks — your request was sent.");
      e.currentTarget.reset();
    } catch(err) { setStatus(err instanceof Error ? err.message : "Unable to send request."); }
    finally { setBusy(false); }
  }
  return <form className={compact?"lead-form compact":"lead-form"} onSubmit={submit}>
    <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="honeypot" aria-hidden="true" />
    <label><span>Name</span><input name="name" required autoComplete="name" /></label>
    <label><span>Phone</span><input name="phone" required autoComplete="tel" inputMode="tel" /></label>
    <label><span>Email</span><input name="email" required type="email" autoComplete="email" /></label>
    {type==="installer" && <label><span>ZIP code</span><input name="zip" required inputMode="numeric" pattern="[0-9]{5}" /></label>}
    {type==="installer" && <label><span>Preferred language</span><select name="language"><option>English</option><option>中文</option></select></label>}
    {product && <input type="hidden" name="product" value={product} />}
    <label className="wide"><span>Message</span><textarea name="message" rows={4} /></label>
    <label className="ack wide"><input type="checkbox" name="consent" value="yes" required /><span>I agree that HVAC Pacific may contact me about this request.</span></label>
    <button className="btn primary" disabled={busy} type="submit">{busy?"Sending…":"Send request"}</button>
    {status && <p className="form-message" role="status">{status}</p>}
  </form>;
}
