import { http } from "msw";
import { getStore, persistStore } from "../store";
import {
  delay,
  ok,
  created,
  notFound,
  badRequest,
  parseSearch,
  filterBySearch,
} from "../utils";

export const vehiclesHandlers = [
  http.get("/api/admin/vehicles/dealer-summary", async () => {
    await delay();
    const store = getStore();

    // dealers + vehicles + dispatches + deliveries mila ke summary banao
    const summaryMap = {};

    // 1. Inventory — "in stock" vehicles (assemblyStatus != Dispatched)
    store.inventory.forEach((v) => {
      // inventory me dealer code nahi hai, assume factory stock
      // isliye inventory ko "unassigned" bucket me daalenge
    });

    // 2. Dispatched vehicles — dealer assigned
    store.dispatches.forEach((d) => {
      const key = d.dealerCode;
      if (!key) return;
      if (!summaryMap[key]) {
        summaryMap[key] = {
          dealerCode: d.dealerCode,
          dealerName: d.dealerName,
          dealerState: d.dealerState,
          dealerDistrict: d.dealerDistrict,
          totalVehicles: 0,
          inStock: 0,
          dispatched: 0,
          sold: 0,
          vehicles: [],
        };
      }
      summaryMap[key].dispatched += 1;
      summaryMap[key].totalVehicles += 1;
      summaryMap[key].vehicles.push({
        ...d,
        _status: "Dispatched",
        _stage: "with_dealer",
      });
    });

    // 3. Delivered vehicles — sold to customer
    store.deliveries.forEach((d) => {
      const key = d.dealerCode;
      if (!key) return;
      if (!summaryMap[key]) {
        summaryMap[key] = {
          dealerCode: d.dealerCode,
          dealerName: d.dealerName,
          dealerState: d.dealerState,
          dealerDistrict: d.dealerDistrict,
          totalVehicles: 0,
          inStock: 0,
          dispatched: 0,
          sold: 0,
          vehicles: [],
        };
      }
      summaryMap[key].sold += 1;
      summaryMap[key].totalVehicles += 1;
      summaryMap[key].vehicles.push({
        ...d,
        _status: "Delivered",
        _stage: "sold",
      });
    });

    // 4. Dispatches minus deliveries = in stock (with dealer, not sold)
    Object.keys(summaryMap).forEach((key) => {
      const s = summaryMap[key];
      s.inStock = Math.max(0, s.dispatched - s.sold);
    });

    const list = Object.values(summaryMap).sort(
      (a, b) => b.totalVehicles - a.totalVehicles,
    );

    return ok(list, "Dealer vehicle summary fetched successfully");
  }),

  http.get("/api/admin/vehicles", async ({ request }) => {
    await delay();
    const store = getStore();
    const url = new URL(request.url);
    const term = parseSearch(url);
    const dealerCode = url.searchParams.get("dealerCode");

    let list = [...store.vehicles];
    if (dealerCode) list = list.filter((v) => v.dealerCode === dealerCode);
    list = filterBySearch(list, term, [
      "dealerName",
      "dealerCode",
      "chassisNumber",
      "vehicleType",
      "modelName",
      "bodyTypeName",
      "colorName",
      "batteryType",
    ]);

    return ok(list, "Vehicles fetched successfully");
  }),

  http.get("/api/VehicleTable", async ({ request }) => {
    await delay();
    const store = getStore();
    const url = new URL(request.url);
    const dealerCode = url.searchParams.get("dealerCode");

    let list = [...store.vehicles];
    if (dealerCode) list = list.filter((v) => v.dealerCode === dealerCode);

    return ok(list);
  }),

  http.get("/api/admin/vehicles/:id", async ({ params }) => {
    await delay(150);
    const store = getStore();
    const vehicle = store.vehicles.find(
      (v) => String(v.id) === String(params.id),
    );
    if (!vehicle) return notFound("Vehicle not found");
    return ok(vehicle);
  }),

  http.post("/api/admin/vehicles", async ({ request }) => {
    await delay(300);
    const body = await request.json();
    if (!body.chassisNumber) {
      return badRequest("Chassis Number is required.");
    }
    const store = getStore();
    const newVehicle = { id: Date.now(), ...body };
    store.vehicles.push(newVehicle);
    persistStore();
    return created(newVehicle, "Vehicle created successfully");
  }),

  http.put("/api/admin/vehicles/:id", async ({ params, request }) => {
    await delay(300);
    const body = await request.json();
    const store = getStore();
    const index = store.vehicles.findIndex(
      (v) => String(v.id) === String(params.id),
    );
    if (index === -1) return notFound("Vehicle not found");

    store.vehicles[index] = { ...store.vehicles[index], ...body };
    persistStore();
    return ok(store.vehicles[index], "Vehicle updated successfully");
  }),

  http.delete("/api/admin/vehicles/:id", async ({ params }) => {
    await delay(250);
    const store = getStore();
    const index = store.vehicles.findIndex(
      (v) => String(v.id) === String(params.id),
    );
    if (index === -1) return notFound("Vehicle not found");

    const removed = store.vehicles.splice(index, 1)[0];
    persistStore();
    return ok(removed, "Vehicle deleted successfully");
  }),
];
