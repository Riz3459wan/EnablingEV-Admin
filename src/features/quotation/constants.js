// Business constants copied from the old createQuotation.jsx.

export const CHASSIS_PREFIX = { cargo: "ME9EBCC", rikshaw: "ME9EBCR" };
export const CHASSIS_FIXED_MID = "H268";
export const CHASSIS_PART_LENGTH = 3;

// Models whose body type is picked automatically (always "MS").
export const MODEL_BODYTYPE_DEFAULT_MS = ["F1", "T1"];

// Which body types each model may use. Models not listed can use any.
export const MODEL_BODYTYPE_MAP = {
  F1: ["MS"],
  T1: ["MS"],
  F3: ["MS"],
  LODER: ["NR", "DS"],
  F2: ["MS", "SS"],
  F4: ["MS", "SS"],
  FINE: ["MS", "SS"],
  DELUX: ["MS", "SS"],
};

export const STATUS = {
  ASSEMBLING: "Under Assembling",
  BILLING: "Under Billing",
  DISPATCHED: "Dispatched",
};

// Prices are GST-inclusive; GST is split evenly into CGST + SGST.
export const GST_RATE = 0.05;

export const chassisPrefixFor = (vehicleType) =>
  vehicleType === "cargo" ? CHASSIS_PREFIX.cargo : CHASSIS_PREFIX.rikshaw;

export const brandFor = (vehicleType) =>
  vehicleType === "cargo" ? "Halchal" : "Jhat Pat Jio";

export const vehicleTypeLabel = (vehicleType) =>
  vehicleType === "cargo" ? "Cargo / Loader" : "Rikshaw";

const BADGE = {
  "under assembling": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "under billing": "bg-sky-50 text-sky-700 border-sky-200",
  dispatched: "bg-green-50 text-green-700 border-green-200",
  approved: "bg-purple-50 text-purple-700 border-purple-200",
};

export const statusBadgeClass = (status) =>
  BADGE[(status || "pending").toLowerCase()] ||
  "bg-slate-50 text-slate-600 border-slate-200";
