const STORAGE_KEY = "enablingev_mock_store_v1";

const loadStore = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveStore = (store) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // quota exceeded or disabled
  }
};

const store = {
  users: [],
  subadmins: [],
  dealers: [],
  customers: [],
  vehicles: [],
  inventory: [],
  orders: [],
  quotations: [],
  dispatches: [],
  deliveries: [],
  dealerRequests: [],
  notifications: [],
  workers: [],
  billingPersons: [],
  dashboard: null,
};

const persisted = loadStore();
if (persisted && typeof persisted === "object") {
  Object.assign(store, persisted);
}

export const getStore = () => store;

export const persistStore = () => saveStore(store);

export const resetStore = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  // Reset in-memory arrays too
  store.users = [];
  store.subadmins = [];
  store.dealers = [];
  store.customers = [];
  store.vehicles = [];
  store.inventory = [];
  store.orders = [];
  store.quotations = [];
  store.dispatches = [];
  store.deliveries = [];
  store.dealerRequests = [];
  store.notifications = [];
  store.workers = [];
  store.billingPersons = [];
  store.dashboard = null;
};
