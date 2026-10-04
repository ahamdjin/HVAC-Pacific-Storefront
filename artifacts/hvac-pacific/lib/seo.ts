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
