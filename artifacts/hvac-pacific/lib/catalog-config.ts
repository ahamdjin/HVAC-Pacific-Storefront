import type { ProductCardData } from "./shopify/shared";
import { metafieldMap } from "./shopify/shared";

export type CatalogSection = {
  slug: string;
  title: string;
  intro: string;
  kind: "units" | "parts";
  parent?: string;
  collectionHandle?: string;
};

export const UNIT_SECTIONS: CatalogSection[] = [
  { slug: "heat-pump-systems", title: "Heat Pump Systems", kind: "units", intro: "Shop heat pump equipment for year-round heating and cooling. Compare capacity, refrigerant, efficiency data and compatible components before ordering." },
  { slug: "packaged-units", title: "Packaged Units", kind: "units", intro: "Shop packaged HVAC equipment with the major heating and cooling components housed in one cabinet. Verify electrical service, capacity and installation requirements before purchase." },
  { slug: "mini-splits", title: "Ductless Mini Splits", kind: "units", intro: "Shop ductless mini-split systems and components by BTU capacity, voltage, refrigerant and brand." },
  { slug: "ac-furnace-systems", title: "AC + Furnace Systems", kind: "units", intro: "Matched central air-conditioning and furnace equipment. Published systems appear only after their product data has been verified." },
];

export const PART_SECTIONS: CatalogSection[] = [
  { slug: "capacitors", title: "HVAC Capacitors", kind: "parts", intro: "Replacement HVAC capacitors for air conditioners, heat pumps and motors. Match capacitance, voltage and physical fit to the equipment specification." },
  { slug: "dual-run-capacitors", title: "Dual Run Capacitors", kind: "parts", parent: "capacitors", intro: "Dual run capacitors combine compressor and fan capacitance in one can. Match both MFD ratings and voltage before replacing." },
  { slug: "single-run-capacitors", title: "Single Run Capacitors", kind: "parts", parent: "capacitors", intro: "Single run capacitors for HVAC motors and equipment. Match the required MFD and voltage printed on the original component." },
  { slug: "contactors-relays", title: "Contactors & Relays", kind: "parts", intro: "HVAC contactors and relays for switching compressors, motors and control circuits." },
  { slug: "motors", title: "HVAC Motors", kind: "parts", intro: "Condenser fan, blower and replacement HVAC motors. Verify horsepower, RPM, voltage, frame, shaft and rotation before ordering." },
  { slug: "thermostats", title: "Thermostats", kind: "parts", intro: "Thermostats and controls for conventional and heat-pump HVAC systems. Verify staging and system compatibility before purchase." },
  { slug: "furnace-parts", title: "Furnace Parts", kind: "parts", intro: "Ignition, safety and replacement furnace components. Confirm model compatibility and ratings before installation." },
  { slug: "refrigeration-parts", title: "Refrigeration Parts", kind: "parts", intro: "Refrigeration service parts and components for qualified HVAC and refrigeration work." },
  { slug: "electrical", title: "HVAC Electrical", kind: "parts", intro: "Electrical components used in HVAC service and equipment repair." },
  { slug: "condensate", title: "Condensate", kind: "parts", intro: "Condensate management components for air-conditioning and HVAC systems." },
  { slug: "chemicals-leak-detection", title: "Chemicals & Leak Detection", kind: "parts", intro: "HVAC service chemicals and leak-detection products. Follow manufacturer instructions and applicable safety requirements." },
  { slug: "tools", title: "HVAC Tools", kind: "parts", intro: "Tools and service accessories for HVAC installation, diagnostics and maintenance." },
  { slug: "refrigerant", title: "Refrigerant", kind: "parts", intro: "Refrigerant products are sold subject to applicable EPA sales restrictions and our certification-verification policy." },
];

export const ALL_SECTIONS = [...UNIT_SECTIONS, ...PART_SECTIONS];

