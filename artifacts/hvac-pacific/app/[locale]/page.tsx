import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SITE } from "@/config/site";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomePage" });
  const canonical = locale === "zh" ? "/zh" : "/";

  return {
    title: `${t("title")} | ${SITE.brand}`,
    description: t("subtitle"),
    alternates: {
      canonical,
      languages: {
        "en-US": "/",
        "zh-Hans": "/zh",
        "x-default": "/",
      },
    },
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "HomePage" });

  return (
    <main className="home-placeholder">
      <p>{t("eyebrow")}</p>
      <h1>{t("title")}</h1>
      <p>{t("subtitle")}</p>
    </main>
  );
}