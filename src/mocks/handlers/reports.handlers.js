import { http } from "msw";
import { getStore } from "../store";
import { delay, ok } from "../utils";

export const reportsHandlers = [
  http.get("/api/admin/reports/vehicles", async () => {
    await delay(300);
    const store = getStore();
    return ok({
      quotations: store.quotations,
      vehicles: store.vehicles,
    });
  }),

  http.get("/api/admin/reports/customers", async () => {
    await delay(300);
    const store = getStore();
    return ok(store.customers);
  }),

  http.get("/api/admin/reports/dealers", async () => {
    await delay(300);
    const store = getStore();
    return ok({
      dealers: store.dealers,
      quotations: store.quotations,
    });
  }),
];
