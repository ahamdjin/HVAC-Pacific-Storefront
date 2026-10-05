export type StaticPage = {
  title: string;
  description: string;
  reviewed: boolean;
  sections: Array<{ heading?: string; paragraphs: string[] }>;
};

export const STATIC_PAGES: Record<string, StaticPage> = {
  about: {
    title: "About HVAC Pacific",
    description: "HVAC Pacific supplies HVAC equipment and parts with pickup in Rosemead and local delivery across Southern California.",
    reviewed: true,
    sections: [
      { paragraphs: ["HVAC Pacific supplies HVAC equipment and replacement parts for contractors, technicians and property owners in Southern California. Our catalog is built around clear model information and verified product data rather than placeholder specifications."] },
      { heading: "How we sell", paragraphs: ["Orders are fulfilled through pickup at 2438 San Gabriel Blvd, Rosemead, CA 91770 or eligible local delivery. Product availability, price and technical details shown on the site come from the live Shopify catalog."] },
      { heading: "Product information", paragraphs: ["We publish model numbers, efficiency data, refrigerant, compliance fields and technical documents only when those values are available in the product catalog. Buyers should still verify the exact equipment combination and job requirements before installation."] },
    ],
  },
  "pickup-delivery": {
    title: "Pickup & Local Delivery",
    description: "Pickup at 2438 San Gabriel Blvd, Rosemead, CA 91770, plus eligible local delivery within the configured service area.",
    reviewed: true,
    sections: [
      { paragraphs: ["HVAC Pacific offers pickup at 2438 San Gabriel Blvd, Rosemead, CA 91770 and eligible local delivery within the configured Southern California service area. At launch, the storefront is not offering nationwide carrier shipping."] },
      { heading: "Pickup", paragraphs: ["Pickup is at 2438 San Gabriel Blvd, Rosemead, CA 91770. Bring the order information requested in the pickup instructions. Restricted products may require additional verification before release."] },
      { heading: "Local delivery", paragraphs: ["Delivery eligibility depends on the delivery address, product and current service radius. Large equipment and restricted products can have additional handling requirements. If an order cannot be fulfilled using the selected local method, HVAC Pacific will contact the purchaser before fulfillment."] },
      { heading: "Before ordering equipment", paragraphs: ["Confirm that the exact model, capacity, voltage, phase, refrigerant and component combination match the intended project. Local pickup or delivery does not include installation unless a product or service is explicitly described otherwise."] },
    ],
  },
  "california-hvac-compliance": {
    title: "California HVAC Compliance Guide",
    description: "A practical starting point for checking HVAC equipment requirements in California.",
    reviewed: false,
    sections: [
      { paragraphs: ["California HVAC requirements depend on the equipment type, installation address and current federal, state, air-district and local building rules. This draft is a buying checklist, not a substitute for the current rule text, manufacturer documentation or the licensed contractor responsible for the installation."] },
      { heading: "Efficiency and exact system ratings", paragraphs: ["California is in the federal Southwest region for central air-conditioner regional standards. Current equipment should be evaluated using the applicable SEER2, EER2 and HSPF2 metrics for the exact product or certified combination. HVAC Pacific displays those ratings only when they are stored for the product; we do not convert or estimate missing ratings."] },
      { heading: "California appliance certification", paragraphs: ["The California Energy Commission requires regulated appliance models to comply with Title 20 before they are sold or offered for sale in California. Approved models can be verified in the CEC Modernized Appliance Efficiency Database System (MAEDbS). A California listing is model-specific and should not be inferred from the brand or product family."] },
      { heading: "AHRI matched systems", paragraphs: ["For split systems, verify the exact outdoor unit, indoor coil or air handler and furnace where applicable. An AHRI Certified Reference Number can document a tested combination and its certified ratings. Matching two components by nominal tonnage alone is not the same as verifying a certified combination."] },
      { heading: "South Coast AQMD gas-furnace requirements", paragraphs: ["Natural-gas-fired fan-type central furnaces installed in South Coast AQMD territory can be subject to Rule 1111 NOx requirements. Rule 1111 was amended again in January 2026. Verify the current rule and the exact furnace category before treating a product as compliant for an installation."] },
      { heading: "Permits and installation", paragraphs: ["Equipment compliance does not remove job-specific permitting, electrical, gas, refrigerant, duct, commissioning or licensed-installation requirements. The contractor and local authority having jurisdiction should confirm the final design before installation."] },
    ],
  },
  "refrigerant-sales-policy": {
    title: "Refrigerant Sales Policy",
    description: "Draft HVAC Pacific refrigerant sales and certification-verification policy.",
    reviewed: false,
    sections: [
      { paragraphs: ["HVAC Pacific restricts refrigerant sales when federal law requires purchaser or technician certification. A product marked as requiring EPA Section 608 verification cannot be added to the cart without the requested certification information and acknowledgement."] },
      { heading: "Certification verification", paragraphs: ["For a gated order, the purchaser must provide the EPA 608 certification number and certified technician name requested during checkout. Submission of a number does not itself complete verification. HVAC Pacific may verify the information before releasing the product for pickup or delivery."] },
      { heading: "Orders that cannot be verified", paragraphs: ["If required certification information is missing, invalid or cannot be verified, the restricted product will not be released. The affected order may be cancelled and refunded. HVAC Pacific may request additional documentation when reasonably necessary to confirm eligibility."] },
      { heading: "Local fulfillment", paragraphs: ["Refrigerant products are configured for local pickup or eligible local delivery, not nationwide carrier shipment, unless a specific product page expressly states otherwise. Fulfillment remains subject to applicable transport, storage and handling requirements."] },
      { heading: "R-22 and used refrigerant", paragraphs: ["The phaseout of new HCFC-22 production and import does not prohibit lawful servicing of existing R-22 equipment. Any R-22 or other refrigerant offered by HVAC Pacific must be represented according to its actual source and product documentation. Used refrigerant sold to a new owner is subject to federal reclamation requirements; HVAC Pacific does not represent recovered refrigerant as reclaimed unless that status is documented."] },
      { heading: "Purchaser responsibility", paragraphs: ["The purchaser is responsible for using refrigerant only in equipment and applications for which it is permitted and compatible, and for ensuring service is performed by appropriately qualified personnel. Refrigerants are not interchangeable merely because fittings or pressure ranges appear similar."] },
    ],
  },
  "shipping-returns": {
    title: "Shipping & Returns",
    description: "Draft HVAC Pacific pickup, local-delivery and returns policy.",
    reviewed: false,
    sections: [
      { paragraphs: ["At launch, HVAC Pacific is configured for local pickup and eligible local delivery rather than nationwide carrier shipping. The website should not be interpreted as offering carrier shipment outside the displayed or confirmed local fulfillment options."] },
      { heading: "Pickup and delivery", paragraphs: ["Pickup is at 2438 San Gabriel Blvd, Rosemead, CA 91770. Local-delivery eligibility depends on the address, product and current delivery radius. Large equipment, refrigerants and other restricted products can require additional verification or handling before fulfillment."] },
      { heading: "Inspect the order", paragraphs: ["Inspect equipment and packaging at pickup or delivery and report visible damage, missing items or a model mismatch promptly using the order contact information. Do not install equipment that appears damaged or is not the model ordered."] },
      { heading: "Proposed return eligibility — pending final review", paragraphs: ["The working return policy is intended to limit standard returns to eligible merchandise that is unopened, uninstalled and in resalable condition with the original packaging and product identification intact. A return authorization should be obtained before bringing equipment back. The final return window, any restocking rules and category-specific exclusions have not been approved and must be finalized before this page is marked reviewed."] },
      { heading: "Installed, opened or restricted products", paragraphs: ["Installation, opening sealed product, adding refrigerant, field modification or other use can affect whether an item can be returned. Refrigerants, electrical parts and special-order items may require separate rules. These exclusions remain subject to final business and legal review."] },
      { heading: "Incorrect or defective products", paragraphs: ["If HVAC Pacific supplies the wrong model or a product appears defective before installation, contact support before installing or modifying it. Manufacturer warranty procedures may apply to product defects."] },
    ],
  },
  warranty: {
    title: "Warranty",
    description: "Draft HVAC Pacific warranty information.",
    reviewed: false,
    sections: [
      { paragraphs: ["Manufacturer warranty coverage is governed by the manufacturer terms for the exact model and application. HVAC Pacific does not publish a warranty duration unless that duration is supported by the applicable manufacturer information."] },
      { heading: "Registration and installation conditions", paragraphs: ["Some manufacturers require timely product registration, qualified installation, proof of purchase or other conditions for particular warranty benefits. The purchaser and installer should review the current warranty document for every component in a system."] },
      { heading: "Parts and labor are different", paragraphs: ["A manufacturer parts warranty does not automatically include diagnostic, removal, installation, refrigerant, freight or labor costs. Do not assume those costs are covered unless the applicable written warranty expressly says so."] },
      { heading: "Matched equipment and application", paragraphs: ["Using an incompatible component, improper refrigerant, incorrect electrical supply or an installation outside manufacturer requirements can affect performance and warranty eligibility. Verify the complete system before installation."] },
      { heading: "Warranty support", paragraphs: ["Keep the sales receipt, serial numbers, model numbers, installation records and any registration confirmation. Contact HVAC Pacific with the order information if assistance locating the manufacturer warranty process is needed."] },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    description: "Draft HVAC Pacific privacy policy.",
    reviewed: false,
    sections: [
      { paragraphs: ["This privacy policy is a working draft pending legal review. HVAC Pacific collects information needed to operate the storefront, fulfill orders, respond to customers, process installer-referral requests, measure site performance and protect the service."] },
      { heading: "Information you provide", paragraphs: ["Depending on the interaction, information can include name, phone number, email address, delivery or billing details, order information, messages, preferred language and product/project details. Restricted-product orders can also include certification information needed to verify eligibility."] },
      { heading: "Commerce and service providers", paragraphs: ["Shopify provides the commerce backend and checkout. Contact or installer forms can be forwarded to the configured customer-management or lead system. Payment information submitted through Shopify checkout is processed through the payment services configured for the store rather than being intentionally stored in the HVAC Pacific application code."] },
      { heading: "Analytics and technical data", paragraphs: ["When analytics is enabled, the site can collect technical and interaction information such as page views, product views, cart activity, browser/device information and referral data. This information is used to understand storefront performance and improve the service."] },
      { heading: "How information is used", paragraphs: ["Information can be used to fulfill and support orders, answer inquiries, verify restricted purchases, refer installer requests, prevent abuse, maintain records, comply with legal obligations and improve the website. HVAC Pacific should not use submitted certification data for unrelated marketing."] },
      { heading: "Retention and requests", paragraphs: ["Records should be retained only as long as reasonably needed for the purpose collected, operational requirements and applicable legal obligations. California privacy-rights language, request procedures and any required notices should be finalized during legal review before this page is marked reviewed."] },
      { heading: "Contact", paragraphs: ["Privacy questions can be sent to the support email shown on the website. This draft must be updated if the business adds new advertising, tracking, payment, financing or data-sharing services."] },
    ],
  },
  terms: {
    title: "Terms of Use",
    description: "Draft HVAC Pacific website and sales terms.",
    reviewed: false,
    sections: [
      { paragraphs: ["These terms are a working draft pending legal review. By using the storefront, customers should understand that HVAC equipment selection and installation can involve technical, licensing, permitting and safety requirements beyond the act of purchasing a product."] },
      { heading: "Product information", paragraphs: ["HVAC Pacific aims to display current catalog data, but manufacturer specifications, documentation and availability can change. Buyers must verify the exact model, component match, voltage, phase, refrigerant, capacity and application before installation. A missing specification should not be inferred."] },
      { heading: "Orders and availability", paragraphs: ["Submitting an order does not guarantee fulfillment if inventory, pricing, restricted-product verification or product data is found to be incorrect. HVAC Pacific may contact the purchaser to resolve an issue or may cancel and refund an order that cannot lawfully or accurately be fulfilled."] },
      { heading: "Installation and permits", paragraphs: ["HVAC Pacific does not perform installation unless a separate service is explicitly offered. Equipment identified as requiring licensed installation must be installed by an appropriately licensed and qualified contractor and may require permits, inspections and EPA certification for refrigerant work."] },
      { heading: "Compatibility", paragraphs: ["The purchaser should not combine components based only on nominal tonnage, brand family or physical fit. Split-system combinations should be verified using manufacturer data and, where applicable, AHRI certified matching information."] },
      { heading: "Restricted products", paragraphs: ["Refrigerant and other restricted products can require certifications or additional verification. Providing false certification information or attempting to bypass a purchase restriction can result in cancellation of the affected order."] },
      { heading: "Final legal terms", paragraphs: ["Payment, dispute, limitation-of-liability, governing-law and other legal clauses should be reviewed and approved by qualified counsel before this page is marked reviewed. This draft intentionally does not invent those terms."] },
    ],
  },
  "prop-65": {
    title: "California Proposition 65",
    description: "Draft information about Proposition 65 warnings on HVAC Pacific product pages.",
    reviewed: false,
    sections: [
      { paragraphs: ["California Proposition 65 requires warnings for qualifying exposures to chemicals listed by the state as causing cancer, birth defects or other reproductive harm. A warning does not by itself describe the level of exposure from a particular product."] },
      { heading: "How HVAC Pacific displays warnings", paragraphs: ["When the product catalog identifies an item as requiring a Proposition 65 warning, HVAC Pacific displays a warning block on that product page. Product packaging and manufacturer documentation remain important sources for the specific warning supplied with the item."] },
      { heading: "Do not infer a warning status", paragraphs: ["If a product page does not display a Prop 65 block, that should not be interpreted as an independent determination by HVAC Pacific that no warning can ever apply. The storefront renders the warning when the catalog field is set."] },
      { heading: "Before installation or use", paragraphs: ["Review the product label, packaging, safety data sheet where applicable and manufacturer instructions. This page should be finalized against the business's actual warning and recordkeeping practices before it is marked reviewed."] },
    ],
  },
};
