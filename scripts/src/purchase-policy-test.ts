import assert from "node:assert/strict";
import { evaluatePurchasePolicy } from "../../artifacts/hvac-pacific/lib/purchase-policy";

const ok = evaluatePurchasePolicy({
  availableForSale: true,
  meta: {},
  attributes: [],
});
assert.equal(ok.ok, true, "Normal published product should pass");

const blocked = evaluatePurchasePolicy({
  availableForSale: true,
  meta: { site_status: "HOLD" },
  attributes: [],
});
assert.deepEqual(blocked, {
  ok: false,
  error: "This product is not available for online purchase.",
  status: 409,
});

const epaMissing = evaluatePurchasePolicy({
  availableForSale: true,
  meta: { requires_epa608: "true" },
  attributes: [],
});
assert.equal(epaMissing.ok, false);
if (!epaMissing.ok) assert.equal(epaMissing.status, 400);

const epaComplete = evaluatePurchasePolicy({
  availableForSale: true,
  meta: { requires_epa608: "true" },
  attributes: [
    { key: "EPA 608 Certification", value: "TEST-CERT-001" },
    { key: "Certified Technician", value: "Test Technician" },
    { key: "EPA 608 Acknowledgement", value: "Confirmed" },
  ],
});
assert.equal(epaComplete.ok, true);
if (epaComplete.ok) assert.match(epaComplete.epaNote || "", /TEST-CERT-001/);

const installerMissing = evaluatePurchasePolicy({
  availableForSale: true,
  meta: { requires_licensed_install: "true" },
  attributes: [],
});
assert.equal(installerMissing.ok, false);
if (!installerMissing.ok) assert.equal(installerMissing.status, 400);

const installerComplete = evaluatePurchasePolicy({
  availableForSale: true,
  meta: { requires_licensed_install: "true" },
  attributes: [{ key: "Licensed Install Acknowledgement", value: "Confirmed" }],
});
assert.equal(installerComplete.ok, true);

const combinedComplete = evaluatePurchasePolicy({
  availableForSale: true,
  meta: { requires_epa608: "true", requires_licensed_install: "true" },
  attributes: [
    { key: "EPA 608 Certification", value: "TEST-CERT-002" },
    { key: "Certified Technician", value: "Test Technician" },
    { key: "EPA 608 Acknowledgement", value: "Confirmed" },
    { key: "Licensed Install Acknowledgement", value: "Confirmed" },
  ],
});
assert.equal(combinedComplete.ok, true);

console.log("Purchase policy tests passed.");
