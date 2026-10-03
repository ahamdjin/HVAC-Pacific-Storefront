import Link from "next/link";
import { hrefFor } from "./paths";
import { SITE } from "@/config/site";

export type Crumb = { name: string; path: string };

export function Breadcrumbs({ locale, items }: { locale: string; items: Crumb[] }) {
  const all = [{ name: SITE.displayName, path: "/" }, ...items];
  const json = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE.domain}${hrefFor(locale, c.path)}`,
    })),
  };
  return (
    <>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        {all.map((c, i) => (
          <span key={c.path}>
            {i > 0 && <span aria-hidden="true">/</span>}
            {i === all.length - 1 ? <span aria-current="page">{c.name}</span> : <Link href={hrefFor(locale, c.path)}>{c.name}</Link>}
          </span>
        ))}
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json).replace(/</g, "\\u003c") }} />
    </>
  );
}
