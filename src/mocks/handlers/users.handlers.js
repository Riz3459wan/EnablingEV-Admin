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

export const usersHandlers = [
  http.get("/api/admin/users", async ({ request }) => {
    await delay();
    const store = getStore();
    const url = new URL(request.url);
    const term = parseSearch(url);
    const role = url.searchParams.get("role");

    let list = [...store.users];
    if (role && role !== "all") {
      list = list.filter((u) => u.role === role);
    }
    list = filterBySearch(list, term, [
      "fullName",
      "userId",
      "email",
      "mobileNumber",
      "city",
      "state",
    ]);

    return ok(list, "Users fetched successfully");
  }),

  http.get("/api/admin/users/:id", async ({ params }) => {
    await delay(150);
    const store = getStore();
    const user = store.users.find((u) => String(u.id) === String(params.id));
    if (!user) return notFound("User not found");
    return ok(user);
  }),

  http.post("/api/admin/users", async ({ request }) => {
    await delay(300);
    const body = await request.json();
    if (!body.userId || !body.fullName) {
      return badRequest("User ID and Full Name are required.");
    }

    const store = getStore();
    if (store.users.some((u) => u.userId === body.userId)) {
      return conflict("User ID already exists.");
    }

    const newUser = {
      id: Date.now(),
      role: "subadmin",
      ...body,
    };
    store.users.push(newUser);
    persistStore();
    return created(newUser, "User created successfully");
  }),

  http.put("/api/admin/users/:id", async ({ params, request }) => {
    await delay(300);
    const body = await request.json();
    const store = getStore();
    const index = store.users.findIndex(
      (u) => String(u.id) === String(params.id),
    );
    if (index === -1) return notFound("User not found");

    store.users[index] = { ...store.users[index], ...body };
    persistStore();
    return ok(store.users[index], "User updated successfully");
  }),

  http.delete("/api/admin/users/:id", async ({ params }) => {
    await delay(250);
    const store = getStore();
    const index = store.users.findIndex(
      (u) => String(u.id) === String(params.id),
    );
    if (index === -1) return notFound("User not found");
    if (store.users[index].role === "admin") {
      return badRequest("Admin account cannot be deleted.");
    }

    const removed = store.users.splice(index, 1)[0];
    persistStore();
    return ok(removed, "User deleted successfully");
  }),
];
