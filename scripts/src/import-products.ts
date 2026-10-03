import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  attachProductToCollection,
  ensureCollection,
  findProductBySku,
  setManagedTags,
  setMetafields,
  setPublication,
  upsertProduct,
} from "./shopify-admin.js";

type SheetRow = Record<string, string>;
type Workbook = { Units: SheetRow[]; Accessories: SheetRow[] };

type ReportRow = {
  sheet: "Units" | "Accessories";
  key: string;
  title: string;
  action: "created" | "updated" | "drafted" | "skipped" | "planned" | "error";
  reason: string;
};

const UNIT_HEADERS = [
  "listing_id","status","site_category","brand","title","tonnage","system_type","outdoor_model",
  "indoor_model","furnace_model","refrigerant","efficiency_stated","ahri_number","seer2","eer2",
  "hspf2","price","cost","margin","ship_weight_lb","flags","action","compliant_alternative",
];

const ACCESSORY_HEADERS = [
  "sku","status","site_category","subcategory","brand","title","google_title","key_specs","price",
  "cost","margin","qty","ship_weight_lb","shipping_scope","flags","action","source_category",
  "source_brand","search_keywords",
];

const ACTIVE_STATUSES = new Set(["PUBLISH","PUBLISH AFTER CHECK","KEEP - LEGAL RISK"]);
const UNIT_CATEGORIES = new Set(["AC + Furnace Systems","Heat Pump Systems","Packaged Units","Ductless Mini Splits"]);

function slug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 230);
}

function collectionHandle(label: string) {
  const aliases: Record<string,string> = {
    "Heat Pump Systems": "heat-pump-systems",
    "Packaged Units": "packaged-units",
    "Ductless Mini Splits": "mini-splits",
    "Mini Split Systems": "mini-splits",
    "AC + Furnace Systems": "ac-furnace-systems",
    "Capacitors": "capacitors",
    "Dual Run Capacitors": "dual-run-capacitors",
    "Single Run Capacitors": "single-run-capacitors",
    "Contactors & Relays": "contactors-relays",
    "Motors": "motors",
    "Thermostats": "thermostats",
    "Furnace Parts": "furnace-parts",
    "Refrigeration Parts": "refrigeration-parts",
    "Electrical": "electrical",
    "Condensate": "condensate",
    "Chemicals & Leak Detection": "chemicals-leak-detection",
    "Tools": "tools",
    "Refrigerant": "refrigerant",
  };
  return aliases[label] ?? slug(label);
}

function required(value: string | undefined, field: string, key: string) {
  const clean = (value ?? "").trim();
  if (!clean) throw new Error(`Missing ${field} for ${key}`);
  return clean;
}

function numeric(value: string | undefined) {
  const clean = (value ?? "").trim();
  if (!clean) return undefined;
  const n = Number(clean.replace(/[$,%]/g, "").replace(/,/g, ""));
  return Number.isFinite(n) ? String(n) : undefined;
}

function integer(value: string | undefined) {
  const n = numeric(value);
  if (n === undefined) return undefined;
  return Math.round(Number(n));
}

function mf(namespace: string, key: string, type: string, value: string | undefined) {
  if (value === undefined || value === "") return null;
  return { namespace, key, type, value };
}

