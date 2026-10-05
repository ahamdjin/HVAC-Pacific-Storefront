import type { Metadata } from "next";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { SITE } from "@/config/site";
import { routing } from "@/i18n/routing";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import "../globals.css";
import "../storefront.css";

const verification=[process.env.GSC_VERIFICATION,process.env.MERCHANT_VERIFICATION].filter(Boolean) as string[];

export const metadata:Metadata={
  metadataBase:new URL(process.env.CI_SITE_ORIGIN || SITE.domain),
  icons:{
    icon:[
      {url:SITE.iconPath,type:"image/png",sizes:"32x32"},
      {url:"/brand/hvac-pacific-icon-192.png",type:"image/png",sizes:"192x192"},
      {url:"/brand/hvac-pacific-icon-512.png",type:"image/png",sizes:"512x512"},
    ],
    shortcut:SITE.iconPath,
    apple:{url:"/brand/hvac-pacific-icon-180.png",sizes:"180x180",type:"image/png"},
  },
  title:{default:"HVAC Equipment & Parts for Southern California | HVAC Pacific",template:"%s | HVAC Pacific"},
  description:"HVAC equipment and parts for Southern California with local pickup, local delivery and model-specific product data.",
  verification:verification.length?{google:verification}:undefined,
  openGraph:{type:"website",siteName:SITE.displayName,title:"HVAC Equipment & Parts for Southern California | hvacpacific",description:"HVAC equipment and parts for Southern California.",url:SITE.domain,images:[{url:SITE.logoPath,width:645,height:242,alt:SITE.displayName}]},
  twitter:{card:"summary_large_image",title:"HVAC Pacific",description:"HVAC equipment and parts for Southern California."},
};

export function generateStaticParams(){return routing.locales.map(locale=>({locale}));}

export default async function LocaleLayout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}){
  const {locale}=await params;if(!hasLocale(routing.locales,locale))notFound();setRequestLocale(locale);const messages=await getMessages();
  const graph:any[]=[
    {"@type":"Organization","@id":SITE.domain+"/#organization",name:SITE.displayName,url:SITE.domain,logo:SITE.domain+SITE.logoPath,telephone:SITE.phoneE164,email:SITE.email},
    {"@type":"WebSite","@id":SITE.domain+"/#website",name:SITE.displayName,url:SITE.domain,publisher:{"@id":SITE.domain+"/#organization"},potentialAction:{"@type":"SearchAction",target:{"@type":"EntryPoint",urlTemplate:SITE.domain+"/search?q={search_term_string}"},"query-input":"required name=search_term_string"}},
  ];
  if(SITE.showroom)graph.push({"@type":"Store","@id":SITE.domain+"/#store",name:SITE.displayName,url:SITE.domain,telephone:SITE.phoneE164,address:{"@type":"PostalAddress",streetAddress:SITE.showroom.street,addressLocality:SITE.showroom.city,addressRegion:SITE.showroom.region,postalCode:SITE.showroom.postal,addressCountry:"US"},openingHours: SITE.showroom.hours});
  const ga=process.env.GA4_ID;
  const zhReviewed=process.env.ZH_TRANSLATIONS_REVIEWED==="true";
  return <html lang={locale==="zh"?"zh-Hans":"en-US"}><head>{locale==="zh"&&!zhReviewed&&<meta name="robots" content="noindex,follow" />}</head><body><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({"@context":"https://schema.org","@graph":graph}).replace(/</g,"\\u003c")}}/><NextIntlClientProvider messages={messages}><SiteHeader locale={locale}/>{children}<SiteFooter locale={locale}/></NextIntlClientProvider>{ga&&<><Script src={"https://www.googletagmanager.com/gtag/js?id="+ga} strategy="lazyOnload"/><Script id="ga4" strategy="lazyOnload">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','${ga}',{anonymize_ip:true});`}</Script></>}<Script src="https://link.msgsndr.com/js/external-tracking.js" data-tracking-id="tk_3cc66570b3a94655adfe0c077824e485" strategy="afterInteractive"/><Script src="https://widgets.leadconnectorhq.com/loader.js" data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js" data-widget-id="6aa780ce5b157680cb863f75" strategy="afterInteractive"/></body></html>;
}