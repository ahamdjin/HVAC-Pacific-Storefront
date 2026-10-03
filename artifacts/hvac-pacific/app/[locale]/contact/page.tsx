import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LeadForm } from "@/components/LeadForm";
import { SITE } from "@/config/site";

export const metadata:Metadata={title:"Contact HVAC Pacific",description:"Contact HVAC Pacific for equipment, parts, pickup and order questions."};

export default async function Page({params}:{params:Promise<{locale:string}>}){
  const {locale}=await params;const a=SITE.mailingAddress;
  return <main id="main"><div className="wrap page-shell"><Breadcrumbs locale={locale} items={[{name:"Contact",path:"/contact"}]}/><header className="page-head"><p className="eyebrow">Customer support</p><h1>Contact HVAC Pacific</h1><p>Questions about a model, part, order or local pickup? Send us a message or call.</p></header><div className="contact-grid"><div className="contact-card"><h2>Talk with us</h2><p><a href={"tel:"+SITE.phoneE164}>{SITE.phone}</a></p><p><a href={"mailto:"+SITE.email}>{SITE.email}</a></p><address>{a.street}<br/>{a.city}, {a.region} {a.postal}</address><p>Pickup location provided after order.</p></div><LeadForm type="contact"/></div></div></main>;
}