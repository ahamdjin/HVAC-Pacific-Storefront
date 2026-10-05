export function localePath(locale: string, path: string) {
  if (locale !== "zh") return path;
  return path === "/" ? "/zh" : `/zh${path}`;
}

export function zhTranslationsReviewed() {
  return process.env.ZH_TRANSLATIONS_REVIEWED === "true";
}

export function localizedAlternates(locale: string, path: string) {
  const languages: Record<string, string> = {
    "en-US": path,
    "x-default": path,
  };
  if (zhTranslationsReviewed()) languages["zh-Hans"] = localePath("zh", path);
  return {
    canonical: localePath(locale, path),
    languages,
  };
}

export function cleanSeoText(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncateSeoText(value: string, max = 155) {
  const clean = cleanSeoText(value);
  if (clean.length <= max) return clean;
  const sample = clean.slice(0, max + 1);
  const lastSpace = sample.lastIndexOf(" ");
  const cut = lastSpace >= Math.floor(max * 0.72) ? lastSpace : max;
  return clean.slice(0, cut).replace(/[\s,;:|\-–—]+$/g, "") + "…";
}

export function seoPageTitle(value: string, max = 60) {
  const clean = cleanSeoText(value)
    .replace(/\s*(?:\||[-–—])\s*(?:HVAC\s*Pacific|hvacpacific)\s*$/i, "")
    .trim();
  return truncateSeoText(clean, max);
}

export function seoMetaDescription(value: string, max = 155) {
  return truncateSeoText(value, max);
}
