export const SITE = {
  brand: "hvacpacific",
  displayName: "HVAC Pacific",
  domain: "https://hvacpacific.com",
  phone: "213-282-8212",
  phoneE164: "+12132828212",
  email: "support@bmon.ai",
  mailingAddress: {
    street: "1142 S Diamond Bar Blvd #726",
    city: "Diamond Bar",
    region: "CA",
    postal: "91765",
    country: "US",
  },
  showroom: null as null | {
    street: string;
    city: string;
    region: string;
    postal: string;
    hours: string[];
    lat?: number;
    lng?: number;
  },
  serviceRadiusMiles: 20,
  locales: ["en", "zh"] as const,
  defaultLocale: "en" as const,
  featuredBrands: ["Lennox", "Carrier", "Midea", "Daikin", "TCL"],
  logoPath: "/brand/hvac-pacific-dark.png",
  footerLogoPath: "/brand/hvac-pacific-white.png",
  iconPath: "/brand/hvac-pacific-icon-32.png",
  heroPath: "/brand/hvac-pacific-hero.webp",
} as const;

export type SiteLocale = (typeof SITE.locales)[number];