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
  logoUrl:
    "https://assets.cdn.filesafe.space/Z1X6dLIh9rIQWOIUiptn/media/6aa5c74edf2d0155533d43d4.png",
  logoPath: "/brand/hvacpacific-logo.png",
} as const;

export type SiteLocale = (typeof SITE.locales)[number];