function readWorkbook(path: string): Workbook {
  const helper = resolve(dirname(fileURLToPath(import.meta.url)), "read-xlsx.py");
  const run = spawnSync("python3", [helper, path], { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
  if (run.status !== 0) throw new Error((run.stderr || run.stdout || "Unable to read workbook").trim());
  const parsed = JSON.parse(run.stdout) as Workbook;
  return parsed;
}

function assertHeaders(rows: SheetRow[], requiredHeaders: string[], sheet: string) {
  if (!rows.length) throw new Error(`${sheet} worksheet has no data rows.`);
  const headers = new Set(Object.keys(rows[0] ?? {}));
  const missing = requiredHeaders.filter((h) => !headers.has(h));
  if (missing.length) throw new Error(`${sheet} is missing required headers: ${missing.join(", ")}`);
}

function productHandle(row: SheetRow, sku: string) {
  const title = required(row.title, "title", sku);
  const brand = required(row.brand, "brand", sku);
  const model = row.outdoor_model || row.indoor_model || row.furnace_model || sku;
  const descriptor = title.toLowerCase().includes(model.toLowerCase()) ? `${brand} ${title}` : `${brand} ${title} ${model}`;
  return slug(descriptor);
}

function publicationId() {
  return process.env.SHOPIFY_HEADLESS_PUBLICATION_ID?.trim() || "";
}

function baseMetafields(row: SheetRow, isUnit: boolean) {
  const category = row.site_category?.trim() || "";
  const flags = row.flags?.trim() || "";
  const pickupOnly = /refrigerant/i.test(category);
  const requiresInstall = isUnit && UNIT_CATEGORIES.has(category);
  const threePhase = /3\s*[- ]?phase/i.test(row.system_type || "");
  const prop65 = /prop\s*65|proposition\s*65/i.test(flags);
  const internalFlags = [row.flags, row.action].filter(Boolean).join("\n");

  const values = [
    mf("specs","site_status","single_line_text_field",row.status?.trim()),
    mf("specs","site_category","single_line_text_field",category),
    mf("specs","subcategory","single_line_text_field",row.subcategory?.trim()),
    mf("specs","tonnage","number_decimal",numeric(row.tonnage)),
    mf("specs","system_type","single_line_text_field",row.system_type?.trim()),
    mf("specs","outdoor_model","single_line_text_field",row.outdoor_model?.trim()),
    mf("specs","indoor_model","single_line_text_field",row.indoor_model?.trim()),
    mf("specs","furnace_model","single_line_text_field",row.furnace_model?.trim()),
    mf("specs","refrigerant","single_line_text_field",row.refrigerant?.trim()),
    mf("specs","ahri_number","single_line_text_field",row.ahri_number?.trim()),
    mf("specs","seer2","number_decimal",numeric(row.seer2)),
    mf("specs","eer2","number_decimal",numeric(row.eer2)),
    mf("specs","hspf2","number_decimal",numeric(row.hspf2)),
    mf("specs","requires_epa608","boolean",pickupOnly ? "true" : "false"),
    mf("specs","requires_licensed_install","boolean",requiresInstall ? "true" : "false"),
    mf("specs","three_phase","boolean",threePhase ? "true" : "false"),
    mf("specs","prop65","boolean",prop65 ? "true" : "false"),
    mf("specs","key_specs","multi_line_text_field",row.key_specs?.trim()),
    mf("specs","google_title","single_line_text_field",row.google_title?.trim()),
    mf("specs","search_keywords","multi_line_text_field",row.search_keywords?.trim()),
    mf("internal","flags","multi_line_text_field",internalFlags),
    mf("internal","margin","number_decimal",numeric(row.margin)),
    mf("internal","ship_weight_lb","number_decimal",numeric(row.ship_weight_lb)),
    mf("internal","shipping_scope","single_line_text_field",row.shipping_scope?.trim()),
    mf("internal","source_category","single_line_text_field",row.source_category?.trim()),
    mf("internal","source_brand","single_line_text_field",row.source_brand?.trim()),
    mf("internal","compliant_alternative","single_line_text_field",row.compliant_alternative?.trim()),
  ];
  return {
    metafields: values.filter((x): x is NonNullable<typeof x> => Boolean(x)),
    pickupOnly,
    requiresInstall,
  };
}

function desiredStatus(row: SheetRow) {
  const raw = (row.status || "").trim().toUpperCase();
  const brand = (row.brand || "").trim().toUpperCase();
  const price = numeric(row.price);
  const reasons: string[] = [];
  if (!price) reasons.push("empty/invalid price");
  if (brand === "DECIDE") reasons.push("brand is DECIDE");
  if (!ACTIVE_STATUSES.has(raw)) reasons.push(`status ${raw || "(empty)"} is not publishable`);
  return {
    shopifyStatus: reasons.length ? "DRAFT" as const : "ACTIVE" as const,
    price,
    reasons,
  };
}

async function processRow(sheet: "Units" | "Accessories", row: SheetRow, apply: boolean): Promise<ReportRow> {
  const isUnit = sheet === "Units";
  const key = required(isUnit ? row.listing_id : row.sku, isUnit ? "listing_id" : "sku", sheet);
  const title = required(row.title, "title", key);
  const brand = required(row.brand, "brand", key);
  const category = required(row.site_category, "site_category", key);
  const state = desiredStatus(row);
  const handle = productHandle(row, key);
  const { metafields, pickupOnly } = baseMetafields(row, isUnit);
  const qty = isUnit ? undefined : integer(row.qty);
  const locationId = process.env.SHOPIFY_LOCATION_ID?.trim();

  if (!state.price) {
    return { sheet, key, title, action: apply ? "skipped" : "planned", reason: "Will remain DRAFT because price is empty or invalid." };
  }

  if (!apply) {
    return {
      sheet,
      key,
      title,
      action: "planned",
      reason: `${state.shopifyStatus}; handle=${handle}; collections=${[category,row.subcategory].filter(Boolean).join(" > ") || "(none)"}${state.reasons.length ? "; " + state.reasons.join("; ") : ""}`,
    };
  }

  const existing = await findProductBySku(key);
  const product = await upsertProduct({
    existing,
    title,
    handle,
    vendor: brand === "hvacpacific" ? "hvacpacific" : brand,
    productType: (row.subcategory || category).trim(),
    status: state.shopifyStatus,
    sku: key,
    price: state.price,
    cost: numeric(row.cost),
    qty,
    locationId,
  });

  await setMetafields(product.id, metafields);
  await setManagedTags(product.id, pickupOnly);

  const pubId = publicationId();
  if (state.shopifyStatus === "ACTIVE") {
    if (!pubId) throw new Error("SHOPIFY_HEADLESS_PUBLICATION_ID is required to publish ACTIVE products.");
    await setPublication(product.id, pubId, true);
  } else if (pubId) {
    await setPublication(product.id, pubId, false);
  }

  for (const label of [category, row.subcategory].map((x) => (x || "").trim()).filter(Boolean)) {
    const collection = await ensureCollection(label, collectionHandle(label));
    await attachProductToCollection(collection.id, product.id);
    if (pubId && state.shopifyStatus === "ACTIVE") await setPublication(collection.id, pubId, true);
  }

  const action: ReportRow["action"] = state.shopifyStatus === "DRAFT"
    ? "drafted"
    : existing ? "updated" : "created";

  return {
    sheet,
    key,
    title,
    action,
    reason: state.reasons.length ? state.reasons.join("; ") : "OK",
  };
}

function csvEscape(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function writeReport(rows: ReportRow[], apply: boolean) {
  const reportDir = resolve(process.cwd(), "reports");
  mkdirSync(reportDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const path = resolve(reportDir, `product-import-${apply ? "apply" : "dry-run"}-${stamp}.csv`);
  const header = ["sheet","key","title","action","reason"];
  const body = rows.map((r) => [r.sheet,r.key,r.title,r.action,r.reason].map(csvEscape).join(","));
  writeFileSync(path, [header.join(","), ...body].join("\n") + "\n", "utf8");
  return path;
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const fileArg = args.find((arg) => !arg.startsWith("--")) ?? "../hvacpacific_product_list.xlsx";
  const workbookPath = resolve(process.cwd(), fileArg);

  if (!existsSync(workbookPath)) {
    throw new Error(`Workbook not found: ${workbookPath}. Pass a path or add hvacpacific_product_list.xlsx to the repo root.`);
  }

  const workbook = readWorkbook(workbookPath);
  assertHeaders(workbook.Units, UNIT_HEADERS, "Units");
  assertHeaders(workbook.Accessories, ACCESSORY_HEADERS, "Accessories");

  if (apply && !process.env.SHOPIFY_HEADLESS_PUBLICATION_ID) {
    console.warn("SHOPIFY_HEADLESS_PUBLICATION_ID is not set. DRAFT rows can still be processed; ACTIVE rows will fail safe.");
  }
  if (apply && !process.env.SHOPIFY_LOCATION_ID) {
    console.warn("SHOPIFY_LOCATION_ID is not set. Accessory quantity values will not be written to a location.");
  }

  const rows: ReportRow[] = [];
  for (const [sheet, sheetRows] of [["Units",workbook.Units],["Accessories",workbook.Accessories]] as const) {
    for (const row of sheetRows) {
      const key = (sheet === "Units" ? row.listing_id : row.sku) || "(unknown)";
      try {
        const result = await processRow(sheet, row, apply);
        rows.push(result);
        console.log(`[${result.action.toUpperCase()}] ${sheet} ${result.key}: ${result.reason}`);
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        rows.push({ sheet, key, title: row.title || "", action: "error", reason });
        console.error(`[ERROR] ${sheet} ${key}: ${reason}`);
      }
    }
  }

  const report = writeReport(rows, apply);
  const counts = rows.reduce<Record<string,number>>((acc,row) => {
    acc[row.action] = (acc[row.action] || 0) + 1;
    return acc;
  }, {});

  console.log("\nImport summary");
  console.log(JSON.stringify(counts, null, 2));
  console.log(`Report: ${report}`);
  if (rows.some((r) => r.action === "error")) process.exitCode = 1;
}

await main();
