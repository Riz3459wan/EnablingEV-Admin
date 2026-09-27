import { http } from "msw";
import { getStore, persistStore } from "../store";
import { delay, ok, notFound } from "../utils";

export const notificationsHandlers = [
  http.get("/api/admin/notifications", async () => {
    await delay();
    const store = getStore();
    return ok(store.notifications, "Notifications fetched successfully");
  }),

  http.put("/api/admin/notifications/:id/read", async ({ params }) => {
    await delay(150);
    const store = getStore();
    const index = store.notifications.findIndex(
      (n) => String(n.id) === String(params.id),
    );
    if (index === -1) return notFound("Notification not found");

    store.notifications[index] = {
      ...store.notifications[index],
      read: true,
    };
    persistStore();
    return ok(store.notifications[index], "Notification marked as read");
  }),

  http.put("/api/admin/notifications/read-all", async () => {
    await delay(200);
    const store = getStore();
    store.notifications = store.notifications.map((n) => ({
      ...n,
      read: true,
    }));
    persistStore();
    return ok(store.notifications, "All notifications marked as read");
  }),

  http.delete("/api/admin/notifications/:id", async ({ params }) => {
    await delay(200);
    const store = getStore();
    const index = store.notifications.findIndex(
      (n) => String(n.id) === String(params.id),
    );
    if (index === -1) return notFound("Notification not found");

    const removed = store.notifications.splice(index, 1)[0];
    persistStore();
    return ok(removed, "Notification removed");
  }),

  http.delete("/api/admin/notifications", async () => {
    await delay(200);
    const store = getStore();
    store.notifications = [];
    persistStore();
    return ok([], "All notifications cleared");
  }),
];