function norm(v?: string) {
  return (v ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

const aliases: Record<string, string[]> = {
  "heat-pump-systems": ["heat pump", "heat pump systems"],
  "packaged-units": ["packaged unit", "packaged units", "packaged heat pump", "packaged gas electric", "gas electric"],
  "mini-splits": ["mini split", "mini splits", "ductless mini split", "mini split systems"],
  "ac-furnace-systems": ["central ac", "ac furnace", "ac furnace systems", "air conditioner"],
  "capacitors": ["capacitor", "capacitors"],
  "dual-run-capacitors": ["dual run capacitor", "dual run capacitors"],
  "single-run-capacitors": ["single run capacitor", "single run capacitors"],
  "contactors-relays": ["contactor", "contactors", "relay", "relays"],
  "motors": ["motor", "motors", "condenser fan", "blower"],
  "thermostats": ["thermostat", "thermostats"],
  "furnace-parts": ["furnace part", "furnace parts", "ignition safety", "ignition"],
  "refrigeration-parts": ["refrigeration part", "refrigeration parts"],
  electrical: ["electrical"],
  condensate: ["condensate"],
  "chemicals-leak-detection": ["chemical", "chemicals", "leak detection"],
  tools: ["tool", "tools"],
  refrigerant: ["refrigerant", "refrigerants"],
};

export function productMatchesSection(product: ProductCardData, slug: string) {
  if (product.collections?.nodes.some((collection) => collection.handle === slug)) return true;
  const m = metafieldMap(product);
  const haystack = [
    m.site_category,
    m.subcategory,
    product.productType,
    ...(product.collections?.nodes ?? []).map((collection) => collection.title),
    ...product.tags,
    product.title,
  ]
    .map(norm)
    .join(" | ");
  return (aliases[slug] ?? [slug.replace(/-/g, " ")]).some((a) =>
    haystack.includes(norm(a)),
  );
}

/** Explicit merchant grouping takes priority over keyword heuristics. */
export function getProductKind(product: ProductCardData): "units" | "parts" | null {
  const meta = metafieldMap(product);
  const category = norm(meta.site_category);
  if (["units", "equipment", "hvac units", "hvac equipment"].includes(category)) return "units";
  if (["parts", "accessories", "parts accessories", "parts and accessories"].includes(category)) return "parts";
  const roots = product.collections?.nodes.map((c) => c.handle) ?? [];
  if (roots.includes("units")) return "units";
  if (roots.some((handle) => ["parts", "accessories", "parts-accessories"].includes(handle))) return "parts";
  // Don't classify equipment as a part merely because it mentions refrigerant.
  const typed = { ...product, title: "", tags: [], collections: undefined };
  if (PART_SECTIONS.some((s) => productMatchesSection(typed, s.slug))) return "parts";
  if (UNIT_SECTIONS.some((s) => productMatchesSection(typed, s.slug))) return "units";
  if (product.tags.some((tag) => norm(tag) === "units")) return "units";
  if (PART_SECTIONS.some((s) => productMatchesSection(product, s.slug))) return "parts";
  if (UNIT_SECTIONS.some((s) => productMatchesSection(product, s.slug))) return "units";
  return null;
}

/** Use actual metafields, tags and titles; don't invent technical specifications. */
export function getCatalogFacets(product: ProductCardData): Record<string, string> {
  const meta = metafieldMap(product);
  const text = [...product.tags, product.title].join(" | ");
  const tonnage = (meta.tonnage || text.match(/\b(\d+(?:\.\d+)?)\s*tons?\b/i)?.[1] || "").replace(/\s*tons?$/i, "").trim();
  const refrigerantText = meta.refrigerant || text.match(/\bR[-\s]?\d{2,3}[a-z]?\b/i)?.[0] || "";
  const refrigerant = refrigerantText.replace(/^R[-\s]?(\d{2,3}[a-z]?)$/i, (_, value: string) => `R-${value.toUpperCase()}`);
  return {
    ...meta,
    tonnage,
    refrigerant,
    subcategory: meta.subcategory || product.productType,
    system_type: meta.system_type || product.productType,
  };
}

export function getSection(kind: "units" | "parts", slugs: string[]) {
  const leaf = slugs.at(-1);
  if (!leaf) return null;
  return ALL_SECTIONS.find((x) => x.kind === kind && x.slug === leaf) ?? null;
}

export function sectionPath(section: CatalogSection) {
  return section.parent
    ? `/${section.kind}/${section.parent}/${section.slug}`
    : `/${section.kind}/${section.slug}`;
}
