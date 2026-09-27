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

const today = () =>
  new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const ordersHandlers = [
  // ── LIST ──
  http.get("/api/admin/orders", async ({ request }) => {
    await delay();
    const store = getStore();
    const url = new URL(request.url);
    const term = parseSearch(url);
    const status = url.searchParams.get("status");

    let list = [...store.orders];
    if (status && status !== "all") {
      list = list.filter((o) => o.status === status);
    }
    list = filterBySearch(list, term, [
      "orderNumber",
      "chassisNumber",
      "dealerName",
      "dealerCode",
      "modelName",
      "vehicleType",
      "billNumber",
    ]);

    return ok(list, "Orders fetched successfully");
  }),

  // ── QUOTATION TABLE (legacy) ──
  http.get("/api/QuotationTable", async ({ request }) => {
    await delay();
    const store = getStore();
    const url = new URL(request.url);
    const dealerCode = url.searchParams.get("dealerCode");

    let list = [...store.orders];
    if (dealerCode) list = list.filter((o) => o.dealerCode === dealerCode);

    return ok(list);
  }),

  // ── SINGLE ──
  http.get("/api/admin/orders/:id", async ({ params }) => {
    await delay(150);
    const store = getStore();
    const order = store.orders.find((o) => String(o.id) === String(params.id));
    if (!order) return notFound("Order not found");
    return ok(order);
  }),

  // ── CREATE ──
  http.post("/api/admin/orders", async ({ request }) => {
    await delay(300);
    const body = await request.json();
    if (!body.dealerName) {
      return badRequest("Dealer Name is required.");
    }
    const store = getStore();
    const newOrder = {
      id: Date.now(),
      status: "Pending Approval",
      createdOn: today(),
      ...body,
    };
    store.orders.push(newOrder);
    persistStore();
    return created(newOrder, "Order created successfully");
  }),

  // ── UPDATE ──
  http.put("/api/admin/orders/:id", async ({ params, request }) => {
    await delay(300);
    const body = await request.json();
    const store = getStore();
    const index = store.orders.findIndex(
      (o) => String(o.id) === String(params.id),
    );
    if (index === -1) return notFound("Order not found");

    store.orders[index] = { ...store.orders[index], ...body };
    persistStore();
    return ok(store.orders[index], "Order updated successfully");
  }),

  // ── DELETE ──
  http.delete("/api/admin/orders/:id", async ({ params }) => {
    await delay(250);
    const store = getStore();
    const index = store.orders.findIndex(
      (o) => String(o.id) === String(params.id),
    );
    if (index === -1) return notFound("Order not found");

    const removed = store.orders.splice(index, 1)[0];
    persistStore();
    return ok(removed, "Order deleted successfully");
  }),

  // ═══════════════════════════════════════════════
  //  ADMIN WORKFLOW ACTIONS (client flow)
  // ═══════════════════════════════════════════════

  // ── APPROVE ──
  http.put("/api/admin/orders/:id/approve", async ({ params }) => {
    await delay(300);
    const store = getStore();
    const index = store.orders.findIndex(
      (o) => String(o.id) === String(params.id),
    );
    if (index === -1) return notFound("Order not found");

    store.orders[index] = {
      ...store.orders[index],
      status: "Approved",
      approvedBy: "Admin",
      approvedOn: today(),
    };
    persistStore();
    return ok(store.orders[index], "Order approved successfully");
  }),

  // ── REJECT ──
  http.put("/api/admin/orders/:id/reject", async ({ params, request }) => {
    await delay(300);
    const body = await request.json();
    const store = getStore();
    const index = store.orders.findIndex(
      (o) => String(o.id) === String(params.id),
    );
    if (index === -1) return notFound("Order not found");

    store.orders[index] = {
      ...store.orders[index],
      status: "Rejected",
      approvedBy: "Admin",
      approvedOn: today(),
      rejectionReason: body?.reason || "No reason provided",
    };
    persistStore();
    return ok(store.orders[index], "Order rejected");
  }),

  // ── MOVE TO BILLING ──
  http.put("/api/admin/orders/:id/move-to-billing", async ({ params }) => {
    await delay(300);
    const store = getStore();
    const index = store.orders.findIndex(
      (o) => String(o.id) === String(params.id),
    );
    if (index === -1) return notFound("Order not found");

    store.orders[index] = {
      ...store.orders[index],
      status: "Billing in Progress",
    };
    persistStore();
    return ok(store.orders[index], "Order moved to billing");
  }),

  // ── MARK BILLED ──
  http.put("/api/admin/orders/:id/bill", async ({ params, request }) => {
    await delay(300);
    const body = await request.json();
    const store = getStore();
    const index = store.orders.findIndex(
      (o) => String(o.id) === String(params.id),
    );
    if (index === -1) return notFound("Order not found");

    store.orders[index] = {
      ...store.orders[index],
      status: "Billed",
      billNumber: body.billNumber,
      billedOn: today(),
    };
    persistStore();
    return ok(store.orders[index], "Bill generated successfully");
  }),

  // ── MOVE TO DISPATCH ──
  http.put("/api/admin/orders/:id/move-to-dispatch", async ({ params }) => {
    await delay(300);
    const store = getStore();
    const index = store.orders.findIndex(
      (o) => String(o.id) === String(params.id),
    );
    if (index === -1) return notFound("Order not found");

    store.orders[index] = {
      ...store.orders[index],
      status: "Ready to Dispatch",
    };
    persistStore();
    return ok(store.orders[index], "Order moved to dispatch");
  }),

  // ── DISPATCH ──
  http.put("/api/admin/orders/:id/dispatch", async ({ params, request }) => {
    await delay(300);
    const body = await request.json();
    const store = getStore();
    const index = store.orders.findIndex(
      (o) => String(o.id) === String(params.id),
    );
    if (index === -1) return notFound("Order not found");

    store.orders[index] = {
      ...store.orders[index],
      status: "Dispatched",
      dispatchMode: body.dispatchMode,
      transportDetails: body.transportDetails || null,
      dispatchedOn: today(),
    };
    persistStore();
    return ok(store.orders[index], "Order dispatched successfully");
  }),

  // ── DELIVER ──
  http.put("/api/admin/orders/:id/deliver", async ({ params }) => {
    await delay(300);
    const store = getStore();
    const index = store.orders.findIndex(
      (o) => String(o.id) === String(params.id),
    );
    if (index === -1) return notFound("Order not found");

    store.orders[index] = {
      ...store.orders[index],
      status: "Delivered",
      deliveredOn: today(),
    };
    persistStore();
    return ok(store.orders[index], "Order marked as delivered");
  }),
];
