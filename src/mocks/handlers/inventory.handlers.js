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

export const inventoryHandlers = [
  http.get("/api/admin/inventory", async ({ request }) => {
    await delay();
    const store = getStore();
    const url = new URL(request.url);
    const term = parseSearch(url);
    const assemblyStatus = url.searchParams.get("assemblyStatus");
    const modelName = url.searchParams.get("modelName");

    let list = [...store.inventory];
    if (assemblyStatus && assemblyStatus !== "all") {
      list = list.filter((i) => i.assemblyStatus === assemblyStatus);
    }
    if (modelName && modelName !== "all") {
      list = list.filter((i) => i.modelName === modelName);
    }
    list = filterBySearch(list, term, [
      "chassisNumber",
      "modelName",
      "bodyTypeName",
      "colorName",
      "storageLocation",
      "addedBy",
      "batteryType",
    ]);

    return ok(list, "Inventory fetched successfully");
  }),

  http.get("/api/admin/inventory/summary", async () => {
    await delay();
    const store = getStore();
    const items = store.inventory;

    // ── By Type (Rikshaw / Cargo) ──
    const RICKSHAW_MODELS = ["F1", "F2", "F3", "F4", "DELUX", "T1", "FINE"];
    const rikshawItems = items.filter((i) =>
      RICKSHAW_MODELS.includes(i.modelName),
    );
    const cargoItems = items.filter((i) => i.modelName === "LODER");

    const buildBreakdown = (list) => {
      const assembled = list.filter((i) => i.assemblyStatus === "Assembled");
      const unassembled = list.filter(
        (i) => i.assemblyStatus === "Unassembled",
      );

      const buildTab = (source) => {
        const byBodyType = {};
        const byColor = {};
        const byBattery = {};
        const byModel = {};

        source.forEach((i) => {
          byBodyType[i.bodyTypeName] = (byBodyType[i.bodyTypeName] || 0) + 1;
          byColor[i.colorName] = (byColor[i.colorName] || 0) + 1;
          const batt = `${i.batteryVolt}V/${i.batteryAmpereHours}Ah`;
          byBattery[batt] = (byBattery[batt] || 0) + 1;
          byModel[i.modelName] = (byModel[i.modelName] || 0) + 1;
        });

        const toArr = (obj) =>
          Object.entries(obj).map(([name, value]) => ({ name, value }));

        return {
          byBodyType: toArr(byBodyType).sort((a, b) => b.value - a.value),
          byColor: toArr(byColor).sort((a, b) => b.value - a.value),
          byBattery: toArr(byBattery).sort((a, b) => b.value - a.value),
          byModel: toArr(byModel).sort((a, b) => b.value - a.value),
        };
      };

      return {
        assembled: buildTab(assembled),
        unassembled: buildTab(unassembled),
      };
    };

    const byType = [
      {
        key: "erikshaw",
        label: "E-Rickshaw",
        value: rikshawItems.length,
        color: "#3b82f6",
        assembly: {
          assembled: rikshawItems.filter(
            (i) => i.assemblyStatus === "Assembled",
          ).length,
          unassembled: rikshawItems.filter(
            (i) => i.assemblyStatus === "Unassembled",
          ).length,
        },
        breakdown: buildBreakdown(rikshawItems),
      },
      {
        key: "cargo",
        label: "E-Cargo",
        value: cargoItems.length,
        color: "#10b981",
        assembly: {
          assembled: cargoItems.filter((i) => i.assemblyStatus === "Assembled")
            .length,
          unassembled: cargoItems.filter(
            (i) => i.assemblyStatus === "Unassembled",
          ).length,
        },
        breakdown: buildBreakdown(cargoItems),
      },
    ];

    // ── By Status ──
    const statusMap = {};
    const STATUS_COLORS = {
      Unassembled: "#f59e0b",
      Assembled: "#3b82f6",
      "Ready to Dispatch": "#8b5cf6",
      Dispatched: "#10b981",
    };
    items.forEach((i) => {
      statusMap[i.assemblyStatus] = (statusMap[i.assemblyStatus] || 0) + 1;
    });
    const byStatus = Object.entries(statusMap).map(([label, value]) => ({
      label,
      value,
      color: STATUS_COLORS[label] || "#64748b",
    }));

    // ── By Color ──
    const colorMap = {};
    const COLOR_HEX = {
      Blue: "#3b82f6",
      Green: "#10b981",
      White: "#e2e8f0",
      Red: "#ef4444",
      Yellow: "#fbbf24",
    };
    items.forEach((i) => {
      colorMap[i.colorName] = (colorMap[i.colorName] || 0) + 1;
    });
    const byColor = Object.entries(colorMap).map(([label, value]) => ({
      label,
      value,
      hex: COLOR_HEX[label] || "#94a3b8",
    }));

    // ── By Model ──
    const modelMap = {};
    items.forEach((i) => {
      modelMap[i.modelName] = (modelMap[i.modelName] || 0) + 1;
    });
    const MODEL_COLORS = {
      F1: "#3b82f6",
      F2: "#06b6d4",
      F3: "#10b981",
      F4: "#8b5cf6",
      DELUX: "#f59e0b",
      LODER: "#ec4899",
      T1: "#6366f1",
      FINE: "#14b8a6",
    };
    const byModel = Object.entries(modelMap)
      .map(([label, value]) => ({
        label,
        value,
        color: MODEL_COLORS[label] || "#64748b",
      }))
      .sort((a, b) => b.value - a.value);

    // ── By Body Type ──
    const bodyTypeMap = {};
    items.forEach((i) => {
      bodyTypeMap[i.bodyTypeName] = (bodyTypeMap[i.bodyTypeName] || 0) + 1;
    });
    const BODY_COLORS = {
      MS: "#3b82f6",
      SS: "#10b981",
      NR: "#8b5cf6",
      DS: "#f59e0b",
    };
    const byBodyType = Object.entries(bodyTypeMap)
      .map(([label, value]) => ({
        label,
        value,
        color: BODY_COLORS[label] || "#64748b",
      }))
      .sort((a, b) => b.value - a.value);

    return ok({
      total: items.length,
      byType,
      byModel,
      byBodyType,
      byStatus,
      byColor,
    });
  }),

  http.get("/api/admin/inventory/breakdown", async ({ request }) => {
    await delay();
    const store = getStore();
    const url = new URL(request.url);

    const vehicleType = url.searchParams.get("vehicleType") || "rikshaw";
    const assemblyStatus = url.searchParams.get("assemblyStatus") || "";

    const RICKSHAW_MODELS = ["F1", "F2", "F3", "F4", "DELUX", "T1", "FINE"];
    const matchesType = (modelName) => {
      if (vehicleType === "all") return true;
      const isRikshaw = RICKSHAW_MODELS.includes(modelName);
      return vehicleType === "cargo" ? !isRikshaw : isRikshaw;
    };

    const matchesAssembly = (assemblyStatusValue) => {
      if (!assemblyStatus) return true;
      if (assemblyStatus === "assembled") {
        return assemblyStatusValue === "Assembled";
      }
      if (assemblyStatus === "unassembled") {
        return assemblyStatusValue === "Unassembled";
      }
      if (assemblyStatus === "dispatched") {
        return assemblyStatusValue === "Dispatched";
      }
      if (assemblyStatus === "ready") {
        return assemblyStatusValue === "Ready to Dispatch";
      }
      return true;
    };

    const shouldIncludeDispatched =
      !assemblyStatus || assemblyStatus === "dispatched";

    const allVehicles = [];

    // 1. From inventory (factory stock)
    store.inventory.forEach((v) => {
      if (!matchesType(v.modelName)) return;
      if (!matchesAssembly(v.assemblyStatus)) return;
      allVehicles.push({
        id: `inv-${v.id}`,
        chassisNumber: v.chassisNumber,
        modelName: v.modelName,
        bodyTypeName: v.bodyTypeName,
        colorName: v.colorName,
        batteryType: v.batteryType,
        batteryVolt: v.batteryVolt,
        batteryAmpereHours: v.batteryAmpereHours,
        assemblyStatus: v.assemblyStatus,
        dealerName: "—",
        dealerCode: "—",
        storageLocation: v.storageLocation,
        addedOn: v.addedOn,
        addedBy: v.addedBy,
        assembledBy: v.assembledBy,
        assembledOn: v.assembledOn,
        source: "inventory",
      });
    });

    // 2. From dispatches
    if (shouldIncludeDispatched) {
      store.dispatches.forEach((d) => {
        if (!matchesType(d.modelName)) return;
        if (!matchesAssembly("Dispatched")) return;
        allVehicles.push({
          id: `disp-${d.id}`,
          chassisNumber: d.chassisNumber,
          modelName: d.modelName,
          bodyTypeName: d.bodyTypeName,
          colorName: d.colorName,
          batteryType: d.batteryType,
          batteryVolt: d.batteryVolt,
          batteryAmpereHours: d.batteryAmpereHours,
          assemblyStatus: "Dispatched",
          dealerName: d.dealerName,
          dealerCode: d.dealerCode,
          dealerState: d.dealerState,
          dealerDistrict: d.dealerDistrict,
          billNumber: d.billNumber,
          dispatchedOn: d.dispatchedOn,
          source: "dispatch",
        });
      });
    }

    // 3. From deliveries
    if (shouldIncludeDispatched) {
      store.deliveries.forEach((d) => {
        if (!matchesType(d.modelName)) return;
        if (!matchesAssembly("Dispatched")) return;
        allVehicles.push({
          id: `del-${d.id}`,
          chassisNumber: d.chassisNumber,
          modelName: d.modelName,
          bodyTypeName: d.bodyTypeName,
          colorName: d.colorName,
          batteryType: d.batteryType,
          batteryVolt: d.batteryVolt,
          batteryAmpereHours: d.batteryAmpereHours,
          assemblyStatus: "Dispatched",
          dealerName: d.dealerName,
          dealerCode: d.dealerCode,
          dealerState: d.dealerState,
          dealerDistrict: d.dealerDistrict,
          customerName: d.customerName,
          customerMobile: d.customerMobile,
          customerEmail: d.customerEmail,
          customerAddress: d.customerAddress,
          customerDistrict: d.customerDistrict,
          customerState: d.customerState,
          customerPinCode: d.customerPinCode,
          billNumber: d.billNumber,
          deliveredOn: d.deliveredOn,
          warrantyStart: d.warrantyStart,
          warrantyEnd: d.warrantyEnd,
          source: "delivery",
        });
      });
    }

    const seen = new Set();
    const unique = [];
    allVehicles.forEach((v) => {
      if (!seen.has(v.chassisNumber)) {
        seen.add(v.chassisNumber);
        unique.push(v);
      }
    });

    return ok(unique, "Breakdown fetched successfully");
  }),

  http.get("/api/admin/inventory/:id", async ({ params }) => {
    await delay(150);
    const store = getStore();
    const item = store.inventory.find(
      (i) => String(i.id) === String(params.id),
    );
    if (!item) return notFound("Inventory item not found");
    return ok(item);
  }),

  http.post("/api/admin/inventory", async ({ request }) => {
    await delay(300);
    const body = await request.json();
    if (!body.chassisNumber) {
      return badRequest("Chassis Number is required.");
    }
    const store = getStore();
    const newItem = {
      id: Date.now(),
      ...body,
      chassisNumber:
        body.assemblyStatus === "Unassembled" ? null : body.chassisNumber,
      assembledBy:
        body.assemblyStatus === "Unassembled" ? null : body.assembledBy || null,
      assembledOn:
        body.assemblyStatus === "Unassembled" ? null : body.assembledOn || null,
      addedOn: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      addedBy: body.addedBy || { name: "Admin", role: "admin" },
    };
    store.inventory.unshift(newItem);
    persistStore();
    return created(newItem, "Inventory item added successfully");
  }),

  http.put("/api/admin/inventory/:id", async ({ params, request }) => {
    await delay(300);
    const body = await request.json();
    const store = getStore();
    const index = store.inventory.findIndex(
      (i) => String(i.id) === String(params.id),
    );
    if (index === -1) return notFound("Inventory item not found");

    store.inventory[index] = { ...store.inventory[index], ...body };
    persistStore();
    return ok(store.inventory[index], "Inventory updated successfully");
  }),

  http.delete("/api/admin/inventory/:id", async ({ params }) => {
    await delay(250);
    const store = getStore();
    const index = store.inventory.findIndex(
      (i) => String(i.id) === String(params.id),
    );
    if (index === -1) return notFound("Inventory item not found");

    const removed = store.inventory.splice(index, 1)[0];
    persistStore();
    return ok(removed, "Inventory item removed successfully");
  }),
];
