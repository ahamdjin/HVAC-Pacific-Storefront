import { NextResponse } from "next/server";
import { SITE } from "@/config/site";

export const revalidate=3600;
export async function GET(){
  const locales=process.env.ZH_TRANSLATIONS_REVIEWED==="true"?["en","zh"]:["en"];
  const entries=locales.flatMap(locale=>["products","collections","guides","static"].map(type=>`${SITE.domain}/sitemaps/${locale}/${type}.xml`));
  const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.map(loc=>`<sitemap><loc>${loc}</loc></sitemap>`).join("")}</sitemapindex>`;
  return new NextResponse(xml,{headers:{"Content-Type":"application/xml; charset=utf-8","Cache-Control":"public, s-maxage=3600, stale-while-revalidate=86400"}});
}