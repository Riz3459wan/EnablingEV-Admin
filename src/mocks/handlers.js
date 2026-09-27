import { authHandlers } from "./handlers/auth.handlers";
import { dashboardHandlers } from "./handlers/dashboard.handlers";
import { usersHandlers } from "./handlers/users.handlers";
import { subadminsHandlers } from "./handlers/subadmins.handlers";
import { dealersHandlers } from "./handlers/dealers.handlers";
import { customersHandlers } from "./handlers/customers.handlers";
import { vehiclesHandlers } from "./handlers/vehicles.handlers";
import { inventoryHandlers } from "./handlers/inventory.handlers";
import { ordersHandlers } from "./handlers/orders.handlers";
import { quotationsHandlers } from "./handlers/quotations.handlers";
import { dispatchHandlers } from "./handlers/dispatch.handlers";
import { deliveryHandlers } from "./handlers/delivery.handlers";
import { workersHandlers } from "./handlers/workers.handlers";
import { billingHandlers } from "./handlers/billing.handlers";
import { notificationsHandlers } from "./handlers/notifications.handlers";
import { reportsHandlers } from "./handlers/reports.handlers";
import { formsHandlers } from "./handlers/forms.handlers";

export const handlers = [
  ...authHandlers,
  ...dashboardHandlers,
  ...usersHandlers,
  ...subadminsHandlers,
  ...dealersHandlers,
  ...customersHandlers,
  ...vehiclesHandlers,
  ...inventoryHandlers,
  ...ordersHandlers,
  ...quotationsHandlers,
  ...dispatchHandlers,
  ...deliveryHandlers,
  ...workersHandlers,
  ...billingHandlers,
  ...notificationsHandlers,
  ...reportsHandlers,
  ...formsHandlers,
];
