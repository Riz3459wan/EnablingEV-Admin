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

export const billingHandlers = [
  http.get("/api/admin/billing-persons", async ({ request }) => {
    await delay();
    const store = getStore();
    const url = new URL(request.url);
    const term = parseSearch(url);

    const list = filterBySearch(store.billingPersons, term, ["id", "name"]);

    return ok(list, "Billing persons fetched successfully");
  }),

  http.get("/api/admin/billing-persons/:id", async ({ params }) => {
    await delay(150);
    const store = getStore();
    const b = store.billingPersons.find((x) => x.id === params.id);
    if (!b) return notFound("Billing person not found");
    return ok(b);
  }),

  http.post("/api/admin/billing-persons", async ({ request }) => {
    await delay(300);
    const body = await request.json();
    if (!body.name) {
      return badRequest("Name is required.");
    }
    const store = getStore();
    const newB = { id: body.id || `bill-${Date.now()}`, ...body };
    store.billingPersons.push(newB);
    persistStore();
    return created(newB, "Billing person created successfully");
  }),

  http.put("/api/admin/billing-persons/:id", async ({ params, request }) => {
    await delay(300);
    const body = await request.json();
    const store = getStore();
    const index = store.billingPersons.findIndex((b) => b.id === params.id);
    if (index === -1) return notFound("Billing person not found");

    store.billingPersons[index] = { ...store.billingPersons[index], ...body };
    persistStore();
    return ok(store.billingPersons[index], "Billing person updated");
  }),

  http.delete("/api/admin/billing-persons/:id", async ({ params }) => {
    await delay(250);
    const store = getStore();
    const index = store.billingPersons.findIndex((b) => b.id === params.id);
    if (index === -1) return notFound("Billing person not found");

    const removed = store.billingPersons.splice(index, 1)[0];
    persistStore();
    return ok(removed, "Billing person deleted successfully");
  }),
];
