import {
  CHASSIS_FIXED_MID,
  CHASSIS_PART_LENGTH,
  GST_RATE,
  MODEL_BODYTYPE_DEFAULT_MS,
  MODEL_BODYTYPE_MAP,
  STATUS,
  brandFor,
  chassisPrefixFor,
} from "./constants";

const num = (v) => Number(v) || 0;

export const formatINR = (v) => `₹${num(v).toLocaleString("en-IN")}`;

export const formatDate = (v) => {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-IN");
};

export const formatDateTime = (v) => {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("en-IN");
};

export const totalOf = ({ model, bodyType, battery }) =>
  num(model?.price) + num(bodyType?.price) + num(battery?.price);

// Vehicle type is decided by the model: "LODER" is the cargo/loader model.
export const vehicleTypeForModel = (modelName) =>
  String(modelName || "").toUpperCase() === "LODER" ? "cargo" : "rikshaw";

export const bodyTypeOptions = (modelName, bodyTypes) => {
  const allowed = MODEL_BODYTYPE_MAP[String(modelName || "").toUpperCase()];
  if (!allowed) return bodyTypes;
  return bodyTypes.filter((bt) => allowed.includes(String(bt.name).toUpperCase()));
};

export const autoBodyType = (modelName, bodyTypes) =>
  MODEL_BODYTYPE_DEFAULT_MS.includes(String(modelName || "").toUpperCase())
    ? bodyTypes.find((bt) => String(bt.name).toUpperCase() === "MS") || null
    : null;

// ── Chassis ────────────────────────────────────────────────────
export const sanitizeChassisPart = (v) =>
  String(v).replace(/[^A-Za-z0-9]/g, "").slice(0, CHASSIS_PART_LENGTH).toUpperCase();

// PREFIX + 3 chars + H268 + 3 chars, or null until both parts are complete.
export const buildChassis = (vehicleType, mid1, mid2) => {
  if (!vehicleType) return null;
  if (mid1.length !== CHASSIS_PART_LENGTH || mid2.length !== CHASSIS_PART_LENGTH) {
    return null;
  }
  return `${chassisPrefixFor(vehicleType)}${mid1}${CHASSIS_FIXED_MID}${mid2}`.toUpperCase();
};

// Inverse of buildChassis: PREFIX + [mid1] + H268 + [mid2] -> the two editable
// parts. (The old app sliced the last 6 characters, which returned part of the
// fixed "H268" instead of mid1, so re-saving an edited chassis silently changed it.)
export const splitChassis = (chassis) =>
  chassis && chassis.length >= 10
    ? { mid1: chassis.slice(-10, -7), mid2: chassis.slice(-3) }
    : { mid1: "", mid2: "" };

export const resolveStatus = ({ billNumber, chassisNumber }) => {
  if (billNumber) return STATUS.DISPATCHED;
  if (chassisNumber) return STATUS.BILLING;
  return STATUS.ASSEMBLING;
};

// ── Payload sent to /QuotationTable (same fields as the old app) ─
export const buildPayload = ({
  dealer,
  vehicleType,
  chassisNumber,
  model,
  bodyType,
  color,
  battery,
  billNumber,
}) => ({
  dealerName: dealer?.name || "",
  dealerGstin: dealer?.gstin || "",
  dealerCode: dealer?.dealerCode || "",
  dealerAddress: dealer?.address || "",
  dealerState: dealer?.state || "",
  dealerDistrict: dealer?.dist || "",
  dealerPinCode: dealer?.pinCode || "",
  vehicleType,
  brandPrefix: brandFor(vehicleType),
  chassisNumber: chassisNumber || null,
  modelName: model?.name || "",
  modelPrice: model?.price || 0,
  bodyTypeName: bodyType?.name || "",
  bodyTypePrice: bodyType?.price || 0,
  colorName: color?.name || "",
  batteryType: battery?.btype || "",
  batteryVolt: battery?.volt || 0,
  batteryAmpereHours: battery?.ampere_hours || 0,
  batteryPrice: battery?.price || 0,
  totalAmount: totalOf({ model, bodyType, battery }),
  billNumber: billNumber || null,
  status: resolveStatus({ billNumber, chassisNumber }),
});

export const dealerFromInfo = (info) =>
  info
    ? {
        name: info.name,
        gstin: info.gstin,
        dealerCode: info.dealerCode,
        address: info.address,
        state: info.state,
        dist: info.dist,
        pinCode: info.pinCode,
      }
    : null;

// Rebuild the form selections from a saved quotation (edit mode). Prices are
// the ones stored on the quotation, not today's catalogue prices.
export const formFromQuotation = (q) => ({
  dealer: {
    name: q.dealerName,
    gstin: q.dealerGstin,
    dealerCode: q.dealerCode,
    address: q.dealerAddress,
    state: q.dealerState,
    dist: q.dealerDistrict,
    pinCode: q.dealerPinCode,
  },
  vehicleType: q.vehicleType || "",
  model: q.modelName ? { name: q.modelName, price: q.modelPrice } : null,
  bodyType: q.bodyTypeName ? { name: q.bodyTypeName, price: q.bodyTypePrice } : null,
  color: q.colorName ? { name: q.colorName } : null,
  battery: q.batteryType
    ? {
        btype: q.batteryType,
        volt: q.batteryVolt,
        ampere_hours: q.batteryAmpereHours,
        price: q.batteryPrice,
      }
    : null,
  billNumber: q.billNumber || "",
  ...(() => {
    const { mid1, mid2 } = splitChassis(q.chassisNumber);
    return { mid1, mid2 };
  })(),
});

// Splits a GST-inclusive total into taxable value + CGST + SGST so the three
// rows always add up to the total exactly.
export const gstBreakdown = (total) => {
  const t = num(total);
  const cgst = Math.round((t / (1 + GST_RATE)) * (GST_RATE / 2));
  const sgst = cgst;
  return { subtotal: t - cgst - sgst, cgst, sgst, total: t };
};
