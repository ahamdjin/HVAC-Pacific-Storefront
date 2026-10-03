export type StaticPage = {
  title: string;
  description: string;
  reviewed: boolean;
  sections: Array<{ heading?: string; paragraphs: string[] }>;
};

export const STATIC_PAGES: Record<string, StaticPage> = {
  about: {
    title: "About HVAC Pacific",
    description: "HVAC Pacific supplies HVAC equipment and parts with local pickup and delivery in Southern California.",
    reviewed: true,
    sections: [
      { paragraphs: ["HVAC Pacific supplies HVAC equipment and replacement parts for contractors, technicians and property owners in Southern California. Our catalog is built around clear model information and verified product data rather than placeholder specifications."] },
      { heading: "How we sell", paragraphs: ["Orders are fulfilled through local pickup or eligible local delivery. Product availability, price and technical details shown on the site come from the live Shopify catalog."] },
    ],
  },
  "pickup-delivery": {
    title: "Pickup & Local Delivery",
    description: "Information about HVAC Pacific local pickup and delivery within the configured service area.",
    reviewed: true,
    sections: [
      { paragraphs: ["HVAC Pacific offers local pickup and local delivery within the configured service area. The pickup location is provided after order while the showroom address is not published on this website."] },
      { heading: "Before ordering", paragraphs: ["Large equipment, refrigerants and other restricted products may have special fulfillment requirements. The product page and checkout information control for each item."] },
    ],
  },
  "california-hvac-compliance": {
    title: "California HVAC Compliance Guide",
    description: "A practical starting point for checking HVAC equipment requirements in California.",
    reviewed: false,
    sections: [
      { paragraphs: ["California HVAC requirements depend on the equipment type, installation location and current state or local rules. This page is a working compliance guide and should not replace manufacturer documentation, permit requirements or advice from a licensed contractor."] },
      { heading: "Equipment data to verify", paragraphs: ["Check the exact model combination, efficiency ratings, refrigerant, electrical requirements and any applicable AHRI or California listing information before ordering. HVAC Pacific displays those fields only when they are present in the product catalog."] },
      { heading: "Matched systems", paragraphs: ["For split systems, verify that the outdoor and indoor components are an approved match for the intended installation rather than assuming two components are compatible because their nominal capacity is similar."] },
    ],
  },
  "refrigerant-sales-policy": {
    title: "Refrigerant Sales Policy",
    description: "Draft HVAC Pacific refrigerant sales and certification-verification policy.",
    reviewed: false,
    sections: [
      { paragraphs: ["Refrigerant orders may require certification verification before pickup or delivery. Where a product is flagged for EPA 608 verification, the purchaser must provide the requested certification information before the order can be fulfilled."] },
      { heading: "Verification", paragraphs: ["Orders that require certification are held for verification. Orders that cannot be verified may be cancelled and refunded. Additional restrictions may apply based on the refrigerant and destination."] },
    ],
  },
  "shipping-returns": {
    title: "Shipping & Returns",
    description: "Draft HVAC Pacific pickup, local-delivery and returns policy.",
    reviewed: false,
    sections: [
      { paragraphs: ["At launch, HVAC Pacific is configured for local pickup and eligible local delivery rather than nationwide carrier shipping."] },
      { heading: "Returns", paragraphs: ["This policy is pending final business review. Do not rely on this draft as the final return policy until the page is marked reviewed."] },
    ],
  },
  warranty: {
    title: "Warranty",
    description: "Draft HVAC Pacific warranty information.",
    reviewed: false,
    sections: [
      { paragraphs: ["Manufacturer warranty coverage is governed by the manufacturer terms for the exact product. Registration, qualified installation or other conditions may apply. HVAC Pacific does not publish invented warranty periods."] },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    description: "Draft HVAC Pacific privacy policy.",
    reviewed: false,
    sections: [
      { paragraphs: ["This privacy policy is a draft pending review. The site processes information needed for orders, customer support, installer referrals, analytics and site security."] },
    ],
  },
  terms: {
    title: "Terms of Use",
    description: "Draft HVAC Pacific website and sales terms.",
    reviewed: false,
    sections: [
      { paragraphs: ["These terms are a draft pending review. Product specifications, compatibility and installation requirements should be verified for the exact application before purchase."] },
    ],
  },
  "prop-65": {
    title: "California Proposition 65",
    description: "Draft information about Proposition 65 warnings on HVAC Pacific product pages.",
    reviewed: false,
    sections: [
      { paragraphs: ["When the catalog marks a product as requiring a Proposition 65 warning, HVAC Pacific displays a warning block on that product page. Review the product packaging and manufacturer documentation for the applicable warning information."] },
    ],
  },
};