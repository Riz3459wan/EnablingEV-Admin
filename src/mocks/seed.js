import { getStore, persistStore, resetStore } from "./store";
import {
  MOCK_USERS,
  MOCK_SUBADMINS,
  MOCK_DEALERS,
  MOCK_CUSTOMERS,
  MOCK_VEHICLES,
  MOCK_INVENTORY,
  MOCK_ORDERS,
  MOCK_WORKERS,
  MOCK_BILLING_PERSONS,
  MOCK_DISPATCH,
  MOCK_DELIVERIES,
  MOCK_DEALER_REQUESTS,
  INITIAL_NOTIFICATIONS,
  DASHBOARD_DATA,
  MOCK_QUOTATIONS,
} from "./data";

const SEED_VERSION = "v3";
const SEED_KEY = "enablingev_mock_seed_version";

const getCurrentVersion = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SEED_KEY);
};

const setCurrentVersion = (version) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SEED_KEY, version);
};

export const seedStore = () => {
  const currentVersion = getCurrentVersion();

  // If version mismatch → clear everything and re-seed
  if (currentVersion && currentVersion !== SEED_VERSION) {
    resetStore();
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(SEED_KEY);
    }
  }

  // Already on correct version → skip
  if (currentVersion === SEED_VERSION) return;

  const store = getStore();

  store.users = [...MOCK_USERS];
  store.subadmins = [...MOCK_SUBADMINS];
  store.dealers = [...MOCK_DEALERS];
  store.customers = [...MOCK_CUSTOMERS];
  store.vehicles = [...MOCK_VEHICLES];
  store.inventory = [...MOCK_INVENTORY];
  store.orders = [...MOCK_ORDERS];
  store.workers = [...MOCK_WORKERS];
  store.billingPersons = [...MOCK_BILLING_PERSONS];
  store.dispatches = [...MOCK_DISPATCH];
  store.deliveries = [...MOCK_DELIVERIES];
  store.dealerRequests = [...MOCK_DEALER_REQUESTS];
  store.notifications = [...INITIAL_NOTIFICATIONS];
  store.quotations = [...MOCK_QUOTATIONS];
  store.dashboard = DASHBOARD_DATA;

  persistStore();
  setCurrentVersion(SEED_VERSION);
};
