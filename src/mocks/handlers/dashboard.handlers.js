import { http } from "msw";
import { getStore } from "../store";
import { delay, ok } from "../utils";

export const dashboardHandlers = [
  http.get("/api/dashboard", async () => {
    await delay(300);
    const store = getStore();
    return ok(store.dashboard);
  }),

  http.get("/api/dashboard/vehicles", async () => {
    await delay(250);
    const store = getStore();
    return ok(store.dashboard?.vehicles ?? null);
  }),

  http.get("/api/dashboard/dealers", async () => {
    await delay(250);
    const store = getStore();
    return ok(store.dashboard?.dealers ?? null);
  }),

  http.get("/api/dashboard/sales", async () => {
    await delay(250);
    const store = getStore();
    return ok(store.dashboard?.sales ?? null);
  }),
];
