import Link from "next/link";

const categoryImages: Record<string, string> = {
  "capacitors": "https://cdn.shopify.com/s/files/1/0685/4901/7663/files/hvacpacific-category-capacitors.jpg?v=1791855923",
  "contactors-relays": "https://cdn.shopify.com/s/files/1/0685/4901/7663/files/hvacpacific-category-contactors-relays.jpg?v=1791855944",
  "motors": "https://cdn.shopify.com/s/files/1/0685/4901/7663/files/hvacpacific-category-motors.jpg?v=1791855949",
  "thermostats": "https://cdn.shopify.com/s/files/1/0685/4901/7663/files/hvacpacific-category-thermostats.jpg?v=1791855954",
  "furnace-parts": "https://cdn.shopify.com/s/files/1/0685/4901/7663/files/hvacpacific-category-furnace-parts.jpg?v=1791855959",
  "refrigeration-parts": "https://cdn.shopify.com/s/files/1/0685/4901/7663/files/hvacpacific-category-refrigeration-parts.jpg?v=1791855964",
  "electrical": "https://cdn.shopify.com/s/files/1/0685/4901/7663/files/hvacpacific-category-electrical.jpg?v=1791855970",
  "condensate": "https://cdn.shopify.com/s/files/1/0685/4901/7663/files/hvacpacific-category-condensate.jpg?v=1791855976",
  "chemicals-leak-detection": "https://cdn.shopify.com/s/files/1/0685/4901/7663/files/hvacpacific-category-chemicals-leak-detection.jpg?v=1791855981",
  "tools": "https://cdn.shopify.com/s/files/1/0685/4901/7663/files/hvacpacific-category-tools.jpg?v=1791915831",
  "refrigerant": "https://cdn.shopify.com/s/files/1/0685/4901/7663/files/hvacpacific-category-refrigerant.jpg?v=1791915836",
  "heat-pump-systems": "https://cdn.shopify.com/s/files/1/0685/4901/7663/files/hvacpacific-category-heat-pump-systems.jpg?v=1791915843",
  "packaged-units": "https://cdn.shopify.com/s/files/1/0685/4901/7663/files/hvacpacific-category-packaged-units.jpg?v=1791915848",
  "mini-splits": "https://cdn.shopify.com/s/files/1/0685/4901/7663/files/hvacpacific-category-mini-splits.jpg?v=1791915853",
  "ac-furnace-systems": "https://cdn.shopify.com/s/files/1/0685/4901/7663/files/hvacpacific-category-ac-furnace-systems.jpg?v=1791915858"
};

export type CategoryNavigationItem = {
  href: string;
  title: string;
  intro: string;
  slug: string;
};

function CategoryItems({ items }: { items: CategoryNavigationItem[] }) {
  return items.map((item) => (
    <Link key={item.href} href={item.href} className="category-image-card">
      <span className="category-image-card-media">
        {categoryImages[item.slug] && (
          <img src={categoryImages[item.slug]} alt="" loading="lazy" decoding="async" />
        )}
      </span>
      <strong>{item.title}</strong>
    </Link>
  ));
}

/** Product-led category navigation: compact mobile disclosure and an image grid on desktop. */
export function CategoryNavigation({ items, locale }: { items: CategoryNavigationItem[]; locale: string }) {
  const label = locale === "zh" ? "按类别浏览" : "Browse categories";
  return (
    <nav className="catalog-categories" aria-label={label}>
      <div className="category-image-grid catalog-categories-desktop">
        <CategoryItems items={items} />
      </div>
      <details className="catalog-categories-mobile">
        <summary>
          <span>{label}</span>
          <span className="catalog-category-count">{items.length}</span>
          <span className="catalog-category-chevron" aria-hidden="true" />
        </summary>
        <div className="category-image-grid catalog-categories-mobile-links">
          <CategoryItems items={items} />
        </div>
      </details>
    </nav>
  );
}
