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

export const dealersHandlers = [
  http.get("/api/admin/dealers", async ({ request }) => {
    await delay();
    const store = getStore();
    const url = new URL(request.url);
    const term = parseSearch(url);

    const list = filterBySearch(store.dealers, term, [
      "LOIreferenceId",
      "RQreferenceId",
      "activationCode",
      "dealerCode",
      "name",
      "mobileNo",
      "emailId",
      "gstin",
      "address",
      "state",
      "dist",
      "pinCode",
      "rtoOffice",
    ]);

    return ok(list, "Dealers fetched successfully");
  }),

  http.get("/api/admin/dealers/summary", async () => {
    await delay();
    const store = getStore();
    const list = store.dealers;

    const active = list.filter((d) => !!d.activationCode).length;
    const pending = list.filter((d) => !d.activationCode).length;
    const suspended = 0;

    const byStatus = [
      { label: "Active", value: active, color: "#10b981" },
      { label: "Pending", value: pending, color: "#f59e0b" },
      { label: "Suspended", value: suspended, color: "#ef4444" },
    ];

    const stateMap = {};
    list.forEach((d) => {
      if (d.state) stateMap[d.state] = (stateMap[d.state] || 0) + 1;
    });
    const byState = Object.entries(stateMap)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);

    return ok({
      total: list.length,
      activeTotal: active,
      pendingTotal: pending,
      suspendedTotal: suspended,
      byStatus,
      byState,
    });
  }),

  http.get("/api/admin/dealers/breakdown", async ({ request }) => {
    await delay();
    const store = getStore();
    const url = new URL(request.url);

    const status = url.searchParams.get("status") || "";
    const state = url.searchParams.get("state") || "";
    const district = url.searchParams.get("district") || "";
    const search = url.searchParams.get("search") || "";

    let list = [...store.dealers];

    if (status) {
      if (status === "active") {
        list = list.filter((d) => !!d.activationCode);
      } else if (status === "pending") {
        list = list.filter((d) => !d.activationCode);
      }
    }

    if (state) list = list.filter((d) => d.state === state);
    if (district) list = list.filter((d) => d.dist === district);

    if (search) {
      const term = search.toLowerCase();
      list = list.filter((d) =>
        [
          d.name,
          d.dealerCode,
          d.emailId,
          d.mobileNo,
          d.gstin,
          d.state,
          d.dist,
        ].some((f) => f?.toString().toLowerCase().includes(term)),
      );
    }

    return ok(list, "Dealers breakdown fetched successfully");
  }),

  http.get("/api/dealer/full", async () => {
    await delay();
    const store = getStore();
    return ok(store.dealers);
  }),

  http.get("/api/admin/dealers/:id", async ({ params }) => {
    await delay(150);
    const store = getStore();
    const dealer = store.dealers.find(
      (d) => String(d.id) === String(params.id) || d.dealerCode === params.id,
    );
    if (!dealer) return notFound("Dealer not found");
    return ok(dealer);
  }),

  http.get("/api/admin/dealers/:id/details", async ({ params }) => {
    await delay();
    const store = getStore();
    const dealer = store.dealers.find(
      (d) => String(d.id) === String(params.id) || d.dealerCode === params.id,
    );
    if (!dealer) return notFound("Dealer not found");

    const dealerCode = dealer.dealerCode;
    const quotations = store.quotations.filter(
      (q) => q.dealerCode === dealerCode,
    );
    const customers = store.customers.filter(
      (c) => c.dealerCode === dealerCode,
    );
    const vehicles = store.vehicles.filter((v) => v.dealerCode === dealerCode);

    return ok({ dealer, quotations, customers, vehicles });
  }),

  http.post("/api/admin/dealers", async ({ request }) => {
    await delay(300);
    const body = await request.json();
    if (!body.dealerCode || !body.name) {
      return badRequest("Dealer Code and Name are required.");
    }
    const store = getStore();
    const newDealer = { id: Date.now(), ...body };
    store.dealers.push(newDealer);
    persistStore();
    return created(newDealer, "Dealer created successfully");
  }),

  http.put("/api/admin/dealers/:id", async ({ params, request }) => {
    await delay(300);
    const body = await request.json();
    const store = getStore();
    const index = store.dealers.findIndex(
      (d) => String(d.id) === String(params.id),
    );
    if (index === -1) return notFound("Dealer not found");

    store.dealers[index] = { ...store.dealers[index], ...body };
    persistStore();
    return ok(store.dealers[index], "Dealer updated successfully");
  }),

  http.delete("/api/admin/dealers/:id", async ({ params }) => {
    await delay(250);
    const store = getStore();
    const index = store.dealers.findIndex(
      (d) => String(d.id) === String(params.id),
    );
    if (index === -1) return notFound("Dealer not found");

    const removed = store.dealers.splice(index, 1)[0];
    persistStore();
    return ok(removed, "Dealer deleted successfully");
  }),

  http.get("/api/dealer/pending", async () => {
    await delay();
    const store = getStore();
    return ok(store.dealerRequests);
  }),

  http.post("/api/dealer/approve/:id", async ({ params }) => {
    await delay(400);
    const store = getStore();
    const index = store.dealerRequests.findIndex(
      (r) => String(r.id) === String(params.id),
    );
    if (index === -1) return notFound("Dealer request not found");

    const removed = store.dealerRequests.splice(index, 1)[0];
    persistStore();
    return ok(removed, "Approved — activation code emailed to the dealer.");
  }),

  http.post("/api/dealer/reject/:id", async ({ params, request }) => {
    await delay(400);
    const body = await request.json().catch(() => ({}));
    const store = getStore();
    const index = store.dealerRequests.findIndex(
      (r) => String(r.id) === String(params.id),
    );
    if (index === -1) return notFound("Dealer request not found");

    const removed = store.dealerRequests.splice(index, 1)[0];
    persistStore();
    return ok({ ...removed, reason: body?.reason || "" }, "Request rejected.");
  }),
];
