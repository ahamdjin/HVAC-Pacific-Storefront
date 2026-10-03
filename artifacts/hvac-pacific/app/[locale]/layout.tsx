import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { SITE } from "@/config/site";
import { routing } from "@/i18n/routing";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.domain),
  title: {
    default: "HVAC Equipment & Parts for Southern California | hvacpacific",
    template: "%s | hvacpacific",
  },
  description:
    "HVAC equipment and parts for Southern California, with local pickup and delivery within 20 miles and support in English and Chinese.",
  openGraph: {
    type: "website",
    siteName: SITE.displayName,
    title: "HVAC Equipment & Parts for Southern California | hvacpacific",
    description:
      "HVAC equipment and parts for Southern California, with local pickup and delivery within 20 miles and support in English and Chinese.",
    url: SITE.domain,
    images: [{ url: SITE.logoPath, width: 1514, height: 428, alt: SITE.displayName }],
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale === "zh" ? "zh-Hans" : "en-US"}>
      <body>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}