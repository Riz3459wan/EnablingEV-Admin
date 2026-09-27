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

export const customersHandlers = [
  http.get("/api/admin/customers", async ({ request }) => {
    await delay();
    const store = getStore();
    const url = new URL(request.url);
    const term = parseSearch(url);
    const dealerCode = url.searchParams.get("dealerCode");

    let list = [...store.customers];
    if (dealerCode) list = list.filter((c) => c.dealerCode === dealerCode);
    list = filterBySearch(list, term, [
      "chassisNumber",
      "dealerCode",
      "name",
      "mobileNumber",
      "emailId",
      "address",
      "pincode",
      "state",
      "dist",
    ]);

    return ok(list, "Customers fetched successfully");
  }),

  http.get("/api/CustomerTable/admin", async ({ request }) => {
    await delay();
    const store = getStore();
    const url = new URL(request.url);
    const term = parseSearch(url);
    const dealerCode = url.searchParams.get("dealerCode");

    let list = [...store.customers];
    if (dealerCode) list = list.filter((c) => c.dealerCode === dealerCode);
    list = filterBySearch(list, term, [
      "chassisNumber",
      "dealerCode",
      "name",
      "mobileNumber",
      "emailId",
    ]);

    return ok(list);
  }),

  http.get("/api/CustomerTable", async ({ request }) => {
    await delay();
    const store = getStore();
    const url = new URL(request.url);
    const dealerCode = url.searchParams.get("dealerCode");

    let list = [...store.customers];
    if (dealerCode) list = list.filter((c) => c.dealerCode === dealerCode);

    return ok(list);
  }),

  http.get("/api/admin/customers/:id", async ({ params }) => {
    await delay(150);
    const store = getStore();
    const customer = store.customers.find(
      (c) => String(c.id) === String(params.id),
    );
    if (!customer) return notFound("Customer not found");
    return ok(customer);
  }),

  http.post("/api/admin/customers", async ({ request }) => {
    await delay(300);
    const body = await request.json();
    if (!body.chassisNumber || !body.name) {
      return badRequest("Chassis Number and Name are required.");
    }
    const store = getStore();
    const newCustomer = { id: Date.now(), ...body };
    store.customers.push(newCustomer);
    persistStore();
    return created(newCustomer, "Customer created successfully");
  }),

  http.put("/api/admin/customers/:id", async ({ params, request }) => {
    await delay(300);
    const body = await request.json();
    const store = getStore();
    const index = store.customers.findIndex(
      (c) => String(c.id) === String(params.id),
    );
    if (index === -1) return notFound("Customer not found");

    store.customers[index] = { ...store.customers[index], ...body };
    persistStore();
    return ok(store.customers[index], "Customer updated successfully");
  }),

  http.delete("/api/admin/customers/:id", async ({ params }) => {
    await delay(250);
    const store = getStore();
    const index = store.customers.findIndex(
      (c) => String(c.id) === String(params.id),
    );
    if (index === -1) return notFound("Customer not found");

    const removed = store.customers.splice(index, 1)[0];
    persistStore();
    return ok(removed, "Customer deleted successfully");
  }),
];
