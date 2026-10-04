export type PurchaseAttribute = { key: string; value: string };

export type PurchasePolicyMeta = {
  site_status?: string;
  requires_epa608?: string;
  requires_licensed_install?: string;
};

export type PurchasePolicyResult =
  | { ok: false; error: string; status: 400 | 404 | 409 }
  | { ok: true; epaNote?: string };

function truthy(value?: string) {
  return value === "true" || value === "1";
}

export function evaluatePurchasePolicy({
  found = true,
  availableForSale,
  meta,
  attributes,
}: {
  found?: boolean;
  availableForSale: boolean;
  meta: PurchasePolicyMeta;
  attributes: PurchaseAttribute[];
}): PurchasePolicyResult {
  if (!found) return { ok: false, error: "Product variant was not found.", status: 404 };
  if (!availableForSale) return { ok: false, error: "This product is not currently available.", status: 409 };

  const siteStatus = (meta.site_status || "").trim().toUpperCase();
  if (siteStatus === "HOLD" || siteStatus === "NEEDS DATA") {
    return { ok: false, error: "This product is not available for online purchase.", status: 409 };
  }

  const attrs = new Map(attributes.map((attribute) => [attribute.key, attribute.value.trim()]));
  const requiresEpa = truthy(meta.requires_epa608);
  const requiresInstall = truthy(meta.requires_licensed_install);

  if (requiresEpa) {
    const cert = attrs.get("EPA 608 Certification") || "";
    const technician = attrs.get("Certified Technician") || "";
    const acknowledgement = attrs.get("EPA 608 Acknowledgement");
    if (!cert || cert.length > 120 || !technician || technician.length > 120 || acknowledgement !== "Confirmed") {
      return { ok: false, error: "EPA 608 certification details are required for this refrigerant product.", status: 400 };
    }
  }

  if (requiresInstall && attrs.get("Licensed Install Acknowledgement") !== "Confirmed") {
    return { ok: false, error: "Installation acknowledgement is required for this equipment.", status: 400 };
  }

  return {
    ok: true,
    epaNote: requiresEpa
      ? `EPA 608 cert: ${attrs.get("EPA 608 Certification")} · Technician: ${attrs.get("Certified Technician")}`
      : undefined,
  };
}
