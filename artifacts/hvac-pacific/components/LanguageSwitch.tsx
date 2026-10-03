"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function LanguageSwitch({ locale, en, zh, label }: { locale: string; en: string; zh: string; label: string }) {
  const pathname = usePathname() || "/";
  const base = pathname === "/zh" ? "/" : pathname.replace(/^\/zh(?=\/)/, "");
  const zhHref = base === "/" ? "/zh" : `/zh${base}`;
  return (
    <div className="lang" role="group" aria-label={label}>
      <Link href={base} hrefLang="en-US" lang="en" aria-current={locale === "en" ? "true" : undefined} prefetch={false}>{en}</Link>
      <Link href={zhHref} hrefLang="zh-Hans" lang="zh-Hans" aria-current={locale === "zh" ? "true" : undefined} prefetch={false}>{zh}</Link>
    </div>
  );
}
