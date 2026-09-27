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

export const dispatchHandlers = [
  http.get("/api/admin/dispatch", async ({ request }) => {
    await delay();
    const store = getStore();
    const url = new URL(request.url);
    const term = parseSearch(url);
    const dealerCode = url.searchParams.get("dealerCode");

    let list = [...store.dispatches];
    if (dealerCode) list = list.filter((d) => d.dealerCode === dealerCode);
    list = filterBySearch(list, term, [
      "chassisNumber",
      "dealerName",
      "dealerCode",
      "modelName",
      "bodyTypeName",
      "billNumber",
      "colorName",
    ]);

    return ok(list, "Dispatches fetched successfully");
  }),

  http.get("/api/admin/dispatch/:id", async ({ params }) => {
    await delay(150);
    const store = getStore();
    const d = store.dispatches.find((x) => String(x.id) === String(params.id));
    if (!d) return notFound("Dispatch not found");
    return ok(d);
  }),

  http.post("/api/admin/dispatch", async ({ request }) => {
    await delay(300);
    const body = await request.json();
    if (!body.chassisNumber) {
      return badRequest("Chassis Number is required.");
    }
    const store = getStore();
    const newD = { id: Date.now(), ...body };
    store.dispatches.push(newD);
    persistStore();
    return created(newD, "Dispatch created successfully");
  }),

  http.put("/api/admin/dispatch/:id", async ({ params, request }) => {
    await delay(300);
    const body = await request.json();
    const store = getStore();
    const index = store.dispatches.findIndex(
      (d) => String(d.id) === String(params.id),
    );
    if (index === -1) return notFound("Dispatch not found");

    store.dispatches[index] = { ...store.dispatches[index], ...body };
    persistStore();
    return ok(store.dispatches[index], "Dispatch updated successfully");
  }),

  http.delete("/api/admin/dispatch/:id", async ({ params }) => {
    await delay(250);
    const store = getStore();
    const index = store.dispatches.findIndex(
      (d) => String(d.id) === String(params.id),
    );
    if (index === -1) return notFound("Dispatch not found");

    const removed = store.dispatches.splice(index, 1)[0];
    persistStore();
    return ok(removed, "Dispatch deleted successfully");
  }),
];
