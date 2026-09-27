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

export const quotationsHandlers = [
  http.get("/api/admin/quotations", async ({ request }) => {
    await delay();
    const store = getStore();
    const url = new URL(request.url);
    const term = parseSearch(url);
    const status = url.searchParams.get("status");
    const dealerCode = url.searchParams.get("dealerCode");

    let list = [...store.quotations];
    if (dealerCode) list = list.filter((q) => q.dealerCode === dealerCode);
    if (status && status !== "all") {
      list = list.filter((q) => q.status === status);
    }
    list = filterBySearch(list, term, [
      "chassisNumber",
      "dealerName",
      "dealerCode",
      "modelName",
      "bodyTypeName",
      "colorName",
      "billNumber",
      "status",
    ]);

    return ok(list, "Quotations fetched successfully");
  }),

  http.get("/api/admin/quotations/:id", async ({ params }) => {
    await delay(150);
    const store = getStore();
    const q = store.quotations.find((x) => String(x.id) === String(params.id));
    if (!q) return notFound("Quotation not found");
    return ok(q);
  }),

  http.post("/api/QuotationTable", async ({ request }) => {
    await delay(300);
    const body = await request.json();
    if (!body.chassisNumber) {
      return badRequest("Chassis Number is required.");
    }
    const store = getStore();
    const newQ = { id: Date.now(), ...body };
    store.quotations.push(newQ);
    persistStore();
    return created(newQ, "Quotation created successfully");
  }),

  http.put("/api/QuotationTable/:id", async ({ params, request }) => {
    await delay(300);
    const body = await request.json();
    const store = getStore();
    const index = store.quotations.findIndex(
      (q) => String(q.id) === String(params.id),
    );
    if (index === -1) return notFound("Quotation not found");

    store.quotations[index] = { ...store.quotations[index], ...body };
    persistStore();
    return ok(store.quotations[index], "Quotation updated successfully");
  }),

  http.delete("/api/QuotationTable/:id", async ({ params }) => {
    await delay(250);
    const store = getStore();
    const index = store.quotations.findIndex(
      (q) => String(q.id) === String(params.id),
    );
    if (index === -1) return notFound("Quotation not found");

    const removed = store.quotations.splice(index, 1)[0];
    persistStore();
    return ok(removed, "Quotation deleted successfully");
  }),
];
