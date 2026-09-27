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

export const workersHandlers = [
  http.get("/api/admin/workers", async ({ request }) => {
    await delay();
    const store = getStore();
    const url = new URL(request.url);
    const term = parseSearch(url);

    const list = filterBySearch(store.workers, term, [
      "id",
      "name",
      "department",
      "shift",
    ]);

    return ok(list, "Workers fetched successfully");
  }),

  http.get("/api/admin/workers/:id", async ({ params }) => {
    await delay(150);
    const store = getStore();
    const w = store.workers.find((x) => x.id === params.id);
    if (!w) return notFound("Worker not found");
    return ok(w);
  }),

  http.post("/api/admin/workers", async ({ request }) => {
    await delay(300);
    const body = await request.json();
    if (!body.name) {
      return badRequest("Worker name is required.");
    }
    const store = getStore();
    const newW = { id: body.id || `WRK-${Date.now()}`, ...body };
    store.workers.push(newW);
    persistStore();
    return created(newW, "Worker created successfully");
  }),

  http.put("/api/admin/workers/:id", async ({ params, request }) => {
    await delay(300);
    const body = await request.json();
    const store = getStore();
    const index = store.workers.findIndex((w) => w.id === params.id);
    if (index === -1) return notFound("Worker not found");

    store.workers[index] = { ...store.workers[index], ...body };
    persistStore();
    return ok(store.workers[index], "Worker updated successfully");
  }),

  http.delete("/api/admin/workers/:id", async ({ params }) => {
    await delay(250);
    const store = getStore();
    const index = store.workers.findIndex((w) => w.id === params.id);
    if (index === -1) return notFound("Worker not found");

    const removed = store.workers.splice(index, 1)[0];
    persistStore();
    return ok(removed, "Worker deleted successfully");
  }),
];
