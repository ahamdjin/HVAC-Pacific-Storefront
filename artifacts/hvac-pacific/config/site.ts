export const SITE = {
  brand: "hvacpacific",
  displayName: "HVAC Pacific",
  domain: "https://hvacpacific.com",
  phone: "+1 626-929-4200",
  phoneE164: "+16269294200",
  email: "min@hvacpacific.com",
  mailingAddress: {
    street: "2438 San Gabriel Blvd",
    city: "Rosemead",
    region: "CA",
    postal: "91770",
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
