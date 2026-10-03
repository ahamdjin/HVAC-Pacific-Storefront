import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LeadForm } from "@/components/LeadForm";
import { SITE } from "@/config/site";

export const metadata:Metadata={title:"Need an HVAC Installer? | hvacpacific",description:"Request a referral to an independent licensed HVAC contractor in Southern California."};

export default async function Page({params,searchParams}:{params:Promise<{locale:string}>;searchParams:Promise<{product?:string}>}){
  const {locale}=await params;const {product=""}=await searchParams;
  return <main id="main"><div className="wrap page-shell narrow"><Breadcrumbs locale={locale} items={[{name:"Need an Installer?",path:"/need-installer"}]}/><header className="page-head"><p className="eyebrow">Installation referral</p><h1>Need an HVAC installer?</h1><p>Tell us what you are purchasing and where the project is located. We can refer your request to an independent licensed contractor.</p></header><div className="info-callout"><strong>Important:</strong> HVAC Pacific does not perform installation. Referred contractors are independent businesses.</div><LeadForm type="installer" product={product}/><p className="contact-fallback">Prefer to talk? Call <a href={"tel:"+SITE.phoneE164}>{SITE.phone}</a>.</p></div></main>;
}