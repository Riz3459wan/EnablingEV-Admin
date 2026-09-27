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

export const deliveryHandlers = [
  http.get("/api/admin/delivery", async ({ request }) => {
    await delay();
    const store = getStore();
    const url = new URL(request.url);
    const term = parseSearch(url);
    const dealerCode = url.searchParams.get("dealerCode");

    let list = [...store.deliveries];
    if (dealerCode) list = list.filter((d) => d.dealerCode === dealerCode);
    list = filterBySearch(list, term, [
      "chassisNumber",
      "billNumber",
      "dealerName",
      "dealerCode",
      "customerName",
      "customerMobile",
      "modelName",
      "colorName",
    ]);

    return ok(list, "Deliveries fetched successfully");
  }),

  http.get("/api/admin/delivery/:id", async ({ params }) => {
    await delay(150);
    const store = getStore();
    const d = store.deliveries.find((x) => String(x.id) === String(params.id));
    if (!d) return notFound("Delivery not found");
    return ok(d);
  }),

  http.post("/api/admin/delivery", async ({ request }) => {
    await delay(300);
    const body = await request.json();
    if (!body.chassisNumber) {
      return badRequest("Chassis Number is required.");
    }
    const store = getStore();
    const newD = { id: Date.now(), ...body };
    store.deliveries.push(newD);
    persistStore();
    return created(newD, "Delivery created successfully");
  }),

  http.put("/api/admin/delivery/:id", async ({ params, request }) => {
    await delay(300);
    const body = await request.json();
    const store = getStore();
    const index = store.deliveries.findIndex(
      (d) => String(d.id) === String(params.id),
    );
    if (index === -1) return notFound("Delivery not found");

    store.deliveries[index] = { ...store.deliveries[index], ...body };
    persistStore();
    return ok(store.deliveries[index], "Delivery updated successfully");
  }),

  http.delete("/api/admin/delivery/:id", async ({ params }) => {
    await delay(250);
    const store = getStore();
    const index = store.deliveries.findIndex(
      (d) => String(d.id) === String(params.id),
    );
    if (index === -1) return notFound("Delivery not found");

    const removed = store.deliveries.splice(index, 1)[0];
    persistStore();
    return ok(removed, "Delivery deleted successfully");
  }),
];
