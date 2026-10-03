import type { Metadata } from "next";
import { CategoryPage, categoryMetadata } from "@/components/CategoryPage";

type P={params:Promise<{locale:string;slug?:string[]}>;searchParams:Promise<Record<string,string|string[]|undefined>>};
export const revalidate=3600;

export async function generateMetadata({params,searchParams}:P):Promise<Metadata>{
  const {locale,slug=[]}=await params; const sp=await searchParams;
  return categoryMetadata("units",slug,locale,Object.keys(sp).length>0);
}
export default async function Page({params}:P){const {locale,slug=[]}=await params;return <CategoryPage kind="units" slugs={slug} locale={locale}/>;}
