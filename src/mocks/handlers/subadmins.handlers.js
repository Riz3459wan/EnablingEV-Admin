import { http } from "msw";
import { getStore, persistStore } from "../store";
import {
  delay,
  ok,
  created,
  notFound,
  badRequest,
  conflict,
  parseSearch,
  filterBySearch,
} from "../utils";

export const subadminsHandlers = [
  http.get("/api/admin/subadmins", async ({ request }) => {
    await delay();
    const store = getStore();
    const url = new URL(request.url);
    const term = parseSearch(url);

    const list = filterBySearch(store.subadmins, term, [
      "fullName",
      "mobileNumber",
      "email",
      "address",
      "city",
      "district",
      "pincode",
      "state",
      "userId",
    ]);

    return ok(list, "Sub-admins fetched successfully");
  }),

  http.get("/api/admin/subadmins/:id", async ({ params }) => {
    await delay(150);
    const store = getStore();
    const sa = store.subadmins.find((s) => String(s.id) === String(params.id));
    if (!sa) return notFound("Sub-admin not found");
    return ok(sa);
  }),

  http.post("/api/admin/subadmins", async ({ request }) => {
    await delay(300);
    const body = await request.json();
    if (!body.userId || !body.fullName) {
      return badRequest("User ID and Full Name are required.");
    }

    const store = getStore();
    if (store.subadmins.some((s) => s.userId === body.userId)) {
      return conflict("User ID already exists.");
    }

    const newSA = { id: Date.now(), ...body };
    store.subadmins.push(newSA);
    persistStore();
    return created(newSA, "Sub-admin created successfully");
  }),

  http.put("/api/admin/subadmins/:id", async ({ params, request }) => {
    await delay(300);
    const body = await request.json();
    const store = getStore();
    const index = store.subadmins.findIndex(
      (s) => String(s.id) === String(params.id),
    );
    if (index === -1) return notFound("Sub-admin not found");

    store.subadmins[index] = { ...store.subadmins[index], ...body };
    persistStore();
    return ok(store.subadmins[index], "Sub-admin updated successfully");
  }),

  http.delete("/api/admin/subadmins/:id", async ({ params }) => {
    await delay(250);
    const store = getStore();
    const index = store.subadmins.findIndex(
      (s) => String(s.id) === String(params.id),
    );
    if (index === -1) return notFound("Sub-admin not found");

    const removed = store.subadmins.splice(index, 1)[0];
    persistStore();
    return ok(removed, "Sub-admin deleted successfully");
  }),
];
