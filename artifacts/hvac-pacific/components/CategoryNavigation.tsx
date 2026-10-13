import Link from "next/link";

export type CategoryNavigationItem = {
  href: string;
  title: string;
  intro: string;
};

function CategoryItems({ items }: { items: CategoryNavigationItem[] }) {
  return items.map((item) => (
    <Link key={item.href} href={item.href}>
      <strong>{item.title}</strong>
      <span>{item.intro}</span>
    </Link>
  ));
}

/** Full navigation on desktop, compact disclosure ahead of results on mobile. */
export function CategoryNavigation({ items, locale }: { items: CategoryNavigationItem[]; locale: string }) {
  const label = locale === "zh" ? "按类别浏览" : "Browse categories";
  return (
    <nav className="catalog-categories" aria-label={label}>
      <div className="category-links catalog-categories-desktop">
        <CategoryItems items={items} />
      </div>
      <details className="catalog-categories-mobile">
        <summary>
          <span>{label}</span>
          <span className="catalog-category-count">{items.length}</span>
          <span className="catalog-category-chevron" aria-hidden="true" />
        </summary>
        <div className="catalog-categories-mobile-links">
          <CategoryItems items={items} />
        </div>
      </details>
    </nav>
  );
}
