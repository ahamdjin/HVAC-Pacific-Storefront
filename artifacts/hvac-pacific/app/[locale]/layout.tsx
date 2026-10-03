import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { SITE } from "@/config/site";
import { routing } from "@/i18n/routing";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.domain),
  icons: { icon: SITE.logoPath },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": `${SITE.domain}/#organization`,
                  name: SITE.displayName,
                  url: SITE.domain,
                  logo: `${SITE.domain}${SITE.logoPath}`,
                  telephone: SITE.phoneE164,
                  email: SITE.email,
                },
                {
                  "@type": "WebSite",
                  "@id": `${SITE.domain}/#website`,
                  name: SITE.displayName,
                  url: SITE.domain,
                  publisher: { "@id": `${SITE.domain}/#organization` },
                },
              ],
            }).replace(/</g, "\\u003c"),
          }}
        />
        <NextIntlClientProvider messages={messages}><SiteHeader locale={locale} />
          {children}
          <SiteFooter locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}