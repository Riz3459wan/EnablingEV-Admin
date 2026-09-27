import { http } from "msw";
import { getStore } from "../store";
import { delay, ok } from "../utils";
import { CHASSIS_PREFIX } from "../../features/quotation/constants";

export const formsHandlers = [
  http.get("/api/admin/forms/chassis", async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const vehicleType = url.searchParams.get("vehicleType") || "rikshaw";
    const dealerCode = url.searchParams.get("dealerCode");

    const prefix =
      CHASSIS_PREFIX[vehicleType === "cargo" ? "cargo" : "rikshaw"];
    const store = getStore();

    const scopedVehicles = dealerCode
      ? store.vehicles.filter((v) => v.dealerCode === dealerCode)
      : store.vehicles;

    const seen = new Set();
    [...scopedVehicles, ...store.quotations].forEach((item) => {
      const chassis = item.chassisNumber;
      if (chassis && chassis.startsWith(prefix)) seen.add(chassis);
    });

    return ok([...seen].sort());
  }),

  http.get("/api/admin/forms/form22", async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const chassisNumber = url.searchParams.get("chassisNumber");
    return ok({ chassisNumber, generatedAt: new Date().toISOString() });
  }),
];
